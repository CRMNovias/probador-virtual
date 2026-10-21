import type { UserProfile as V1UserProfile } from '@/types/index';

/**
 * La sesión de la V2 es la de la V1 (AuthContext, token en localStorage): quien
 * entra en una, entra en las dos. El layout de la V2 conecta aquí el login y el
 * logout de AuthContext para que `api.ts` los use sin tocar las pantallas.
 */
interface Session {
  login: (token: string, user: V1UserProfile, phone?: string) => void;
  logout: () => void;
}

let session: Session | null = null;

export const connectSession = (next: Session) => {
  session = next;
};

export const signIn = (token: string, user: V1UserProfile, phone?: string) => session?.login(token, user, phone);

export const signOut = () => session?.logout();
