


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
  occurrences?: Verse[];
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
  onerror: ((event: { error: string }) => void) | null;
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

      // Variantes phonétiques fréquentes dans les transcriptions vocales.
      // Le coût reste non nul pour éviter de confondre systématiquement les lettres.
      const letterPair = a[i - 1] + b[j - 1];

      if (["قك", "كق"].includes(letterPair)) {
        substitutionCost = 0.45;
      } else if (
        ["تث", "ثت", "ذز", "زذ", "ظض", "ضظ", "سص", "صس"].includes(letterPair)
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
  const shouldContinueListeningRef = useRef(false);
  const sessionBaseTranscriptRef = useRef("");
  const transcriptRef = useRef("");
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 
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

    // Cache temporaire des similarités calculées pendant cette recherche.
    const similarityCache = new Map<string, number>();

    const getCachedSimilarity = (first: string, second: string) => {
      const key = first + "\u0000" + second;
      const cached = similarityCache.get(key);

      if (cached !== undefined) {
        return cached;
      }

      const similarity = wordSimilarity(first, second);
      similarityCache.set(key, similarity);
      return similarity;
    };

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

          const candidateWord = verseTokens[wordIndex];

          if (inputWord === candidateWord) {
            bestSimilarity = 1;
            bestIndex = wordIndex;
            break;
          }

          const similarity = getCachedSimilarity(inputWord, candidateWord);

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

    // Regrouper les versets au texte arabe intégral identique.
    const groupedMatches = new Map<string, SearchResult>();

    for (const match of matches) {
      const verseKey = normalizeArabic(match.verse.arabic);
      const existingMatch = groupedMatches.get(verseKey);

      if (existingMatch) {
        existingMatch.occurrences = [
          ...(existingMatch.occurrences ?? [existingMatch.verse]),
          match.verse,
        ];
        existingMatch.score = Math.max(existingMatch.score, match.score);
      } else {
        groupedMatches.set(verseKey, {
          ...match,
          occurrences: [match.verse],
        });
      }
    }

    const rankedResults = [...groupedMatches.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Une transcription intermédiaire moins bonne ne remplace pas
    // une correspondance déjà plus fiable.
    if (rankedResults.length > 0) {
      setResults((current) => {
        if (current[0] && current[0].score > rankedResults[0].score) {
          return current;
        }
        return rankedResults;
      });

      const newBest = rankedResults[0];
      const previousBest = latestBestResultRef.current;
      if (!previousBest || newBest.score >= previousBest.score) {
        latestBestResultRef.current = newBest;
      }
    }
  };

  // Créer une session de reconnaissance vocale.
  // Le navigateur peut interrompre une session après une pause : on la relance
  // automatiquement en conservant le texte déjà reconnu.
  const startRecognitionSession = () => {
    if (!shouldContinueListeningRef.current || recognitionRef.current) {
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: new () => RecognitionType;
      webkitSpeechRecognition?: new () => RecognitionType;
    };

    const SpeechRecognitionConstructor =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      shouldContinueListeningRef.current = false;
      setListening(false);
      setStatus("❌ Reconnaissance vocale non supportée.");
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognitionRef.current = recognition;
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      if (recognitionRef.current !== recognition) return;

      const sessionText = Array.from(
        { length: event.results.length },
        (_, index) => event.results[index][0].transcript
      ).join(" ").trim();

      const recognizedText = [
        sessionBaseTranscriptRef.current,
        sessionText,
      ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

      if (!recognizedText) return;

      transcriptRef.current = recognizedText;
      setTranscript(recognizedText);
      findVerse(recognizedText);
      setStatus("🎙️ Récitation reconnue. Écoute en cours...");
    };

    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) return;

      const errorMessages: Record<string, string> = {
        "not-allowed": "❌ Accès au microphone refusé. Autorisez le microphone dans votre navigateur.",
        "service-not-allowed": "❌ Le service de reconnaissance vocale n'est pas autorisé.",
        "audio-capture": "❌ Aucun microphone utilisable n'a été détecté.",
        "no-speech": "Pause détectée. AyaScan conserve votre récitation et reprend l'écoute...",
        network: "❌ Problème de connexion au service vocal. Vérifiez votre connexion puis réessayez.",
        "language-not-supported": "❌ La reconnaissance arabe n'est pas disponible dans ce navigateur.",
        aborted: "Écoute interrompue. Vous pouvez reprendre votre récitation.",
      };

      if (event.error === "no-speech") {
        setStatus(errorMessages[event.error]);
        return;
      }

      shouldContinueListeningRef.current = false;
      recognitionRef.current = null;
      saveBestResultToHistory();
      setListening(false);
      setStatus(
        errorMessages[event.error] ??
        "❌ La reconnaissance vocale a rencontré un problème. Vous pouvez réessayer."
      );
    };

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;

      recognitionRef.current = null;

      if (shouldContinueListeningRef.current) {
        sessionBaseTranscriptRef.current = transcriptRef.current;
        setStatus("Reprise de l'écoute...");

        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }

        restartTimeoutRef.current = setTimeout(() => {
          restartTimeoutRef.current = null;
          startRecognitionSession();
        }, 350);
        return;
      }

      saveBestResultToHistory();
      setListening(false);
      setStatus("⏹️ Écoute terminée.");
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      shouldContinueListeningRef.current = false;
      saveBestResultToHistory();
      setListening(false);
      setStatus("❌ Impossible de démarrer le microphone.");
    }
  };

  // Effacer les résultats et annuler toute reprise automatique.
  const clearResults = () => {
    shouldContinueListeningRef.current = false;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) recognition.stop();

    latestBestResultRef.current = null;
    transcriptRef.current = "";
    sessionBaseTranscriptRef.current = "";
    setListening(false);
    setTranscript("");
    setResults([]);
    setStatus("Touchez ﷽ pour commencer.");
  };

  // Arrêter l'écoute sans effacer le texte ni les résultats.
  const stopListening = () => {
    shouldContinueListeningRef.current = false;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    saveBestResultToHistory();

    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) recognition.stop();

    setListening(false);
    setStatus("⏹️ Récitation arrêtée.");
  };

  // Démarrer une nouvelle récitation.
  const startListening = () => {
    if (recognitionRef.current || shouldContinueListeningRef.current) return;

    shouldContinueListeningRef.current = true;
    transcriptRef.current = "";
    sessionBaseTranscriptRef.current = "";
    latestBestResultRef.current = null;

    setListening(true);
    setStatus("🔊 Écoute en cours...");
    setResults([]);
    setTranscript("");
    startRecognitionSession();
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

            {listening && (
              <button
                onClick={stopListening}
                className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-600 transition-colors"
              >
                ■ Arrêter
              </button>
            )}

            <button
              onClick={clearResults}
              className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors"
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
              occurrences={(bestMatch.occurrences ?? [])
                .filter(
                  (verse) =>
                    verse.surahNumber !== bestMatch.verse.surahNumber ||
                    verse.ayah !== bestMatch.verse.ayah
                )
                .map((verse) => ({
                  surahNumber: verse.surahNumber,
                  ayah: verse.ayah,
                  surahName:
                    surahNames[verse.surahNumber as keyof typeof surahNames] ??
                    `Sourate ${verse.surahNumber}`,
                }))}
              isFavorite={bestMatchIsFavorite}
              onToggleFavorite={() => toggleFavorite(bestMatch)}
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

        <FavoritesPanel
          favorites={favorites}
          onRemove={removeFavorite}
        />
<HistoryPanel
  history={history}
  onRemove={removeHistoryItem}
  onClear={clearHistory}
/>
        <div className="mt-12 text-center text-slate-500 text-sm">
          Corpus chargé : {quranVerses.length} versets
        </div>

      </div>

    </main>
  );
}
