const mongoose = require('mongoose');

const timerSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['pomodoro', 'shortBreak', 'longBreak'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  completed: {
    type: Boolean,
    default: false
  },
  isRunning: {
    type: Boolean,
    default: true
  },
  timeLeft: {
    type: Number, // In seconds
    default: null
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  project: {
    type: String,
    default: 'No Project'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for efficient queries
timerSessionSchema.index({ user: 1, startTime: -1 });
timerSessionSchema.index({ user: 1, type: 1, startTime: -1 });

// Virtual for session duration
timerSessionSchema.virtual('actualDuration').get(function () {
  if (this.endTime && this.startTime) {
    return Math.round((this.endTime - this.startTime) / 1000 / 60); // Duration in minutes
  }
  return null;
});

module.exports = mongoose.model('TimerSession', timerSessionSchema); 