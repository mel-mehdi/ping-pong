/**
 * Theme Toggle Module
 * Handles dark/light mode switching
 */

import { getItem, setItem } from './utils/storage.js';

const THEME_KEY = 'theme-preference';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

/**
 * Initialize theme on page load
 */
export function initTheme() {
    const savedTheme = getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? THEME_DARK : THEME_LIGHT);
    
    applyTheme(theme);
    createThemeToggle();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!getItem(THEME_KEY)) {
            applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
        }
    });
}

/**
 * Apply theme to document
 * @param {string} theme - Theme name (dark/light)
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleButton(theme);
}

/**
 * Toggle between dark and light theme
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    
    applyTheme(newTheme);
    setItem(THEME_KEY, newTheme);
}

/**
 * Create and insert theme toggle button
 */
function createThemeToggle() {
    // Check if button already exists
    if (document.getElementById('themeToggle')) {
        return;
    }

    const button = document.createElement('button');
    button.id = 'themeToggle';
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle dark/light mode');
    button.setAttribute('title', 'Toggle theme');
    
    button.innerHTML = '';
    
    button.addEventListener('click', toggleTheme);
    
    // Insert into navbar if exists, otherwise into body
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        const li = document.createElement('li');
        li.appendChild(button);
        navMenu.appendChild(li);
    } else {
        document.body.appendChild(button);
    }
}

/**
 * Update toggle button appearance
 * @param {string} theme - Current theme
 */
function updateToggleButton(theme) {
    const button = document.getElementById('themeToggle');
    if (button) {
        button.setAttribute('aria-label', `Switch to ${theme === THEME_DARK ? 'light' : 'dark'} mode`);
    }
}

// Auto-initialize when module loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}
