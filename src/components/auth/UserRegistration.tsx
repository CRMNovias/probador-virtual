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
import type { AxiosError } from 'axios';
import { Button } from '../shared/Button.js';
import { Input } from '../shared/Input.js';
import { isValidEmail } from '../../utils/validators.js';
import { createProfile } from '../../services/userService.js';
import { useAuth } from '../../context/AuthContext.js';
import { errorMessages } from '../../constants/errorMessages.js';
import type { UserProfile } from '../../types/user.js';

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
  const { updateUser, user: currentUser, login } = useAuth();

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
      const response = await createProfile({
        phone,
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      console.log('[UserRegistration] Profile completed:', {
        merged: response.data.merged,
        userId: response.data.user.id,
      });

      const userProfile: UserProfile = {
        id: String(response.data.user.id),
        phone: response.data.user.phone,
        name: response.data.user.name ?? name.trim(),
        email: response.data.user.email ?? email.trim().toLowerCase(),
        createdAt: response.data.user.createdAt ?? currentUser?.createdAt ?? new Date().toISOString(),
        hasAvatar: response.data.user.hasAvatar ?? currentUser?.hasAvatar ?? false,
      };

      // If backend reissued a token (always now, but specially important on merge)
      // we must re-login so future API calls use the new JWT.
      if (response.data.token) {
        login(response.data.token, userProfile, userProfile.phone);
      } else {
        updateUser(userProfile);
      }

      onCompleted();
    } catch (err) {
      console.error('Error creating user profile:', err);
      setGeneralError(resolveRegistrationError(err));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Map API errors to user-friendly messages
   */
  const resolveRegistrationError = (err: unknown): string => {
    const axiosError = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
    const status = axiosError?.response?.status;

    if (status === 422 || status === 400) {
      const fieldErrors = axiosError.response?.data?.errors;
      const firstFieldMsg = fieldErrors
        ? Object.values(fieldErrors).flat()[0]
        : axiosError.response?.data?.message;
      return firstFieldMsg || errorMessages.REGISTRATION_FAILED;
    }
    if (status === 401) return errorMessages.AUTH_SESSION_EXPIRED;
    if (status && status >= 500) return errorMessages.SERVER_ERROR;
    if (!axiosError?.response) return errorMessages.NETWORK_ERROR;
    return errorMessages.REGISTRATION_FAILED;
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-[#000000] mb-2">
          Completa tu Perfil
        </h1>
        <p className="text-gray-600">
          Bienvenido! Por favor, completa tus datos para continuar.
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
