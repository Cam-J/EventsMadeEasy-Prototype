import axios from 'axios';
import router from '../router';

const instance = axios.create({
    baseURL: 'http://localhost:5000'
});

// Add a request interceptor to add the token to all requests
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// return users to login when token expires
instance.interceptors.response.use(
    response => response,
    error => {
        // Check if the error is due to an unauthorized request (likely token expiration)
        if (error.response && error.response.status === 401) {
            // Remove the token from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to login page
            router.push('/login');
        }
        
        // Return the error to be handled by the calling function
        return Promise.reject(error);
    }
);        

export default instance;