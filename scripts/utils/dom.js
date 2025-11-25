/**
 * DOM Manipulation Utility Functions
 * Provides helper functions for common DOM operations
 */

/**
 * Safely get element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} Element or null
 */
export function getById(id) {
    return document.getElementById(id);
}

/**
 * Safely query selector
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Element|null} Element or null
 */
export function query(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * Safely query selector all
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {NodeList} NodeList of elements
 */
export function queryAll(selector, context = document) {
    return context.querySelectorAll(selector);
}

/**
 * Add event listener with error handling
 * @param {Element} element - Target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} options - Event listener options
 */
export function addEvent(element, event, handler, options = {}) {
    if (element && typeof handler === 'function') {
        element.addEventListener(event, handler, options);
    }
}

/**
 * Remove event listener
 * @param {Element} element - Target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 */
export function removeEvent(element, event, handler) {
    if (element && typeof handler === 'function') {
        element.removeEventListener(event, handler);
    }
}

/**
 * Toggle class on element
 * @param {Element} element - Target element
 * @param {string} className - Class name
 * @param {boolean} force - Force add/remove
 */
export function toggleClass(element, className, force) {
    if (element) {
        element.classList.toggle(className, force);
    }
}

/**
 * Show element
 * @param {Element} element - Target element
 */
export function show(element) {
    if (element) {
        element.style.display = '';
        element.removeAttribute('hidden');
    }
}

/**
 * Hide element
 * @param {Element} element - Target element
 */
export function hide(element) {
    if (element) {
        element.style.display = 'none';
        element.setAttribute('hidden', '');
    }
}

/**
 * Set text content safely
 * @param {Element} element - Target element
 * @param {string} text - Text content
 */
export function setText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

/**
 * Set HTML content safely (use with caution)
 * @param {Element} element - Target element
 * @param {string} html - HTML content
 */
export function setHTML(element, html) {
    if (element) {
        element.innerHTML = html;
    }
}

/**
 * Create element with attributes
 * @param {string} tag - Tag name
 * @param {Object} attributes - Attributes object
 * @param {string} content - Text content
 * @returns {Element} Created element
 */
export function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.keys(attributes).forEach(key => {
        if (key === 'class') {
            element.className = attributes[key];
        } else if (key === 'dataset') {
            Object.keys(attributes[key]).forEach(dataKey => {
                element.dataset[dataKey] = attributes[key][dataKey];
            });
        } else {
            element.setAttribute(key, attributes[key]);
        }
    });
    
    if (content) {
        element.textContent = content;
    }
    
    return element;
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
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
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
