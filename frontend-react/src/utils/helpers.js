// Helper utility functions
import { AppConstants } from '../constants/AppConstants';

export const showSnackBar = (message, duration = 3000) => {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: ${AppConstants.themeColor};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    animation: slideIn 0.3s ease-in-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in-out';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
};

export const validateEmail = (email) => {
  return AppConstants.emailRegex.test(email);
};

export const validatePhone = (phone) => {
  return AppConstants.phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  return password && password.length >= AppConstants.passwordMinLength;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text, maxLength = 50) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};