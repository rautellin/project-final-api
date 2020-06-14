import mongoose from 'mongoose'
import crypto from 'crypto'

const User = mongoose.model('User', {
  name: {
    type: String,
    required: [true, 'Name is empty']
  },
  surname: {
    type: String,
    required: [true, 'Surname is empty']
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is empty']
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password is too short']
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
})

export default User
