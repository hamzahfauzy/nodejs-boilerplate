import fs from 'fs'
import path from 'path'
import multer from 'multer'

export function upload(folder = '') {

  const uploadDir = folder ? path.join('storage', folder) : 'storage'

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
      const safeName = file.originalname
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.-]/g, '')

      cb(null, `${Date.now()}-${safeName}`)
    }
  })

  return multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  })
}
