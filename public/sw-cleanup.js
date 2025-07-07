// Service Worker cleanup script
// This script unregisters any existing service workers and clears cache

(function() {
  'use strict';

  console.log('🧹 Starting Service Worker cleanup...');

  // Function to unregister all service workers
  async function unregisterServiceWorkers() {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`Found ${registrations.length} service worker registrations`);
        
        for (const registration of registrations) {
          const result = await registration.unregister();
          console.log(`Service worker unregistered: ${result}`);
        }
        
        if (registrations.length > 0) {
          console.log('✅ All service workers unregistered');
        }
      } catch (error) {
        console.error('Error unregistering service workers:', error);
      }
    }
  }

  // Function to clear all caches
  async function clearAllCaches() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        console.log(`Found ${cacheNames.length} caches to clear`);
        
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        
        if (cacheNames.length > 0) {
          console.log('✅ All caches cleared');
        }
      } catch (error) {
        console.error('Error clearing caches:', error);
      }
    }
  }

  // Function to clear specific storage
  function clearStorage() {
    try {
      // Clear any PWA-related localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('workbox') || key.includes('pwa') || key.includes('sw'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed localStorage key: ${key}`);
      });
      
      // Clear sessionStorage SW-related items
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('workbox') || key.includes('pwa') || key.includes('sw'))) {
          sessionKeysToRemove.push(key);
        }
      }
      
      sessionKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`Removed sessionStorage key: ${key}`);
      });
      
      console.log('✅ Storage cleaned');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Main cleanup function
  async function performCleanup() {
    try {
      await unregisterServiceWorkers();
      await clearAllCaches();
      clearStorage();
      
      console.log('🎉 Service Worker cleanup completed!');
      
      // Show user notification
      if (window.location.pathname !== '/') {
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          z-index: 10000;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = '🧹 Cache limpiado - La app funciona mejor ahora';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 4000);
      }
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Run cleanup when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', performCleanup);
  } else {
    performCleanup();
  }

})();