<template>
  <main class="main">
    <!-- Input Block -->
    <section class="card input-card">
      <p class="intro-text">
        Offline RAG: AI-Powered Answers Across Docs, CSV, Images & Voice.
      </p>
      <div class="input-group">
        <div class="file-input-wrapper">
          <label>Upload File</label>
          <div class="file-input-field">
            <input type="file" @change="handleFileUpload" :accept="acceptedTypes" ref="fileInput" />
            <span class="file-name" v-if="file">{{ file.name }}</span>
            <span class="file-name placeholder" v-else>Drag or Click here to upload File...</span>
            <button
              type="button"
              class="mic-btn"
              :class="{ recording: isRecording }"
              @click="toggleRecording"
              title="Record Audio"
            >
              <svg v-if="!isRecording" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="mic-icon">
                <path d="M12 2C10.9 2 10 2.9 10 4V13C10 14.1 10.9 15 12 15C13.1 15 14 14.1 14 13V4C14 2.9 13.1 2 12 2ZM18 11V12C18 15.31 15.31 18 12 18C8.69 18 6 15.31 6 12V11H4V12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12V11H18Z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="mic-icon recording-icon">
                <path d="M12 2C10.9 2 10 2.9 10 4V13C10 14.1 10.9 15 12 15C13.1 15 14 14.1 14 13V4C14 2.9 13.1 2 12 2ZM18 11V12C18 15.31 15.31 18 12 18C8.69 18 6 15.31 6 12V11H4V12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12V11H18Z" />
                <circle cx="12" cy="12" r="8" opacity="0.4" /> <!-- Pulse effect for recording -->
              </svg>
            </button>
          </div>
        </div>

        <!-- 📸 File Preview -->
        <div v-if="previewUrl || textPreview" class="preview-container">
          <h3 class="preview-title">📂 File Preview:</h3>

          <!-- Image preview -->
          <img v-if="isImage" :src="previewUrl" class="file-preview-img" />

          <!-- Audio preview -->
          <audio v-else-if="isAudio" :src="previewUrl" controls class="file-preview-audio"></audio>

          <!-- PDF preview -->
          <iframe v-else-if="isPdf" :src="previewUrl" class="file-preview-pdf"></iframe>

          <!-- Text / CSV preview -->
          <pre v-else-if="isTextOrCsv" class="file-preview-text">{{ textPreview }}</pre>

          <!-- Fallback -->
          <p v-else class="file-preview-name">
            {{ file.value?.name }} (Preview not supported)
          </p>
        </div>

        <div>
          <label>Your Query</label>
          <div class="file-input-field">
          <input  style="border:none; outline:none;"
            type="text"
            v-model="query"
            placeholder="e.g., 'Summarize this document' or 'Describe the image'"
          />
          </div>
        </div>
      </div>

      <button :disabled="!file || !query" @click="processFile" class="process-button">
        🧠 Process File
      </button>
    </section>

    <!-- Output Block -->
    <section class="card output-card">
      <h2 class="response-title">Response</h2>
      <div class="response-box">
        <p><strong>Query:</strong> {{ query }}</p>
        <p class="response-text">{{ response || 'Your result will appear here after processing.' }}</p>
      </div>
      <audio v-if="audioUrl" :src="audioUrl" controls class="audio-player"></audio>
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const PROCESS_ENDPOINT = `${API_BASE_URL}/api/process`

// --- Reactive state ---
const file = ref(null)
const query = ref('')
const response = ref('')
const audioUrl = ref('')
const previewUrl = ref('')
const textPreview = ref('')
const acceptedTypes = '.pdf,.txt,.csv,.png,.jpg,.jpeg,.mp3,.wav'
const fileInput = ref(null); // Ref for the actual file input element

// --- Recording state ---
const isRecording = ref(false)
const mediaRecorder = ref(null)
const recordedChunks = ref([])
const recordedBlob = ref(null)
const recordedAudioUrl = ref(null)

const isImage = computed(() => file.value && file.value.type.startsWith('image/'))
const isAudio = computed(() => file.value && file.value.type.startsWith('audio/'))
const isPdf = computed(() => file.value && file.value.type === 'application/pdf')
const isTextOrCsv = computed(() =>
  file.value && (file.value.type.startsWith('text/') || file.value.name.endsWith('.csv'))
)
// --- 🎙️ Toggle Mic Button ---
const toggleRecording = () => {
  if (!isRecording.value) {
    startRecording()
  } else {
    stopRecording()
  }
}


// --- File Preview Logic ---
const handleFileUpload = (e) => {
  file.value = e.target.files[0]
  textPreview.value = ''
  previewUrl.value = ''
  if (!file.value) return

  if (isImage.value || isAudio.value || isPdf.value) {
    previewUrl.value = URL.createObjectURL(file.value)
  } else if (isTextOrCsv.value) {
    const reader = new FileReader()
    reader.onload = (event) => {
      textPreview.value = event.target.result
        .split('\n')
        .slice(0, 10)
        .join('\n')
    }
    reader.readAsText(file.value)
  }
}

// --- 🎙️ Start Recording (real WAV support) ---
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    recordedChunks.value = []
    mediaRecorder.value = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    mediaRecorder.value.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.value.push(e.data)
    }
    mediaRecorder.value.onstop = convertToWav
    mediaRecorder.value.start()
    isRecording.value = true
  } catch (err) {
    alert('Microphone access denied or not available.')
    console.error(err)
  }
}

// --- 🛑 Stop Recording ---
const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
  }
}

// --- 🔄 Convert recorded WebM to real WAV ---
const convertToWav = async () => {
  const webmBlob = new Blob(recordedChunks.value, { type: 'audio/webm' })
  const arrayBuffer = await webmBlob.arrayBuffer()

  // Decode using AudioContext
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

  // Convert to WAV
  const wavBlob = encodeWAV(audioBuffer)

  recordedBlob.value = wavBlob
  recordedAudioUrl.value = URL.createObjectURL(wavBlob)

  // Treat as a file (real .wav)
  file.value = new File([wavBlob], 'recorded_audio.wav', { type: 'audio/wav' })
  previewUrl.value = recordedAudioUrl.value
}

// --- Helper: Encode WAV from AudioBuffer ---
function encodeWAV(audioBuffer) {
  const numOfChan = audioBuffer.numberOfChannels
  const length = audioBuffer.length * numOfChan * 2 + 44
  const buffer = new ArrayBuffer(length)
  const view = new DataView(buffer)

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  let offset = 0
  writeString(view, offset, 'RIFF'); offset += 4
  view.setUint32(offset, 36 + audioBuffer.length * numOfChan * 2, true); offset += 4
  writeString(view, offset, 'WAVE'); offset += 4
  writeString(view, offset, 'fmt '); offset += 4
  view.setUint32(offset, 16, true); offset += 4
  view.setUint16(offset, 1, true); offset += 2
  view.setUint16(offset, numOfChan, true); offset += 2
  view.setUint32(offset, audioBuffer.sampleRate, true); offset += 4
  view.setUint32(offset, audioBuffer.sampleRate * numOfChan * 2, true); offset += 4
  view.setUint16(offset, numOfChan * 2, true); offset += 2
  view.setUint16(offset, 16, true); offset += 2
  writeString(view, offset, 'data'); offset += 4
  view.setUint32(offset, audioBuffer.length * numOfChan * 2, true); offset += 4

  // Write interleaved PCM samples
  let interleaved = audioBuffer.getChannelData(0)
  let pos = offset
  for (let i = 0; i < interleaved.length; i++, pos += 2) {
    let s = Math.max(-1, Math.min(1, interleaved[i]))
    view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }

  return new Blob([view], { type: 'audio/wav' })
}

const resolveBackendUrl = (path) => {
  if (!path) return ''
  try {
    return new URL(path, `${API_BASE_URL}/`).toString()
  } catch {
    return ''
  }
}

// --- 🧠 Process File ---
const processFile = async () => {
  if (!file.value || !query.value) return

  response.value = ''
  audioUrl.value = ''

  const formData = new FormData()
  formData.append('file', file.value)
  formData.append('query', query.value)

  try {
    const res = await axios.post(PROCESS_ENDPOINT, formData)
    response.value = res.data.response
    audioUrl.value = resolveBackendUrl(res.data.audio_url)
  } catch (err) {
    console.error(err)
    const detail = err?.response?.data?.detail
    alert(detail ? `Error processing file: ${detail}` : 'Error processing file.')
  }
}
</script>

<style scoped>
.file-input-wrapper {
  margin-bottom: 20px;
}

.file-input-field {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #444;
  border-radius: 6px;
  background-color: #333;
  color: white;
  padding: 0; /* Remove default padding to control inner elements */
  height: 42px; /* Set a fixed height for consistency */
}

.file-input-field input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1; /* Make it clickable */
}

.file-name {
  flex-grow: 1;
  padding: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
  z-index: 0; /* Behind the actual file input */
  pointer-events: none; /* Allow clicks to pass through */
}

.file-name.placeholder {
  color: #888;
}

.mic-btn {
  background: none; /* No background */
  color: #60a5fa; /* Icon color */
  border: none;
  border-radius: 0 6px 6px 0; /* Only right corners rounded */
  font-size: 0; /* Hide default emoji */
  width: 42px;
  height: 40px; /* Adjust height to fit nicely */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.3s ease, background-color 0.3s ease;
  flex-shrink: 0;
  z-index: 2; /* Make mic button clickable over file input */
}

.mic-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #93c5fd;
}

.mic-btn.recording {
  color: #dc2626; /* Recording color */
  animation: none; /* Remove pulse on button itself */
  position: relative;
}

.mic-btn.recording:hover {
  background-color: rgba(220, 38, 38, 0.1);
  color: #ef4444;
}

.mic-icon {
  width: 24px;
  height: 24px;
  fill: currentColor; /* Use the parent's color */
}

.recording-icon circle {
  animation: mic-pulse 1.5s infinite ease-out; /* Apply pulse to the circle */
  transform-origin: center;
}

@keyframes mic-pulse {
  0% { transform: scale(0.5); opacity: 0.6; }
  50% { transform: scale(1); opacity: 0.1; }
  100% { transform: scale(0.5); opacity: 0.6; }
}


/* --- General Styles (Kept as is or slightly adjusted) --- */

.main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  color: white;
}

.card {
  background-color: #1f1f1f;
  padding: 30px;
  border-radius: 12px;
  border: 2px solid #2563eb;
  margin-bottom: 30px;
  box-shadow: 0 0 10px rgba(0,0,0,0.4);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
  margin: 30px;
}

.input-group label {
  margin-bottom: 6px;
  font-weight: bold;
  display: block; /* Ensure label is on its own line */
}

.input-group input[type="text"] {
  padding: 10px;
  width: 100%;
  background-color: #333;
  color: white;
  border: 1px solid #444;
  border-radius: 6px;
  font-size: 16px;
}

.process-button {
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #2563eb;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.process-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.response-title {
  color: #60a5fa;
  font-size: 26px;
  margin-bottom: 12px;
}

.response-box {
  background-color: #2a2a2a;
  padding: 20px;
  border-radius: 6px;
}

.response-text {
  margin-top: 10px;
  line-height: 1.6;
}

.audio-player {
  margin-top: 20px;
  width: 100%;
}

.preview-container {
  background-color: #2a2a2a;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 12px;
  margin-top: 10px;
  text-align: center;
}

.preview-title {
  color: #93c5fd;
  font-weight: 600;
  margin-bottom: 10px;
}

.file-preview-img {
  max-width: 100%;
  border-radius: 8px;
  border: 2px solid #444;
}

.file-preview-pdf {
  width: 100%;
  height: 400px;
  border: none;
}

.file-preview-audio {
  width: 100%;
}

.file-preview-text {
  background: #1e1e1e;
  color: #cbd5e1;
  padding: 12px;
  border-radius: 6px;
  text-align: left;
  font-size: 14px;
  overflow-x: auto;
  max-height: 300px;
}

.file-preview-name {
  color: #ddd;
  font-style: italic;
}

.intro-text {
  text-align: center;
  margin-bottom: 20px;
  font-size: 26px;
  color: #60a5fa;
  font-weight: 600;
  line-height: 1.3;
  margin-left: auto;
  margin-right: auto;
}
</style>
