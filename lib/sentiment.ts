// Auto-classify sentiment based on keyword matching
// Tailored for TikTok case discussion responses

const POSITIVE_KEYWORDS = [
  "creative", "creativity", "inclusive", "diverse", "diversity",
  "entertaining", "entertainment", "fun", "engaging", "engage",
  "discovery", "discover", "innovative", "innovation",
  "empowering", "empower", "expression", "expressive",
  "community", "connect", "connection", "accessible",
  "opportunity", "opportunities", "democratiz", "enabling",
  "inspiring", "inspiration", "educational", "learning",
  "viral", "popular", "growth", "amazing", "powerful",
  "platform for", "marketplace", "e-commerce", "commerce",
  "free", "easy", "cool", "great", "good", "love", "best",
  "revolutionary", "transformative", "disruptive",
];

const NEGATIVE_KEYWORDS = [
  "addictive", "addiction", "addicted", "dopamine",
  "distract", "distracting", "distraction", "time-consuming",
  "waste", "wasting", "toxic", "harmful", "harm", "damage",
  "manipulat", "exploit", "surveillance", "spy", "spying",
  "dangerous", "threat", "risk", "risky", "unsafe",
  "misinformation", "disinformation", "fake", "propaganda",
  "privacy", "data harvester", "data mining", "tracking",
  "censorship", "censor", "ban", "banned",
  "mental health", "anxiety", "depression", "lonely",
  "narcissi", "vanity", "shallow", "mindless",
  "chinese government", "ccp", "national security",
  "opium", "drug", "peddler", "predatory",
  "problematic", "concerning", "bad", "worst", "terrible",
  "annoying", "cringe", "overrated",
];

export function classifySentiment(text: string): "positive" | "negative" | "neutral" {
  const lower = text.toLowerCase();

  let positiveScore = 0;
  let negativeScore = 0;

  for (const kw of POSITIVE_KEYWORDS) {
    if (lower.includes(kw)) positiveScore++;
  }

  for (const kw of NEGATIVE_KEYWORDS) {
    if (lower.includes(kw)) negativeScore++;
  }

  if (positiveScore > negativeScore) return "positive";
  if (negativeScore > positiveScore) return "negative";
  return "neutral";
}
