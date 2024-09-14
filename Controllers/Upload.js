const multer = require('multer')
const fs = require('fs')
const path = require('path')

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, `uploads/`)
  },
  filename: (req, file, cb) => {
    const CurDate = Date.now()
    const fileExt = path.extname(file.originalname)
    const fileName = CurDate + '-' + file.fieldname + fileExt
    if (file.fieldname === 'image') {
      req.body.imgUrl = fileName
    } else if (file.fieldname === 'image2') {
      req.body.img2Url = fileName
    } else if (file.fieldname === 'image3') {
      req.body.img3Url = fileName
    }
    cb(null, fileName)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

module.exports = upload