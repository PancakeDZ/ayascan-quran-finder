"use client";

import { useState } from "react";
import verses from "./data/quran.json";

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: SpeechRecognitionResult;
  };
}

interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
}

type Verse = {
  surah: string;
  ayah: number;
  arabic: string;
  translation: string;
};

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState(
    "Cliquez sur le micro pour commencer."
  );
  const [match, setMatch] = useState<Verse | null>(null);
  const [confidence, setConfidence] = useState(0);

  const normalizeArabic = (text: string): string => {
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
      setMatch(null);
      setConfidence(0);
      return;
    }

    const uniqueWords = [
      ...new Set(
        normalizedInput
          .split(" ")
          .filter(Boolean)
      ),
    ];

    let bestMatch: Verse | null = null;
    let bestScore = 0;

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

      if (score > bestScore) {
        bestScore = score;
        bestMatch = verse;
      }
    }

    if (bestMatch) {
      const percentage = Math.round(
        (bestScore / uniqueWords.length) * 100
      );

      setMatch(bestMatch);
      setConfidence(percentage);
    } else {
      setMatch(null);
      setConfidence(0);
    }
  };

  const startListening = () => {
    const SpeechRecognitionConstructor =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

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
    setMatch(null);
    setConfidence(0);

    recognition.start();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;

      setTranscript(text);

      findVerse(text);

      setStatus("✅ Récitation reconnue.");
    };

    recognition.onerror = () => {
      setStatus(
        "❌ Une erreur est survenue pendant la reconnaissance."
      );
    };
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4">
          AyaScan Quran Finder
        </h1>

        <p className="text-slate-300 mb-8">
          Retrouvez instantanément une sourate ou un verset
          à partir d&apos;une récitation vocale.
        </p>

        <button
          onClick={startListening}
          className="bg-emerald-600 hover:bg-emerald-700 transition px-8 py-4 rounded-xl font-semibold"
        >
          🎤 Commencer
        </button>

        <div className="mt-6 text-emerald-400">
          {status}
        </div>

        {transcript && (
          <div className="mt-8 rounded-xl bg-slate-800 p-6">
            <h2 className="font-bold mb-3">
              Texte reconnu
            </h2>

            <p className="text-2xl">
              {transcript}
            </p>
          </div>
        )}

        {match && (
          <div className="mt-8 rounded-xl border border-emerald-700 bg-emerald-950 p-6">
            <h2 className="text-xl font-bold mb-4">
              ✅ Verset trouvé
            </h2>

            <p>
              <strong>Sourate :</strong> {match.surah}
            </p>

            <p>
              <strong>Verset :</strong> {match.ayah}
            </p>

            <p className="mt-2 text-green-300">
              Confiance : {confidence}%
            </p>

            <p className="text-3xl leading-loose mt-4">
              {match.arabic}
            </p>

            <p className="mt-4 text-slate-300">
              {match.translation}
            </p>
          </div>
        )}

        {!match && transcript && (
          <div className="mt-8 text-yellow-400">
            Aucun verset trouvé dans la base actuelle.
          </div>
        )}

        <p className="mt-10 text-sm text-slate-500">
          Sources : Tanzil • Quran.com • EveryAyah
        </p>
      </div>
    </main>
  );
}