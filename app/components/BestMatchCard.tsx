
type Props = {
  surahName: string;
  surahArabic: string;
  surahNumber: number;
  ayah: number;
  arabic: string;
  confidence: number;
  occurrences?: Array<{
    surahNumber: number;
    ayah: number;
    surahName: string;
  }>;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export default function BestMatchCard({
  surahName,
  surahArabic,
  surahNumber,
  ayah,
  arabic,
  confidence,
  occurrences = [],
  isFavorite,
  onToggleFavorite,
}: Props) {
  const copyVerse = async () => {
    const text = `
Sourate ${surahNumber} - ${surahName}

${arabic}

AyaScan Quran Finder
`;

    try {
      await navigator.clipboard.writeText(text);
      alert("Verset copié !");
    } catch {
      alert("Impossible de copier le verset.");
    }
  };

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-white/5 backdrop-blur-md p-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">

      <p className="text-amber-300 mb-2 text-sm uppercase tracking-widest">
        ✦ Meilleure correspondance
      </p>

      <h2 className="text-3xl font-bold">
        {surahName}
      </h2>

      <p className="text-emerald-300 mt-2">
        Sourate {surahNumber} • Verset {ayah}
      </p>

      <p
        dir="rtl"
        className="mt-8 text-5xl leading-loose text-amber-100"
      >
        {arabic}
      </p>

      <p className="mt-6 text-emerald-300">
        Confiance : {confidence}%
      </p>

      <div className="mt-8 flex flex-wrap gap-4 justify-center">

        <button
          type="button"
          onClick={copyVerse}
          className="rounded-xl bg-emerald-700 px-4 py-2 hover:bg-emerald-600 transition-colors"
        >
          ▣ Copier
        </button>

        <button
          type="button"
          onClick={onToggleFavorite}
          className={`rounded-xl px-4 py-2 transition-colors ${
            isFavorite
              ? "bg-amber-600 hover:bg-amber-500"
              : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          {isFavorite ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
        </button>

      </div>

      <p className="mt-6 text-2xl text-amber-200">
        {surahArabic}
      </p>

      {occurrences.length > 0 && (
        <p className="mt-3 text-sm text-slate-300">
          Ce même texte apparaît aussi dans :{" "}
          {occurrences.map((item) => `${item.surahName} ${item.surahNumber}:${item.ayah}`).join(" · ")}
        </p>
      )}
    </div>
  );
}
