import { apiClient } from '@/services/apiClient';
import { brand, type BrandId } from './brand';

/**
 * Eventos del probador para Meta, con el píxel de la web de cada marca y por la
 * API de conversiones del CRM, con el mismo `event_id` para que cuenten una vez.
 *
 * - Dentro de la web (iframe): el probador manda cada evento a la página y el
 *   script `probador-bridge.js` lo dispara con el píxel de la web. La página le
 *   pasa a su vez su URL (UTM, fbclid) y las cookies `_fbp` y `_fbc`.
 * - Sin ese script (o fuera de un iframe): el probador carga el mismo píxel.
 * - Primero lo valida el CRM (paso real, una sola vez); si lo rechaza, el
 *   navegador tampoco lo manda.
 *
 * «Lead» no se usa: lo usan los formularios de las webs.
 */
export type MetaEvent = 'ViewContent' | 'SubeFoto' | 'CustomizeProduct' | 'CompleteRegistration' | 'Schedule';

interface MetaParams {
  content_name?: string;
  content_ids?: string[];
}

/** Webs que contienen el probador: solo de ellas se aceptan mensajes y solo a ellas se mandan. */
const WEB_ORIGINS: Record<BrandId, string[]> = {
  atelier: ['https://atelierdebodas.com', 'https://www.atelierdebodas.com'],
  outlet: ['https://outletnupcial.com', 'https://www.outletnupcial.com', 'http://outletnupcial.com', 'http://www.outletnupcial.com'],
  sedka: ['https://sedkanovias.es', 'https://www.sedkanovias.es'],
};
/** En desarrollo, la página de prueba local hace de web (no llega al build de producción). */
const DEV_WEB_ORIGIN = 'http://localhost:5190';
const isWebOrigin = (origin: string) => WEB_ORIGINS[brand.id].includes(origin) || (import.meta.env.DEV && origin === DEV_WEB_ORIGIN);

/** Píxel de la web de cada marca (el mismo que usa el CRM en el servidor). */
const PIXELS: Record<BrandId, string> = {
  atelier: '561181242431431',
  outlet: '906738730565930',
  sedka: '1494187322736138',
};

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'] as const;
const UTM_STORE = `probador-v2:utm:${brand.id}`;
const UTM_DAYS = 30;
const TEST_STORE = 'probador-v2:meta-test';
const BRIDGE_WAIT_MS = 1500;

type Mode = 'pending' | 'bridge' | 'own';
interface Context {
  url: string;
  origin: string | null;
  fbp: string | null;
  fbc: string | null;
}

let started = false;
let mode: Mode = 'pending';
let context: Context = { url: window.location.href, origin: null, fbp: null, fbc: null };
const waiting: (() => void)[] = [];

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[][]; loaded?: boolean; version?: string; push?: unknown };
const win = window as unknown as { fbq?: Fbq; _fbq?: Fbq };

const read = (storage: Storage, key: string): string | null => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};
const write = (storage: Storage, key: string, value: string) => {
  try {
    storage.setItem(key, value);
  } catch {
    // Sin almacenamiento: la campaña solo vale para esta página.
  }
};

const cookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
};

/** Guarda las UTM, fbclid y el código de prueba de Meta que traiga una URL. */
const capture = (search: string) => {
  const params = new URLSearchParams(search);
  const found: Record<string, string> = {};
  UTM_KEYS.forEach((key) => {
    const value = (params.get(key) ?? '').trim();
    if (value && value.length <= 255) found[key] = value;
  });
  if (Object.keys(found).length) write(window.localStorage, UTM_STORE, JSON.stringify({ at: Date.now(), utms: found }));
  const test = params.get('test_event_code');
  if (test && /^[A-Za-z0-9]{4,32}$/.test(test)) write(window.sessionStorage, TEST_STORE, test);
};

const stored = (): { at: number; utms: Record<string, string> } | null => {
  try {
    const raw = JSON.parse(read(window.localStorage, UTM_STORE) ?? 'null') as { at?: number; utms?: Record<string, string> } | null;
    if (!raw?.at || !raw.utms || Date.now() - raw.at > UTM_DAYS * 86_400_000) return null;
    return { at: raw.at, utms: raw.utms };
  } catch {
    return null;
  }
};

/** UTM y fbclid de la campaña con la que llegó (30 días), para el CRM. */
export const campaign = (): Record<string, string> => {
  const utms = stored()?.utms ?? {};
  return Object.fromEntries(UTM_KEYS.filter((k) => typeof utms[k] === 'string' && utms[k]).map((k) => [k, utms[k] as string]));
};

/** `_fbc` de la web o, si no lo hay, el que Meta construye con el fbclid. */
const fbc = (): string | null => {
  if (context.fbc) return context.fbc;
  const own = cookie('_fbc');
  if (own) return own;
  const saved = stored();
  const fbclid = saved?.utms['fbclid'];
  return saved && fbclid ? `fb.1.${String(saved.at)}.${fbclid}` : null;
};

const loadOwnPixel = () => {
  if (win.fbq) return;
  const fbq: Fbq = (...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue?.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  win.fbq = fbq;
  win._fbq = fbq;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  fbq('init', PIXELS[brand.id]);
};

const settle = (next: Exclude<Mode, 'pending'>) => {
  if (mode !== 'pending') return;
  mode = next;
  if (next === 'own') loadOwnPixel();
  waiting.splice(0).forEach((run) => {
    run();
  });
};

/** Arranca el puente con la web (una vez por página). */
export const startMeta = () => {
  if (started) return;
  started = true;
  capture(window.location.search);

  if (window.parent === window) {
    settle('own');
    return;
  }

  window.addEventListener('message', (event: MessageEvent) => {
    const data = event.data as { source?: string; type?: string; url?: string; search?: string; fbp?: string | null; fbc?: string | null } | null;
    if (!isWebOrigin(event.origin) || data?.source !== 'probador-web' || data.type !== 'context') return;
    context = { url: data.url ?? context.url, origin: event.origin, fbp: data.fbp ?? null, fbc: data.fbc ?? null };
    capture(data.search ?? '');
    settle('bridge');
  });
  // La web puede cargar su script después que el probador: se saluda varias veces.
  [0, 400, 800, 1200].forEach((ms) =>
    window.setTimeout(() => {
      if (mode === 'pending') window.parent.postMessage({ source: 'probador-crm', type: 'hello', brand: brand.id }, '*');
    }, ms),
  );
  window.setTimeout(() => {
    settle('own');
  }, BRIDGE_WAIT_MS);
};

const browserEvent = (name: MetaEvent, params: Record<string, unknown>, eventId: string) => {
  const custom = name === 'SubeFoto';
  if (mode === 'bridge' && context.origin) {
    window.parent.postMessage({ source: 'probador-crm', type: 'meta-event', name, params, eventId, custom }, context.origin);
  } else {
    win.fbq?.(custom ? 'trackCustom' : 'track', name, params, { eventID: eventId });
  }
};

const uuid = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

/** Manda un paso del probador a Meta (servidor y navegador, mismo event_id). Nunca falla. */
export const trackMeta = (name: MetaEvent, params: MetaParams = {}) => {
  const eventId = uuid();
  const run = async () => {
    let accepted = true;
    try {
      const body = {
        event_name: name,
        event_id: eventId,
        event_source_url: context.url,
        fbp: context.fbp ?? cookie('_fbp'),
        fbc: fbc(),
        content_name: params.content_name,
        content_ids: params.content_ids,
        test_event_code: read(window.sessionStorage, TEST_STORE) ?? undefined,
      };
      // Solo en desarrollo: lo que se manda al CRM, para comprobarlo en la consola.
      if (import.meta.env.DEV) {
        console.info('[probador meta]', mode, JSON.stringify({ ...body, campaign: campaign() }));
        window.parent.postMessage({ source: 'probador-crm', type: 'debug', mode, body, campaign: campaign() }, '*');
      }
      const res: { accepted?: boolean } | null = await apiClient.post(`/probador/${brand.id}/meta-events`, body);
      accepted = res?.accepted !== false;
    } catch {
      // Si el CRM no responde, el píxel de la web sigue contando.
    }
    if (!accepted) return;
    browserEvent(
      name,
      Object.fromEntries(
        Object.entries({
          content_category: 'probador_virtual',
          content_name: params.content_name,
          content_ids: params.content_ids,
          content_type: params.content_ids ? 'product' : undefined,
        }).filter(([, v]) => v !== undefined),
      ),
      eventId,
    );
  };
  if (mode === 'pending') waiting.push(() => void run());
  else void run();
};

let opened = false;

/** Abre el probador: ViewContent una vez por página. */
export const trackOpen = () => {
  if (opened) return;
  opened = true;
  trackMeta('ViewContent', { content_name: 'Probador virtual' });
};

/** CustomizeProduct una vez por vestido en este dispositivo (el CRM lo vuelve a comprobar). */
export const trackTryOnShown = (dressId: string, name: string) => {
  const key = `probador-v2:customized:${brand.id}`;
  const done = new Set<string>(((): string[] => {
    try {
      return JSON.parse(read(window.localStorage, key) ?? '[]') as string[];
    } catch {
      return [];
    }
  })());
  if (done.has(dressId)) return;
  done.add(dressId);
  write(window.localStorage, key, JSON.stringify([...done].slice(-200)));
  trackMeta('CustomizeProduct', { content_ids: [dressId], content_name: name });
};
