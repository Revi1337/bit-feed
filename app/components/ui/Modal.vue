<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center">
        <!-- Backdrop -->
        <div class="backdrop absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />

        <!-- Modal Container -->
        <div class="modal-container relative bg-canvas w-full max-w-2xl mx-4 md:mx-auto rounded-xl shadow-level-5 flex flex-col max-h-[90vh] overflow-hidden">
          
          <!-- Header -->
          <div class="px-lg py-md border-b border-hairline flex items-center justify-between">
            <slot name="header">
              <h2 class="text-xl font-semibold">Title</h2>
            </slot>
            <button @click="close" class="p-2 -mr-2 rounded-full hover:bg-canvas-soft text-mute hover:text-ink transition-colors">
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
          <div v-if="$slots.footer" class="px-lg py-md border-t border-hairline bg-canvas-soft flex justify-end gap-sm">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
/* Backdrop transition */
.modal-enter-active .backdrop,
.modal-leave-active .backdrop {
  transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
}
.modal-enter-from .backdrop,
.modal-leave-to .backdrop {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* Modal content transition */
.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  opacity: 0;
  transform: scale(0.95);
}
</style>
