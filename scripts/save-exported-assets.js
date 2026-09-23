const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Please provide path to json file containing base64 assets');
  process.exit(1);
}

const raw = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(raw);
const assets = data.result || data;

for (const [filePath, base64Data] of Object.entries(assets)) {
  const fullPath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  fs.writeFileSync(fullPath, Buffer.from(cleanBase64, 'base64'));
  console.log(`Saved ${fullPath} (${fs.statSync(fullPath).size} bytes)`);
}
