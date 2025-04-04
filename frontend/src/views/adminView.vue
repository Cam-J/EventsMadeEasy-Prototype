<template>
    <div class="user-management-container">
      <h1>User Management</h1>
      
      <!-- User Stats -->
      <div class="user-stats">
        <div class="stat-card">
          <h3>Total Users</h3>
          <p class="stat-number">{{ users.length }}</p>
        </div>
        <div class="stat-card">
          <h3>Admin Users</h3>
          <p class="stat-number">{{ adminUserCount }}</p>
        </div>
      </div>
      
      <!-- User List -->
      <div class="user-list-container">
        <table class="user-list-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Total Events</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.eventCount || 0 }}</td>
              <td class="actions">
                <button 
                  v-if="user.role === 'user' && user._id !== currentUserId" 
                  class="btn btn-primary" 
                  @click="initiateRoleChange(user, 'admin')"
                >
                  Make Admin
                </button>
                <button 
                  v-if="user.role === 'admin' && user._id !== currentUserId" 
                  class="btn btn-secondary" 
                  @click="initiateRoleChange(user, 'user')"
                >
                  Remove Admin
                </button>
                <button 
                  v-if="user._id !== currentUserId" 
                  class="btn btn-danger" 
                  @click="confirmDeleteUser(user)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Role Change Confirmation Modal -->
      <div v-if="showRoleChangeModal" class="modal">
        <div class="modal-content">
          <h2>Confirm Role Change</h2>
          <p>Are you sure you want to change the role of {{ userForRoleChange?.email }} to {{ userForRoleChange?.newRole }}?</p>
          <div class="modal-actions">
            <button @click="cancelRoleChange" class="btn">Cancel</button>
            <button @click="confirmRoleChangeAction" class="btn btn-primary">Confirm</button>
          </div>
        </div>
      </div>
      
      <!-- Deletion Confirmation Modal -->
      <div v-if="showConfirmModal" class="modal">
        <div class="modal-content">
          <h2>Confirm Delete</h2>
          <p>Are you sure you want to delete the user {{ userToDelete?.email }}?</p>
          <div class="modal-actions">
            <button @click="showConfirmModal = false" class="btn">Cancel</button>
            <button @click="deleteUser" class="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </template>
    
<script>
    import axios from '../services/axios.js';
    
    export default {
        name: 'UserManagement',
        data() {
            return {
                users: [],
                showConfirmModal: false,
                showRoleChangeModal: false,
                userToDelete: null,
                userForRoleChange: null,
                currentUserId: null
            }
        },
  
        computed: {
        adminUserCount() {
            return this.users.filter(user => user.role === 'admin').length;
        }
        },
  
    methods: {
        async fetchUsers() {
            try {
                const response = await axios.get('/api/admin/users');
                this.users = response.data.users;
                
                // Get current user ID from localStorage
                const user = JSON.parse(localStorage.getItem('user'));
                this.currentUserId = user?.id;
            } catch (error) {
                console.error('Error fetching users:', error);
                alert('Failed to fetch users. You may not have permission.');
            }
        },
    
        initiateRoleChange(user, newRole) {
        this.userForRoleChange = user;
        this.userForRoleChange.newRole = newRole;
        this.showRoleChangeModal = true;
    },

        cancelRoleChange() {
            this.showRoleChangeModal = false;
            this.userForRoleChange = null;
        },

        async confirmRoleChangeAction() {
            if (!this.userForRoleChange) return;

            try {
                const response = await axios.put(`/api/admin/${this.userForRoleChange._id}/role`, {
                role: this.userForRoleChange.newRole
            });

            // Update the user's role
            const updatedUser = response.data.user;
            const userIndex = this.users.findIndex(u => u._id === updatedUser.id);
            
            if (userIndex !== -1) {
                this.users[userIndex].role = updatedUser.role;
            }

            // Close the modal
            this.showRoleChangeModal = false;
            this.userForRoleChange = null;
            } catch (error) {
                console.error('Error updating user role:', error);
                alert('Failed to update user role');
                this.cancelRoleChange();
            }
        },
  
        confirmDeleteUser(user) {
            this.userToDelete = user;
            this.showConfirmModal = true;
        },
  
        async deleteUser() {
            if (!this.userToDelete) return;
        
            try {
                await axios.delete(`/api/admin/${this.userToDelete._id}`);
            
                // Remove user from the list
                this.users = this.users.filter(u => u._id !== this.userToDelete._id);
            
                // Close modal
                this.showConfirmModal = false;
                this.userToDelete = null;
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user');
            }
        }
    },
  
    mounted() {
      this.fetchUsers();
    }
}
</script>
    
<style scoped>
  .user-management-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  h1 {
    color: var(--text-color);
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .user-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background-color: var(--secondary-bg);
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: var(--accent-color);
  }
  
  .user-list-container {
    background-color: var(--secondary-bg);
    border-radius: 8px;
    overflow-x: auto;
  }
  
  .user-list-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .user-list-table th,
  .user-list-table td {
    border-bottom: 1px solid var(--primary-bg);
    padding: 1rem;
    text-align: left;
  }
  
  .user-list-table th {
    background-color: var(--primary-bg);
    color: var(--text-color);
  }
  
  .actions {
    text-align: center;
    display: flex;
    gap: 0.5rem;
    justify-content: center;
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
    z-index: 1000;
  }
  
  .modal-content {
    background-color: var(--secondary-bg);
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    text-align: center;
  }
  
  .modal-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }
</style>