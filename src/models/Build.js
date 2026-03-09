import mongoose from 'mongoose';

const buildSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  class: {
    type: String,
    enum: ['Воин', 'Маг', 'Хил', 'Лучник', 'Разбойник', 'Другое'],
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Build', buildSchema);
