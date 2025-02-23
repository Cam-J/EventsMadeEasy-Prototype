<template>
    <div class="event-details">
      <nav class="navbar">
        <div class="nav-container">
          <button class="btn" @click="$router.push('/dashboard')">← Back</button>
          <button class="btn btn-danger" @click="deleteEvent">Delete Event</button>
        </div>
      </nav>
  
      <div class="main-container">
        <!-- Event Information -->
        <div class="event-header">
          <div class="event-info">
            <h1>{{ event?.title }}</h1>
            <p class="event-date">{{ formatDate(event?.date) }}</p>
            <p class="event-location">📍 {{ event?.location }}</p>
            <p class="event-description">{{ event?.description }}</p>
          </div>
        </div>
  
        <!-- Tasks Section -->
        <div class="tasks-section">
          <div class="section-header">
            <h2>Tasks</h2>
            <button class="btn btn-primary" @click="showTaskForm = true">Add Task</button>
          </div>
  
          <div class="tasks-grid">
            <div v-if="!event?.tasks?.length" class="no-tasks">
              No tasks created yet.
            </div>
            <div v-for="task in event?.tasks" :key="task._id" class="task-card">
              <div class="task-header">
                <h3>{{ task.title }}</h3>
                <span :class="['status-badge', task.status]">{{ task.status }}</span>
              </div>
              <p>{{ task.description }}</p>
              <div class="task-footer">
                <p>Due: {{ formatDate(task.dueDate) }}</p>
                <div class="task-actions">
                  <button 
                    class="btn" 
                    @click="updateTaskStatus(task._id, task.status === 'completed' ? 'pending' : 'completed')"
                  >
                    {{ task.status === 'completed' ? 'Reopen' : 'Complete' }}
                  </button>
                  <button class="btn btn-danger" @click="deleteTask(task._id, event._id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Add Task  -->
      <div v-if="showTaskForm" class="modal">
        <div class="modal-content">
          <h2>Add New Task</h2>
          <form @submit.prevent="createTask">
            <div class="form-group">
              <label>Title</label>
              <input v-model="newTask.title" required>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="newTask.description" required></textarea>
            </div>
            <div class="form-group">
              <label>Due Date</label>
              <input type="date" v-model="newTask.dueDate" required>
            </div>
            <div class="form-group">
              <label>Priority</label>
              <select v-model="newTask.priority" required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-danger" @click="showTaskForm = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Create Task</button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>
  
<script>
  import axios from 'axios';
  import socket from '../services/socket.js';
  
  export default {
    data() {
      return {
        event: null,
        showTaskForm: false,
        newTask: {
          title: '',
          description: '',
          dueDate: '',
          priority: 'medium'
        }
      };
    },
    methods: {
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString();
        },

        // fetch event details
        async fetchEvent() {
            try {
                const response = await axios.get(`/api/events/${this.$route.params.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Event fetch response:', response.data);
            this.event = response.data;
            
            } catch (error) {
                console.error('Error fetching event:', {
                    message: error.message,
                    response: error.response,
                    request: error.request,
                    config: error.config  
                });
                // Provide more informative error handling
                if (error.response) {
                // The request was made and the server responded with a status code
                console.error('Error Response Data:', error.response.data);
                console.error('Error Status:', error.response.status);
                } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received');
                } else {
                // Something happened in setting up the request
                console.error('Error setting up request');
                }
                
                this.$router.push('/events');
            }
        },

        async createTask() {
            try {
                await axios.post(`/api/tasks`,
                    ...this.newTask,
                    { 
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });
          
                this.showTaskForm = false;
                this.newTask = { title: '', description: '', dueDate: '', priority: 'medium' };
            
                await this.fetchEvent();
        
            } catch (error) {
                console.error('Error creating task:', error);
                alert('Failed to create task');
            }
        },
  
        async updateTaskStatus(taskId, status) {
            try {
                await axios.patch(`/api/tasks/${taskId}`,
                { status },
                { headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }});
            
                await this.fetchEvent();
            } catch (error) {
                console.error('Error updating task:', error);
            }
        },

        async deleteTask(taskId, eventId) {
            if (!confirm('Are you sure you want to delete this task?')) return;
        
            try {
                await axios.delete(`/api/events/${eventId}/tasks/${taskId}`,
                { headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }});
          
                await this.fetchEvent();

                alert('Task Deleted.');
        
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        },
    
        async deleteEvent() {
            if (!confirm('Are you sure you want to delete this event?')) return;
        
            try {
                await axios.delete(`http://localhost:5000/api/events/${this.$route.params.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }});
          
                this.$router.push('/dashboard');
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    },

    mounted() {
        this.fetchEvent();
    
        // Socket event listeners
        socket.on('taskCreated', (task) => {
        if (task.event === this.$route.params.id) {
            this.fetchEvent();
        }
        });

        socket.on('taskUpdated', (task) => {
        if (task.event === this.$route.params.id) {
            this.fetchEvent();
        }
        });

        socket.on('taskDeleted', ({eventId, taskId}) => {
        if (eventId === this.$route.params.id) {
            this.fetchEvent();
        }
        });
    },

    beforeUnmount() {
        // Clean up socket listeners
        socket.off('taskCreated');
        socket.off('taskUpdated');
        socket.off('taskDeleted');
    }
};
</script>
  
<style scoped>
  .event-details {
    min-height: 100vh;
  }
  
  .main-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  .event-header {
    background-color: var(--secondary-bg);
    padding: 2rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }
  
  .event-date {
    color: var(--accent-color);
    margin: 0.5rem 0;
  }
  
  .tasks-section {
    background-color: var(--secondary-bg);
    padding: 2rem;
    border-radius: 8px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .tasks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .task-card {
    background-color: var(--primary-bg);
    padding: 1.5rem;
    border-radius: 8px;
  }
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
  }
  
  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }
  
  .status-badge.pending {
    background-color: #2196F3;
  }
  
  .status-badge.completed {
    background-color: #4CAF50;
  }
  
  .task-footer {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .task-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  select {
    width: 100%;
    padding: 0.5rem;
    background-color: var(--primary-bg);
    border: 1px solid #444;
    border-radius: 4px;
    color: white;
  }
</style>