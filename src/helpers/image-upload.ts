import multer from 'multer'
import path from 'path'

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = ""

    if (req.baseUrl.includes("users")) {
      folder = "users"
    } else if (req.baseUrl.includes("pets")) {
      folder = "pets"
    }

    cb(null, `public/images/${folder}`)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + Math.floor(Math.random() * 1000) + path.extname(file.originalname))
  }
})

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error('Somente JPG e PNG são aceitos!'))
    }
    cb(null, true)
  }
})

// declare global {
//   namespace Express {
//     interface Request {
//       files: any;
//       file: any
//     }
//   }
// }

export default imageUpload