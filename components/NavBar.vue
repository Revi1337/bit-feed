<template>
  <header class="sticky top-0 z-50 w-full h-[64px] bg-canvas border-b border-hairline flex items-center justify-between px-md md:px-lg">
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary font-bold">
        b
      </div>
      <span class="font-bold text-[18px] tracking-tight">bit-feed</span>
    </div>

    <!-- Center Links -->
    <nav class="hidden md:flex items-center gap-sm">
      <NuxtLink to="/" class="text-[14px] text-body hover:bg-canvas-soft hover:text-ink px-sm py-xs rounded-full transition-colors">Featured</NuxtLink>
      <NuxtLink to="/" class="text-[14px] text-body hover:bg-canvas-soft hover:text-ink px-sm py-xs rounded-full transition-colors">Categories</NuxtLink>
      <NuxtLink to="/" class="text-[14px] text-body hover:bg-canvas-soft hover:text-ink px-sm py-xs rounded-full transition-colors">About</NuxtLink>
    </nav>

    <!-- Right Actions -->
    <div class="flex items-center gap-sm">
      <UiButton variant="nav-secondary" class="hidden sm:inline-flex">Log In</UiButton>
      <UiButton variant="nav-primary">Sign Up</UiButton>
    </div>
  </header>
</template>

<script setup>
import UiButton from '~/components/ui/Button.vue'
</script>
