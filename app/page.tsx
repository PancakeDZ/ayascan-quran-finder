


"use client";

import { useEffect, useRef, useState } from "react";

import BasmalaButton from "./components/BasmalaButton";
import BestMatchCard from "./components/BestMatchCard";
import FavoritesPanel, {
  type FavoriteItem,
} from "./components/FavoritesPanel";
import HistoryPanel, {
  type HistoryItem,
} from "./components/HistoryPanel";
import verses from "./data/quran.json";
import { surahNames } from "./data/surahNames";


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

type RecognitionEvent = {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type RecognitionType = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

// Clé de sauvegarde des favoris dans le navigateur
const FAVORITES_STORAGE_KEY = "ayascan_favorites";
const HISTORY_STORAGE_KEY = "ayascan_history";
// Normalisation du texte arabe
function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/ـ/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[،؛؟!.,:()[\]{}«»"'ـ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Calcul de la distance entre deux mots arabes
function wordSimilarity(first: string, second: string): number {
  if (first === second) return 1;

  const a = Array.from(first);
  const b = Array.from(second);

  if (Math.min(a.length, b.length) < 3) {
    return 0;
  }

  const matrix: number[][] = Array.from(
    { length: a.length + 1 },
    () => Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      let substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;

      // Certaines lettres peuvent être confondues
      // par la reconnaissance vocale
      if (
        (a[i - 1] === "ق" && b[j - 1] === "ك") ||
        (a[i - 1] === "ك" && b[j - 1] === "ق")
      ) {
        substitutionCost = 0.45;
      }

      if (
        (a[i - 1] === "ت" && b[j - 1] === "ث") ||
        (a[i - 1] === "ث" && b[j - 1] === "ت")
      ) {
        substitutionCost = 0.5;
      }

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + substitutionCost
      );
    }
  }

  const distance = matrix[a.length][b.length];

  return Math.max(
    0,
    1 - distance / Math.max(a.length, b.length)
  );
}

// Préparation du corpus coranique
const quranVerses = verses as Verse[];

const normalizedVerseTokens = quranVerses.map((verse) =>
  normalizeArabic(verse.arabic)
    .split(" ")
    .filter(Boolean)
);

const documentFrequency = new Map<string, number>();

for (const tokens of normalizedVerseTokens) {
  const uniqueTokens = new Set(tokens);

  for (const token of uniqueTokens) {
    documentFrequency.set(
      token,
      (documentFrequency.get(token) ?? 0) + 1
    );
  }
}

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState(
    "Touchez ﷽ pour commencer."
  );

  const [results, setResults] = useState<SearchResult[]>([]);
  const [listening, setListening] = useState(false);

  // Gestion des favoris
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
const [historyLoaded, setHistoryLoaded] = useState(false);

  const recognitionRef = useRef<RecognitionType | null>(null);
const latestBestResultRef = useRef<SearchResult | null>(null);
 
  // Charger les favoris enregistrés dans le navigateur
  useEffect(() => {
    let validFavorites: FavoriteItem[] = [];

    try {
      const savedFavorites = localStorage.getItem(
        FAVORITES_STORAGE_KEY
      );

      if (savedFavorites) {
        const parsedFavorites: unknown = JSON.parse(savedFavorites);

        if (Array.isArray(parsedFavorites)) {
          validFavorites = parsedFavorites.filter(
            (item): item is FavoriteItem =>
              item !== null &&
              typeof item === "object" &&
              typeof item.surahName === "string" &&
              typeof item.surahNumber === "number" &&
              typeof item.ayah === "number" &&
              typeof item.arabic === "string"
          );
        }
      }
    } catch {
      console.error("Impossible de charger les favoris.");
    }

    const frameId = window.requestAnimationFrame(() => {
      setFavorites(validFavorites);
      setFavoritesLoaded(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);
  // Charger l'historique enregistré dans le navigateur
  useEffect(() => {
    let savedHistory: HistoryItem[] = [];

    try {
      const rawHistory = localStorage.getItem(
        HISTORY_STORAGE_KEY
      );

      if (rawHistory) {
        const parsed: unknown = JSON.parse(rawHistory);

        if (Array.isArray(parsed)) {
          savedHistory = parsed.filter(
            (item): item is HistoryItem =>
              item !== null &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.surahName === "string" &&
              typeof item.surahNumber === "number" &&
              typeof item.ayah === "number" &&
              typeof item.arabic === "string" &&
              typeof item.searchedAt === "number"
          );
        }
      }
    } catch {
      console.error("Impossible de charger l'historique.");
    }

    const frameId = window.requestAnimationFrame(() => {
      setHistory(savedHistory);
      setHistoryLoaded(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  // Enregistrer automatiquement les favoris
  useEffect(() => {
    if (!favoritesLoaded) {
      return;
    }

    try {
      localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favorites)
      );
    } catch {
      console.error("Impossible d'enregistrer les favoris.");
    }
  }, [favorites, favoritesLoaded]);
  // Enregistrer automatiquement l'historique
  useEffect(() => {
    if (!historyLoaded) {
      return;
    }

    try {
      localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(history)
      );
    } catch {
      console.error("Impossible d'enregistrer l'historique.");
    }
  }, [history, historyLoaded]);
  // Ajouter ou retirer un favori
  const toggleFavorite = (result: SearchResult) => {
    const verse = result.verse;

    const alreadyFavorite = favorites.some(
      (item) =>
        item.surahNumber === verse.surahNumber &&
        item.ayah === verse.ayah
    );

    if (alreadyFavorite) {
      setFavorites((current) =>
        current.filter(
          (item) =>
            !(
              item.surahNumber === verse.surahNumber &&
              item.ayah === verse.ayah
            )
        )
      );

      return;
    }

    const newFavorite: FavoriteItem = {
      surahName:
        surahNames[
          verse.surahNumber as keyof typeof surahNames
        ],
      surahNumber: verse.surahNumber,
      ayah: verse.ayah,
      arabic: verse.arabic,
    };

    setFavorites((current) => [...current, newFavorite]);
  };

  // Retirer un favori depuis la liste
  const removeFavorite = (
    surahNumber: number,
    ayah: number
  ) => {
    setFavorites((current) =>
      current.filter(
        (item) =>
          !(
            item.surahNumber === surahNumber &&
            item.ayah === ayah
          )
      )
    );
  };
  // Supprimer une recherche de l'historique
  const removeHistoryItem = (id: string) => {
    setHistory((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  // Effacer tout l'historique
  const clearHistory = () => {
    setHistory([]);
  };
 
  // Enregistrer le meilleur résultat une seule fois à la fin de l'écoute
const saveBestResultToHistory = () => {
  const bestResult = latestBestResultRef.current;

  if (!bestResult) {
    return;
  }

  const verse = bestResult.verse;
  const now = Date.now();

  const historyItem: HistoryItem = {
    id: `${now}-${verse.surahNumber}-${verse.ayah}`,
    surahName:
      surahNames[
        verse.surahNumber as keyof typeof surahNames
      ] ?? `Sourate ${verse.surahNumber}`,
    surahNumber: verse.surahNumber,
    ayah: verse.ayah,
    arabic: verse.arabic,
    searchedAt: now,
  };

  setHistory((current) =>
    [historyItem, ...current].slice(0, 50)
  );

  latestBestResultRef.current = null;
};
  // Recherche intelligente des versets
  const findVerse = (text: string) => {
    const normalizedInput = normalizeArabic(text);

    if (!normalizedInput) {
      setResults([]);
      return;
    }

    const uniqueWords = [
      ...new Set(normalizedInput.split(" ").filter(Boolean)),
    ];

    if (uniqueWords.length === 0) {
      setResults([]);
      return;
    }

    const matches: SearchResult[] = [];

    for (let index = 0; index < quranVerses.length; index++) {
      const verse = quranVerses[index];
      const verseTokens = normalizedVerseTokens[index];

      let matchedWeight = 0;
      let totalWeight = 0;

      const usedVerseWords = new Set<number>();

      for (const inputWord of uniqueWords) {
        const frequency =
          documentFrequency.get(inputWord) ?? 0;

        // Les mots rares sont plus importants
        const weight =
          1 + Math.log(
            (quranVerses.length + 1) / (frequency + 1)
          );

        totalWeight += weight;

        let bestSimilarity = 0;
        let bestIndex = -1;

        for (
          let wordIndex = 0;
          wordIndex < verseTokens.length;
          wordIndex++
        ) {
          if (usedVerseWords.has(wordIndex)) {
            continue;
          }

          const similarity = wordSimilarity(
            inputWord,
            verseTokens[wordIndex]
          );

          if (similarity > bestSimilarity) {
            bestSimilarity = similarity;
            bestIndex = wordIndex;
          }
        }

        // Seuil de tolérance pour les erreurs vocales
        const threshold =
          inputWord.length >= 4 ? 0.60 : 0.70;

        if (
          bestIndex !== -1 &&
          bestSimilarity >= threshold
        ) {
          matchedWeight += weight * bestSimilarity;
          usedVerseWords.add(bestIndex);
        }
      }

      if (matchedWeight > 0 && totalWeight > 0) {
        const score = Math.round(
          (matchedWeight / totalWeight) * 100
        );

        matches.push({
          verse,
          score,
        });
      }
    }

      matches.sort((a, b) => b.score - a.score);

    const rankedResults = matches.slice(0, 5);

    setResults(rankedResults);

    // Conserver uniquement le meilleur résultat
    // pour l'enregistrer à la fin de l'écoute
    latestBestResultRef.current = rankedResults[0] ?? null;
  };

  // Effacer les résultats
  const clearResults = () => {
    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;

      recognition.stop();
    }

       latestBestResultRef.current = null;
    setListening(false);
    setTranscript("");
    setResults([]);
    setStatus("Touchez ﷽ pour commencer.");
  };

  // Arrêter la reconnaissance vocale
  const stopListening = () => {
    const recognition = recognitionRef.current;

    saveBestResultToHistory();

    if (recognition) {
      recognitionRef.current = null;
      recognition.stop();
    }

    setListening(false);
    setStatus("⏹️ Récitation arrêtée.");
  };

  // Démarrer la reconnaissance vocale
  const startListening = () => {
    if (recognitionRef.current) {
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: new () => RecognitionType;
      webkitSpeechRecognition?: new () => RecognitionType;
    };

    const SpeechRecognitionConstructor =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setStatus("❌ Reconnaissance vocale non supportée.");
      return;
    }

    const recognition = new SpeechRecognitionConstructor();

    recognitionRef.current = recognition;

    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = false;

    latestBestResultRef.current = null;

    recognition.onresult = (event) => {
      if (recognitionRef.current !== recognition) {
        return;
      }

      const recognizedText = Array.from(
        { length: event.results.length },
        (_, index) => event.results[index][0].transcript
      )
        .join(" ")
        .trim();

      setTranscript(recognizedText);
      findVerse(recognizedText);

      setStatus(
        "🎙️ Récitation reconnue. Écoute en cours..."
      );
    };

    recognition.onerror = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
        latestBestResultRef.current = null;
        setListening(false);
        setStatus("❌ Une erreur est survenue.");
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        saveBestResultToHistory();

        recognitionRef.current = null;
        setListening(false);
        setStatus("⏹️ Écoute terminée.");
      }
    };

    setListening(true);
    setStatus("🔊 Écoute en cours...");
    setResults([]);
    setTranscript("");

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      latestBestResultRef.current = null;
      setListening(false);
      setStatus("❌ Impossible de démarrer le microphone.");
    }
  };
 const bestMatch = results[0];

  const bestMatchIsFavorite = bestMatch
    ? favorites.some(
        (item) =>
          item.surahNumber === bestMatch.verse.surahNumber &&
          item.ayah === bestMatch.verse.ayah
      )
    : false;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#062b24] text-[#f8f5e9]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(3, 35, 29, 0.52) 0%, rgba(3, 35, 29, 0.72) 48%, rgba(3, 35, 29, 0.94) 100%), url('https://commons.wikimedia.org/wiki/Special:FilePath/Masjid_Kristal_(Kuala_Terengganu)_(10498676193).jpg')",
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-emerald-950/10 via-transparent to-[#031b17]/60" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
        <header className="flex flex-col items-center text-center">
          <div className="mb-5 flex items-center gap-3">
            <span aria-hidden="true" className="text-4xl text-[#e3bd70]">۞</span>
            <div className="text-left">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Aya<span className="text-[#e3bd70]">Scan</span>
              </h1>
              <p className="mt-0.5 text-xs font-medium tracking-[0.24em] text-emerald-50/90 uppercase">
                Quran Finder
              </p>
            </div>
          </div>

          <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-white drop-shadow sm:text-2xl">
            Trouvez facilement les versets du Coran
            <span className="block italic">par votre voix</span>
          </p>
          <div className="mt-5 h-px w-44 bg-gradient-to-r from-transparent via-[#e3bd70] to-transparent" />
        </header>

        <section
          aria-label="Recherche vocale"
          className="mx-auto mt-9 flex max-w-3xl flex-col items-center rounded-[2rem] border border-[#d8b66e] bg-[#fbf8ef]/95 px-5 py-7 text-center text-[#073b30] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-md sm:mt-12 sm:px-10 sm:py-9"
        >
          <p dir="rtl" className="text-2xl leading-relaxed text-[#8a672c] sm:text-3xl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <div className="my-3 h-px w-48 bg-gradient-to-r from-transparent via-[#c49a4a] to-transparent" />
          <p className="mb-5 text-base font-semibold sm:text-lg">
            Touchez ﷽ pour commencer
          </p>

          <div className="rounded-full p-2 ring-1 ring-[#d6b56d]/50">
            <BasmalaButton onClick={startListening} listening={listening} />
          </div>

          <p className="mt-4 max-w-md text-sm text-[#31594d]">
            Récitez un passage du Coran naturellement. AyaScan recherche les versets correspondants.
          </p>
          <div aria-live="polite" className="mt-3 min-h-6 text-sm font-semibold text-[#8a672c]">
            {status}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {listening && (
              <button
                onClick={stopListening}
                className="rounded-full border border-red-300 bg-red-50 px-6 py-2.5 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100"
              >
                ■ Arrêter
              </button>
            )}
            <button
              onClick={clearResults}
              className="rounded-full border border-[#b99a5b] bg-white/70 px-6 py-2.5 text-sm font-semibold text-[#174b3d] transition-colors hover:bg-white"
            >
              Effacer
            </button>
          </div>
        </section>

        {transcript && (
          <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/20 bg-[#062b24]/80 p-5 text-center shadow-lg backdrop-blur-md">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#e3bd70]">
              Texte reconnu
            </h2>
            <p dir="rtl" className="text-2xl leading-loose text-white">
              {transcript}
            </p>
          </section>
        )}

        {bestMatch && (
          <div className="mx-auto mt-8 max-w-3xl">
            <BestMatchCard
              surahName={
                surahNames[
                  bestMatch.verse.surahNumber as keyof typeof surahNames
                ]
              }
              surahArabic={bestMatch.verse.surahArabic}
              surahNumber={bestMatch.verse.surahNumber}
              ayah={bestMatch.verse.ayah}
              arabic={bestMatch.verse.arabic}
              confidence={bestMatch.score}
              isFavorite={bestMatchIsFavorite}
              onToggleFavorite={() => toggleFavorite(bestMatch)}
            />
          </div>
        )}

        {results.length > 1 && (
          <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/15 bg-[#062b24]/85 p-5 shadow-lg backdrop-blur-md">
            <h2 className="mb-5 text-xl font-bold text-[#f0d28f]">
              Autres résultats possibles
            </h2>
            <div className="grid gap-3">
              {results.slice(1).map((result, index) => (
                <div
                  key={`${result.verse.surahNumber}-${result.verse.ayah}`}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      #{index + 2} · {surahNames[result.verse.surahNumber as keyof typeof surahNames]}
                    </p>
                    <span className="text-sm text-[#e3bd70]">{result.score}%</span>
                  </div>
                  <p className="mt-1 text-sm text-emerald-100/80">
                    Verset {result.verse.ayah}
                  </p>
                  <p dir="rtl" className="mt-3 text-xl leading-loose text-white">
                    {result.verse.arabic}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <FavoritesPanel favorites={favorites} onRemove={removeFavorite} />
          <HistoryPanel
            history={history}
            onRemove={removeHistoryItem}
            onClear={clearHistory}
          />
        </div>

        <footer className="mt-10 text-center text-xs text-emerald-50/75">
          <p className="text-sm italic text-white/90">
            « Nous t'avons certes fait descendre le Coran, pour que tu en fasses une lecture aux gens. »
          </p>
          <p className="mt-2 text-[#e3bd70]">Sourate 17, verset 105</p>
          <p className="mt-5">
            Photographie : V. Epiney ·{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Masjid_Kristal_(Kuala_Terengganu)_(10498676193).jpg"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-white"
            >
              Wikimedia Commons, licence CC BY-SA 2.0
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
