const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '.next/server/app/school/experience/demo/page.js');
if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /["']?8780["']?\s*:/;
  const match = content.match(regex);
  if (match) {
    const startIdx = match.index;
    console.log('Found 8780 at index', startIdx);
    console.log(content.slice(startIdx - 100, startIdx + 2000));
  } else {
    console.log('No regex match for 8780:');
    let lastIdx = 0;
    let count = 0;
    while (true) {
      const idx = content.indexOf('8780', lastIdx);
      if (idx === -1) break;
      if (count++ < 10) {
        console.log(`Occurrence at index ${idx}:`);
        console.log(content.slice(idx - 50, idx + 150));
      }
      lastIdx = idx + 4;
    }
  }
} else {
  console.log('File not found');
}
