<template>
    <div class="container">
      <div class="header">
        <h1>Events</h1>
        <button @click="showCreateEventForm = true" class="btn btn-primary">Create New Event</button>
      </div>
  
      <!-- Event Filters -->
      <div class="filters">
        <div class="search">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search events..."
            @input="filterEvents"
          >
        </div>
        <div class="filter-options">
          <select v-model="statusFilter" @change="filterEvents">
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
  
      <!-- Events Grid -->
      <div class="events-grid">
        <div v-for="event in filteredEvents" :key="event._id" class="event-card">
          <div class="event-status" :class="event.status">{{ event.status }}</div>
          <h3>{{ event.title }}</h3>
          <p>{{ event.description }}</p>
          <div class="event-details">
            <p>📅 Deadline: {{ formatDate(event.date) }}</p>
            <p>📍 {{ event.location }}</p>
          </div>
          <div class="event-actions">
            <router-link :to="`/events/${event._id}`" class="btn btn-secondary">View Details</router-link>
            <button @click="deleteEvent(event._id)" class="btn btn-danger">Delete</button>
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
              <button type="button" @click="showCreateEventForm = false" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Create Event</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
<script>
  import axios from 'axios';
  
  export default {
    name: 'Events',
    data() {
      return {
        events: [],
        filteredEvents: [],
        showCreateEventForm: false,
        searchQuery: '',
        statusFilter: '',
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
      async fetchEvents() {
        try {
          const response = await axios.get('/api/events', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          this.events = response.data;
          this.filteredEvents = response.data;
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      },
      filterEvents() {
        let filtered = [...this.events];
        
        // Apply search filter
        if (this.searchQuery) {
          filtered = filtered.filter(event => 
            event.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        }
        
        // Apply status filter
        if (this.statusFilter) {
          filtered = filtered.filter(event => event.status === this.statusFilter);
        }
        
        this.filteredEvents = filtered;
      },
      async createEvent() {
        try {
          const response = await axios.post('/api/events', this.newEvent, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          this.events.push(response.data);
          this.filterEvents();
          this.showCreateEventForm = false;
          this.newEvent = { title: '', description: '', date: '', location: '' };
        } catch (error) {
          console.error('Error creating event:', error);
          alert('Failed to create event');
        }
      },
      async deleteEvent(eventId) {
        if (!confirm('Are you sure you want to delete this event?')) return;
        
        try {
          await axios.delete(`/api/events/${eventId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          this.events = this.events.filter(event => event._id !== eventId);
          this.filterEvents();
        } catch (error) {
          console.error('Error deleting event:', error);
          alert('Failed to delete event');
        }
      }
    },
    mounted() {
      this.fetchEvents();
    }
  }
</script>
  
<style scoped>
  .container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  a {
    color: inherit;
    text-decoration: underline;
  }
  
  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .search input,
  .filter-options select {
    padding: 0.5rem;
    border: 1px solid #444;
    border-radius: 4px;
    background-color: var(--secondary-bg);
    color: white;
  }
  
  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .event-card {
    background-color: var(--secondary-bg);
    padding: 1.5rem;
    border-radius: 8px;
    position: relative;
  }
  
  .event-status {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }
  
  .event-status.upcoming { background-color: #2196F3; }
  .event-status.in-progress { background-color: #FF9800; }
  .event-status.completed { background-color: #4CAF50; }
  
  .event-details {
    margin: 1rem 0;
  }
  
  .event-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
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
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  .form-group input,
  .form-group textarea {
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
</style>