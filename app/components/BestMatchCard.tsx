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

export default function BestMatchCard({ surahName, surahArabic, surahNumber, ayah, arabic, confidence, isFavorite, onToggleFavorite }: Props) {
  const copyVerse = async () => {
    const text = `Sourate ${surahNumber} - ${surahName}\n\n${arabic}\n\nAyaScan Quran Finder`;
    try { await navigator.clipboard.writeText(text); alert("Verset copié !"); }
    catch { alert("Impossible de copier le verset."); }
  };

  return (
    <section className="rounded-3xl border border-[#e9c66b]/70 bg-[#064735]/90 p-6 text-white shadow-xl backdrop-blur-md sm:p-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4ce72]">✦ Meilleure correspondance</p>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{surahName}</h2>
          <p className="mt-1 text-sm text-emerald-100/80">Sourate {surahNumber} · Verset {ayah}</p>
        </div>
        <span className="rounded-full border border-[#e9c66b]/60 bg-[#e9c66b]/10 px-3 py-1.5 text-sm font-semibold text-[#f4ce72]">{confidence}%</span>
      </div>
      <p dir="rtl" className="mt-7 text-3xl leading-[2.2] text-[#fff8df] sm:text-4xl">{arabic}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={copyVerse} className="rounded-full bg-[#e8bd50] px-5 py-2.5 text-sm font-semibold text-[#064735] transition hover:bg-[#f5d77f]">Copier</button>
        <button type="button" onClick={onToggleFavorite} className="rounded-full border border-[#e9c66b]/70 px-5 py-2.5 text-sm font-semibold text-[#fff5d6] transition hover:bg-white/10">{isFavorite ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}</button>
      </div>
      <p dir="rtl" className="mt-6 text-xl text-[#f4ce72]">{surahArabic}</p>
    </section>
  );
}
