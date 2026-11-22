import fs from "node:fs";
import path from "node:path";

const sourceFile = path.join(
  process.cwd(),
  "app",
  "data",
  "quran-simple-imlaai.json"
);

const outputFile = path.join(
  process.cwd(),
  "app",
  "data",
  "quran.json"
);

const data = JSON.parse(
  fs.readFileSync(sourceFile, "utf8")
);

const verses = [];

for (const surah of data.surahs) {
  const surahNumber = surah.number ?? null;

  const surahArabic =
    surah.name ||
    surah.arabicName ||
    surah.arabic ||
    "";

  const surahLatin =
    surah.transliteration ||
    surah.latinName ||
    surah.englishName ||
    "";

  for (const ayah of surah.ayahs) {
    verses.push({
      surahNumber,
      surahLatin,
      surahArabic,
      ayah: ayah.number,
      arabic: ayah.text,
      translation: ""
    });
  }
}

fs.writeFileSync(
  outputFile,
  JSON.stringify(verses, null, 2),
  "utf8"
);

console.log(
  `✅ ${verses.length} versets exportés`
);

console.log("\nPremier verset :");
console.log(verses[0]);

console.log("\nDernier verset :");
console.log(verses[verses.length - 1]);