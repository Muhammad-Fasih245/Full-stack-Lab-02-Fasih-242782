'use strict';

function capitalizeWords(text) {
  return String(text).trim().toLowerCase().replace(/\b[\p{L}\p{N}]/gu, (letter) => letter.toUpperCase());
}

function slugify(text) {
  return String(text).trim().toLowerCase().replace(/\s+/g, '-');
}

function countWords(text) {
  const trimmed = String(text).trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

module.exports = { capitalizeWords, slugify, countWords };
