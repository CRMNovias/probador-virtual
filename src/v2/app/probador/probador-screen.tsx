import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Download, Heart, LoaderCircle, PenLine, RotateCcw, Share2, UserRound, Users } from 'lucide-react';
import { BottomNav, TopBar } from '@v2/components/app-shell';
import { Backdrop } from '@v2/components/backdrop';
import { Turntable } from '@v2/components/turntable';
import { ViewSwitch, type ViewOption } from '@v2/components/view-switch';
import { Button, Notice } from '@v2/components/ui';
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
import { BACKGROUNDS, backgroundLabel, backgroundNote, DEFAULT_BACKGROUND, type BackgroundChoice } from '@v2/lib/backgrounds';
import { brand } from '@v2/lib/brand';
import type { Category, CollectionItem, TryOn } from '@v2/lib/types';
import { useLoad } from '@v2/lib/use-load';
import { turntableLabel, useTurntable } from '@v2/lib/use-turntable';
import { BackgroundSheet } from './background-sheet';
import { PartnerSheet, type Partner } from './partner-sheet';
import { withBase } from '@v2/lib/base-path';

const TABS: { id: Category; label: string }[] = [
  { id: 'bride', label: 'Novia' },
  { id: 'groom', label: 'Novio' },
];

/**
 * Segundos que suele tardar la IA en vestir al avatar (imagen fija); con pareja,
 * algo más; con un fondo de exterior, un paso más (ver twoStep en generateTryOn).
 */
const EXPECTED_SECONDS = { single: 50, couple: 85, scene: 30 };

/** Vistas de una prueba: el giro 360, la foto de frente y las de detalle. */
type View = 'turn' | 'front' | 'detail' | 'back';

/** Una prueba hecha en esta visita, con las opciones con que se hizo. */
interface Made {
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

export function ProbadorScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const wantedCategory = params.get('c');
  const [tabChoice, setTab] = useState<Category | null>(wantedCategory === 'groom' || wantedCategory === 'bride' ? wantedCategory : null);
  const wantedId = params.get('d');
  const [selectedId, setSelectedId] = useState<string | null>(wantedId);
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

  const share = async () => {
    if (!result || !selected) return;
    const url = `${window.location.origin}${withBase(`/c/${result.tryOn.id}`)}?d=${selected.dressId}`;
    try {
      if (navigator.share) await navigator.share({ title: selected.name, text: `Así me queda ${selected.name} · ${brand.name}`, url });
      else {
        await navigator.clipboard.writeText(url);
        setNotice('Enlace copiado');
      }
    } catch {
      // Menú de compartir cancelado.
    }
  };

  const busy = working !== null;
  const expected =
    (partner ? EXPECTED_SECONDS.couple : EXPECTED_SECONDS.single) + (background.id !== DEFAULT_BACKGROUND.id ? EXPECTED_SECONDS.scene : 0);
  const preset = BACKGROUNDS.find((b) => b.id === background.id);

  return (
    <div className="flex h-dvh flex-col">
      <TopBar />

      {/* Móvil y tablet: escenario arriba y prendas abajo. Ordenador: prendas en una columna a la derecha. */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Escenario: el avatar o la prueba, girando sobre el gris de estudio */}
        <section className="relative min-h-0 flex-1 bg-studio" aria-label="Probador">
          <Backdrop src={stageStill} />
          {showing && stageStill ? (
            <div className="relative flex h-full justify-center">
              <Turntable
                className="h-full !w-auto"
                stillUrl={stageStill}
                videoUrl={view === 'turn' && turntable?.status === 'ready' ? turntable.videoUrl : null}
                pendingLabel={busy || !result || view !== 'turn' ? null : turntableLabel(turntable)}
                badge={!showSwitch}
                pendingPosition={showSwitch ? 'bottom-14' : 'top-3'}
                overlay={
                  showSwitch ? (
                    <ViewSwitch
                      options={viewOptions}
                      value={view}
                      onChange={(v) => {
                        setViewChoice({ key: showing.key, view: v });
                      }}
                    />
                  ) : null
                }
                alt={
                  result && selected
                    ? view === 'detail'
                      ? `Detalle de ${selected.name}, por delante`
                      : view === 'back'
                        ? `Detalle de ${selected.name}, por detrás`
                        : `Tu avatar con ${selected.name}`
                    : 'Tu avatar'
                }
              />
            </div>
          ) : (
            <div className="relative h-full shimmer" />
          )}

          {busy ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-studio/80 backdrop-blur-md" aria-live="polite">
              <p className="label-caps px-6 text-center">
                {partner ? 'Preparando la foto de los dos' : `Vistiéndote con ${all?.find((g) => g.dressId === working)?.name ?? ''}`}
              </p>
              <p className="mt-2 text-[40px] font-light tabular-nums">{elapsed} s</p>
              <p className="mt-1 text-[13px] text-muted">
                {elapsed < expected ? `Suele tardar unos ${expected} s` : 'Un poco más de lo normal…'}
              </p>
            </div>
          ) : null}
        </section>

        {/* Prendas y acción */}
        <section className="border-t border-line bg-white pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:flex lg:w-[380px] lg:flex-col lg:border-l lg:border-t-0 lg:pb-0 xl:w-[440px]">
          <div className="flex items-center justify-between px-4 pt-3 md:px-6 lg:pt-5">
            <div role="tablist" aria-label="Colección" className="flex gap-5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`label-caps h-8 ${tab === t.id ? 'border-b border-ink text-ink' : 'text-neutral-400'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Link href={`/coleccion${tab === 'groom' ? '?c=groom' : ''}`} className="label-caps h-8 leading-8 text-muted">
              Ver todo
            </Link>
          </div>

          <ul
            className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 md:gap-3 md:px-6 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:content-start lg:gap-x-2 lg:gap-y-4 lg:overflow-y-auto lg:overflow-x-hidden lg:py-4"
            aria-label="Elige qué probarte"
          >
            {(garments ?? Array.from({ length: 6 }, () => null)).map((g, i) => (
              <li key={g?.dressId ?? i} className="shrink-0">
                {g ? (
                  <button
                    type="button"
                    aria-pressed={selectedId === g.dressId}
                    onClick={() => {
                      setSelectedId(g.dressId);
                      setError(null);
                    }}
                    disabled={busy}
                    className="block w-[76px] text-left md:w-[96px] lg:w-full"
                  >
                    <span className={`relative block aspect-[3/4] w-full bg-studio ${selectedId === g.dressId ? 'outline outline-1 outline-offset-2 outline-ink' : ''}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- imagen del catálogo */}
                      <img src={g.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                      {triedIds.has(g.dressId) ? (
                        <span className="absolute bottom-1 right-1 grid size-4 place-items-center bg-white" title="Ya probado">
                          <Check className="size-3" aria-hidden />
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1.5 block truncate text-[11px] uppercase tracking-[0.08em]">{g.name}</span>
                  </button>
                ) : (
                  <span className="block aspect-[3/4] w-[76px] shimmer md:w-[96px] lg:w-full" />
                )}
              </li>
            ))}
          </ul>

          <div className="px-4 pb-3 md:px-6 lg:border-t lg:border-line lg:py-4">
            {selected ? <p className="label-caps mb-3 hidden truncate lg:block">{selected.name}</p> : null}
            {error ? (
              <div className="mb-2">
                <Notice tone="danger">{error}</Notice>
              </div>
            ) : null}
            {notice ? (
              <div className="mb-2">
                <Notice>{notice}</Notice>
              </div>
            ) : null}

            {/* Opciones de la prueba: con qué avatar, dónde te ves y si sales con tu pareja (no son pasos obligatorios) */}
            <div className="mb-3 flex items-center gap-3">
              <Link
                href="/avatar?next=/probador"
                aria-disabled={busy}
                aria-label="Avatar: cambiarlo"
                className={`flex shrink-0 items-center gap-2 text-left ${busy ? 'pointer-events-none opacity-50' : ''}`}
              >
                <span className="grid size-8 shrink-0 place-items-center overflow-hidden bg-studio">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- imagen del CRM (S3)
                    <img src={avatar.avatarUrl} alt="" className="h-full w-full object-cover object-top" />
                  ) : (
                    <UserRound className="size-4" strokeWidth={1.5} aria-hidden />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-[0.1em] text-muted">Avatar</span>
                  <span className="label-caps block">Cambiar</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setSheet('background')}
                disabled={busy}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                aria-label={`Fondo: ${backgroundLabel(background)}. Cambiar`}
              >
                <span className="grid size-8 shrink-0 place-items-center overflow-hidden bg-studio">
                  {preset ? (
                    // eslint-disable-next-line @next/next/no-img-element -- miniatura local
                    <img src={preset.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <PenLine className="size-4" strokeWidth={1.5} aria-hidden />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-[0.1em] text-muted">Fondo</span>
                  <span className="label-caps block truncate">{backgroundLabel(background)}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSheet('partner')}
                disabled={busy}
                aria-pressed={Boolean(partner)}
                aria-label={partner ? `Pareja: con tu pareja, que lleva ${partner.dressName}. Cambiar` : 'Añadir a tu pareja'}
                className="flex min-w-0 items-center gap-2 text-left"
              >
                <span className={`grid size-8 shrink-0 place-items-center overflow-hidden ${partner ? 'bg-ink text-white' : 'border border-line'}`}>
                  {partner ? (
                    // eslint-disable-next-line @next/next/no-img-element -- foto local de la pareja
                    <img src={partner.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Users className="size-4" strokeWidth={1.5} aria-hidden />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-[0.1em] text-muted">Pareja</span>
                  <span className="label-caps block truncate">{partner ? 'Con tu pareja' : 'Añadir'}</span>
                </span>
              </button>
            </div>

            {!selected ? (
              <p className="label-caps flex h-12 items-center justify-center text-muted">Elige un modelo para probártelo</p>
            ) : result && upToDate && !busy ? (
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2">
                <Link
                  href={`/cita/nueva?c=${tab}`}
                  className="inline-flex h-12 items-center justify-center bg-ink px-4 text-[12px] font-medium uppercase tracking-[0.12em] text-white"
                >
                  Pedir cita
                </Link>
                <button
                  type="button"
                  onClick={() => void toggle()}
                  aria-pressed={favoriteIds.has(selected.dressId)}
                  aria-label={favoriteIds.has(selected.dressId) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  className="grid size-12 place-items-center border border-ink"
                >
                  <Heart className={`size-5 ${favoriteIds.has(selected.dressId) ? 'fill-ink' : ''}`} strokeWidth={1.5} aria-hidden />
                </button>
                <button type="button" onClick={() => void share()} aria-label="Compartir" className="grid size-12 place-items-center border border-ink">
                  <Share2 className="size-5" strokeWidth={1.5} aria-hidden />
                </button>
                {videoReady ? (
                  <a
                    href={`${videoReady}?download=1&name=${encodeURIComponent(selected.name)}`}
                    download
                    aria-label="Descargar el vídeo 360°"
                    className="grid size-12 place-items-center border border-ink"
                  >
                    <Download className="size-5" strokeWidth={1.5} aria-hidden />
                  </a>
                ) : turntable?.status === 'failed' || turntable?.status === 'none' ? (
                  <span
                    role="img"
                    aria-label="Esta prueba no tiene vídeo 360°"
                    title="Esta prueba no tiene vídeo 360°"
                    className="grid size-12 place-items-center border border-line text-neutral-300"
                  >
                    <Download className="size-5" strokeWidth={1.5} aria-hidden />
                  </span>
                ) : (
                  <span
                    role="img"
                    aria-label="El vídeo 360° se está preparando"
                    title="El vídeo 360° se está preparando"
                    className="grid size-12 place-items-center border border-line text-neutral-400"
                  >
                    <LoaderCircle className="size-5 animate-spin" strokeWidth={1.5} aria-hidden />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => void tryOn()}
                  aria-label="Repetir la prueba"
                  className="grid size-12 place-items-center border border-ink"
                >
                  <RotateCcw className="size-5" strokeWidth={1.5} aria-hidden />
                </button>
              </div>
            ) : (
              <Button block loading={busy} onClick={() => void tryOn()}>
                {busy ? 'Probando…' : `Probar ${selected.name}`}
              </Button>
            )}
          </div>
        </section>
      </div>

      <BackgroundSheet open={sheet === 'background'} value={background} onChange={setBackground} onClose={() => setSheet(null)} />
      <PartnerSheet
        open={sheet === 'partner'}
        value={partner}
        garments={catalog ? { bride: catalog[0].items, groom: catalog[1].items } : null}
        defaultCategory={tab === 'groom' ? 'bride' : 'groom'}
        onChange={setPartner}
        onClose={() => setSheet(null)}
      />

      <BottomNav />
    </div>
  );
}
