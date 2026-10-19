'use strict';

const fs = require('fs/promises');
const path = require('path');
const { getStatus } = require('./utils/gradeUtils');

const dataPath = path.join(__dirname, 'data', 'students.json');
const reportsDir = path.join(__dirname, 'reports');
const activityPath = path.join(reportsDir, 'activity.log');

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function log(message) {
  await fs.mkdir(reportsDir, { recursive: true });
  await fs.appendFile(activityPath, `${new Date().toISOString()} | ${message}\n`, 'utf8');
}

async function main() {
  let processedCount = 0;
  let filter = null;
  try {
    const args = process.argv.slice(2);
    if (args.length) {
      if (args.length !== 2 || args[0] !== '--dept' || !args[1].trim()) {
        throw new Error('Usage: node task2.js [--dept "Department"]');
      }
      filter = args[1].trim();
    }

    const raw = await fs.readFile(dataPath, 'utf8');
    const students = JSON.parse(raw);
    if (!Array.isArray(students)) throw new Error('students.json must contain a JSON array.');
    const selected = filter
      ? students.filter((student) => String(student.department || '').toLowerCase() === filter.toLowerCase())
      : students;
    processedCount = selected.length;

    await fs.mkdir(reportsDir, { recursive: true });
    const generated = new Date();
    const highest = selected.reduce((best, student) => !best || Number(student.cgpa) > Number(best.cgpa) ? student : best, null);
    const average = selected.length
      ? selected.reduce((sum, student) => sum + Number(student.cgpa), 0) / selected.length
      : 0;
    const lines = [
      'STUDENT REPORT',
      `Generated: ${generated.toISOString().slice(0, 16).replace('T', ' ')}`,
      '==============================================',
      ...selected.map((s) => `${s.name} | ${s.rollNumber} | ${s.department} | ${Number(s.cgpa).toFixed(2)} | ${getStatus(Number(s.cgpa))}`),
      '==============================================',
      `Total Students: ${selected.length}`,
      `Average CGPA: ${average.toFixed(2)}`,
      `Highest CGPA: ${highest ? `${Number(highest.cgpa).toFixed(2)} (${highest.name})` : 'N/A'}`,
      `Academic Warning: ${selected.filter((s) => getStatus(Number(s.cgpa)) === 'Academic Warning').length}`,
      '',
    ];
    await fs.writeFile(path.join(reportsDir, 'report.txt'), lines.join('\n'), 'utf8');

    const csvRows = [
      ['name', 'rollNumber', 'department', 'semester', 'cgpa'],
      ...selected.map((s) => [s.name, s.rollNumber, s.department, s.semester, s.cgpa]),
    ];
    await fs.writeFile(path.join(reportsDir, 'students.csv'), csvRows.map((row) => row.map(csvCell).join(',')).join('\n') + '\n', 'utf8');
    await log(`processed ${selected.length} students${filter ? ` (${filter})` : ''}`);
    console.log(`Read ${selected.length} students.`);
    console.log('Created reports/report.txt');
    console.log('Created reports/students.csv');
    console.log('Logged run in reports/activity.log');
  } catch (error) {
    const message = error.code === 'ENOENT' && error.path === dataPath
      ? 'students.json not found.'
      : error instanceof SyntaxError
        ? 'students.json contains invalid JSON.'
        : error.message || 'an unexpected error occurred.';
    console.error(`Error: ${message}`);
    try {
      await log(`ERROR: ${message}`);
    } catch (logError) {
      console.error(`Could not append to reports/activity.log: ${logError.message}`);
    }
    process.exitCode = 1;
  }
}

main();
