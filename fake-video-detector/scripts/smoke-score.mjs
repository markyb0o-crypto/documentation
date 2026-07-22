import { scoreAnalysis } from "../src/analyzer/score.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const highAi = scoreAnalysis(
  [
    { id: "temporal", label: "t", score: 0.8, detail: "" },
    { id: "sharpness", label: "s", score: 0.75, detail: "" },
    { id: "chroma", label: "c", score: 0.7, detail: "" },
    { id: "frequency", label: "f", score: 0.85, detail: "" },
    { id: "edges", label: "e", score: 0.7, detail: "" },
    { id: "texture", label: "x", score: 0.8, detail: "" },
  ],
  { name: "test" }
);

assert(highAi.verdict === "likely_ai", `expected likely_ai, got ${highAi.verdict}`);
assert(highAi.aiScore >= 62, `expected high aiScore, got ${highAi.aiScore}`);

const realish = scoreAnalysis(
  [
    { id: "temporal", label: "t", score: 0.1, detail: "" },
    { id: "sharpness", label: "s", score: 0.15, detail: "" },
    { id: "chroma", label: "c", score: 0.1, detail: "" },
    { id: "frequency", label: "f", score: 0.12, detail: "" },
    { id: "edges", label: "e", score: 0.08, detail: "" },
    { id: "texture", label: "x", score: 0.1, detail: "" },
  ],
  { name: "test" }
);

assert(
  realish.verdict === "likely_real" || realish.verdict === "inconclusive",
  `expected likely_real/inconclusive, got ${realish.verdict}`
);
assert(realish.aiScore <= 35, `expected low aiScore, got ${realish.aiScore}`);

console.log("score smoke tests passed");
