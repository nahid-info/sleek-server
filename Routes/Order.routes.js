const express = require('express')
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  username: String,
  cart: [String],
  status: {
    type: String,
    enum: ['none', 'accepted', 'cancelled', 'completed']
  }
})

const Order = mongoose.model('Order', orderSchema)

const OrderRoutes = express.Router()

OrderRoutes.post('/add', async (req, res) => {
  const orderDetails = Order(req.body)
  await orderDetails.save()
})

module.exports = OrderRoutes