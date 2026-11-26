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
    <section className="rounded-2xl border border-[#e4e8e1] bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-4 text-lg font-semibold text-[#245541]">
        Mes favoris <span className="text-sm font-normal text-[#8a958e]">({favorites.length})</span>
      </h3>
      {favorites.length === 0 ? (
        <p className="text-sm leading-relaxed text-[#78877e]">
          Aucun favori pour le moment. Vous pourrez enregistrer un verset depuis ses résultats.
        </p>
      ) : (
        <div className="space-y-3">
          {favorites.map((item) => (
            <div
              key={`${item.surahNumber}-${item.ayah}`}
              className="rounded-xl border border-[#edf0eb] bg-[#fafbf9] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-[#315647]">
                  Sourate {item.surahNumber} · {item.surahName}
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(item.surahNumber, item.ayah)}
                  className="text-sm font-medium text-[#9b5550] hover:underline"
                >
                  Retirer
                </button>
              </div>
              <p className="mt-1 text-xs text-[#849087]">Verset {item.ayah}</p>
              <p dir="rtl" className="mt-3 text-xl leading-loose text-[#244c3d]">
                {item.arabic}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
