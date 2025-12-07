import { VALIDATION_RULES, ERROR_MESSAGES } from './constants.ts';

export function validateRequired(value) {
    const isValid = value && value.trim().length > 0;
    return {
        isValid,
        message: isValid ? '' : ERROR_MESSAGES.REQUIRED_FIELD
    };
}

export function validateEmail(email) {
    if (!email || email.trim().length === 0) {
        return { isValid: false, message: 'Email ' + ERROR_MESSAGES.REQUIRED_FIELD };
    }
    
    const isValid = VALIDATION_RULES.EMAIL_PATTERN.test(email);
    return {
        isValid,
        message: isValid ? '' : ERROR_MESSAGES.INVALID_EMAIL
    };
}

export function validateUsername(username) {
    if (!username || username.trim().length === 0) {
        return { isValid: false, message: 'Username ' + ERROR_MESSAGES.REQUIRED_FIELD };
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

export function validatePassword(password) {
    if (!password || password.length === 0) {
        return { isValid: false, message: 'Password ' + ERROR_MESSAGES.REQUIRED_FIELD };
    }
    
    const isValid = password.length >= VALIDATION_RULES.MIN_PASSWORD_LENGTH;
    return {
        isValid,
        message: isValid ? '' : ERROR_MESSAGES.PASSWORD_TOO_SHORT
    };
}

export function validatePasswordMatch(password, confirmPassword) {
    const isValid = password === confirmPassword && password.length > 0;
    return {
        isValid,
        message: isValid ? '' : ERROR_MESSAGES.PASSWORDS_NOT_MATCH
    };
}

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

export function clearError(fieldId) {
    showError(fieldId, '');
}

export function clearAllErrors(form) {
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
    
    const inputElements = form.querySelectorAll('.error');
    inputElements.forEach(el => {
        el.classList.remove('error');
        el.removeAttribute('aria-invalid');
    });
}
