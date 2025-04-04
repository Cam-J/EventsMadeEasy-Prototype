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
            <button class="btn btn-primary" @click="openTaskForm()">Add Task</button>
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
              <div class="task-meta">
                <p>Due: {{ formatDate(task.dueDate) }}</p>
                <p>Priority: {{ task.priority }}</p>
              </div>
              <div class="task-footer">
                <div class="task-actions">
                  <button 
                    class="btn" 
                    @click="updateTaskStatus(task._id, task.status === 'completed' ? 'pending' : 'completed')"
                  >
                    {{ task.status === 'completed' ? 'Reopen' : 'Complete' }}
                  </button>
                  <button class="btn btn-secondary" @click="openTaskForm(task)">Edit</button>
                  <button class="btn btn-danger" @click="deleteTask(task._id, event._id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <TaskAnalytics v-if="event" :event="event"/>
      </div>
  
      <!-- Task Form Modal (Used for both Add and Edit) -->
      <div v-if="showTaskForm" class="modal">
        <div class="modal-content">
          <h2>{{ isEditMode ? 'Edit Task' : 'Add New Task' }}</h2>
          <form @submit.prevent="handleTaskSubmit">
            <div class="form-group">
              <label>Title</label>
              <input v-model="taskForm.title" required>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="taskForm.description" required></textarea>
            </div>
            <div class="form-group">
              <label>Due Date</label>
              <input type="date" v-model="taskForm.dueDate" required>
            </div>
            <div class="form-group">
              <label>Priority</label>
              <select v-model="taskForm.priority" required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-danger" @click="closeTaskForm">Cancel</button>
              <button type="submit" class="btn btn-primary">
                {{ isEditMode ? 'Update Task' : 'Create Task' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>
  
<script>
  import axios from '../services/axios.js';
  import socket from '../services/socket.js';
  import TaskAnalytics from '../components/TaskAnalytics.vue';
  
  export default {
    components: {
        TaskAnalytics
    },

    data() {
      return {
        event: null,
        showTaskForm: false,
        isEditMode: false,
        taskForm: {
          _id: null,
          title: '',
          description: '',
          dueDate: '',
          priority: 'medium',
          status: 'pending'
        },
        socketConnected: false
      };
    },

    methods: {
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString();
        },

        // Form handling methods
        openTaskForm(task = null) {
          this.isEditMode = !!task;
          if (task) {
            // Edit mode - populate form with task data
            this.taskForm = {
              _id: task._id,
              title: task.title,
              description: task.description,
              dueDate: new Date(task.dueDate).toISOString().split('T')[0],
              priority: task.priority,
              status: task.status
            };
          } else {
            // Add mode - reset form
            this.taskForm = {
              _id: null,
              title: '',
              description: '',
              dueDate: '',
              priority: 'medium',
              status: 'pending'
            };
          }
          this.showTaskForm = true;
        },

        closeTaskForm() {
          this.showTaskForm = false;
          this.isEditMode = false;
          this.taskForm = {
            _id: null,
            title: '',
            description: '',
            dueDate: '',
            priority: 'medium',
            status: 'pending'
          };
        },

        async handleTaskSubmit() {
          if (this.isEditMode) {
            await this.updateTask();
          } else {
            await this.createTask();
          }
        },

        // API methods
        async fetchEvent() {
            try {
                const response = await axios.get(`/api/events/${this.$route.params.id}`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                });
                this.event = response.data;
            } catch (error) {
                console.error('Error fetching event:', error);
                this.$router.push('/events');
            }
        },

        async createTask() {
            try {
                const taskData = {
                    ...this.taskForm,
                    event: this.$route.params.id
                };

                await axios.post('/api/tasks', taskData, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                });
                
                this.closeTaskForm();
                await this.fetchEvent();
                
            } catch (error) {
                console.error('Error creating task:', error);
                alert('Failed to create task');
            }
        },

        async updateTask() {
            try {
                const { _id, ...taskData } = this.taskForm;
                
                await axios.patch(`/api/tasks/${_id}`, taskData, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                });

                this.closeTaskForm();
                await this.fetchEvent();
            } catch (error) {
                console.error('Error updating task:', error);
                alert('Failed to update task');
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
                console.error('Error updating task status:', error);
            }
        },

        async deleteTask(taskId, eventId) {
            if (!confirm('Are you sure you want to delete this task?')) return;

            try {
                console.log('Attempting to delete task:', { taskId, eventId });
                await axios.delete(`/api/tasks/${taskId}`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                });
          
                await this.fetchEvent();
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        },
    
        async deleteEvent() {
            if (!confirm('Are you sure you want to delete this event?')) return;
        
            try {
                await axios.delete(`/api/events/${this.$route.params.id}`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                });
          
                this.$router.push('/dashboard');
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    },

    mounted() {
        this.fetchEvent();
    
        // Listen for task creation
        socket.on('taskCreated', (task) => {
            console.log('Socket: Task created', task);
            if (task.event === this.$route.params.id) {
                console.log('task matches current event updating...');
                this.fetchEvent();
            }
        });

        // Listen for task updates
        socket.on('taskUpdated', (updatedTask) => {
            console.log('Socket: Task updated', updatedTask);
            if (updatedTask.event === this.$route.params.id) {
                console.log('task update matches current event updating...');
                this.fetchEvent();
            }
        });

        // Listen for task deletions
        socket.on('taskDeleted', ({eventId, taskId}) => {
            console.log('Socket: recieve taskDeleted event:', { eventId, taskId });

            if (eventId === this.$route.params.id && this.event?.tasks) {
                console.log('task belogs to current event updating local state');
                this.event.tasks = this.event.tasks.filter(t => t._id !== taskId);
                //this.fetchEvent();
            }
        });

        socket.on('eventDeleted', ({ eventId }) => {
          console.log("Socket received eventDeleted event:", eventId);
          // If the current event is deleted, redirect to events list
          if (eventId === this.$route.params.id) {
            console.log("Current event was deleted, redirecting...");
            this.$router.push('/events');
          }
        });

        socket.on('connect', () => {
            console.log('Socket connected');
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    }, 
    beforeUnmount() {
        console.log('Component unmounting, removing socket listeners');
        socket.off('taskCreated');
        socket.off('taskUpdated');
        socket.off('taskDeleted');
        socket.off('connect');
        socket.off('disconnect');
    },
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

  .navbar {
    background-color: var(--secondary-bg);
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .task-meta {
    margin: 1rem 0;
    color: var(--text-secondary);
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
    justify-content: flex-end;
  }
  
  .task-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 0.5rem;
    background-color: var(--primary-bg);
    border: 1px solid #444;
    border-radius: 4px;
    color: white;
  }

  .form-group textarea {
    min-height: 100px;
    resize: vertical;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  /* Modal styling */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    z-index: 1000;
  }

  .modal-content {
    background-color: var(--secondary-bg);
    border-radius: 8px;
    padding: 2rem;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-content h2 {
    margin-bottom: 1.5rem;
  }
</style>