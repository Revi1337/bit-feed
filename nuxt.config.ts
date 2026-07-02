// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      buildVersion: Date.now().toString()
    }
  },
  experimental: {
    viewTransition: true
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  },
  srcDir: 'app/',
  css: ['~/assets/css/tailwind.css'],
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // self-host 폰트를 첫 페인트 전에 받아 swap으로 인한 Layout Shift를 없앤다.
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/inter-latin-var.woff2', crossorigin: '' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/jetbrains-mono-latin.woff2', crossorigin: '' }
      ]
    }
  },
  // nitro: {
  //   vercel: {
  //     regions: ['icn1'] // 서울 리전으로 설정하여 워싱턴 D.C. 라우팅 방지, 우선순위에 밀려 vercel.json으로 대체
  //   }
  // }
})
