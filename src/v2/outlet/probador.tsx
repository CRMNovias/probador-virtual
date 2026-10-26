import { useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight, Download, Heart, PenLine, RotateCcw, Share2, Sparkles, UserRound, Users } from 'lucide-react';
import { Backdrop } from '@v2/components/backdrop';
import { Turntable } from '@v2/components/turntable';
import { Button, LinkButton, Notice } from '@v2/components/ui';
import { BackgroundSheet } from '@v2/app/probador/background-sheet';
import { PartnerSheet } from '@v2/app/probador/partner-sheet';
import { useProbador } from '@v2/app/probador/use-probador';
import { backgroundLabel } from '@v2/lib/backgrounds';
import { brand } from '@v2/lib/brand';
import type { Category } from '@v2/lib/types';
import { turntableLabel } from '@v2/lib/use-turntable';
import { OutletSpinner, OutletTopBar, outletLabel } from './shell';

const TABS: { id: Category; label: string }[] = [
  { id: 'bride', label: 'Novia' },
  { id: 'groom', label: 'Novio' },
];

/** Botón de línea («Compartir», «360°», «Repetir»). */
const lineButton =
  'inline-flex h-10 items-center justify-center gap-1.5 border border-ink bg-white px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-default disabled:border-line disabled:text-muted disabled:hover:bg-white';

/** Fila de opciones, como los desplegables de la V1 («Tu avatar», «Elige una pose»): antetítulo, valor y miniatura. */
function OptionRow({
  thumb,
  label,
  value,
  href,
  onClick,
  disabled,
}: {
  thumb: ReactNode;
  label: string;
  value: string;
  href?: string;
  onClick?: () => void;
  disabled: boolean;
}) {
  const body = (
    <>
      <span className="grid size-11 shrink-0 place-items-center overflow-hidden border border-line bg-studio">{thumb}</span>
      <span className="min-w-0 flex-1">
        <span className={`block ${outletLabel}`}>{label}</span>
        <span className="mt-0.5 block truncate text-[14px] leading-snug">{value}</span>
      </span>
      <ChevronRight className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
    </>
  );
  const row = `flex w-full items-center gap-3.5 border-b border-line py-3 text-left transition-colors hover:bg-studio ${disabled ? 'pointer-events-none opacity-50' : ''}`;
  return href ? (
    <Link href={href} className={row} aria-disabled={disabled}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} disabled={disabled} className={row}>
      {body}
    </button>
  );
}

/** «Elige por dónde empezar» de la V1: la colección de novia (bloque negro) o la de novio. */
function StartBlocks() {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      {[
        { href: '/coleccion', number: '01', title: 'Novia', dark: true },
        { href: '/coleccion?c=groom', number: '02', title: 'Novio', dark: false },
      ].map((b) => (
        <Link
          key={b.href}
          href={b.href}
          className={`flex aspect-[5/4] flex-col justify-between border border-ink p-3.5 transition-colors ${
            b.dark ? 'bg-ink text-white hover:bg-ink/85' : 'bg-white hover:bg-studio'
          }`}
        >
          <span className="font-mono text-[10px] opacity-70">{b.number}</span>
          <span>
            <span className="block text-[9px] uppercase tracking-[0.3em] opacity-70">Colección</span>
            <span className="mt-1 block text-[28px] font-bold leading-none">{b.title}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

/**
 * Probador de Outlet. La prueba a la izquierda (arriba en móvil), enmarcada en
 * negro sobre gris claro, con sus vistas debajo; a la derecha, como en la V1:
 * la caja «Prenda seleccionada», otras prendas para cambiar sin salir, las
 * opciones (avatar, fondo y pareja) en filas y el botón negro, siempre a la
 * vista (fijo abajo en móvil). Hace lo mismo que el de Atelier.
 */
export function OutletProbador() {
  const {
    tab,
    setTab,
    selectedId,
    setSelectedId,
    background,
    setBackground,
    partner,
    setPartner,
    sheet,
    setSheet,
    error,
    setError,
    notice,
    elapsed,
    avatar,
    catalog,
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
    view,
    stageStill,
    showSwitch,
    tryOn,
    toggle,
    share,
    busy,
    expected,
    preset,
  } = useProbador();
  const here = selected ? `/probador?c=${tab}&d=${selected.dressId}` : '/probador';
  const favorite = selected ? favoriteIds.has(selected.dressId) : false;
  const detail = selected ? (tab === 'groom' ? selected.color : selected.cut) : null;
  const ready = Boolean(result && upToDate && !busy && selected);
  const noVideo = turntable?.status === 'failed' || turntable?.status === 'none';
  const collection = `/coleccion${tab === 'groom' ? '?c=groom' : ''}`;

  // La prenda elegida, a la vista en la tira (sin mover la página).
  const strip = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const list = strip.current;
    const item = selectedId ? document.getElementById(`on-prenda-${selectedId}`) : null;
    if (!list || !item) return;
    const box = list.getBoundingClientRect();
    const at = item.getBoundingClientRect();
    list.scrollLeft += at.left - box.left - (box.width - at.width) / 2;
  }, [selectedId, garments?.length, tab]);

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <OutletTopBar />

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        {/* Escenario: la prueba en grande, con sus vistas debajo */}
        <section className="flex h-[66dvh] shrink-0 flex-col bg-studio px-3 pb-2 pt-3 lg:h-auto lg:min-h-0 lg:flex-1 lg:px-10 lg:pb-4 lg:pt-6" aria-label="Probador">
          <div className="flex min-h-0 flex-1 justify-center">
            <div className="relative aspect-[9/16] h-full max-w-full overflow-hidden border border-ink bg-white">
              <Backdrop src={stageStill} />
              {showing && stageStill ? (
                <Turntable
                  className="h-full"
                  stillUrl={stageStill}
                  videoUrl={view === 'turn' && turntable?.status === 'ready' ? turntable.videoUrl : null}
                  pendingLabel={busy || !result || view !== 'turn' ? null : turntableLabel(turntable)}
                  badge
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
              ) : (
                <div className="h-full shimmer" />
              )}

              {busy ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-white/80 px-6 text-center backdrop-blur-[2px]" aria-live="polite">
                  <OutletSpinner />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted">{partner ? 'Preparando la foto de los dos' : 'Generando tu prueba'}</p>
                  <p className="font-mono text-[30px] tabular-nums">{elapsed} s</p>
                  <p className="text-[12px] text-muted">{elapsed < expected ? `Suele tardar unos ${expected} s` : 'Un poco más de lo normal…'}</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Vistas de la prueba: 360, frente y detalles */}
          <div className="flex h-11 shrink-0 items-end justify-center lg:h-12">
            {showSwitch ? (
              <div role="tablist" aria-label="Vistas de la prueba" className="flex">
                {viewOptions.map((o) => {
                  const on = o.id === view;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      disabled={o.pending}
                      onClick={() => showing && setViewChoice({ key: showing.key, view: o.id })}
                      className={`-ml-px inline-flex h-8 items-center gap-1.5 border px-3.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors first:ml-0 ${
                        on ? 'z-10 border-ink bg-ink text-white' : o.pending ? 'border-line bg-white/60 text-muted' : 'border-ink/25 bg-white hover:z-10 hover:border-ink'
                      }`}
                    >
                      {o.pending ? <span className="size-1 animate-pulse bg-current" aria-hidden /> : null}
                      {o.label}
                      {o.pending ? <span className="sr-only"> (preparándose)</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className={`pb-2 ${outletLabel}`}>{selected ? 'Tu avatar' : 'Elige una prenda para probártela'}</p>
            )}
          </div>
        </section>

        {/* Panel: la prenda, otras prendas, las opciones y el botón */}
        <aside className="flex flex-col bg-white lg:min-h-0 lg:w-[440px] lg:border-l lg:border-line xl:w-[480px]">
          <div className="flex-1 px-5 pb-44 pt-5 lg:min-h-0 lg:overflow-y-auto lg:px-8 lg:pb-6 lg:pt-7">
            {selected ? (
              <>
                <Link href={collection} className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted hover:text-ink">
                  ← Colección {tab === 'groom' ? 'novio' : 'novia'}
                </Link>

                {/* La prenda, en la caja de la V1 */}
                <div className="mt-4 border border-line p-4">
                  <p className={outletLabel}>Prenda seleccionada</p>
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h1 className="text-[26px] font-bold leading-[1.1] tracking-[-0.01em]">{selected.name}</h1>
                      {selected.brand || detail ? (
                        <p className="mt-1 text-[12px] text-muted">{[selected.brand && selected.brand !== brand.name ? selected.brand : null, detail].filter(Boolean).join(' · ')}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggle()}
                      aria-pressed={favorite}
                      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12px] transition-colors ${
                        favorite ? 'border-ink bg-ink text-white' : 'border-ink/25 hover:border-ink'
                      }`}
                    >
                      <Heart className={`size-4 ${favorite ? 'fill-white' : ''}`} strokeWidth={1.5} aria-hidden />
                      {favorite ? 'En favoritos' : 'Añadir a favoritos'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className={outletLabel}>Probador virtual</p>
                <h1 className="mt-1.5 text-[30px] font-bold leading-[1.08] tracking-[-0.01em]">Elige por dónde empezar</h1>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">Selecciona una colección y elige la prenda que quieras probarte.</p>
                <StartBlocks />
              </>
            )}

            {/* Otras prendas: cambiar sin salir del probador */}
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <div role="tablist" aria-label="Colección" className="flex gap-5">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      role="tab"
                      type="button"
                      aria-selected={tab === t.id}
                      onClick={() => setTab(t.id)}
                      className={`border-b-2 pb-1 text-[11px] uppercase tracking-[0.26em] transition-colors ${
                        tab === t.id ? 'border-ink font-bold text-ink' : 'border-transparent font-medium text-muted hover:text-ink'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <Link href={collection} className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted hover:text-ink">
                  Ver todo
                </Link>
              </div>
              <ul ref={strip} className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 py-1.5 lg:-mx-8 lg:px-8" aria-label="Elige qué probarte">
                {(garments ?? Array.from({ length: 6 }, () => null)).map((g, i) => (
                  <li key={g?.dressId ?? i} className="shrink-0">
                    {g ? (
                      <button
                        type="button"
                        id={`on-prenda-${g.dressId}`}
                        aria-pressed={selectedId === g.dressId}
                        aria-label={g.name}
                        title={g.name}
                        disabled={busy}
                        onClick={() => {
                          setSelectedId(g.dressId);
                          setError(null);
                        }}
                        className="relative block w-[68px] disabled:opacity-60"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- imagen del catálogo */}
                        <img
                          src={g.imageUrl}
                          alt=""
                          loading="lazy"
                          className={`aspect-[3/4] w-full bg-studio object-cover object-[center_16%] ${selectedId === g.dressId ? 'outline outline-2 outline-offset-2 outline-ink' : ''}`}
                        />
                        {triedIds.has(g.dressId) ? <span className="absolute right-1 top-1 size-2 border border-white bg-ink" title="Ya probado" /> : null}
                      </button>
                    ) : (
                      <span className="block aspect-[3/4] w-[68px] shimmer" />
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Opciones de la prueba, en filas como las de la V1 */}
            <div className="mt-6 border-t border-line">
              <OptionRow
                href={`/avatar?next=${encodeURIComponent(here)}`}
                disabled={busy}
                label="Tu avatar"
                value={avatar ? 'Listo · cambiarlo' : 'Créalo con una foto'}
                thumb={
                  avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- imagen del CRM (S3)
                    <img src={avatar.avatarUrl} alt="" className="h-full w-full object-cover object-top" />
                  ) : (
                    <UserRound className="size-5 text-muted" strokeWidth={1.5} aria-hidden />
                  )
                }
              />
              <OptionRow
                onClick={() => setSheet('background')}
                disabled={busy}
                label="Fondo"
                value={backgroundLabel(background)}
                thumb={
                  preset ? (
                    // eslint-disable-next-line @next/next/no-img-element -- miniatura local
                    <img src={preset.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <PenLine className="size-5 text-muted" strokeWidth={1.5} aria-hidden />
                  )
                }
              />
              <OptionRow
                onClick={() => setSheet('partner')}
                disabled={busy}
                label="Tu pareja"
                value={partner ? `Con tu pareja · ${partner.dressName}` : 'Añádela para probaros juntos'}
                thumb={
                  partner ? (
                    // eslint-disable-next-line @next/next/no-img-element -- foto local de la pareja
                    <img src={partner.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Users className="size-5 text-muted" strokeWidth={1.5} aria-hidden />
                  )
                }
              />
            </div>
          </div>

          {/* El botón, siempre a la vista: fijo abajo en móvil, al pie del panel en ordenador */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur lg:static lg:z-auto lg:bg-white lg:px-8 lg:pb-6 lg:pt-5 lg:backdrop-blur-none">
            {error ? (
              <div className="mb-2.5">
                <Notice tone="danger">{error}</Notice>
              </div>
            ) : null}
            {notice ? (
              <div className="mb-2.5">
                <Notice>{notice}</Notice>
              </div>
            ) : null}
            {!selected ? (
              <LinkButton href="/coleccion" block>
                Ver la colección
              </LinkButton>
            ) : ready ? (
              <>
                <div className="mb-2 grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => void share()} className={lineButton}>
                    <Share2 className="size-3.5" strokeWidth={1.5} aria-hidden />
                    Compartir
                  </button>
                  {videoReady ? (
                    <a href={`${videoReady}?download=1&name=${encodeURIComponent(selected.name)}`} download className={lineButton} aria-label="Descargar el vídeo 360°">
                      <Download className="size-3.5" strokeWidth={1.5} aria-hidden />
                      360°
                    </a>
                  ) : (
                    <button type="button" disabled className={lineButton} title={noVideo ? 'Esta prueba no tiene vídeo 360°' : 'El vídeo 360° se está preparando'}>
                      <Download className="size-3.5" strokeWidth={1.5} aria-hidden />
                      {noVideo ? 'Sin 360°' : '360°…'}
                    </button>
                  )}
                  <button type="button" onClick={() => void tryOn()} className={lineButton}>
                    <RotateCcw className="size-3.5" strokeWidth={1.5} aria-hidden />
                    Repetir
                  </button>
                </div>
                <LinkButton href={`/cita/nueva?c=${tab}`} block>
                  Pide cita
                </LinkButton>
              </>
            ) : (
              <Button block loading={busy} onClick={() => void tryOn()}>
                {busy ? null : <Sparkles className="size-4" strokeWidth={1.5} aria-hidden />}
                {busy ? `Generando… ${elapsed} s` : 'Generar prueba virtual'}
              </Button>
            )}
          </div>
        </aside>
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
    </div>
  );
}
