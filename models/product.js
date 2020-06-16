import mongoose from 'mongoose'

const Product = mongoose.model('Product', {
  title: {
    type: String
  },
  imageUrl: {
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
  availableSizes: {
    type: Array
  }
})

export default Product