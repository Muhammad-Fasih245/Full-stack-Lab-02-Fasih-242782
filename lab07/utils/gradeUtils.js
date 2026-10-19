'use strict';

// The Lab 06 CGPA table was not attached. These thresholds match the Lab 07
// examples (2.45 => Satisfactory; 3.45 and 3.80 => Excellent). Adjust here if
// your instructor's Lab 06 table uses different bands.
function getStatus(cgpa) {
  return cgpa < 2.0 ? 'Academic Warning'
    : cgpa < 2.5 ? 'Satisfactory'
      : cgpa < 3.0 ? 'Good'
        : 'Excellent';
}

function letterGrade(marks) {
  if (marks >= 85) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 55) return 'C';
  if (marks >= 40) return 'D';
  return 'F';
}

function calculateGPA(courses) {
  if (!Array.isArray(courses) || courses.length === 0) {
    throw new TypeError('courses must be a non-empty array');
  }
  const totals = courses.reduce((acc, course) => {
    const points = Number(course?.points);
    const credits = Number(course?.credits);
    if (!Number.isFinite(points) || !Number.isFinite(credits) || credits <= 0) {
      throw new TypeError('Each course must have numeric points and positive credits');
    }
    acc.weightedPoints += points * credits;
    acc.credits += credits;
    return acc;
  }, { weightedPoints: 0, credits: 0 });
  return totals.weightedPoints / totals.credits;
}

module.exports = { getStatus, letterGrade, calculateGPA };
