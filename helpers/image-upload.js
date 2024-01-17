const multer = require('multer')
const path = require('path')

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
    cb(undefined, true)
  }
})

module.exports = imageUpload