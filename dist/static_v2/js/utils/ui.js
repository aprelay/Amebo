// ============================================
// AMEBO v2.0 - UI Utilities
// ============================================

export class UI {
    /**
     * Show toast notification
     */
    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container') || this.createToastContainer();
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    static createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
    
    /**
     * Show modal
     */
    static showModal(title, content, buttons = []) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-content">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        ${buttons.map((btn, i) => 
                            `<button class="btn btn-${btn.type || 'secondary'}" data-index="${i}">
                                ${btn.text}
                            </button>`
                        ).join('')}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Handle button clicks
            modal.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = parseInt(btn.dataset.index);
                    modal.remove();
                    resolve(index);
                });
            });
            
            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(-1);
                }
            });
        });
    }
    
    /**
     * Confirm dialog
     */
    static async confirm(message, title = 'Confirm') {
        const result = await this.showModal(title, message, [
            { text: 'Cancel', type: 'secondary' },
            { text: 'Confirm', type: 'primary' }
        ]);
        return result === 1;
    }
    
    /**
     * Format timestamp
     */
    static formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // Less than 1 minute
        if (diff < 60000) {
            return 'Just now';
        }
        
        // Less than 1 hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        }
        
        // Less than 24 hours
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        }
        
        // Same year
        if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        // Different year
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    /**
     * Format full timestamp
     */
    static formatFullTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * Escape HTML
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Debounce function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Get initials from name
     */
    static getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }
    
    /**
     * Generate avatar color
     */
    static getAvatarColor(text) {
        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
        ];
        
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    /**
     * Render avatar
     */
    static renderAvatar(user, size = 40) {
        const name = user.display_name || user.username || '?';
        const initials = this.getInitials(name);
        const color = this.getAvatarColor(user.id || name);
        
        if (user.avatar) {
            return `<img src="${user.avatar}" alt="${name}" 
                         class="avatar" style="width: ${size}px; height: ${size}px;">`;
        }
        
        return `<div class="avatar avatar-text" 
                     style="width: ${size}px; height: ${size}px; background: ${color};">
                    ${initials}
                </div>`;
    }
    
    /**
     * Show loading spinner
     */
    static showLoading(container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    }
    
    /**
     * Show empty state
     */
    static showEmpty(container, message, icon = '📭') {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${icon}</div>
                <p>${message}</p>
            </div>
        `;
    }
}
