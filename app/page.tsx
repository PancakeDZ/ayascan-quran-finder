


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
    "En attente de votre récitation."
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
    setStatus("En attente de votre récitation.");
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
    <main className="ayascan-page relative min-h-screen overflow-hidden text-white">
      <div aria-hidden="true" className="ayascan-background absolute inset-0" />
      <div aria-hidden="true" className="ayascan-overlay absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-8 pt-7 sm:px-8 sm:pt-9">
        <header className="relative flex flex-col items-center text-center">
          <div className="flex items-center gap-3 sm:gap-5">
            <svg aria-hidden="true" viewBox="0 0 100 82" className="h-16 w-20 text-[#f4c85f] sm:h-24 sm:w-28" fill="none">
              <path d="M50 18 45 5l5 7 5-7-5 13" fill="currentColor" />
              <path d="M8 57c15-3 26 0 42 13 16-13 27-16 42-13L81 29c-13-8-23-6-31 5-8-11-18-13-31-5L8 57Z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round"/>
              <path d="M50 34v36M14 49l28 12M86 49 58 61M19 37l22 15M81 37 59 52" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M5 63c16-4 29 1 45 15 16-14 29-19 45-15" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
            <div className="h-20 w-px bg-[#f4d37b]/90 sm:h-24" />
            <div className="text-left">
              <h1 className="font-serif text-5xl font-medium tracking-tight text-white drop-shadow sm:text-7xl">
                Aya<span className="text-[#f5d17a]">Scan</span>
              </h1>
              <p className="mt-0.5 text-center font-serif text-xl text-[#f5d17a] sm:text-2xl">
                Quran Finder
              </p>
            </div>
          </div>

          <div className="absolute right-0 top-0 hidden rounded-full border-2 border-[#e9bd4f] bg-[#064b39]/90 px-5 py-2 text-lg font-medium text-white shadow-lg sm:block">
            ◉ &nbsp; FR⌄
          </div>

          <p className="mt-8 max-w-2xl font-serif text-2xl italic leading-snug text-white drop-shadow-lg sm:mt-9 sm:text-4xl">
            Trouvez facilement les versets du Coran
            <span className="block">par votre voix</span>
          </p>
          <div className="mt-5 flex w-full max-w-lg items-center gap-3 text-[#f2c65e]">
            <span className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#f2c65e]" />
            <span className="text-3xl">✦</span>
            <span className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#f2c65e]" />
          </div>
        </header>

        <section
          aria-label="Recherche vocale"
          className="ayascan-glass mx-auto mt-9 flex max-w-3xl flex-col items-center rounded-[2.5rem] border-2 border-[#f2c65e] px-5 py-6 text-center text-[#064a38] shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:mt-12 sm:px-10 sm:py-7"
        >
          <p className="text-xl font-semibold leading-relaxed sm:text-2xl">
            <span className="text-[#07513c]">Touchez </span>
            <span dir="rtl" className="font-serif text-[#b07c12]">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
            <span className="text-[#07513c]"> pour commencer</span>
          </p>
          <div className="mt-5 rounded-full p-2 ring-1 ring-[#e8bd50]/80">
            <BasmalaButton onClick={startListening} listening={listening} />
          </div>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#315b4b]">
            Récitez un passage du Coran naturellement. AyaScan recherche les versets correspondants.
          </p>
          <div aria-live="polite" className="mt-3 min-h-6 text-sm font-semibold text-[#9b711d]">
            {status}
          </div>
          <div className="mt-4 flex w-full max-w-xl flex-wrap items-center justify-center gap-3 sm:gap-5">
            <button
              onClick={clearResults}
              className="flex min-w-48 items-center justify-center gap-3 rounded-full border-2 border-[#e8b83d] bg-white/55 px-6 py-3 text-base font-semibold text-[#07513c] shadow-md transition hover:bg-white/80"
            >
              <span aria-hidden="true" className="text-xl">▣</span>
              Effacer
            </button>
            {listening && (
              <>
                <span aria-hidden="true" className="hidden h-11 w-px bg-[#d9ad46] sm:block" />
                <button
                  onClick={stopListening}
                  className="flex min-w-48 items-center justify-center gap-3 rounded-full border-2 border-[#07513c] bg-[#fffdf5]/75 px-6 py-3 text-base font-semibold text-[#07513c] shadow-md transition hover:bg-white"
                >
                  <span aria-hidden="true" className="text-xl">■</span>
                  Arrêter
                </button>
              </>
            )}
          </div>
        </section>

        {transcript && (
          <section className="mx-auto mt-7 max-w-3xl rounded-2xl border border-[#e9c66b]/70 bg-[#064735]/85 p-5 text-center shadow-lg backdrop-blur-md">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4ce72]">
              Texte reconnu
            </h2>
            <p dir="rtl" className="text-2xl leading-loose text-white">{transcript}</p>
          </section>
        )}

        {bestMatch && (
          <div className="mx-auto mt-7 max-w-3xl">
            <BestMatchCard
              surahName={surahNames[bestMatch.verse.surahNumber as keyof typeof surahNames]}
              surahArabic={bestMatch.verse.surahArabic}
              surahNumber={bestMatch.verse.surahNumber}
              ayah={bestMatch.verse.ayah}
              arabic={bestMatch.verse.arabic}
              translation={bestMatch.verse.translation}
              confidence={bestMatch.score}
              isFavorite={bestMatchIsFavorite}
              onToggleFavorite={() => toggleFavorite(bestMatch)}
            />
          </div>
        )}

        {results.length > 1 && (
          <section className="mx-auto mt-7 max-w-3xl rounded-2xl border border-[#e9c66b]/50 bg-[#064735]/90 p-5 shadow-lg backdrop-blur-md sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#f4ce72]">Autres résultats possibles</h2>
            <div className="grid gap-3">
              {results.slice(1).map((result, index) => (
                <div key={`${result.verse.surahNumber}-${result.verse.ayah}`} className="rounded-xl border border-white/15 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-white">#{index + 2} · {surahNames[result.verse.surahNumber as keyof typeof surahNames]}</p>
                    <span className="text-sm text-[#f4ce72]">{result.score}%</span>
                  </div>
                  <p className="mt-1 text-sm text-emerald-100/80">Verset {result.verse.ayah}</p>
                  <p dir="rtl" className="mt-3 text-xl leading-loose text-white">{result.verse.arabic}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-9 grid gap-5 lg:grid-cols-2">
          <FavoritesPanel favorites={favorites} onRemove={removeFavorite} />
          <HistoryPanel history={history} onRemove={removeHistoryItem} onClear={clearHistory} />
        </div>

        <footer className="mx-auto mt-10 max-w-2xl text-center font-serif">
          <p className="text-xl italic leading-relaxed text-white drop-shadow sm:text-2xl">
            « Nous t'avons certes fait descendre le Coran,<br className="hidden sm:block" /> pour que tu en fasses une lecture aux gens. »
          </p>
          <p className="mt-3 text-lg font-semibold text-[#f5c84f]">Sourate 17, Verset 105</p>
          <div className="mx-auto mt-7 h-2 max-w-xl rounded-full border-y border-[#eac35b] bg-[#064735]/80" />
        </footer>
      </div>
    </main>
  );
}
