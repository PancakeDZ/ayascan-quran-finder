type Props = {
  surahName: string;
  surahArabic: string;
  surahNumber: number;
  ayah: number;
  arabic: string;
  confidence: number;
};

export default function BestMatchCard({
  surahName,
  surahArabic,
  surahNumber,
  ayah,
  arabic,
  confidence,
}: Props) {
  const copyVerse = async () => {
    const text = `
Sourate ${surahNumber} - ${surahName}

${arabic}

AyaScan Quran Finder
`;

    await navigator.clipboard.writeText(text);
    alert("Verset copié ✅");
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
          onClick={copyVerse}
          className="rounded-xl bg-emerald-700 px-4 py-2 hover:bg-emerald-600"
        >
          ❖ Copier
        </button>

        <button
          className="rounded-xl bg-amber-700 px-4 py-2 hover:bg-amber-600"
        >
          ۞ Favori
        </button>

      </div>

      <p className="mt-6 text-2xl text-amber-200">
        {surahArabic}
      </p>
    </div>
  );
}