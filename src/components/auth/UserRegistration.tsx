/**
 * User Registration Component (2-step wizard)
 *
 * Step 1 — Datos personales (OBLIGATORIO, no se puede saltar):
 *   - Nombre completo (name)
 *   - Email
 *   - Código postal (postcode)
 *   - Atelier más cercano (shopId)
 *
 * Step 2 — Datos de la boda (OPCIONAL, botón "Saltar"):
 *   - Fecha de la boda
 *   - Lugar de la boda
 *   - Estilo de boda (select)
 *   - Momento del evento (día / noche)
 *
 * Una vez completado el paso 1 el backend ya guarda el perfil mínimo y, si en
 * el paso 2 hay algún campo relleno, vuelve a llamar al mismo endpoint para
 * añadirlos. Si el usuario salta el paso 2, no se realiza la segunda llamada.
 */

import React, { useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import { Button } from '../shared/Button.js';
import { Input } from '../shared/Input.js';
import { isValidEmail } from '../../utils/validators.js';
import { createProfile, listPublicShops } from '../../services/userService.js';
import { useAuth } from '../../context/AuthContext.js';
import { errorMessages } from '../../constants/errorMessages.js';
import type {
  UserProfile,
  PublicShop,
  WeddingStyle,
  WeddingMoment,
  CreateProfileRequest,
} from '../../types/user.js';

export interface UserRegistrationProps {
  /** Phone number of the user (E.164, e.g. +34644087831) */
  phone: string;
  /** Callback when registration is completed successfully (also after skip) */
  onCompleted: () => void;
}

type WizardStep = 1 | 2;

interface Step1Data {
  name: string;
  email: string;
  postcode: string;
  shopId: number | null;
}

interface Step1Errors {
  name?: string | undefined;
  email?: string | undefined;
  postcode?: string | undefined;
  shopId?: string | undefined;
}

interface Step2Data {
  weddingDate: string;
  weddingPlace: string;
  weddingStyle: WeddingStyle | '';
  weddingMoment: WeddingMoment | '';
}

const WEDDING_STYLE_OPTIONS: ReadonlyArray<{ value: WeddingStyle; label: string }> = [
  { value: 'classic',     label: 'Clásico' },
  { value: 'boho_chic',   label: 'Boho Chic' },
  { value: 'rustic',      label: 'Rústico' },
  { value: 'vintage',     label: 'Vintage' },
  { value: 'industrial',  label: 'Industrial' },
  { value: 'romantic',    label: 'Romántico' },
  { value: 'minimalist',  label: 'Minimalista' },
  { value: 'glamour',     label: 'Glamour' },
  { value: 'other',       label: 'Otros' },
];

/**
 * Format API errors to a user-friendly string.
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

export const UserRegistration: React.FC<UserRegistrationProps> = ({
  phone,
  onCompleted,
}) => {
  const { updateUser, user: currentUser, login } = useAuth();

  const [step, setStep] = useState<WizardStep>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Pre-rellenar nombre/email si el cliente vuelve al wizard desde
  // /avatar-creation y ya tenía perfil parcial guardado. Postcode y shop_id
  // no están disponibles en el contexto auth, así que el usuario los vuelve
  // a introducir (o podemos extender /user/profile para servirlos).
  const [step1, setStep1] = useState<Step1Data>({
    name: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
    postcode: '',
    shopId: null,
  });
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});

  const [step2, setStep2] = useState<Step2Data>({
    weddingDate: '',
    weddingPlace: '',
    weddingStyle: '',
    weddingMoment: '',
  });

  // Lista de ateliers (cargada bajo demanda; pública)
  const [shops, setShops] = useState<PublicShop[]>([]);
  const [shopsLoading, setShopsLoading] = useState<boolean>(true);
  const [shopsError, setShopsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setShopsLoading(true);
    listPublicShops()
      .then((rows) => {
        if (!cancelled) setShops(rows);
      })
      .catch((err) => {
        console.error('[UserRegistration] Error cargando ateliers:', err);
        if (!cancelled) setShopsError('No se pudieron cargar los ateliers. Recarga la página.');
      })
      .finally(() => {
        if (!cancelled) setShopsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isStep1Valid = useMemo(() => {
    return (
      step1.name.trim().length >= 2 &&
      isValidEmail(step1.email.trim()) &&
      step1.postcode.trim().length >= 3 &&
      step1.shopId !== null
    );
  }, [step1]);

  /**
   * Construye el payload del backend a partir del estado del wizard.
   * El segundo argumento permite omitir los campos del paso 2 cuando el
   * usuario hace skip.
   */
  const buildPayload = (includeStep2: boolean): CreateProfileRequest => {
    const base: CreateProfileRequest = {
      phone,
      name: step1.name.trim(),
      email: step1.email.trim().toLowerCase(),
      postcode: step1.postcode.trim(),
      shopId: step1.shopId as number,
    };

    if (!includeStep2) return base;

    return {
      ...base,
      weddingDate:   step2.weddingDate || null,
      weddingPlace:  step2.weddingPlace.trim() || null,
      weddingStyle:  step2.weddingStyle || null,
      weddingMoment: step2.weddingMoment || null,
    };
  };

  /**
   * Llama al backend con el payload calculado y procesa la respuesta:
   * login con el JWT reemitido y refresco del UserProfile en contexto.
   */
  const submit = async (includeStep2: boolean): Promise<void> => {
    setGeneralError(null);
    setIsSubmitting(true);
    try {
      const response = await createProfile(buildPayload(includeStep2));

      const userProfile: UserProfile = {
        id: String(response.data.user.id),
        phone: response.data.user.phone,
        name: response.data.user.name ?? step1.name.trim(),
        email: response.data.user.email ?? step1.email.trim().toLowerCase(),
        createdAt: response.data.user.createdAt ?? currentUser?.createdAt ?? new Date().toISOString(),
        hasAvatar: response.data.user.hasAvatar ?? currentUser?.hasAvatar ?? false,
      };

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
      setIsSubmitting(false);
    }
  };

  /**
   * Validación del paso 1 y avance al paso 2.
   */
  const handleNextFromStep1 = (e: React.FormEvent): void => {
    e.preventDefault();
    const errs: Step1Errors = {};
    if (step1.name.trim().length < 2) errs.name = 'Introduce tu nombre completo';
    if (!isValidEmail(step1.email.trim())) errs.email = 'Email inválido';
    if (step1.postcode.trim().length < 3) errs.postcode = 'Código postal inválido';
    if (step1.shopId === null) errs.shopId = 'Selecciona un atelier';
    setStep1Errors(errs);
    if (Object.keys(errs).length > 0) return;
    setStep(2);
  };

  /**
   * Acción del botón "Atrás" del header del wizard.
   * Solo activo en el paso 2 — vuelve al paso 1 (datos personales) conservando
   * lo introducido. Desde el paso 1 NO se vuelve al input de teléfono: el
   * número ya está verificado y rehacer el OTP no aporta valor.
   */
  const handleHeaderBack = (): void => {
    if (step === 2) setStep(1);
  };

  const showBackButton = step === 2;

  return (
    <div className="w-full max-w-md mx-auto p-6">
      {/* Back button (header) — solo en paso 2 del wizard */}
      {showBackButton && (
        <button
          type="button"
          onClick={handleHeaderBack}
          disabled={isSubmitting}
          aria-label="Volver al paso anterior"
          className="inline-flex items-center gap-1 text-sm text-[#4a4a4a] hover:text-[#1f1f1f] transition-colors px-2 py-1 -ml-2 mb-6 rounded-md hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span>Atrás</span>
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-serif text-[#000000] mb-1">
          {step === 1 ? 'Completa tu Perfil' : 'Cuéntanos sobre tu boda'}
        </h1>
        <p className="text-gray-600 text-sm">
          {step === 1
            ? 'Bienvenido! Necesitamos algunos datos para continuar.'
            : 'Datos opcionales — puedes saltar este paso y rellenarlo más tarde.'}
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <span
            className={`h-1.5 w-8 rounded-full ${step === 1 ? 'bg-black' : 'bg-black/30'}`}
          />
          <span
            className={`h-1.5 w-8 rounded-full ${step === 2 ? 'bg-black' : 'bg-black/30'}`}
          />
        </div>
      </div>

      {/* STEP 1 — Datos personales */}
      {step === 1 && (
        <form onSubmit={handleNextFromStep1} className="space-y-4">
          <Input
            id="name"
            type="text"
            label="Nombre completo"
            value={step1.name}
            onChange={(value) => {
              setStep1((s) => ({ ...s, name: value }));
              if (step1Errors.name) setStep1Errors((e) => ({ ...e, name: undefined }));
            }}
            error={step1Errors.name || ''}
            disabled={isSubmitting}
            autoFocus
            maxLength={100}
            placeholder="Ej: María García"
          />

          <Input
            id="email"
            type="email"
            label="Email"
            value={step1.email}
            onChange={(value) => {
              setStep1((s) => ({ ...s, email: value }));
              if (step1Errors.email) setStep1Errors((e) => ({ ...e, email: undefined }));
            }}
            error={step1Errors.email || ''}
            disabled={isSubmitting}
            maxLength={100}
            placeholder="Ej: maria@email.com"
          />

          <Input
            id="postcode"
            type="text"
            label="Código postal"
            value={step1.postcode}
            onChange={(value) => {
              // Solo dígitos, máx 5
              const clean = value.replace(/[^\d]/g, '').slice(0, 5);
              setStep1((s) => ({ ...s, postcode: clean }));
              if (step1Errors.postcode) setStep1Errors((e) => ({ ...e, postcode: undefined }));
            }}
            error={step1Errors.postcode || ''}
            disabled={isSubmitting}
            maxLength={5}
            placeholder="Ej: 28013"
          />

          {/* Atelier selector */}
          <div className="w-full">
            <label htmlFor="shopId" className="block text-sm font-medium text-gray-700 mb-1">
              Atelier más cercano
            </label>
            <select
              id="shopId"
              value={step1.shopId ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setStep1((s) => ({ ...s, shopId: v ? Number(v) : null }));
                if (step1Errors.shopId) setStep1Errors((errs) => ({ ...errs, shopId: undefined }));
              }}
              disabled={isSubmitting || shopsLoading}
              className={`w-full px-4 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-0 ${
                step1Errors.shopId ? 'border-red-500 focus:border-red-500' : 'border-black focus:border-black'
              } bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">
                {shopsLoading ? 'Cargando ateliers…' : 'Selecciona un atelier'}
              </option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
            {step1Errors.shopId && (
              <p className="mt-1 text-sm text-red-600">{step1Errors.shopId}</p>
            )}
            {shopsError && !step1Errors.shopId && (
              <p className="mt-1 text-sm text-red-600">{shopsError}</p>
            )}
          </div>

          {generalError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm text-center">{generalError}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={!isStep1Valid || isSubmitting}
          >
            Continuar
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Al continuar, aceptas que almacenaremos tu información para mejorar
            tu experiencia en la aplicación.
          </p>
        </form>
      )}

      {/* STEP 2 — Datos de la boda (opcional) */}
      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(true);
          }}
          className="space-y-4"
        >
          <div className="w-full">
            <label htmlFor="weddingDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de la boda
            </label>
            <input
              id="weddingDate"
              type="date"
              value={step2.weddingDate}
              onChange={(e) => setStep2((s) => ({ ...s, weddingDate: e.target.value }))}
              disabled={isSubmitting}
              className="w-full px-4 py-2 rounded-lg border border-black focus:outline-none focus:ring-0 focus:border-black bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <Input
            id="weddingPlace"
            type="text"
            label="Lugar de la boda"
            value={step2.weddingPlace}
            onChange={(value) => setStep2((s) => ({ ...s, weddingPlace: value }))}
            disabled={isSubmitting}
            maxLength={100}
            placeholder="Ej: Madrid, Finca Los Olivos"
          />

          <div className="w-full">
            <label htmlFor="weddingStyle" className="block text-sm font-medium text-gray-700 mb-1">
              Estilo de boda
            </label>
            <select
              id="weddingStyle"
              value={step2.weddingStyle}
              onChange={(e) =>
                setStep2((s) => ({ ...s, weddingStyle: e.target.value as WeddingStyle | '' }))
              }
              disabled={isSubmitting}
              className="w-full px-4 py-2 rounded-lg border border-black focus:outline-none focus:ring-0 focus:border-black bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Selecciona un estilo</option>
              {WEDDING_STYLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Momento del evento
            </span>
            <div className="grid grid-cols-2 gap-3">
              {(['day', 'night'] as WeddingMoment[]).map((m) => {
                const selected = step2.weddingMoment === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setStep2((s) => ({ ...s, weddingMoment: m }))}
                    disabled={isSubmitting}
                    className={`py-3 rounded-lg border text-sm font-medium tracking-wide transition-colors ${
                      selected
                        ? 'border-black bg-black text-white'
                        : 'border-black bg-white text-black hover:bg-black/5'
                    }`}
                  >
                    {m === 'day' ? 'Día' : 'Noche'}
                  </button>
                );
              })}
            </div>
          </div>

          {generalError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm text-center">{generalError}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Finalizar
            </Button>
            <button
              type="button"
              onClick={() => void submit(false)}
              disabled={isSubmitting}
              className="w-full py-2 text-sm text-gray-600 hover:text-black transition-colors disabled:opacity-50"
            >
              Saltar este paso
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
