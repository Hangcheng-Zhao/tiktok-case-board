import { Step } from "./types";

export const STEPS: Step[] = [
  {
    id: 0,
    pasture: "Opening",
    question: '"TikTok is..." (complete the sentence)',
    type: "sentiment",
  },
  {
    id: 1,
    pasture: "Pasture 1: TikTok's Rise",
    question: "What factors contributed to TikTok's rapid rise?",
    type: "text",
  },
  {
    id: 2,
    pasture: "Pasture 1: TikTok's Rise",
    question:
      "How does TikTok's interface design support its algorithmic approach?",
    type: "text",
  },
  {
    id: 3,
    pasture: "Pasture 1: TikTok's Rise",
    question:
      "Why is the 'cold start pool' system so critical to TikTok's growth?",
    type: "text",
  },
  {
    id: 4,
    pasture: "Pasture 2: Business Model",
    question: "Key components of TikTok's business model?",
    type: "text",
  },
  {
    id: 5,
    pasture: "Pasture 2: Business Model",
    question: "Can anyone effectively copy TikTok's model? Barriers?",
    type: "text",
  },
  {
    id: 6,
    pasture: "Pasture 2: Business Model",
    question:
      "If you were Facebook, would you adopt a TikTok-like model?",
    type: "text",
  },
  {
    id: 7,
    pasture: "Pasture 3a: Douyin vs TikTok",
    question: "How does Douyin differ from global TikTok?",
    type: "text",
  },
  {
    id: 8,
    pasture: "Pasture 3b: Regulation",
    question: "Should TikTok be banned in the U.S.?",
    type: "poll",
    pollOptions: [
      "A) Yes, ban it entirely",
      "B) No, allow it to operate freely",
      "C) Restrict it with conditions",
    ],
  },
  {
    id: 9,
    pasture: "Pasture 3b: Regulation",
    question: "Would you restrict other social media companies similarly?",
    type: "text",
  },
  {
    id: 10,
    pasture: "Pasture 3b: Regulation",
    question: "What regulatory approach would best address concerns?",
    type: "text",
  },
];

export const PASTURES = [
  { name: "Opening", color: "bg-purple-600", steps: [0] },
  { name: "Pasture 1: TikTok's Rise", color: "bg-blue-600", steps: [1, 2, 3] },
  { name: "Pasture 2: Business Model", color: "bg-green-600", steps: [4, 5, 6] },
  { name: "Pasture 3: Douyin, TikTok & Regulation", color: "bg-orange-500", steps: [7, 8, 9, 10] },
];
