import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue error:', err)
  console.error('Error info:', info)
}

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

app.use(router)
app.mount('#app')
