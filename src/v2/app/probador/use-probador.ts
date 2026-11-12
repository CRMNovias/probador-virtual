import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ViewOption } from '@v2/components/view-switch';
import {
  generateTryOn,
  getAvatar,
  getGarment,
  listFavorites,
  listGarments,
  listTryOns,
  toggleFavorite,
  tryOnTurntable,
} from '@v2/lib/api';
import { BACKGROUNDS, backgroundNote, DEFAULT_BACKGROUND, type BackgroundChoice } from '@v2/lib/backgrounds';
import { withBase } from '@v2/lib/base-path';
import { brand } from '@v2/lib/brand';
import type { Category, CollectionItem, TryOn } from '@v2/lib/types';
import { useLoad } from '@v2/lib/use-load';
import { useTurntable } from '@v2/lib/use-turntable';
import type { Partner } from './partner-sheet';

/**
 * Segundos que suele tardar la IA en vestir al avatar (imagen fija); con pareja,
 * algo más; con un fondo de exterior, un paso más (ver twoStep en generateTryOn).
 */
const EXPECTED_SECONDS = { single: 50, couple: 85, scene: 30 };

/** Vistas de una prueba: el giro 360, la foto de frente y las de detalle. */
export type View = 'turn' | 'front' | 'detail' | 'back';

/** Una prueba hecha en esta visita, con las opciones con que se hizo. */
export interface Made {
  tryOn: TryOn;
  options: string;
  couple: boolean;
}

/** Las pruebas anteriores se hicieron con el estudio y sin pareja. */
const optionsKey = (background: BackgroundChoice, partner: Partner | null) =>
  `${backgroundNote(background)}|${partner ? `${partner.dressId}:${partner.image.length}` : ''}`;
const DEFAULT_OPTIONS = optionsKey({ id: DEFAULT_BACKGROUND.id }, null);

function useElapsed(running: boolean) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running) return;
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => {
      window.clearInterval(timer);
      setElapsed(0);
    };
  }, [running]);
  return elapsed;
}

/**
 * Lo que hace el probador: la prenda elegida, la prueba (y su giro 360 y sus
 * detalles), el fondo, la pareja, favoritos y compartir. Lo usan el probador de
 * Atelier y el de Sedka, cada uno con su disposición.
 */
export function useProbador() {
  const router = useRouter();
  const params = useSearchParams();
  const wantedCategory = params.get('c');
  const [tabChoice, setTab] = useState<Category | null>(wantedCategory === 'groom' || wantedCategory === 'bride' ? wantedCategory : null);
  const wantedId = params.get('d');
  const [selectedId, setSelectedId] = useState<string | null>(wantedId);
  // La prenda elegida se ve en grande en lugar de la lista, hasta «Ver otros modelos».
  const [focused, setFocused] = useState(Boolean(wantedId));
  const [generated, setGenerated] = useState<Record<string, Made>>({});
  const [background, setBackground] = useState<BackgroundChoice>({ id: DEFAULT_BACKGROUND.id });
  const [partner, setPartner] = useState<Partner | null>(null);
  const [sheet, setSheet] = useState<'background' | 'partner' | null>(null);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string> | null>(null);
  const elapsed = useElapsed(working !== null);

  const { data: base } = useLoad(() => Promise.all([getAvatar(), listTryOns(), listFavorites()]));
  const [avatar, groups, favoriteList] = base ?? [null, [], []];
  const { data: catalog } = useLoad(() => Promise.all([listGarments('bride'), listGarments('groom')]));
  // El modelo que llega por enlace (favoritos, mis pruebas) puede no estar en la primera página.
  const { data: linked } = useLoad(() => (wantedId ? getGarment(wantedId).catch(() => null) : Promise.resolve(null)), wantedId ?? '');
  const tab: Category = tabChoice ?? linked?.category ?? 'bride';
  const firstPages = catalog ? [...catalog[0].items, ...catalog[1].items] : null;
  const all = firstPages && linked && !firstPages.some((g) => g.dressId === linked.dressId) ? [linked, ...firstPages] : firstPages;
  const pageOfTab = catalog ? catalog[tab === 'bride' ? 0 : 1].items : null;
  const garments =
    pageOfTab && linked && (linked.category ?? tab) === tab && !pageOfTab.some((g) => g.dressId === linked.dressId)
      ? [linked, ...pageOfTab]
      : pageOfTab;

  // Sin avatar no hay probador: primero se crea.
  useEffect(() => {
    if (base && !avatar) router.replace('/avatar?next=/probador');
  }, [base, avatar, router]);

  const favoriteIds = favorites ?? new Set(favoriteList.map((f) => f.dressId));
  const triedIds = new Set([...groups.map((g) => g.dressId), ...Object.keys(generated)]);
  const selected: CollectionItem | null = all?.find((g) => g.dressId === selectedId) ?? null;
  const wantedTryOn = params.get('t');
  const previous = groups.find((g) => g.dressId === selectedId)?.tryOns ?? [];
  const made = selectedId ? generated[selectedId] : undefined;
  const earlier = previous.find((t) => t.id === wantedTryOn) ?? previous[0];
  const result: Made | null = made ?? (earlier ? { tryOn: earlier, options: DEFAULT_OPTIONS, couple: false } : null);
  // Si se cambian el fondo o la pareja, la prueba que se ve ya no es la que se pediría.
  const options = optionsKey(background, partner);
  const upToDate = result?.options === options;

  // El escenario enseña la prueba si existe; si no, el avatar. Solo las pruebas
  // llevan vídeo 360: el avatar se queda en foto (el vídeo se paga y no hace falta).
  const showing = result ? { key: `t:${result.tryOn.id}`, still: result.tryOn.imageUrl } : avatar ? { key: 'avatar', still: avatar.avatarUrl } : null;
  const turntable = useTurntable(result ? `t:${result.tryOn.id}` : null, (start) =>
    result ? tryOnTurntable(result.tryOn.id, start, result.couple) : Promise.resolve({ status: 'none' as const }),
  );
  const videoReady = turntable?.status === 'ready' && turntable.videoUrl ? turntable.videoUrl : null;

  // Vistas de la prueba: el 360 (con la foto mientras llega), la foto de frente y,
  // cuando el CRM las tiene, las de detalle. Al cambiar de prueba, vuelve al 360.
  const [viewChoice, setViewChoice] = useState<{ key: string | null; view: View }>({ key: null, view: 'turn' });
  const detailFront = turntable?.details?.frontUrl ?? null;
  const detailBack = turntable?.details?.backUrl ?? null;
  const detailsPending = turntable?.details?.status === 'processing';
  const viewOptions: ViewOption<View>[] = result
    ? [
        { id: 'turn', label: '360°', pending: !videoReady && (turntable === null || turntable.status === 'processing') },
        { id: 'front', label: 'Frente' },
        ...(detailFront || detailsPending ? [{ id: 'detail' as const, label: 'Detalle', pending: !detailFront }] : []),
        ...(detailBack || detailsPending ? [{ id: 'back' as const, label: 'Espalda', pending: !detailBack }] : []),
      ]
    : [];
  const chosen = result && viewChoice.key === showing?.key ? viewChoice.view : 'turn';
  const viewUrl = { turn: result?.tryOn.imageUrl, front: result?.tryOn.imageUrl, detail: detailFront, back: detailBack }[chosen];
  const view: View = viewUrl ? chosen : 'turn';
  const stageStill = view === 'detail' || view === 'back' ? (viewUrl ?? null) : (showing?.still ?? null);
  const showSwitch = Boolean(result) && working === null;

  // Zoom entre la lista y la prenda en grande (View Transitions donde el navegador las tiene).
  const zoom = (update: () => void) => {
    if ('startViewTransition' in document && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(() => {
        flushSync(update);
      });
    } else {
      update();
    }
  };

  // Al volver a la lista, la prenda elegida queda a la vista.
  useEffect(() => {
    if (!focused && selectedId) document.getElementById(`prenda-${selectedId}`)?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [focused, selectedId]);

  const tryOn = async () => {
    if (!selected) return;
    setWorking(selected.dressId);
    setError(null);
    try {
      const tryOn = await generateTryOn(selected.dressId, {
        backgroundNote: backgroundNote(background),
        twoStep: background.id !== DEFAULT_BACKGROUND.id,
        partner: partner ? { dressId: partner.dressId, image: partner.image } : null,
      });
      setGenerated((g) => ({ ...g, [selected.dressId]: { tryOn, options, couple: Boolean(partner) } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo hacer la prueba.');
    } finally {
      setWorking(null);
    }
  };

  const toggle = async () => {
    if (!selected) return;
    const next = new Set(favoriteIds);
    const saved = await toggleFavorite(selected.dressId).catch(() => favoriteIds.has(selected.dressId));
    if (saved) next.add(selected.dressId);
    else next.delete(selected.dressId);
    setFavorites(next);
  };

  // Dentro del marco de atelierdebodas.com el navegador no deja abrir el menú de
  // compartir ni copiar: entonces se copia o, si tampoco, se abre WhatsApp con el enlace.
  const share = async () => {
    if (!result || !selected) return;
    const url = `${window.location.origin}${withBase(`/c/${result.tryOn.id}`)}?d=${selected.dressId}`;
    const text = `Así me queda ${selected.name} · ${brand.name}`;
    if ('share' in navigator) {
      try {
        await navigator.share({ title: selected.name, text, url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return; // menú cancelado
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setNotice('Enlace copiado');
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank', 'noopener');
    }
  };

  const busy = working !== null;
  const expected =
    (partner ? EXPECTED_SECONDS.couple : EXPECTED_SECONDS.single) + (background.id !== DEFAULT_BACKGROUND.id ? EXPECTED_SECONDS.scene : 0);
  const preset = BACKGROUNDS.find((b) => b.id === background.id);


  return {
    router,
    params,
    tab,
    setTab,
    selectedId,
    setSelectedId,
    focused,
    setFocused,
    background,
    setBackground,
    partner,
    setPartner,
    sheet,
    setSheet,
    working,
    error,
    setError,
    notice,
    elapsed,
    avatar,
    catalog,
    all,
    garments,
    favoriteIds,
    triedIds,
    selected,
    result,
    upToDate,
    showing,
    turntable,
    videoReady,
    viewOptions,
    setViewChoice,
    detailFront,
    detailBack,
    view,
    stageStill,
    showSwitch,
    zoom,
    tryOn,
    toggle,
    share,
    busy,
    expected,
    preset,
  };
}
