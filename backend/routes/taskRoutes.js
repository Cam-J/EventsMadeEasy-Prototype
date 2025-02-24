// taskRoutes.js
import express from 'express';
import Task from '../models/Tasks.js';
import Event from '../models/Events.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/** router.get('/test', (req, res) => {
    res.json({ message: 'Task routes are working' });
}); */

router.use((req, res, next) => {
    console.log('Task route accessed:', {
        method: req.method,
        url: req.url,
        path: req.path,
        body: req.body
    });
    next();
});

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
router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log('Creating new task with data:', req.body);

        const newTask = new Task({
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.dueDate,
            priority: req.body.priority,
            event: req.body.event,
            createdBy: req.user.id,
            status: 'pending'  // Set default status
        });
        
        const savedTask = await newTask.save();
        console.log('Task saved:', savedTask);
        
        // Update the event to include this task
        if (req.body.event) {
            await Event.findByIdAndUpdate(req.body.event, {
                $push: { tasks: savedTask._id }
            });
        }

        const io = req.app.get('io');
        io.emit('taskCreated', newTask);
        res.status(201).json(savedTask);
    } catch (error) {
        console.error('Server error in create task:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a task
router.patch('/:taskId', authMiddleware, async (req, res) => {
    try {
        console.log('Update task request received:', {
            taskId: req.params.taskId,
            updates: req.body,
            userId: req.user.id
        });

        const task = await Task.findById(req.params.taskId);
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Update the task
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.taskId,
            { ...req.body },
            { new: true, runValidators: true }
        );

        console.log('Task updated:', updatedTask);
        
        const io = req.app.get('io');
        io.emit('taskUpdated', updatedTask);
        res.json(updatedTask);
    } catch (error) {
        console.error('Server error in update task:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a task
router.delete('/:taskId', authMiddleware, async (req, res) => {
    try {
        console.log('Delete task request received:', {
            taskId: req.params.taskId,
            userId: req.user.id
        });

        const task = await Task.findById(req.params.taskId);
        
        if (!task) {
            console.log('Task not found');
            return res.status(404).json({ message: 'Task not found' });
        }

        console.log('Found task:', {
            taskId: task._id,
            eventId: task.event,
            userId: req.user.id
        });

        // Store the eventId before deletion
        const eventId = task.event;

        console.log('Before deletion - eventId:', eventId);
        // delete task
        await Task.findByIdAndDelete(req.params.taskId);
        console.log('After deletion - eventId:', eventId);
        
        // Remove from event
        if (eventId) {
            await Event.findByIdAndUpdate(eventId, {
                $pull: { tasks: req.params.taskId }
            });
        }
        
        // Emit socket event
        try {
            const io = req.app.get('io');
            if (io) {

                const eventIdString = eventId ? eventId.toString() : 'null';
                console.log('About to  emit with eventIdString:', eventIdString);
                io.emit('taskDeleted', {
                    eventId: eventIdString,
                    taskId: req.params.taskId
                });
            }
        } catch (socketError) {
            console.error('Socket emission error:', socketError);
        }

        res.json({ 
            message: 'Task deleted successfully',
            taskId: req.params.taskId
        });
        
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack  });
    }
});

export default router;