#!/usr/bin/env node
// scripts/ocr.js
// Node.js wrapper for tesseract-ocr CLI. Outputs { text, boxes } as JSON to stdout.

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: node scripts/ocr.js <imagePath>');
  process.exit(1);
}

const imagePath = process.argv[2];
if (!imagePath) usage();

// Tesseract output as TSV for bounding boxes
const tsvPath = path.join(__dirname, '../tmp/ocr-out.tsv');

execFile('tesseract', [imagePath, 'stdout', '--psm', '3'], (err, stdout) => {
  if (err) {
    console.error('Tesseract error:', err.message);
    process.exit(2);
  }
  // Run again for boxes
  execFile('tesseract', [imagePath, tsvPath.replace(/\.tsv$/, ''), '--psm', '3', 'tsv'], (err2) => {
    let boxes = [];
    if (!err2 && fs.existsSync(tsvPath)) {
      const lines = fs.readFileSync(tsvPath, 'utf8').split('\n').slice(1); // skip header
      for (const line of lines) {
        const cols = line.split('\t');
        if (cols.length > 11 && cols[11].trim()) {
          boxes.push({
            text: cols[11],
            x0: Number(cols[6]),
            y0: Number(cols[7]),
            x1: Number(cols[6]) + Number(cols[8]),
            y1: Number(cols[7]) + Number(cols[9])
          });
        }
      }
      fs.unlinkSync(tsvPath);
    }
    process.stdout.write(JSON.stringify({ text: stdout.trim(), boxes }));
  });
});
