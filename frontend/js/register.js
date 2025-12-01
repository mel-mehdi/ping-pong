/**
 * Register Page Module
 * Handles user registration form and validation
 */

import { STORAGE_KEYS, ROUTES } from './utils/constants.js';
import { setItem } from './utils/storage.js';
import {
    validateRequired,
    validateEmail,
    validateUsername,
    validatePassword,
    validatePasswordMatch,
    showError,
    clearAllErrors
} from './utils/validation.js';
import { getById, addEvent } from './utils/dom.js';
import db from './utils/database.js';

// Registration handling
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = getById('registerForm');

    if (registerForm) {
        initRegisterForm(registerForm);
    }
});

/**
 * Initialize register form with validation and submission
 * @param {HTMLFormElement} form - Register form element
 */
function initRegisterForm(form) {
    const emailInput = getById('email');
    const usernameInput = getById('username');
    const passwordInput = getById('password');
    const confirmPasswordInput = getById('confirmPassword');
    const termsCheckbox = getById('terms');

    // Real-time validation
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
        
        const email = emailInput.value;
        const username = usernameInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const terms = termsCheckbox ? termsCheckbox.checked : false;

        // Validate all fields
        let isValid = true;

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

        // Check if user already exists
        const existingUser = db.findOne('users', { username: username });
        if (existingUser) {
            showError('username', 'Username already taken');
            return;
        }

        const existingEmail = db.findOne('users', { email: email });
        if (existingEmail) {
            showError('email', 'Email already registered');
            return;
        }

        // Create new user
        const newUser = db.insert('users', {
            username: username,
            email: email,
            fullname: username,
            passwordHash: db.hashPassword(password),
            avatar: null,
            wins: 0,
            losses: 0,
            gamesPlayed: 0
        });
        
        // Create session
        const sessionData = {
            userId: newUser.id,
            username: newUser.username,
            email: newUser.email,
            fullname: newUser.fullname,
            avatar: newUser.avatar,
            loggedIn: true,
            loginTime: new Date().toISOString()
        };
        
        setItem(STORAGE_KEYS.USER_DATA, sessionData);
        
        // Store session in database
        db.insert('sessions', {
            userId: newUser.id,
            loginTime: new Date().toISOString()
        });
        
        // Show success and redirect
        form.classList.add('loading');
        setTimeout(() => {
            window.location.href = ROUTES.HOME;
        }, 500);
    });
}
