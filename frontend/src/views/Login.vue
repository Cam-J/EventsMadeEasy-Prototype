<template>
    <div class="login-container">
      <div class="login-card">
        <h2>Login to EventsMadeEasy</h2>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              v-model="email" 
              required
              placeholder="Enter your email"
            >
          </div>
          <div class="form-group">
            <label>Password</label>
            <input 
              type="password" 
              v-model="password" 
              required
              placeholder="Enter your password"
            >
          </div>
          <div class="error-message" v-if="error">
            {{ error }}
          </div>
          <button type="submit" class="login-btn" :disabled="isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'Login',
    data() {
      return {
        email: '',
        password: '',
        error: null,
        isLoading: false
      }
    },
    methods: {
      async handleLogin() {
        this.error = null;
        this.isLoading = true;
  
        try {
          const response = await axios.post('/api/users/login', {
            email: this.email,
            password: this.password
          });
  
          // Store token and user data
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
  
          // Redirect to dashboard
          this.$router.push('/dashboard');
        } catch (error) {
          this.error = error.response?.data?.message || 'Failed to login. Please try again.';
        } finally {
          this.isLoading = false;
        }
      }
    }
  }
</script>
  
<style scoped>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1a1a1a;
    padding: 1rem;
  }
  
  .login-card {
    background-color: #2d2d2d;
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    color: white;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    color: white;
    font-size: 0.9rem;
  }
  
  input {
    padding: 0.75rem;
    border: 1px solid #444;
    border-radius: 4px;
    background-color: #333;
    color: white;
    font-size: 1rem;
  }
  
  input:focus {
    outline: none;
    border-color: #3b82f6;
  }
  
  .login-btn {
    background-color: #3b82f6;
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .login-btn:hover:not(:disabled) {
    background-color: #2563eb;
  }
  
  .login-btn:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
  
  .error-message {
    color: #dc2626;
    font-size: 0.9rem;
    text-align: center;
  }
</style>