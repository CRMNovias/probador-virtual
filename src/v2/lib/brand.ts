import { asset } from './base-path';

export type BrandId = 'atelier' | 'sedka';

/** «Tu atelier», «Elige una tienda»…: las formas que usan las pantallas, en minúscula. */
export interface ShopWords {
  one: string;
  many: string;
  a: string;
  the: string;
  this: string;
  of: string;
  to: string;
  /** «el atelier al que irías» / «la tienda a la que irías» */
  toWhich: string;
}

const ATELIER_WORDS: ShopWords = {
  one: 'atelier', many: 'ateliers', a: 'un atelier', the: 'el atelier', this: 'este atelier', of: 'del atelier', to: 'al atelier', toWhich: 'el atelier al que',
};
const TIENDA_WORDS: ShopWords = {
  one: 'tienda', many: 'tiendas', a: 'una tienda', the: 'la tienda', this: 'esta tienda', of: 'de la tienda', to: 'a la tienda', toWhich: 'la tienda a la que',
};

/** La primera letra en mayúscula («Tu tienda», «Esta tienda»). */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Una marca del probador: sus datos, su logo y lo que cambia entre marcas. */
export interface Brand {
  id: BrandId;
  name: string;
  logo: string;
  /** Alto del logo en las cabeceras: el de Sedka es casi cuadrado. */
  logoClass: string;
  website: string;
  privacyUrl: string;
  bookingUrl: string;
  /** Cómo llama la marca a sus tiendas («atelier» o «tienda»), con sus artículos. */
  shop: ShopWords;
  /** Filtros de novio: estilo y color, o marca (los trajes de Sedka no traen estilo ni color). */
  groomFilters: 'style' | 'brand';
  /** Adónde se llega al entrar: el probador (Atelier) o la colección (Sedka, como en su V1). */
  home: string;
}

const BRANDS: Record<BrandId, Brand> = {
  atelier: {
    id: 'atelier',
    name: 'Atelier de Bodas',
    logo: asset('/logo-atelier.webp'),
    logoClass: 'h-6 lg:h-7',
    website: 'https://atelierdebodas.com',
    privacyUrl: 'https://atelierdebodas.com/politica-de-privacidad/',
    bookingUrl: 'https://atelierdebodas.com/pide-cita/',
    shop: ATELIER_WORDS,
    groomFilters: 'style',
    home: '/probador',
  },
  sedka: {
    id: 'sedka',
    name: 'Sedka Novias',
    logo: asset('/sedka/logo-sedka.webp'),
    logoClass: 'h-11 lg:h-12',
    website: 'https://sedkanovias.es',
    privacyUrl: 'https://sedkanovias.es/politica-de-privacidad/',
    bookingUrl: 'https://sedkanovias.es/pide-cita/',
    shop: TIENDA_WORDS,
    groomFilters: 'brand',
    home: '/coleccion',
  },
};

/**
 * La marca sale del dominio: con «sedka» en él (el probador de Sedka, o
 * sedka.localhost en local) es Sedka; si no, Atelier. Outlet tiene su propio
 * probador dentro del CRM.
 */
const fromHost = (): BrandId => (typeof window !== 'undefined' && /sedka/i.test(window.location.hostname) ? 'sedka' : 'atelier');

export const brand: Brand = BRANDS[fromHost()];
