export type FavoriteItem = { surahName: string; surahNumber: number; ayah: number; arabic: string; };
type Props = { favorites: FavoriteItem[]; onRemove: (surahNumber: number, ayah: number) => void; };

export default function FavoritesPanel({ favorites, onRemove }: Props) {
  return (
    <section className="rounded-[2rem] border-2 border-[#e9bd4f] bg-gradient-to-br from-[#08734f]/95 to-[#03422f]/95 p-6 text-white shadow-[0_12px_35px_rgba(0,0,0,0.24)] backdrop-blur-md">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#f4c85f]/25 pb-4">
        <h3 className="flex items-center gap-3 text-2xl font-semibold text-white">
          <span aria-hidden="true" className="text-3xl text-[#f4c85f]">★</span>
          Mes Favoris
        </h3>
        <span className="rounded-full border border-[#f4c85f]/50 bg-[#022f25]/35 px-3 py-1 text-sm font-medium text-[#f8dda0]">
          {favorites.length}
        </span>
      </div>
      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/25 bg-[#022f25]/20 px-5 py-7 text-center">
          <p className="text-sm leading-relaxed text-emerald-50/90">
            Accédez rapidement à vos versets préférés. Vos favoris apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((item) => (
            <article key={item.surahNumber + "-" + item.ayah} className="rounded-2xl border border-[#f4c85f]/25 bg-[#022f25]/40 p-4 shadow-sm transition-colors hover:bg-[#022f25]/55">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">Sourate {item.surahNumber} · {item.surahName}</p>
                  <p className="mt-1 text-xs font-medium text-[#f4d98b]">Verset {item.ayah}</p>
                </div>
                <button type="button" onClick={() => onRemove(item.surahNumber, item.ayah)} className="rounded-full border border-[#f4c85f]/50 px-3 py-1.5 text-xs font-semibold text-[#f8dda0] transition hover:bg-[#f4c85f]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4c85f]">
                  Retirer
                </button>
              </div>
              <p dir="rtl" className="mt-4 border-t border-white/10 pt-3 text-xl leading-[2.2] text-white">
                {item.arabic}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
