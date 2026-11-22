type HistoryItem = {
  surahName: string;
  surahNumber: number;
  ayah: number;
};

type Props = {
  history: HistoryItem[];
};

export default function HistoryPanel({
  history,
}: Props) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900/50 p-6">
      <h3 className="text-xl font-bold mb-4 text-amber-300">
        ☾ Historique
      </h3>

      <div className="space-y-2">
        {history.map((item, index) => (
          <div
            key={`${item.surahNumber}-${item.ayah}-${index}`}
            className="rounded-xl bg-slate-800 px-4 py-3"
          >
            Sourate {item.surahNumber} - {item.surahName}
            <br />
            Verset {item.ayah}
          </div>
        ))}
      </div>
    </div>
  );
}