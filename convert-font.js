// Convert TTF to Three.js typeface JSON format
// Usage: node convert-font.js input.ttf output.json

const opentype = require('opentype.js');
const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.error('Usage: node convert-font.js input.ttf output.json');
  process.exit(1);
}

const font = opentype.loadSync(inputFile);
const scale = 1000 / font.unitsPerEm;

const result = {
  glyphs: {},
  familyName: font.names.fontFamily?.en || 'Unknown',
  ascender: Math.round(font.ascender * scale),
  descender: Math.round(font.descender * scale),
  underlinePosition: Math.round((font.tables.post?.underlinePosition || -100) * scale),
  underlineThickness: Math.round((font.tables.post?.underlineThickness || 50) * scale),
  boundingBox: {
    xMin: Math.round((font.tables.head?.xMin || 0) * scale),
    yMin: Math.round((font.tables.head?.yMin || 0) * scale),
    xMax: Math.round((font.tables.head?.xMax || 0) * scale),
    yMax: Math.round((font.tables.head?.yMax || 0) * scale),
  },
  resolution: 1000,
  original_font_information: font.names,
};

// Only convert chars we need: A-Z, 0-9, space, common punctuation
const chars = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?-:\'"/()';

for (const char of chars) {
  const glyph = font.charToGlyph(char);
  if (!glyph || glyph.index === 0 && char !== ' ') continue;

  const glyphData = {
    x_min: Math.round((glyph.xMin || 0) * scale),
    x_max: Math.round((glyph.xMax || 0) * scale),
    ha: Math.round(glyph.advanceWidth * scale),
    o: '',
  };

  // Convert glyph path to typeface format
  const cmds = glyph.path.commands;
  for (const cmd of cmds) {
    switch (cmd.type) {
      case 'M':
        glyphData.o += `m ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)} `;
        break;
      case 'L':
        glyphData.o += `l ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)} `;
        break;
      case 'Q':
        glyphData.o += `q ${Math.round(cmd.x1 * scale)} ${Math.round(cmd.y1 * scale)} ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)} `;
        break;
      case 'C':
        glyphData.o += `b ${Math.round(cmd.x1 * scale)} ${Math.round(cmd.y1 * scale)} ${Math.round(cmd.x2 * scale)} ${Math.round(cmd.y2 * scale)} ${Math.round(cmd.x * scale)} ${Math.round(cmd.y * scale)} `;
        break;
      case 'Z':
        break;
    }
  }

  result.glyphs[char] = glyphData;
}

fs.writeFileSync(outputFile, JSON.stringify(result));
console.log(`Converted ${Object.keys(result.glyphs).length} glyphs to ${outputFile}`);
