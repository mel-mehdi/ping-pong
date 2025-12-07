export function getById(id) {
    return document.getElementById(id);
}

export function query(selector, context = document) {
    return context.querySelector(selector);
}

export function queryAll(selector, context = document) {
    return context.querySelectorAll(selector);
}

export function addEvent(element, event, handler, options = {}) {
    if (element && typeof handler === 'function') {
        element.addEventListener(event, handler, options);
    }
}

export function removeEvent(element, event, handler) {
    if (element && typeof handler === 'function') {
        element.removeEventListener(event, handler);
    }
}

export function toggleClass(element, className, force) {
    if (element) {
        element.classList.toggle(className, force);
    }
}

export function show(element) {
    if (element) {
        element.style.display = '';
        element.removeAttribute('hidden');
    }
}

export function hide(element) {
    if (element) {
        element.style.display = 'none';
        element.setAttribute('hidden', '');
    }
}

export function setText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

export function setHTML(element, html) {
    if (element) {
        element.innerHTML = html;
    }
}

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
