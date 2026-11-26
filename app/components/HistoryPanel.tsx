"use client";

export type HistoryItem = { id: string; surahName: string; surahNumber: number; ayah: number; arabic: string; searchedAt: number; };
type Props = { history: HistoryItem[]; onRemove: (id: string) => void; onClear: () => void; };

export default function HistoryPanel({ history, onRemove, onClear }: Props) {
  return (
    <section className="rounded-[2rem] border-2 border-[#e9bd4f] bg-gradient-to-br from-[#08734f]/95 to-[#03422f]/95 p-6 text-white shadow-[0_12px_35px_rgba(0,0,0,0.24)] backdrop-blur-md">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#f4c85f]/25 pb-4">
        <h3 className="flex items-center gap-3 text-2xl font-semibold text-white">
          <span aria-hidden="true" className="text-3xl text-[#f4c85f]">◷</span>
          Historique
        </h3>
        {history.length > 0 && (
          <button type="button" onClick={onClear} className="rounded-full border border-[#f4c85f]/50 px-3 py-1.5 text-xs font-semibold text-[#f8dda0] transition hover:bg-[#f4c85f]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4c85f]">
            Tout effacer
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/25 bg-[#022f25]/20 px-5 py-7 text-center">
          <p className="text-sm leading-relaxed text-emerald-50/90">
            Retrouvez vos recherches récentes. Votre historique apparaîtra ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <article key={item.id} className="rounded-2xl border border-[#f4c85f]/25 bg-[#022f25]/40 p-4 shadow-sm transition-colors hover:bg-[#022f25]/55">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white">Sourate {item.surahNumber} · {item.surahName}</p>
                  <p className="mt-1 text-xs font-medium text-[#f4d98b]">Verset {item.ayah}</p>
                </div>
                <button type="button" onClick={() => onRemove(item.id)} aria-label="Supprimer cette recherche" className="shrink-0 rounded-full border border-[#f4c85f]/50 px-3 py-1.5 text-xs font-semibold text-[#f8dda0] transition hover:bg-[#f4c85f]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4c85f]">
                  Supprimer
                </button>
              </div>
              <p dir="rtl" className="mt-4 border-t border-white/10 pt-3 text-xl leading-[2.2] text-white">
                {item.arabic}
              </p>
              <p className="mt-3 text-xs text-emerald-100/65">
                {new Date(item.searchedAt).toLocaleString("fr-FR")}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
