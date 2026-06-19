<template>
  <header class="sticky top-0 z-50 w-full h-[64px] bg-canvas/80 backdrop-blur-md border-b border-hairline flex items-center px-md md:px-lg relative">
    <!-- Logo -->
    <NuxtLink to="/" class="flex items-center gap-2 z-10 shrink-0">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stop-color="var(--color-primary)" />
              <stop offset="1" stop-color="var(--color-primary)" stop-opacity="0.8"/>
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#logo-grad)"/>
          <rect x="9.5" y="8" width="3" height="16" rx="1.5" fill="var(--color-on-primary)"/>
          <circle cx="16.5" cy="18.5" r="4.5" stroke="var(--color-on-primary)" stroke-width="3"/>
          <circle cx="21.5" cy="10" r="2" fill="var(--color-on-primary)"/>
        </svg>
      </div>
      <span class="font-bold text-[18px] tracking-tight hidden sm:block">bit-feed</span>
    </NuxtLink>

    <!-- Navigation -->
    <nav class="flex-1 md:flex-none flex items-center justify-start md:justify-center gap-4 md:gap-lg ml-4 md:ml-0 md:absolute md:left-1/2 md:-translate-x-1/2 overflow-x-auto no-scrollbar">
      <NuxtLink to="/new" class="nav-link text-[14px] md:text-[15px] transition-colors whitespace-nowrap" data-text="최신 소식">
        최신 소식
      </NuxtLink>
      <NuxtLink to="/all" class="nav-link text-[14px] md:text-[15px] transition-colors whitespace-nowrap" data-text="모든 소식">
        모든 소식
      </NuxtLink>
    </nav>
    <!-- Right Actions -->
    <div class="ml-auto flex items-center z-10 gap-1 md:gap-2">
      <!-- Theme Toggle -->
      <button @click="$colorMode.preference = $colorMode.value === 'dark' ? 'light' : 'dark'" class="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-md hover:bg-canvas-soft transition-colors text-body hover:text-ink" aria-label="Toggle Dark Mode">
        <ClientOnly>
          <svg v-if="$colorMode.value === 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <template #fallback>
            <div class="w-[18px] h-[18px]"></div>
          </template>
        </ClientOnly>
      </button>

      <!-- Mobile Filter Toggle -->
      <button v-if="isFeedPage" @click="mobileFilterOpen = !mobileFilterOpen" class="md:hidden w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-md hover:bg-canvas-soft transition-colors text-body hover:text-ink">
        <svg v-if="!mobileFilterOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useState } from '#imports'

const route = useRoute()
const isFeedPage = computed(() => ['/new', '/all'].includes(route.path))
const mobileFilterOpen = useState('mobileFilterOpen', () => false)
</script>

<style scoped>
.nav-link {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 텍스트 굵기 변경으로 인한 레이아웃 쉬프트(Layout Shift) 방지 기법 */
.nav-link::after {
  content: attr(data-text);
  font-weight: 600;
  height: 0;
  visibility: hidden;
  overflow: hidden;
  user-select: none;
  pointer-events: none;
}

.router-link-exact-active {
  color: var(--color-primary);
  font-weight: 600;
}
nav a:not(.router-link-exact-active) {
  color: var(--color-mute);
  font-weight: 500;
}
nav a:hover {
  color: var(--color-ink);
}
</style>
