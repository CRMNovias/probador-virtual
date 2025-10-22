/**
 * Code Verification Component (Phase 1)
 *
 * 6-digit SMS code verification input with countdown timer.
 *
 * Features:
 * - 6 individual code input boxes
 * - Auto-focus and auto-advance between inputs
 * - Paste support (pastes full code automatically)
 * - Countdown timer (5 minutes by default)
 * - Resend code with cooldown
 * - Loading state during verification
 * - Error handling
 * - Responsive design
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../shared/Button.js';
import { useAuthFlow } from '../../hooks/useAuthFlow.js';

export interface CodeVerificationProps {
  /**
   * Phone number that received the code
   */
  phone: string;

  /**
   * Callback when code is successfully verified
   */
  onVerified: () => void;

  /**
   * Callback to go back to phone input
   */
  onBack: () => void;

  /**
   * Code expiration time in seconds (default: 300 = 5 minutes)
   */
  expirationTime?: number;

  /**
   * Resend cooldown in seconds (default: 60)
   */
  resendCooldown?: number;
}

/**
 * Format phone for display (e.g., +34 6** *** 123)
 */
const formatPhoneForDisplay = (phone: string): string => {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('+34')) {
    const last3 = cleaned.slice(-3);
    return `+34 6** *** ${last3}`;
  }
  return phone;
};

/**
 * Format time as MM:SS
 */
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const CODE_LENGTH = 6;

/**
 * CodeVerification Component
 */
export const CodeVerification: React.FC<CodeVerificationProps> = ({
  phone,
  onVerified,
  onBack,
  expirationTime = 300,
  resendCooldown = 60,
}) => {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState<number>(expirationTime);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendCountdown, setResendCountdown] = useState<number>(resendCooldown);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyCodeHandler, sendCodeHandler, isLoading, error, clearError } = useAuthFlow();

  /**
   * Handle input change for a specific box
   */
  const handleChange = (index: number, value: string): void => {
    clearError();

    // Only allow digits
    const digit = value.replace(/[^\d]/g, '');
    if (digit.length === 0) {
      // Allow deletion
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      return;
    }

    // Update code
    const newCode = [...code];
    const lastDigit = digit[digit.length - 1];
    newCode[index] = lastDigit || ''; // Take last digit if multiple
    setCode(newCode);

    // Auto-advance to next input
    if (index < CODE_LENGTH - 1 && digit.length > 0) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when code is complete
    if (index === CODE_LENGTH - 1 && newCode.every((d) => d !== '')) {
      submitCode(newCode.join(''));
    }
  };

  /**
   * Handle keydown (backspace navigation)
   */
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Handle paste event (paste full code)
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/[^\d]/g, '').slice(0, CODE_LENGTH);

    if (digits.length === CODE_LENGTH) {
      const newCode = digits.split('');
      setCode(newCode);
      inputRefs.current[CODE_LENGTH - 1]?.focus();
      // Auto-submit
      submitCode(digits);
    }
  };

  /**
   * Submit code for verification
   */
  const submitCode = async (fullCode: string): Promise<void> => {
    const cleanedPhone = phone.replace(/\s/g, '');
    const success = await verifyCodeHandler(cleanedPhone, fullCode);

    if (success) {
      onVerified();
    } else {
      // Clear code on error
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  /**
   * Handle resend code
   */
  const handleResend = async (): Promise<void> => {
    if (!canResend || isLoading) return;

    const cleanedPhone = phone.replace(/\s/g, '');
    const success = await sendCodeHandler(cleanedPhone);

    if (success) {
      // Reset timers
      setTimeLeft(expirationTime);
      setCanResend(false);
      setResendCountdown(resendCooldown);
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  /**
   * Countdown timer effect
   */
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /**
   * Resend countdown effect
   */
  useEffect(() => {
    if (canResend) return;

    if (resendCountdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [canResend, resendCountdown]);

  /**
   * Auto-focus first input on mount
   */
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const codeExpired = timeLeft <= 0;
  const formattedPhone = formatPhoneForDisplay(phone);

  return (
    <div className="w-full max-w-md mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-[#4a3f35] mb-2">
          Verificación de Código
        </h1>
        <p className="text-gray-600">
          Hemos enviado un código de 6 dígitos a
        </p>
        <p className="text-gray-900 font-medium mt-1">{formattedPhone}</p>
      </div>

      {/* Code Inputs */}
      <div className="flex justify-center gap-2 mb-6">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={isLoading || codeExpired}
            className={`
              w-12 h-14 text-center text-xl font-semibold
              border-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#8C6F5A] focus:border-transparent
              transition-all
              ${
                error
                  ? 'border-red-500 bg-red-50'
                  : digit
                  ? 'border-[#8C6F5A] bg-gray-50'
                  : 'border-gray-300 bg-white'
              }
              ${isLoading || codeExpired ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-label={`Código dígito ${index + 1}`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Timer */}
      <div className="text-center mb-6">
        {codeExpired ? (
          <p className="text-red-600 text-sm font-medium">
            El código ha expirado. Por favor, solicita uno nuevo.
          </p>
        ) : (
          <p className="text-gray-600 text-sm">
            Código expira en:{' '}
            <span className="font-mono font-semibold text-[#8C6F5A]">
              {formatTime(timeLeft)}
            </span>
          </p>
        )}
      </div>

      {/* Resend Button */}
      <div className="text-center mb-6">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="text-[#8C6F5A] text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reenviar código
          </button>
        ) : (
          <p className="text-gray-500 text-sm">
            Podrás reenviar el código en{' '}
            <span className="font-mono font-semibold">{resendCountdown}s</span>
          </p>
        )}
      </div>

      {/* Back Button */}
      <Button
        type="button"
        variant="secondary"
        size="md"
        fullWidth
        onClick={onBack}
        disabled={isLoading}
      >
        Cambiar número de teléfono
      </Button>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center mt-6">
        Si no has recibido el código, revisa tu bandeja de mensajes SMS o
        solicita uno nuevo.
      </p>
    </div>
  );
};
