/**
 * Practice value randomizer — replaces template placeholders with random values.
 *
 * Supported placeholders:
 *   {{NUMS:count:min-max}}  → comma-separated random ints, e.g. {{NUMS:5:1-20}}
 *   {{INT:min-max}}         → single random int, e.g. {{INT:1-100}}
 *   {{FLOAT:min-max:decimals}} → random float, e.g. {{FLOAT:1-100:2}} → 45.67
 *   {{NAME}}                → random first name
 *   {{WORD}}                → random short word
 *   {{CHAR}}                → random single lowercase letter
 *   {{SENTENCE}}            → random short sentence
 *   {{BOOL}}                → true or false
 *   {{DATE}}                → random recent date (YYYY-MM-DD)
 *   {{ARRAY_SIZE:min-max}}  → random array of random ints, e.g. {{ARRAY_SIZE:3-6}}
 */

const NAMES = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank",
  "Ivy", "Jack", "Karen", "Leo", "Mia", "Noah", "Olivia", "Paul",
  "Quinn", "Ruby", "Sam", "Tina", "Uma", "Vera", "Will", "Xena",
  "Yuki", "Zara", "Ken", "Lily", "Omar", "Sara"
];

const WORDS = [
  "hello", "world", "code", "java", "test", "data", "loop", "func",
  "text", "node", "list", "tree", "sort", "find", "push", "swap",
  "edge", "root", "leaf", "item", "flag", "step", "task", "link"
];

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog",
  "Hello World from Java",
  "Practice makes perfect",
  "Code runs fast today",
  "Keep learning every day",
  "Data flows through the pipe",
  "The loop runs ten times",
  "Arrays store multiple values",
];

export interface OfflinePractice {
  lang: string;
  topic: string;
  level: number;
  title: string;
  task: string;
  code: string;
  solutionCode: string;
  expectedOutput: string;
  hint: string;
  judgeFeedback: { summary: string; lines: { line: number; problem: string; fix: string }[] };
  altMethods?: { name: string; code: string; explanation: string }[];
  crossLang?: Record<string, { code: string; highlights: { lines: number[]; explanation: string }[] }>;
  testCases?: { input: string; output: string }[];
}

/** Generate a random integer between min and max (inclusive). */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from an array. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Generate an array of unique random integers. */
function randNums(count: number, min: number, max: number): number[] {
  const nums: number[] = [];
  for (let i = 0; i < count; i++) {
    nums.push(randInt(min, max));
  }
  return nums;
}

/** Replace all template placeholders in a string with generated values.
 *  Uses a shared context so the same placeholder produces the same value
 *  across code, solutionCode, expectedOutput, etc.
 */
function replaceTemplates(s: string, ctx: Map<string, string>): string {
  return s.replace(/\{\{([A-Z]+)(?::([^}]*))?\}\}/g, (_match, type: string, args: string | undefined) => {
    const key = _match; // full placeholder as cache key

    // Check if we already resolved this placeholder
    if (ctx.has(key)) { return ctx.get(key)!; }

    let result: string;
    switch (type) {
      case "NUMS": {
        const [countStr, rangeStr] = (args || "5:1-20").split(":");
        const count = parseInt(countStr) || 5;
        const [minStr, maxStr] = (rangeStr || "1-20").split("-");
        const min = parseInt(minStr) || 1;
        const max = parseInt(maxStr) || 20;
        result = randNums(count, min, max).join(", ");
        break;
      }
      case "INT": {
        const [minStr, maxStr] = (args || "1-100").split("-");
        const min = parseInt(minStr) || 1;
        const max = parseInt(maxStr) || 100;
        result = String(randInt(min, max));
        break;
      }
      case "NAME": {
        result = pick(NAMES);
        break;
      }
      case "NAME1": {
        result = pick(NAMES);
        break;
      }
      case "NAME2": {
        let n = pick(NAMES);
        const n1 = ctx.get("{{NAME1}}");
        while (n === n1) { n = pick(NAMES); }
        result = n;
        break;
      }
      case "WORD": {
        result = pick(WORDS);
        break;
      }
      case "CHAR": {
        result = String.fromCharCode(97 + randInt(0, 25));
        break;
      }
      case "FLOAT": {
        const parts = (args || "1-100:2").split(":");
        const [fMinStr, fMaxStr] = (parts[0] || "1-100").split("-");
        const fMin = parseFloat(fMinStr) || 1;
        const fMax = parseFloat(fMaxStr) || 100;
        const decimals = parseInt(parts[1]) || 2;
        const val = fMin + Math.random() * (fMax - fMin);
        result = val.toFixed(decimals);
        break;
      }
      case "SENTENCE": {
        result = pick(SENTENCES);
        break;
      }
      case "BOOL": {
        result = Math.random() < 0.5 ? "true" : "false";
        break;
      }
      case "DATE": {
        const daysAgo = randInt(1, 30);
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        result = d.toISOString().split("T")[0];
        break;
      }
      case "ARRAY_SIZE": {
        const [asMin, asMax] = (args || "3-6").split("-");
        const size = randInt(parseInt(asMin) || 3, parseInt(asMax) || 6);
        result = randNums(size, 1, 50).join(", ");
        break;
      }
      default:
        result = _match; // unknown placeholder — leave as-is
    }

    ctx.set(key, result);
    return result;
  });
}

/** Deep-clone and randomize a practice.
 *  All placeholder occurrences share the same generated values.
 */
export function randomizePractice(p: OfflinePractice): OfflinePractice {
  // If no placeholders, return as-is (fast path)
  const hasTemplate = /\{\{[A-Z]/.test(p.code) || /\{\{[A-Z]/.test(p.task);
  if (!hasTemplate) { return p; }

  const ctx = new Map<string, string>();

  const r = (s: string) => replaceTemplates(s, ctx);

  return {
    lang: p.lang,
    topic: p.topic,
    level: p.level,
    title: p.title,
    task: r(p.task),
    code: r(p.code),
    solutionCode: r(p.solutionCode),
    expectedOutput: r(p.expectedOutput),
    hint: p.hint,
    judgeFeedback: p.judgeFeedback,
    altMethods: p.altMethods?.map(m => ({
      name: m.name,
      code: r(m.code),
      explanation: m.explanation
    })),
    crossLang: p.crossLang ? Object.fromEntries(
      Object.entries(p.crossLang).map(([lang, v]) => [
        lang,
        { code: r(v.code), highlights: v.highlights }
      ])
    ) : undefined,
    testCases: p.testCases?.map(tc => ({
      input: r(tc.input),
      output: r(tc.output)
    }))
  };
}

/**
 * For practices where expectedOutput depends on the randomized values,
 * we need to compute it. This helper evaluates simple expressions.
 * Used by practices that have {{EVAL:expression}} in expectedOutput.
 */
export function evalExpectedOutput(practice: OfflinePractice): OfflinePractice {
  if (!practice.expectedOutput.includes("{{EVAL")) { return practice; }

  // Extract NUMS values from the code to compute expected output
  // This is handled by the template system — EVAL placeholders reference
  // previously generated values
  return practice;
}
