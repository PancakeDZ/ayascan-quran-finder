
"use client";

export type HistoryItem = {
  id: string;
  surahName: string;
  surahNumber: number;
  ayah: number;
  arabic: string;
  searchedAt: number;
};

type Props = {
  history: HistoryItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
};

export default function HistoryPanel({
  history,
  onRemove,
  onClear,
}: Props) {
  return (
    <section className="mt-10 rounded-3xl border border-slate-700 bg-slate-900/50 p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold text-amber-300">
          ☾ Historique des recherches
        </h3>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-red-500/40 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
          >
            Tout effacer
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-center text-slate-400">
          Aucune recherche pour le moment.
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-slate-800 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    Sourate {item.surahNumber} - {item.surahName}
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    Verset {item.ayah}
                  </p>

                  <p className="mt-3 text-xl text-white" dir="rtl">
                    {item.arabic}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(item.searchedAt).toLocaleString("fr-FR")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label="Supprimer cette recherche"
                  className="rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
