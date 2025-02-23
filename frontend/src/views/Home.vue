<template>
    <div class="home">
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-content">
          <h1>EventsMadeEasy</h1>
          <p>Streamline your hybrid team collaboration with our event management platform</p>
          <div class="hero-buttons">
            <router-link to="/login" class="btn btn-primary">Get Started</router-link>
            <a href="#features" class="btn btn-secondary">Learn More</a>
          </div>
        </div>
      </div>
  
      <!-- Features Section -->
      <div id="features" class="features">
        <h2>Key Features</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <h3>Real-time Collaboration</h3>
            <p>Work together seamlessly with instant updates and live task management</p>
          </div>
          <div class="feature-card">
            <h3>Task Management</h3>
            <p>Create, assign, and track tasks for your team members effortlessly</p>
          </div>
          <div class="feature-card">
            <h3>Hybrid Events</h3>
            <p>Manage both in-person and remote participants with ease</p>
          </div>
          <div class="feature-card">
            <h3>Team Communication</h3>
            <p>Keep everyone in the loop with integrated communication tools</p>
          </div>
        </div>
      </div>
  
      <!-- Call to Action -->
      <div class="cta">
        <h2>Ready to get started?</h2>
        <p>Join teams already using EventsMadeEasy to improve their collaboration</p>
        <router-link to="/login" class="btn btn-primary">Start Now</router-link>
      </div>
    </div>
  </template>
  
<script>
  export default {
    name: 'Home'
  }
</script>
  
<style scoped>
  .home {
    min-height: 100vh;
  }
  
  .hero {
    height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background-color: var(--primary-bg);
    padding: 2rem;
  }
  
  .hero-content {
    max-width: 800px;
  }
  
  .hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    color: var(--accent-color);
  }
  
  .hero p {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    color: #ffffff;
  }
  
  .hero-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  .features {
    padding: 4rem 2rem;
    background-color: var(--secondary-bg);
  }
  
  .features h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
  }
  
  .feature-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }
  
  .feature-card {
    background-color: var(--primary-bg);
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
  }
  
  .feature-card h3 {
    color: var(--accent-color);
    margin-bottom: 1rem;
  }
  
  .cta {
    padding: 4rem 2rem;
    text-align: center;
    background-color: var(--primary-bg);
  }
  
  .cta h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  .cta p {
    margin-bottom: 2rem;
    font-size: 1.2rem;
  }
  
  .btn {
    display: inline-block;
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
    transition: background-color 0.3s;
  }
  
  .btn-primary {
    background-color: var(--accent-color);
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #2563eb;
  }
  
  .btn-secondary {
    background-color: transparent;
    border: 2px solid var(--accent-color);
    color: var(--accent-color);
  }
  
  .btn-secondary:hover {
    background-color: var(--accent-color);
    color: white;
  }
  
  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2.5rem;
    }
  
    .hero p {
      font-size: 1.2rem;
    }
  
    .features h2,
    .cta h2 {
      font-size: 2rem;
    }
  }
</style>