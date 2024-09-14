const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const UserRoutes = require('./Routes/User.routes')
const ProductRoutes = require('./Routes/Product.routes')
const cors = require('cors')
const OrderRoutes = require('./Routes/Order.routes')

dotenv.config()

const app = express()

// Middlewares
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }));



// Routes
app.use('/user', UserRoutes)
app.use('/product', ProductRoutes)
app.use('/order', OrderRoutes)

// Publish images
app.use('/uploads', express.static('uploads'));

// listening part
const PORT = process.env.PORT || 3000
const DB_STRING = process.env.DB_STRING

const connectToDatabase = async () => {
  try {
    await mongoose.connect(DB_STRING)
    console.log('DB is connected')
  } catch (error) {
    console.log(error.message)
  }
}

app.use((err, req, res, next) => {
  if (err) {
    console.log(err.message)
    res.json({
      success: false,
      message: 'There is an unknow error!'
    })
  } else {
    return
  }
})

app.listen(PORT, () => {
  console.log(PORT)
  connectToDatabase()
  console.log(`Server started successfully!`)
})