import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

const createResult = (isValid, message = '') => ({ isValid, message });

export const validateRequired = (value) => {
  const isValid = Boolean(value?.trim());
  return createResult(isValid, isValid ? '' : ERROR_MESSAGES.REQUIRED_FIELD);
};

export const validateEmail = (email) => {
  if (!email?.trim()) return createResult(false, `Email ${ERROR_MESSAGES.REQUIRED_FIELD}`);
  const isValid = VALIDATION_RULES.EMAIL_PATTERN.test(email);
  return createResult(isValid, isValid ? '' : ERROR_MESSAGES.INVALID_EMAIL);
};

export const validateUsername = (username) => {
  if (!username?.trim()) return createResult(false, `Username ${ERROR_MESSAGES.REQUIRED_FIELD}`);
  if (username.length < VALIDATION_RULES.MIN_USERNAME_LENGTH) return createResult(false, ERROR_MESSAGES.USERNAME_TOO_SHORT);
  if (username.length > VALIDATION_RULES.MAX_USERNAME_LENGTH) return createResult(false, ERROR_MESSAGES.USERNAME_TOO_LONG);
  const isValid = VALIDATION_RULES.USERNAME_PATTERN.test(username);
  return createResult(isValid, isValid ? '' : ERROR_MESSAGES.INVALID_USERNAME);
};

export const validatePassword = (password) => {
  if (!password?.length) return createResult(false, `Password ${ERROR_MESSAGES.REQUIRED_FIELD}`);
  const isValid = password.length >= VALIDATION_RULES.MIN_PASSWORD_LENGTH;
  return createResult(isValid, isValid ? '' : ERROR_MESSAGES.PASSWORD_TOO_SHORT);
};

export const validatePasswordMatch = (password, confirmPassword) => {
  const isValid = password === confirmPassword;
  return createResult(isValid, isValid ? '' : ERROR_MESSAGES.PASSWORDS_NOT_MATCH);
};
