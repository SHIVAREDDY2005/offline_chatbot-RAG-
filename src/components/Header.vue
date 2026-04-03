<template>
  <header class="header">
    <div class="header-container">
      <h1 class="app-title">🧠 Multi-Model RAG</h1>
      <nav>
        <ul class="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup></script>

<style scoped>
.header {
    height:70px;
  background-color: #1e1e1e; /* Softer dark gray */
  box-shadow: 0 2px 4px rgba(0,0,0,0.5);
  padding-left:50px;
  padding-right:50px;
}
.header-container {
  width:100%;
  display: flex;
  justify-content: space-between;
  
}
.app-title {
  color: #60a5fa;
  font-size: 24px;
  font-weight: bold;
  weight:100%;
}
.nav-links {
  list-style: none;
  display: flex;
  gap: 20px;
}
.nav-links a {
  color: white;
  text-decoration: none;
}
.nav-links a:hover {
  color: #60a5fa;
}
</style>
