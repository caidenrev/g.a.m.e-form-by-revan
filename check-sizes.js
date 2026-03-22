const fs = require('fs');
const path = require('path');

function getPngDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer.length < 24) return 'File too small';
    
    // Check PNG signature
    const signature = buffer.slice(0, 8).toString('hex');
    if (signature !== '89504e470d0a1a0a') return 'Not a PNG';
    
    // Read IHDR chunk width and height
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return `${width}x${height}`;
  } catch (err) {
    return err.message;
  }
}

const dir = path.join(__dirname, 'public', 'game-assets', 'sprites');
console.log('Background:', getPngDimensions(path.join(dir, 'background-day.png')));
console.log('Base:', getPngDimensions(path.join(dir, 'base.png')));
console.log('Dino:', getPngDimensions(path.join(dir, 'dino.png')));
