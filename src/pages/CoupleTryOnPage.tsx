/**
 * Foto de los dos.
 * La foto de la pareja la sube quien hace la prueba.
 * El teléfono, si lo pone, solo sirve para enviarle la imagen por WhatsApp.
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import { BackgroundPicker } from '../components/tryon/BackgroundPicker.js';
import { Loader } from '../components/shared/Loader.js';
import { WatermarkedImage } from '../components/shared/WatermarkedImage.js';
import { routes } from '../constants/routes.js';
import { backgroundNoteFor } from '../constants/backgrounds.js';
import { listBrides, listGrooms } from '../services/dressService.js';
import { generateTryOn } from '../services/tryOnService.js';
import type { CollectionItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

const GarmentChoices: React.FC<{
  label: string;
  items: CollectionItem[];
  selectedId: string | null;
  emptyText: string;
  onSelect: (dressId: string) => void;
}> = ({ label, items, selectedId, emptyText, onSelect }) => {
  if (items.length === 0 && emptyText === '') {
    return null;
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">{label}</p>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyText}</p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item) => {
            const selected = selectedId === item.dressId;
            return (
              <button
                key={`${label}-${item.dressId}`}
                type="button"
                onClick={() => onSelect(item.dressId)}
                className={`shrink-0 w-24 rounded-lg overflow-hidden border-2 text-left ${
                  selected ? 'border-black' : 'border-transparent'
                }`}
              >
                <img src={item.imageUrl} alt={item.name} className="aspect-[3/4] w-full object-cover" />
                <span className="block px-1 py-1 text-[10px] text-[#333] truncate">{item.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('No se pudo leer la foto'));
    reader.readAsDataURL(file);
  });

export const CoupleTryOnPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const dressId = searchParams.get('dressId') || '';
  const dressName = searchParams.get('dressName') || 'Tu prenda';
  const category = searchParams.get('category') === 'groom' ? 'groom' : 'bride';

  const [phone, setPhone] = useState('');

  const [partnerFile, setPartnerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [brideGarments, setBrideGarments] = useState<CollectionItem[]>([]);
  const [groomGarments, setGroomGarments] = useState<CollectionItem[]>([]);
  const [partnerDressId, setPartnerDressId] = useState<string | null>(null);
  const [loadingGarments, setLoadingGarments] = useState(true);
  const [garmentQuery, setGarmentQuery] = useState('');
  const [garmentSearch, setGarmentSearch] = useState('');

  const [backgroundId, setBackgroundId] = useState('brand');
  const [customBackground, setCustomBackground] = useState('');

  const [generating, setGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setGarmentSearch(garmentQuery.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [garmentQuery]);

  useEffect(() => {
    let cancelled = false;
    setLoadingGarments(true);
    const params = { page: 1, ...(garmentSearch ? { q: garmentSearch } : {}) };
    Promise.allSettled([listBrides(params), listGrooms(params)])
      .then(([brides, grooms]) => {
        if (cancelled) return;
        setBrideGarments(brides.status === 'fulfilled' ? brides.value.data : []);
        setGroomGarments(grooms.status === 'fulfilled' ? grooms.value.data : []);
        if (brides.status === 'rejected' && grooms.status === 'rejected') {
          setError('No se pudieron cargar vestidos ni trajes.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingGarments(false);
      });
    return () => {
      cancelled = true;
    };
  }, [garmentSearch]);

  if (!user?.hasAvatar) {
    const params = new URLSearchParams({ dressId, dressName, category });
    return <Navigate to={`${routes.AVATAR_CREATION}?${params.toString()}`} replace />;
  }

  if (!dressId) {
    return <Navigate to={routes.COLLECTIONS_BRIDE} replace />;
  }

  const handlePartnerFile = (file: File): void => {
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPartnerFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleGenerate = async (): Promise<void> => {
    if (!partnerDressId) {
      setError('Elige la prenda de tu pareja.');
      return;
    }
    if (!partnerFile) {
      setError('Sube una foto de tu pareja.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const note = backgroundNoteFor(backgroundId, customBackground);
      const sharePhone = phone.trim();
      const response = await generateTryOn({
        dressId,
        prompt:
          'Couple portrait. Person A wears the first garment. Person B wears the second garment. One photograph of both, full body.',
        partnerDressId,
        partnerImage: await fileToBase64(partnerFile),
        ...(sharePhone.replace(/\D/g, '').length >= 9 ? { partnerPhone: sharePhone } : {}),
        ...(note ? { backgroundNote: note } : {}),
      });
      setResultUrl(response.data.imageUrl);
    } catch (err: unknown) {
      const responseMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const message = typeof responseMessage === 'string' && responseMessage !== ''
        ? responseMessage
        : 'No se pudo generar la foto de los dos.';
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F3EF] to-[#E8E4DD]">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl min-h-[50vh] flex items-center justify-center overflow-hidden border border-white/40">
            {generating && <Loader text="Preparando la foto de los dos…" />}
            {!generating && resultUrl && (
              <WatermarkedImage src={resultUrl} alt="Foto de pareja" className="w-full h-full object-contain" />
            )}
            {!generating && !resultUrl && (
              <div className="text-center p-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">Pareja</p>
                <h1 className="font-serif text-3xl text-black mb-2">La foto de los dos</h1>
                <p className="text-sm text-[#4a4a4a]">
                  Tú llevas {dressName}. Elige un vestido o un traje para tu pareja.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm text-[#4a4a4a] text-left hover:text-black"
            >
              ← Volver a mi prueba
            </button>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
            )}

            <section className="bg-white/70 rounded-2xl p-4 border border-white/50">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">Su foto</p>
              <p className="text-sm text-[#333] mb-3">
                Sube una foto de tu pareja para generar su avatar.
              </p>
              {previewUrl ? (
                <div className="flex items-center gap-4">
                  <img src={previewUrl} alt="Foto de tu pareja" className="w-20 h-28 object-cover rounded-xl" />
                  <label className="inline-flex cursor-pointer px-4 py-2 rounded-xl border border-black text-xs tracking-widest">
                    Cambiar foto
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) handlePartnerFile(file);
                      }}
                    />
                  </label>
                </div>
              ) : (
                <label className="inline-flex cursor-pointer px-4 py-2 rounded-xl bg-black text-white text-xs tracking-widest">
                  Elegir foto
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handlePartnerFile(file);
                    }}
                  />
                </label>
              )}
            </section>

            <section className="bg-white/70 rounded-2xl p-4 border border-white/50">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">Su WhatsApp</p>
              <p className="text-sm text-[#333] mb-3">
                Opcional. Añade el teléfono de tu pareja para compartir vuestra prueba.
              </p>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+34 600 000 000"
                className="w-full border border-black/20 rounded-xl px-3 py-2 text-sm"
              />
            </section>

            <section className="bg-white/70 rounded-2xl p-4 border border-white/50">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">Su prenda</p>
              <input
                type="search"
                value={garmentQuery}
                onChange={(event) => setGarmentQuery(event.target.value)}
                placeholder="Buscar vestido o traje por nombre"
                className="w-full border border-black/20 rounded-xl px-3 py-2 text-sm mb-3"
              />
              {loadingGarments ? (
                <p className="text-sm text-gray-500">Cargando…</p>
              ) : brideGarments.length === 0 && groomGarments.length === 0 ? (
                <p className="text-sm text-gray-500">No hay ningún vestido ni traje con ese nombre.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  <GarmentChoices
                    label="Vestidos"
                    items={brideGarments}
                    selectedId={partnerDressId}
                    emptyText={garmentSearch ? 'Ningún vestido con ese nombre.' : ''}
                    onSelect={setPartnerDressId}
                  />
                  <GarmentChoices
                    label="Trajes"
                    items={groomGarments}
                    selectedId={partnerDressId}
                    emptyText={garmentSearch ? 'Ningún traje con ese nombre.' : ''}
                    onSelect={setPartnerDressId}
                  />
                </div>
              )}
            </section>

            <section className="bg-white/70 rounded-2xl p-4 border border-white/50">
              <BackgroundPicker
                value={backgroundId}
                custom={customBackground}
                onChange={setBackgroundId}
                onCustom={setCustomBackground}
              />
            </section>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-4 rounded-2xl bg-[#333] text-white font-serif text-lg hover:bg-black disabled:opacity-50"
            >
              Generar la foto de los dos
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
