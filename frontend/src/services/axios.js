import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000'
});

// Add a request interceptor to add the token to all requests
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;