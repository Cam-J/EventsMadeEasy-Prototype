<template>
    <div class="dashboard">
      <!-- Main Content -->
      <div class="main-container">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stats-card">
            <h3>Upcoming Events</h3>
            <p class="stats-number">{{ eventCount }}</p>
          </div>
          <div class="stats-card">
            <h3>Pending Tasks</h3>
            <p class="stats-number">{{ pendingTasks || 0 }}</p>
            <!--<p>debug: tasks count = {{ pendingTasks }}</p>-->
          </div>
          <div class="stats-card">
            <h3>Team Members - Future development</h3>
            <p class="stats-number">{{ teamMemberCount }}</p>
          </div>
        </div>
  
        <!-- Events List -->
        <div class="events-section">
          <h2>My Events</h2>
          <div class="events-grid">
            <div v-if="events.length === 0" class="no-events">
              No events found. Create your first event!
              <button class="btn btn-primary" @click="showCreateEventForm = true">New Event</button>
            </div>
            <div v-for="event in events" :key="event._id" class="event-card">
              <h3>{{ event.title }}</h3>
              <p>{{ event.description }}</p>
              <p class="event-date">{{ formatDate(event.date) }}</p>
              <button class="btn btn-primary" @click="viewEvent(event._id)">View Details</button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Create Event Modal -->
      <div v-if="showCreateEventForm" class="modal">
        <div class="modal-content">
          <h2>Create New Event</h2>
          <form @submit.prevent="createEvent">
            <div class="form-group">
              <label>Title</label>
              <input v-model="newEvent.title" required>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="newEvent.description" required></textarea>
            </div>
            <div class="form-group">
              <label>Date</label>
              <input type="datetime-local" v-model="newEvent.date" required>
            </div>
            <div class="form-group">
              <label>Location</label>
              <input v-model="newEvent.location" required>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-danger" @click="showCreateEventForm = false">Cancel</button>
              <button type="submit" class="btn btn-primary">Create Event</button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>
  
<script>
  import axios from 'axios';
  import { io } from 'socket.io-client';
  
  export default {
    data() {
      return {
        events: [],
        eventCount: 0,
        pendingTasks: 0,
        teamMemberCount: 0,
        socketInstance: null,
        showCreateEventForm: false,
        newEvent: {
          title: '',
          description: '',
          date: '',
          location: ''
        }
      }
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
        // fetch events for my events and events counter
        async fetchEvents() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    // Redirect to login if no token is found
                    this.$router.push('/login');
                    return;
                }

                const response = await axios.get('/api/events', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                this.events = response.data;
                this.eventCount = response.data.length;
            } catch (error) {
                console.error('Error fetching events:', {
                    response: error.response,
                    request: error.request,
                    message: error.message,
                    config: error.config
                });
                
                // Handle unauthorized error
                if (error.response && error.response.status === 401) {
                    // Clear token and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    this.$router.push('/login');
                }
            }
        },
        // fetch tasks for pending tasks counter
        async fetchTasks() {
            try {
                const token = localStorage.getItem('token');
                console.log('Fetching Tasks - Token', !!token);

                const response = await axios.get('/api/tasks', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('Tasks response', response.data);

                //assuming the backend returns the number of pending tasks
                this.pendingTasks = response.data.pendingTasksCount || 0;
            } catch (error) {
                console.error('Error fetching tasks:', error);
                this.pendingTasks = 0;
            }
        },

        async createEvent() {
            try {

                if (!this.newEvent.title || !this.newEvent.date) {
                    alert('Please fill in all required fields');
                    return;
                }
                
                await axios.post('/api/events', this.newEvent, {
                    headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                this.showCreateEventForm = false;
                this.newEvent = { title: '', description: '', date: '', location: '' };
                await this.fetchEvents();

                } catch (error) {
                console.error('Error creating event:', error);
                alert('Failed to create event');
                }
            },
        viewEvent(eventId) {
            this.$router.push(`/events/${eventId}`);
        },
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.$router.push('/login');
        }
    },
    mounted() {
        this.fetchEvents();
        this.fetchTasks();
        console.log('initial pending tasks:', this.pendingTasks);
        // Initialize socket connection
        this.socketInstance = io('http://localhost:5000');
        
        this.socketInstance.on('connect', () => {
        console.log('Connected to Socket.IO server');
        });

        this.socketInstance.on('eventCreated', () => {
        this.fetchEvents();
        });
    },
    beforeUnmount() {
        if (this.socketInstance) {
        this.socketInstance.disconnect();
        }
    }
}
</script>
  
<style scoped>
  .dashboard {
    min-height: 100vh;
  }
  
  .navbar {
    background-color: var(--secondary-bg);
    padding: 1rem 0;
  }
  
  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .nav-buttons {
    display: flex;
    gap: 1rem;
  }
  
  .main-container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .stats-card {
    background-color: var(--secondary-bg);
    padding: 1.5rem;
    border-radius: 8px;
  }
  
  .stats-number {
    font-size: 2rem;
    font-weight: bold;
    color: var(--accent-color);
  }
  
  .events-section {
    background-color: var(--secondary-bg);
    padding: 1.5rem;
    border-radius: 8px;
  }
  
  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }
  
  .event-card {
    background-color: var(--primary-bg);
    padding: 1.5rem;
    border-radius: 8px;
  }
  
  .event-date {
    color: var(--accent-color);
    margin: 0.5rem 0;
  }
  
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
  }
  
  .modal-content {
    background-color: var(--secondary-bg);
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  input, textarea {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.25rem;
    background-color: var(--primary-bg);
    border: 1px solid #444;
    border-radius: 4px;
    color: white;
  }
  
  textarea {
    min-height: 100px;
    resize: vertical;
  }
</style>