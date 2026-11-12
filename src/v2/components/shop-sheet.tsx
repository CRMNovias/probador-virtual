import { useState } from 'react';
import { Sheet } from '@v2/components/sheet';
import { ShopSelect, shopError } from '@v2/components/shop-select';
import { Button, Notice } from '@v2/components/ui';
import { listShops, updateProfile } from '@v2/lib/api';
import { brand } from '@v2/lib/brand';
import { rememberShop } from '@v2/lib/shop-memory';
import { useLoad } from '@v2/lib/use-load';

/** «el más cercano o el que prefieras» (atelier) / «la más cercana o la que prefieras» (tienda). */
const NEAREST = brand.shop.one === 'atelier' ? 'el más cercano o el que prefieras' : 'la más cercana o la que prefieras';

/**
 * Aviso antes de la primera prueba de una cuenta sin tienda (cuentas de antes de
 * que fuera obligatoria): la elige y la prueba sigue. Lo usan Atelier, Outlet y Sedka.
 */
export function ShopSheet({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const { data: shops } = useLoad(() => listShops());
  const [shopId, setShopId] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setTouched(true);
    if (!shopId) return;
    setBusy(true);
    setError(null);
    try {
      await updateProfile({ shopId: Number(shopId) });
      rememberShop(Number(shopId));
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : `No se pudo guardar ${brand.shop.the}.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet title={`Elige ${brand.shop.a}`} open={open} onClose={onClose}>
      <p className="text-[14px] leading-relaxed">
        Antes de hacer la prueba, elige {brand.shop.toWhich} irías: {NEAREST}. Allí te atenderán si pides cita.
      </p>
      <div className="mt-5 space-y-5">
        <ShopSelect shops={shops ?? []} value={shopId} onChange={setShopId} onBlur={() => setTouched(true)} error={touched && !shopId ? shopError : undefined} />
        {error ? <Notice tone="danger">{error}</Notice> : null}
        <Button block loading={busy} onClick={() => void save()}>
          Guardar y hacer la prueba
        </Button>
      </div>
    </Sheet>
  );
}
