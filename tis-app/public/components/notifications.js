/**
 * Toast Notification System
 */
const notifications = {
    container: null,

    init: function () {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'fixed top-6 right-6 z-[9999] flex flex-col gap-3';
        document.body.appendChild(this.container);
    },

    show: function (message, type = 'info', duration = 3000) {
        this.init();
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            warning: 'bg-yellow-500',
            info: 'bg-[#1e3a8a]'
        };

        toast.className = `${colors[type]} text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-right transform transition-all duration-300 pointer-events-auto cursor-pointer`;

        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';

        toast.innerHTML = `<i class="fas ${icon}"></i> <span class="font-bold">${message}</span>`;

        toast.onclick = () => this.remove(toast);
        this.container.appendChild(toast);

        setTimeout(() => this.remove(toast), duration);
    },

    remove: function (toast) {
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }
};

// Global export
window.notifications = notifications;
