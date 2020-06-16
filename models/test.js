import mongoose from 'mongoose'

const Test = mongoose.model('Test', {
  title: {
    type: String
  }
})

export default Test