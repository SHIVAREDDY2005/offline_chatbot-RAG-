<template>
  <div class="chat-box">
    <div v-for="(msg, index) in messages" :key="index" class="message">
      <strong>{{ msg.sender }}:</strong> {{ msg.text }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  messages: Array
})
</script>

<style scoped>
.chat-box {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 16px;
  height: 400px;
  overflow-y: auto;
}
.message {
  margin: 8px 0;
}
</style>
