// テストパネル — built-in test runner UI
import * as vscode from "vscode";
import { stripCodeBlocks, parseMeta, parseCompileError, normalizeJavaPractice, escapeHtml, enhanceTaskText } from "./parsers";
import { checkOutput } from "./outputChecker";
import { setResponseLang, getResponseLang, invalidateAiConfigCache } from "./aiHelpers";
import { TOPICS, LANG_ICONS } from "./constants";
import { TRANSLATIONS, UI_LANGUAGES } from "./i18n";
import { GITHUB_CODE_INDEX, pickRandomEntry } from "./githubIndex";

interface TestResult {
  suite: string;
  name: string;
  pass: boolean;
  error?: string;
}

function assertEqual(actual: any, expected: any, msg?: string): void {
  if (actual !== expected) {
    throw new Error(msg || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertIncludes(text: string, substr: string, msg?: string): void {
  if (!text.includes(substr)) {
    throw new Error(msg || `Expected string to include "${substr}", got: "${text.slice(0, 100)}"`);
  }
}

function assertNotIncludes(text: string, substr: string, msg?: string): void {
  if (text.includes(substr)) {
    throw new Error(msg || `Expected string NOT to include "${substr}", got: "${text.slice(0, 100)}"`);
  }
}

function assertOk(value: any, msg?: string): void {
  if (!value) {
    throw new Error(msg || `Expected truthy value, got ${JSON.stringify(value)}`);
  }
}

function assertThrows(fn: () => void, msg?: string): void {
  try {
    fn();
    throw new Error(msg || "Expected function to throw but it did not");
  } catch (e: any) {
    if (e.message === (msg || "Expected function to throw but it did not")) { throw e; }
  }
}

function parserTests(): { name: string; fn: () => void }[] {
  return [
    // stripCodeBlocks
    { name: "stripCodeBlocks: removes fences with lang", fn: () => assertEqual(stripCodeBlocks("```java\nint x = 1;\n```"), "int x = 1;") },
    { name: "stripCodeBlocks: removes fences without lang", fn: () => assertEqual(stripCodeBlocks("```\nhello\n```"), "hello") },
    { name: "stripCodeBlocks: no fences unchanged", fn: () => assertEqual(stripCodeBlocks("plain text"), "plain text") },
    { name: "stripCodeBlocks: empty string", fn: () => assertEqual(stripCodeBlocks(""), "") },
    { name: "stripCodeBlocks: null returns null", fn: () => assertEqual(stripCodeBlocks(null as any), null) },
    { name: "stripCodeBlocks: undefined returns undefined", fn: () => assertEqual(stripCodeBlocks(undefined as any), undefined) },
    { name: "stripCodeBlocks: multiple code blocks", fn: () => {
      const input = "```js\na\n```\ntext\n```ts\nb\n```";
      const r = stripCodeBlocks(input);
      assertNotIncludes(r, "```");
      assertIncludes(r, "a");
      assertIncludes(r, "b");
    }},
    { name: "stripCodeBlocks: trims whitespace", fn: () => assertEqual(stripCodeBlocks("  ```\n  code  \n```  "), "code") },

    // parseMeta
    { name: "parseMeta: basic fields", fn: () => {
      const r = parseMeta("TITLE: Sum\nTASK: Add nums\nEXPECTED_OUTPUT: 42");
      assertEqual(r.title, "Sum");
      assertEqual(r.task, "Add nums");
      assertEqual(r.expectedOutput, "42");
    }},
    { name: "parseMeta: HINT field", fn: () => assertEqual(parseMeta("TITLE: T\nTASK: D\nHINT: Use loop").hint, "Use loop") },
    { name: "parseMeta: OUTPUT fallback", fn: () => assertEqual(parseMeta("TITLE: T\nTASK: D\nOUTPUT: 99").expectedOutput, "99") },
    { name: "parseMeta: MINI_TEST fallback", fn: () => assertEqual(parseMeta("TITLE: T\nTASK: D\nMINI_TEST: 5").expectedOutput, "5") },
    { name: "parseMeta: multi-line task", fn: () => {
      const r = parseMeta("TITLE: T\nTASK: Line 1\nLine 2\nLine 3\nEXPECTED_OUTPUT: 5");
      assertIncludes(r.task, "Line 1");
      assertIncludes(r.task, "Line 2");
      assertIncludes(r.task, "Line 3");
      assertEqual(r.expectedOutput, "5");
    }},
    { name: "parseMeta: empty input", fn: () => {
      const r = parseMeta("");
      assertEqual(r.title, "");
      assertEqual(r.task, "");
      assertEqual(r.expectedOutput, "");
    }},
    { name: "parseMeta: case-insensitive keys", fn: () => {
      const r = parseMeta("title: Hello\ntask: Do\nexpected_output: 5");
      assertEqual(r.title, "Hello");
      assertEqual(r.expectedOutput, "5");
    }},
    { name: "parseMeta: BUG_EXPLANATION", fn: () => assertEqual(parseMeta("TITLE: T\nTASK: D\nBUG_EXPLANATION: Off by one").bugExplanation, "Off by one") },
    { name: "parseMeta: strips fences from expectedOutput", fn: () => assertEqual(parseMeta("TITLE: T\nTASK: D\nEXPECTED_OUTPUT: ```\n42\n```").expectedOutput, "42") },
    { name: "parseMeta: handles \\r\\n line endings", fn: () => {
      const r = parseMeta("TITLE: T\r\nTASK: Do\r\nEXPECTED_OUTPUT: 5");
      assertEqual(r.title, "T");
      assertEqual(r.expectedOutput, "5");
    }},
    { name: "parseMeta: DESCRIPTION as task fallback", fn: () => {
      const r = parseMeta("TITLE: T\nDESCRIPTION: Some desc");
      assertEqual(r.task, "Some desc");
    }},
    { name: "parseMeta: BUG_HINT field", fn: () => {
      const r = parseMeta("TITLE: T\nTASK: D\nBUG_HINT: Check index");
      assertEqual(r.hint, "Check index");
    }},
    { name: "parseMeta: TEST_CASES parsing", fn: () => {
      const meta = "TITLE: T\nTASK: D\nTEST_CASES:\n- input: [1,2] | output: 3\n- input: [0,0] | output: 0";
      const r = parseMeta(meta);
      assertOk(r.testCases);
      assertEqual(r.testCases!.length, 2);
      assertEqual(r.testCases![0].output, "3");
      assertEqual(r.testCases![1].output, "0");
    }},
    { name: "parseMeta: CALCULATION field", fn: () => {
      const r = parseMeta("TITLE: T\nTASK: D\nCALCULATION: 2+2=4");
      // CALCULATION is parsed but not directly exposed, shouldn't crash
      assertOk(r.title === "T");
    }},
    { name: "parseMeta: expectedOutput priority (EXPECTED_OUTPUT > OUTPUT > MINI_TEST)", fn: () => {
      const r = parseMeta("TITLE: T\nTASK: D\nMINI_TEST: 1\nOUTPUT: 2\nEXPECTED_OUTPUT: 3");
      assertEqual(r.expectedOutput, "3");
    }},

    // parseCompileError
    { name: "parseCompileError: extracts line number", fn: () => assertIncludes(parseCompileError("Practice.java:7: error: ';' expected", "Java"), "7") },
    { name: "parseCompileError: garbled + semicolon", fn: () => {
      const r = parseCompileError("Practice.java:3: \u0080\u0081\u0082: ';'", "Java");
      assertIncludes(r.toLowerCase(), "semicolon");
      assertIncludes(r, "3");
    }},
    { name: "parseCompileError: garbled + cannot find symbol", fn: () => {
      const r = parseCompileError("Practice.java:5: \u0080\u0081\u0082: cannot find symbol\nresult", "Java");
      assertOk(r.toLowerCase().includes("not found") || r.toLowerCase().includes("symbol"));
    }},
    { name: "parseCompileError: garbled + parenthesis", fn: () => {
      assertIncludes(parseCompileError("Practice.java:2: \u0080\u0081\u0082: ')'", "Java").toLowerCase(), "parenthesis");
    }},
    { name: "parseCompileError: garbled + brace", fn: () => {
      assertIncludes(parseCompileError("Practice.java:4: \u0080\u0081\u0082: '}'", "Java").toLowerCase(), "brace");
    }},
    { name: "parseCompileError: empty error", fn: () => assertOk(parseCompileError("", "Java").length > 0) },
    { name: "parseCompileError: readable error simplified", fn: () => {
      const r = parseCompileError("Practice.java:10: error: incompatible types\n  found: String\n  required: int", "Java");
      assertIncludes(r, "10");
    }},
    { name: "parseCompileError: limits output length", fn: () => {
      const r = parseCompileError("x".repeat(1000), "Java");
      assertOk(r.length <= 600);
    }},
    { name: "parseCompileError: not a statement", fn: () => {
      const r = parseCompileError("Practice.java:6: \u0080\u0081\u0082: not a statement", "Java");
      assertIncludes(r.toLowerCase(), "statement");
    }},

    // normalizeJavaPractice
    { name: "normalizeJava: renames public class", fn: () => assertIncludes(normalizeJavaPractice("public class Foo {\n}"), "public class Practice") },
    { name: "normalizeJava: renames class Main", fn: () => assertIncludes(normalizeJavaPractice("class Main {\n}"), "class Practice") },
    { name: "normalizeJava: Practice stays", fn: () => assertEqual(normalizeJavaPractice("public class Practice {\n}"), "public class Practice {\n}") },
    { name: "normalizeJava: empty input", fn: () => assertEqual(normalizeJavaPractice(""), "") },
    { name: "normalizeJava: null input", fn: () => assertEqual(normalizeJavaPractice(null as any), "") },
    { name: "normalizeJava: preserves inner class", fn: () => {
      const r = normalizeJavaPractice("public class Foo {\n  class Inner {}\n}");
      assertIncludes(r, "public class Practice");
      assertIncludes(r, "class Inner");
    }},

    // escapeHtml
    { name: "escapeHtml: angle brackets", fn: () => assertEqual(escapeHtml("<b>"), "&lt;b&gt;") },
    { name: "escapeHtml: ampersand", fn: () => assertEqual(escapeHtml("a & b"), "a &amp; b") },
    { name: "escapeHtml: newline to br", fn: () => assertEqual(escapeHtml("a\nb"), "a<br>b") },
    { name: "escapeHtml: double quotes", fn: () => assertIncludes(escapeHtml('"x"'), "&quot;") },
    { name: "escapeHtml: single quotes", fn: () => assertIncludes(escapeHtml("'x'"), "&#039;") },
    { name: "escapeHtml: empty", fn: () => assertEqual(escapeHtml(""), "") },
    { name: "escapeHtml: all special chars together", fn: () => {
      const r = escapeHtml('<a href="x">&');
      assertNotIncludes(r, "<a");
      assertIncludes(r, "&amp;");
      assertIncludes(r, "&lt;");
    }},

    // enhanceTaskText
    { name: "enhanceTaskText: wraps backtick code in <code>", fn: () => {
      const r = enhanceTaskText("Use `myVar` to store");
      assertIncludes(r, "<code>myVar</code>");
    }},
    { name: "enhanceTaskText: Java type keyword spans", fn: () => {
      const r = enhanceTaskText("Declare an int variable");
      assertIncludes(r, 'class="kw-type"');
      assertIncludes(r, "int");
    }},
    { name: "enhanceTaskText: control flow keyword spans", fn: () => {
      const r = enhanceTaskText("Use a for loop");
      assertIncludes(r, 'class="keyword"');
    }},
    { name: "enhanceTaskText: strips code blocks", fn: () => {
      const r = enhanceTaskText("Do this:\n```java\nint x = 1;\n```\nDone.");
      assertNotIncludes(r, "```");
      assertIncludes(r, "Do this:");
    }},
    { name: "enhanceTaskText: converts newlines to <br>", fn: () => {
      assertIncludes(enhanceTaskText("Line 1\nLine 2"), "<br>");
    }},
    { name: "enhanceTaskText: escapes HTML entities", fn: () => {
      const r = enhanceTaskText("a < b && c > d");
      assertIncludes(r, "&amp;");
    }},
    { name: "enhanceTaskText: code-only input returns something", fn: () => {
      const r = enhanceTaskText("```java\nint x = 1;\n```");
      assertOk(r.length > 0);
    }},
    { name: "enhanceTaskText: method keyword (println)", fn: () => {
      const r = enhanceTaskText("Call println to output");
      assertIncludes(r, 'class="kw-method"');
    }},
    { name: "enhanceTaskText: value keyword (true/false/null)", fn: () => {
      const r = enhanceTaskText("Set value to true");
      assertIncludes(r, 'class="kw-value"');
    }},
    { name: "enhanceTaskText: multiple keywords in one text", fn: () => {
      const r = enhanceTaskText("Use a for loop with int counter and println");
      assertIncludes(r, 'class="keyword"');
      assertIncludes(r, 'class="kw-type"');
      assertIncludes(r, 'class="kw-method"');
    }},
    { name: "enhanceTaskText: tooltip data-tip attribute", fn: () => {
      const r = enhanceTaskText("Declare an int");
      assertIncludes(r, 'data-tip="');
    }},
  ];
}

function outputCheckerTests(): { name: string; fn: () => void }[] {
  const mock = { appendLine: () => {} } as any;
  const base = { lang: "Java", topic: "Array", task: "Sum", code: "public class Practice {\n  public static void main(String[] args) {\n    // YOUR CODE HERE\n  }\n}", expectedOutput: "42" };
  const withLogic = "public class Practice {\n  public static void main(String[] args) {\n    int sum = 0;\n    for (int i = 0; i < 10; i++) sum += i;\n    System.out.println(sum);\n  }\n}";
  const withMethod = "public class Practice {\n  public static void main(String[] args) {\n    int[] a = {1,2};\n    java.util.Arrays.sort(a);\n    System.out.println(a[0]);\n  }\n}";

  return [
    // Basic pass/fail
    { name: "PASS: output matches expected", fn: () => assertEqual(checkOutput("42", base, mock, withLogic).pass, true) },
    { name: "FAIL: output mismatch", fn: () => assertEqual(checkOutput("99", base, mock, withLogic).pass, false) },
    { name: "FAIL: error in output", fn: () => assertEqual(checkOutput("error: NPE", base, mock).pass, false) },
    { name: "FAIL: exception in output", fn: () => assertEqual(checkOutput("ArrayIndexOutOfBoundsException", base, mock).pass, false) },
    { name: "FAIL: unchanged code (starter template)", fn: () => assertEqual(checkOutput("42", base, mock, base.code).pass, false) },

    // Normalization
    { name: "PASS: whitespace normalization", fn: () => assertEqual(checkOutput("hello  world", { ...base, expectedOutput: "hello world" }, mock, withLogic).pass, true) },
    { name: "PASS: numeric precision 45.0 == 45", fn: () => {
      const code = "public class Practice {\n  public static void main(String[] args) {\n    double[] a = {10.0, 45.0};\n    double sum = 0;\n    for (double v : a) sum += v;\n    System.out.println(sum);\n  }\n}";
      assertEqual(checkOutput("45.0", { ...base, expectedOutput: "45" }, mock, code).pass, true);
    }},
    { name: "PASS: pipe spacing normalization", fn: () => {
      assertEqual(checkOutput("A | B | C", { ...base, expectedOutput: "A|B|C" }, mock, withLogic).pass, true);
    }},

    // Expected output formats
    { name: "PASS: skips comment lines in expected", fn: () => assertEqual(checkOutput("5", { ...base, expectedOutput: "// comment\n5" }, mock, withLogic).pass, true) },
    { name: "PASS: skips separator lines (-----)", fn: () => assertEqual(checkOutput("10", { ...base, expectedOutput: "-----\n10\n-----" }, mock, withLogic).pass, true) },
    { name: "PASS: Key: Value format", fn: () => assertEqual(checkOutput("10", { ...base, expectedOutput: "Result: 10" }, mock, withLogic).pass, true) },
    { name: "strips fences from expected", fn: () => assertEqual(checkOutput("0\n1\n2", { ...base, expectedOutput: "```\n0\n1\n2\n```" }, mock, withLogic).pass, true) },

    // Multi-line expected output
    { name: "PASS: multi-line expected all present", fn: () => {
      assertEqual(checkOutput("hello\nworld\n42", { ...base, expectedOutput: "hello\nworld\n42" }, mock, withLogic).pass, true);
    }},
    { name: "FAIL: multi-line expected partial missing", fn: () => {
      assertEqual(checkOutput("hello\nworld", { ...base, expectedOutput: "hello\nworld\n42" }, mock, withLogic).pass, false);
    }},

    // No expectedOutput
    { name: "PASS: no expectedOutput + has output", fn: () => assertEqual(checkOutput("something", { ...base, expectedOutput: undefined }, mock).pass, true) },
    { name: "FAIL: no expectedOutput + empty output", fn: () => assertEqual(checkOutput("", { ...base, expectedOutput: undefined }, mock).pass, false) },

    // Code logic (anti-cheat)
    { name: "PASS: method calls count as logic", fn: () => {
      const r = checkOutput("1", { ...base, expectedOutput: "1" }, mock, withMethod);
      assertEqual(r.pass, true);
      const logic = r.testResults?.find(t => t.name === "Code Logic");
      assertEqual(logic?.pass, true);
    }},
    { name: "FAIL: no logic (hardcoded println)", fn: () => {
      const code = "public class Practice {\n  public static void main(String[] args) {\n    System.out.println(42);\n  }\n}";
      assertEqual(checkOutput("42", base, mock, code).pass, false);
    }},
    { name: "PASS: operators count as logic", fn: () => {
      const code = "public class Practice {\n  public static void main(String[] args) {\n    int[] nums = {20, 22};\n    int result = 0;\n    for (int n : nums) result += n;\n    System.out.println(result);\n  }\n}";
      assertEqual(checkOutput("42", base, mock, code).pass, true);
    }},
    { name: "testResults array is populated", fn: () => {
      const r = checkOutput("42", base, mock, withLogic);
      assertOk(r.testResults);
      assertOk(r.testResults!.length >= 2);
      assertEqual(r.testResults![0].name, "Output Correctness");
      assertEqual(r.testResults![1].name, "Code Logic");
    }},

    // SQL
    { name: "SQL: PASS with keywords", fn: () => {
      const sqlPractice = { ...base, lang: "SQL", code: "", expectedOutput: "Alice" };
      assertEqual(checkOutput("Alice", sqlPractice, mock, "SELECT name FROM users WHERE age > 18;").pass, true);
    }},
    { name: "SQL: FAIL without SQL work", fn: () => {
      const sqlPractice = { ...base, lang: "SQL", code: "", expectedOutput: "Alice" };
      assertEqual(checkOutput("Alice", sqlPractice, mock, "-- nothing").pass, false);
    }},
    { name: "SQL: detects SQL by code content", fn: () => {
      const sqlPractice = { ...base, lang: "SQL", code: "", expectedOutput: "3" };
      const r = checkOutput("3", sqlPractice, mock, "SELECT COUNT(*) FROM orders WHERE status = 'active';");
      assertEqual(r.pass, true);
      const sqlTest = r.testResults?.find(t => t.name === "SQL Query");
      assertOk(sqlTest);
      assertEqual(sqlTest!.pass, true);
    }},
    { name: "SQL: shows detected clauses", fn: () => {
      const sqlPractice = { ...base, lang: "SQL", code: "", expectedOutput: "10" };
      const r = checkOutput("10", sqlPractice, mock, "SELECT name FROM users WHERE id > 5 ORDER BY name;");
      const sqlTest = r.testResults?.find(t => t.name === "SQL Query");
      assertIncludes(sqlTest!.got, "SELECT");
      assertIncludes(sqlTest!.got, "WHERE");
      assertIncludes(sqlTest!.got, "ORDER BY");
    }},
    { name: "SQL: JOIN detection", fn: () => {
      const sqlPractice = { ...base, lang: "SQL", code: "", expectedOutput: "x" };
      const r = checkOutput("x", sqlPractice, mock, "SELECT u.name FROM users u JOIN orders o ON u.id = o.user_id WHERE o.total > 100;");
      const sqlTest = r.testResults?.find(t => t.name === "SQL Query");
      assertIncludes(sqlTest!.got, "JOIN");
    }},
    { name: "SQL: GROUP BY detection", fn: () => {
      const sqlPractice = { ...base, lang: "SQL", code: "", expectedOutput: "5" };
      const r = checkOutput("5", sqlPractice, mock, "SELECT category, COUNT(*) FROM products GROUP BY category;");
      const sqlTest = r.testResults?.find(t => t.name === "SQL Query");
      assertIncludes(sqlTest!.got, "GROUP BY");
    }},

    // Edge cases
    { name: "PASS: case-insensitive error detection", fn: () => {
      assertEqual(checkOutput("ERROR: something", base, mock).pass, false);
    }},
    { name: "Code Modified check returns proper result", fn: () => {
      const r = checkOutput("42", base, mock, base.code);
      const modTest = r.testResults?.find(t => t.name === "Code Modified");
      assertOk(modTest);
      assertEqual(modTest!.pass, false);
    }},
  ];
}

function aiHelperTests(): { name: string; fn: () => void }[] {
  return [
    { name: "setResponseLang + getResponseLang round-trip", fn: () => { setResponseLang("tr"); assertEqual(getResponseLang(), "tr"); } },
    { name: "setResponseLang to ja", fn: () => { setResponseLang("ja"); assertEqual(getResponseLang(), "ja"); } },
    { name: "reset to en", fn: () => { setResponseLang("en"); assertEqual(getResponseLang(), "en"); } },
    { name: "invalidateAiConfigCache no throw", fn: () => { invalidateAiConfigCache(); } },
  ];
}

function i18nTests(): { name: string; fn: () => void }[] {
  const enKeys = Object.keys(TRANSLATIONS.en).sort();
  const jaKeys = Object.keys(TRANSLATIONS.ja).sort();
  const trKeys = Object.keys(TRANSLATIONS.tr).sort();

  return [
    // UI_LANGUAGES
    { name: "UI_LANGUAGES has 3 entries", fn: () => assertEqual(UI_LANGUAGES.length, 3) },
    { name: "UI_LANGUAGES: en exists", fn: () => assertOk(UI_LANGUAGES.find(l => l.code === "en")) },
    { name: "UI_LANGUAGES: ja exists", fn: () => assertOk(UI_LANGUAGES.find(l => l.code === "ja")) },
    { name: "UI_LANGUAGES: tr exists", fn: () => assertOk(UI_LANGUAGES.find(l => l.code === "tr")) },
    { name: "UI_LANGUAGES: all have label and flag", fn: () => {
      for (const l of UI_LANGUAGES) {
        assertOk(l.label.length > 0, `Missing label for ${l.code}`);
        assertOk(l.flag.length > 0, `Missing flag for ${l.code}`);
      }
    }},

    // TRANSLATIONS completeness
    { name: "English has translations", fn: () => assertOk(enKeys.length > 50, `EN has only ${enKeys.length} keys`) },
    { name: "Japanese has same keys as English", fn: () => {
      assertEqual(jaKeys.length, enKeys.length, `JA has ${jaKeys.length} keys but EN has ${enKeys.length}`);
      for (const key of enKeys) {
        assertOk(key in TRANSLATIONS.ja, `JA missing key: "${key}"`);
      }
    }},
    { name: "Turkish has same keys as English", fn: () => {
      assertEqual(trKeys.length, enKeys.length, `TR has ${trKeys.length} keys but EN has ${enKeys.length}`);
      for (const key of enKeys) {
        assertOk(key in TRANSLATIONS.tr, `TR missing key: "${key}"`);
      }
    }},
    { name: "No empty values in English", fn: () => {
      for (const [key, val] of Object.entries(TRANSLATIONS.en)) {
        assertOk(val.length > 0, `EN key "${key}" has empty value`);
      }
    }},
    { name: "No empty values in Japanese", fn: () => {
      for (const [key, val] of Object.entries(TRANSLATIONS.ja)) {
        assertOk(val.length > 0, `JA key "${key}" has empty value`);
      }
    }},
    { name: "No empty values in Turkish", fn: () => {
      for (const [key, val] of Object.entries(TRANSLATIONS.tr)) {
        assertOk(val.length > 0, `TR key "${key}" has empty value`);
      }
    }},

    // Key categories exist
    { name: "Has tab.* keys", fn: () => assertOk(enKeys.filter(k => k.startsWith("tab.")).length >= 2) },
    { name: "Has practice.* keys", fn: () => assertOk(enKeys.filter(k => k.startsWith("practice.")).length >= 10) },
    { name: "Has progress.* keys", fn: () => assertOk(enKeys.filter(k => k.startsWith("progress.")).length >= 10) },
    { name: "Has loading.* keys", fn: () => assertOk(enKeys.filter(k => k.startsWith("loading.")).length >= 5) },
    { name: "Has settings.* keys", fn: () => assertOk(enKeys.filter(k => k.startsWith("settings.")).length >= 5) },
    { name: "Has msg.* keys", fn: () => assertOk(enKeys.filter(k => k.startsWith("msg.")).length >= 5) },
    { name: "Has xp.* keys", fn: () => assertOk(enKeys.filter(k => k.startsWith("xp.")).length >= 3) },
    { name: "Has level.* keys", fn: () => assertOk(enKeys.filter(k => k.startsWith("level.")).length >= 3) },
    { name: "Has custom.* keys", fn: () => assertOk(enKeys.filter(k => k.startsWith("custom.")).length >= 3) },
  ];
}

function githubIndexTests(): { name: string; fn: () => void }[] {
  return [
    // GITHUB_CODE_INDEX structure
    { name: "Index has entries", fn: () => assertOk(GITHUB_CODE_INDEX.length > 90) },
    { name: "All entries have required fields", fn: () => {
      for (const e of GITHUB_CODE_INDEX) {
        assertOk(e.repo.length > 0, `Entry missing repo`);
        assertOk(e.branch.length > 0, `Entry ${e.repo} missing branch`);
        assertOk(e.path.length > 0, `Entry ${e.repo} missing path`);
        assertOk(e.lang.length > 0, `Entry ${e.repo} missing lang`);
        assertOk(e.topics.length > 0, `Entry ${e.repo} missing topics`);
        assertOk(e.minLevel >= 1 && e.minLevel <= 5, `Entry ${e.repo} invalid minLevel: ${e.minLevel}`);
        assertOk(e.maxLevel >= 1 && e.maxLevel <= 5, `Entry ${e.repo} invalid maxLevel: ${e.maxLevel}`);
        assertOk(e.minLevel <= e.maxLevel, `Entry ${e.repo} minLevel > maxLevel`);
        assertOk(e.size === "snippet" || e.size === "codebase", `Entry ${e.repo} invalid size: ${e.size}`);
      }
    }},
    { name: "Has Java entries", fn: () => assertOk(GITHUB_CODE_INDEX.filter(e => e.lang === "Java").length > 20) },
    { name: "Has TypeScript entries", fn: () => assertOk(GITHUB_CODE_INDEX.filter(e => e.lang === "TypeScript").length > 10) },
    { name: "Has SQL entries", fn: () => assertOk(GITHUB_CODE_INDEX.filter(e => e.lang === "SQL").length > 3) },
    { name: "Has snippet and codebase entries", fn: () => {
      assertOk(GITHUB_CODE_INDEX.filter(e => e.size === "snippet").length > 10);
      assertOk(GITHUB_CODE_INDEX.filter(e => e.size === "codebase").length > 10);
    }},

    // pickRandomEntry
    { name: "pickRandomEntry: returns entry for Java+Array", fn: () => {
      const e = pickRandomEntry("Java", "Array", 2);
      assertOk(e);
      assertEqual(e!.lang, "Java");
      assertOk(e!.topics.includes("Array"));
    }},
    { name: "pickRandomEntry: returns entry for TypeScript+Functions", fn: () => {
      const e = pickRandomEntry("TypeScript", "Functions", 2);
      assertOk(e);
      assertEqual(e!.lang, "TypeScript");
    }},
    { name: "pickRandomEntry: returns entry for SQL", fn: () => {
      const e = pickRandomEntry("SQL", "SELECT Basics", 1);
      assertOk(e);
      assertEqual(e!.lang, "SQL");
    }},
    { name: "pickRandomEntry: returns null for unknown lang", fn: () => {
      assertEqual(pickRandomEntry("Rust", "Array", 1), null);
    }},
    { name: "pickRandomEntry: size filter works (snippet)", fn: () => {
      const e = pickRandomEntry("Java", "Array", 1, "snippet");
      assertOk(e);
      assertEqual(e!.size, "snippet");
    }},
    { name: "pickRandomEntry: size filter works (codebase)", fn: () => {
      const e = pickRandomEntry("Java", "String", 3, "codebase");
      assertOk(e);
      assertEqual(e!.size, "codebase");
    }},
    { name: "pickRandomEntry: fallback to broader match", fn: () => {
      // Use a very high level that might not match exactly but should fallback
      const e = pickRandomEntry("Java", "Array", 3);
      assertOk(e);
      assertEqual(e!.lang, "Java");
    }},
    { name: "pickRandomEntry: fallback to lang only", fn: () => {
      // Use a fake topic that doesn't exist
      const e = pickRandomEntry("Java", "NonExistentTopic99", 3);
      assertOk(e);
      assertEqual(e!.lang, "Java");
    }},
    { name: "pickRandomEntry: level range respected in exact match", fn: () => {
      // Level 1 should match beginner entries
      const e = pickRandomEntry("Java", "Array", 1, "snippet");
      assertOk(e);
      assertOk(e!.minLevel <= 1);
      assertOk(e!.maxLevel >= 1);
    }},
  ];
}

function constantsTests(): { name: string; fn: () => void }[] {
  return [
    // TOPICS
    { name: "TOPICS has Java", fn: () => assertOk("Java" in TOPICS) },
    { name: "TOPICS has TypeScript", fn: () => assertOk("TypeScript" in TOPICS) },
    { name: "TOPICS has SQL", fn: () => assertOk("SQL" in TOPICS) },
    { name: "Java has 6 topics", fn: () => assertEqual(TOPICS.Java.length, 6) },
    { name: "TypeScript has 6 topics", fn: () => assertEqual(TOPICS.TypeScript.length, 6) },
    { name: "SQL has 6 topics", fn: () => assertEqual(TOPICS.SQL.length, 6) },
    { name: "Java topics include Array", fn: () => assertOk(TOPICS.Java.includes("Array")) },
    { name: "Java topics include String", fn: () => assertOk(TOPICS.Java.includes("String")) },
    { name: "Java topics include Methods", fn: () => assertOk(TOPICS.Java.includes("Methods")) },
    { name: "TypeScript topics include Functions", fn: () => assertOk(TOPICS.TypeScript.includes("Functions")) },
    { name: "TypeScript topics include Type Basics", fn: () => assertOk(TOPICS.TypeScript.includes("Type Basics")) },
    { name: "SQL topics include SELECT Basics", fn: () => assertOk(TOPICS.SQL.includes("SELECT Basics")) },
    { name: "SQL topics include JOIN Basics", fn: () => assertOk(TOPICS.SQL.includes("JOIN Basics")) },
    { name: "All topic arrays have no empty strings", fn: () => {
      for (const [lang, topics] of Object.entries(TOPICS)) {
        for (const t of topics) {
          assertOk(t.length > 0, `${lang} has empty topic`);
        }
      }
    }},

    // LANG_ICONS
    { name: "LANG_ICONS has Java", fn: () => assertOk("Java" in LANG_ICONS) },
    { name: "LANG_ICONS has TypeScript", fn: () => assertOk("TypeScript" in LANG_ICONS) },
    { name: "LANG_ICONS has SQL", fn: () => assertOk("SQL" in LANG_ICONS) },
    { name: "All LANG_ICONS keys match TOPICS keys", fn: () => {
      for (const lang of Object.keys(TOPICS)) {
        assertOk(lang in LANG_ICONS, `LANG_ICONS missing ${lang}`);
      }
    }},
  ];
}

function runAllSuites(): TestResult[] {
  const suites = [
    { name: "Parsers", tests: parserTests() },
    { name: "OutputChecker", tests: outputCheckerTests() },
    { name: "AIHelpers", tests: aiHelperTests() },
    { name: "i18n", tests: i18nTests() },
    { name: "GitHubIndex", tests: githubIndexTests() },
    { name: "Constants", tests: constantsTests() },
  ];

  const results: TestResult[] = [];

  for (const suite of suites) {
    for (const t of suite.tests) {
      try {
        t.fn();
        results.push({ suite: suite.name, name: t.name, pass: true });
      } catch (e: any) {
        results.push({ suite: suite.name, name: t.name, pass: false, error: e?.message || String(e) });
      }
    }
  }

  return results;
}

let testPanel: vscode.WebviewPanel | undefined;

/** テストパネル表示 — open test runner panel */
export function openTestPanel(): void {
  if (testPanel) {
    testPanel.reveal();
  } else {
    testPanel = vscode.window.createWebviewPanel(
      "codepracticeTests",
      "CodePractice Tests",
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: false }
    );
    testPanel.onDidDispose(() => { testPanel = undefined; });
  }

  // Run tests
  const results = runAllSuites();
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const total = results.length;

  testPanel.webview.html = getTestPanelHtml(results, total, passed, failed);

  // Handle re-run
  testPanel.webview.onDidReceiveMessage(msg => {
    if (msg.type === "rerun" && testPanel) {
      const r2 = runAllSuites();
      const p2 = r2.filter(r => r.pass).length;
      const f2 = r2.filter(r => !r.pass).length;
      testPanel.webview.html = getTestPanelHtml(r2, r2.length, p2, f2);
    }
  });
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getTestPanelHtml(results: TestResult[], total: number, passed: number, failed: number): string {
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const allPass = failed === 0;

  // Group by suite
  const suites = new Map<string, TestResult[]>();
  for (const r of results) {
    if (!suites.has(r.suite)) { suites.set(r.suite, []); }
    suites.get(r.suite)!.push(r);
  }

  let suitesHtml = "";
  for (const [name, tests] of suites) {
    const suitePassed = tests.filter(t => t.pass).length;
    const suiteTotal = tests.length;
    const suiteIcon = suitePassed === suiteTotal ? "&#10004;" : "&#10008;";
    const suiteColor = suitePassed === suiteTotal ? "#4aba6a" : "#e5534b";

    let testsHtml = "";
    for (const t of tests) {
      const icon = t.pass ? "&#10004;" : "&#10008;";
      const color = t.pass ? "#4aba6a" : "#e5534b";
      const errorHtml = t.error ? `<div class="error">${esc(t.error)}</div>` : "";
      testsHtml += `<div class="test-row"><span class="icon" style="color:${color}">${icon}</span><span class="test-name">${esc(t.name)}</span>${errorHtml}</div>`;
    }

    suitesHtml += `
      <div class="suite">
        <div class="suite-header">
          <span class="icon" style="color:${suiteColor}">${suiteIcon}</span>
          <span class="suite-name">${esc(name)}</span>
          <span class="suite-count">${suitePassed}/${suiteTotal}</span>
        </div>
        <div class="suite-tests">${testsHtml}</div>
      </div>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--vscode-editor-background, #1e1e2e); color: var(--vscode-foreground, #cdd6f4); padding: 20px; }

  .summary { text-align: center; margin-bottom: 24px; }
  .summary-text { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
  .summary-text.pass { color: #4aba6a; }
  .summary-text.fail { color: #e5534b; }
  .summary-sub { font-size: 13px; color: #888; }

  .progress-bar { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; margin: 12px auto; max-width: 400px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
  .progress-fill.pass { background: #4aba6a; }
  .progress-fill.fail { background: linear-gradient(90deg, #4aba6a ${pct}%, #e5534b ${pct}%); }

  .suite { margin-bottom: 16px; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; }
  .suite-header { display: flex; align-items: center; gap: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 8px; }
  .suite-name { font-weight: 600; font-size: 14px; flex: 1; }
  .suite-count { font-size: 12px; color: #888; }

  .test-row { display: flex; align-items: flex-start; gap: 8px; padding: 4px 0; font-size: 12px; }
  .icon { font-size: 12px; flex-shrink: 0; width: 16px; text-align: center; }
  .test-name { flex: 1; }
  .error { color: #e5534b; font-size: 11px; background: rgba(229,83,75,0.08); padding: 4px 8px; border-radius: 4px; margin-top: 2px; font-family: monospace; word-break: break-all; }

  .rerun-btn { display: block; margin: 24px auto 0; padding: 8px 24px; background: #7c3aed; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .rerun-btn:hover { background: #6d28d9; }
</style>
</head>
<body>
  <div class="summary">
    <div class="summary-text ${allPass ? "pass" : "fail"}">${allPass ? "&#10004;" : "&#10008;"} ${passed}/${total} passed</div>
    <div class="summary-sub">${failed > 0 ? failed + " failed" : "All tests passed!"}</div>
    <div class="progress-bar"><div class="progress-fill ${allPass ? "pass" : "fail"}" style="width:${pct}%"></div></div>
  </div>
  ${suitesHtml}
  <button class="rerun-btn" onclick="vscode.postMessage({type:'rerun'})">Re-run Tests</button>
  <script>var vscode = acquireVsCodeApi();</script>
</body>
</html>`;
}
