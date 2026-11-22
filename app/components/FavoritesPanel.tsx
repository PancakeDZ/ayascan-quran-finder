type FavoriteItem = {
  surahName: string;
  surahNumber: number;
  ayah: number;
  arabic: string;
};

type Props = {
  favorites: FavoriteItem[];
};

export default function FavoritesPanel({
  favorites,
}: Props) {
  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-amber-950/20 p-6">
      <h3 className="text-xl font-bold mb-4 text-amber-300">
        ۞ Mes favoris
      </h3>

      <div className="space-y-4">
        {favorites.map((item, index) => (
          <div
            key={`${item.surahNumber}-${item.ayah}-${index}`}
            className="rounded-xl bg-slate-900 p-4"
          >
            <p>
              Sourate {item.surahNumber} - {item.surahName}
            </p>

            <p>
              Verset {item.ayah}
            </p>

            <p
              dir="rtl"
              className="mt-3 text-2xl text-amber-100"
            >
              {item.arabic}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}