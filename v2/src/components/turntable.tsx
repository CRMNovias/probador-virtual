'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, Rotate3d } from 'lucide-react';

/**
 * Visor 360: reproduce el giro en bucle y, al arrastrar, gira con el dedo.
 *
 * Al cargar el vídeo se extraen unos fotogramas (FRAME_COUNT) a un lienzo para
 * que el arrastre sea fluido también en el iPhone. Si el vídeo no permite
 * extraerlos (CORS del almacenamiento), el arrastre mueve el propio vídeo.
 * Sin vídeo, enseña la imagen fija.
 */

const FRAME_COUNT = 36;
const RESUME_AFTER_MS = 2500;
/** Ancho de pantalla que equivale a una vuelta completa al arrastrar. */
const DRAG_TURN_RATIO = 1.4;

interface TurntableProps {
  stillUrl: string;
  videoUrl?: string | null;
  alt: string;
  /** Texto sobre la imagen mientras se prepara el vídeo. */
  pendingLabel?: string | null;
  className?: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const once = (target: HTMLVideoElement, event: string) =>
  new Promise<void>((resolve) => target.addEventListener(event, () => resolve(), { once: true }));

const extractFrames = async (url: string, width: number, signal: AbortSignal): Promise<ImageBitmap[]> => {
  const blob = await (await fetch(url, { signal })).blob();
  const objectUrl = URL.createObjectURL(blob);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = objectUrl;
  try {
    await once(video, 'loadeddata');
    const frames: ImageBitmap[] = [];
    const step = video.duration / FRAME_COUNT;
    for (let i = 0; i < FRAME_COUNT; i++) {
      if (signal.aborted) throw new DOMException('Cancelado', 'AbortError');
      video.currentTime = Math.min(i * step, video.duration - 0.05);
      await once(video, 'seeked');
      frames.push(await createImageBitmap(video, { resizeWidth: width, resizeQuality: 'high' }));
    }
    return frames;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

/** Cada vídeo arranca con su propio estado: al cambiar de prueba se reinicia solo. */
export function Turntable(props: TurntableProps) {
  return <TurntableView key={props.videoUrl ?? props.stillUrl} {...props} />;
}

function TurntableView({ stillUrl, videoUrl, alt, pendingLabel, className = '' }: TurntableProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  const drag = useRef<{ x: number; index: number } | null>(null);
  const resumeTimer = useRef<number | undefined>(undefined);

  const [videoReady, setVideoReady] = useState(false);
  const [framesReady, setFramesReady] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [paused, setPaused] = useState(prefersReducedMotion);
  const [touched, setTouched] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!videoUrl || !boxRef.current) return;
    const controller = new AbortController();
    const width = Math.min(720, Math.round(boxRef.current.clientWidth * window.devicePixelRatio));
    extractFrames(videoUrl, width, controller.signal)
      .then((frames) => {
        framesRef.current = frames;
        setFramesReady(true);
      })
      .catch(() => setFramesReady(false));
    return () => {
      controller.abort();
      framesRef.current.forEach((f) => f.close());
    };
  }, [videoUrl]);

  const draw = useCallback((i: number) => {
    const canvas = canvasRef.current;
    const frame = framesRef.current[i];
    if (!canvas || !frame) return;
    canvas.width = frame.width;
    canvas.height = frame.height;
    canvas.getContext('2d')?.drawImage(frame, 0, 0);
  }, []);

  const showFrame = useCallback(
    (i: number) => {
      const wrapped = ((i % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;
      setIndex(wrapped);
      if (framesReady) draw(wrapped);
      else if (videoRef.current) videoRef.current.currentTime = (wrapped / FRAME_COUNT) * (videoRef.current.duration || 0);
    },
    [draw, framesReady],
  );

  const currentIndex = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return index;
    return Math.floor((v.currentTime / v.duration) * FRAME_COUNT) % FRAME_COUNT;
  };

  const resumeLater = () => {
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      const v = videoRef.current;
      setScrubbing(false);
      if (!v || paused) return;
      v.currentTime = (index / FRAME_COUNT) * (v.duration || 0);
      void v.play().catch(() => undefined);
    }, RESUME_AFTER_MS);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!videoUrl || !videoReady) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    window.clearTimeout(resumeTimer.current);
    videoRef.current?.pause();
    const start = currentIndex();
    drag.current = { x: e.clientX, index: start };
    setTouched(true);
    setScrubbing(true);
    showFrame(start);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !boxRef.current) return;
    const width = boxRef.current.clientWidth * DRAG_TURN_RATIO;
    const delta = Math.round(((e.clientX - drag.current.x) / width) * FRAME_COUNT);
    showFrame(drag.current.index - delta);
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    resumeLater();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!videoReady || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    videoRef.current?.pause();
    setScrubbing(true);
    showFrame((scrubbing ? index : currentIndex()) + (e.key === 'ArrowRight' ? 1 : -1));
    resumeLater();
  };

  const togglePause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) {
      setScrubbing(false);
      void v.play().catch(() => undefined);
    } else {
      v.pause();
    }
    setPaused(!paused);
  };

  const live = Boolean(videoUrl && videoReady);

  return (
    <div
      ref={boxRef}
      className={`relative aspect-[9/16] w-full select-none overflow-hidden bg-studio ${live ? 'cursor-grab touch-pan-y active:cursor-grabbing' : ''} ${className}`}
      role="img"
      aria-label={live ? `${alt}. Vista 360: arrastra o usa las flechas para girar.` : alt}
      tabIndex={live ? 0 : -1}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- imágenes del CRM (S3) sin optimizador */}
      <img src={stillUrl} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />

      {videoUrl ? (
        <video
          ref={videoRef}
          key={videoUrl}
          src={videoUrl}
          muted
          playsInline
          loop
          autoPlay={!prefersReducedMotion()}
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : null}

      <canvas
        ref={canvasRef}
        aria-hidden
        className={`absolute inset-0 h-full w-full object-cover ${scrubbing && framesReady ? 'opacity-100' : 'opacity-0'}`}
      />

      {live ? (
        <>
          <span className="label-caps pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 bg-white/85 px-2 py-1 text-ink">
            <Rotate3d className="size-4" strokeWidth={1.5} aria-hidden />
            360°
          </span>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={togglePause}
            className="absolute bottom-3 right-3 grid size-9 place-items-center bg-white/85 text-ink"
            aria-label={paused ? 'Reanudar el giro' : 'Pausar el giro'}
          >
            {paused ? <Play className="size-4" strokeWidth={1.5} aria-hidden /> : <Pause className="size-4" strokeWidth={1.5} aria-hidden />}
          </button>
          {!touched ? (
            <span className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
              <span className="label-caps bg-white/85 px-2 py-1 text-ink/80">Desliza para girar</span>
            </span>
          ) : null}
        </>
      ) : pendingLabel ? (
        <span className="absolute inset-x-0 top-3 flex justify-center">
          <span className="label-caps flex items-center gap-2 bg-white/85 px-2 py-1 text-ink/80">
            <span className="size-1.5 animate-pulse bg-ink" aria-hidden />
            {pendingLabel}
          </span>
        </span>
      ) : null}
    </div>
  );
}
