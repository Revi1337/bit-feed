<template>
  <header class="sticky top-0 z-50 w-full h-[64px] bg-canvas border-b border-hairline flex items-center px-md md:px-lg relative">
    <!-- Logo -->
    <NuxtLink to="/" class="flex items-center gap-2 z-10">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stop-color="var(--color-primary)" />
              <stop offset="1" stop-color="var(--color-primary)" stop-opacity="0.8"/>
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#logo-grad)"/>
          <rect x="9.5" y="8" width="3" height="16" rx="1.5" fill="white"/>
          <circle cx="16.5" cy="18.5" r="4.5" stroke="white" stroke-width="3"/>
          <circle cx="21.5" cy="10" r="2" fill="white"/>
        </svg>
      </div>
      <span class="font-bold text-[18px] tracking-tight">bit-feed</span>
    </NuxtLink>

    <!-- Navigation -->
    <nav class="absolute left-1/2 -translate-x-1/2 flex items-center gap-md md:gap-lg">
      <NuxtLink to="/new" class="nav-link text-[15px] transition-colors" data-text="What's New">
        What's New
      </NuxtLink>
      <NuxtLink to="/all" class="nav-link text-[15px] transition-colors" data-text="All Updates">
        All Updates
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup>
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
nav a:not(.router-link-exact-active):hover {
  color: var(--color-ink);
}
</style>
