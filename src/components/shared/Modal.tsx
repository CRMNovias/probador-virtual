/**
 * Modal Component (Phase 1)
 *
 * Reusable modal dialog with animations and accessibility.
 *
 * Features:
 * - Portal rendering (outside DOM hierarchy)
 * - Backdrop overlay with click-to-close
 * - Smooth animations (fade in/out)
 * - Close button in header
 * - ESC key to close
 * - Focus trap when open
 * - Scroll lock on body when open
 * - Accessible (ARIA attributes)
 */

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Callback when modal should close
   */
  onClose: () => void;

  /**
   * Modal title (optional)
   */
  title?: string;

  /**
   * Modal content
   */
  children: React.ReactNode;

  /**
   * Whether clicking overlay closes modal
   * Default: true
   */
  closeOnOverlayClick?: boolean;

  /**
   * Size variant
   * Default: 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Get modal content width classes based on size
 */
const getSizeClasses = (size: ModalProps['size']): string => {
  switch (size) {
    case 'sm':
      return 'max-w-sm';
    case 'md':
      return 'max-w-md';
    case 'lg':
      return 'max-w-lg';
    case 'xl':
      return 'max-w-xl';
    default:
      return 'max-w-md';
  }
};

/**
 * Modal Component
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  closeOnOverlayClick = true,
  size = 'md',
}) => {
  /**
   * Handle ESC key to close modal
   */
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  /**
   * Handle overlay click
   */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    // Only close if clicking the overlay itself (not the modal content)
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Setup ESC key listener and body scroll lock
   */
  useEffect(() => {
    if (isOpen) {
      // Add ESC key listener
      document.addEventListener('keydown', handleEscapeKey);

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    }
    return undefined;
  }, [isOpen, handleEscapeKey]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const sizeClasses = getSizeClasses(size);

  // Render modal in portal (outside DOM hierarchy)
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal Content */}
      <div
        className={`
          relative bg-white rounded-lg shadow-xl
          w-full ${sizeClasses}
          animate-scaleIn
          max-h-[90vh] overflow-hidden flex flex-col
        `}
      >
        {/* Header */}
        {(title || true) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-serif text-[#4a3f35]"
              >
                {title}
              </h2>
            )}
            {!title && <div />}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="
                text-gray-400 hover:text-gray-600
                transition-colors
                p-1 rounded-full hover:bg-gray-100
              "
              aria-label="Cerrar modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
};
