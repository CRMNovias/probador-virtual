/**
 * Loader Component
 *
 * Simple loading spinner with optional text message.
 * Can be used inline or centered on screen.
 *
 * Brand Colors:
 * - Primary: #333333 (dark gray)
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
 * Loader Component - UX Mockup Design
 * Features: Sparkles icon + progress bar animation
 */
export const Loader: React.FC<LoaderProps> = ({
  text,
  inline = false,
  size = 'md',
}) => {
  const sizeClasses = getSizeClasses(size);

  // Sparkles Icon (from mockup)
  const sparklesIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses} text-[#333333] animate-pulse`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2L9.8 8.6L2 9.4L7.4 14.4L6.2 21.8L12 18.2L17.8 21.8L16.6 14.4L22 9.4L14.2 8.6L12 2z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );

  // Inline variant (for buttons, etc.)
  if (inline) {
    return (
      <span className="inline-flex items-center gap-2">
        {sparklesIcon}
        {text && <span className="text-sm">{text}</span>}
      </span>
    );
  }

  // Centered variant (for full screen loading) - Mockup design
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center text-[#333333]">
      {sparklesIcon}
      {text && <p className="text-lg font-light">{text}</p>}

      {/* Progress Bar (animated) */}
      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-gray-400 to-gray-600 animate-loader-progress"></div>
      </div>
    </div>
  );
};
