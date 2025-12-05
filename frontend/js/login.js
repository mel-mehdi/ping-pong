

import { STORAGE_KEYS, ROUTES } from './utils/constants.js';
import { setItem } from './utils/storage.js';
import {
    validateRequired,
    showError,
    clearError,
    clearAllErrors
} from './utils/validation.js';
import { getById, addEvent } from './utils/dom.js';
import api from './utils/api.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = getById('loginForm');

    if (loginForm) {
        initLoginForm(loginForm);
    }
});

function initLoginForm(form) {
    const usernameInput = getById('username');
    const passwordInput = getById('password');

    addEvent(usernameInput, 'blur', () => {
        const result = validateRequired(usernameInput.value);
        if (!result.isValid) {
            showError('username', 'Username ' + result.message);
        } else {
            clearError('username');
        }
    });

    addEvent(passwordInput, 'blur', () => {
        const result = validateRequired(passwordInput.value);
        if (!result.isValid) {
            showError('password', 'Password ' + result.message);
        } else {
            clearError('password');
        }
    });

    addEvent(form, 'submit', async function(e) {
        e.preventDefault();
        clearAllErrors(form);
        
        const username = usernameInput.value;
        const password = passwordInput.value;
        const remember = document.querySelector('input[name="remember"]').checked;

        let isValid = true;

        const usernameValidation = validateRequired(username);
        if (!usernameValidation.isValid) {
            showError('username', 'Username ' + usernameValidation.message);
            isValid = false;
        }

        const passwordValidation = validateRequired(password);
        if (!passwordValidation.isValid) {
            showError('password', 'Password ' + passwordValidation.message);
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        form.classList.add('loading');

        try {
            
            const response = await api.login(username, password);
            const user = response.user;

            const sessionData = {
                userId: user.id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                avatar: user.avatar,
                loggedIn: true,
                loginTime: new Date().toISOString()
            };
            
            setItem(STORAGE_KEYS.USER_DATA, sessionData);
            
            console.log('✅ Login successful! User:', user.username);

            setTimeout(() => {
                window.location.href = ROUTES.HOME;
            }, 500);
            
        } catch (error) {
            form.classList.remove('loading');
            console.error('Login error:', error);
            
            if (error.message.includes('Invalid credentials')) {
                showError('password', 'Invalid username or password');
            } else {
                showError('password', 'Login failed: ' + error.message);
            }
        }
    });
}
