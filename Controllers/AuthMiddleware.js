const jwt = require('jsonwebtoken')

function AuthMiddleware(req, res, next) {
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
      req.user = decoded
      next()
    }
  } catch (error) {
    console.log(error.message)
    res.json({
      success: false,
      message: 'Unauthorized'
    }).status(403)
  }
}

module.exports = AuthMiddleware