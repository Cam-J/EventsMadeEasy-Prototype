<template>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>Tasks Overview</h1>
        <div class="view-toggle">
          <button 
            @click="viewMode = 'list'"
            :class="{ active: viewMode === 'list' }"
            class="btn"
          >List View</button>
          <button 
            @click="viewMode = 'board'"
            :class="{ active: viewMode === 'board' }"
            class="btn"
          >Board View</button>
        </div>
      </div>
  
      <!-- Filters -->
      <div class="filters">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search tasks..."
          @input="filterTasks"
        >
        <select v-model="statusFilter" @change="filterTasks">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select v-model="priorityFilter" @change="filterTasks">
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
  
      <!-- List View -->
      <div v-if="viewMode === 'list'" class="tasks-list">
        <div v-for="task in filteredTasks" :key="task._id" class="task-card">
          <div class="task-header">
            <h3>{{ task.title }}</h3>
            <span :class="['priority-badge', task.priority]">
              {{ task.priority }}
            </span>
          </div>
          <p>{{ task.description }}</p>
          <div class="task-meta">
            <span>Event: {{ getEventName(task.event) }}</span>
            <span>Due: {{ formatDate(task.dueDate) }}</span>
          </div>
          <div class="task-footer">
            <select v-model="task.status" @change="updateTaskStatus(task)">
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button @click="deleteTask(task)" class="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>
  
      <!-- Board View -->
      <div v-else class="tasks-board">
        <div v-for="status in ['pending', 'in-progress', 'completed']" 
             :key="status" 
             class="board-column">
          <h3 class="column-header">{{ formatStatus(status) }}</h3>
          <div class="column-content">
            <div v-for="task in getTasksByStatus(status)" 
                 :key="task._id" 
                 class="task-card">
              <div class="task-header">
                <h3>{{ task.title }}</h3>
                <span :class="['priority-badge', task.priority]">
                  {{ task.priority }}
                </span>
              </div>
              <p>{{ task.description }}</p>
              <div class="task-meta">
                <span>Due: {{ formatDate(task.dueDate) }}</span>
              </div>
              <div class="task-footer">
                <button @click="deleteTask(task)" class="btn btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
  
<script>
import axios from 'axios';
  
export default {
    name: 'Tasks',
    data() {
        return {
            tasks: [],
            filteredTasks: [],
            events: {}, // Cache for event details
            viewMode: 'list',
            searchQuery: '',
            statusFilter: '',
            priorityFilter: ''
        }
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },

        formatStatus(status) {
            return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        },

        async fetchTasks() {
            try {
            const response = await axios.get('/api/tasks', {
                headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.tasks = response.data;
            this.filteredTasks = response.data;
            this.fetchEventDetails();
            } catch (error) {
            console.error('Error fetching tasks:', error);
            }
        },

        async fetchEventDetails() {
            const eventIds = [...new Set(this.tasks.map(task => task.event))];
            for (const eventId of eventIds) {
            try {
                const response = await axios.get(`/api/events/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
                });
                this.events[eventId] = response.data;
            } catch (error) {
                console.error(`Error fetching event ${eventId}:`, error);
            }
            }
        },

        getEventName(eventId) {
            return this.events[eventId]?.title || 'Unknown Event';
        },

        filterTasks() {
            let filtered = [...this.tasks];
            
            if (this.searchQuery) {
                filtered = filtered.filter(task => 
                    task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    task.description.toLowerCase().includes(this.searchQuery.toLowerCase())
                );
            }
            
            if (this.statusFilter) {
                filtered = filtered.filter(task => task.status === this.statusFilter);
            }
            
            if (this.priorityFilter) {
                filtered = filtered.filter(task => task.priority === this.priorityFilter);
            }
            
            this.filteredTasks = filtered;
        },

        getTasksByStatus(status) {
            return this.filteredTasks.filter(task => task.status === status);
        },

        async updateTaskStatus(task) {
            try {
                await axios.patch( `http://localhost:5000/api/events/${task.event}/tasks/${task._id}`,
                    { status: task.status },
                    { headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }}
                );
            } catch (error) {
                console.error('Error updating task:', error);
                // Revert status if update fails
                task.status = task.status;
            }
        },
        async deleteTask(task) {
            if (!confirm('Are you sure you want to delete this task?')) return;
            
            try {
                await axios.delete(`http://localhost:5000/api/events/${task.event}/tasks/${task._id}`,
                    { headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }}
                );
                this.tasks = this.tasks.filter(t => t._id !== task._id);
                this.filterTasks();
            } catch (error) {
            console.error('Error deleting task:', error);
            }
        }
    },
    mounted() {
      this.fetchTasks();
    }
  }
</script>
  
<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
}

.btn.active {
  background-color: #007bff;
  color: white;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tasks-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.board-column {
  background-color: #f4f4f4;
  border-radius: 8px;
  padding: 1rem;
}

.task-card {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.priority-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.priority-badge.high { background-color: #ff6b6b; color: white; }
.priority-badge.medium { background-color: #feca57; color: black; }
.priority-badge.low { background-color: #48dbfb; color: white; }
</style>