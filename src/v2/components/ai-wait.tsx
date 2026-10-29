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
  /** Atelier no enseña la cuenta atrás: solo los pasos. */
  showTime?: boolean;
}

export function AiWait({ steps, expectedSeconds, note, showTime = true }: AiWaitProps) {
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
                i < current ? 'bg-accent text-white' : i === current ? 'border-2 border-accent text-ink' : 'border border-line text-muted'
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
      {showTime ? (
        <p className="text-sm text-muted">
          {remaining > 0
            ? `Suele tardar unos ${Math.ceil(expectedSeconds / 10) * 10} segundos. Quedan unos ${remaining} s.`
            : 'Está tardando un poco más de lo normal. Seguimos con ello.'}
        </p>
      ) : null}
      {note ? <p className="text-sm text-muted">{note}</p> : null}
    </div>
  );
}
