/**
 * User Registration Component
 *
 * Form for capturing user details (name and email) after phone verification.
 * This is shown only for new users on their first login.
 *
 * Features:
 * - Name input (required)
 * - Email input (required, validated)
 * - Form validation
 * - Loading state during submission
 * - Error handling
 * - Responsive design
 */

import React, { useState } from 'react';
import { Button } from '../shared/Button.js';
import { Input } from '../shared/Input.js';
import { isValidEmail } from '../../utils/validators.js';
import { createProfile } from '../../services/userService.js';
import { useAuth } from '../../context/AuthContext.js';
import { errorMessages } from '../../constants/errorMessages.js';

export interface UserRegistrationProps {
  /**
   * Phone number of the user
   */
  phone: string;

  /**
   * Callback when registration is completed successfully
   */
  onCompleted: () => void;
}

/**
 * UserRegistration Component
 */
export const UserRegistration: React.FC<UserRegistrationProps> = ({
  phone,
  onCompleted,
}) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const { updateUser } = useAuth();

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create user profile - backend now returns complete profile
      const response = await createProfile({
        phone,
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      console.log('[UserRegistration] Profile created:', response.data.user);

      // Update auth context with new user data from response
      updateUser(response.data.user);

      // Call completion callback
      onCompleted();
    } catch (err) {
      console.error('Error creating user profile:', err);
      setGeneralError(errorMessages.UNKNOWN_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-[#4a3f35] mb-2">
          Completa tu Perfil
        </h1>
        <p className="text-gray-600">
          Bienvenida! Por favor, completa tus datos para continuar.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div>
          <Input
            id="name"
            type="text"
            label="Nombre completo"
            value={name}
            onChange={(value) => {
              setName(value);
              if (errors.name) {
                const { name: _, ...rest } = errors;
                setErrors(rest);
              }
            }}
            error={errors.name || ''}
            disabled={isLoading}
            autoFocus
            maxLength={100}
            placeholder="Ej: María García"
          />
        </div>

        {/* Email Input */}
        <div>
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(value) => {
              setEmail(value);
              if (errors.email) {
                const { email: _, ...rest } = errors;
                setErrors(rest);
              }
            }}
            error={errors.email || ''}
            disabled={isLoading}
            maxLength={100}
            placeholder="Ej: maria@email.com"
          />
        </div>

        {/* General Error */}
        {generalError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm text-center">{generalError}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={isLoading}
          loading={isLoading}
        >
          Continuar
        </Button>

        {/* Privacy Notice */}
        <p className="text-xs text-gray-500 text-center">
          Al continuar, aceptas que almacenaremos tu información para mejorar tu
          experiencia en la aplicación.
        </p>
      </form>
    </div>
  );
};
