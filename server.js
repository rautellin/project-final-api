import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt-nodejs'
import User from './models/user'
import Product from './models/product'

// MESSAGES
const ERR_CANNOT_CREATE_USER = 'Could not create user.'
const ERR_CANNOT_CREATE_PRODUCT = 'Could not create product.'
const ERR_CANNOT_LOGIN = 'Please try log in again.'
const ERR_CANNOT_ACCESS = 'Access token is missing or wrong.'
const PRODUCT_CREATED = 'Product is created.'

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
  res.send('Hello world')
})

/* ---- PRODUCTS ---- */

// Get all products
app.get('/products', async (req, res) => {
  const products = await Product.find()
  res.json(products)
})

// Add products
app.post('/products', async (req, res) => {
  try {
    const { title, image, price, color, description, availableSizes } = req.body
    const product = new Product({ title, image, price, color, description, availableSizes })
    const createdProduct = await product.save()

    res.status(201).json({ productId: createdProduct._id, message: PRODUCT_CREATED })
  } catch (err) {
    res.status(400).json({ message: ERR_CANNOT_CREATE_PRODUCT, errors: err.errors })
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
