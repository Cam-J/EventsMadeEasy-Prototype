import express from 'express';
import Task from '../models/Tasks.js';
import Event from '../models/Events.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all tasks for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.countDocuments({ 
            $or: [
                { createdBy: req.user.id },
                { assignedTo: req.user.id }
            ]
        });

        console.log('tasks count:', tasks);
      
        res.json({
            pendingTasksCount: tasks
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new task for a specific event
router.post('/:eventId/tasks', authMiddleware, async (req, res) => {
    try {
        const newTask = new Task({
            ...req.body,
            event: req.params.eventId,
            createdBy: req.user.id
        });
        
        await newTask.save();
        
        // Update the event to include this task
        await Event.findByIdAndUpdate(req.params.eventId, {
            $push: { tasks: newTask._id }
        });
      
        es.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update task status
router.patch('/:eventId/tasks/:taskId', authMiddleware, async (req, res) => {
    try {
        const updatedTask = await Task.findOneAndUpdate(
            { 
            _id: req.params.taskId, 
            event: req.params.eventId,
            $or: [
                { createdBy: req.user.id },
                { assignedTo: req.user.id }
            ]
            }, 
            req.body, 
            { new: true }
        );
      
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
      
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a task
router.delete('/:eventId/tasks/:taskId', authMiddleware, async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ 
            _id: req.params.id, 
            $or: [
                { createdBy: req.user.id },
                { assignedTo: req.user.id }
            ]
        });
        
        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        // Remove the task reference from the event
        await Event.findByIdAndUpdate(deletedTask.event, {
            $pull: { tasks: req.params.id }
        });
      
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;