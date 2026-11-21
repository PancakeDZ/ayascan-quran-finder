"use client";

import { useState } from "react";
import verses from "./data/quran.json";
import { surahNames } from "./data/surahNames";

declare global {
  interface Window {
    webkitSpeechRecognition?: unknown;
    SpeechRecognition?: unknown;
  }
}

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
    "Cliquez sur le micro pour commencer."
  );

  const [results, setResults] = useState<SearchResult[]>([]);

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
              results: { [key: number]: { [key: number]: { transcript: string } } };
            }) => void) | null;
            onerror: (() => void) | null;
          };
          webkitSpeechRecognition?: new () => {
            lang: string;
            continuous: boolean;
            interimResults: boolean;
            start(): void;
            onresult: ((event: {
              results: { [key: number]: { [key: number]: { transcript: string } } };
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
              results: { [key: number]: { [key: number]: { transcript: string } } };
            }) => void) | null;
            onerror: (() => void) | null;
          };
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setStatus(
        "❌ Votre navigateur ne supporte pas la reconnaissance vocale."
      );
      return;
    }

    const recognition = new SpeechRecognitionConstructor();

    recognition.lang = "ar-SA";
    recognition.continuous = false;
    recognition.interimResults = false;

    setStatus("🎤 Écoute en cours...");
    setResults([]);

    recognition.start();

    recognition.onresult = (event) => {
      const text =
        event.results[0][0].transcript;

      setTranscript(text);

      findVerse(text);

      setStatus(
        "✅ Récitation reconnue."
      );
    };

    recognition.onerror = () => {
      setStatus(
        "❌ Une erreur est survenue."
      );
    };
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-4xl text-center">

        <h1 className="text-5xl font-bold mb-4">
          AyaScan Quran Finder
        </h1>

        <p className="text-slate-300 mb-8">
          Retrouvez instantanément un verset
          du Coran à partir d&apos;une récitation.
        </p>

        <button
          onClick={startListening}
          className="bg-emerald-600 hover:bg-emerald-700 px-8 py-4 rounded-xl font-semibold"
        >
          🎤 Commencer
        </button>

        <div className="mt-6 text-emerald-400">
          {status}
        </div>

        {transcript && (
          <div className="mt-8 bg-slate-800 rounded-xl p-6">
            <h2 className="font-bold mb-3">
              Texte reconnu
            </h2>

            <p className="text-2xl">
              {transcript}
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-10 space-y-4">

            <h2 className="text-2xl font-bold">
              Top 5 des résultats
            </h2>

            {results.map(
              (result, index) => (
                <div
                  key={`${result.verse.surahNumber}-${result.verse.ayah}`}
                  className="bg-emerald-950 border border-emerald-700 rounded-xl p-6"
                >
                  <p className="font-bold">
                    #{index + 1}
                  </p>

                  <p>
                    <strong>Sourate :</strong>{" "}
                    {
                      surahNames[
                        result.verse
                          .surahNumber as keyof typeof surahNames
                      ]
                    }
                  </p>

                  <p>
                    <strong>Numéro :</strong>{" "}
                    {
                      result.verse
                        .surahNumber
                    }
                  </p>

                  <p>
                    <strong>Verset :</strong>{" "}
                    {result.verse.ayah}
                  </p>

                  <p className="text-green-300">
                    Confiance :{" "}
                    {result.score}%
                  </p>

                  <p className="text-3xl mt-4 leading-loose">
                    {
                      result.verse
                        .arabic
                    }
                  </p>
                </div>
              )
            )}
          </div>
        )}

        <p className="mt-10 text-sm text-slate-500">
          Corpus chargé : {
            (verses as Verse[])
              .length
          } versets
        </p>

      </div>
    </main>
  );
}