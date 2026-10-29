import { useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight, Download, Heart, PenLine, RotateCcw, Share2, UserRound, Users } from 'lucide-react';
import { Backdrop } from '@v2/components/backdrop';
import { Turntable } from '@v2/components/turntable';
import { Button, LinkButton, Notice } from '@v2/components/ui';
import { BackgroundSheet } from '@v2/app/probador/background-sheet';
import { PartnerSheet } from '@v2/app/probador/partner-sheet';
import { useProbador } from '@v2/app/probador/use-probador';
import { backgroundLabel } from '@v2/lib/backgrounds';
import type { Category } from '@v2/lib/types';
import { turntableLabel } from '@v2/lib/use-turntable';
import { SedkaSpinner, SedkaTopBar } from './shell';

const TABS: { id: Category; label: string }[] = [
  { id: 'bride', label: 'Vestidos' },
  { id: 'groom', label: 'Trajes' },
];

/** Botón fino de la V1 («Compartir», «Descargar»). */
const lineButton =
  'inline-flex h-10 items-center justify-center gap-1.5 rounded border border-ink bg-white px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-default disabled:border-line disabled:text-muted disabled:hover:bg-white';

/** Fila de la caja de opciones, como las de la reserva de la V1: miniatura, etiqueta dorada y valor. */
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
      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-studio">{thumb}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-dark">{label}</span>
        <span className="block truncate text-[15px] leading-snug">{value}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={1.5} aria-hidden />
    </>
  );
  const row = `flex w-full items-center gap-3.5 border-b border-line px-[18px] py-3 text-left transition-colors last:border-b-0 hover:bg-accent/5 ${
    disabled ? 'pointer-events-none opacity-50' : ''
  }`;
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

/**
 * Probador de Sedka. La prueba ocupa todo el alto a la izquierda (arriba en
 * móvil), sobre crema, con sus vistas debajo; a la derecha, un solo panel: la
 * prenda, otros diseños para cambiar sin salir, las opciones (avatar, fondo y
 * pareja) en una caja como la de la reserva de la V1 y el botón siempre a la
 * vista (fijo abajo en móvil). Hace lo mismo que el de Atelier.
 */
export function SedkaProbador() {
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
    needsPhone,
    askForPhone,
    toggle,
    share,
    busy,
    preset,
  } = useProbador();
  const here = selected ? `/probador?c=${tab}&d=${selected.dressId}` : '/probador';
  const favorite = selected ? favoriteIds.has(selected.dressId) : false;
  const detail = selected ? (tab === 'groom' ? selected.color : selected.cut) : null;
  const ready = Boolean(result && upToDate && !busy && selected);
  const noVideo = turntable?.status === 'failed' || turntable?.status === 'none';

  // La prenda elegida, a la vista en la tira de diseños (sin mover la página).
  const strip = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const list = strip.current;
    const item = selectedId ? document.getElementById(`sk-prenda-${selectedId}`) : null;
    if (!list || !item) return;
    const box = list.getBoundingClientRect();
    const at = item.getBoundingClientRect();
    list.scrollLeft += at.left - box.left - (box.width - at.width) / 2;
  }, [selectedId, garments?.length, tab]);

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <SedkaTopBar />

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        {/* Escenario: la prueba en grande, sobre crema, con sus vistas debajo */}
        <section className="flex h-[66dvh] shrink-0 flex-col bg-studio px-3 pb-2 pt-3 lg:h-auto lg:min-h-0 lg:flex-1 lg:px-8 lg:pb-4 lg:pt-6" aria-label="Probador">
          <div className="flex min-h-0 flex-1 justify-center">
            <div className="relative aspect-[9/16] h-full max-w-full overflow-hidden rounded-[10px] border border-line bg-white shadow-[0_10px_34px_rgba(20,16,12,0.08)]">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-white/75 px-6 text-center backdrop-blur-[2px]" aria-live="polite">
                  <SedkaSpinner />
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{partner ? 'Preparando la foto de los dos' : 'Generando tu prueba'}</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Vistas de la prueba: 360, frente y detalles */}
          <div className="flex h-11 shrink-0 items-end justify-center lg:h-12">
            {showSwitch ? (
              <div role="tablist" aria-label="Vistas de la prueba" className="flex gap-1.5">
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
                      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                        on ? 'border-accent bg-accent text-white' : o.pending ? 'border-line bg-white/60 text-muted' : 'border-line bg-white hover:border-accent hover:text-accent'
                      }`}
                    >
                      {o.pending ? <span className="size-1 animate-pulse rounded-full bg-current" aria-hidden /> : null}
                      {o.label}
                      {o.pending ? <span className="sr-only"> (preparándose)</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="pb-2 text-[11px] uppercase tracking-[0.22em] text-muted">{selected ? 'Tu avatar' : 'Elige un diseño para probártelo'}</p>
            )}
          </div>
        </section>

        {/* Panel: la prenda, otros diseños, las opciones y el botón */}
        <aside className="flex flex-col bg-white lg:min-h-0 lg:w-[420px] lg:border-l lg:border-line xl:w-[460px]">
          <div className="flex-1 px-5 pb-44 pt-4 lg:min-h-0 lg:overflow-y-auto lg:px-8 lg:pb-6 lg:pt-6">
            <Link
              href={`/coleccion${tab === 'groom' ? '?c=groom' : ''}`}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-dark hover:underline"
            >
              ← Volver a la colección
            </Link>

            {/* La prenda */}
            <div className="mt-4 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">{selected ? selected.brand || 'Sedka Novias' : 'Probador virtual'}</p>
                <h1 className="mt-1 text-[28px] font-light leading-[1.1] tracking-[0.02em]">{selected ? selected.name : 'Elige qué probarte'}</h1>
                {detail ? <p className="mt-1 text-[13px] text-muted">{detail}</p> : null}
              </div>
              {selected ? (
                <button
                  type="button"
                  onClick={() => void toggle()}
                  aria-pressed={favorite}
                  aria-label={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  className={`grid size-11 shrink-0 place-items-center rounded-full border transition-colors ${
                    favorite ? 'border-accent text-accent' : 'border-line text-muted hover:border-accent hover:text-accent'
                  }`}
                >
                  <Heart className={`size-[18px] ${favorite ? 'fill-accent' : ''}`} strokeWidth={1.5} aria-hidden />
                </button>
              ) : null}
            </div>

            {/* Otros diseños: cambiar sin salir del probador */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div role="tablist" aria-label="Colección" className="flex gap-4">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      role="tab"
                      type="button"
                      aria-selected={tab === t.id}
                      onClick={() => setTab(t.id)}
                      className={`border-b py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                        tab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <Link href={`/coleccion${tab === 'groom' ? '?c=groom' : ''}`} className="text-[11px] uppercase tracking-[0.14em] text-muted hover:text-accent">
                  Ver todo
                </Link>
              </div>
              <ul ref={strip} className="no-scrollbar -mx-5 mt-3 flex gap-2.5 overflow-x-auto px-5 py-1.5 lg:-mx-8 lg:px-8" aria-label="Elige qué probarte">
                {(garments ?? Array.from({ length: 6 }, () => null)).map((g, i) => (
                  <li key={g?.dressId ?? i} className="shrink-0">
                    {g ? (
                      <button
                        type="button"
                        id={`sk-prenda-${g.dressId}`}
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
                          className={`aspect-[3/4] w-full rounded-lg bg-studio object-cover object-[center_16%] ${
                            selectedId === g.dressId ? 'ring-2 ring-accent ring-offset-2' : ''
                          }`}
                        />
                        {triedIds.has(g.dressId) ? <span className="absolute right-1 top-1 size-2 rounded-full border border-white bg-accent" title="Ya probado" /> : null}
                      </button>
                    ) : (
                      <span className="block aspect-[3/4] w-[68px] rounded-lg shimmer" />
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Opciones de la prueba, en una sola caja */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_34px_rgba(20,16,12,0.06)]">
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
            {needsPhone ? (
              <div className="mb-2.5">
                <Notice>Para seguir probando, introduce tu número de teléfono. Recibirás las pruebas por WhatsApp.</Notice>
                {ready ? (
                  <Button block className="mt-2.5" onClick={askForPhone}>
                    Introducir teléfono
                  </Button>
                ) : null}
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
                  <button type="button" onClick={() => (needsPhone ? askForPhone() : void tryOn())} className={lineButton}>
                    <RotateCcw className="size-3.5" strokeWidth={1.5} aria-hidden />
                    Repetir
                  </button>
                </div>
                <LinkButton href={`/cita/nueva?c=${tab}`} block>
                  Pide cita
                </LinkButton>
              </>
            ) : (
              <Button block loading={busy} onClick={() => (needsPhone ? askForPhone() : void tryOn())}>
                {busy ? 'Generando…' : needsPhone ? 'Introducir teléfono' : 'Generar prueba virtual'}
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
