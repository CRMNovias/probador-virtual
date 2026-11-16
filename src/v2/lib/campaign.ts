import { brand } from './brand';

/**
 * Campaña con la que llegó la clienta (UTM y fbclid, 30 días) y código de
 * prueba de Meta. Sale de la URL del probador o de la web que lo contiene: la
 * página actual y la de llegada a la web (ver `meta.ts` y `probador-bridge.js`).
 * Va al CRM con el lead y sirve para el fbc de los eventos de Meta.
 */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'] as const;
const UTM_STORE = `probador-v2:utm:${brand.id}`;
const UTM_DAYS = 30;
/** Largo máximo de cada valor. Algunos fbclid pasan de 255: el CRM no los guarda en las UTM, pero sirven para el fbc. */
const MAX_VALUE = 255;
const MAX_FBCLID = 500;
const TEST_STORE = 'probador-v2:meta-test';

interface Campaign {
  at: number;
  utms: Record<string, string>;
}

/** Copia en memoria, por si el navegador no deja guardar datos dentro del iframe. */
let remembered: Campaign | null = null;

export const readStorage = (storage: Storage, key: string): string | null => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStorage = (storage: Storage, key: string, value: string) => {
  try {
    storage.setItem(key, value);
  } catch {
    // Sin almacenamiento: la campaña solo vale para esta página.
  }
};

const fresh = (campaign: Campaign | null): Campaign | null =>
  campaign && Date.now() - campaign.at <= UTM_DAYS * 86_400_000 ? campaign : null;

const stored = (): Campaign | null => {
  try {
    const raw = JSON.parse(readStorage(window.localStorage, UTM_STORE) ?? 'null') as Partial<Campaign> | null;
    if (raw?.at && raw.utms) return fresh({ at: raw.at, utms: raw.utms });
  } catch {
    // Sin almacenamiento legible: vale la copia en memoria.
  }
  return fresh(remembered);
};

/** El mismo clic conserva su hora, así el fbc no cambia de un evento a otro. */
const save = (utms: Record<string, string>) => {
  const previous = stored();
  const sameClick = Boolean(utms['fbclid']) && previous?.utms['fbclid'] === utms['fbclid'];
  remembered = { at: sameClick && previous ? previous.at : Date.now(), utms };
  writeStorage(window.localStorage, UTM_STORE, JSON.stringify(remembered));
};

/** Guarda las UTM, fbclid y el código de prueba de Meta que traiga una URL. */
export const capture = (search: string) => {
  const params = new URLSearchParams(search);
  const found: Record<string, string> = {};
  UTM_KEYS.forEach((key) => {
    const value = (params.get(key) ?? '').trim();
    if (value && value.length <= (key === 'fbclid' ? MAX_FBCLID : MAX_VALUE)) found[key] = value;
  });
  if (Object.keys(found).length) save(found);
  const test = params.get('test_event_code');
  if (test && /^[A-Za-z0-9]{4,32}$/.test(test)) writeStorage(window.sessionStorage, TEST_STORE, test);
};

/** UTM y fbclid de la campaña con la que llegó (30 días), para el CRM. */
export const campaign = (): Record<string, string> => {
  const utms = stored()?.utms ?? {};
  return Object.fromEntries(UTM_KEYS.filter((k) => typeof utms[k] === 'string' && utms[k]).map((k) => [k, utms[k] as string]));
};

/** El fbc que Meta construye con el fbclid del clic (null sin clic de Meta). */
export const campaignFbc = (): string | null => {
  const saved = stored();
  const fbclid = saved?.utms['fbclid'];
  return saved && fbclid ? `fb.1.${String(saved.at)}.${fbclid}` : null;
};

/** Código de «Probar eventos» de Meta, si la URL lo traía. */
export const testEventCode = (): string | undefined => readStorage(window.sessionStorage, TEST_STORE) ?? undefined;
