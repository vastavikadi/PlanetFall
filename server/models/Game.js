const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  gameMode: {
    type: String,
    enum: ['imposter', 'regular', 'chaos'],
    required: true
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 2,
    max: 8
  },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed'],
    default: 'waiting'
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['defender', 'imposter', null],
        default: null
      },
      score: {
        type: Number,
        default: 0
      },
      tokensEarned: {
        type: Number,
        default: 0
      }
    }
  ],
  rounds: [
    {
      type: {
        type: String,
        enum: ['quiz', 'battle', 'vote'],
        required: true
      },
      startedAt: {
        type: Date,
        default: null
      },
      completedAt: {
        type: Date,
        default: null
      },

      questions: [
        {

          questionId: {
            type: mongoose.Schema.Types.Mixed
          },
          text: String,
          options: [String],
          correctAnswer: Number,
          playerAnswers: [
            {
              userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
              },
              answerIndex: Number,
              isCorrect: Boolean,
              timestamp: {
                type: Date,
                default: Date.now
              }
            }
          ]
        }
      ],

      monstersDefeated: {
        type: Number,
        default: 0
      },
      playerActions: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          action: String,
          targetId: String,
          timestamp: {
            type: Date,
            default: Date.now
          }
        }
      ],

      votes: [
        {
          voterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          targetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          timestamp: {
            type: Date,
            default: Date.now
          }
        }
      ]
    }
  ],
  planetHealth: {
    type: Number,
    default: 30
  },
  outcome: {
    type: String,
    enum: ['team_win', 'imposter_win', null],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Game', GameSchema);