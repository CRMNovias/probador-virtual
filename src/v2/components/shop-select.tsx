import { brand, type BrandId } from '@v2/lib/brand';
import type { Shop } from '@v2/lib/types';

/** Cómo se pide la tienda en cada marca (Atelier: «Tu atelier más cercano»). */
const SHOP_LABEL: Partial<Record<BrandId, string>> = {
  sedka: 'Tienda Sedka más cercana',
  outlet: 'Tienda Outlet Nupcial más cercana',
};

export const shopLabel = SHOP_LABEL[brand.id] ?? `Tu ${brand.shop.one} más cercano`;

export const shopError = `Elige ${brand.shop.toWhich} irías.`;

/** Desplegable de las tiendas de la marca: el mismo en la entrada, el registro y el aviso antes de probar. */
export function ShopSelect({
  shops,
  value,
  onChange,
  onBlur,
  error,
  hint,
}: {
  shops: Shop[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | undefined;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor="shopId" className="label-caps mb-1 block text-muted">
        {shopLabel}
      </label>
      <select
        id="shopId"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={hint ? 'shopId-hint' : undefined}
        className={`h-11 w-full border-0 border-b bg-transparent px-0 text-base outline-none focus:border-ink ${error ? 'border-danger' : 'border-neutral-300'}`}
      >
        <option value="">{shops.length ? `Elige ${brand.shop.a}` : `Cargando ${brand.shop.many}…`}</option>
        {shops.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-[13px] text-danger">{error}</p> : null}
      {hint && !error ? (
        <p id="shopId-hint" className="mt-2 text-[12px] leading-snug text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
