type Props = {
  surahName: string;
  surahArabic: string;
  surahNumber: number;
  ayah: number;
  arabic: string;
  confidence: number;
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
    <section className="rounded-2xl border border-[#e4e8e1] bg-white p-6 shadow-[0_8px_28px_rgba(23,61,50,0.06)] sm:p-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#987b43]">
        Meilleure correspondance
      </p>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#245541] sm:text-3xl">
            {surahName}
          </h2>
          <p className="mt-1 text-sm text-[#78877e]">
            Sourate {surahNumber} · Verset {ayah}
          </p>
        </div>
        <span className="rounded-full bg-[#edf5ef] px-3 py-1.5 text-sm font-semibold text-[#28634b]">
          {confidence}% de correspondance
        </span>
      </div>
      <p dir="rtl" className="mt-7 text-3xl leading-[2.2] text-[#234b3c] sm:text-4xl">
        {arabic}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyVerse}
          className="rounded-full bg-[#0d5945] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#174b3b]"
        >
          Copier le verset
        </button>
        <button
          type="button"
          onClick={onToggleFavorite}
          className="rounded-full border border-[#d8e1da] bg-white px-4 py-2.5 text-sm font-semibold text-[#315b48] transition-colors hover:bg-[#f4f7f4]"
        >
          {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        </button>
      </div>
      <p dir="rtl" className="mt-6 text-xl text-[#987b43]">
        {surahArabic}
      </p>
    </section>
  );
}
