/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        jd: {
          cyan: {
            50: '#9EE7EC',
            100: '#8ADDED',
            200: '#74D1E9',
            300: '#60C6E5',
            400: '#4FBCE1',
          },
          blue: {
            50: '#44AFDA',
            100: '#3EA2D2',
            200: '#4C97D8',
            300: '#5C9FE0',
            400: '#6DAAE8',
            500: '#3A63CC',
            600: '#345CC6',
            700: '#3056C0',
            800: '#3F59C4',
            900: '#545ECB',
          },
          violet: {
            50: '#6662D1',
            100: '#7766D8',
            200: '#896BE0',
            300: '#9B70E7',
            400: '#C7B2F3',
          },
          magenta: {
            50: '#F3F4F9', // Lightest / Highlight
            100: '#5D4BCD',
            200: '#6E51DE',
            300: '#7F56EF',
            400: '#8F5AF8',
            500: '#9C5CFB',
            600: '#AF5DF6',
            700: '#C561EF',
            800: '#DA6CE9',
            900: '#F39AF2',
          }
        },
        ai: {
          blue: '#00E0FF',
          violet: '#6B00FF',
          magenta: '#FF00D6',
          purple: '#0F0820',
          dark: '#140A2E',
        },
        premium: {
          bg: '#0F051E',
          sidebar: '#140826',
          purple: '#6D28D9',
          glow: '#A855F7',
          glass: 'rgba(255, 255, 255, 0.03)',
        },
        action: {
          start: '#FF5E1A',
          end: '#FF006B',
        },
        vibrant: {
          cyan: '#00D1FF',
          blue: '#1A4FFF',
          purple: '#7B2CFF',
          magenta: '#FF00E5',
          pink: '#FF4DFF',
        },
        neon: {
          blue: '#00F3FF',
          purple: '#BC13FE',
          pink: '#FF00FF',
          green: '#00FF9D',
        },
        dark: {
          50: '#E4E4E7',
          100: '#D4D4D8',
          200: '#A1A1AA',
          300: '#71717A',
          400: '#52525B',
          500: '#3F3F46',
          600: '#27272A',
          700: '#18181B',
          800: '#09090B',
          900: '#000000',
          950: '#050505',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-liquid': 'linear-gradient(135deg, #00E0FF 0%, #6B00FF 50%, #FF00D6 100%)',
        'gradient-ai-mesh': 'radial-gradient(circle at 20% 30%, rgba(0, 224, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 0, 214, 0.15) 0%, transparent 50%)',
        'gradient-premium': 'radial-gradient(circle at center, #251052 0%, #0F051E 100%)',
        'gradient-glow': 'radial-gradient(circle at center, rgba(107, 0, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
      },
      boxShadow: {
        'liquid-glass': '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        'ai-glow': '0 0 30px rgba(107, 0, 255, 0.4)',
        'premium-purple': '0 0 20px rgba(99, 57, 242, 0.4)',
        'card': '0 12px 48px 0 rgba(0, 0, 0, 0.6)',
        'water-shadow': '0 25px 60px rgba(0,0,0,0.5)',
        'water-glow': '0 45px 100px rgba(58,99,204,0.3)',
        'btn-liquid': '0 0 60px rgba(127,86,239,0.6)',
        'btn-outline': '0 0 30px rgba(96,198,229,0.3)',
      },
      animation: {
        'carousel': 'carousel 16s infinite steps(5, end)',
        'mesh-flow': 'mesh 15s ease infinite alternate',
        'liquid-float': 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        carousel: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-80%)' },
        },
        mesh: {
          '0%': { 'background-position': '0% 0%' },
          '100%': { 'background-position': '100% 100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
      },
    },
  },
  plugins: [],
}
