// Generate PWA icons as simple SVG-based PNGs
// Run: node scripts/generate-icons.js
const fs = require("fs");
const path = require("path");

function createSVG(size) {
  const pad = Math.round(size * 0.15);
  const iconSize = size - pad * 2;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const dollarSize = Math.round(iconSize * 0.55);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#6366f1"/>
  <text x="${cx}" y="${cy}" font-family="Arial,sans-serif" font-size="${dollarSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">$</text>
</svg>`;
}

const sizes = [192, 512];
const outDir = path.join(__dirname, "..", "public", "icons");

for (const size of sizes) {
  const svg = createSVG(size);
  fs.writeFileSync(path.join(outDir, `icon-${size}.svg`), svg);
  console.log(`Created icon-${size}.svg`);
}

// Also create a simple HTML to convert (for now, SVG works as fallback)
// For production, convert SVGs to PNGs using sharp or an online tool
console.log("\nNote: For best PWA support, convert SVGs to PNGs.");
console.log("You can use: https://svgtopng.com or sharp library");
