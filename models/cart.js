import mongoose from 'mongoose'

const Cart = mongoose.model('cart', {
  id: {
    type: String
  },
  title: {
    type: String
  },
  price: {
    type: Number
  },
  color: {
    type: String
  },
  quantity: {
    type: Number,
    default: 0
  },
  selectedSize: {
    type: String
  },
  imageUrl: {
    type: String
  }
})

export default Product