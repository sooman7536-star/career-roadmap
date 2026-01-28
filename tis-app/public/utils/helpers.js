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
    }
};

// Global export
window.helpers = helpers;
