const express = require('express');
const { body, validationResult } = require('express-validator');
const TimerSession = require('../models/TimerSession');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Start a timer session
router.post('/start', auth, [
  body('type').isIn(['pomodoro', 'shortBreak', 'longBreak']).withMessage('Invalid timer type'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('taskId').optional().isMongoId().withMessage('Invalid task ID'),
  body('project').optional(),
  body('notes').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, duration, taskId, project, notes } = req.body;

    // Check if there's an active session
    const activeSession = await TimerSession.findOne({
      user: req.user._id,
      completed: false
    });

    if (activeSession) {
      activeSession.endTime = new Date();
      activeSession.completed = true;
      await activeSession.save();
    }

    const session = new TimerSession({
      user: req.user._id,
      type,
      duration,
      startTime: new Date(),
      task: taskId,
      project: project || 'No Project',
      notes
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete a timer session
router.post('/complete/:id', auth, async (req, res) => {
  try {
    const session = await TimerSession.findOne({
      _id: req.params.id,
      user: req.user._id,
      completed: false
    });

    if (!session) {
      return res.status(404).json({ message: 'Timer session not found' });
    }

    session.endTime = new Date();
    session.completed = true;
    await session.save();

    // Update task pomodoros if this was a pomodoro session
    if (session.type === 'pomodoro' && session.task) {
      const task = await Task.findById(session.task);
      if (task) {
        task.completedPomodoros += 1;
        await task.save();
      }
    }

    res.json(session);
  } catch (error) {
    console.error('Complete timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pause timer session
router.post('/pause', auth, async (req, res) => {
  try {
    const session = await TimerSession.findOne({
      user: req.user._id,
      completed: false
    });

    if (!session) {
      return res.status(404).json({ message: 'No active session found' });
    }

    if (!session.isRunning) {
      return res.status(400).json({ message: 'Timer is already paused' });
    }

    const now = new Date();
    const elapsedTime = Math.floor((now - session.startTime) / 1000); // seconds
    const totalDurationSeconds = session.duration * 60;
    const timeLeft = Math.max(0, totalDurationSeconds - elapsedTime);

    session.isRunning = false;
    session.timeLeft = timeLeft;
    await session.save();

    res.json(session);
  } catch (error) {
    console.error('Pause timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resume timer session
router.post('/resume', auth, async (req, res) => {
  try {
    const session = await TimerSession.findOne({
      user: req.user._id,
      completed: false
    });

    if (!session) {
      return res.status(404).json({ message: 'No active session found' });
    }

    if (session.isRunning) {
      return res.status(400).json({ message: 'Timer is already running' });
    }

    // Recalculate start time so that "now - startTime" equals the active duration passed
    // We want: duration * 60 - (now - newStartTime) / 1000 = timeLeft
    // So: (now - newStartTime) / 1000 = duration * 60 - timeLeft
    // newStartTime = now - (duration * 60 - timeLeft) * 1000

    if (session.timeLeft === null || session.timeLeft === undefined) {
      // Fallback if timeLeft wasn't saved properly, though it should be
      session.timeLeft = session.duration * 60;
    }

    const now = new Date();
    const elapsedSecondsBeforePause = (session.duration * 60) - session.timeLeft;
    session.startTime = new Date(now.getTime() - (elapsedSecondsBeforePause * 1000));

    session.isRunning = true;
    session.timeLeft = null; // Clear it as it's running now
    await session.save();

    res.json(session);
  } catch (error) {
    console.error('Resume timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current active session
router.get('/active', auth, async (req, res) => {
  try {
    const session = await TimerSession.findOne({
      user: req.user._id,
      completed: false
    });

    res.json(session);
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get timer sessions with pagination
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, startDate, endDate } = req.query;
    const filter = { user: req.user._id };

    if (type) {
      filter.type = type;
    }

    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    const sessions = await TimerSession.find(filter)
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('task', 'title project');

    const total = await TimerSession.countDocuments(filter);

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get timer statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    let startDate;

    switch (period) {
      case 'day':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    }

    const stats = await TimerSession.aggregate([
      {
        $match: {
          user: req.user._id,
          startTime: { $gte: startDate },
          completed: true
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalActualDuration: {
            $sum: {
              $divide: [
                { $subtract: ['$endTime', '$startTime'] },
                1000 * 60 // Convert to minutes
              ]
            }
          }
        }
      }
    ]);

    const dailyStats = await TimerSession.aggregate([
      {
        $match: {
          user: req.user._id,
          startTime: { $gte: startDate },
          completed: true
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
            type: '$type'
          },
          duration: { $sum: '$duration' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      period,
      startDate,
      stats,
      dailyStats
    });
  } catch (error) {
    console.error('Timer stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a timer session
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await TimerSession.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Timer session not found' });
    }

    res.json({ message: 'Timer session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 