/**
 * Phone Input Component (Phase 1)
 *
 * Phone number input form with SMS code sending functionality.
 *
 * Features:
 * - Phone input with default country code (+34 Spain)
 * - Real-time phone formatting
 * - Phone validation
 * - Loading state during API call
 * - Success/error messages
 * - Responsive design
 */

import React, { useState } from 'react';
import { Button } from '../shared/Button.js';
import { Input } from '../shared/Input.js';
import { useAuthFlow } from '../../hooks/useAuthFlow.js';

export interface PhoneInputProps {
  /**
   * Callback when code is successfully sent
   * Receives the phone number that was verified
   */
  onCodeSent: (phone: string) => void;
}

/**
 * Validate Spanish phone number format
 * Accepts: +34XXXXXXXXX (9 digits after +34)
 */
const isValidSpanishPhone = (phone: string): boolean => {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');

  // Check format: +34 followed by 9 digits
  const phoneRegex = /^\+34\d{9}$/;
  return phoneRegex.test(cleaned);
};

/**
 * Format phone number as user types
 * Formats: +34 600 000 000
 */
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits except +
  const cleaned = value.replace(/[^\d+]/g, '');

  // Ensure it starts with +34
  if (!cleaned.startsWith('+34')) {
    return '+34';
  }

  // Extract digits after +34
  const digits = cleaned.slice(3);

  // Format as: +34 600 000 000
  if (digits.length === 0) {
    return '+34';
  } else if (digits.length <= 3) {
    return `+34 ${digits}`;
  } else if (digits.length <= 6) {
    return `+34 ${digits.slice(0, 3)} ${digits.slice(3)}`;
  } else if (digits.length <= 9) {
    return `+34 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  } else {
    // Limit to 9 digits
    return `+34 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }
};

/**
 * PhoneInput Component
 */
export const PhoneInput: React.FC<PhoneInputProps> = ({ onCodeSent }) => {
  const [phone, setPhone] = useState<string>('+34');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const { sendCodeHandler, isLoading, error, clearError } = useAuthFlow();

  /**
   * Handle phone input change
   */
  const handlePhoneChange = (value: string): void => {
    clearError();
    setShowSuccess(false);
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Remove spaces for API call
    const cleanedPhone = phone.replace(/\s/g, '');

    // Validate
    if (!isValidSpanishPhone(cleanedPhone)) {
      return;
    }

    // Send code
    const success = await sendCodeHandler(cleanedPhone);

    if (success) {
      setShowSuccess(true);
      // Call parent callback after a short delay to show success message
      setTimeout(() => {
        onCodeSent(cleanedPhone);
      }, 1500);
    }
  };

  // Check if phone is valid
  const cleanedPhone = phone.replace(/\s/g, '');
  const isValid = isValidSpanishPhone(cleanedPhone);
  const isButtonDisabled = !isValid || isLoading;

  return (
    <div className="w-full max-w-md mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-[#000000] mb-2">
          Atelier de Bodas
        </h1>
        <p className="text-gray-600">
          Ingresa tu número de teléfono para continuar
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="tel"
          label="Número de teléfono"
          placeholder="+34 600 000 000"
          value={phone}
          onChange={handlePhoneChange}
          {...(error ? { error } : (!isValid && phone.length > 4 ? { error: 'Número de teléfono no válido' } : {}))}
          autoFocus
          maxLength={16} // +34 XXX XXX XXX = 16 chars with spaces
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isButtonDisabled}
        >
          {isLoading ? 'Enviando...' : 'Enviar Código'}
        </Button>

        {/* Success Message */}
        {showSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm text-center">
              ✓ Código enviado correctamente. Revisa tu teléfono.
            </p>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Recibirás un código de verificación por SMS en el número proporcionado.
        </p>
      </form>
    </div>
  );
};
