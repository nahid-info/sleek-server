const fs = require('fs')

const createFolder = async () => {
  try {
    const date = Date.now()
    console.log(date)
    const folderName = fs.mkdir(`uploads/${date}`, (err, res) => {
      if (err) {
        console.log(err)
      }
    })
    console.log(date)
  } catch (error) {
    console.log(error.message)
  }
}

createFolder()