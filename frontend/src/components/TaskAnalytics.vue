<template>
    <div class="analytics-container">
      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="metric-card">
          <div class="metric-header">
            <h3>Total Tasks</h3>
          </div>
          <div class="metric-value">{{ totalTasks }}</div>
        </div>
  
        <div class="metric-card">
          <div class="metric-header">
            <h3>Completed</h3>
          </div>
          <div class="metric-value">
            {{ completedTasks }}
            <div class="metric-subtext">
              {{ completionRate }}% completion rate
            </div>
          </div>
        </div>
  
        <div class="metric-card">
          <div class="metric-header">
            <h3>Pending</h3>
          </div>
          <div class="metric-value">{{ pendingTasks }}</div>
        </div>
  
        <div class="metric-card">
          <div class="metric-header">
            <h3>Due Soon</h3>
          </div>
          <div class="metric-value">{{ dueSoonTasks }}</div>
        </div>
      </div>
  
      <!-- Status Breakdown -->
      <div class="breakdown-section">
        <h3>Task Status</h3>
        <div class="progress-container">
          <div 
            class="progress-bar"
            :style="{ width: `${completionRate}%` }"
          >
            {{ completionRate }}%
          </div>
        </div>
      </div>
  
      <!-- Priority Distribution -->
      <div class="breakdown-section">
        <h3>Priority Distribution</h3>
        <div class="priority-grid">
          <div class="priority-item">
            <div class="priority-label">High</div>
            <div class="priority-bar-container">
              <div 
                class="priority-bar high"
                :style="{ width: `${priorityPercentages.high}%` }"
              >
                {{ priorityCounts.high || 0 }}
              </div>
            </div>
          </div>
          <div class="priority-item">
            <div class="priority-label">Medium</div>
            <div class="priority-bar-container">
              <div 
                class="priority-bar medium"
                :style="{ width: `${priorityPercentages.medium}%` }"
              >
                {{ priorityCounts.medium || 0 }}
              </div>
            </div>
          </div>
          <div class="priority-item">
            <div class="priority-label">Low</div>
            <div class="priority-bar-container">
              <div 
                class="priority-bar low"
                :style="{ width: `${priorityPercentages.low}%` }"
              >
                {{ priorityCounts.low || 0 }}
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Upcoming Tasks -->
      <div class="breakdown-section">
        <h3>Upcoming Tasks</h3>
        <div class="upcoming-tasks">
          <div 
            v-for="task in upcomingTasks" 
            :key="task._id" 
            class="upcoming-task-item"
          >
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-due">Due: {{ formatDate(task.dueDate) }}</div>
            </div>
            <div :class="['priority-tag', task.priority]">
              {{ task.priority }}
            </div>
          </div>
          <div v-if="!upcomingTasks.length" class="no-tasks">
            No upcoming tasks
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script>
export default {
  name: 'TaskAnalytics',
  props: {
    event: {
      type: Object,
      required: true
    }
  },

  computed: {
    totalTasks() {
      return this.event?.tasks?.length || 0;
    },
    completedTasks() {
      return this.event?.tasks?.filter(task => task.status === 'completed').length || 0;
    },
    pendingTasks() {
      return this.event?.tasks?.filter(task => task.status === 'pending').length || 0;
    },
    completionRate() {
      if (!this.totalTasks) return 0;
      return Math.round((this.completedTasks / this.totalTasks) * 100);
    },
    dueSoonTasks() {
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      const now = new Date();
      return this.event?.tasks?.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate > now && dueDate - now <= oneWeek && task.status !== 'completed';
      }).length || 0;
    },
    priorityCounts() {
      const counts = { high: 0, medium: 0, low: 0 };
      if (!this.event?.tasks) return counts;
    
      this.event.tasks.forEach(task => {
        counts[task.priority] = (counts[task.priority] || 0) + 1;
      });
        
      return counts;
    },
    priorityPercentages() {
      const percentages = { high: 0, medium: 0, low: 0 };
      if (!this.totalTasks) return percentages;
      
      Object.keys(this.priorityCounts).forEach(priority => {
        percentages[priority] = Math.round((this.priorityCounts[priority] / this.totalTasks) * 100);
      });
      
      return percentages;
    },
    upcomingTasks() {
      if (!this.event?.tasks) return [];
      
      const now = new Date();
      return this.event.tasks
        .filter(task => {
          const dueDate = new Date(task.dueDate);
          return dueDate > now && task.status !== 'completed';
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5); // Show only next 5 upcoming tasks
    }
  },

  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    }
  }
};
</script>
  
<style scoped>
  .analytics-container {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
  
  .metric-card {
    background-color: var(--secondary-bg);
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
  }
  
  .metric-header h3 {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }
  
  .metric-value {
    font-size: 2rem;
    font-weight: 600;
  }
  
  .metric-subtext {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }
  
  .breakdown-section {
    background-color: var(--secondary-bg);
    padding: 1.5rem;
    border-radius: 8px;
  }
  
  .breakdown-section h3 {
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }
  
  .progress-container {
    height: 2rem;
    background-color: var(--primary-bg);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-bar {
    height: 100%;
    background-color: #4CAF50;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: width 0.3s ease;
  }
  
  .priority-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .priority-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .priority-label {
    width: 80px;
  }
  
  .priority-bar-container {
    flex: 1;
    height: 2rem;
    background-color: var(--primary-bg);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .priority-bar {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    color: white;
    transition: width 0.3s ease;
  }
  
  .priority-bar.high {
    background-color: #f44336;
  }
  
  .priority-bar.medium {
    background-color: #ff9800;
  }
  
  .priority-bar.low {
    background-color: #4CAF50;
  }
  
  .upcoming-tasks {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .upcoming-task-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--primary-bg);
    border-radius: 4px;
  }
  
  .task-info {
    flex: 1;
  }
  
  .task-title {
    font-weight: 500;
  }
  
  .task-due {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }
  
  .priority-tag {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    text-transform: capitalize;
  }
  
  .priority-tag.high {
    background-color: #f44336;
  }
  
  .priority-tag.medium {
    background-color: #ff9800;
  }
  
  .priority-tag.low {
    background-color: #4CAF50;
  }
  
  .no-tasks {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
  }
  
  @media (max-width: 768px) {
    .summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 480px) {
    .summary-grid {
      grid-template-columns: 1fr;
    }
  }
</style>