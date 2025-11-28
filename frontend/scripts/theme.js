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
    // Check if any theme toggle button already exists
    const existingButton = document.querySelector('.theme-toggle');
    if (existingButton) {
        return;
    }

    // Wait for DOM to be ready if it's not
    if (!document.body) {
        setTimeout(createThemeToggle, 50);
        return;
    }

    const button = document.createElement('button');
    button.id = 'themeToggle';
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle dark/light mode');
    button.setAttribute('title', 'Switch between light and dark mode');
    button.innerHTML = '<i class="fas fa-moon"></i>'; // Default icon
    
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
    
    // Update initial state
    const currentTheme = document.documentElement.getAttribute('data-theme');
    updateToggleButton(currentTheme);
}

/**
 * Update toggle button appearance
 * @param {string} theme - Current theme
 */
function updateToggleButton(theme) {
    const button = document.getElementById('themeToggle');
    if (button) {
        // Update icon based on theme
        if (theme === THEME_DARK) {
            button.innerHTML = '<i class="fas fa-sun"></i>';
            button.setAttribute('aria-label', 'Switch to light mode');
            button.setAttribute('title', 'Switch to light mode');
        } else {
            button.innerHTML = '<i class="fas fa-moon"></i>';
            button.setAttribute('aria-label', 'Switch to dark mode');
            button.setAttribute('title', 'Switch to dark mode');
        }
    }
}

// Auto-initialize for static pages (not SPA)
// SPA (index.html) will call initTheme() manually from app.js
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Only auto-init if we're not on the SPA page
        if (!document.getElementById('app')) {
            initTheme();
        }
    });
} else {
    // Only auto-init if we're not on the SPA page
    if (!document.getElementById('app')) {
        initTheme();
    }
}
