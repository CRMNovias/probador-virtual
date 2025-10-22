/**
 * Loader Component
 *
 * Simple loading spinner with optional text message.
 * Can be used inline or centered on screen.
 *
 * Brand Colors:
 * - Primary: #8C6F5A (beige/taupe)
 */

import React from 'react';

export interface LoaderProps {
  /**
   * Optional loading text
   */
  text?: string;

  /**
   * Display inline instead of centered
   * @default false
   */
  inline?: boolean;

  /**
   * Spinner size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Get size classes for spinner
 */
const getSizeClasses = (size: LoaderProps['size']): string => {
  switch (size) {
    case 'sm':
      return 'h-6 w-6';
    case 'md':
      return 'h-10 w-10';
    case 'lg':
      return 'h-16 w-16';
    default:
      return 'h-10 w-10';
  }
};

/**
 * Loader Component
 */
export const Loader: React.FC<LoaderProps> = ({
  text,
  inline = false,
  size = 'md',
}) => {
  const sizeClasses = getSizeClasses(size);

  // Spinner SVG
  const spinner = (
    <svg
      className={`animate-spin ${sizeClasses} text-[#8C6F5A]`}
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
  );

  // Inline variant (for buttons, etc.)
  if (inline) {
    return (
      <span className="inline-flex items-center gap-2">
        {spinner}
        {text && <span className="text-sm">{text}</span>}
      </span>
    );
  }

  // Centered variant (for full screen loading)
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      {spinner}
      {text && (
        <p className="text-gray-600 text-center max-w-md">{text}</p>
      )}
    </div>
  );
};
