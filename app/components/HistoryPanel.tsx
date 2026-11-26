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
    <section className="rounded-2xl border border-[#e4e8e1] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#245541]">
          Historique des recherches
        </h3>
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-[#9b5550] hover:underline"
          >
            Tout effacer
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="text-sm text-[#78877e]">
          Aucune recherche pour le moment.
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-[#edf0eb] bg-[#fafbf9] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#315647]">
                    Sourate {item.surahNumber} · {item.surahName}
                  </p>
                  <p className="mt-1 text-xs text-[#849087]">
                    Verset {item.ayah}
                  </p>
                  <p dir="rtl" className="mt-3 text-xl leading-loose text-[#244c3d]">
                    {item.arabic}
                  </p>
                  <p className="mt-2 text-xs text-[#929b95]">
                    {new Date(item.searchedAt).toLocaleString("fr-FR")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label="Supprimer cette recherche"
                  className="text-sm font-medium text-[#9b5550] hover:underline"
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
