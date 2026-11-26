export type FavoriteItem = { surahName: string; surahNumber: number; ayah: number; arabic: string; };
type Props = { favorites: FavoriteItem[]; onRemove: (surahNumber: number, ayah: number) => void; };

export default function FavoritesPanel({ favorites, onRemove }: Props) {
  return (
    <section className="rounded-[2rem] border-2 border-[#e9bd4f] bg-gradient-to-br from-[#08734f]/95 to-[#03422f]/95 p-6 text-white shadow-[0_12px_35px_rgba(0,0,0,0.24)] backdrop-blur-md">
      <h3 className="mb-4 flex items-center gap-3 text-2xl font-semibold text-white"><span className="text-3xl text-[#f4c85f]">★</span> Mes Favoris <span className="text-base font-normal text-emerald-100">({favorites.length})</span></h3>
      {favorites.length === 0 ? (
        <p className="text-sm leading-relaxed text-emerald-50/90">Accédez rapidement à vos versets préférés. Vos favoris apparaîtront ici.</p>
      ) : (
        <div className="space-y-3">
          {favorites.map((item) => (
            <div key={`${item.surahNumber}-${item.ayah}`} className="rounded-xl border border-white/15 bg-[#022f25]/45 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold">Sourate {item.surahNumber} · {item.surahName}</p>
                <button type="button" onClick={() => onRemove(item.surahNumber, item.ayah)} className="text-sm text-[#f5d27b] hover:underline">Retirer</button>
              </div>
              <p className="mt-1 text-xs text-emerald-100/75">Verset {item.ayah}</p>
              <p dir="rtl" className="mt-3 text-xl leading-loose text-white">{item.arabic}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
