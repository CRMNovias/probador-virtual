import { NextResponse, type NextRequest } from 'next/server';

/**
 * Comprobación optimista de sesión: sin cookie, las pantallas privadas mandan
 * a /entrar; con cookie, la portada lleva directo a la colección.
 * La validez real del token la decide el CRM en cada llamada.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has('pv_session');
  const { pathname, search } = request.nextUrl;

  // nextUrl conserva el prefijo de la app (/v2 en producción) al cambiar la ruta.
  const to = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = '';
    return url;
  };

  if (pathname === '/') {
    return hasSession ? NextResponse.redirect(to('/probador')) : NextResponse.next();
  }
  if (hasSession) return NextResponse.next();

  const url = to('/entrar');
  url.searchParams.set('next', pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/', '/datos', '/avatar', '/probador', '/coleccion', '/mis-pruebas', '/favoritos', '/perfil', '/cita/:path*', '/citas'],
};
