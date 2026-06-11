/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/components/**/*.{js,vue,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/plugins/**/*.{js,ts}",
    "./app/app.vue",
    "./app/error.vue"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#171717',
        'on-primary': '#ffffff',
        cyan: '#50e3c2',
        'highlight-pink': '#ff0080',
        violet: '#7928ca',
        link: '#0070f3',
        canvas: '#ffffff',
        'canvas-soft': '#fafafa',
        'canvas-soft-2': '#f5f5f5',
        hairline: '#ebebeb',
        'hairline-strong': '#a1a1a1',
        ink: '#171717',
        body: '#4d4d4d',
        mute: '#888888',
        success: '#0070f3',
        error: '#ee0000',
        warning: '#f5a623'
      },
      fontFamily: {
        sans: ['Inter', 'Satoshi', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        'pill-sm': '64px',
        pill: '100px',
        full: '9999px',
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '40px',
        '3xl': '48px',
        '4xl': '64px',
        '5xl': '96px',
        '6xl': '128px',
        section: '192px',
      },
      boxShadow: {
        'level-1': '0 0 0 1px #00000014 inset',
        'level-2': '0px 1px 1px #00000005, 0px 2px 2px #0000000a, 0 0 0 1px #00000014 inset',
        'level-3': '0px 2px 2px #0000000a, 0px 8px 8px -8px #0000000a, 0 0 0 1px #00000014 inset',
        'level-4': '0px 2px 2px #0000000a, 0px 8px 16px -4px #0000000a, 0 0 0 1px #00000014 inset',
        'level-5': '0px 1px 1px #00000005, 0px 8px 16px -4px #0000000a, 0px 24px 32px -8px #0000000f, 0 0 0 1px #00000014 inset',
      }
    },
  },
  plugins: [],
}
