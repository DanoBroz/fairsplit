import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const svgPath = join(publicDir, 'icon.svg')
const svg = readFileSync(svgPath)

const sizes = [192, 512]

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(join(publicDir, `icon-${size}.png`))

  console.log(`Generated icon-${size}.png`)
}

console.log('Done!')
