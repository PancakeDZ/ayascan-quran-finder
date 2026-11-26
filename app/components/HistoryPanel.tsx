"use client";

export type HistoryItem = { id: string; surahName: string; surahNumber: number; ayah: number; arabic: string; searchedAt: number; };
type Props = { history: HistoryItem[]; onRemove: (id: string) => void; onClear: () => void; };

export default function HistoryPanel({ history, onRemove, onClear }: Props) {
  return (
    <section className="rounded-[2rem] border-2 border-[#e9bd4f] bg-gradient-to-br from-[#08734f]/95 to-[#03422f]/95 p-6 text-white shadow-[0_12px_35px_rgba(0,0,0,0.24)] backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-3 text-2xl font-semibold text-white"><span className="text-3xl text-[#f4c85f]">◷</span> Historique</h3>
        {history.length > 0 && <button type="button" onClick={onClear} className="text-sm text-[#f5d27b] hover:underline">Tout effacer</button>}
      </div>
      {history.length === 0 ? (
        <p className="text-sm leading-relaxed text-emerald-50/90">Retrouvez vos recherches récentes. Votre historique apparaîtra ici.</p>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/15 bg-[#022f25]/45 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">Sourate {item.surahNumber} · {item.surahName}</p>
                  <p className="mt-1 text-xs text-emerald-100/75">Verset {item.ayah}</p>
                  <p dir="rtl" className="mt-3 text-xl leading-loose text-white">{item.arabic}</p>
                  <p className="mt-2 text-xs text-emerald-100/65">{new Date(item.searchedAt).toLocaleString("fr-FR")}</p>
                </div>
                <button type="button" onClick={() => onRemove(item.id)} aria-label="Supprimer cette recherche" className="text-sm text-[#f5d27b] hover:underline">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
