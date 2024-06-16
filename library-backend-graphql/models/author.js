import { mongoose } from 'mongoose'

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4
  },
  born: {
    type: Number
  },
  bookCount: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
})

export default mongoose.model('Author', schema)
