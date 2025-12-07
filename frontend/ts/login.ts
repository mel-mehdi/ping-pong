import { STORAGE_KEYS, ROUTES } from './utils/constants.ts';
import { setItem } from './utils/storage.ts';
import { validateRequired, showError, clearError, clearAllErrors } from './utils/validation.ts';
import { getById, addEvent } from './utils/dom.ts';
import api from './utils/api.ts';

const validate = (input, field) => {
    const result = validateRequired(input.value);
    result.isValid ? clearError(field) : showError(field, field.charAt(0).toUpperCase() + field.slice(1) + ' ' + result.message);
};

document.addEventListener('DOMContentLoaded', () => {
    const form = getById('loginForm');
    form && initLoginForm(form);
});

function initLoginForm(form) {
    const username = getById('username');
    const password = getById('password');

    addEvent(username, 'blur', () => validate(username, 'username'));
    addEvent(password, 'blur', () => validate(password, 'password'));

    addEvent(form, 'submit', async (e) => {
        e.preventDefault();
        clearAllErrors(form);
        
        const usr = username.value;
        const pwd = password.value;

        if (!validateRequired(usr).isValid || !validateRequired(pwd).isValid) return;

        form.classList.add('loading');

        try {
            const { user } = await api.login(usr, pwd);
            setItem(STORAGE_KEYS.USER_DATA, {
                userId: user.id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                avatar: user.avatar,
                loggedIn: true,
                loginTime: new Date().toISOString()
            });
            setTimeout(() => window.location.href = ROUTES.HOME, 500);
        } catch (error) {
            form.classList.remove('loading');
            showError('password', error.message.includes('credentials') ? 'Invalid credentials' : 'Login failed');
        }
    });
}
