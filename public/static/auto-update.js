// Auto-Update Manager for Instant Deployments
// Listens for Service Worker updates and notifies users
// Ensures all devices get updates within 60 seconds

class AutoUpdateManager {
  constructor() {
    this.updateCheckInterval = 30000; // Check every 30 seconds
    this.swRegistration = null;
    this.hasUpdate = false;
    this.init();
  }

  async init() {
    console.log('[AUTO-UPDATE] Initializing auto-update system...');
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('[AUTO-UPDATE] ✅ Service Worker registered');
        
        // Check for updates immediately
        this.swRegistration.update();
        
        // Listen for Service Worker updates
        this.swRegistration.addEventListener('updatefound', () => {
          console.log('[AUTO-UPDATE] 🔄 Update found! Installing...');
          const newWorker = this.swRegistration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[AUTO-UPDATE] ✅ Update installed and ready!');
              this.hasUpdate = true;
              this.showUpdateNotification();
            }
          });
        });
        
        // Listen for messages from Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_UPDATED') {
            console.log('[AUTO-UPDATE] 📢 Update broadcast received:', event.data.version);
            this.showUpdateNotification();
          }
        });
        
        // Auto-check for updates periodically
        setInterval(() => {
          console.log('[AUTO-UPDATE] 🔍 Checking for updates...');
          this.swRegistration.update();
        }, this.updateCheckInterval);
        
        // Check for updates when page becomes visible
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden && this.swRegistration) {
            console.log('[AUTO-UPDATE] 👁️ Page visible - checking for updates...');
            this.swRegistration.update();
          }
        });
        
        // Check for updates when online
        window.addEventListener('online', () => {
          console.log('[AUTO-UPDATE] 🌐 Back online - checking for updates...');
          this.swRegistration.update();
        });
        
      } catch (error) {
        console.error('[AUTO-UPDATE] ❌ Service Worker registration failed:', error);
      }
    }
  }

  showUpdateNotification() {
    // Don't show multiple notifications
    if (document.getElementById('update-notification')) {
      return;
    }
    
    console.log('[AUTO-UPDATE] 📣 Showing update notification');
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideDown 0.3s ease-out;
      max-width: 90%;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
        </svg>
        <span>New update available!</span>
      </div>
      <button id="update-btn" style="
        background: white;
        color: #667eea;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
      ">
        Update Now
      </button>
      <button id="dismiss-btn" style="
        background: transparent;
        color: white;
        border: none;
        padding: 8px;
        cursor: pointer;
        opacity: 0.7;
      ">
        ×
      </button>
    `;
    
    // Add CSS animation
    if (!document.getElementById('update-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'update-notification-styles';
      style.textContent = `
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        #update-btn:hover {
          transform: scale(1.05);
        }
        #dismiss-btn:hover {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Update button handler
    document.getElementById('update-btn').addEventListener('click', () => {
      console.log('[AUTO-UPDATE] 🔄 User requested update - reloading...');
      window.location.reload();
    });
    
    // Dismiss button handler
    document.getElementById('dismiss-btn').addEventListener('click', () => {
      console.log('[AUTO-UPDATE] ❌ User dismissed update notification');
      notification.remove();
    });
    
    // Auto-reload after 60 seconds if user doesn't interact
    setTimeout(() => {
      if (document.getElementById('update-notification')) {
        console.log('[AUTO-UPDATE] ⏰ Auto-reloading after 60 seconds...');
        window.location.reload();
      }
    }, 60000);
  }
  
  // Manual update check (can be called from app)
  checkForUpdate() {
    console.log('[AUTO-UPDATE] 🔍 Manual update check requested');
    if (this.swRegistration) {
      this.swRegistration.update();
    }
  }
}

// Initialize auto-update manager
const autoUpdateManager = new AutoUpdateManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.AutoUpdateManager = autoUpdateManager;
}
