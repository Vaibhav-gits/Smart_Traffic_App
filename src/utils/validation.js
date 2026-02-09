/**
 * Email validation
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Password validation
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Vehicle number validation (Indian format basic)
 * Example: MH49AB1234
 */
export const isValidVehicleNumber = vehicleNumber => {
  const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
  return regex.test(vehicleNumber);
};

/**
 * Empty field check
 */
export const isEmpty = value => {
  return !value || value.trim().length === 0;
};
