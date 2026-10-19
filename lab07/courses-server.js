'use strict';

const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { readAll, writeAll } = require('./courseStore');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const logsDir = path.join(__dirname, 'logs');
const logPath = path.join(logsDir, 'requests.log');
const departments = ['Computer Science', 'Software Engineering', 'Data Science'];

app.use(async (req, res, next) => {
  const startedAt = new Date().toISOString();
  res.on('finish', () => {
    fs.mkdir(logsDir, { recursive: true })
      .then(() => fs.appendFile(logPath, `${startedAt} ${req.method} ${req.originalUrl} ${res.statusCode}\n`, 'utf8'))
      .catch((error) => console.error(`Request log error: ${error.message}`));
  });
  next();
});

app.use(express.json());

function validateCourse(course) {
  const errors = [];
  if (typeof course.code !== 'string' || !/^CS-\d{3}L?$/.test(course.code)) errors.push('code must look like CS-301 or CS-301L');
  if (typeof course.title !== 'string' || course.title.trim().length < 3) errors.push('title must be at least 3 characters');
  if (!Number.isInteger(course.creditHours) || course.creditHours < 1 || course.creditHours > 4) errors.push('creditHours must be a whole number from 1 to 4');
  if (typeof course.instructor !== 'string' || course.instructor.trim().length < 3) errors.push('instructor must be at least 3 characters');
  if (typeof course.department !== 'string' || !departments.includes(course.department)) errors.push(`department must be one of: ${departments.join(', ')}`);
  return errors;
}

function isObjectBody(body) {
  return body !== null && typeof body === 'object' && !Array.isArray(body);
}

app.get('/api/courses', async (req, res, next) => {
  try {
    let courses = await readAll();
    if (req.query.department) {
      const department = String(req.query.department).toLowerCase();
      courses = courses.filter((course) => course.department.toLowerCase() === department);
    }
    if (req.query.search) {
      const search = String(req.query.search).toLowerCase();
      courses = courses.filter((course) => course.title.toLowerCase().includes(search) || course.code.toLowerCase().includes(search));
    }
    if (req.query.sort === 'creditHours') {
      const direction = req.query.order === 'desc' ? -1 : 1;
      courses.sort((a, b) => (a.creditHours - b.creditHours) * direction);
    }
    res.json(courses);
  } catch (error) { next(error); }
});

app.get('/api/courses/stats', async (req, res, next) => {
  try {
    const courses = await readAll();
    const totalCreditHours = courses.reduce((sum, course) => sum + course.creditHours, 0);
    const most = courses.reduce((best, course) => !best || course.creditHours > best.creditHours ? course : best, null);
    res.json({
      totalCourses: courses.length,
      totalCreditHours,
      averageCreditHours: courses.length ? Number((totalCreditHours / courses.length).toFixed(2)) : 0,
      mostCredits: most ? { code: most.code, title: most.title } : null,
    });
  } catch (error) { next(error); }
});

app.get('/api/courses/:code', async (req, res, next) => {
  try {
    const course = (await readAll()).find((item) => item.code.toLowerCase() === req.params.code.toLowerCase());
    if (!course) return res.status(404).json({ error: `Course ${req.params.code} not found` });
    res.json(course);
  } catch (error) { next(error); }
});

app.post('/api/courses', async (req, res, next) => {
  try {
    if (!isObjectBody(req.body)) return res.status(400).json({ error: 'Validation failed', details: ['body must be a JSON object'] });
    const errors = validateCourse(req.body);
    if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });
    const courses = await readAll();
    if (courses.some((course) => course.code.toLowerCase() === req.body.code.toLowerCase())) {
      return res.status(409).json({ error: `Course ${req.body.code} already exists` });
    }
    const created = {
      code: req.body.code.trim(), title: req.body.title.trim(), creditHours: req.body.creditHours,
      instructor: req.body.instructor.trim(), department: req.body.department,
    };
    courses.push(created);
    await writeAll(courses);
    res.location(`/api/courses/${encodeURIComponent(created.code)}`).status(201).json(created);
  } catch (error) { next(error); }
});

app.put('/api/courses/:code', async (req, res, next) => {
  try {
    if (!isObjectBody(req.body)) return res.status(400).json({ error: 'Validation failed', details: ['body must be a JSON object'] });
    const errors = validateCourse(req.body);
    if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });
    const courses = await readAll();
    const index = courses.findIndex((course) => course.code.toLowerCase() === req.params.code.toLowerCase());
    if (index === -1) return res.status(404).json({ error: `Course ${req.params.code} not found` });
    if (courses.some((course, i) => i !== index && course.code.toLowerCase() === req.body.code.toLowerCase())) {
      return res.status(409).json({ error: `Course ${req.body.code} already exists` });
    }
    courses[index] = { code: req.body.code.trim(), title: req.body.title.trim(), creditHours: req.body.creditHours, instructor: req.body.instructor.trim(), department: req.body.department };
    await writeAll(courses);
    res.json(courses[index]);
  } catch (error) { next(error); }
});

app.patch('/api/courses/:code', async (req, res, next) => {
  try {
    if (!isObjectBody(req.body)) return res.status(400).json({ error: 'Validation failed', details: ['body must be a JSON object'] });
    const courses = await readAll();
    const index = courses.findIndex((course) => course.code.toLowerCase() === req.params.code.toLowerCase());
    if (index === -1) return res.status(404).json({ error: `Course ${req.params.code} not found` });
    const updated = { ...courses[index], ...req.body };
    const errors = validateCourse(updated);
    if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });
    if (courses.some((course, i) => i !== index && course.code.toLowerCase() === updated.code.toLowerCase())) {
      return res.status(409).json({ error: `Course ${updated.code} already exists` });
    }
    courses[index] = { code: updated.code.trim(), title: updated.title.trim(), creditHours: updated.creditHours, instructor: updated.instructor.trim(), department: updated.department };
    await writeAll(courses);
    res.json(courses[index]);
  } catch (error) { next(error); }
});

app.delete('/api/courses/:code', async (req, res, next) => {
  try {
    const courses = await readAll();
    const index = courses.findIndex((course) => course.code.toLowerCase() === req.params.code.toLowerCase());
    if (index === -1) return res.status(404).json({ error: `Course ${req.params.code} not found` });
    courses.splice(index, 1);
    await writeAll(courses);
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Courses API running at http://localhost:${PORT}`));
