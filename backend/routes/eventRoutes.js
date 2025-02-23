import express from 'express';
import Event from '../models/Events.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Task from '../models/Tasks.js';

const router = express.Router();

// Get all events
router.get('/', authMiddleware, async (req, res) => {
    try {
        const events = await Event.find();
        console.log('Fetched events:', events); //debug log
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// get a single event by id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        console.log('Event Access Attempt:', {
            eventId: req.params.id,
            userId: req.user.id,
            userName: req.user.email
        });

        const event = await Event.findById(req.params.id).populate('tasks');
      
        if (!event) {
            console.log('Event not found:', req.params.id);
            return res.status(404).json({ message: 'Event not found' });
        }
        
        console.log('Event Found:', event);

        //check if user is participant or creator
        const isParticipant = event.participants.some(
            participant => participant.toString() === req.user.id
        );
        const isCreator = event.createdBy.toString() === req.user.id;

        if (!isParticipant && !isCreator) {
            console.log('Access Denied');
            return res.status(403).json({ 
              message: 'You do not have permission to access this event' 
            });
        }

        res.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create event
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newEvent = new Event({
      ...req.body,
      createdBy: req.user.id,
      participants: req.body.participants || [req.user.id]
    });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;