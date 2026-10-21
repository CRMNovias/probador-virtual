'use client';

import { useEffect, useState } from 'react';

/**
 * Espera de la IA con contexto: pasos con nombre, tiempo transcurrido y una
 * estimación honesta, en lugar de una barra que no avanza de verdad.
 */

interface AiWaitProps {
  steps: string[];
  /** Segundos que suele tardar, para colocar los pasos en el tiempo. */
  expectedSeconds: number;
  note?: string;
}

export function AiWait({ steps, expectedSeconds, note }: AiWaitProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const perStep = expectedSeconds / steps.length;
  const current = Math.min(steps.length - 1, Math.floor(elapsed / perStep));
  const remaining = Math.max(0, expectedSeconds - elapsed);

  return (
    <div className="space-y-5" aria-live="polite">
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-3 text-[15px]">
            <span
              className={`grid size-6 shrink-0 place-items-center text-xs font-semibold ${
                i < current ? 'bg-ink text-white' : i === current ? 'border-2 border-ink text-ink' : 'border border-line text-muted'
              }`}
              aria-hidden
            >
              {i + 1}
            </span>
            <span className={i <= current ? 'text-ink' : 'text-muted'}>{step}</span>
            {i === current ? <span className="ml-auto size-2 animate-pulse bg-accent" aria-hidden /> : null}
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted">
        {remaining > 0
          ? `Suele tardar unos ${Math.ceil(expectedSeconds / 10) * 10} segundos. Quedan unos ${remaining} s.`
          : 'Está tardando un poco más de lo normal. Seguimos con ello.'}
      </p>
      {note ? <p className="text-sm text-muted">{note}</p> : null}
    </div>
  );
}
