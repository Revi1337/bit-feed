<template>
  <dialog 
    ref="dialogRef" 
    closedby="any" 
    @close="close" 
    class="modal-dialog bg-canvas w-full max-w-2xl mx-4 md:mx-auto rounded-xl shadow-level-5 flex-col max-h-[90vh] overflow-hidden p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
  >
    <!-- Header -->
    <div class="px-lg py-md border-b border-hairline flex items-center justify-between">
      <slot name="header">
        <h2 class="text-xl font-semibold">Title</h2>
      </slot>
      <button @click="close" class="p-2 -mr-2 rounded-full hover:bg-canvas-soft text-mute hover:text-ink transition-colors" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Body -->
    <div class="p-lg overflow-y-auto">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="px-lg py-md border-t border-hairline flex justify-end gap-sm">
      <slot name="footer" />
    </div>
  </dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const dialogRef = ref(null)

const syncDialogState = (isOpen) => {
  const dialog = dialogRef.value
  if (!dialog) return
  
  if (isOpen && !dialog.open) {
    dialog.showModal()
  } else if (!isOpen && dialog.open) {
    dialog.close()
  }
}

watch(() => props.isOpen, (newVal) => {
  syncDialogState(newVal)
})

onMounted(() => {
  syncDialogState(props.isOpen)
})

const close = () => {
  emit('close')
}
</script>

<style scoped>
/* Base dialog styling */
.modal-dialog {
  margin: auto;
  border: none;
  /* transition behavior for animating display/overlay */
  transition: 
    display 0.3s allow-discrete, 
    overlay 0.3s allow-discrete, 
    opacity 0.3s ease, 
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  transform: scale(0.95);
}

.modal-dialog[open] {
  opacity: 1;
  transform: scale(1);
  display: flex; /* Override native display: block to keep flex-col */
}

@starting-style {
  .modal-dialog[open] {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Backdrop styling */
.modal-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  transition: 
    display 0.3s allow-discrete, 
    overlay 0.3s allow-discrete, 
    opacity 0.3s ease;
  opacity: 0;
}

.modal-dialog[open]::backdrop {
  opacity: 1;
}

@starting-style {
  .modal-dialog[open]::backdrop {
    opacity: 0;
  }
}
</style>
