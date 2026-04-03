<template>
  <div class="app">
    <Header />
    <MainContainer />
    <Footer />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import MainContainer from './components/MainContainer.vue'
import Footer from './components/Footer.vue'
</script>

<style>
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #121212;
}
</style>
