/**
 * Utility functions for handling timestamps safely across the app
 */

/**
 * Safely format a timestamp to locale time string
 * @param {Date|string|number} timestamp - The timestamp to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted time string
 */
export const formatTimestamp = (timestamp, options = { hour: '2-digit', minute: '2-digit' }) => {
  try {
    let date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }
    
    return date.toLocaleTimeString([], options);
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid time';
  }
};

/**
 * Safely format a timestamp to locale date string
 * @param {Date|string|number} timestamp - The timestamp to format
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  try {
    let date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Get relative time (e.g., "2 minutes ago", "Yesterday")
 * @param {Date|string|number} timestamp - The timestamp to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (timestamp) => {
  try {
    let date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return 'Unknown time';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }
    
    const now = new Date();
    const diffTime = now - date;
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error getting relative time:', error);
    return 'Unknown time';
  }
};

/**
 * Normalize a timestamp to ensure it's a valid Date object
 * @param {Date|string|number} timestamp - Timestamp to normalize
 * @returns {Date} Normalized Date object
 */
export const normalizeTimestamp = (timestamp) => {
  if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
    return timestamp;
  }
  
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  
  return new Date();
};

/**
 * Check if a timestamp is valid
 * @param {any} timestamp - Timestamp to check
 * @returns {boolean} True if valid timestamp
 */
export const isValidTimestamp = (timestamp) => {
  try {
    const date = normalizeTimestamp(timestamp);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};