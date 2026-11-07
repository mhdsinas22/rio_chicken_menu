const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const mainJs = fs.readFileSync(path.join(projectRoot, 'src/main.js'), 'utf8');

// Extract all getElementById('...') calls in src/main.js and ensure every ID exists in index.html
const idRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const checkedIds = [];
while ((match = idRegex.exec(mainJs)) !== null) {
  const id = match[1];
  checkedIds.push(id);
  assert.ok(
    html.includes(`id="${id}"`),
    `Missing element with id="${id}" in index.html`
  );
}

console.log(`✅ Verified all ${checkedIds.length} DOM element IDs referenced in src/main.js exist in index.html.`);

