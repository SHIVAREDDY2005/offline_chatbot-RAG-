<template>
  <div class="input-container">
    <input
      v-model="input"
      @keyup.enter="send"
      placeholder="Type your message..."
    />
    <button @click="send">Send</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const input = ref('')
const emit = defineEmits(['send'])

const send = () => {
  if (input.value.trim() === '') return
  emit('send', input.value)
  input.value = ''
}
</script>

<style scoped>
.input-container {
  display: flex;
  margin-top: 16px;
}
input {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
button {
  margin-left: 8px;
  padding: 10px 20px;
  border: none;
  background-color: #42b983;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}
</style>
