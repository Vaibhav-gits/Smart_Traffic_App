import { FINES } from './constants';

/**
 * Calculate total fine amount
 * @param {Array} violations
 * @returns {number}
 */
export const calculateFine = (violations = []) => {
  let total = 0;

  violations.forEach((violation) => {
    if (violation === 'No Helmet') total += FINES.NO_HELMET;
    if (violation === 'No Seatbelt') total += FINES.NO_SEATBELT;
    if (violation === 'Signal Jump') total += FINES.SIGNAL_JUMP;
  });

  return total;
};

/**
 * Format date to readable format
 * @param {string} date
 * @returns {string}
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};

/**
 * Capitalize first letter
 */
export const capitalize = (text = '') => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Get violation color
 */
export const getViolationColor = (violation) => {
  switch (violation) {
    case 'No Helmet':
      return '#E53935';
    case 'No Seatbelt':
      return '#FB8C00';
    default:
      return '#000';
  }
};
