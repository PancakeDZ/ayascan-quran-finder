"use client";

import { useState } from "react";
import verses from "./data/quran.json";
import { surahNames } from "./data/surahNames";

import BasmalaButton from "./components/BasmalaButton";
import BestMatchCard from "./components/BestMatchCard";

type Verse = {
  surahNumber: number;
  surahLatin?: string;
  surahArabic: string;
  ayah: number;
  arabic: string;
  translation: string;
};

type SearchResult = {
  verse: Verse;
  score: number;
};

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState(
    "Touchez ﷽ pour commencer."
  );

  const [results, setResults] = useState<SearchResult[]>([]);
  const [listening, setListening] = useState(false);

  const normalizeArabic = (text: string) => {
    return text
      .replace(/[\u064B-\u065F]/g, "")
      .replace(/ـ/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/\s+/g, " ")
      .trim();
  };

  const clearResults = () => {
    setTranscript("");
    setResults([]);
    setStatus("Touchez ﷽ pour commencer.");
  };

  const findVerse = (text: string) => {
    const normalizedInput = normalizeArabic(text);

    if (!normalizedInput) {
      setResults([]);
      return;
    }

    const uniqueWords = [
      ...new Set(
        normalizedInput
          .split(" ")
          .filter(Boolean)
      ),
    ];

    const matches: SearchResult[] = [];

    for (const verse of verses as Verse[]) {
      const normalizedVerse = normalizeArabic(
        verse.arabic
      );

      let score = 0;

      for (const word of uniqueWords) {
        if (normalizedVerse.includes(word)) {
          score++;
        }
      }

      if (score > 0) {
        matches.push({
          verse,
          score: Math.round(
            (score / uniqueWords.length) * 100
          ),
        });
      }
    }

    matches.sort(
      (a, b) => b.score - a.score
    );

    setResults(matches.slice(0, 5));
  };

  const startListening = () => {
    const SpeechRecognitionConstructor =
      (
        window as Window & {
          SpeechRecognition?: new () => {
            lang: string;
            continuous: boolean;
            interimResults: boolean;
            start(): void;
            onresult: ((event: {
              results: {
                [key: number]: {
                  [key: number]: {
                    transcript: string;
                  };
                };
              };
            }) => void) | null;
            onerror: (() => void) | null;
          };
          webkitSpeechRecognition?: new () => {
            lang: string;
            continuous: boolean;
            interimResults: boolean;
            start(): void;
            onresult: ((event: {
              results: {
                [key: number]: {
                  [key: number]: {
                    transcript: string;
                  };
                };
              };
            }) => void) | null;
            onerror: (() => void) | null;
          };
        }
      ).SpeechRecognition ||
      (
        window as Window & {
          webkitSpeechRecognition?: new () => {
            lang: string;
            continuous: boolean;
            interimResults: boolean;
            start(): void;
            onresult: ((event: {
              results: {
                [key: number]: {
                  [key: number]: {
                    transcript: string;
                  };
                };
              };
            }) => void) | null;
            onerror: (() => void) | null;
          };
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setStatus(
        "❌ Reconnaissance vocale non supportée."
      );
      return;
    }

    const recognition =
      new SpeechRecognitionConstructor();

    recognition.lang = "ar-SA";
    recognition.continuous = false;
    recognition.interimResults = false;

    setListening(true);
    setStatus("🔊 Écoute en cours...");
    setResults([]);

    recognition.start();

    recognition.onresult = (event) => {
      const text =
        event.results[0][0].transcript;

      setTranscript(text);

      findVerse(text);

      setListening(false);

      setStatus(
        "✅ Récitation reconnue."
      );
    };

    recognition.onerror = () => {
      setListening(false);

      setStatus(
        "❌ Une erreur est survenue."
      );
    };
  };

  const bestMatch = results[0];

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-emerald-950 to-slate-900 text-white">

      <div className="max-w-6xl mx-auto px-6 py-12">

        <div className="text-center">

          <h1 className="text-6xl text-amber-300 mb-4">
            ﷽
          </h1>

          <h2 className="text-5xl font-bold">
            AyaScan
          </h2>

          <p className="mt-2 text-slate-300">
            Quran Finder
          </p>

          <p className="mt-6 text-slate-400">
            Retrouvez instantanément une
            sourate à partir d&apos;une récitation.
          </p>

          <div className="mt-10 flex justify-center">
            <BasmalaButton
              onClick={startListening}
              listening={listening}
            />
          </div>

          <div className="mt-6 text-emerald-300">
            {status}
          </div>

          <div className="mt-4 flex justify-center gap-4">

            <button
              onClick={clearResults}
              className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-600"
            >
              ✧ Effacer
            </button>

          </div>

        </div>

        {transcript && (
          <div className="mt-12 bg-slate-900/50 rounded-3xl p-6 text-center">

            <h3 className="font-bold mb-3">
              Texte reconnu
            </h3>

            <p className="text-2xl">
              {transcript}
            </p>

          </div>
        )}

        {bestMatch && (
          <div className="mt-12">

            <BestMatchCard
              surahName={
                surahNames[
                  bestMatch.verse
                    .surahNumber as keyof typeof surahNames
                ]
              }
              surahArabic={
                bestMatch.verse.surahArabic
              }
              surahNumber={
                bestMatch.verse.surahNumber
              }
              ayah={bestMatch.verse.ayah}
              arabic={bestMatch.verse.arabic}
              confidence={bestMatch.score}
            />

          </div>
        )}

        {results.length > 1 && (

          <div className="mt-10">

            <h2 className="text-2xl font-bold mb-6">
              Autres résultats possibles
            </h2>

            <div className="grid gap-4">

              {results
                .slice(1)
                .map((result, index) => (

                  <div
                    key={`${result.verse.surahNumber}-${result.verse.ayah}`}
                    className="bg-slate-900/50 rounded-2xl p-5"
                  >
                    <p>
                      #{index + 2}
                    </p>

                    <p>
                      {
                        surahNames[
                          result.verse
                            .surahNumber as keyof typeof surahNames
                        ]
                      }
                    </p>

                    <p>
                      Verset {result.verse.ayah}
                    </p>

                    <p className="text-emerald-300">
                      {result.score}%
                    </p>
                  </div>

                ))}

            </div>

          </div>

        )}

        <div className="mt-12 text-center text-slate-500 text-sm">
          Corpus chargé : {(verses as Verse[]).length} versets
        </div>

      </div>

    </main>
  );
}