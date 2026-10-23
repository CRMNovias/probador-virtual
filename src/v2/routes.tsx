import { useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { probadorFor } from '@/components/routing/LegacyRedirect';
import AvatarPage from '@v2/app/avatar/page';
import SharePage from '@v2/app/c/page';
import NuevaCitaPage from '@v2/app/cita/nueva/page';
import CitasPage from '@v2/app/citas/page';
import ColeccionPage from '@v2/app/coleccion/page';
import DatosPage from '@v2/app/datos/page';
import EntrarPage from '@v2/app/entrar/page';
import FavoritosPage from '@v2/app/favoritos/page';
import MisPruebasPage from '@v2/app/mis-pruebas/page';
import WelcomePage from '@v2/app/page';
import PerfilPage from '@v2/app/perfil/page';
import ProbadorPage from '@v2/app/probador/page';
import { withBase, withoutBase } from '@v2/lib/base-path';
import { brand } from '@v2/lib/brand';
import { connectSession } from '@v2/lib/session';
import './v2.css';

/**
 * La V2 dentro de la app de la V1: sus pantallas en la raíz (la V1, en /v1), con la misma
 * sesión que la V1. Hace lo que en la V2 hacían su layout (título, estilos) y
 * su proxy.ts (sin sesión, las pantallas privadas mandan a /entrar; con
 * sesión, la portada lleva al probador).
 */

/** Pone el título de la pantalla, como el `metadata.title` de cada página de la V2. */
function Titled({ title, children }: { title?: string; children: ReactNode }) {
  useEffect(() => {
    document.title = title ? `${title} · ${brand.name}` : `Probador virtual · ${brand.name}`;
  }, [title]);
  return <>{children}</>;
}

/** Pantalla privada: sin sesión, a /entrar volviendo luego aquí. */
function Private({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null;
  if (!isAuthenticated) {
    const next = `${withoutBase(location.pathname)}${location.search}`;
    return <Navigate to={`${withBase('/entrar')}?next=${encodeURIComponent(next)}`} replace />;
  }
  return <>{children}</>;
}

/**
 * Portada: con sesión, directo al probador. Con una prenda en la dirección (los
 * enlaces de la V1, `?dressId=&category=`), a esa prenda: sin sesión, después de entrar.
 */
function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const { search } = useLocation();
  if (isLoading) return null;
  const query = new URLSearchParams(search);
  if (query.get('dressId')) return <Navigate to={withBase(probadorFor(query))} replace />;
  return isAuthenticated ? <Navigate to={withBase('/probador')} replace /> : <WelcomePage />;
}

const PRIVATE: { path: string; title: string; page: () => ReactNode }[] = [
  { path: 'datos', title: 'Tus datos', page: DatosPage },
  { path: 'avatar', title: 'Tu avatar', page: AvatarPage },
  { path: 'probador', title: 'Probador', page: ProbadorPage },
  { path: 'coleccion', title: 'Colección', page: ColeccionPage },
  { path: 'mis-pruebas', title: 'Mis pruebas', page: MisPruebasPage },
  { path: 'favoritos', title: 'Favoritos', page: FavoritosPage },
  { path: 'perfil', title: 'Perfil', page: PerfilPage },
  { path: 'cita/nueva', title: 'Pedir cita', page: NuevaCitaPage },
  { path: 'citas', title: 'Mis citas', page: CitasPage },
];

export default function V2App() {
  const { login, logout } = useAuth();
  useEffect(() => connectSession({ login, logout }), [login, logout]);

  return (
    <div className="v2-root">
      <Routes>
        <Route
          index
          element={
            <Titled>
              <Home />
            </Titled>
          }
        />
        <Route
          path="entrar"
          element={
            <Titled title="Entrar">
              <EntrarPage />
            </Titled>
          }
        />
        <Route
          path="c/:id"
          element={
            <Titled title="Mi prueba virtual">
              <SharePage />
            </Titled>
          }
        />
        {PRIVATE.map(({ path, title, page: Page }) => (
          <Route
            key={path}
            path={path}
            element={
              <Titled title={title}>
                <Private>
                  <Page />
                </Private>
              </Titled>
            }
          />
        ))}
        <Route path="*" element={<Navigate to={withBase('/')} replace />} />
      </Routes>
    </div>
  );
}
