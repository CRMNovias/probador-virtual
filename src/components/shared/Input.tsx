/**
 * Input Component
 *
 * Reusable form input with validation, labels, and icon support.
 * Follows Tailwind CSS utility-first approach with brand colors.
 *
 * Brand Colors:
 * - Primary: #8C6F5A (beige/taupe)
 * - Background: #F8F7F5 (light cream)
 * - Error: Red-500/Red-600
 */

import React from 'react';

export interface InputProps {
  /**
   * Input type
   * @default 'text'
   */
  type?: 'text' | 'email' | 'tel' | 'number';

  /**
   * Input label
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Input value
   */
  value: string;

  /**
   * Change handler
   */
  onChange: (value: string) => void;

  /**
   * Error message (shows red border + message)
   */
  error?: string;

  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon element
   */
  rightIcon?: React.ReactNode;

  /**
   * Disable input
   * @default false
   */
  disabled?: boolean;

  /**
   * Auto-focus on mount
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Max length
   */
  maxLength?: number;

  /**
   * Input name attribute
   */
  name?: string;

  /**
   * Input ID attribute
   */
  id?: string;

  /**
   * Additional CSS classes for input
   */
  className?: string;
}

/**
 * Input Component
 */
export const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  leftIcon,
  rightIcon,
  disabled = false,
  autoFocus = false,
  maxLength,
  name,
  id,
  className = '',
}) => {
  // Generate ID if not provided (for label association)
  const inputId = id || name || `input-${Math.random().toString(36).substring(7)}`;

  // Base input classes
  const baseClasses =
    'w-full px-4 py-2 rounded-lg border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100';

  // Error/valid state classes
  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900 placeholder-red-400'
    : 'border-gray-300 focus:border-[#8C6F5A] focus:ring-[#8C6F5A]';

  // Padding adjustments for icons
  const iconPaddingClasses = leftIcon
    ? 'pl-10'
    : rightIcon
    ? 'pr-10'
    : '';

  const allInputClasses = `${baseClasses} ${stateClasses} ${iconPaddingClasses} ${className}`.trim();

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Input container (for icon positioning) */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={maxLength}
          className={allInputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};
