import { getItem, setItem } from './utils/storage.ts';

const THEME_KEY = 'theme-preference';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';
let themeInitialized = false;

export function initTheme() {
    if (themeInitialized) {
        attachThemeToggle();
        return;
    }
    
    const savedTheme = getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? THEME_DARK : THEME_LIGHT);
    
    applyTheme(theme);
    setupThemeToggleListener();
    themeInitialized = true;

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!getItem(THEME_KEY)) {
            applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
        }
    });
}

export function attachThemeToggle() {
    // Attach direct listener to button if it exists
    const button = document.getElementById('themeToggleBtn');
    if (button && !button.hasAttribute('data-theme-listener')) {
        button.setAttribute('data-theme-listener', 'true');
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
        });
    }
}

function setupThemeToggleListener() {
    // Use event delegation to handle dynamically added buttons
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        // Check if clicked element or any parent is the theme toggle button
        const button = target.closest('#themeToggleBtn');
        
        if (button) {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
        }
    }, true); // Use capture phase to catch event early
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    
    applyTheme(newTheme);
    setItem(THEME_KEY, newTheme);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {

        if (!document.getElementById('app')) {
            initTheme();
        }
    });
} else {

    if (!document.getElementById('app')) {
        initTheme();
    }
}
