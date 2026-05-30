const fs = require('fs');

const mockDataPath = 'src/services/mockData.ts';
let mockData = fs.readFileSync(mockDataPath, 'utf8');

const generatedTemples = require('./generated_up_temples.json');

const endRegex = /\n\];/;
const match = mockData.match(endRegex);

if (match) {
  const insertIndex = match.index;
  const jsonString = JSON.stringify(generatedTemples, null, 2);
  const contentToInsert = ',\n' + jsonString.substring(2, jsonString.length - 2);
  
  const newMockData = mockData.slice(0, insertIndex) + contentToInsert + mockData.slice(insertIndex);
  fs.writeFileSync(mockDataPath, newMockData);
  console.log('Successfully appended UP temples to mockData.ts!');
} else {
  console.error('Could not find the end of MOCK_TEMPLES array.');
}
