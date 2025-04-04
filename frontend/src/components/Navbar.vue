<template>
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/" custom v-slot="{ navigate }">
            <span @click="navigate" role="link">EventsMadeEasy</span>
          </router-link>
        </div>
        
        <div class="nav-links">
          <router-link to="/" custom v-slot="{ navigate }"class="nav-link">
            <span @click="navigate" role="link">Home</span>
          </router-link>
          
          <router-link to="/dashboard" custom v-slot="{ navigate }" class="nav-link">
            <span @click="navigate" role="link">Dashboard</span>
          </router-link>
          
          <router-link to="/events" custom v-slot="{ navigate }" class="nav-link">
            <span @click="navigate" role="link">Events</span>
          </router-link>
          
          <router-link to="/tasks" custom v-slot="{ navigate }"class="nav-link">
            <!--<span @click="navigate" role="link">Tasks</span>-->
          </router-link>

          <router-link v-if="isAdmin" to="/admin" custom v-slot="{ navigate }"class="nav-link admin-link">
            <span @click="navigate" role="link">Admin Panel</span>
          </router-link>
          
          <template v-if="isLoggedIn">
            <button @click="handleLogout" class="logout-btn">Logout</button>
          </template>
          <template v-else>
            <router-link 
              to="/login" 
              custom 
              v-slot="{ navigate }"
              class="btn btn-primary"
            >
              <span @click="navigate" role="link">Login</span>
            </router-link>
          </template>
        </div>
      </div>
    </nav>
</template>
  
<script>
  export default {
    name: 'Navbar',
    computed: {
      isLoggedIn() {
        return !!localStorage.getItem('token')
      },

      isAdmin() {
        // Check if logged-in user is an admin
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user).role === 'admin' : false;
      }
    },
    methods: {
      async handleLogout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        await this.$router.push('/')
        window.location.reload() // Force a page reload
      }
    }
  }
</script>

<style scoped>
    .navbar {
  background-color: #1a1a1a;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid #333;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand .brand-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  transition: color 0.3s ease;
}

.nav-brand .brand-link:hover {
  color: #60a5fa;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

.router-link-active {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

.logout-btn {
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background-color: #b91c1c;
}

.login-btn {
  background-color: #3b82f6;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.login-btn:hover {
  background-color: #2563eb;
}

/* Responsive design */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .nav-brand .brand-link {
    font-size: 1.2rem;
  }
}

@media (max-width: 640px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>