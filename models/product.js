import mongoose from 'mongoose'

const Product = mongoose.model('Product', {
  title: {
    type: String
  },
  price: {
    type: Number
  },
  color: {
    type: String
  },
  category: {
    type: String
  },
  description: {
    type: String
  },
  sizes: {
    type: Array
  },
  imageUrl: {
    type: String
  }
})

export default Product