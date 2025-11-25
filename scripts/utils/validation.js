/**
 * Form Validation Utility Functions
 * Provides reusable validation functions for forms
 */

import { VALIDATION_RULES, ERROR_MESSAGES } from './constants.js';

/**
 * Validate if field is not empty
 * @param {string} value - Field value
 * @returns {Object} Validation result
 */
export function validateRequired(value) {
    const isValid = value && value.trim().length > 0;
    return {
        isValid,
        message: isValid ? '' : ERROR_MESSAGES.REQUIRED_FIELD
    };
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {Object} Validation result
 */
export function validateEmail(email) {
    if (!email || email.trim().length === 0) {
        return { isValid: false, message: ERROR_MESSAGES.REQUIRED_FIELD };
    }
    
    const isValid = VALIDATION_RULES.EMAIL_PATTERN.test(email);
    return {
        isValid,
        message: isValid ? '' : ERROR_MESSAGES.INVALID_EMAIL
    };
}

/**
 * Validate username format and length
 * @param {string} username - Username
 * @returns {Object} Validation result
 */
export function validateUsername(username) {
    if (!username || username.trim().length === 0) {
        return { isValid: false, message: ERROR_MESSAGES.REQUIRED_FIELD };
    }
    
    if (username.length < VALIDATION_RULES.MIN_USERNAME_LENGTH) {
        return { isValid: false, message: ERROR_MESSAGES.USERNAME_TOO_SHORT };
    }
    
    if (username.length > VALIDATION_RULES.MAX_USERNAME_LENGTH) {
        return { isValid: false, message: ERROR_MESSAGES.USERNAME_TOO_LONG };
    }
    
    const isValid = VALIDATION_RULES.USERNAME_PATTERN.test(username);
    return {
        isValid,
        message: isValid ? '' : ERROR_MESSAGES.INVALID_USERNAME
    };
}

/**
 * Validate password length
 * @param {string} password - Password
 * @returns {Object} Validation result
 */
export function validatePassword(password) {
    if (!password || password.length === 0) {
        return { isValid: false, message: ERROR_MESSAGES.REQUIRED_FIELD };
    }
    
    const isValid = password.length >= VALIDATION_RULES.MIN_PASSWORD_LENGTH;
    return {
        isValid,
        message: isValid ? '' : ERROR_MESSAGES.PASSWORD_TOO_SHORT
    };
}

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} Validation result
 */
export function validatePasswordMatch(password, confirmPassword) {
    const isValid = password === confirmPassword && password.length > 0;
    return {
        isValid,
        message: isValid ? '' : ERROR_MESSAGES.PASSWORDS_NOT_MATCH
    };
}

/**
 * Display error message for a field
 * @param {string} fieldId - Field ID
 * @param {string} message - Error message
 */
export function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}Error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
    }
    
    if (inputElement) {
        if (message) {
            inputElement.classList.add('error');
            inputElement.setAttribute('aria-invalid', 'true');
        } else {
            inputElement.classList.remove('error');
            inputElement.removeAttribute('aria-invalid');
        }
    }
}

/**
 * Clear error message for a field
 * @param {string} fieldId - Field ID
 */
export function clearError(fieldId) {
    showError(fieldId, '');
}

/**
 * Clear all errors in a form
 * @param {HTMLFormElement} form - Form element
 */
export function clearAllErrors(form) {
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
    
    const inputElements = form.querySelectorAll('.error');
    inputElements.forEach(el => {
        el.classList.remove('error');
        el.removeAttribute('aria-invalid');
    });
}
