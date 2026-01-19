/**
 * Helper function to build full avatar URL
 * Handles relative paths and fixes wrong host issues from Django backend
 * 
 * @param {string|null} avatarPath - The avatar path from API
 * @returns {string|null} - Full avatar URL or null
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  
  // If it's already a full URL, check if it needs the port fixed
  if (avatarPath.startsWith('http')) {
    // Replace https://localhost without port with current origin (includes port)
    if (avatarPath.startsWith('https://localhost/')) {
      return avatarPath.replace('https://localhost/', `${window.location.origin}/`);
    }
    // Replace http://localhost without port
    if (avatarPath.startsWith('http://localhost/')) {
      return avatarPath.replace('http://localhost/', `${window.location.origin}/`);
    }
    return avatarPath;
  }
  
  // If it starts with // (protocol-relative URL)
  if (avatarPath.startsWith('//')) {
    return `${window.location.protocol}${avatarPath}`;
  }
  
  // If the avatar path is relative with leading slash
  if (avatarPath.startsWith('/')) {
    return `${window.location.origin}${avatarPath}`;
  }
  
  // For paths without leading slash (like 'media/avatars/...')
  return `${window.location.origin}/${avatarPath}`;
};

/**
 * Check if a string is a valid image URL or data URL
 * @param {string|null} url - URL to check
 * @returns {boolean}
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('data:') || 
         url.startsWith('http') || 
         url.startsWith('//') ||
         url.startsWith('/media/') ||
         url.includes('/media/');
};

export default getAvatarUrl;
