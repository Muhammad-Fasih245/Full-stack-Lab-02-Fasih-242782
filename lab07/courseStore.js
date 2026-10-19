'use strict';

const fs = require('fs/promises');
const path = require('path');

const coursesPath = path.join(__dirname, 'data', 'courses.json');

async function readAll() {
  const content = await fs.readFile(coursesPath, 'utf8');
  const courses = JSON.parse(content);
  if (!Array.isArray(courses)) throw new Error('courses.json must contain a JSON array.');
  return courses;
}

async function writeAll(courses) {
  await fs.mkdir(path.dirname(coursesPath), { recursive: true });
  await fs.writeFile(coursesPath, `${JSON.stringify(courses, null, 2)}\n`, 'utf8');
}

module.exports = { readAll, writeAll };
