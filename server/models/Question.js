const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please add a question text'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Please add options'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length === 4;
      },
      message: props => 'Question must have exactly 4 options!'
    }
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Please specify the correct answer index'],
    min: 0,
    max: 3
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'science', 'history', 'gaming', 'movies', 'sports',
      'tech', 'music', 'geography', 'literature', 'art',
      'food', 'animals', 'general'
    ]
  },
  difficulty: {
    type: String,
    required: [true, 'Please add a difficulty level'],
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', QuestionSchema);