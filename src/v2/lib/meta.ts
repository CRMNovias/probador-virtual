import { apiClient } from '@/services/apiClient';
import { brand, type BrandId } from './brand';
import { campaign, campaignFbc, capture, readStorage, testEventCode, writeStorage } from './campaign';

/**
 * Eventos del probador para Meta, con el píxel de la web de cada marca y por la
 * API de conversiones del CRM, con el mismo `event_id` para que cuenten una vez.
 *
 * - El probador va dentro de la web (iframe). Le manda cada evento a la página y
 *   el script `probador-bridge.js` lo dispara con el píxel de la web. La página le
 *   pasa su URL (UTM, fbclid), la de la página por la que la clienta llegó a la web
 *   (si vino del anuncio a otra página), las cookies `_fbp` y `_fbc` (también
 *   cuando el píxel las crea después) y el consentimiento.
 * - Solo se avisa a Meta si la clienta ha aceptado las cookies de publicidad en
 *   la web (CookieYes). Mientras no responde al banner, los eventos esperan; si
 *   las rechaza, no se mandan. Sin el script en la página (o con el probador
 *   abierto directamente) no se sabe, así que no se manda nada a Meta.
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

/** Tiempo que se espera al script de la web antes de dar por hecho que no está. */
const BRIDGE_WAIT_MS = 3000;

/** Publicidad en la web: aceptada, rechazada, sin responder o web sin gestor de cookies conocido. */
type Consent = 'granted' | 'denied' | 'pending' | 'unknown';
type Mode = 'waiting' | 'bridge' | 'off';
interface Context {
  url: string;
  origin: string | null;
  fbp: string | null;
  fbc: string | null;
}

let started = false;
let mode: Mode = 'waiting';
let consent: Consent = 'pending';
let context: Context = { url: window.location.href, origin: null, fbp: null, fbc: null };
const waiting: (() => void)[] = [];

/** Con el script de la web y la publicidad aceptada (o una web sin gestor de cookies, que decide su píxel). */
const allowed = () => mode === 'bridge' && (consent === 'granted' || consent === 'unknown');
const blocked = () => mode === 'off' || consent === 'denied';

const flush = () => {
  if (allowed()) {
    waiting.splice(0).forEach((run) => {
      run();
    });
  } else if (blocked()) {
    waiting.length = 0;
  }
};

/** `_fbc` de la web o, si no lo hay, el que Meta construye con el fbclid. */
const fbc = (): string | null => context.fbc ?? campaignFbc();

/** Arranca el puente con la web (una vez por página). */
export const startMeta = () => {
  if (started) return;
  started = true;
  capture(window.location.search);

  if (window.parent === window) {
    mode = 'off';
    flush();
    return;
  }

  window.addEventListener('message', (event: MessageEvent) => {
    const data = event.data as {
      source?: string;
      type?: string;
      url?: string;
      search?: string;
      landing?: string;
      fbp?: string | null;
      fbc?: string | null;
      consent?: Consent;
    } | null;
    if (!isWebOrigin(event.origin) || data?.source !== 'probador-web' || data.type !== 'context') return;
    context = { url: data.url ?? context.url, origin: event.origin, fbp: data.fbp ?? null, fbc: data.fbc ?? null };
    consent = data.consent ?? 'unknown';
    // Primero la página por la que llegó a la web; la URL actual, si trae campaña, manda.
    capture(data.landing ?? '');
    capture(data.search ?? '');
    // La web vuelve a mandar el contexto cuando la clienta responde al banner de cookies.
    mode = 'bridge';
    flush();
  });
  // La web puede cargar su script después que el probador: se saluda varias veces.
  [0, 400, 800, 1500, 2500].forEach((ms) =>
    window.setTimeout(() => {
      if (mode === 'waiting') window.parent.postMessage({ source: 'probador-crm', type: 'hello', brand: brand.id }, '*');
    }, ms),
  );
  window.setTimeout(() => {
    if (mode !== 'waiting') return;
    mode = 'off';
    flush();
  }, BRIDGE_WAIT_MS);
};

/** El evento en el navegador: lo dispara el píxel de la web. */
const browserEvent = (name: MetaEvent, params: Record<string, unknown>, eventId: string) => {
  if (!context.origin) return;
  window.parent.postMessage({ source: 'probador-crm', type: 'meta-event', name, params, eventId, custom: name === 'SubeFoto' }, context.origin);
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
        fbp: context.fbp,
        fbc: fbc(),
        content_name: params.content_name,
        content_ids: params.content_ids,
        test_event_code: testEventCode(),
      };
      // Solo en desarrollo: lo que se manda al CRM, para comprobarlo en la consola.
      if (import.meta.env.DEV) {
        console.info('[probador meta]', mode, consent, JSON.stringify({ ...body, campaign: campaign() }));
        window.parent.postMessage({ source: 'probador-crm', type: 'debug', mode, consent, body, campaign: campaign() }, '*');
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
  if (allowed()) void run();
  else if (!blocked()) waiting.push(() => void run());
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
      return JSON.parse(readStorage(window.localStorage, key) ?? '[]') as string[];
    } catch {
      return [];
    }
  })());
  if (done.has(dressId)) return;
  done.add(dressId);
  writeStorage(window.localStorage, key, JSON.stringify([...done].slice(-200)));
  trackMeta('CustomizeProduct', { content_ids: [dressId], content_name: name });
};
