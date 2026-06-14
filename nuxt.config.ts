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
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  nitro: {
    serverAssets: [
      {
        baseName: 'data',
        dir: 'public/data'
      }
    ],
    vercel: {
      regions: ['icn1'] // 서울 리전으로 설정하여 워싱턴 D.C. 라우팅 방지
    }
  }
})
