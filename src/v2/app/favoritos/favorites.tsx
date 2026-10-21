import { FavoriteButton } from '@v2/components/favorite-button';
import { GarmentCard, garmentGrid } from '@v2/components/garment-card';
import { LinkButton, Notice } from '@v2/components/ui';
import { listFavorites } from '@v2/lib/api';
import { useLoad } from '@v2/lib/use-load';

export function Favorites() {
  const { data: favorites, error, loading, setData } = useLoad(listFavorites);

  if (error) return <div className="mt-4"><Notice tone="danger">{error}</Notice></div>;
  if (loading) return <div className="mt-4 aspect-[3/4] w-1/2 shimmer" />;

  if (!favorites?.length) {
    return (
      <div className="py-20 text-center">
        <p className="label-caps">Aún no tienes favoritos</p>
        <p className="mt-2 text-[13px] text-muted">Toca el corazón en cualquier modelo para guardarlo y llevarlo a tu cita.</p>
        <LinkButton href="/coleccion" className="mt-6">
          Ver la colección
        </LinkButton>
      </div>
    );
  }

  return (
    <ul className={`mt-4 ${garmentGrid}`}>
      {favorites.map((f) => (
        <GarmentCard
          key={f.dressId}
          href={`/probador?d=${f.dressId}`}
          imageUrl={f.dressImageUrl}
          name={f.dressName}
          detail="Probármelo"
          action={
            <FavoriteButton
              dressId={f.dressId}
              initial
              onChange={(on) => !on && setData(favorites.filter((x) => x.dressId !== f.dressId))}
            />
          }
        />
      ))}
    </ul>
  );
}
