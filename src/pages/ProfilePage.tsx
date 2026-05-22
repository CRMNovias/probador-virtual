/**
 * ProfilePage
 *
 * Página de gestión del perfil del cliente del Probador Virtual.
 *
 * Secciones:
 *  1. Datos personales — nombre, email, código postal, atelier (los mismos
 *     campos del paso 1 del registro, todos editables).
 *  2. Datos de la boda — fecha, lugar, estilo, momento (paso 2 del registro,
 *     opcionales y editables individualmente).
 *  3. Avatar — botón para ir a `/avatar-creation?regenerate=true` y
 *     regenerar el modelo a partir de la foto ya subida.
 *
 * Cada sección tiene su propio botón "Guardar cambios" que llama a
 * `/user/update-profile` con solo los campos de esa sección.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import { Button } from '../components/shared/Button.js';
import { Input } from '../components/shared/Input.js';
import { getProfile, updateProfile, listPublicShops } from '../services/userService.js';
import { useAuth } from '../context/AuthContext.js';
import { isValidEmail } from '../utils/validators.js';
import { routes } from '../constants/routes.js';
import type {
  UserProfile,
  PublicShop,
  WeddingStyle,
  WeddingMoment,
} from '../types/user.js';

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

type SectionStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // Carga inicial del perfil completo (postcode, shop, wedding no vienen en JWT)
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Sección 1 — datos personales
  const [personal, setPersonal] = useState({
    name: '',
    email: '',
    postcode: '',
    shopId: null as number | null,
  });
  const [personalStatus, setPersonalStatus] = useState<SectionStatus>({ kind: 'idle' });

  // Sección 2 — datos de la boda
  const [wedding, setWedding] = useState({
    date: '',
    place: '',
    style: '' as WeddingStyle | '',
    moment: '' as WeddingMoment | '',
  });
  const [weddingStatus, setWeddingStatus] = useState<SectionStatus>({ kind: 'idle' });

  // Catálogo de ateliers
  const [shops, setShops] = useState<PublicShop[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getProfile(), listPublicShops()])
      .then(([profile, shopsList]) => {
        if (cancelled) return;
        hydrateForm(profile);
        setShops(shopsList);
      })
      .catch((err) => {
        console.error('[ProfilePage] Error cargando perfil:', err);
        if (!cancelled) setLoadError('No se pudo cargar tu perfil. Inténtalo de nuevo.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Vuelca un UserProfile en los dos formularios. */
  const hydrateForm = (profile: UserProfile): void => {
    setPersonal({
      name: profile.name ?? '',
      email: profile.email ?? '',
      postcode: profile.postcode ?? '',
      shopId: profile.shopId ?? null,
    });
    setWedding({
      date: profile.wedding?.date ?? '',
      place: profile.wedding?.place ?? '',
      style: (profile.wedding?.style ?? '') as WeddingStyle | '',
      moment: (profile.wedding?.moment ?? '') as WeddingMoment | '',
    });
  };

  const isPersonalValid = useMemo(() => {
    return (
      personal.name.trim().length >= 2 &&
      isValidEmail(personal.email.trim()) &&
      personal.postcode.trim().length >= 3 &&
      personal.shopId !== null
    );
  }, [personal]);

  const handleSavePersonal = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!isPersonalValid) return;
    setPersonalStatus({ kind: 'saving' });
    try {
      const updated = await updateProfile({
        name: personal.name.trim(),
        email: personal.email.trim().toLowerCase(),
        postcode: personal.postcode.trim(),
        shopId: personal.shopId as number,
      });
      // Sincronizar el contexto auth (Header verá el nombre nuevo)
      if (user) {
        updateUser({
          ...user,
          name: updated.name ?? personal.name.trim(),
          email: updated.email ?? personal.email.trim().toLowerCase(),
        });
      }
      setPersonalStatus({ kind: 'success', message: 'Datos personales actualizados.' });
    } catch (err) {
      console.error('[ProfilePage] Error guardando datos personales:', err);
      setPersonalStatus({ kind: 'error', message: 'No se pudieron guardar los cambios.' });
    }
  };

  const handleSaveWedding = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setWeddingStatus({ kind: 'saving' });
    try {
      await updateProfile({
        weddingDate:   wedding.date || null,
        weddingPlace:  wedding.place.trim() || null,
        weddingStyle:  (wedding.style || null) as WeddingStyle | null,
        weddingMoment: (wedding.moment || null) as WeddingMoment | null,
      });
      setWeddingStatus({ kind: 'success', message: 'Datos de tu boda actualizados.' });
    } catch (err) {
      console.error('[ProfilePage] Error guardando datos de boda:', err);
      setWeddingStatus({ kind: 'error', message: 'No se pudieron guardar los cambios.' });
    }
  };

  const goRegenerateAvatar = (): void => {
    navigate(`${routes.AVATAR_CREATION}?regenerate=true`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <header className="text-center">
            <h1 className="text-3xl md:text-4xl text-[#000000] mb-2">Mi perfil</h1>
            <p className="text-sm text-gray-600">
              Edita tus datos personales, los detalles de tu boda y tu avatar.
            </p>
          </header>

          {loadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm text-center">{loadError}</p>
            </div>
          )}

          {/* SECCIÓN 1 — Datos personales */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[#000000] mb-1">Datos personales</h2>
            <p className="text-xs text-gray-500 mb-6">
              Información de contacto utilizada por nuestro equipo.
            </p>

            <form onSubmit={handleSavePersonal} className="space-y-4">
              <Input
                id="profile-name"
                type="text"
                label="Nombre completo"
                value={personal.name}
                onChange={(v) => setPersonal((s) => ({ ...s, name: v }))}
                maxLength={100}
                placeholder="Ej: María García"
              />
              <Input
                id="profile-email"
                type="email"
                label="Email"
                value={personal.email}
                onChange={(v) => setPersonal((s) => ({ ...s, email: v }))}
                maxLength={100}
                placeholder="Ej: maria@email.com"
              />
              <Input
                id="profile-postcode"
                type="text"
                label="Código postal"
                value={personal.postcode}
                onChange={(v) =>
                  setPersonal((s) => ({ ...s, postcode: v.replace(/[^\d]/g, '').slice(0, 5) }))
                }
                maxLength={5}
                placeholder="Ej: 28013"
              />

              <div className="w-full">
                <label htmlFor="profile-shopId" className="block text-sm font-medium text-gray-700 mb-1">
                  Atelier más cercano
                </label>
                <select
                  id="profile-shopId"
                  value={personal.shopId ?? ''}
                  onChange={(e) =>
                    setPersonal((s) => ({ ...s, shopId: e.target.value ? Number(e.target.value) : null }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-black bg-white focus:outline-none focus:ring-0 focus:border-black"
                >
                  <option value="">Selecciona un atelier</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>

              {personalStatus.kind === 'success' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm text-center">{personalStatus.message}</p>
                </div>
              )}
              {personalStatus.kind === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm text-center">{personalStatus.message}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                disabled={!isPersonalValid || personalStatus.kind === 'saving'}
                loading={personalStatus.kind === 'saving'}
              >
                Guardar datos personales
              </Button>
            </form>
          </section>

          {/* SECCIÓN 2 — Datos de la boda */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[#000000] mb-1">Datos de tu boda</h2>
            <p className="text-xs text-gray-500 mb-6">
              Esta información es opcional, pero nos ayuda a aconsejarte mejor.
            </p>

            <form onSubmit={handleSaveWedding} className="space-y-4">
              <div className="w-full">
                <label htmlFor="wedding-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de la boda
                </label>
                <input
                  id="wedding-date"
                  type="date"
                  value={wedding.date}
                  onChange={(e) => setWedding((s) => ({ ...s, date: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-black bg-white focus:outline-none focus:ring-0 focus:border-black"
                />
              </div>

              <Input
                id="wedding-place"
                type="text"
                label="Lugar de la boda"
                value={wedding.place}
                onChange={(v) => setWedding((s) => ({ ...s, place: v }))}
                maxLength={100}
                placeholder="Ej: Madrid, Finca Los Olivos"
              />

              <div className="w-full">
                <label htmlFor="wedding-style" className="block text-sm font-medium text-gray-700 mb-1">
                  Estilo de boda
                </label>
                <select
                  id="wedding-style"
                  value={wedding.style}
                  onChange={(e) =>
                    setWedding((s) => ({ ...s, style: e.target.value as WeddingStyle | '' }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-black bg-white focus:outline-none focus:ring-0 focus:border-black"
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
                    const selected = wedding.moment === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() =>
                          setWedding((s) => ({
                            ...s,
                            moment: selected ? '' : m, // permite "deseleccionar" para limpiar
                          }))
                        }
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

              {weddingStatus.kind === 'success' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm text-center">{weddingStatus.message}</p>
                </div>
              )}
              {weddingStatus.kind === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm text-center">{weddingStatus.message}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                disabled={weddingStatus.kind === 'saving'}
                loading={weddingStatus.kind === 'saving'}
              >
                Guardar datos de la boda
              </Button>
            </form>
          </section>

          {/* SECCIÓN 3 — Avatar */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[#000000] mb-1">Tu avatar</h2>
            <p className="text-xs text-gray-500 mb-6">
              Si no estás contenta con el resultado, puedes generarlo de nuevo
              con la foto que ya subiste o subir una nueva.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {user?.hasAvatar ? (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-400">
                  ✓
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-400">
                  ?
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-gray-700">
                  {user?.hasAvatar
                    ? 'Tu avatar ya está generado.'
                    : 'Aún no has generado tu avatar.'}
                </p>
              </div>
              <button
                type="button"
                onClick={goRegenerateAvatar}
                className="px-5 py-2 rounded-lg border border-black bg-white text-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
              >
                {user?.hasAvatar ? 'Regenerar avatar' : 'Crear avatar'}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
