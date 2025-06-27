const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot be more than 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  roles: {
    type: [String],
    enum: ['user', 'moderator', 'admin'],
    default: ['user']
  },
  interests: {
    type: [String],
    enum: [
      'science', 'history', 'gaming', 'movies', 'sports',
      'tech', 'music', 'geography', 'literature', 'art',
      'food', 'animals', 'general'
    ],
    default: []
  },
  stats: {
    gamesPlayed: {
      type: Number,
      default: 0
    },
    gamesWon: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    monstersDefeated: {
      type: Number,
      default: 0
    },
    correctImpostersIdentified: {
      type: Number,
      default: 0
    },
    tokensEarned: {
      type: Number,
      default: 0
    }
  },
  walletAddress: {
    type: String,
    default: null
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});


UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRY || '7d' }
  );
};


UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


UserSchema.methods.updateStats = function(gameStats) {
  this.stats.gamesPlayed += 1;
  
  if (gameStats.outcome === 'team_win' && gameStats.role === 'defender') {
    this.stats.gamesWon += 1;
  }
  
  if (gameStats.outcome === 'imposter_win' && gameStats.role === 'imposter') {
    this.stats.gamesWon += 1;
  }
  
  if (gameStats.correctAnswers) {
    this.stats.correctAnswers += gameStats.correctAnswers;
  }
  
  if (gameStats.monstersDefeated) {
    this.stats.monstersDefeated += gameStats.monstersDefeated;
  }
  
  if (gameStats.correctImpostersIdentified) {
    this.stats.correctImpostersIdentified += gameStats.correctImpostersIdentified;
  }
  
  if (gameStats.tokensEarned) {
    this.stats.tokensEarned += gameStats.tokensEarned;
  }
};

module.exports = mongoose.model('User', UserSchema);