const fs = require('fs');

const fileContent = fs.readFileSync('src/services/mockData.ts', 'utf8');

// Find all id strings using regex
const idRegex = /id:\s*"([^"]+)"/g;
let match;
const ids = [];
const duplicates = [];
const idCounts = {};

while ((match = idRegex.exec(fileContent)) !== null) {
  const id = match[1];
  if (idCounts[id]) {
    idCounts[id]++;
    if (idCounts[id] === 2) {
      duplicates.push(id);
    }
  } else {
    idCounts[id] = 1;
  }
}

if (duplicates.length > 0) {
  console.log('Duplicates found:', duplicates);
} else {
  console.log('No duplicates found!');
}
