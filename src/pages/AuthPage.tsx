/**
 * AuthPage (Phase 1)
 *
 * Authentication page managing the two-step authentication flow:
 * 1. Phone number input
 * 2. SMS code verification
 *
 * Features:
 * - Step management (phone input → code verification)
 * - Smooth transitions between steps
 * - Automatic navigation after successful verification
 * - Back navigation support
 * - Redirects to avatar creation after successful auth
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneInput } from '../components/auth/PhoneInput.js';
import { CodeVerification } from '../components/auth/CodeVerification.js';
import { UserRegistration } from '../components/auth/UserRegistration.js';
import { useAuth } from '../context/AuthContext.js';

/**
 * Auth steps
 */
type AuthStep = 'phone' | 'code' | 'registration';

/**
 * AuthPage Component
 */
export const AuthPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  /**
   * Redirect if already authenticated
   * IMPORTANT: Don't redirect if user is in registration step
   */
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && currentStep !== 'registration') {
      // If user has avatar, go to try-on page
      // Otherwise, go to avatar creation
      if (user.hasAvatar) {
        navigate('/try-on', { replace: true });
      } else {
        navigate('/avatar-creation', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, currentStep]);

  /**
   * Handle code sent successfully
   * Move to code verification step
   */
  const handleCodeSent = (phone: string): void => {
    setPhoneNumber(phone);
    setCurrentStep('code');
  };

  /**
   * Handle code verified successfully
   * Check if user needs to complete registration
   */
  const handleCodeVerified = (needsRegistration: boolean): void => {
    if (needsRegistration) {
      // New user - show registration form
      setCurrentStep('registration');
    } else {
      // Existing user - navigate based on avatar status
      // Navigation will be handled by the useEffect above
      navigate('/avatar-creation', { replace: true });
    }
  };

  /**
   * Handle registration completed
   * Navigate to avatar creation
   */
  const handleRegistrationCompleted = (): void => {
    navigate('/avatar-creation', { replace: true });
  };

  /**
   * Handle back to phone input
   */
  const handleBackToPhone = (): void => {
    setCurrentStep('phone');
    setPhoneNumber('');
  };

  // Show nothing while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8C6F5A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#d4c4b0] opacity-10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8C6F5A] opacity-10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-md">
        {/* Step 1: Phone Input */}
        {currentStep === 'phone' && (
          <div className="animate-fadeIn">
            <PhoneInput onCodeSent={handleCodeSent} />
          </div>
        )}

        {/* Step 2: Code Verification */}
        {currentStep === 'code' && (
          <div className="animate-fadeIn">
            <CodeVerification
              phone={phoneNumber}
              onVerified={handleCodeVerified}
              onBack={handleBackToPhone}
            />
          </div>
        )}

        {/* Step 3: User Registration (only for new users) */}
        {currentStep === 'registration' && (
          <div className="animate-fadeIn">
            <UserRegistration
              phone={phoneNumber}
              onCompleted={handleRegistrationCompleted}
            />
          </div>
        )}
      </div>
    </div>
  );
};
