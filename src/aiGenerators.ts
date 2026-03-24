import * as vscode from "vscode";
import { getResponseLang, makeAiRequest, t } from "./aiHelpers";
import { parseCompileError, escapeHtml, parseMeta, stripCodeBlocks, unescapeCodeLiterals } from "./parsers";
import { practiceFilename } from "./constants";
import { checkDemoMode } from "./demoData";

export type SolutionResult = { code: string; explanation: string };

/** バグ修正練習 — bug fix practice types */
export interface BugFixResult {
  title: string;
  description: string;       // what the code SHOULD do
  buggyCode: string;
  bugHint: string;
  bugExplanation: string;
  expectedOutput: string;
  sourceRepo: string;
  filename: string;
}

function fallbackBugExplanation(uiLang: string, bugHint: string): string {
  if (bugHint && bugHint.trim()) {
    return bugHint.trim();
  }
  if (uiLang === "ja") {
    return "ロジックの不整合を見つけ、条件式や更新処理を見直して修正してください。";
  }
  if (uiLang === "tr") {
    return "Mantık hatasını bulup koşulu veya güncelleme adımını düzelterek sorunu giderin.";
  }
  return "Find the logic mistake and fix the condition or update step causing the wrong result.";
}

function fallbackCrossLanguageHighlights(
  sourceLang: string,
  targetLang: string,
  code: string,
  uiLang: string
): { lines: number[]; explanation: string }[] {
  const firstContentLine = code.split("\n").findIndex(line => line.trim().length > 0) + 1;
  const lineNum = firstContentLine > 0 ? firstContentLine : 1;
  const explanation = uiLang === "ja"
    ? `${targetLang} では ${sourceLang} と構文や標準ライブラリの使い方が異なります。`
    : uiLang === "tr"
    ? `${targetLang}, ${sourceLang}'dan farklı sözdizimi ve standart kütüphane kullanımı içerir.`
    : `${targetLang} uses different syntax and standard library patterns than ${sourceLang}.`;
  return [{ lines: [lineNum], explanation }];
}

export async function generateBugFromRealCode(
  sourceCode: string,
  lang: string,
  topic: string,
  level: number,
  repo: string
): Promise<BugFixResult> {
  const uiLang = getResponseLang();
  const langNote = uiLang === "tr"
    ? "\nIMPORTANT: Write TITLE, DESCRIPTION, BUG_HINT, BUG_EXPLANATION in Turkish. Code stays in English."
    : uiLang === "ja"
    ? "\nIMPORTANT: Write TITLE, DESCRIPTION, BUG_HINT, BUG_EXPLANATION in Japanese. Code stays in English."
    : "";

  const sizeGuide = level <= 2
    ? "Extract a single function/method (30-80 lines). Keep it simple."
    : level <= 4
    ? "Extract a class or multiple related functions (80-200 lines)."
    : "Extract a larger section with multiple methods (150-300 lines).";

  const bugGuide = level <= 1
    ? "Simple bug: off-by-one error, wrong comparison operator (< vs <=), or typo in variable name."
    : level <= 2
    ? "Easy bug: wrong operator, missing null check, or incorrect loop boundary."
    : level <= 3
    ? "Medium bug: wrong variable used, logic error in condition (AND vs OR), missing return."
    : level <= 4
    ? "Hard bug: subtle edge case, incorrect string comparison (== vs .equals()), missing break in switch."
    : "Tricky bug: race condition hint, off-by-one in nested loops, wrong data structure usage.";

  const complexityGuide = level <= 1
    ? `COMPLEXITY LIMIT (Level 1 — Beginner):
- Use ONLY: basic for/while loops, if/else, arrays, simple math, String methods
- Do NOT use: generics, streams, lambdas, advanced interfaces (Appendable, Iterable), bitwise ops, try/catch, inner classes, enums, abstract classes
- The code must be understandable by someone who just learned ${lang} basics
- Pick the SIMPLEST function from the source code — basic array/string manipulation, simple calculations`
    : level <= 2
    ? `COMPLEXITY LIMIT (Level 2 — Elementary):
- OK to use: basic collections (ArrayList, HashMap), simple methods, basic OOP
- Do NOT use: generics with bounds (<T extends ...>), streams, lambdas, complex interfaces, reflection, concurrency
- Pick a straightforward utility function from the source code`
    : level <= 3
    ? `COMPLEXITY (Level 3 — Intermediate):
- OK to use: generics, collections, interfaces, enums, basic exception handling
- Keep it readable — no deeply nested logic or obscure APIs`
    : level <= 4
    ? `COMPLEXITY (Level 4 — Advanced):
- OK to use most language features including generics, streams, functional patterns
- Real production complexity is fine`
    : `COMPLEXITY (Level 5 — Expert):
- Full production code complexity. Multiple interacting methods, advanced patterns.`;

  const filename = practiceFilename(lang);

  const classNameRule = lang === "Java"
    ? "\n- The main class MUST be named 'Practice' (rename from source)"
    : "";

  const noScannerRule = lang === "Java"
    ? "\n- Do NOT use Scanner. Hardcode all test data."
    : "";

  const systemPrompt =
    "You create debug exercises by modifying REAL open-source code. " +
    "You MUST use the provided source code as the basis — do NOT invent new code from scratch. " +
    "Return ONLY the requested format. No extra text.";

  const userPrompt = `Below is REAL production code from the open-source project "${repo}".
Your job is to take THIS actual code, adapt it into a runnable exercise, and inject ONE bug.

=== SOURCE CODE FROM ${repo} ===
\`\`\`${lang.toLowerCase()}
${sourceCode.slice(0, 8000)}
\`\`\`
=== END SOURCE CODE ===

CRITICAL RULES — READ CAREFULLY:
1. You MUST use the ACTUAL logic, algorithms, and patterns from the source code above
2. Do NOT write a trivially simple replacement. The code should clearly look like it came from a real project
3. Keep the real variable names, method signatures, and logic from the source (rename the class if needed)
4. ${sizeGuide}
5. Add a main method with hardcoded test data so the code can run standalone and produce output
6. Introduce exactly ONE logic bug: ${bugGuide}
7. The bug must make the code compile and run, but produce WRONG output — test this mentally before returning!
8. Do NOT add comments pointing to the bug
9. The code MUST compile as-is — include ALL necessary imports (java.util.*, java.io.*, etc.)${classNameRule}${noScannerRule}

${complexityGuide}

WHAT MAKES A GOOD EXERCISE:
- The student sees real-world code patterns adapted to their level
- The logic is meaningful: real algorithms, real data processing, real utility methods
- The bug is embedded in the real logic, not in a trivial print statement
- If the source code is too complex for this level, simplify the ALGORITHM while keeping the real purpose

Topic hint: ${topic}

Return EXACTLY in this format:
TITLE: (short title describing the code's purpose)
DESCRIPTION: (what the code is supposed to do — describe the real algorithm/logic)
\`\`\`${lang.toLowerCase()}
[complete runnable code based on the REAL source above, with ONE intentional bug]
\`\`\`
BUG_HINT: (vague hint about where to look — do NOT reveal the answer)
BUG_EXPLANATION: (exactly what the bug is and how to fix it)
EXPECTED_OUTPUT: (correct output after the bug is fixed)${langNote}`;

  const content = await makeAiRequest(systemPrompt, userPrompt);

  // Parse using the meta parser for structured fields
  const parsed = parseMeta(content);

  // Extract code from fences
  const codeMatch = content.match(/```[\w]*\n?([\s\S]*?)```/);
  const buggyCode = codeMatch ? codeMatch[1].trim() : "";

  return {
    title: parsed.title || `${lang} Bug Fix - ${topic}`,
    description: parsed.description || parsed.task || "Find and fix the bug in this code.",
    buggyCode,
    bugHint: parsed.bugHint || parsed.hint || "Look carefully at the logic.",
    bugExplanation: parsed.bugExplanation || fallbackBugExplanation(uiLang, parsed.bugHint || parsed.hint || ""),
    expectedOutput: parsed.expectedOutput || "",
    sourceRepo: repo,
    filename
  };
}

/** 別解生成 — alternative methods */
export interface AlternativeMethod {
  name: string;
  code: string;
  explanation: string;
  speedPercent: number; // relative speed: 100 = baseline, 150 = 50% faster
  durationMs?: number;  // actual measured execution time
}

function cleanAlternativeMethodCode(rawCode: string): string {
  let code = rawCode || "";
  code = unescapeCodeLiterals(code);
  const fenceMatch = code.match(/```[\w]*\n?([\s\S]*?)```/);
  if (fenceMatch) { code = fenceMatch[1]; }
  if (code.length > 100 && !code.includes("\n")) {
    code = code
      .replace(/;\s*/g, ";\n")
      .replace(/\{\s*/g, "{\n")
      .replace(/\}\s*/g, "}\n")
      .replace(/import\s/g, "\nimport ");
  }
  return code.trim();
}

function normalizeAlternativeMethodFingerprint(code: string): string {
  return cleanAlternativeMethodCode(code)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generate alternative ways to solve a practice exercise.
 * Returns 2-4 methods with code, explanation, and relative speed comparison.
 */
export async function generateAlternativeMethods(
  lang: string,
  task: string,
  currentCode: string
): Promise<AlternativeMethod[]> {
  const studentMethod: AlternativeMethod = {
    name: "Student's Approach",
    code: cleanAlternativeMethodCode(currentCode),
    explanation: "Baseline implementation using the current solution structure.",
    speedPercent: 100,
  };

  const systemPrompt =
    "You are a senior developer showing different ways to solve a coding exercise. " +
    "Return ONLY a JSON array of 2-4 alternative methods. Each object has: " +
    '"name" (short method name like "Stream API" or "For Loop"), ' +
    '"code" (complete working code — full class with main), ' +
    '"explanation" (1-2 sentences on the approach), ' +
    '"speedPercent" (relative speed where 100 = the student\'s approach, higher = faster). ' +
    "No markdown, no code fences around the JSON. ONLY the JSON array.";

  const userPrompt =
    `LANGUAGE: ${lang}\n` +
    `TASK: ${task}\n\n` +
    `STUDENT'S CODE:\n${currentCode}\n\n` +
    "Show 2-4 different approaches to solve this exact task. " +
    "Include the student's approach as the first method (speedPercent: 100). " +
    "Then show better/different ways: e.g. stream API, enhanced for-each, recursion, functional style, etc. " +
    "Each code must produce the SAME output.\n" +
    "IMPORTANT for Java: Each 'code' must be a COMPLETE compilable file. " +
    "Use 'public class Practice' as the class name in ALL alternatives. " +
    "NO package declaration. Include ALL necessary imports (java.util.*, etc.).\n" +
    "IMPORTANT: Use proper indentation (4 spaces for Java, 2 spaces for TypeScript).\n\n" +
    "Return JSON array: [{ name, code, explanation, speedPercent }, ...]";

  const rawResponse = await makeAiRequest(systemPrompt, userPrompt);

  // Extract JSON array
  const trimmed = rawResponse.trim();
  let jsonStr = trimmed;
  if (!trimmed.startsWith("[")) {
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    } else {
      const first = trimmed.indexOf("[");
      const last = trimmed.lastIndexOf("]");
      if (first !== -1 && last > first) {
        jsonStr = trimmed.slice(first, last + 1);
      }
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      const methods = parsed
        .filter((m: any) => m && typeof m === "object" && typeof m.code === "string" && m.code.trim().length > 0)
        .map((m: any) => {
          let explanation = (m.explanation || "");
          explanation = explanation.replaceAll("\\n", "\n");
          return {
            name: typeof m.name === "string" ? m.name : "Method",
            code: cleanAlternativeMethodCode(m.code || ""),
            explanation: explanation.trim(),
            speedPercent: Number(m.speedPercent) || 100,
          };
        });
      if (methods.length > 0) {
        const seen = new Set<string>([normalizeAlternativeMethodFingerprint(studentMethod.code)]);
        const dedupedOthers = methods.filter(method => {
          const fingerprint = normalizeAlternativeMethodFingerprint(method.code);
          if (!fingerprint || seen.has(fingerprint)) {
            return false;
          }
          seen.add(fingerprint);
          return true;
        });
        return [studentMethod, ...dedupedOthers].slice(0, 4);
      }
    }
  } catch (parseErr: any) {
    console.warn("[CodePractice] Alt methods JSON parse failed:", parseErr?.message, "Raw:", jsonStr.slice(0, 200));
  }

  return [
    studentMethod,
    { name: "Error", code: rawResponse, explanation: "Could not parse response", speedPercent: 100 }
  ];
}

// Cross-language translation result
export interface CrossLanguageResult {
  code: string;
  highlights: { lines: number[]; explanation: string }[];
}

/**
 * Generate the same solution in a different programming language.
 * Returns the translated code + annotations for lines that differ.
 */
export async function generateCrossLanguageCode(
  sourceLang: string,
  targetLang: string,
  task: string,
  code: string
): Promise<CrossLanguageResult> {
  const uiLang = getResponseLang();
  const langNote = uiLang === "tr" ? " Write ALL explanations in Turkish (Türkçe)." :
                   uiLang === "ja" ? " Write ALL explanations in Japanese (日本語)." : "";

  const systemPrompt =
    "You are a senior developer translating code between programming languages. " +
    "Return ONLY a JSON object with: " +
    '"code" (the complete working code in the target language), ' +
    '"highlights" (array of objects with "lines" (1-based line numbers array) and "explanation" (why this differs from the source language)). ' +
    "No markdown, no code fences around the JSON. ONLY the JSON object." + langNote;

  const userPrompt =
    `SOURCE LANGUAGE: ${sourceLang}\n` +
    `TARGET LANGUAGE: ${targetLang}\n` +
    `TASK: ${task}\n\n` +
    `SOURCE CODE:\n${code}\n\n` +
    `Translate this code to ${targetLang}. The translated code must:\n` +
    "1. Produce the SAME output as the original\n" +
    "2. Use idiomatic, READABLE style for the target language\n" +
    "3. Be a COMPLETE runnable program (with main/entry point)\n" +
    "4. Use MULTIPLE lines — break long expressions into separate steps\n" +
    "5. Match the STRUCTURE of the original code (use loops if original uses loops, not one-liners)\n" +
    "6. Use proper indentation\n\n" +
    "IMPORTANT: Write CLEAR, BEGINNER-FRIENDLY code. Do NOT chain everything into one long expression.\n" +
    "If the original uses a for-loop, use a for-loop in the target language too.\n\n" +
    "For 'highlights': mark lines that are CONCEPTUALLY different from the source language.\n" +
    "Focus on: type system differences, syntax differences, standard library differences, idioms.\n" +
    "DON'T highlight lines that are trivially the same (like empty lines or closing braces).\n" +
    "Each explanation should be 1 short sentence explaining the difference.\n\n" +
    "Return JSON: { code, highlights: [{ lines: [1,2], explanation: \"...\" }, ...] }";

  const rawResponse = await makeAiRequest(systemPrompt, userPrompt);

  // Extract JSON object
  const trimmed = rawResponse.trim();
  let jsonStr = trimmed;
  if (!trimmed.startsWith("{")) {
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    } else {
      const first = trimmed.indexOf("{");
      const last = trimmed.lastIndexOf("}");
      if (first !== -1 && last > first) {
        jsonStr = trimmed.slice(first, last + 1);
      }
    }
  }

  // Try parsing JSON — if it fails, fix raw newlines inside string values and retry
  let parsed: any = null;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // AI often puts real newlines inside JSON strings (invalid JSON).
    // Fix: escape raw newlines/tabs inside string values.
    try {
      const fixed = jsonStr
        .replace(/\r\n/g, "\n")
        .replace(/(["'])(?:(?!\1)[^\\]|\\.)*?\1/g, (match) => {
          // This won't work for strings containing raw newlines (regex won't match across lines).
          return match;
        });
      // Fallback: replace ALL newlines between quotes manually
      // Walk through and escape newlines inside string values
      let inString = false;
      let escape = false;
      let fixedChars: string[] = [];
      for (let ci = 0; ci < jsonStr.length; ci++) {
        const ch = jsonStr[ci];
        if (escape) { fixedChars.push(ch); escape = false; continue; }
        if (ch === '\\') { fixedChars.push(ch); escape = true; continue; }
        if (ch === '"') { inString = !inString; fixedChars.push(ch); continue; }
        if (inString && ch === '\n') { fixedChars.push('\\n'); continue; }
        if (inString && ch === '\t') { fixedChars.push('\\t'); continue; }
        fixedChars.push(ch);
      }
      parsed = JSON.parse(fixedChars.join(''));
    } catch (e2: any) {
      console.warn("[CodePractice] Cross-language JSON parse failed after fix:", e2?.message);
    }
  }

  // If JSON parsing completely failed, try regex extraction as last resort
  if (!parsed) {
    // Extract code between "code": " and the next ", "highlights" or end
    const codeMatch = jsonStr.match(/"code"\s*:\s*"([\s\S]*?)"\s*,\s*"highlights"/);
    if (codeMatch) {
      const extractedCode = codeMatch[1].replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"');
      // Try to extract highlights too
      const hlMatch = jsonStr.match(/"highlights"\s*:\s*(\[[\s\S]*\])\s*\}?\s*$/);
      let extractedHighlights: { lines: number[]; explanation: string }[] = [];
      if (hlMatch) {
        try {
          const hlFixed = hlMatch[1].replace(/\r\n/g, "\n").replace(/\n/g, " ");
          extractedHighlights = JSON.parse(hlFixed).map((h: any) => ({
            lines: Array.isArray(h.lines) ? h.lines.map(Number) : [],
            explanation: String(h.explanation || "")
          }));
        } catch { /* ignore */ }
      }
      return {
        code: extractedCode.trim(),
        highlights: extractedHighlights.length > 0
          ? extractedHighlights
          : fallbackCrossLanguageHighlights(sourceLang, targetLang, extractedCode.trim(), uiLang)
      };
    }
    return { code: rawResponse, highlights: [] };
  }

  let resultCode = parsed.code || "";
  // Fix escaped characters
  resultCode = unescapeCodeLiterals(resultCode);
  // Strip code fences if embedded
  const fenceM = resultCode.match(/```[\w]*\n?([\s\S]*?)```/);
  if (fenceM) { resultCode = fenceM[1]; }

  const highlights = Array.isArray(parsed.highlights) ? parsed.highlights.map((h: any) => ({
    lines: Array.isArray(h.lines) ? h.lines.map(Number) : [],
    explanation: String(h.explanation || "")
  })) : [];

  return {
    code: resultCode.trim(),
    highlights: highlights.length > 0
      ? highlights
      : fallbackCrossLanguageHighlights(sourceLang, targetLang, resultCode.trim(), uiLang)
  };
}

// Generate solution for a practice exercise
export async function runJavaCoreSolution(
  context: vscode.ExtensionContext,
  lang: string,
  topic: string,
  task: string,
  starterCode: string
): Promise<SolutionResult> {
  const uiLang = getResponseLang();
  const langNote = uiLang === "tr" ? "\n\nIMPORTANT: Write the EXPLANATION in Turkish (Türkçe). Code stays in English." :
                   uiLang === "ja" ? "\n\nIMPORTANT: Write the EXPLANATION in Japanese (日本語). Code stays in English." : "";

  const prompt = `You are a coding teacher. Complete the TODO comments in this ${lang} code.

TOPIC: ${topic}
TASK: ${task}

STARTER CODE (fill in the TODOs):
\`\`\`${lang.toLowerCase()}
${starterCode}
\`\`\`

IMPORTANT RULES (follow these but do NOT include them in your response):
- Keep the EXACT same code structure - only fill in the TODO parts
- Do NOT rewrite the code from scratch
- Do NOT add new methods or classes unless absolutely needed
- Do NOT use advanced features the student hasn't learned
- For Java: Do NOT use streams, lambda expressions, .stream(), Collectors, :: method references, or functional interfaces unless the starter code already uses them. Use basic for/while loops and if/else instead.
- For Java: If the result variable is ArrayList<T>, do NOT assign List<T> to it (Collectors.toList() returns List, not ArrayList). Use a for loop instead, or new ArrayList<>(stream.collect(...)).
- The solution MUST contain REAL working code, not TODO comments or step descriptions. Every TODO must be replaced with actual executable code.
- NEVER return a solution that only has comments like '// write the logic here' or '// compute result' or '// TODO: implement'. That is NOT a solution — it is useless. Write the ACTUAL EXECUTABLE CODE that solves the task.
- If the task says "write one line", write the actual one line of code (e.g., result = arr.filter(...)), NOT a comment describing what to write.
- The solution should look like the starter code with TODOs completed
- If the code needs imports (java.util.*, java.io.*, etc.) that are missing, ADD them at the top
- The solution MUST compile and run without errors — include ALL necessary imports
- Return the COMPLETE file, not just the changed parts

Return EXACTLY in this format (nothing else):
SOLUTION:
\`\`\`${lang.toLowerCase()}
[the COMPLETE code with TODOs filled in — include ALL imports]
\`\`\`

EXPLANATION:
[brief explanation of what the solution does and why, 2-4 sentences max. Do NOT repeat the rules above.]${langNote}`;

  const content = await makeAiRequest(
    "You are a coding mentor. Output ONLY in the requested format.",
    prompt
  );

  const codeMatch = content.match(/```[\w]*\n?([\s\S]*?)```/);
  const code = codeMatch ? codeMatch[1].trim() : starterCode;

  const expMatch = content.match(/EXPLANATION:\s*([\s\S]*?)$/i);
  let explanation = expMatch ? expMatch[1].trim() : content;

  // Strip any leaked internal rules from the explanation (single pass)
  explanation = explanation
    .replace(/(?:CRITICAL |IMPORTANT )?RULES:[\s\S]*/i, "")
    .replace(/^[\s\-\*]*(?:The solution maintains|No new methods|Only basic .* operations|Keep the EXACT same|Do NOT (?:rewrite|add new|use advanced))[\s\S]*/im, "")
    .trim();

  return { code, explanation };
}

// Generate a teaching example — similar problem with different names/numbers
export type TeachExample = { code: string; explanation: string; exampleTask: string };

export async function generateTeachingExample(
  context: vscode.ExtensionContext,
  lang: string,
  topic: string,
  task: string,
  starterCode: string
): Promise<TeachExample> {
  const uiLang = getResponseLang();
  const langNote = uiLang === "tr" ? "\n\nIMPORTANT: Write ALL text (exampleTask and explanation) in Turkish (Türkçe). Code stays in English." :
                   uiLang === "ja" ? "\n\nIMPORTANT: Write ALL text in Japanese (日本語). Code stays in English." : "";

  const prompt = `You are a coding teacher helping a student learn ${lang}.

The student is working on this problem:
TOPIC: ${topic}
TASK: ${task}

STARTER CODE:
\`\`\`${lang.toLowerCase()}
${starterCode}
\`\`\`

Create a DIFFERENT but SIMILAR example that teaches the same concept.
- Use DIFFERENT variable names, method names, numbers, and context
- The example should show a COMPLETED solution so the student can learn the pattern
- Do NOT solve the student's actual problem — give them a different one

For example:
- If student's task is "find max in array", your example could be "find min in array" or "find sum of array"
- If student's task is "reverse a string", your example could be "check if string is palindrome"
- Use different names like: scores→prices, students→employees, sum→total, findMax→findSmallest

Return EXACTLY in this format:
EXAMPLE_TASK:
[1 sentence describing what your example does]

EXAMPLE_CODE:
\`\`\`${lang.toLowerCase()}
[complete working code with comments explaining each step]
\`\`\`

EXPLANATION:
[2-3 sentences explaining the pattern/technique used. Help the student see how to apply this to their own problem without giving the answer.]${langNote}`;

  const content = await makeAiRequest(
    "You are a coding teacher. Create a similar but different example to teach a concept. Do NOT solve the student's problem directly.",
    prompt
  );

  const taskMatch = content.match(/EXAMPLE_TASK:\s*([\s\S]*?)(?=EXAMPLE_CODE:|$)/i);
  const exampleTask = taskMatch ? taskMatch[1].trim() : "";

  const codeMatch = content.match(/```[\w]*\n?([\s\S]*?)```/);
  const code = codeMatch ? codeMatch[1].trim() : "";

  const expMatch = content.match(/EXPLANATION:\s*([\s\S]*?)$/i);
  let explanation = expMatch ? expMatch[1].trim() : content;
  explanation = explanation
    .replace(/CRITICAL RULES:[\s\S]*/i, "")
    .replace(/IMPORTANT RULES:[\s\S]*/i, "")
    .trim();

  return { code, explanation, exampleTask };
}

// Generate hinted code — adds real code scaffolding (not just comments)
export async function generateHintedCode(
  context: vscode.ExtensionContext,
  lang: string,
  task: string,
  currentCode: string
): Promise<string> {
  const prompt = `You are helping a beginner learn ${lang}.

TASK: ${task}

CURRENT CODE:
\`\`\`${lang.toLowerCase()}
${currentCode}
\`\`\`

Add real code scaffolding to help the student. Write partial implementation code that guides them toward the solution.

Rules:
1. Add actual code structure: variable declarations, loop skeletons, method signatures, conditionals, etc.
2. Leave the core logic as TODO comments so the student still has to think
3. Add short inline comments only where the syntax might be unfamiliar
4. The code must compile/run without errors (use placeholder values like 0, "", null where needed)
5. Keep the original structure but fill in the scaffolding
6. Return ONLY the updated code, nothing else

Example — if the task is "find the maximum value in an array":
\`\`\`java
public static int findMax(int[] arr) {
    int max = arr[0]; // start with first element
    for (int i = 1; i < arr.length; i++) {
        // TODO: compare arr[i] with max and update if larger
    }
    return max;
}
\`\`\`

Example — if the task is "reverse a string":
\`\`\`java
public static String reverse(String str) {
    char[] chars = str.toCharArray();
    int left = 0;
    int right = chars.length - 1;
    while (left < right) {
        // TODO: swap chars[left] and chars[right], then move pointers
        left++;
        right--;
    }
    return new String(chars);
}
\`\`\`

The goal: student sees the CODE STRUCTURE and only needs to fill in the core logic.`;

  const content = await makeAiRequest(
    "You are a coding tutor. Add real code scaffolding (variable declarations, loops, method signatures) to help the student. Leave only the core logic as TODO. Return ONLY code.",
    prompt
  );

  const codeMatch = content.match(/```[\w]*\n([\s\S]*?)```/);
  return codeMatch ? codeMatch[1].trim() : content.trim();
}

// AI-powered compile error explanation
export async function explainCompileError(
  lang: string,
  code: string,
  rawError: string
): Promise<string> {
  try {
    const prompt = `You are helping a beginner debug their ${lang} code.

THE CODE:
\`\`\`${lang.toLowerCase()}
${code}
\`\`\`

COMPILER ERROR (may have encoding issues):
${rawError}

TASK: Explain what's wrong in simple terms. Be specific about:
1. Which line has the error
2. What exactly is wrong (missing semicolon, wrong syntax, typo, etc.)
3. How to fix it

Keep your response SHORT (2-4 sentences max). Use simple language for beginners.
Do NOT show the corrected code - just explain the problem.`;

    const explanation = await makeAiRequest(
      "You are a coding tutor. Explain errors simply and briefly.",
      prompt
    );

    if (explanation.trim()) {
      return `Compile Error:\n${explanation.trim()}`;
    }

    return parseCompileError(rawError, lang);
  } catch {
    return parseCompileError(rawError, lang);
  }
}

// Explain selected code to the user
export async function explainSelectedCode(): Promise<void> {
  if (await checkDemoMode()) {
    vscode.window.showWarningMessage(t("msg.offlineNotAvailable") || "This feature requires an AI provider. Configure one in Settings.");
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("No active editor");
    return;
  }

  const selection = editor.selection;
  if (selection.isEmpty) {
    vscode.window.showWarningMessage("Select some code first");
    return;
  }

  const selectedText = editor.document.getText(selection);
  if (!selectedText.trim()) {
    vscode.window.showWarningMessage("Selection is empty");
    return;
  }

  const fileName = editor.document.fileName;
  let lang = "code";
  if (fileName.endsWith(".java")) lang = "Java";
  else if (fileName.endsWith(".ts") || fileName.endsWith(".tsx")) lang = "TypeScript";
  else if (fileName.endsWith(".js") || fileName.endsWith(".jsx")) lang = "JavaScript";
  else if (fileName.endsWith(".sql")) lang = "SQL";
  else if (fileName.endsWith(".py")) lang = "Python";

  const statusItem = vscode.window.setStatusBarMessage("$(loading~spin) Explaining code...");

  try {
    const prompt = `Explain this ${lang} code and show how to use it.

CODE:
\`\`\`${lang.toLowerCase()}
${selectedText}
\`\`\`

Return EXACTLY in this format:

EXPLANATION:
[Brief explanation in 2-4 sentences. What does this code do? Use simple language.]

EXAMPLE:
\`\`\`${lang.toLowerCase()}
[Show a practical example of how to use this code. Include sample input/output if applicable.]
\`\`\`

Rules:
- Keep explanation brief and beginner-friendly
- Example should be practical and runnable
- If there's an error in the code, mention it
- If it's a function/method, show how to call it
- If it's a class, show how to create an instance and use it`;

    const rawContent = await makeAiRequest(
      "You are a friendly coding teacher. Explain code simply.",
      prompt
    );

    let explanationText = rawContent;
    let exampleCode = "";

    const explanationMatch = rawContent.match(/EXPLANATION:\s*([\s\S]*?)(?=EXAMPLE:|$)/i);
    if (explanationMatch) {
      explanationText = explanationMatch[1].trim();
    }

    const exampleMatch = rawContent.match(/EXAMPLE:\s*```[\w]*\n?([\s\S]*?)```/i);
    if (exampleMatch) {
      exampleCode = exampleMatch[1].trim();
    }

    const panel = vscode.window.createWebviewPanel(
      "codeExplanation",
      "Code Explanation",
      vscode.ViewColumn.Beside,
      { enableScripts: false }
    );

    const exampleSection = exampleCode ? `
  <h3>Example Usage</h3>
  <pre class="example">${escapeHtml(exampleCode)}</pre>` : "";

    panel.webview.html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 20px;
      line-height: 1.6;
      color: #d4d4d4;
      background: #1e1e1e;
    }
    h2 { color: #569cd6; margin-top: 0; font-size: 14px; }
    h3 { color: #4ec9b0; font-size: 13px; margin-top: 20px; margin-bottom: 10px; }
    .code {
      background: #2d2d2d;
      padding: 12px;
      border-radius: 6px;
      font-family: "Cascadia Code", Consolas, monospace;
      font-size: 12px;
      overflow-x: auto;
      border-left: 3px solid #569cd6;
      margin-bottom: 16px;
    }
    .explanation {
      background: #252526;
      padding: 16px;
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .example {
      background: #2d2d2d;
      padding: 12px;
      border-radius: 6px;
      font-family: "Cascadia Code", Consolas, monospace;
      font-size: 12px;
      overflow-x: auto;
      border-left: 3px solid #4ec9b0;
    }
    .lang {
      color: #9cdcfe;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <h2>Code Explanation</h2>
  <div class="lang">${lang}</div>
  <pre class="code">${escapeHtml(selectedText)}</pre>
  <div class="explanation">${escapeHtml(explanationText)}</div>
  ${exampleSection}
</body>
</html>`;

  } catch (e: any) {
    const msg = e?.message ?? String(e);
    const friendly = msg.length > 80 ? "An error occurred. Check your AI provider settings." : msg;
    vscode.window.showErrorMessage("Failed to explain code: " + friendly);
  } finally {
    statusItem.dispose();
  }
}

/** カスタム練習 — custom practice generation */

export interface CustomPracticeResult {
  title: string;
  task: string;
  starterCode: string;
  solutionCode: string;
  expectedOutput: string;
  hint: string;
}

export async function generateCustomPractice(
  prompt: string,
  lang: string,
  level: number
): Promise<CustomPracticeResult> {
  const uiLang = getResponseLang();
  const langNote = uiLang === "tr"
    ? "\nIMPORTANT: Write TITLE, TASK, HINT in Turkish. Code stays in English."
    : uiLang === "ja"
    ? "\nIMPORTANT: Write TITLE, TASK, HINT in Japanese. Code stays in English."
    : "";

  const classRule = lang === "Java"
    ? "\n- The main class MUST be named 'Practice'\n- Do NOT use Scanner. Hardcode all test data in main()."
    : "";

  const levelGuide = level <= 1
    ? "Beginner level: use only basic constructs (loops, if/else, arrays, simple math)."
    : level <= 2
    ? "Elementary level: basic collections and simple OOP are OK."
    : level <= 3
    ? "Intermediate level: generics, interfaces, enums OK."
    : "Advanced level: full language features OK.";

  // STEP 1: Generate the complete SOLUTION
  const solutionSystemPrompt =
    "You generate coding practice exercises based on the user's custom request. " +
    `The user's topic is: "${prompt}". ` +
    "EVERY exercise you generate MUST be directly about this EXACT topic — do NOT switch to a different topic. " +
    "If the user says 'commute app', EVERY exercise must be about commuting. " +
    "If the user says 'linked list', EVERY exercise must be about linked lists. " +
    "Return ONLY the requested format. No extra commentary.";

  const solutionUserPrompt = `The student wants to practice this SPECIFIC topic in ${lang}:

"${prompt}"

IMPORTANT: The exercise MUST be directly about "${prompt}". Use realistic variable names, class names, and scenarios that match the student's request. For example:
- If they say "commute app" → use CommutePlanner, Route, TravelTime, etc.
- If they say "library system" → use Book, Library, Catalog, etc.
- If they say "sorting algorithms" → implement actual sorting

Do NOT generate a generic or unrelated exercise. Stay 100% on topic.

EXERCISE QUALITY RULES — CRITICAL:
- If the user mentions an "app" or "system" or "tool", create something that FEELS like a real mini-application:
  * Multiple related operations (not just ONE calculation)
  * Data structures to hold state (arrays, objects, lists)
  * At least 2-3 methods that work together
  * Realistic workflow: create data → process it → display results
  * Example: "size shrinking app" should handle multiple images, different resize modes, aspect ratio, batch processing — NOT just one multiplication
  * Example: "commute app" should calculate routes, compare options, find fastest — NOT just one distance formula
- If the user asks for an algorithm or concept (sorting, linked list, recursion), focus on that specific algorithm
- The exercise should have enough substance that the student learns something meaningful — avoid trivially simple single-operation exercises

Rules:
- ${levelGuide}
- The code must compile and run, producing visible console output
- Include a main method/entry point with hardcoded test data${classRule}
- Give the exercise a short, descriptive title that reflects the SPECIFIC topic

Return EXACTLY in this format:
TITLE: (short exercise title)
TASK: (clear description of what the student needs to implement)
\`\`\`${lang.toLowerCase()}
[complete working solution code — ONE code block only]
\`\`\`
EXPECTED_OUTPUT: (exact console output)
HINT: (a helpful hint)${langNote}`;

  const solutionContent = await makeAiRequest(solutionSystemPrompt, solutionUserPrompt);
  const parsed = parseMeta(solutionContent);

  // Extract the solution code block
  const solutionMatch = solutionContent.match(/```[\w]*\n?([\s\S]*?)```/);
  const solutionCode = solutionMatch ? solutionMatch[1].trim() : "";

  if (!solutionCode) {
    return {
      title: parsed.title || "Custom Practice",
      task: parsed.task || prompt,
      starterCode: "",
      solutionCode: "",
      expectedOutput: parsed.expectedOutput || "",
      hint: parsed.hint || ""
    };
  }

  // STEP 2: Generate STARTER TEMPLATE from the solution
  const starterSystemPrompt =
    "You convert complete solution code into a starter template for students. " +
    "You MUST remove the core logic and replace it with // TODO comments. " +
    "Return ONLY the code block. No extra text.";

  const starterUserPrompt = `Convert this ${lang} solution into a STARTER TEMPLATE for a student exercise.

SOLUTION CODE:
\`\`\`${lang.toLowerCase()}
${solutionCode}
\`\`\`

RULES — FOLLOW EXACTLY:
1. KEEP: imports, class declaration, main method signature, variable declarations, print statements, test data
2. REMOVE: the core logic (calculations, loops that compute results, conditionals that make decisions, method implementations)
3. REPLACE removed logic with // TODO comments that explain what the student should implement
4. The starter MUST compile and run without errors (use placeholder values like 0, "", false, null where needed so it compiles)
5. There should be 2-6 TODO comments — not too many, not too few
6. Do NOT keep ANY of the actual solution logic — the student must write it themselves

EXAMPLE of what to do:
If solution has: int sum = 0; for(int n : nums) { sum += n; } System.out.println(sum);
Starter should be: int sum = 0; // TODO: loop through nums and add each element to sum  System.out.println(sum);

If solution has: public static int findMax(int[] arr) { int max = arr[0]; for(int i=1;i<arr.length;i++) if(arr[i]>max) max=arr[i]; return max; }
Starter should be: public static int findMax(int[] arr) { // TODO: find and return the maximum value in the array  return 0; }

Return ONLY the starter code in a single code block:
\`\`\`${lang.toLowerCase()}
[starter template]
\`\`\``;

  const starterContent = await makeAiRequest(starterSystemPrompt, starterUserPrompt);
  const starterMatch = starterContent.match(/```[\w]*\n?([\s\S]*?)```/);
  let starterCode = starterMatch ? starterMatch[1].trim() : "";

  // VALIDATION: If starter has no TODOs, it's still the solution
  if (starterCode && !starterCode.includes("TODO")) {
    console.log("[CodePractice] Starter has no TODOs — forcing placeholder generation");
    // Fallback: strip method bodies (keep signature + return placeholder)
    starterCode = createFallbackStarter(solutionCode, lang);
  }

  // If starter is identical to solution, something went wrong
  if (starterCode === solutionCode) {
    console.log("[CodePractice] Starter identical to solution — forcing placeholder generation");
    starterCode = createFallbackStarter(solutionCode, lang);
  }

  return {
    title: parsed.title || "Custom Practice",
    task: parsed.task || parsed.description || prompt,
    starterCode: starterCode || solutionCode,
    solutionCode,
    expectedOutput: parsed.expectedOutput || "",
    hint: parsed.hint || ""
  };
}

/**
 * Fallback: create a starter template by stripping method bodies from solution code.
 * Keeps class structure, main method signature, and adds TODO comments.
 */
function createFallbackStarter(solutionCode: string, lang: string): string {
  const lines = solutionCode.split("\n");
  const result: string[] = [];
  let braceDepth = 0;
  let inMethodBody = false;
  let methodIndent = "";

  for (const line of lines) {
    const trimmed = line.trim();

    // Track brace depth
    const opens = (line.match(/{/g) || []).length;
    const closes = (line.match(/}/g) || []).length;

    // Detect method/function start (not class or main)
    if (!inMethodBody && braceDepth >= 1 && trimmed.match(/^(public|private|protected|static|\s)*\s*(int|void|String|boolean|double|float|long|char|byte|short|Object|List|Map|Set|Optional)\s+\w+\s*\(/) && trimmed.includes("{")) {
      // This is a method declaration — keep the signature, strip the body
      result.push(line);
      methodIndent = line.match(/^(\s*)/)?.[1] || "";
      result.push(methodIndent + "    // TODO: implement this method");
      if (trimmed.includes("void")) {
        // void method — no return needed
      } else if (trimmed.includes("int") || trimmed.includes("long") || trimmed.includes("short") || trimmed.includes("byte") || trimmed.includes("float") || trimmed.includes("double")) {
        result.push(methodIndent + "    return 0;");
      } else if (trimmed.includes("boolean")) {
        result.push(methodIndent + "    return false;");
      } else if (trimmed.includes("String")) {
        result.push(methodIndent + '    return "";');
      } else {
        result.push(methodIndent + "    return null;");
      }
      inMethodBody = true;
      braceDepth += opens - closes;
      continue;
    }

    if (inMethodBody) {
      braceDepth += opens - closes;
      if (braceDepth <= 1) {
        // Closing brace of the method
        result.push(methodIndent + "}");
        inMethodBody = false;
      }
      continue;
    }

    braceDepth += opens - closes;

    // For main method body: keep structure but add TODOs for logic-heavy lines
    if (braceDepth >= 2 && !trimmed.startsWith("//") && !trimmed.startsWith("System.out") &&
        !trimmed.startsWith("println") && !trimmed.startsWith("console.log") &&
        (trimmed.includes("for") || trimmed.includes("while") || trimmed.includes("if ("))) {
      const indent = line.match(/^(\s*)/)?.[1] || "";
      result.push(indent + "// TODO: " + trimmed.replace(/[{;]\s*$/, "").trim());
      continue;
    }

    result.push(line);
  }

  return result.join("\n");
}

/** コード修正 — AI-powered code fix */

/**
 * Ask AI to fix a practice solution that produces wrong output or doesn't compile.
 * Returns the fixed code and corrected expected output.
 */
export async function fixPracticeCode(
  lang: string,
  task: string,
  code: string,
  expectedOutput: string,
  actualResult: string
): Promise<{ code: string; expectedOutput: string }> {
  const prompt = `You are a coding teacher. Your generated ${lang} code has an issue.

TASK: ${task}
EXPECTED OUTPUT: ${expectedOutput}
ACTUAL RESULT: ${actualResult}

YOUR CODE:
\`\`\`${lang.toLowerCase()}
${code}
\`\`\`

Fix the code so it produces the EXPECTED OUTPUT exactly.
- If the logic is correct but expected output was wrong, update the expected output to match the actual result instead.
- Return the COMPLETE fixed code file (all imports, class definition, main method — everything).
- Keep the same class/method structure. Do NOT rename the class.
- The code MUST compile and run without errors.

Return EXACTLY in this format (nothing else):
FIXED_CODE:
\`\`\`${lang.toLowerCase()}
[complete fixed code]
\`\`\`
FIXED_OUTPUT:
[the correct expected output after the fix]`;

  const content = await makeAiRequest(
    "You are a code fixer. Output ONLY in the requested format. No explanations.",
    prompt
  );

  // Parse fixed code from response
  const codeMatch = content.match(/```[\w]*\n?([\s\S]*?)```/);
  const fixedCode = codeMatch ? codeMatch[1].trim() : code;

  // Parse fixed expected output
  const outputMatch = content.match(/FIXED_OUTPUT:\s*\n?([\s\S]*?)$/i);
  let fixedOutput = outputMatch ? outputMatch[1].trim() : expectedOutput;
  // Clean up: remove code fences if AI wrapped the output
  fixedOutput = stripCodeBlocks(fixedOutput);

  return { code: fixedCode, expectedOutput: fixedOutput };
}

/** テスト生成 — test code generation */

/**
 * Generate test code for a practice exercise using AI.
 * Returns the raw test file content (Java class or TS file), or "" on failure.
 */
export async function generateTestCode(
  lang: string,
  task: string,
  solutionCode: string,
  expectedOutput: string
): Promise<string> {
  const responseLang = getResponseLang() || "en";

  if (lang === "Java") {
    return generateJUnitTests(task, solutionCode, expectedOutput, responseLang);
  } else if (lang === "TypeScript") {
    return generateVitestTests(task, solutionCode, expectedOutput, responseLang);
  }

  return "";
}

async function generateJUnitTests(
  task: string,
  solutionCode: string,
  expectedOutput: string,
  responseLang: string
): Promise<string> {
  const systemPrompt =
    "You generate JUnit 5 test classes for Java practice exercises. " +
    "Return ONLY the Java code. No explanation, no markdown fences.";

  const userPrompt = `Generate a JUnit 5 test class for this Java exercise.

TASK: ${task}
EXPECTED OUTPUT: ${expectedOutput}

SOLUTION CODE:
${solutionCode}

RULES — FOLLOW EXACTLY:
1. Class name MUST be PracticeTest
2. Import org.junit.jupiter.api.Test and static org.junit.jupiter.api.Assertions.*
3. To test console output, capture System.out using ByteArrayOutputStream:
   ByteArrayOutputStream baos = new ByteArrayOutputStream();
   PrintStream old = System.out;
   System.setOut(new PrintStream(baos));
   Practice.main(new String[]{});
   System.out.flush();
   System.setOut(old);
   String output = baos.toString().trim();
4. Generate EXACTLY 3 test methods:
   - testExpectedOutput: verify output matches "${expectedOutput}"
   - testHasOutput: verify output is not empty
   - testNoHardcode: verify the Practice class source has real logic (read Practice.java, check it contains loops/conditions/method calls, not just println)
5. Each test must be self-contained
6. Add these imports at the top:
   import java.io.*;
   import java.nio.file.*;
7. Return ONLY the Java code, no markdown fences, no explanation`;

  try {
    const content = await makeAiRequest(systemPrompt, userPrompt);
    // Strip any markdown fences the AI might add anyway
    return stripCodeBlocks(content);
  } catch {
    return "";
  }
}

async function generateVitestTests(
  task: string,
  solutionCode: string,
  expectedOutput: string,
  responseLang: string
): Promise<string> {
  const systemPrompt =
    "You generate Vitest test files for TypeScript practice exercises. " +
    "Return ONLY the TypeScript code. No explanation, no markdown fences.";

  const userPrompt = `Generate a Vitest test file for this TypeScript exercise.

TASK: ${task}
EXPECTED OUTPUT: ${expectedOutput}

SOLUTION CODE:
${solutionCode}

RULES — FOLLOW EXACTLY:
1. File will be saved as Practice.test.ts
2. Use these imports:
   import { describe, it, expect } from 'vitest'
   import { execSync } from 'child_process'
3. To test the practice output, run the student file and capture output:
   const output = execSync('npx tsx Practice.ts', { encoding: 'utf8', cwd: __dirname }).trim()
4. Generate EXACTLY 3 tests inside a describe("Practice", () => { ... }) block:
   - "expected output": verify output matches "${expectedOutput}"
   - "has output": verify output is not empty
   - "has logic": read Practice.ts file content, verify it contains real logic (loops, functions, conditions) not just console.log("answer")
5. For reading the file, use:
   import { readFileSync } from 'fs'
   import { join } from 'path'
   const code = readFileSync(join(__dirname, 'Practice.ts'), 'utf8')
6. Return ONLY the TypeScript code, no markdown fences, no explanation`;

  try {
    const content = await makeAiRequest(systemPrompt, userPrompt);
    return stripCodeBlocks(content);
  } catch {
    return "";
  }
}

/** API練習 — API practice generation */

export interface ApiPracticeResult {
  title: string;
  task: string;
  starterCode: string;
  solutionCode: string;
  expectedFields: string[];
  apiType: string;
  hint: string;
}

const API_CATALOG = [
  // Flat JSON — safe for all levels
  { type: "joke", url: "https://official-joke-api.appspot.com/random_joke", desc: "Random joke (setup + punchline)", nested: false },
  { type: "dog", url: "https://dog.ceo/api/breeds/image/random", desc: "Random dog image URL", nested: false },
  { type: "ip", url: "https://ipapi.co/json/", desc: "IP address and location info", nested: false },
  { type: "exchange", url: "https://open.er-api.com/v6/latest/USD", desc: "Exchange rates for USD", nested: false },
  // Nested JSON — level 3+ only
  { type: "weather", url: "https://wttr.in/London?format=j1", desc: "Weather data for a city", nested: true },
  { type: "pokemon", url: "https://pokeapi.co/api/v2/pokemon/pikachu", desc: "Pokemon info (name, types, stats)", nested: true },
  { type: "country", url: "https://restcountries.com/v3.1/name/japan", desc: "Country info (capital, population, region)", nested: true },
  { type: "user", url: "https://randomuser.me/api/", desc: "Random fake user profile", nested: true },
];

const FALLBACK_FIELDS: Record<string, string[]> = {
  joke: ["Setup", "Punchline"],
  dog: ["Image"],
  ip: ["IP", "City"],
  exchange: ["USD", "EUR"],
  weather: ["Temperature", "Humidity"],
  pokemon: ["Name", "Height"],
  country: ["Capital", "Population"],
  user: ["Name", "Email"],
};

export async function generateApiPractice(lang: string, level: number): Promise<ApiPracticeResult> {
  const langName = getResponseLang() === "en" ? "" : ` Respond in ${getResponseLang() === "tr" ? "Turkish" : "Japanese"}.`;
  // Beginners (L1-2) get flat JSON only; L3+ can get nested APIs
  const pool = level <= 2 ? API_CATALOG.filter(a => !a.nested) : API_CATALOG;
  const api = pool[Math.floor(Math.random() * pool.length)];

  const levelDesc = level <= 2
    ? "BEGINNER: fetch from API and print 1-2 fields. Keep it very simple."
    : level <= 4
      ? "INTERMEDIATE: fetch, parse JSON, format and print 3-5 fields nicely."
      : "ADVANCED: add error handling (try/catch), format output as a readable card, handle edge cases.";

  const tsTemplate = `// Starter code for TypeScript API practice
async function main() {
  const url = "${api.url}";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error("API Error: HTTP " + response.status);
      return;
    }

    const data = await response.json();

    // YOUR CODE HERE
    // Use 'data' to extract and print the required fields
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      console.error("API Error: Request timed out (8s)");
    } else {
      console.error("API Error: " + err.message);
    }
  }
}

main();`;

  const javaTemplate = `// Starter code for Java API practice
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class Practice {
    /** Extract a top-level JSON value by key. Returns "" if not found.
     *  For nested objects/arrays, returns the raw JSON fragment. */
    static String jsonValue(String json, String key) {
        int depth = 0;
        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '"') {
                int close = i + 1;
                while (close < json.length()) {
                    if (json.charAt(close) == '\\\\') { close += 2; continue; }
                    if (json.charAt(close) == '"') break;
                    close++;
                }
                String k = json.substring(i + 1, close);
                if (depth == 1 && k.equals(key)) {
                    int j = close + 1;
                    while (j < json.length() && json.charAt(j) != ':') j++;
                    j++;
                    while (j < json.length() && Character.isWhitespace(json.charAt(j))) j++;
                    if (j >= json.length()) return "";
                    char v = json.charAt(j);
                    if (v == '"') {
                        int ve = j + 1;
                        while (ve < json.length()) {
                            if (json.charAt(ve) == '\\\\') { ve += 2; continue; }
                            if (json.charAt(ve) == '"') break;
                            ve++;
                        }
                        return json.substring(j + 1, ve);
                    } else if (v == '{' || v == '[') {
                        int nd = 0;
                        for (int x = j; x < json.length(); x++) {
                            char xc = json.charAt(x);
                            if (xc == '"') { x++; while (x < json.length() && json.charAt(x) != '"') { if (json.charAt(x) == '\\\\') x++; x++; } }
                            else if (xc == '{' || xc == '[') nd++;
                            else if (xc == '}' || xc == ']') { nd--; if (nd == 0) return json.substring(j, x + 1); }
                        }
                        return "";
                    } else {
                        int ve = j;
                        while (ve < json.length() && json.charAt(ve) != ',' && json.charAt(ve) != '}') ve++;
                        return json.substring(j, ve).trim();
                    }
                }
                i = close;
            } else if (c == '{' || c == '[') depth++;
            else if (c == '}' || c == ']') depth--;
        }
        return "";
    }

    public static void main(String[] args) {
        String url = "${api.url}";
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(8))
                    .build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                System.err.println("API Error: HTTP " + response.statusCode());
                return;
            }

            String json = response.body();

            // YOUR CODE HERE
            // Use jsonValue(json, "keyName") to extract top-level fields from the JSON
            // Example: String name = jsonValue(json, "name");
            // For nested data: String inner = jsonValue(jsonValue(json, "parent"), "child");
        } catch (Exception e) {
            System.err.println("API Error: " + e.getMessage());
        }
    }
}`;

  const systemPrompt = `You are an expert coding teacher creating API data fetching exercises.
You generate practice tasks where students learn to call real REST APIs and process JSON responses.${langName}

RESPOND WITH VALID JSON ONLY — no markdown, no fences.`;

  const userPrompt = `Create an API practice exercise for ${lang}.

API: ${api.desc}
URL: ${api.url}
API type: ${api.type}
Level: ${level}/5 — ${levelDesc}

STARTER CODE (already provided, do NOT change):
${lang === "Java" ? javaTemplate : tsTemplate}

Return JSON with these exact fields:
{
  "title": "short title (max 60 chars)",
  "task": "clear task description telling student what to fetch and print. Include the expected output FORMAT as an example, e.g. 'City: London, Temperature: 15°C'. Be specific about which fields to extract.",
  "solutionCode": "complete working code (the full program with the solution filled in). For Java, use the provided jsonValue(json, key) helper to extract fields — NEVER use indexOf/substring for JSON parsing. For TypeScript, use dot notation on parsed JSON.",
  "expectedFields": ["field1", "field2"],
  "hint": "a helpful hint about how to access the data"
}

RULES:
- "expectedFields" are the labels/keys the student should print (e.g. ["City", "Temperature"] for weather)
- "solutionCode" must be COMPLETE runnable code (not just the YOUR CODE HERE part)
- "task" must clearly describe the expected output FORMAT with an example
- For Java: use the jsonValue(json, "key") helper method provided in the template — NEVER use indexOf/substring for JSON parsing. jsonValue only matches TOP-LEVEL keys. For nested data, chain calls: jsonValue(jsonValue(json, "parent"), "child"). No Gson/Jackson/regex
- For TypeScript: use data.field.subfield notation on parsed JSON
- Keep the solution simple and readable
- The output should be human-readable lines, one field per line: "Label: value"`;

  try {
    const raw = await makeAiRequest(systemPrompt, userPrompt);

    // Parse JSON from response
    let jsonStr = raw.trim();
    if (!jsonStr.startsWith("{")) {
      const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) {
        jsonStr = fenceMatch[1].trim();
      } else {
        const first = jsonStr.indexOf("{");
        const last = jsonStr.lastIndexOf("}");
        if (first >= 0 && last > first) {
          jsonStr = jsonStr.slice(first, last + 1);
        }
      }
    }

    const parsed = JSON.parse(jsonStr);

    let solutionCode = String(parsed.solutionCode || "");
    solutionCode = unescapeCodeLiterals(solutionCode);
    const fenceM = solutionCode.match(/```[\w]*\n?([\s\S]*?)```/);
    if (fenceM) { solutionCode = fenceM[1]; }

    return {
      title: String(parsed.title || `API: ${api.desc}`),
      task: String(parsed.task || "Fetch data from the API and print the required fields."),
      starterCode: lang === "Java" ? javaTemplate : tsTemplate,
      solutionCode: solutionCode.trim(),
      expectedFields: Array.isArray(parsed.expectedFields) && parsed.expectedFields.length > 0
        ? parsed.expectedFields.map(String)
        : FALLBACK_FIELDS[api.type] || ["Data"],
      apiType: api.type,
      hint: String(parsed.hint || "Check the JSON structure by printing the raw data first."),
    };
  } catch (e: any) {
    console.warn("[CodePractice] generateApiPractice failed:", e?.message);
    return {
      title: `API: ${api.desc}`,
      task: `Fetch data from ${api.url} and print the response fields in a readable format.\nExample output:\nField1: value1\nField2: value2`,
      starterCode: lang === "Java" ? javaTemplate : tsTemplate,
      solutionCode: lang === "Java" ? javaTemplate : tsTemplate,
      expectedFields: FALLBACK_FIELDS[api.type] || ["Data"],
      apiType: api.type,
      hint: "Start by printing the raw JSON response to see its structure.",
    };
  }
}

/** 判定フィードバック — AI judge feedback */

export interface JudgeFeedbackLine {
  line: number;       // 1-based line number in student code
  problem: string;    // short description of the issue
  fix: string;        // what should be there instead
}

export interface JudgeFeedback {
  summary: string;           // 1-2 sentence overall feedback
  lines: JudgeFeedbackLine[];  // specific line-level issues
}

export async function generateJudgeFeedback(
  studentCode: string,
  solutionCode: string,
  task: string,
  expectedOutput: string,
  actualOutput: string,
  lang: string
): Promise<JudgeFeedback> {
  const uiLang = getResponseLang();

  const systemPrompt =
    "You are a coding tutor. A student submitted wrong code for a practice exercise. " +
    "Compare their code with the correct solution and identify the SPECIFIC lines that are wrong. " +
    "Return ONLY a valid JSON object, no markdown, no explanation outside JSON.";

  const userPrompt = `Task: ${task}

Student's code (${lang}):
\`\`\`
${studentCode}
\`\`\`

Correct solution:
\`\`\`
${solutionCode}
\`\`\`

Expected output: ${expectedOutput}
Student's output: ${actualOutput}

Find the specific lines in the STUDENT'S code that are wrong or missing.
Return JSON in this EXACT format:
{
  "summary": "Brief explanation of what went wrong (1-2 sentences, in ${uiLang})",
  "lines": [
    { "line": 5, "problem": "Wrong loop condition (in ${uiLang})", "fix": "Change i < 5 to i < arr.length" },
    { "line": 8, "problem": "Missing accumulator update (in ${uiLang})", "fix": "Add sum += arr[i];" }
  ]
}

Rules:
- "line" is the 1-based line number in the STUDENT's code
- Maximum 5 lines (only the most important errors)
- If student code is mostly empty/unchanged starter, say so in summary and return empty lines array
- problem and summary MUST be in ${uiLang}
- fix should show the actual code that should be there`;

  try {
    const raw = await makeAiRequest(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { summary: raw.slice(0, 200), lines: [] };
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      summary: String(parsed.summary || ""),
      lines: Array.isArray(parsed.lines)
        ? parsed.lines.slice(0, 5).map((l: any) => ({
            line: Number(l.line) || 0,
            problem: String(l.problem || ""),
            fix: String(l.fix || ""),
          }))
        : [],
    };
  } catch (e: any) {
    console.warn("[CodePractice] generateJudgeFeedback failed:", e?.message);
    return { summary: "Could not generate feedback.", lines: [] };
  }
}
