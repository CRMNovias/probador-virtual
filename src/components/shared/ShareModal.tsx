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
  const [isMobile, setIsMobile] = useState(false);

  // Build full share URL with dressId
  const shareUrl = `${window.location.origin}/share/${tryOnId}?dressId=${dressId}`;

  // Detect mobile
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    setIsMobile(mobile);
    console.log('[ShareModal] Device detection:', { mobile });
  }, []);

  // Debug logs
  useEffect(() => {
    if (isOpen) {
      console.log('[ShareModal] Modal opened with:', { tryOnId, dressId, shareUrl, isMobile });
    }
  }, [isOpen, tryOnId, dressId, shareUrl, isMobile]);

  /**
   * Share via WhatsApp
   */
  const handleWhatsAppShare = (): void => {
    console.log('[ShareModal] WhatsApp share clicked');
    const message = encodeURIComponent(`Mira mi prueba virtual de vestido de novia: ${shareUrl}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  /**
   * Share via Email
   */
  const handleEmailShare = (): void => {
    console.log('[ShareModal] Email share clicked');
    const subject = encodeURIComponent('Prueba Virtual - Atelier de Bodas');
    const body = encodeURIComponent(`Hola,\n\nMira mi prueba virtual de vestido de novia:\n\n${shareUrl}\n\nSaludos`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
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

            {/* URL Input - Desktop only */}
            {!isMobile && (
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
                  <button
                    onClick={handleCopy}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
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
                        <span>Copiado</span>
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
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Share Options - 3 buttons */}
            {isMobile && (
              <div className="mb-6 space-y-3">
                <p className="text-sm font-medium text-gray-700 mb-3">Compartir por:</p>

                {/* WhatsApp Button */}
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 bg-[#25D366] text-white hover:bg-[#20BA5A] hover:shadow-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>

                {/* Email Button */}
                <button
                  onClick={handleEmailShare}
                  className="w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 bg-[#333333] text-white hover:bg-[#1a1a1a] hover:shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email</span>
                </button>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopy}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copiar enlace</span>
                    </>
                  )}
                </button>
              </div>
            )}

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
