const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/favicon.svg'));
  
  // Generate PNG files first
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map(size =>
      sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  // Generate favicon.ico
  await sharp(pngBuffers[0])
    .toFile(path.join(__dirname, '../public/favicon.ico'));

  // Generate apple-icon.png
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/apple-icon.png'));

  console.log('Generated favicon files');
}

generateFavicons().catch(console.error); 