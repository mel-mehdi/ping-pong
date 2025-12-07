import { STORAGE_KEYS, ROUTES, PUBLIC_PAGES } from './utils/constants.ts';
import { getItem, setItem, removeItem } from './utils/storage.ts';
import { validateRequired, validateEmail, validateUsername, validatePassword, validatePasswordMatch, showError, clearError, clearAllErrors } from './utils/validation.ts';
import { getById, addEvent } from './utils/dom.ts';

const validate = (input, validator, field) => {
    const result = validator(input.value);
    result.isValid ? clearError(field) : showError(field, result.message);
};

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = getById('loginForm');
    const registerForm = getById('registerForm');
    loginForm && initLoginForm(loginForm);
    registerForm && initRegisterForm(registerForm);
});

function initLoginForm(form) {
    const username = getById('username');
    const password = getById('password');

    addEvent(username, 'blur', () => validate(username, validateRequired, 'username'));
    addEvent(password, 'blur', () => validate(password, validateRequired, 'password'));

    addEvent(form, 'submit', (e) => {
        e.preventDefault();
        clearAllErrors(form);
        
        const usr = username.value;
        const pwd = password.value;

        if (!validateRequired(usr).isValid || !validateRequired(pwd).isValid) return;

        import('./utils/database.js').then(({ default: db }) => {
            const user = db.findOne('users', { username: usr });
            
            if (!user) return showError('username', 'User not found');
            if (!db.verifyPassword(pwd, user.passwordHash)) return showError('password', 'Invalid password');

            setItem(STORAGE_KEYS.USER_DATA, {
                userId: user.id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                avatar: user.avatar,
                loggedIn: true,
                loginTime: new Date().toISOString()
            });

            db.insert('sessions', { userId: user.id, loginTime: new Date().toISOString() });
            form.classList.add('loading');
            setTimeout(() => window.location.href = ROUTES.HOME, 500);
        });
    });
}

function initRegisterForm(form) {
    const fullname = getById('fullname');
    const email = getById('email');
    const username = getById('username');
    const password = getById('password');
    const confirmPassword = getById('confirmPassword');
    const terms = getById('terms');

    addEvent(fullname, 'blur', () => validate(fullname, validateRequired, 'fullname'));
    addEvent(email, 'blur', () => validate(email, validateEmail, 'email'));
    addEvent(username, 'blur', () => validate(username, validateUsername, 'username'));
    addEvent(password, 'blur', () => validate(password, validatePassword, 'password'));
    addEvent(confirmPassword, 'blur', () => {
        const result = validatePasswordMatch(password.value, confirmPassword.value);
        result.isValid ? clearError('confirmPassword') : showError('confirmPassword', result.message);
    });

    addEvent(form, 'submit', (e) => {
        e.preventDefault();
        clearAllErrors(form);
        
        const validations = [
            validateRequired(fullname.value),
            validateEmail(email.value),
            validateUsername(username.value),
            validatePassword(password.value),
            validatePasswordMatch(password.value, confirmPassword.value)
        ];

        if (!validations.every(v => v.isValid) || !terms.checked) {
            !terms.checked && showError('terms', 'Accept terms to continue');
            return;
        }

        setItem(STORAGE_KEYS.USER_DATA, {
            fullname: fullname.value,
            email: email.value,
            username: username.value,
            loggedIn: true,
            registrationTime: new Date().toISOString()
        });

        form.classList.add('loading');
        setTimeout(() => window.location.href = ROUTES.HOME, 500);
    });
}

const checkAuth = () => {
    const userData = getItem(STORAGE_KEYS.USER_DATA);
    const currentPage = window.location.pathname.split('/').pop();
    !userData && !PUBLIC_PAGES.includes(currentPage) && (window.location.href = ROUTES.LOGIN);
};

export const logout = () => {
    removeItem(STORAGE_KEYS.USER_DATA);
    window.location.href = ROUTES.LOGIN;
};

checkAuth();
