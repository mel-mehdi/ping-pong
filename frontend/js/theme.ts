import { getItem, setItem } from './utils/storage.ts';

const THEME_KEY = 'theme-preference';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

export function initTheme() {
    const savedTheme = getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? THEME_DARK : THEME_LIGHT);
    
    applyTheme(theme);
    createThemeToggle();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!getItem(THEME_KEY)) {
            applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
        }
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleButton(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    
    applyTheme(newTheme);
    setItem(THEME_KEY, newTheme);
}

function createThemeToggle() {

    const existingButton = document.querySelector('.theme-toggle');
    if (existingButton) {
        return;
    }

    if (!document.body) {
        setTimeout(createThemeToggle, 50);
        return;
    }

    const button = document.createElement('button');
    button.id = 'themeToggle';
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle dark/light mode');
    button.setAttribute('title', 'Switch between light and dark mode');
    button.innerHTML = '<i class="fas fa-moon"></i>'; 
    
    button.addEventListener('click', toggleTheme);

    const navActions = document.querySelector('.nav-actions');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navActions) {
        navActions.appendChild(button);
    } else if (navMenu) {
        const li = document.createElement('li');
        li.appendChild(button);
        navMenu.appendChild(li);
    } else {
        document.body.appendChild(button);
    }

    const currentTheme = document.documentElement.getAttribute('data-theme');
    updateToggleButton(currentTheme);
}

function updateToggleButton(theme) {
    const button = document.getElementById('themeToggle');
    if (button) {

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
