import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [64, 192, 512];
const inputFile = join(__dirname, 'logo', 'wellspring-logo.png');
const publicDir = join(__dirname, 'public');

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  for (const size of sizes) {
    const outputFile = join(publicDir, `pwa-${size}x${size}.png`);
    
    await sharp(inputFile)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 245, g: 245, b: 220, alpha: 1 } // Sage background
      })
      .png()
      .toFile(outputFile);
    
    console.log(`✅ Generated ${size}x${size} icon`);
  }

  // Generate maskable icon (needs padding)
  const maskableOutput = join(publicDir, 'maskable-icon-512x512.png');
  await sharp(inputFile)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 134, g: 167, b: 137, alpha: 1 } // Theme color
    })
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 134, g: 167, b: 137, alpha: 1 }
    })
    .png()
    .toFile(maskableOutput);
  
  console.log('✅ Generated maskable icon');

  // Copy logo as favicon and apple-touch-icon
  await sharp(inputFile)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 245, g: 245, b: 220, alpha: 1 }
    })
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  
  console.log('✅ Generated apple-touch-icon');

  await sharp(inputFile)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 245, g: 245, b: 220, alpha: 1 }
    })
    .png()
    .toFile(join(publicDir, 'favicon.ico'));
  
  console.log('✅ Generated favicon');

  // Copy original logo
  fs.copyFileSync(inputFile, join(publicDir, 'wellspring-logo.png'));
  console.log('✅ Copied wellspring-logo.png');

  console.log('\n🎉 All PWA icons generated successfully!\n');
}

generateIcons().catch(console.error);
