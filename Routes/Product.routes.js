const express = require('express')
const mongoose = require('mongoose')
const upload = require('../Controllers/Upload')
const AuthMiddleware = require('../Controllers/AuthMiddleware')
const fs = require('fs')
const AdminAuth = require('../Controllers/AdminAuth')
const multer = require('multer')
const path = require('path')

const productSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  oldPrice: {
    type: Number
  },
  discount: {
    type: Number
  },
  imgUrl: {
    type: String,
    required: true
  },
  img2Url: {
    type: String,
    required: true
  },
  img3Url: {
    type: String,
    required: true
  },
  showHome: {
    type: Boolean,
    default: false
  }
})

const Product = mongoose.model('Product', productSchema)

const ProductRoutes = express.Router()

//  Routes

ProductRoutes.post('/add', AdminAuth, upload.fields([
  {
    name: 'image',
    maxCount: 1
  },
  {
    name: 'image2',
    maxCount: 1
  },
  {
    name: 'image3',
    maxCount: 1
  },

]), async (req, res) => {
  try {
    const { type, oldPrice, currentPrice, imgUrl } = req.body
    console.log(type)
    const newProduct = Product(req.body)
    await newProduct.save()
    console.log("Product saved")
    res.json({
      success: true,
      message: 'Product added successfully!'
    })
  } catch (error) {
    console.log(error.message)
    res.json({
      success: false,
      message: 'Internal server error! try again.'
    })
  }

})

ProductRoutes.get('/show', async (req, res) => {
  try {

    const allProducts = await Product.find({})

    if (allProducts) {
      res.json({
        success: true,
        allProducts: allProducts
      })
    }

  } catch (error) {
    console.log(error.message)
    res.json({
      success: false,
      message: 'Something went wrong! Please try again.'
    })
  }
})

ProductRoutes.post('/delete', AuthMiddleware, async (req, res) => {
  try {
    const { _id } = req.body
    const product = await Product.findOne({ _id: _id })
    if (product) {
      fs.unlink(`uploads/${product.imgUrl}`, (err) => {
        if (err) {
          console.log(err)
        } else {
          return
        }
      })
      fs.unlink(`uploads/${product.img2Url}`, (err) => {
        if (err) {
          console.log(err)
        } else {
          return
        }
      })
      fs.unlink(`uploads/${product.img3Url}`, (err) => {
        if (err) {
          console.log(err)
        } else {
          return
        }
      })
      await Product.findOneAndDelete({ _id: _id })
      res.json({
        success: true,
        message: 'The product deleted successfully!'
      })
    }
  } catch (error) {
    console.log(error.message)
    res.json({
      success: false,
      message: 'Something went wrong!'
    })
  }
})

ProductRoutes.post('/findone', async (req, res) => {
  const { _id } = req.body
  try {
    const product = await Product.findOne({ _id: _id })
    res.json({
      success: true,
      product: product,
    })
  } catch (error) {
    console.log(error.message)
    res.json({
      success: false
    })
  }
})


ProductRoutes.put('/update', AuthMiddleware, async (req, res) => {
  try {
    console.log(req.body)
    const result = await Product.findOneAndUpdate(
      {
        _id: req.body._id
      },
      req.body
    )
    if (result) {
      res.json({
        success: true,
        message: 'Product details updated successfully!'
      })
    }

  } catch (error) {
    console.log(error.message)
    res.json({
      success: false
    })
  }
})

module.exports = ProductRoutes