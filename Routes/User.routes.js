const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const generateToken = require('../Controllers/GenerateToken')
const AuthMiddleware = require('../Controllers/AuthMiddleware')

//   Here username is email

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },

  cart: [{
    _id: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    size: {
      type: String,
      enum: ['M', 'L', 'XL'],
      default: 'M',
    },
  }],

  name: String,
  phone: String,
  villageName: String,
  postalCode: String,
  upazila: String,
  streetAddress: String
})

const User = mongoose.model('User', userSchema)

const UserRoutes = express.Router()

// UserRoutes.post('/del', async (req, res) => {
//   await User.findOneAndDelete({ username: 'admin' })
//   res.json({
//     message: 'admin deleted'
//   })
// })

UserRoutes.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const foundUser = await User.findOne({ username })

    if (foundUser) {
      console.log('User exists!')
      res.json({
        success: false,
        message: 'This email has another account!'
      })
      return
    }

    const userData = User({ username, password: hashedPassword })
    const result = await userData.save()

    console.log(result)
    if (result) {
      const token = generateToken(result)
      res.json({
        success: true,
        message: 'User created successfully!',
        token: token
      })
    } else {
      res.json({
        success: false,
        message: 'Something went wrong!'
      })
    }
  } catch (error) {
    console.log(error.message)
    res.json({
      success: false,
      message: 'Internal Server error!'
    })
  }
})

UserRoutes.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username: username })

    if (user) {
      const result = await bcrypt.compare(password, user.password)
      if (result) {
        const token = generateToken(user)
        res.json({
          success: true,
          token: token,
        }).status(200)
      } else {
        res.json({
          success: false,
          message: 'Invalid password!'
        })
      }
    } else {
      res.json({
        success: false,
        message: 'User not found!'
      })
    }
  } catch (error) {
    console.log(error.message)
    res.json({
      success: false,
      message: 'Internal server error!'
    })
  }
})

UserRoutes.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username: username })
    if (user && user.role === 'admin') {
      const result = await bcrypt.compare(password, user.password)
      if (result) {
        const token = generateToken(user)
        res.json({
          success: true,
          token: token,
        }).status(200)
      } else {
        res.json({
          success: false,
          message: 'Invalid password!'
        })
      }
    } else {
      res.json({
        success: false,
        message: 'Admin user not found!'
      })
    }
  } catch (error) {
    console.log(error.message)
    res.json({
      success: false,
      message: 'Internal server error!'
    })
  }
})



UserRoutes.get('/userinfo', AuthMiddleware, async (req, res) => {
  try {
    const { username } = req.user
    const foundUser = await User.findOne({ username })
    const { password, ...user } = foundUser.toObject()
    res.json({
      success: true,
      userInfo: user
    })
  } catch (error) {
    console.log(error.message)
    res.json({
      success: false,
      message: 'Something went wrong!'
    })
  }
})


UserRoutes.post('/update-info', AuthMiddleware, async (req, res) => {
  try {
    const { username } = req.user
    // const { name, phone, villageName, postalCode, upazila, StreetAddress } = req.body
    // console.log(name, phone)
    const userInfo = await User.findOneAndUpdate({ username }, req.body, { new: true })
    console.log('saved')
    res.json({
      success: true,
      userInfo,
    })
  } catch (error) {
    console.log(error.message)
    res.json({
      success: false,
      message: 'Something went wrong!'
    })
  }
})

UserRoutes.get('/role', AuthMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  })
})

UserRoutes.post('/add-cart', AuthMiddleware, async (req, res) => {
  const { _id, size } = req.body
  try {
    const { cart } = await User.findOne({ username: req.user.username })

    const foundProduct = cart.find((element) => {
      return element._id === _id
    })

    if (foundProduct) {
      return res.json({
        message: 'Already added to cart!'
      })
    }
    cart.push({ _id, size })
    await User.findOneAndUpdate({ username: req.user.username }, { cart: cart })
    res.json({
      success: true,
      message: 'Added to cart successfully!'
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: 'Something went wrong!'
    })
  }
})

UserRoutes.get('/find-cart', AuthMiddleware, async (req, res) => {
  const { username } = req.user
  try {
    const { cart } = await User.findOne({ username })
    if (cart) {
      return res.json({
        success: true,
        cart: cart,
      })
    } else {
      res.json({
        message: 'Something went wrong!'
      })
    }
  } catch (error) {
    console.log(error.message)
    return res.json({
      message: 'Internal server error'
    })
  }

})

UserRoutes.delete('/cart-remove/:id', AuthMiddleware, async (req, res) => {
  const { username } = req.user
  const { id } = req.params
  console.log(id)
  try {
    const { cart } = await User.findOne({ username })
    const newCart = cart.filter((element) => element._id !== id)
    await User.findOneAndUpdate({ username }, { cart: newCart })
    res.json({
      success: true,
      message: 'Item removed from cart!'
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: 'Something went wrong! Please try again.'
    })
  }
})

UserRoutes.post('/cart-update', AuthMiddleware, async (req, res) => {
  const { username } = req.user
  try {
    const { _id, quantity } = req.body
    const { cart } = await User.findOne({ username })
    const newCart = cart.map(element => {
      if (element._id === _id) {
        return element.quantity = Number(quantity)
      }
    });
    await User.findOneAndUpdate({ username }, { cart: newCart })
  } catch (error) {
    console.log(error.message)
    res.json({
      success: false,
      message: 'internal server error!;'
    })
  }
})

module.exports = UserRoutes