<template>
    <div class="registration-container">
        <div class="registration-card">
            <h2>Create an Account</h2>
            <form @submit.prevent="handleRegistration" class="registration-form">
                <div class="form-group">
                <label>Username</label>
                <input type="username" v-model="username" required placeholder="Enter a username">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" v-model="email" required placeholder="Enter your email">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" v-model="password" required placeholder="Create a password" minlength="6">
                </div>
                <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" v-model="confirmPassword" required placeholder="Confirm your password" minlength="6">
                </div>
                <div class="form-group">
                    <label>
                    <input 
                        type="checkbox" 
                        v-model="termsConsent"
                        required
                    >
                    I agree to the data processing terms
                    </label>
                </div>
                <div class="error-message" v-if="error">
                    {{ error }}
                </div>
                <button type="submit" class="registration-btn" :disabled="isLoading">
                    {{ isLoading ? 'Creating Account...' : 'Register' }}
                </button>
            </form>
            <div class="login-link">
                Already have an account? 
                <router-link to="/login">Login</router-link>
            </div>
        </div>
    </div>

    <!-- GDPR Consent Modal -->
    <div v-if="showGDPRModal" class="modal">
        <div class="modal-content">
            <h2>Data Processing Consent</h2>
            <div class="gdpr-content">
                <p>Before creating an account, please read and understand the following data processing terms:</p>
                
                <h3>What We Collect</h3>
                <ul>
                <li>Your email address</li>
                <li>Number of projects/events you create</li>
                </ul>

                <h3>Administrator Access</h3>
                <p>Administrators of this platform will have the ability to:</p>
                <ul>
                <li>View your email address</li>
                <li>See the total number of projects/events associated with your account</li>
                <li>Manage user roles</li>
                </ul>

                <h3>Your Rights</h3>
                <ul>
                <li>You can request account deletion at any time</li>
                <li>You have the right to request a copy of your personal data</li>
                <li>You can withdraw consent and request data removal</li>
                </ul>

                <div class="consent-actions">
                    <button @click="acceptGDPRTerms" class="btn btn-primary">I Understand and Consent</button>
                    <button @click="declineGDPRTerms" class="btn btn-danger">Decline</button>
                </div>
            </div>
        </div>
    </div>
    
</template>
  
<script>
import axios from 'axios';

export default {
    name: 'Registration',
    data() {
        return {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            error: null,
            isLoading: false,
            termsConsent: false,
            showGDPRModal: true
        }
    },

    methods: {
        acceptGDPRTerms() {
            this.showGDPRModal = false;
            this.termsConsent = true;
        },

        declineGDPRTerms() {
            this.showGDPRModal = false;
            this.termsConsent = false;
            this.error = 'You must accept the data processing terms to create an account.';
        },

        async handleRegistration() {
            // Reset previous errors
            this.error = null;

            // Validate password match
            if (this.password !== this.confirmPassword) {
                this.error = 'Passwords do not match';
                return;
            }

            // Validate password strength (optional, but recommended)
            if (this.password.length < 6) {
                this.error = 'Password must be at least 6 characters long';
                return;
            }

            // Validate terms consent
            if (!this.termsConsent) {
                this.error = 'You must accept the data processing terms';
                return;
            }

            this.isLoading = true;

            try {
                const response = await axios.post('/api/users/register', {
                username: this.username,
                email: this.email,
                password: this.password
                });

                // Redirect to login
                this.$router.push('/login');
            } catch (error) {
                this.error = error.response?.data?.message || 'Registration failed. Please try again.';
            } finally {
                this.isLoading = false;
            }
        }
    },

    mounted() {
        this.showGDPRModal = true;
    },
}
</script>
  
<style scoped>
.registration-container {
min-height: 100vh;
display: flex;
align-items: center;
justify-content: center;
background-color: #1a1a1a;
padding: 1rem;
}

.registration-card {
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

.registration-form {
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

.registration-btn {
background-color: #3b82f6;
color: white;
padding: 0.75rem;
border: none;
border-radius: 4px;
font-size: 1rem;
cursor: pointer;
transition: background-color 0.3s;
}

.registration-btn:hover:not(:disabled) {
background-color: #2563eb;
}

.registration-btn:disabled {
background-color: #666;
cursor: not-allowed;
}

.error-message {
color: #dc2626;
font-size: 0.9rem;
text-align: center;
}

.login-link {
text-align: center;
margin-top: 1rem;
color: white;
}

.login-link a {
color: #3b82f6;
text-decoration: none;
margin-left: 0.25rem;
}

.login-link a:hover {
text-decoration: underline;
}
</style>