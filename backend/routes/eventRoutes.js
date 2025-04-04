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

        //check if user is participant, creator or admin
        const isParticipant = event.participants.some(
            participant => participant.toString() === req.user.id
        );
        const isCreator = event.createdBy.toString() === req.user.id;
        const isAdmin = req.user && req.user.role == 'admin';

        if (!isParticipant && !isCreator && !isAdmin) {
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

// Delete event
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
      console.log('Event Deletion Attempt:', {
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

      //check if user is creator or admin
      const isCreator = event.createdBy.toString() === req.user.id;
      const isAdmin = req.user && req.user.role == 'admin';

      if (!isCreator && !isAdmin) {
          console.log('Access Denied');
          return res.status(403).json({ 
            message: 'You do not have permission to access this event' 
          });
      }
      
      //delete all tasks associated with event
      if (event.tasks && event.tasks.length > 0) {
        await Task.deleteMany({ event: req.params.id });
        console.log('Deleted all tasks for event:', req.params.id);
      }

      // Delete the event
      await Event.findByIdAndDelete(req.params.id);
      console.log('Event deleted:', req.params.id);

            
      // Emit socket event for real-time updates
      io.emit('eventDeleted', { eventId: req.params.id });
      res.status(200).json({ message: 'Event deleted successfully' });
      
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

export default router;