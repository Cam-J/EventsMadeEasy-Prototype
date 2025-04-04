import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working' });
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password }); // For debugging

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Simple password check
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '5m' },
      // { expiresIn: '24h'}, - Uncomment this and comment the above. 5min token for testing.
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
    console.log('Generated Token: ', {
        token,
        tokenLength: token.length,
        tokenContents: jwt.decode(token),
      })
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to create test users
router.post('/create', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Create user without password hashing
    const user = new User({
      email,
      password,
      role: role || 'user'
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Registration route
router.post('/register', async (req, res) => {
  try {
    const {username, email, password} = req.body;

    // check if user exists
    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res.status(400).json({message: 'user with this email exists'});
    }

    const user = new User({
      username,
      email,
      password, // would hasH in production
      role: 'user' //default
    });

    await user.save();

    res.status(201).json({
      message: 'user registered successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
  }
});

export default router;