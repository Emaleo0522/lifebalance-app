import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
// PWA deshabilitado temporalmente para evitar problemas de cache
    // VitePWA({
    //   registerType: 'prompt',
    //   includeAssets: ['favicon.svg', 'robots.txt'],
    //   manifest: {
    //     name: 'LifeBalance - Gestión Económica Familiar',
    //     short_name: 'LifeBalance',
    //     description: 'Gestiona tu economía familiar, tiempo y organización personal',
    //     theme_color: '#6B9080',
    //     background_color: '#F5F0E8',
    //     display: 'standalone',
    //     orientation: 'portrait-primary',
    //     scope: '/',
    //     start_url: '/',
    //     lang: 'es-ES',
    //     categories: ['finance', 'productivity', 'lifestyle'],
    //     icons: [
    //       {
    //         src: 'favicon.svg',
    //         sizes: '192x192',
    //         type: 'image/svg+xml'
    //       },
    //       {
    //         src: 'favicon.svg',
    //         sizes: '512x512',
    //         type: 'image/svg+xml'
    //       },
    //       {
    //         src: 'favicon.svg',
    //         sizes: '512x512',
    //         type: 'image/svg+xml',
    //         purpose: 'any maskable'
    //       }
    //     ]
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,webp,avif}'],
    //     maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
    //     cleanupOutdatedCaches: true,
    //     skipWaiting: false,
    //     clientsClaim: false,
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/fonts\.googleapis\.com/,
    //         handler: 'StaleWhileRevalidate',
    //         options: {
    //           cacheName: 'google-fonts-stylesheets',
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
    //           }
    //         }
    //       },
    //       {
    //         urlPattern: /^https:\/\/fonts\.gstatic\.com/,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'google-fonts-webfonts',
    //           expiration: {
    //             maxEntries: 30,
    //             maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
    //           }
    //         }
    //       },
    //       {
    //         urlPattern: /^https:\/\/.*\.supabase\.co\/rest\//,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'supabase-api',
    //           networkTimeoutSeconds: 3,
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 60 * 5 // 5 minutos
    //           }
    //         }
    //       },
    //       {
    //         urlPattern: /^https:\/\/.*\.supabase\.co\/realtime\//,
    //         handler: 'NetworkOnly' // Realtime no debe cachearse
    //       },
    //       {
    //         urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'images',
    //           expiration: {
    //             maxEntries: 100,
    //             maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
    //           }
    //         }
    //       }
    //     ]
    //   },
    //   devOptions: {
    //     enabled: false // Habilitar para testing PWA en desarrollo
    //   }
    // })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/context': path.resolve(__dirname, './src/context'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', 'react-hot-toast'],
          utils: ['date-fns', 'clsx']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    assetsInlineLimit: 4096 // 4KB - archivos menores se inlinean
  },
  server: {
    port: 3000,
    host: true, // Permite acceso desde red local
    open: true,
    cors: true,
    hmr: {
      overlay: true // Mostrar errores en overlay
    }
  },
  preview: {
    port: 4173,
    host: true,
    open: true,
    cors: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'date-fns'
    ]
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  }
})