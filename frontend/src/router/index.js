import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import EventDetails from '../views/EventDetails.vue'
import Events from '../views/Events.vue'
import Tasks from '../views/Tasks.vue'
import Registration from '../views/Registration.vue'
import UserManagement from '../views/adminView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    //meta: { requiresAuth: true }
  },
  {
    path: '/events',
    name: 'Events',
    component: Events,
    //meta: { requiresAuth: true }
  },
  {
    path: '/events/:id',
    name: 'EventDetails',
    component: EventDetails,
    //meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks,
    //meta: { requiresAuth: true }
  },
  {
    path: '/registration',
    name: 'Registration',
    component: Registration,
    //meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'UserManagement',
    component: UserManagement,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  
  // Check if authentication is required
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } 
  // Check if admin access is required
  else if (to.meta.requiresAdmin && (!user || user.role !== 'admin')) {
    next('/dashboard')
  } 
  // Redirect authenticated users from login/register
  else if ((to.path === '/login' || to.path === '/register') && token) {
    next('/dashboard')
  } 
  else {
    next()
  }
})

export default router