import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt-nodejs'
import dotenv from 'dotenv'
import cloudinaryFramework from 'cloudinary'
import multer from 'multer'
import cloudinaryStorage from 'multer-storage-cloudinary'
import User from './models/user'
import Product from './models/product'

// CLOUDINARY
dotenv.config()

const cloudinary = cloudinaryFramework.v2;
cloudinary.config({
  cloud_name: 'rautellin',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = cloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products',
    allowedFormats: ['jpg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  }
})
const parser = multer({ storage })

// MESSAGES
const ERR_CANNOT_CREATE_USER = 'Could not create user.'
const ERR_CANNOT_CREATE_PRODUCT = 'Could not create product.'
const ERR_CANNOT_ADD_IMAGE = 'Could not add pictue.'
const ERR_CANNOT_LOGIN = 'Please try log in again.'
const ERR_CANNOT_ACCESS = 'Access token is missing or wrong.'
const PRODUCT_CREATED = 'Product is created.'
const IMAGE_ADDED = 'Image is added.'

// SERVER SET UP

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/finalproject"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
mongoose.Promise = Promise

const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// Add middleware to aythenticate user
const authenticateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ accessToken: req.header('Authorization') })
    if (user) {
      req.user = user
      next()
    } else {
      res.status(401).json({ loggedOut: true, message: ERR_CANNOT_LOGIN })
    }
  } catch (err) {
    res.status(403).json({ message: ERR_CANNOT_ACCESS, errors: err.errors })
  }
}

app.get('/', (req, res) => {
  res.send('API for the final project')
})

/* ---- PRODUCTS ---- */

// Get all products
app.get('/products', async (req, res) => {
  const products = await Product.find()
  res.json(products)
})

// Add product information
app.post('/products', parser.single('image'), async (req, res) => {
  try {
    const { title, price, color, category, description, sizes } = req.body
    const product = new Product({
      title,
      price,
      color,
      category,
      description,
      sizes
    })
    const newProduct = await product.save()
    res.status(201).json(newProduct)
  } catch (err) {
    res.status(400).json({ message: ERR_CANNOT_CREATE_PRODUCT, errors: err })
  }
})

// Add picture for product
app.post('/products/:id/image', parser.single('image'), async (req, res) => {
  const { id } = req.params
  const { path, filename } = req.file

  console.log(`POST /products/${id}/image`)
  try {
    await Product.updateOne(
      { _id: id },
      { __v: 1 }
    )
    const product = new Product({
      imageUrl: path,
      imageName: filename
    })
    const updatedproduct = await product.save()
    res.status(201).json(updatedproduct)
  } catch (err) {
    res.status(400).json({ message: ERR_CANNOT_ADD_IMAGE, errors: err })
  }
})

// Find a product
app.get('/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (product) {
    res.json(product)
  } else {
    res.status(400).json({ message: 'Error message' })
  }
})


/* ---- USERS ---- */

// Get all users
app.get('/users', async (req, res) => {
  const users = await User.find()
  res.json(users)
})

// Registration route
app.post('/users', async (req, res) => {
  try {
    const { name, surname, email, password } = req.body
    const user = new User({ name, surname, email, password: bcrypt.hashSync(password) })
    const createdUser = await user.save()

    res.status(201).json({ userId: createdUser._id, accessToken: createdUser.accessToken })
  } catch (err) {
    res.status(400).json({ message: ERR_CANNOT_CREATE_USER, errors: err.errors })
  }
})

// Logged in route
app.get('/users/:id', authenticateUser)
app.get('/users/:id', (req, res) => {
  res.status(201).json({ secret: 'This is secret' })
})

// Login route
app.post('/sessions', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(201).json({ userId: user._id, accessToken: user.accessToken })
    } else {
      res.status(404).json({ notFound: true })
    }
  } catch (err) {
    res.status(404).json({ notFound: true })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
