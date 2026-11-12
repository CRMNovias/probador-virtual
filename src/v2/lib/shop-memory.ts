import { brand } from './brand';

/**
 * La tienda que la clienta ya eligió en este dispositivo. Si la hay, al entrar
 * no se vuelve a pedir junto al teléfono (el CRM conserva la suya de todos
 * modos). Si el navegador no guarda nada, se pide y no pasa nada.
 */
const KEY = `probador-v2:shop:${brand.id}`;

export const rememberedShop = (): number | null => {
  try {
    const id = Number(window.localStorage.getItem(KEY));
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
};

export const rememberShop = (id: number | null | undefined) => {
  if (!id) return;
  try {
    window.localStorage.setItem(KEY, String(id));
  } catch {
    // Sin almacenamiento: la próxima vez se vuelve a pedir.
  }
};
