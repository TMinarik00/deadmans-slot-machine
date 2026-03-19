<!--
  Reusable modal component with overlay, entrance animation, and slots.
  Usage: <BaseModal @close="..."><template #header>Title</template>Body content</BaseModal>
-->
<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal" :class="`modal--${size}`">
        <div v-if="$slots.header" class="modal-header">
          <h2 class="modal-title"><slot name="header" /></h2>
          <button class="modal-close" @click="$emit('close')">&times;</button>
        </div>
        <div class="modal-body" :class="{ 'modal-body--center': center }">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  center: { type: Boolean, default: false },
  size: { type: String, default: "md", validator: (v) => ["sm", "md", "lg"].includes(v) },
});
defineEmits(["close"]);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
  animation: overlayIn 0.2s ease;
}

@keyframes overlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
  animation: modalIn 0.25s ease-out;
}

.modal--sm { max-width: 360px; }
.modal--md { max-width: 460px; }
.modal--lg { max-width: 580px; }

@keyframes modalIn {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: none; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  color: var(--color-gold);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.15s;
}
.modal-close:hover { color: var(--color-text); }

.modal-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-body--center {
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
}

.modal-footer {
  padding: 0 1.5rem 1.25rem;
}

@media (max-width: 480px) {
  .modal { border-radius: 12px; }
  .modal-body { padding: 1rem; }
  .modal-header { padding: 0.9rem 1rem; }
  .modal-footer { padding: 0 1rem 1rem; }
}
</style>
