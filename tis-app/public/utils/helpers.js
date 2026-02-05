/**
 * Helper functions for DOM manipulation and general utilities
 */
const helpers = {
    qs: function (selector, scope) {
        return (scope || document).querySelector(selector);
    },
    qsa: function (selector, scope) {
        return (scope || document).querySelectorAll(selector);
    },
    on: function (target, type, callback, useCapture) {
        target.addEventListener(type, callback, !!useCapture);
    },
    formatDate: function (date) {
        const d = new Date(date);
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
    },
    generateId: function () {
        return 'tis-' + Math.random().toString(36).substr(2, 9);
    },
    getDaysDiff: function (dateStr) {
        if (!dateStr) return 999;
        const target = new Date(dateStr);
        const today = new Date();
        const diff = target - today;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
};

// Global export
window.helpers = helpers;
