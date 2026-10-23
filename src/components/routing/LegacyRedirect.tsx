/**
 * Direcciones de antes del cambio a la V2 en la raíz (probador.crmnovias.com):
 * las de la V1 sin /v1 (enlaces compartidos, la web, favoritos del navegador)
 * y las de la V2 con /v2. Cada una lleva a su pantalla de la V2, con sus datos.
 */

import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';

const withQuery = (path: string, query: Record<string, string | null>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const search = params.toString();
  return search ? `${path}?${search}` : path;
};

const category = (q: URLSearchParams) => {
  const c = q.get('category');
  return c === 'bride' || c === 'groom' ? c : null;
};

/** La prenda que se quería probar (V1: ?dressId=&category=) en el probador de la V2. */
export const probadorFor = (q: URLSearchParams) => withQuery('/probador', { d: q.get('dressId'), c: category(q) });

/** Pantalla de la V1 (sin /v1) → la de la V2. */
const V1_TO_V2: Record<string, (q: URLSearchParams) => string> = {
  '/auth': (q) => (q.get('step') === 'registration' ? '/datos' : '/entrar'),
  '/try-on': probadorFor,
  '/pareja': probadorFor,
  '/avatar-creation': () => '/avatar',
  '/gallery': () => '/mis-pruebas',
  '/appointments': () => '/citas',
  '/citas/nueva': (q) => withQuery('/cita/nueva', { c: category(q), edit: q.get('edit') }),
  '/colecciones/novia': () => '/coleccion',
  '/colecciones/novio': () => '/coleccion?c=groom',
};

export const LEGACY_V1_PATHS = Object.keys(V1_TO_V2);

/** Una pantalla de la V1 de antes, sin /v1. */
export const LegacyV1Redirect: React.FC = () => {
  const { pathname, search } = useLocation();
  const to = V1_TO_V2[pathname.replace(/\/+$/, '')];
  return <Navigate to={to ? to(new URLSearchParams(search)) : '/'} replace />;
};

/** Enlace compartido de la V1 (/share/:id?dressId=) → el de la V2 (/c/:id?d=). */
export const LegacyShareRedirect: React.FC = () => {
  const { id = '' } = useParams();
  const { search } = useLocation();
  return <Navigate to={withQuery(`/c/${id}`, { d: new URLSearchParams(search).get('dressId') })} replace />;
};

/** La V2 en /v2 (enlaces de antes): la misma pantalla sin el prefijo. */
export const LegacyV2Redirect: React.FC = () => {
  const { pathname, search, hash } = useLocation();
  return <Navigate to={`${pathname.replace(/^\/v2(?=\/|$)/, '') || '/'}${search}${hash}`} replace />;
};
