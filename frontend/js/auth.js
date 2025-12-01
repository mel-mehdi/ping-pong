/**
 * Authentication Module
 * Handles user login, registration, and authentication checks
 */

import { STORAGE_KEYS, ROUTES, PUBLIC_PAGES } from './utils/constants.js';
import { getItem, setItem, removeItem } from './utils/storage.js';
import {
    validateRequired,
    validateEmail,
    validateUsername,
    validatePassword,
    validatePasswordMatch,
    showError,
    clearError,
    clearAllErrors
} from './utils/validation.js';
import { getById, addEvent } from './utils/dom.js';

// Authentication handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = getById('loginForm');
    const registerForm = getById('registerForm');

    if (loginForm) {
        initLoginForm(loginForm);
    }

    if (registerForm) {
        initRegisterForm(registerForm);
    }
});

/**
 * Initialize login form with validation and submission
 * @param {HTMLFormElement} form - Login form element
 */
function initLoginForm(form) {
    const usernameInput = getById('username');
    const passwordInput = getById('password');

    // Real-time validation
    addEvent(usernameInput, 'blur', () => {
        const result = validateRequired(usernameInput.value);
        if (!result.isValid) {
            showError('username', result.message);
        } else {
            clearError('username');
        }
    });

    addEvent(passwordInput, 'blur', () => {
        const result = validateRequired(passwordInput.value);
        if (!result.isValid) {
            showError('password', result.message);
        } else {
            clearError('password');
        }
    });

    addEvent(form, 'submit', function(e) {
        e.preventDefault();
        clearAllErrors(form);
        
        const username = usernameInput.value;
        const password = passwordInput.value;
        const remember = document.querySelector('input[name="remember"]').checked;

        // Validate all fields
        let isValid = true;

        const usernameValidation = validateRequired(username);
        if (!usernameValidation.isValid) {
            showError('username', usernameValidation.message);
            isValid = false;
        }

        const passwordValidation = validateRequired(password);
        if (!passwordValidation.isValid) {
            showError('password', passwordValidation.message);
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Import and use database
        import('./utils/database.js').then(module => {
            const db = module.default;
            
            // Authenticate user
            const user = db.findOne('users', { username: username });
            
            if (!user) {
                showError('username', 'User not found');
                return;
            }

            if (!db.verifyPassword(password, user.passwordHash)) {
                showError('password', 'Invalid password');
                return;
            }

            // Create session
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
            
            // Store session in database
            db.insert('sessions', {
                userId: user.id,
                loginTime: new Date().toISOString()
            });
            
            // Show success and redirect
            form.classList.add('loading');
            setTimeout(() => {
                window.location.href = ROUTES.HOME;
            }, 500);
        });
    });
}

/**
 * Initialize register form with validation and submission
 * @param {HTMLFormElement} form - Register form element
 */
function initRegisterForm(form) {
    const fullnameInput = getById('fullname');
    const emailInput = getById('email');
    const usernameInput = getById('username');
    const passwordInput = getById('password');
    const confirmPasswordInput = getById('confirmPassword');
    const termsCheckbox = getById('terms');

    // Real-time validation
    addEvent(fullnameInput, 'blur', () => {
        const result = validateRequired(fullnameInput.value);
        showError('fullname', result.isValid ? '' : result.message);
    });

    addEvent(emailInput, 'blur', () => {
        const result = validateEmail(emailInput.value);
        showError('email', result.isValid ? '' : result.message);
    });

    addEvent(usernameInput, 'blur', () => {
        const result = validateUsername(usernameInput.value);
        showError('username', result.isValid ? '' : result.message);
    });

    addEvent(passwordInput, 'blur', () => {
        const result = validatePassword(passwordInput.value);
        showError('password', result.isValid ? '' : result.message);
    });

    addEvent(confirmPasswordInput, 'blur', () => {
        const result = validatePasswordMatch(passwordInput.value, confirmPasswordInput.value);
        showError('confirmPassword', result.isValid ? '' : result.message);
    });

    addEvent(form, 'submit', function(e) {
        e.preventDefault();
        clearAllErrors(form);
        
        const fullname = fullnameInput.value;
        const email = emailInput.value;
        const username = usernameInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const terms = termsCheckbox.checked;

        // Validate all fields
        let isValid = true;

        const fullnameValidation = validateRequired(fullname);
        if (!fullnameValidation.isValid) {
            showError('fullname', fullnameValidation.message);
            isValid = false;
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            showError('email', emailValidation.message);
            isValid = false;
        }

        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
            showError('username', usernameValidation.message);
            isValid = false;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            showError('password', passwordValidation.message);
            isValid = false;
        }

        const confirmPasswordValidation = validatePasswordMatch(password, confirmPassword);
        if (!confirmPasswordValidation.isValid) {
            showError('confirmPassword', confirmPasswordValidation.message);
            isValid = false;
        }

        if (!terms) {
            showError('terms', 'You must accept the Terms & Conditions');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Store user data
        const userData = {
            fullname: fullname,
            email: email,
            username: username,
            loggedIn: true,
            registrationTime: new Date().toISOString()
        };
        
        setItem(STORAGE_KEYS.USER_DATA, userData);
        
        // Show success and redirect
        form.classList.add('loading');
        setTimeout(() => {
            window.location.href = ROUTES.HOME;
        }, 500);
    });
}

/**
 * Check if user is logged in
 */
function checkAuth() {
    const userData = getItem(STORAGE_KEYS.USER_DATA);
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!userData && !PUBLIC_PAGES.includes(currentPage)) {
        window.location.href = ROUTES.LOGIN;
    }
}

/**
 * Logout function
 */
export function logout() {
    removeItem(STORAGE_KEYS.USER_DATA);
    window.location.href = ROUTES.LOGIN;
}

// Run auth check on page load
checkAuth();

