import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, getAvatar, getProfile, listAppointments, listShops, logout, updateProfile } from '@v2/lib/api';
import { validateContact, type ContactErrors, type ContactValues } from '@v2/lib/profile';
import type { UserProfile, WeddingMoment, WeddingStyle } from '@v2/lib/types';
import { useLoad } from '@v2/lib/use-load';

export type Values = ContactValues & {
  whatsapp: boolean;
  weddingDate: string;
  weddingPlace: string;
  weddingStyle: WeddingStyle | '';
  weddingMoment: WeddingMoment | '';
};

const fromProfile = (p: UserProfile): Values => ({
  name: p.name ?? '',
  email: p.email ?? '',
  postcode: p.postcode ?? '',
  shopId: p.shopId ? String(p.shopId) : '',
  whatsapp: p.sendPhotosWhatsApp ?? true,
  weddingDate: p.wedding?.date?.slice(0, 10) ?? '',
  weddingPlace: p.wedding?.place ?? '',
  weddingStyle: p.wedding?.style ?? '',
  weddingMoment: p.wedding?.moment ?? '',
});

export const selectClass = (invalid: boolean) =>
  `h-11 w-full border-0 border-b bg-transparent px-0 text-base outline-none focus:border-ink ${invalid ? 'border-danger' : 'border-neutral-300'}`;

/**
 * Lo que hace el perfil: los datos del registro y los de la boda, editables,
 * con el avatar y la próxima cita. Lo usan el perfil de Atelier y el de Sedka.
 */
export function useProfileScreen() {
  const router = useRouter();
  const { data, error: loadError, reload, setData } = useLoad(() =>
    Promise.all([getProfile(), listShops(), getAvatar(), listAppointments().catch(() => null)]),
  );
  const [profile, shops, avatar, appointments] = data ?? [null, [], null, null];
  const next = appointments?.upcoming[0] ?? null;

  // Borrador sobre los datos del CRM: hasta que la clienta edita, manda el perfil.
  const [draft, setDraft] = useState<Values | null>(null);
  const values = draft ?? (profile ? fromProfile(profile) : null);
  const [touched, setTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState<ContactErrors>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errors: ContactErrors = values
    ? {
        ...validateContact(values),
        ...Object.fromEntries(Object.entries(serverErrors).filter(([, m]) => m)),
      }
    : {};
  const shown = (key: keyof ContactErrors) => (touched ? errors[key] : undefined);
  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    if (!values) return;
    setDraft({ ...values, [key]: value });
    setServerErrors((s) => ({ ...s, [key]: undefined }));
    setSaved(false);
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!profile || !values || Object.keys(validateContact(values)).length) return;
    setBusy(true);
    setError(null);
    const input = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      postcode: values.postcode.trim(),
      shopId: Number(values.shopId),
      sendPhotosWhatsApp: values.whatsapp,
      weddingDate: values.weddingDate || null,
      weddingPlace: values.weddingPlace.trim() || null,
      weddingStyle: values.weddingStyle || null,
      weddingMoment: values.weddingMoment || null,
    };
    try {
      await updateProfile(input);
      // Se pinta ya lo guardado y se vuelve a leer del CRM por detrás.
      const wedding = { date: input.weddingDate, place: input.weddingPlace, style: input.weddingStyle, moment: input.weddingMoment };
      setData([{ ...profile, ...input, wedding }, shops, avatar, appointments]);
      reload();
      setDraft(null);
      setTouched(false);
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) setServerErrors(err.fieldErrors);
      else setError(err instanceof Error ? err.message : 'No se pudieron guardar los cambios.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await logout().catch(() => undefined);
    router.replace('/');
  };


  return { profile, shops, avatar, appointments, next, values, draft, set, shown, save, signOut, busy, saved, error, loadError, reload };
}
