<template>
  <button :class="classes" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary' // primary, secondary, primary-sm, secondary-sm, tab-ghost, nav-primary, nav-secondary
  }
})

defineEmits(['click'])

const classes = computed(() => {
  const base = 'inline-flex items-center justify-center transition-all font-medium cursor-pointer'
  switch (props.variant) {
    case 'primary':
      return `${base} bg-primary text-on-primary text-[16px] rounded-pill px-lg h-[48px] hover:opacity-80`
    case 'secondary':
      return `${base} bg-canvas text-ink text-[16px] rounded-pill px-lg h-[48px] border border-hairline shadow-level-1 hover:bg-canvas-soft`
    case 'primary-sm':
      return `${base} bg-primary text-on-primary text-[14px] rounded-pill px-md h-[32px] hover:opacity-80`
    case 'secondary-sm':
      return `${base} bg-canvas text-ink text-[14px] rounded-pill px-md h-[32px] border border-hairline shadow-level-1 hover:bg-canvas-soft`
    case 'nav-primary':
      return `${base} bg-primary text-on-primary text-[14px] rounded-sm px-sm h-[28px] hover:opacity-80`
    case 'nav-secondary':
      return `${base} bg-canvas text-ink text-[14px] rounded-sm px-sm h-[28px] border border-hairline hover:bg-canvas-soft`
    case 'tab-ghost':
      return `${base} bg-transparent text-body text-[14px] rounded-pill-sm px-md h-[32px] hover:bg-canvas-soft hover:text-ink`
    default:
      return base
  }
})
</script>
