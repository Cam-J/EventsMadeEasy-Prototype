import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Event from '../models/Events.js';

const router = express.Router();

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, user) => {
      if (err) return res.sendStatus(401);
      req.user = user;
      next();
    });
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin rights required.' });
  }
};

//apply authentication
router.use(authenticateToken);
router.use(isAdmin);

// Get all users with their event counts (Admin only)
router.get('/users', isAdmin, async (req, res) => {
  try {
    // Aggregate to get users with their event counts
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: 'participants',
          as: 'events'
        }
      },
      {
        $addFields: {
          eventCount: { $size: '$events' }
        }
      },
      {
        $project: {
          _id: 1,
          email: 1,
          role: 1,
          eventCount: 1
        }
      }
    ]);

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.put('/:userId/role', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId, 
      { role }, 
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'User role updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/:userId', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // First, check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Event.deleteMany({ creator: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;