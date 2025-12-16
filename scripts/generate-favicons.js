import sharp from 'sharp'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const publicDir = join(rootDir, 'public')
const imagesDir = join(publicDir, 'images')
const sourceImage = join(imagesDir, 'honda.png')

// Các kích thước favicon chuẩn
const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
]

async function generateFavicons() {
  try {
    // Kiểm tra file nguồn có tồn tại không
    if (!existsSync(sourceImage)) {
      console.error(`File nguồn không tồn tại: ${sourceImage}`)
      process.exit(1)
    }

    console.log('Đang tạo favicon từ:', sourceImage)

    // Đọc ảnh gốc
    const image = sharp(sourceImage)

    // Tạo các favicon với các kích thước khác nhau
    for (const { size, name } of faviconSizes) {
      const outputPath = join(publicDir, name)
      await image
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
        })
        .png()
        .toFile(outputPath)
      console.log(`✓ Đã tạo ${name} (${size}x${size})`)
    }

    // Tạo favicon.ico (16x16)
    const faviconIcoPath = join(publicDir, 'favicon.ico')
    await image
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(faviconIcoPath)
    console.log('✓ Đã tạo favicon.ico')

    // Tạo site.webmanifest
    const manifestPath = join(publicDir, 'site.webmanifest')
    const manifest = {
      name: 'Car Dealership Admin',
      short_name: 'Honda Admin',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
    }

    const fs = await import('fs/promises')
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    console.log('✓ Đã tạo site.webmanifest')

    console.log('\n✅ Hoàn thành! Tất cả favicon đã được tạo trong thư mục public/')
  } catch (error) {
    console.error('Lỗi khi tạo favicon:', error)
    process.exit(1)
  }
}

generateFavicons()
