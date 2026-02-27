const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputFile = process.argv[3] || 'output.json';

if (!inputFile) {
  console.error('Usage: node remove-newlines.js input.json [output.json]');
  process.exit(1);
}

try {
  const filePath = path.resolve(inputFile);
  const raw = fs.readFileSync(filePath, 'utf8').trim();

  // Удаляем лишние переносы строк
  const lines = raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  let result;

  // Если уже массив — просто сжимаем
  if (raw.startsWith('[')) {
    const parsed = JSON.parse(raw);
    result = JSON.stringify(parsed);
  } else {
    // NDJSON → превращаем в массив
    const objects = lines.map(line => JSON.parse(line));
    result = JSON.stringify(objects);
  }

  fs.writeFileSync(outputFile, result, 'utf8');

  console.log('File converted successfully.');
  console.log('Ready for: mongoimport --jsonArray');
  console.log(`Saved to: ${outputFile}`);

} catch (err) {
  console.error('Error processing file:', err.message);
}