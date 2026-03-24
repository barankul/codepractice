// パーサー — text/code parsing utilities
import { ParsedMeta, TestCase } from "./constants";

type MetaFieldKey =
  | "TITLE"
  | "TASK"
  | "EXPECTED_OUTPUT"
  | "OUTPUT"
  | "MINI_TEST"
  | "HINT"
  | "DESCRIPTION"
  | "BUG_HINT"
  | "BUG_EXPLANATION"
  | "TEST_CASES"
  | "CALCULATION";

const META_LABEL_ALIASES: Record<string, MetaFieldKey> = {
  title: "TITLE",
  task: "TASK",
  expectedoutput: "EXPECTED_OUTPUT",
  output: "OUTPUT",
  minitest: "MINI_TEST",
  hint: "HINT",
  description: "DESCRIPTION",
  bughint: "BUG_HINT",
  bugexplanation: "BUG_EXPLANATION",
  testcases: "TEST_CASES",
  calculation: "CALCULATION",

  "\u30bf\u30a4\u30c8\u30eb": "TITLE",
  "\u8ab2\u984c": "TASK",
  "\u30bf\u30b9\u30af": "TASK",
  "\u671f\u5f85\u3055\u308c\u308b\u51fa\u529b": "EXPECTED_OUTPUT",
  "\u671f\u5f85\u51fa\u529b": "EXPECTED_OUTPUT",
  "\u51fa\u529b": "OUTPUT",
  "\u30d2\u30f3\u30c8": "HINT",
  "\u8aac\u660e": "DESCRIPTION",
  "\u30d0\u30b0\u30d2\u30f3\u30c8": "BUG_HINT",
  "\u30d0\u30b0\u306e\u30d2\u30f3\u30c8": "BUG_HINT",
  "\u30d0\u30b0\u8aac\u660e": "BUG_EXPLANATION",
  "\u30d0\u30b0\u306e\u8aac\u660e": "BUG_EXPLANATION",
  "\u30c6\u30b9\u30c8\u30b1\u30fc\u30b9": "TEST_CASES",
  "\u8a08\u7b97": "CALCULATION",

  "ba\u015fl\u0131k": "TITLE",
  "g\u00f6rev": "TASK",
  "beklenen\u00e7\u0131kt\u0131": "EXPECTED_OUTPUT",
  "\u00e7\u0131kt\u0131": "OUTPUT",
  ipucu: "HINT",
  "a\u00e7\u0131klama": "DESCRIPTION",
  bugipucu: "BUG_HINT",
  hataipucu: "BUG_HINT",
  "buga\u00e7\u0131klamas\u0131": "BUG_EXPLANATION",
  bugaciklamasi: "BUG_EXPLANATION",
  "testdurumlar\u0131": "TEST_CASES",
  testdurumlari: "TEST_CASES",
  hesaplama: "CALCULATION",
};

function normalizeMetaLabel(label: string): string {
  return (label || "")
    .normalize("NFKC")
    .replace(/^[*\s]+|[*\s]+$/g, "")
    .replace(/[：:]+$/g, "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

/** コードブロック除去 — strip markdown fences */
function canonicalMetaLabel(label: string): string {
  return (label || "")
    .normalize("NFKC")
    .replace(/^[*\s]+|[*\s]+$/g, "")
    .replace(/[:\uFF1A]+$/g, "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

export function stripCodeBlocks(text: string): string {
  if (!text) return text;
  let result = text.replace(/^```[\w]*\n?/gm, "");
  result = result.replace(/\n?```$/gm, "");
  result = result.replace(/^```$/gm, "");
  return result.trim();
}

function parseTestCases(testCasesRaw: string): TestCase[] {
  const cases: TestCase[] = [];
  const lines = testCasesRaw.split("\n");

  for (const line of lines) {
    const match = line.match(/^-?\s*(?:input:\s*)?(.+?)\s*(?:->|→|=>)\s*(?:output:\s*)?(.+)$/i)
      || line.match(/^-?\s*(?:input:\s*)?(.+?)\s*\|\s*(?:output:\s*)?(.+)$/i);
    if (match) {
      const output = match[2].trim().replace(/^[`*]+|[`*]+$/g, "");
      cases.push({
        input: match[1].trim().replace(/^`+|`+$/g, ""),
        output
      });
    }
  }

  return cases;
}

/** メタ解析 — parse TITLE/TASK/EXPECTED_OUTPUT fields */
export function parseMeta(meta: string): ParsedMeta {
  const lines = (meta || "").replace(/\r\n/g, "\n").split("\n");
  const out: Record<MetaFieldKey, string> = {
    TITLE: "", TASK: "", EXPECTED_OUTPUT: "", OUTPUT: "", MINI_TEST: "", HINT: "",
    DESCRIPTION: "", BUG_HINT: "", BUG_EXPLANATION: "", TEST_CASES: "", CALCULATION: ""
  };
  let cur: MetaFieldKey | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const localizedMetaMatch = line.match(/^\*{0,2}(.+?)[:\uFF1A]\*{0,2}\s*(.*)$/);
    if (localizedMetaMatch) {
      const mapped = META_LABEL_ALIASES[canonicalMetaLabel(localizedMetaMatch[1])];
      if (mapped) {
        cur = mapped;
        out[cur] = (localizedMetaMatch[2] || "").trim();
        continue;
      }
    }
    const m = line.match(/^\*{0,2}(TITLE|TASK|EXPECTED_OUTPUT|OUTPUT|MINI_TEST|HINT|DESCRIPTION|BUG_HINT|BUG_EXPLANATION|TEST_CASES|CALCULATION):\*{0,2}\s*(.*)$/i);
    if (m) {
      cur = m[1].toUpperCase() as keyof typeof out;
      out[cur] = (m[2] || "").trim();
      continue;
    }
    // Fallback: translated field labels (Japanese / Turkish)
    const trMap: Record<string, string> = {
      "タイトル": "TITLE", "タスク": "TASK", "ヒント": "HINT", "期待出力": "EXPECTED_OUTPUT", "出力": "OUTPUT", "説明": "DESCRIPTION", "計算": "CALCULATION", "テストケース": "TEST_CASES",
      "başlık": "TITLE", "görev": "TASK", "ipucu": "HINT", "beklenen çıktı": "EXPECTED_OUTPUT", "çıktı": "OUTPUT", "açıklama": "DESCRIPTION", "hesaplama": "CALCULATION", "test durumları": "TEST_CASES"
    };
    const trMatch = line.match(/^\*{0,2}(.+?):\*{0,2}\s*(.*)$/);
    if (trMatch) {
      const mapped = trMap[trMatch[1].trim().toLowerCase()];
      if (mapped && mapped in out) {
        cur = mapped as keyof typeof out;
        out[cur] = (trMatch[2] || "").trim();
        continue;
      }
    }
    // Fallback: first line bold text as title (e.g. **Movie Ratings: ...**)
    if (i === 0 && !out.TITLE) {
      const boldMatch = line.match(/^\*{2,}(.+?)\*{2,}$/);
      if (boldMatch) {
        out.TITLE = boldMatch[1].trim();
        continue;
      }
      // Also handle # Heading style
      const headingMatch = line.match(/^#+\s+(.+)$/);
      if (headingMatch) {
        out.TITLE = headingMatch[1].trim();
        continue;
      }
    }
    // Stop appending to EXPECTED_OUTPUT/OUTPUT when a code fence or solution block starts
    if (cur && (cur === "EXPECTED_OUTPUT" || cur === "OUTPUT" || cur === "MINI_TEST")) {
      if (/^```/.test(line.trim()) || /^(>>>|SOLUTION|STARTER|SQL\s*QUERY)/i.test(line.trim())) {
        cur = null;
        continue;
      }
    }
    if (cur) {
      out[cur] += (out[cur] ? "\n" : "") + line;
    }
  }

  const expectedOutput = stripCodeBlocks(out.EXPECTED_OUTPUT.trim() || out.OUTPUT.trim() || out.MINI_TEST.trim());
  const testCases = parseTestCases(out.TEST_CASES);
  const bugHint = out.BUG_HINT.trim();
  const bugExplanation = out.BUG_EXPLANATION.trim() || bugHint;

  return {
    title: out.TITLE.trim(),
    task: out.TASK.trim() || out.DESCRIPTION.trim(),
    starterCode: "",
    expectedOutput,
    hint: out.HINT.trim() || bugHint,
    description: out.DESCRIPTION.trim(),
    bugHint,
    bugExplanation,
    testCases: testCases.length > 0 ? testCases : undefined
  };
}

/** コンパイルエラー解析 — parse compile errors */
export function parseCompileError(rawError: string, lang: string): string {
  const isGarbled = /[\u0080-\u00ff]{3,}/.test(rawError);

  if (isGarbled || !rawError.trim()) {
    const lineMatch = rawError.match(/Practice\.(java|ts):(\d+)/);
    const line = lineMatch ? lineMatch[2] : "?";

    if (rawError.includes("';'")) {
      return `Syntax Error (line ${line}): Missing semicolon (;)`;
    }
    if (rawError.includes("')'") || rawError.includes("'('")) {
      return `Syntax Error (line ${line}): Missing or extra parenthesis`;
    }
    if (rawError.includes("'}'") || rawError.includes("'{'")) {
      return `Syntax Error (line ${line}): Missing or extra brace { }`;
    }
    if (rawError.includes("cannot find symbol") || rawError.toLowerCase().includes("symbol")) {
      return `Error (line ${line}): Variable or method not found. Check spelling and declarations.`;
    }
    if (rawError.includes("incompatible types") || rawError.toLowerCase().includes("type")) {
      return `Type Error (line ${line}): Wrong data type. Check your variable types.`;
    }
    if (rawError.includes("not a statement")) {
      return `Syntax Error (line ${line}): Invalid statement. Check for typos.`;
    }
    if (rawError.includes("class") && rawError.includes("public")) {
      return `Error: Class name must match filename (Practice)`;
    }

    if (lineMatch) {
      return `Compile Error at line ${line}: Check syntax near that line.`;
    }
    return "Compile Error: Check your code for syntax errors (missing ; or { } or typos)";
  }

  // TypeScript-specific friendly messages
  if (lang === "TypeScript") {
    const tsLine = rawError.match(/\((\d+),\d+\)/)?.[1] || rawError.match(/:(\d+):/)?.[1] || "?";
    if (/Property .+ does not exist on type/.test(rawError)) {
      return `Type Error (line ${tsLine}): Property not found. Check the interface/type definition.`;
    }
    if (/Type .+ is not assignable to type/.test(rawError)) {
      return `Type Error (line ${tsLine}): Wrong type assignment. Check your variable types.`;
    }
    if (/Cannot find name/.test(rawError)) {
      return `Error (line ${tsLine}): Variable or function not declared. Check spelling.`;
    }
    if (/Expected \d+ arguments?, but got \d+/.test(rawError)) {
      return `Error (line ${tsLine}): Wrong number of arguments.`;
    }
    if (/is not a function/.test(rawError)) {
      return `Type Error (line ${tsLine}): Not a function. Check method name.`;
    }
    if (/Object is possibly .?undefined/.test(rawError)) {
      return `Error (line ${tsLine}): Value might be undefined. Use optional chaining (?.) or a null check.`;
    }
    if (/has no exported member/.test(rawError)) {
      return `Error (line ${tsLine}): Import not found. Check the export name.`;
    }
  }

  const lines = rawError.split("\n").filter(l => l.trim());
  const simplified: string[] = [];

  for (const line of lines) {
    const match = line.match(/Practice\.\w+:(\d+):.*?:\s*(.+)/);
    if (match) {
      simplified.push(`Line ${match[1]}: ${match[2]}`);
    } else if (line.includes("error:")) {
      simplified.push(line.replace(/^.*error:\s*/, "Error: "));
    }
  }

  if (simplified.length > 0) {
    return "Compile Error:\n" + simplified.slice(0, 5).join("\n");
  }

  return "Compile Error:\n" + rawError.slice(0, 500);
}

/** Common runtime error → actionable hint mapping */
export function getCommonMistakeHint(errorText: string, lang: string): string | undefined {
  if (!errorText) { return undefined; }
  const e = errorText;

  // Java runtime errors
  if (lang === "Java") {
    if (/StringIndexOutOfBoundsException/.test(e)) {
      return "Hint: Check string length before accessing characters — use `if (i < str.length())`";
    }
    if (/NullPointerException/.test(e)) {
      return "Hint: A variable is null. Add a null check — `if (obj != null)`";
    }
    if (/ArrayIndexOutOfBoundsException/.test(e)) {
      return "Hint: Array index is out of range. Check `array.length` before accessing.";
    }
    if (/StackOverflowError/.test(e)) {
      return "Hint: Infinite recursion detected. Make sure your recursive function has a base case.";
    }
    if (/NumberFormatException/.test(e)) {
      return "Hint: Invalid number format. Validate the string before parsing with `Integer.parseInt()`.";
    }
    if (/ClassCastException/.test(e)) {
      return "Hint: Wrong type cast. Use `instanceof` to check the type before casting.";
    }
    if (/ConcurrentModificationException/.test(e)) {
      return "Hint: Don't modify a collection while iterating it. Use an Iterator or collect changes first.";
    }
  }

  // TypeScript / JavaScript runtime errors
  if (lang === "TypeScript") {
    if (/undefined is not an object|Cannot read propert/.test(e)) {
      return "Hint: A value is undefined. Use optional chaining — `obj?.property`";
    }
    if (/is not a function/.test(e)) {
      return "Hint: Calling something that isn't a function. Check the method name and object type.";
    }
    if (/Maximum call stack/.test(e)) {
      return "Hint: Infinite recursion. Make sure your function has a proper base case.";
    }
    if (/Invalid or unexpected token/.test(e)) {
      return "Hint: Syntax error — check for missing quotes, brackets, or semicolons.";
    }
  }

  // SQL errors
  if (lang === "SQL") {
    if (/no such column/i.test(e)) {
      return "Hint: Column name not found. Check the table schema and spelling.";
    }
    if (/no such table/i.test(e)) {
      return "Hint: Table not found. Check the table name spelling.";
    }
    if (/ambiguous column/i.test(e)) {
      return "Hint: Column exists in multiple tables. Prefix with the table name — `table.column`.";
    }
  }

  return undefined;
}

/** Java正規化 — rename class to Practice */
export function normalizeJavaPractice(code: string): string {
  let c = code || "";
  c = c.replace(/^(public\s+class\s+)(\w+)/m, (match, prefix, name) => {
    if (name === "Practice") { return match; }
    return prefix + "Practice";
  });
  c = c.replace(/^(class\s+)Main\b/m, "$1Practice");

  const classMatches = [...c.matchAll(/^public\s+class\s+Practice\b/gm)];
  if (classMatches.length > 1 && classMatches[1].index !== undefined) {
    c = c.slice(0, classMatches[1].index).trimEnd();
    const openBraces = (c.match(/\{/g) || []).length;
    const closeBraces = (c.match(/\}/g) || []).length;
    for (let i = closeBraces; i < openBraces; i++) { c += "\n}"; }
  }

  c = removeUnreachableReturns(c);
  c = ensureJavaImports(c);

  return c;
}

/** Java import自動追加 — auto-add missing imports based on used types */
function ensureJavaImports(code: string): string {
  if (!code) return code;
  const hasImportUtil = /^import\s+java\.util\.\*\s*;/m.test(code);
  if (hasImportUtil) return code;

  const needsImport = /\b(ArrayList|HashMap|HashSet|LinkedList|LinkedHashMap|LinkedHashSet|TreeMap|TreeSet|Map|List|Set|Collections|Arrays|Queue|Stack|PriorityQueue|Deque|ArrayDeque|Iterator)\b/.test(code);
  if (!needsImport) return code;

  const importLine = "import java.util.*;\n";
  const existingImport = code.match(/^import\s+.+;/m);
  if (existingImport && existingImport.index !== undefined) {
    return code.slice(0, existingImport.index) + importLine + code.slice(existingImport.index);
  }
  const classMatch = code.match(/^(public\s+)?class\s+/m);
  if (classMatch && classMatch.index !== undefined) {
    return importLine + "\n" + code.slice(classMatch.index);
  }
  return importLine + "\n" + code;
}

/** 到達不能return除去 — remove unreachable trailing returns */
function removeUnreachableReturns(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    // Skip "// placeholder" comment lines followed by placeholder returns
    if (/^\s*\/\/\s*placeholder/i.test(lines[i]) && i + 1 < lines.length) {
      const nextTrimmed = lines[i + 1]?.trim() || "";
      if (/^return\s+(false|true|-?\d+|0|""|null)\s*;/.test(nextTrimmed)) {
        continue;
      }
    }
    result.push(lines[i]);
  }
  return result.join("\n");
}

/** コード検証 — check if code block is valid */
export function isValidCodeBlock(code: string, lang: string): boolean {
  if (!code || !code.trim()) return false;

  const lines = code.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return false;

  const tsIndicators = /\b(const |let |var |function |import |export |class |interface |type |console\.|return |if |for |while |=>|:\s*(string|number|boolean|any)\b)/;
  const javaIndicators = /\b(public |private |class |import |int |String |void |static |new |System\.|return |if |for |while )/;
  const sqlIndicators = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|FROM|WHERE|JOIN|GROUP|ORDER|HAVING)\b/i;

  const indicator = lang === "SQL" ? sqlIndicators
    : lang === "Java" ? javaIndicators
    : tsIndicators;

  const hasCodeLine = lines.some(l => indicator.test(l));
  if (!hasCodeLine) return false;

  const proseLines = lines.filter(l => {
    if (l.startsWith("//") || l.startsWith("/*") || l.startsWith("*") || l.startsWith("#") || l.startsWith("--")) return false;
    if (/^[{}\[\]();,]+$/.test(l)) return false;
    return /^[A-Z][a-z].*[a-z]$/.test(l) && !indicator.test(l) && !l.includes("=") && !l.includes(";");
  });

  const nonCommentLines = lines.filter(l => !l.startsWith("//") && !l.startsWith("/*") && !l.startsWith("*") && !l.startsWith("#") && !l.startsWith("--"));
  if (nonCommentLines.length > 0 && proseLines.length > nonCommentLines.length / 2) return false;

  return true;
}

/** HTMLエスケープ — escape HTML entities */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>");
}

/** リテラルアンエスケープ — unescape JSON-style \\n, \\t etc. */
export function unescapeCodeLiterals(code: string): string {
  return code.replaceAll("\\r", "").replaceAll("\\n", "\n").replaceAll("\\t", "\t").replace(/\\"/g, '"');
}

/** タスク装飾 — enhance task text with keywords */
export function enhanceTaskText(text: string): string {
  let cleaned = text.replace(/```[\s\S]*?```/g, "").trim();
  cleaned = cleaned.replace(/^[ \t]{4,}.+$/gm, "").trim();
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  if (!cleaned) { return text; }

  let html = cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  const keywords: Record<string, { cls: string; tip: string }> = {
    'int': { cls: 'kw-type', tip: 'Integer - whole number type' },
    'String': { cls: 'kw-type', tip: 'String - text type' },
    'boolean': { cls: 'kw-type', tip: 'Boolean - true/false value' },
    'double': { cls: 'kw-type', tip: 'Double - decimal number' },
    'float': { cls: 'kw-type', tip: 'Float - decimal number' },
    'char': { cls: 'kw-type', tip: 'Char - single character' },
    'void': { cls: 'kw-type', tip: 'Void - returns nothing' },
    'ArrayList': { cls: 'kw-type', tip: 'ArrayList - dynamic array' },
    'HashMap': { cls: 'kw-type', tip: 'HashMap - key-value pairs' },
    'array': { cls: 'kw-type', tip: 'Array - collection of elements' },
    'for': { cls: 'keyword', tip: 'For loop - repeat' },
    'while': { cls: 'keyword', tip: 'While loop - repeat while true' },
    'if': { cls: 'keyword', tip: 'If - condition check' },
    'else': { cls: 'keyword', tip: 'Else - when condition is false' },
    'switch': { cls: 'keyword', tip: 'Switch - multi-value check' },
    'return': { cls: 'keyword', tip: 'Return - send value back' },
    'println': { cls: 'kw-method', tip: 'Print to console + new line' },
    'print': { cls: 'kw-method', tip: 'Print to console' },
    'length': { cls: 'kw-method', tip: 'Length of array or string' },
    'size': { cls: 'kw-method', tip: 'Element count in collection' },
    'add': { cls: 'kw-method', tip: 'Add element' },
    'get': { cls: 'kw-method', tip: 'Get element' },
    'set': { cls: 'kw-method', tip: 'Set element' },
    'true': { cls: 'kw-value', tip: 'Boolean true value' },
    'false': { cls: 'kw-value', tip: 'Boolean false value' },
    'null': { cls: 'kw-value', tip: 'Null - empty reference' },
  };

  const placeholders: string[] = [];
  for (const [word, info] of Object.entries(keywords)) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    html = html.replace(regex, () => {
      const ph = `\x00PH${placeholders.length}\x00`;
      placeholders.push(`<span class="${info.cls}" data-tip="${info.tip}">${word}</span>`);
      return ph;
    });
  }
  for (let i = 0; i < placeholders.length; i++) {
    html = html.split(`\x00PH${i}\x00`).join(placeholders[i]);
  }

  html = html.replace(/\n/g, "<br>");

  return html;
}
