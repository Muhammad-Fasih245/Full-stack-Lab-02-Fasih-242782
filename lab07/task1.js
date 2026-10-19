'use strict';

const os = require('os');
const { capitalizeWords, slugify, countWords } = require('./utils/stringUtils');
const { getStatus, letterGrade, calculateGPA } = require('./utils/gradeUtils');

const usage = [
  'Usage: node task1.js <command> <value>',
  'Commands: slug, capitalize, words, status, grade, gpa, info',
].join('\n');

function fail(message) {
  console.error(`Error: ${message}`);
  console.error(usage);
  process.exitCode = 1;
}

function main(args) {
  const [command, ...values] = args;
  if (!command) return fail('command is required.');

  switch (command) {
    case 'slug':
    case 'capitalize':
    case 'words': {
      const text = values.join(' ');
      if (!text.trim()) return fail('text is required.');
      if (command === 'slug') console.log(slugify(text));
      if (command === 'capitalize') console.log(capitalizeWords(text));
      if (command === 'words') console.log(`Word count: ${countWords(text)}`);
      break;
    }
    case 'status': {
      const cgpa = Number(values[0]);
      if (values.length !== 1 || !Number.isFinite(cgpa) || cgpa < 0 || cgpa > 4) {
        return fail('CGPA must be a number between 0 and 4.');
      }
      console.log(`CGPA ${cgpa} -> ${getStatus(cgpa)}`);
      break;
    }
    case 'grade': {
      const marks = Number(values[0]);
      if (values.length !== 1 || !Number.isFinite(marks) || marks < 0 || marks > 100) {
        return fail('marks must be a number between 0 and 100.');
      }
      console.log(`Marks ${marks} -> Grade ${letterGrade(marks)}`);
      break;
    }
    case 'gpa': {
      if (values.length === 0) return fail('provide at least one points:credits pair.');
      let courses;
      try {
        courses = values.map((pair) => {
          const match = pair.match(/^(-?(?:\d+\.?\d*|\.\d+)):([1-9]\d*)$/);
          if (!match) throw new Error(`invalid GPA pair: ${pair}`);
          return { points: Number(match[1]), credits: Number(match[2]) };
        });
        if (courses.some(({ points }) => points < 0 || points > 4)) {
          throw new Error('points must be between 0 and 4.');
        }
        const credits = courses.reduce((sum, course) => sum + course.credits, 0);
        console.log(`Credit hours: ${credits}`);
        console.log(`GPA: ${calculateGPA(courses).toFixed(2)}`);
      } catch (error) {
        return fail(error.message);
      }
      break;
    }
    case 'info':
      if (values.length) return fail('info does not take a value.');
      console.log(`Platform: ${os.platform()} | CPU cores: ${os.cpus().length} | Free memory: ${Math.round(os.freemem() / (1024 ** 2))} MB`);
      break;
    default:
      return fail(`unknown command: ${command}`);
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  fail(error.message || 'unexpected input.');
}
