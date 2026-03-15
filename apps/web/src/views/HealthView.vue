<!--
  Health Check page - Cycle 0.
  Calls GET /api/health on mount and displays API + DB status.
  This proves the full stack is wired together: Vue → Express → PostgreSQL.
-->
<template>
  <div class="health-page">
    <div class="health-card">
      <h1 class="title">Vockice</h1>
      <p class="subtitle">Wild West Slot Machine</p>

      <div class="status-section">
        <h2>System Status</h2>

        <div v-if="loading" class="status-item">
          <span class="dot dot--loading"></span>
          Checking...
        </div>

        <template v-else-if="health">
          <div class="status-item">
            <span class="dot" :class="health.status === 'ok' ? 'dot--ok' : 'dot--error'"></span>
            API: {{ health.status }}
          </div>
          <div class="status-item">
            <span class="dot" :class="health.database === 'connected' ? 'dot--ok' : 'dot--error'"></span>
            Database: {{ health.database }}
          </div>
          <p class="timestamp">{{ health.timestamp }}</p>
        </template>

        <div v-else class="status-item">
          <span class="dot dot--error"></span>
          API unreachable
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const health = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch("/api/health");
    health.value = await res.json();
  } catch {
    health.value = null;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.health-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a0f0a;
  font-family: "Inter", sans-serif;
  color: #f5e6d0;
}

.health-card {
  background: #2a1a10;
  border: 2px solid #8b6914;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 0 40px rgba(139, 105, 20, 0.3);
}

.title {
  font-family: "Rye", serif;
  font-size: 3rem;
  color: #d4a020;
  margin: 0;
}

.subtitle {
  color: #a08060;
  margin: 0.5rem 0 2rem;
  font-size: 1.1rem;
}

.status-section h2 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #a08060;
  margin-bottom: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  margin: 0.5rem 0;
  justify-content: center;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.dot--ok { background: #4ade80; }
.dot--error { background: #f87171; }
.dot--loading { background: #facc15; animation: pulse 1s infinite; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.timestamp {
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: #666;
}
</style>
