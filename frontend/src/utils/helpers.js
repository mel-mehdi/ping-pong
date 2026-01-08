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
