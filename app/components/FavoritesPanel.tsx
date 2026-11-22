
export type FavoriteItem = {
  surahName: string;
  surahNumber: number;
  ayah: number;
  arabic: string;
};

type Props = {
  favorites: FavoriteItem[];
  onRemove: (surahNumber: number, ayah: number) => void;
};

export default function FavoritesPanel({
  favorites,
  onRemove,
}: Props) {
  return (
    <section className="mt-12 rounded-3xl border border-amber-500/30 bg-amber-950/20 p-6">

      <h3 className="text-xl font-bold mb-4 text-amber-300">
        ☆ Mes favoris ({favorites.length})
      </h3>

      {favorites.length === 0 ? (
        <p className="text-slate-400">
          Aucun favori pour le moment. Utilisez le bouton
          « Ajouter aux favoris » sur un verset.
        </p>
      ) : (
        <div className="space-y-4">

          {favorites.map((item) => (
            <div
              key={`${item.surahNumber}-${item.ayah}`}
              className="rounded-xl bg-slate-900 p-4"
            >
              <div className="flex flex-wrap justify-between items-center gap-3">

                <p className="font-semibold">
                  Sourate {item.surahNumber} - {item.surahName}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    onRemove(item.surahNumber, item.ayah)
                  }
                  className="rounded-lg bg-red-800 px-3 py-2 text-sm hover:bg-red-700 transition-colors"
                >
                  Retirer
                </button>

              </div>

              <p className="mt-2 text-sm text-emerald-300">
                Verset {item.ayah}
              </p>

              <p
                dir="rtl"
                className="mt-3 text-2xl leading-loose text-amber-100"
              >
                {item.arabic}
              </p>
            </div>
          ))}

        </div>
      )}

    </section>
  );
}
