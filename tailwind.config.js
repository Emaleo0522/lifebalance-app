/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{vue,svelte}', // Future compatibility
    './public/**/*.html', // Include public HTML files
  ],
  darkMode: 'class',
  theme: {
    // Breakpoints personalizados para mejor responsive
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      // Breakpoints de altura
      'h-sm': { 'raw': '(min-height: 640px)' },
      'h-md': { 'raw': '(min-height: 768px)' },
      'h-lg': { 'raw': '(min-height: 1024px)' },
      // Breakpoints para hover
      'hover-hover': { 'raw': '(hover: hover)' },
      'hover-none': { 'raw': '(hover: none)' },
    },
    extend: {
      colors: {
        // Tu paleta existente mejorada con variables CSS
        primary: {
          50: 'rgb(240 249 244 / <alpha-value>)',
          100: 'rgb(216 234 223 / <alpha-value>)',
          200: 'rgb(182 213 196 / <alpha-value>)',
          300: 'rgb(148 193 169 / <alpha-value>)',
          400: 'rgb(114 172 143 / <alpha-value>)',
          500: 'rgb(107 144 128 / <alpha-value>)', // primary
          600: 'rgb(85 114 101 / <alpha-value>)',
          700: 'rgb(64 87 77 / <alpha-value>)',
          800: 'rgb(42 59 52 / <alpha-value>)',
          900: 'rgb(21 32 26 / <alpha-value>)',
          950: 'rgb(10 16 13 / <alpha-value>)', // Extra dark
        },
        secondary: {
          50: 'rgb(240 249 245 / <alpha-value>)',
          100: 'rgb(217 237 222 / <alpha-value>)',
          200: 'rgb(185 222 204 / <alpha-value>)',
          300: 'rgb(164 195 178 / <alpha-value>)', // secondary
          400: 'rgb(138 183 158 / <alpha-value>)',
          500: 'rgb(112 169 137 / <alpha-value>)',
          600: 'rgb(90 135 110 / <alpha-value>)',
          700: 'rgb(67 101 82 / <alpha-value>)',
          800: 'rgb(45 68 55 / <alpha-value>)',
          900: 'rgb(22 34 27 / <alpha-value>)',
          950: 'rgb(11 17 14 / <alpha-value>)',
        },
        accent: {
          50: 'rgb(255 243 224 / <alpha-value>)',
          100: 'rgb(255 224 178 / <alpha-value>)',
          200: 'rgb(255 204 128 / <alpha-value>)',
          300: 'rgb(255 183 77 / <alpha-value>)',
          400: 'rgb(255 167 38 / <alpha-value>)',
          500: 'rgb(255 152 0 / <alpha-value>)', // accent
          600: 'rgb(251 140 0 / <alpha-value>)',
          700: 'rgb(245 124 0 / <alpha-value>)',
          800: 'rgb(239 108 0 / <alpha-value>)',
          900: 'rgb(230 81 0 / <alpha-value>)',
          950: 'rgb(138 49 0 / <alpha-value>)',
        },
        warning: {
          50: 'rgb(255 253 231 / <alpha-value>)',
          100: 'rgb(255 249 196 / <alpha-value>)',
          200: 'rgb(255 245 157 / <alpha-value>)',
          300: 'rgb(255 241 118 / <alpha-value>)',
          400: 'rgb(255 238 88 / <alpha-value>)',
          500: 'rgb(255 235 59 / <alpha-value>)',
          600: 'rgb(253 216 53 / <alpha-value>)',
          700: 'rgb(251 192 45 / <alpha-value>)',
          800: 'rgb(249 168 37 / <alpha-value>)',
          900: 'rgb(245 127 23 / <alpha-value>)',
          950: 'rgb(147 76 14 / <alpha-value>)',
        },
        error: {
          50: 'rgb(255 235 238 / <alpha-value>)',
          100: 'rgb(255 205 210 / <alpha-value>)',
          200: 'rgb(239 154 154 / <alpha-value>)',
          300: 'rgb(229 115 115 / <alpha-value>)',
          400: 'rgb(239 83 80 / <alpha-value>)',
          500: 'rgb(244 67 54 / <alpha-value>)',
          600: 'rgb(229 57 53 / <alpha-value>)',
          700: 'rgb(211 47 47 / <alpha-value>)',
          800: 'rgb(198 40 40 / <alpha-value>)',
          900: 'rgb(183 28 28 / <alpha-value>)',
          950: 'rgb(127 29 29 / <alpha-value>)',
        },
        success: {
          50: 'rgb(232 245 233 / <alpha-value>)',
          100: 'rgb(200 230 201 / <alpha-value>)',
          200: 'rgb(165 214 167 / <alpha-value>)',
          300: 'rgb(129 199 132 / <alpha-value>)',
          400: 'rgb(102 187 106 / <alpha-value>)',
          500: 'rgb(76 175 80 / <alpha-value>)',
          600: 'rgb(67 160 71 / <alpha-value>)',
          700: 'rgb(56 142 60 / <alpha-value>)',
          800: 'rgb(46 125 50 / <alpha-value>)',
          900: 'rgb(27 94 32 / <alpha-value>)',
          950: 'rgb(14 57 20 / <alpha-value>)',
        },
        info: {
          50: 'rgb(227 242 253 / <alpha-value>)',
          100: 'rgb(187 222 251 / <alpha-value>)',
          200: 'rgb(147 197 253 / <alpha-value>)',
          300: 'rgb(96 165 250 / <alpha-value>)',
          400: 'rgb(59 130 246 / <alpha-value>)',
          500: 'rgb(37 99 235 / <alpha-value>)',
          600: 'rgb(29 78 216 / <alpha-value>)',
          700: 'rgb(30 64 175 / <alpha-value>)',
          800: 'rgb(30 58 138 / <alpha-value>)',
          900: 'rgb(23 37 84 / <alpha-value>)',
          950: 'rgb(15 23 42 / <alpha-value>)',
        },
        // Grises mejorados
        gray: {
          50: 'rgb(249 250 251 / <alpha-value>)',
          100: 'rgb(243 244 246 / <alpha-value>)',
          200: 'rgb(229 231 235 / <alpha-value>)',
          300: 'rgb(209 213 219 / <alpha-value>)',
          400: 'rgb(156 163 175 / <alpha-value>)',
          500: 'rgb(107 114 128 / <alpha-value>)',
          600: 'rgb(75 85 99 / <alpha-value>)',
          700: 'rgb(55 65 81 / <alpha-value>)',
          800: 'rgb(31 41 55 / <alpha-value>)',
          900: 'rgb(17 24 39 / <alpha-value>)',
          950: 'rgb(3 7 18 / <alpha-value>)',
        },
        // Colores semánticos
        background: {
          light: 'rgb(245 240 232 / <alpha-value>)',
          dark: 'rgb(31 41 55 / <alpha-value>)',
        },
        surface: {
          light: 'rgb(255 255 255 / <alpha-value>)',
          dark: 'rgb(55 65 81 / <alpha-value>)',
        },
        border: {
          light: 'rgb(229 231 235 / <alpha-value>)',
          dark: 'rgb(75 85 99 / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
        heading: [
          'Poppins',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.16' }],
        '6xl': ['3.75rem', { lineHeight: '1.15' }],
        '7xl': ['4.5rem', { lineHeight: '1.14' }],
        '8xl': ['6rem', { lineHeight: '1.1' }],
        '9xl': ['8rem', { lineHeight: '1.05' }],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        // Sombras de colores
        'primary': '0 4px 14px 0 rgb(107 144 128 / 0.25)',
        'accent': '0 4px 14px 0 rgb(255 152 0 / 0.25)',
        'success': '0 4px 14px 0 rgb(76 175 80 / 0.25)',
        'error': '0 4px 14px 0 rgb(244 67 54 / 0.25)',
        'warning': '0 4px 14px 0 rgb(255 235 59 / 0.25)',
      },
      animation: {
        // Animaciones existentes mejoradas
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-out': 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-left': 'slideLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-right': 'slideRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-up': 'scaleUp 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-down': 'scaleDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Animaciones de carga
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        
        // Animaciones de rotación
        'spin-slow': 'spin 3s linear infinite',
        'spin-reverse': 'spinReverse 1s linear infinite',
        
        // Animaciones de texto
        'typing': 'typing 3.5s steps(40, end)',
        'blink': 'blink 1s infinite',
        
        // Animaciones de fondo
        'gradient': 'gradient 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        // Keyframes existentes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleDown: {
          '0%': { transform: 'scale(1.05)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        
        // Nuevos keyframes
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        spinReverse: {
          'from': { transform: 'rotate(360deg)' },
          'to': { transform: 'rotate(0deg)' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        blink: {
          '0%, 50%': { borderColor: 'transparent' },
          '51%, 100%': { borderColor: 'currentColor' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      // Configuraciones de transición
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
      // Z-index predefinidos
      zIndex: {
        '1': '1',
        '2': '2',
        '3': '3',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Aspect ratios personalizados
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
    },
  },
  plugins: [
    // Plugin para forms mejorados
    // require('@tailwindcss/forms'),
    
    // Plugin para typography
    // require('@tailwindcss/typography'),
    
    // Plugin para aspect ratio
    // require('@tailwindcss/aspect-ratio'),
    
    // Plugin para container queries
    // require('@tailwindcss/container-queries'),
    
    // Plugin personalizado para utilidades adicionales
    function({ addUtilities, addComponents, theme }) {
      // Utilidades personalizadas
      const newUtilities = {
        '.text-shadow': {
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-md': {
          textShadow: '4px 4px 8px rgba(0, 0, 0, 0.12), 2px 2px 4px rgba(0, 0, 0, 0.08)',
        },
        '.text-shadow-lg': {
          textShadow: '15px 15px 30px rgba(0, 0, 0, 0.11), 5px 5px 15px rgba(0, 0, 0, 0.08)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },
        '.transform-gpu': {
          transform: 'translate3d(0, 0, 0)',
        },
      };

      // Componentes personalizados
      const newComponents = {
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          '@apply border': {},
        },
        '.glass-dark': {
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(10px)',
          borderColor: 'rgba(75, 85, 99, 0.3)',
          '@apply border': {},
        },
      };

      addUtilities(newUtilities);
      addComponents(newComponents);
    },
  ],
  // Configuraciones adicionales para optimización
  future: {
    hoverOnlyWhenSupported: true,
  },
  // experimental: {
  //   optimizeUniversalDefaults: true,
  // },
}