<template>
  <dialog
    ref="dialogRef"
    @click="handleBackdropClick"
    @cancel.prevent="close"
    :class="['modal-dialog bg-canvas w-full max-w-2xl mx-4 md:mx-auto rounded-xl shadow-level-5 flex-col max-h-[90vh] overflow-hidden p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm', { 'is-closing': isClosing }]"
  >
    <!-- Header -->
    <div class="px-lg py-md border-b border-hairline flex items-center justify-between">
      <slot name="header">
        <h2 class="text-xl font-semibold">Title</h2>
      </slot>
      <button @click="close" class="p-2 -mr-2 rounded-full hover:bg-canvas-soft text-mute hover:text-ink transition-colors focus:outline-none" aria-label="Close">
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
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const dialogRef = ref(null)
// 닫힘 애니메이션이 재생되는 동안 true. [open]을 유지한 채 시각적으로만 사라지게 한다.
const isClosing = ref(false)

let closeFallbackTimer = null

const TRANSITION_MS = 200

const finishClose = () => {
  const dialog = dialogRef.value
  clearTimeout(closeFallbackTimer)
  if (dialog) {
    dialog.removeEventListener('transitionend', onDialogTransitionEnd)
    if (dialog.open) dialog.close()
  }
  isClosing.value = false
}

const onDialogTransitionEnd = (e) => {
  // 다이얼로그 본체(opacity)의 트랜지션만 처리. 자식 요소에서 버블링된 이벤트는 무시.
  if (e.target !== dialogRef.value || e.propertyName !== 'opacity') return
  finishClose()
}

const syncDialogState = (isOpen) => {
  const dialog = dialogRef.value
  if (!dialog) return

  if (isOpen) {
    // 닫히는 도중 다시 열리면 진행 중인 닫힘 애니메이션을 취소한다.
    clearTimeout(closeFallbackTimer)
    dialog.removeEventListener('transitionend', onDialogTransitionEnd)
    isClosing.value = false
    if (!dialog.open) dialog.showModal()
  } else if (dialog.open && !isClosing.value) {
    // top-layer에 남긴 채(=[open] 유지) 닫힘 애니메이션을 재생하고, 끝난 뒤 실제로 close().
    // 이렇게 해야 애니메이션 도중 top-layer에서 빠져 깜빡이거나 끊기는 현상을 막을 수 있다.
    isClosing.value = true
    dialog.addEventListener('transitionend', onDialogTransitionEnd)
    // transitionend가 발생하지 않는 환경(prefers-reduced-motion 등) 대비 폴백
    closeFallbackTimer = setTimeout(finishClose, TRANSITION_MS + 50)
  }
}

watch(() => props.isOpen, (newVal) => {
  syncDialogState(newVal)
})

onMounted(() => {
  syncDialogState(props.isOpen)
})

onBeforeUnmount(() => {
  clearTimeout(closeFallbackTimer)
})

// 닫기 요청은 항상 부모의 isOpen을 통해서만 처리한다(단일 경로 → 중복 close 방지).
const close = () => {
  emit('close')
}

// iOS Safari 백드롭 클릭 버그 방지 및 모달 닫기
const handleBackdropClick = (e) => {
  if (e.target === dialogRef.value) {
    close()
  }
}
</script>

<style scoped>
/* Base dialog styling */
.modal-dialog {
  margin: auto;
  border: none;
  /* 순수 opacity 페이드. scale을 쓰지 않으므로 '크기가 계단처럼 끊겨 보이는' 현상 자체가 없다.
     opacity는 compositor 전용 속성이라 어떤 기기에서도 매끄럽다. */
  transition: opacity 0.2s ease;
  opacity: 0;
}

.modal-dialog[open] {
  opacity: 1;
  display: flex; /* Override native display: block to keep flex-col */
}

/* 닫힘 애니메이션: [open](top-layer)을 유지한 채 시각적으로만 사라지게 한다 */
.modal-dialog[open].is-closing {
  opacity: 0;
}

@starting-style {
  .modal-dialog[open] {
    opacity: 0;
  }
}

/* Backdrop styling */
.modal-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  transition: opacity 0.2s ease;
  opacity: 0;
}

.modal-dialog[open]::backdrop {
  opacity: 1;
}

.modal-dialog[open].is-closing::backdrop {
  opacity: 0;
  /* 닫힘 페이드 중에는 blur를 끈다. backdrop-filter는 매 프레임 재계산돼
     프레임 드랍(끊김)의 실제 원인이므로, 사라지는 동안에는 비활성화한다. */
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

@starting-style {
  .modal-dialog[open]::backdrop {
    opacity: 0;
  }
}
</style>
