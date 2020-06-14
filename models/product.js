import mongoose from 'mongoose'

const Product = mongoose.model('Product', {
  title: {
    type: String,
    required: [true, 'Title is empty']
  },
  image: {
    type: String,
    required: [true, 'Image is empty']
  },
  price: {
    type: Number,
    required: [true, 'Price is empty']
  },
  color: {
    type: String,
    enum:
      [
        'Beige',
        'Black',
        'Blue',
        'Brown',
        'Green',
        'Purple',
        'Orange',
        'Others',
        'Pink',
        'Printed',
        'Red',
        'White',
        'Yellow',
        'Silver',
        'Gold'
      ],
    required: [true, 'Color is empty']
  },
  description: {
    type: String,
    required: true,
    minlength: [20, 'Description is too short']
  },
  availableSizes: {
    type: Array,
    required: [true, 'Size is empty']
  }
})

export default Product