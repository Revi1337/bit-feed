<template>
  <span :class="classes">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'secondary' // secondary, primary, outline
  }
})

const classes = computed(() => {
  const base = 'inline-flex items-center justify-center text-[12px] font-normal leading-[16px] px-xs rounded-full whitespace-nowrap'
  switch (props.variant) {
    case 'secondary':
      return `${base} bg-canvas-soft-2 text-body border border-hairline`
    case 'primary':
      return `${base} bg-primary text-on-primary border border-transparent`
    case 'outline':
      return `${base} bg-transparent text-body border border-hairline`
    default:
      return `${base} bg-canvas-soft-2 text-body`
  }
})
</script>
