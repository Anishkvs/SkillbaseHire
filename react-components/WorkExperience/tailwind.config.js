/** @type {import('tailwindcss').Config} */
// Merge these extensions into your root tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        sbh: {
          'page':         '#F0F2F7',
          'white':        '#FFFFFF',
          'border':       '#E2E8F0',
          'border-2':     '#CBD5E1',
          'text':         '#1A202C',
          'muted':        '#4A5568',
          'subtle':       '#94A3B8',
          'accent':       '#4F46E5',
          'accent-lt':    '#EEF2FF',
          'green':        '#16A34A',
          'green-lt':     '#DCFCE7',
          'amber':        '#D97706',
          'amber-lt':     '#FEF3C7',
          'red':          '#DC2626',
          'red-lt':       '#FEE2E2',
        },
      },
      borderRadius: {
        'card':   '12px',
        'panel':  '8px',
        'input':  '6px',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)',
        'card-md': '0 4px 12px rgba(0,0,0,.10)',
        'dropdown':'0 8px 24px rgba(0,0,0,.12)',
        'modal':   '0 24px 64px rgba(0,0,0,.20)',
        'accent':  '0 4px 12px rgba(79,70,229,.30)',
      },
      keyframes: {
        dpOpen: {
          '0%':   { opacity: '0', transform: 'scaleY(.85) translateY(-4px)' },
          '100%': { opacity: '1', transform: 'scaleY(1)  translateY(0)' },
        },
        dpSlideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px) scale(.97)' },
          '100%': { opacity: '1', transform: 'translateY(0)     scale(1)'   },
        },
        fadeSlideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        'dpOpen':        'dpOpen .15s cubic-bezier(.16,1,.3,1) both',
        'dpSlideDown':   'dpSlideDown .18s cubic-bezier(.16,1,.3,1) both',
        'fadeSlideDown': 'fadeSlideDown .15s ease-out both',
        'scaleIn':       'scaleIn .2s ease-out both',
        'shimmer':       'shimmer 1.5s infinite linear',
      },
    },
  },
};
