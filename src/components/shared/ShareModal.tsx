/**
 * ShareModal Component (Phase 2)
 *
 * Modal dialog for sharing try-on images.
 * Displays shareable link and provides copy-to-clipboard functionality.
 */

import React, { useState, useEffect } from 'react';

export interface ShareModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Try-on ID for building the share URL
   */
  tryOnId: string;

  /**
   * Dress ID to include in the share URL
   */
  dressId: string;

  /**
   * Callback when modal should close
   */
  onClose: () => void;
}

/**
 * ShareModal Component
 */
export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  tryOnId,
  dressId,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [supportsWebShare, setSupportsWebShare] = useState(false);

  // Build full share URL with dressId
  const shareUrl = `${window.location.origin}/share/${tryOnId}?dressId=${dressId}`;

  // Check if Web Share API is supported
  useEffect(() => {
    setSupportsWebShare(!!navigator.share);
  }, []);

  // Debug logs
  useEffect(() => {
    if (isOpen) {
      console.log('[ShareModal] Modal opened with:', { tryOnId, dressId, shareUrl, supportsWebShare });
    }
  }, [isOpen, tryOnId, dressId, shareUrl, supportsWebShare]);

  /**
   * Share using native Web Share API (mobile)
   */
  const handleNativeShare = async (): Promise<void> => {
    console.log('[ShareModal] Native share button clicked');

    try {
      if (!navigator.share) {
        throw new Error('Web Share API not supported');
      }

      await navigator.share({
        title: 'Prueba Virtual - Atelier de Bodas',
        text: 'Mira mi prueba virtual de vestido de novia',
        url: shareUrl,
      });

      console.log('[ShareModal] Shared successfully via Web Share API');
    } catch (err: any) {
      // User cancelled the share or share failed
      if (err.name !== 'AbortError') {
        console.error('[ShareModal] Error sharing:', err);
        // Fallback to copy
        handleCopy();
      }
    }
  };

  /**
   * Copy share URL to clipboard
   */
  const handleCopy = async (): Promise<void> => {
    console.log('[ShareModal] Copy button clicked, shareUrl:', shareUrl);

    try {
      // Check if Clipboard API is available
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }

      await navigator.clipboard.writeText(shareUrl);
      console.log('[ShareModal] Copied to clipboard successfully');
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('[ShareModal] Failed to copy to clipboard:', err);

      // Fallback: select text for manual copy
      const input = document.getElementById('share-url-input') as HTMLInputElement;
      if (input) {
        input.select();
        input.setSelectionRange(0, 99999); // For mobile devices

        // Try legacy execCommand as fallback
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            console.log('[ShareModal] Copied using execCommand fallback');
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 2000);
          } else {
            alert('Por favor, copia el enlace manualmente (ya está seleccionado).');
          }
        } catch (execErr) {
          console.error('[ShareModal] execCommand also failed:', execErr);
          alert('Por favor, copia el enlace manualmente (ya está seleccionado).');
        }
      }
    }
  };

  /**
   * Reset copied state when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-[#000000]">
            Compartir Prueba Virtual
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Cerrar"
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

        {/* Content */}
        <>
          {/* Share Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-[#333333]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </div>
            </div>

            {/* Description */}
            <p className="text-center text-gray-600 mb-6">
              Comparte este enlace con quien quieras. Cualquier persona con el enlace
              podrá ver tu prueba virtual.
            </p>

            {/* URL Input and Actions */}
            <div className="mb-6">
              <label
                htmlFor="share-url-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enlace para compartir
              </label>
              <div className="flex gap-2">
                <input
                  id="share-url-input"
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#333333] focus:border-transparent"
                />

                {/* Show native share button on mobile if supported, otherwise show copy */}
                {supportsWebShare ? (
                  <button
                    onClick={handleNativeShare}
                    className="px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 bg-[#333333] text-white hover:bg-[#1a1a1a] hover:shadow-lg"
                    aria-label="Compartir"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    {/* Text hidden on mobile */}
                    <span className="hidden sm:inline">Compartir</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCopy}
                    className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-[#333333] text-white hover:bg-[#1a1a1a] hover:shadow-lg'
                    }`}
                    aria-label={copied ? 'Copiado' : 'Copiar enlace'}
                  >
                    {copied ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {/* Text hidden on mobile */}
                        <span className="hidden sm:inline">Copiado</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        {/* Text hidden on mobile */}
                        <span className="hidden sm:inline">Copiar</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-blue-800">
                  Este enlace es público y no requiere autenticación para visualizarlo.
                </p>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cerrar
            </button>
        </>
      </div>
    </div>
  );
};
