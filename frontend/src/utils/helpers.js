/**
 * Generates a default avatar URL based on a name
 */
export const getDefaultAvatar = (name) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;

/**
 * Normalizes user data to ensure consistent field names
 */
export const normalizeUserData = (userData) => {
  if (!userData) return null;
  
  return {
    ...userData,
    userId: userData.userId || userData.id,
    avatar: userData.avatar || getDefaultAvatar(userData.username),
  };
};

/**
 * Formats a timestamp into a readable time string
 */
export const formatTime = (timestamp) => {
  try {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

/**
 * Formats a date into a readable date string
 */
export const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

/**
 * Debounces a function call
 */
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Truncates a string to a maximum length
 */
export const truncate = (str, maxLength = 50) => 
  (!str || str.length <= maxLength) ? str : `${str.slice(0, maxLength)}...`;

/**
 * Checks if a value is empty
 */
export const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === 'string') return !value.trim();
  if (Array.isArray(value)) return !value.length;
  if (typeof value === 'object') return !Object.keys(value).length;
  return false;
};
