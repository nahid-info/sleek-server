const jwt = require('jsonwebtoken')

function generateToken(user) {

  const key = process.env.JWT_SECRET

  const userdata = {
    username: user.username,
    role: user.role
  }

  const token = jwt.sign(userdata, key)
  return token
}

module.exports = generateToken