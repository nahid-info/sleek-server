const jwt = require('jsonwebtoken')

function AdminAuth(req, res, next) {
  try {
    const key = process.env.JWT_SECRET
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      res.json({
        success: false,
        message: 'Invalid token!'
      })
    } else {
      const decoded = jwt.verify(token, key)
      if (decoded.role !== 'admin') {
        res.json({
          success: false,
          message: 'Unauthorized'
        })
      }
      req.user = decoded
      next()
    }
  } catch (error) {
    console.log(error.message)
    res.status(403).json({
      success: false,
      message: 'Unauthorized'
    })
  }
}

module.exports = AdminAuth