/**
 * Button Component
 *
 * Reusable button with multiple variants, sizes, and states.
 * Follows Tailwind CSS utility-first approach with brand colors.
 *
 * Brand Colors:
 * - Primary: #8C6F5A (beige/taupe)
 * - Background: #F8F7F5 (light cream)
 */

import React from 'react';

export interface ButtonProps {
  /**
   * Button content
   */
  children: React.ReactNode;

  /**
   * Visual variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger';

  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Show loading spinner
   * @default false
   */
  loading?: boolean;

  /**
   * Disable button
   * @default false
   */
  disabled?: boolean;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Button type
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Get variant-specific classes
 */
const getVariantClasses = (variant: ButtonProps['variant']): string => {
  switch (variant) {
    case 'primary':
      return 'bg-[#8C6F5A] text-white hover:bg-[#7a5f4a] focus:ring-[#8C6F5A] focus:ring-offset-2';
    case 'secondary':
      return 'bg-white text-[#8C6F5A] border-2 border-[#8C6F5A] hover:bg-[#F8F7F5] focus:ring-[#8C6F5A] focus:ring-offset-2';
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-offset-2';
    default:
      return 'bg-[#8C6F5A] text-white hover:bg-[#7a5f4a] focus:ring-[#8C6F5A] focus:ring-offset-2';
  }
};

/**
 * Get size-specific classes
 */
const getSizeClasses = (size: ButtonProps['size']): string => {
  switch (size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm';
    case 'md':
      return 'px-4 py-2 text-base';
    case 'lg':
      return 'px-6 py-3 text-lg';
    default:
      return 'px-4 py-2 text-base';
  }
};

/**
 * Button Component
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
}) => {
  const isDisabled = disabled || loading;

  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  const widthClasses = fullWidth ? 'w-full' : '';

  const allClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={allClasses}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Cargando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
