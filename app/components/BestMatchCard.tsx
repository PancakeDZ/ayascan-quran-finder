"use client";

import { useEffect, useState } from "react";

type Props = {
  surahName: string;
  surahArabic: string;
  surahNumber: number;
  ayah: number;
  arabic: string;
  translation?: string;
  confidence: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

type QuranEncResponse = {
  translation?: string;
  result?: { translation?: string };
};

type TranslationState = {
  verseKey: string;
  text: string;
  version: string;
  error: boolean;
};

export default function BestMatchCard({
  surahName,
  surahArabic,
  surahNumber,
  ayah,
  arabic,
  translation: initialTranslation,
  confidence,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const [translationState, setTranslationState] = useState<TranslationState | null>(null);
  const verseKey = surahNumber + ":" + ayah;

  useEffect(() => {
    if (initialTranslation?.trim()) return;

    let cancelled = false;

    async function loadTranslation() {
      try {
        const response = await fetch(
          "https://quranenc.com/api/v1/translation/aya/french_rashid/" +
            surahNumber +
            "/" +
            ayah
        );

        if (!response.ok) throw new Error("Translation unavailable");

        const data = (await response.json()) as QuranEncResponse;
        const translatedText = data.result?.translation ?? data.translation ?? "";

        if (!translatedText) throw new Error("Empty translation");

        if (!cancelled) {
          setTranslationState({
            verseKey,
            text: translatedText,
            version: "Rachid Maach",
            error: false,
          });
        }
      } catch {
        if (!cancelled) {
          setTranslationState({
            verseKey,
            text: "",
            version: "",
            error: true,
          });
        }
      }
    }

    void loadTranslation();

    return () => {
      cancelled = true;
    };
  }, [surahNumber, ayah, verseKey, initialTranslation]);

  const fetchedTranslation =
    translationState?.verseKey === verseKey ? translationState.text : "";
  const displayedTranslation = initialTranslation?.trim() || fetchedTranslation;
  const translationError =
    translationState?.verseKey === verseKey && translationState.error;

  const copyVerse = async () => {
    const text =
      "Sourate " +
      surahNumber +
      " - " +
      surahName +
      "\nVerset " +
      ayah +
      "\n\n" +
      arabic +
      "\n\n" +
      displayedTranslation +
      "\n\nAyaScan Quran Finder";

    try {
      await navigator.clipboard.writeText(text);
      alert("Verset copié !");
    } catch {
      alert("Impossible de copier le verset.");
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border-2 border-[#e9bd4f] bg-gradient-to-br from-[#08734f]/95 to-[#03422f]/95 text-white shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f4c85f]/25 bg-[#022f25]/25 px-6 py-4 sm:px-8">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f4d98b]">
          <span aria-hidden="true" className="text-lg">✦</span>
          Meilleure correspondance
        </p>
        <span className="rounded-full border border-[#f4c85f]/60 bg-[#f4c85f]/10 px-3 py-1.5 text-sm font-bold tabular-nums text-[#f8dda0]">
          {confidence}% de correspondance
        </span>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{surahName}</h2>
            <p className="mt-2 text-sm font-medium text-emerald-100/80">
              Sourate {surahNumber} <span className="px-1 text-[#e9bd4f]">·</span> Verset {ayah}
            </p>
          </div>
          <p dir="rtl" className="font-serif text-2xl text-[#f4d98b]">{surahArabic}</p>
        </div>

        <div className="mt-7 rounded-2xl border border-[#f4c85f]/25 bg-[#022f25]/35 px-5 py-6 sm:px-7 sm:py-8">
          <p dir="rtl" lang="ar" className="text-right font-serif text-3xl leading-[2.25] text-[#fff9e8] sm:text-4xl">
            {arabic}
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#f4d98b]">
            Traduction française du sens
          </p>
          {displayedTranslation ? (
            <>
              <p className="text-base leading-relaxed text-emerald-50 sm:text-lg">{displayedTranslation}</p>
              {!initialTranslation && (
                <p className="mt-3 border-t border-white/10 pt-2 text-xs text-emerald-100/70">
                  Traduction de {translationState?.verseKey === verseKey ? translationState.version : "Rachid Maach"} · Source : QuranEnc.com
                </p>
              )}
            </>
          ) : translationError ? (
            <p className="text-sm text-emerald-100/75">
              La traduction n’est pas disponible pour le moment. Le texte arabe reste accessible.
            </p>
          ) : (
            <p className="text-sm text-emerald-100/75">Chargement de la traduction…</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={copyVerse} className="rounded-full bg-[#e8bd50] px-5 py-2.5 text-sm font-bold text-[#064735] shadow-sm transition hover:bg-[#f5d77f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4d98b]">
            Copier le verset
          </button>
          <button type="button" onClick={onToggleFavorite} className="rounded-full border border-[#e9c66b]/70 px-5 py-2.5 text-sm font-semibold text-[#fff5d6] transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4d98b]">
            {isFavorite ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
          </button>
        </div>
      </div>
    </section>
  );
}
