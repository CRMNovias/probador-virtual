/**
 * Input Validators
 * 
 * Validation functions for user inputs
 */

/**
 * Validate Spanish phone number format
 * @param phone - Phone number to validate
 * @returns True if valid Spanish phone format
 */
export const isValidSpanishPhone = (phone: string): boolean => {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Check for +34 followed by 9 digits
  const spanishPhoneRegex = /^\+34[6-9]\d{8}$/;
  
  return spanishPhoneRegex.test(cleaned);
};

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate verification code format
 * @param code - Code to validate
 * @returns True if valid 6-digit code
 */
export const isValidVerificationCode = (code: string): boolean => {
  const codeRegex = /^\d{6}$/;
  return codeRegex.test(code);
};

/**
 * Validate string is not empty
 * @param value - String to validate
 * @returns True if not empty
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validate minimum length
 * @param value - String to validate
 * @param minLength - Minimum length required
 * @returns True if meets minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};
