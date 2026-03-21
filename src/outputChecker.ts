// 出力チェック — check student code output against expected
import * as vscode from "vscode";
import { PracticeData } from "./constants";
import { stripCodeBlocks } from "./parsers";

/** Detect actual compile/runtime errors vs normal output containing "error" */
function looksLikeRuntimeError(output: string): boolean {
  const lower = output.toLowerCase();
  // Java/TS compile and runtime error patterns
  return /\b(syntaxerror|typeerror|referenceerror|rangeerror|compileerror)\b/.test(lower) ||
    /\bat\s+[\w.$]+\([\w.]+:\d+\)/.test(output) || // stack trace line
    /^\s*error\s*:/im.test(output) || // "error:" prefix
    /exception in thread/i.test(output) ||
    /cannot find symbol/i.test(output) ||
    /java\.lang\.\w*exception/i.test(lower) ||
    /\berror\b.*\bline\s*\d+/i.test(output);
}

/** 出力正規化 — normalize for comparison (lang-aware) */
export function normalizeOutput(s: string, lang?: string): string {
  let result = s
    .replace(/\r\n/g, "\n")             // CRLF → LF
    .replace(/\s*\|\s*/g, "|");          // pipe spacing normalize

  // Decorative line removal — skip for SQL (no decorative lines in SQL output)
  if (lang !== "SQL") {
    result = result.replace(/[-=]{3,}/g, "");
  }

  result = result
    .replace(/(\d+)\.0+\b/g, "$1")       // 1200.0 → 1200
    .replace(/(\d+\.\d{1,10}?)0{4,}\d*/g, "$1")  // trailing zeros
    .replace(/(\d+\.\d{1,10}?)9{4,}\d*/g, (_, prefix) => {
      const n = parseFloat(prefix + "999");
      const decimals = (prefix.split(".")[1] || "").length;
      return decimals > 0 ? n.toFixed(Math.max(decimals - 1, 1)) : String(Math.round(n));
    })
    .replace(/\s+/g, " ")               // collapse whitespace
    .replace(/\[\s+/g, "[")             // [ 1, 2 ] → [1,2]
    .replace(/\s+\]/g, "]")
    .replace(/\{\s+/g, "{")             // { key: val } → {key:val}
    .replace(/\s+\}/g, "}")
    .replace(/,\s+/g, ",")              // ", " → ","
    .replace(/:\s+/g, ":")              // ": " → ":"
    .replace(/"\s*:\s*/g, '":')         // "key" : → "key":
    .trim()
    .toLowerCase();

  return result;
}

/** Numeric comparison with epsilon tolerance for floating-point rounding differences */
export function numericMatch(a: string, b: string): boolean {
  const na = parseFloat(a.trim()), nb = parseFloat(b.trim());
  if (isNaN(na) || isNaN(nb)) { return false; }
  if (na === nb) { return true; }
  const eps = Math.max(Math.abs(nb) * 0.005, 0.01);
  return Math.abs(na - nb) <= eps;
}

/** JSON deep equal — key-order-independent object comparison */
export function jsonDeepEqual(a: string, b: string): boolean {
  try {
    const objA = JSON.parse(a.trim());
    const objB = JSON.parse(b.trim());
    return JSON.stringify(sortKeys(objA)) === JSON.stringify(sortKeys(objB));
  } catch { return false; }
}

function sortKeys(obj: any): any {
  if (Array.isArray(obj)) { return obj.map(sortKeys); }
  if (obj && typeof obj === "object") {
    return Object.keys(obj).sort().reduce((acc: any, k) => { acc[k] = sortKeys(obj[k]); return acc; }, {});
  }
  return obj;
}

interface CheckResult {
  pass: boolean;
  testResults?: { name: string; pass: boolean; expected: string; got: string }[];
}

/** API出力判定 — check API practice output */
export function checkApiOutput(
  output: string,
  expectedFields: string[]
): CheckResult {
  const trimmed = output.trim();
  const testResults: { name: string; pass: boolean; expected: string; got: string }[] = [];

  const isError = !trimmed ||
    (/error|exception|enoent|econnrefused|fetch failed|cannot find/i.test(trimmed) &&
    trimmed.length < 200);

  testResults.push({
    name: "API Response",
    pass: !isError && trimmed.length > 5,
    expected: "Valid API response (no errors)",
    got: isError ? trimmed.slice(0, 100) : `${trimmed.length} chars of output`
  });

  const outputLower = trimmed.toLowerCase();
  for (const field of expectedFields) {
    const fieldLower = field.toLowerCase();
    const found = outputLower.includes(fieldLower);
    testResults.push({
      name: `Field: ${field}`,
      pass: found,
      expected: `Output contains "${field}"`,
      got: found ? "Found" : "Not found in output"
    });
  }

  const hasData = trimmed.split("\n").some(line => {
    const parts = line.split(":");
    return parts.length >= 2 && parts[1].trim().length > 0;
  });
  testResults.push({
    name: "Data Values",
    pass: hasData,
    expected: "Output contains actual data values (not just labels)",
    got: hasData ? "Data values found" : "No data values detected"
  });

  const allPass = testResults.every(t => t.pass);
  return { pass: allPass, testResults };
}

/** 出力判定 — check output correctness + code logic */
export function checkOutput(
  output: string,
  practice: PracticeData,
  outputChannel: vscode.OutputChannel,
  currentFileCode?: string
): CheckResult {
  if (currentFileCode && practice.code) {
    const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
    if (normalize(currentFileCode) === normalize(practice.code)) {
      outputChannel.appendLine("[Judge] Code is unchanged from starter — auto-fail");
      return {
        pass: false,
        testResults: [{
          name: "Code Modified",
          pass: false,
          expected: "You must modify the code",
          got: "Code is unchanged from starter template"
        }]
      };
    }
  }

  if (!practice.expectedOutput) {
    const pass = output.trim().length > 0 && !looksLikeRuntimeError(output);
    return { pass };
  }

  const expected = stripCodeBlocks(practice.expectedOutput);
  const actualOutput = output.trim();

  if (looksLikeRuntimeError(actualOutput)) {
    return {
      pass: false,
      testResults: [{
        name: "Compilation / Runtime",
        pass: false,
        expected: "No errors",
        got: actualOutput.slice(0, 120)
      }]
    };
  }

  const expectedLines = expected.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const lang = practice.lang || "";
  const outputNorm = normalizeOutput(actualOutput, lang);
  let mainPass = true;

  /** Check if all expected lines appear in the given normalized output */
  const checkLinesAgainst = (normOutput: string): boolean => {
    for (const line of expectedLines) {
      if (line.startsWith("//") || line.startsWith("#") || line.startsWith("--") || line.startsWith("-")) { continue; }
      if (/^[-=]+$/.test(line)) { continue; }
      let value = line;
      const colonMatch = line.match(/^[\w\s]{1,30}[:=]\s*(.+)$/);
      if (colonMatch) { value = colonMatch[1]; }
      value = value.trim();
      if (!value) { continue; }
      const normValue = normalizeOutput(value, lang);
      if (normOutput.includes(normValue)) { continue; }
      // Fallback: try numeric epsilon match for pure numbers
      if (numericMatch(value, actualOutput.trim())) { continue; }
      // Fallback: try JSON deep equal for object/array output
      if (jsonDeepEqual(value, actualOutput.trim())) { continue; }
      return false;
    }
    return true;
  };

  if (expectedLines.length === 0) {
    mainPass = actualOutput.length > 0;
  } else {
    mainPass = checkLinesAgainst(outputNorm);
  }

  // SQL fallback: try without column header row (SQL runner prepends headers)
  if (!mainPass && (lang === "SQL" || /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/im.test(currentFileCode || ""))) {
    const outputLines = actualOutput.split("\n");
    if (outputLines.length > 1) {
      const dataOnly = outputLines.slice(1).join("\n");
      const dataOnlyNorm = normalizeOutput(dataOnly, "SQL");
      mainPass = checkLinesAgainst(dataOnlyNorm);
      if (mainPass) { outputChannel.appendLine("[Judge] SQL matched after stripping column header"); }
    }
  }

  const studentCode = currentFileCode || practice.code || "";
  const isSQL = practice.lang === "SQL" || /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/im.test(studentCode);

  if (isSQL) {
    const sqlUpper = studentCode.toUpperCase();
    const hasSqlKeyword = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE)\b/.test(sqlUpper);
    const hasSqlClause = /\b(WHERE|JOIN|GROUP\s+BY|ORDER\s+BY|HAVING|UNION|DISTINCT|LIMIT|CASE|WHEN|BETWEEN|LIKE|IN\s*\(|EXISTS|AS)\b/.test(sqlUpper);
    const hasSqlWork = hasSqlKeyword && (hasSqlClause || sqlUpper.includes("FROM"));

    return buildSqlResult(mainPass, hasSqlWork, hasSqlKeyword, hasSqlClause, studentCode, expected, actualOutput);
  }

  const isTS = /console\.log/.test(studentCode) && !/System\.out\.print/.test(studentCode);
  const studentAdditions = studentCode
    .replace(/public\s+class\s+\w+\s*\{/g, "")
    .replace(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/g, "")
    .replace(/\/\/\s*YOUR CODE HERE/g, "")
    .replace(/System\.out\.println?\s*\([^)]*\)\s*;/g, "")
    .replace(/console\.log\s*\([^)]*\)\s*;?/g, "")
    .replace(/[{}]/g, "")
    .trim();

  const hasLogic = /\b(for|while|do|if|else|switch)\b/.test(studentCode);
  const hasMethodCalls = /\.\w+\s*\(/.test(studentAdditions);
  const printArgs = isTS
    ? (studentCode.match(/console\.log\s*\(([^)]*)\)/g) || [])
    : (studentCode.match(/System\.out\.println?\s*\(([^)]*)\)/g) || []);
  const printPrefix = isTS ? /console\.log\s*\(\s*/ : /System\.out\.println?\s*\(\s*/;
  const onlyHardcodedLiterals = printArgs.length > 0 && printArgs.every(p => {
    const arg = p.replace(printPrefix, "").replace(/\s*\)$/, "").trim();
    return /^-?\d+(\.\d+)?$/.test(arg) || /^["'`][^"'`]*["'`]$/.test(arg);
  });
  const hasRealWork = hasLogic || hasMethodCalls || studentAdditions.length > 10 || !onlyHardcodedLiterals;

  const testResults: { name: string; pass: boolean; expected: string; got: string }[] = [];

  testResults.push({
    name: "Output Correctness",
    pass: mainPass,
    expected: expected.slice(0, 80),
    got: actualOutput.slice(0, 80)
  });

  if (mainPass && !hasRealWork) {
    outputChannel.appendLine(`Anti-cheat: No logic detected. Student additions: "${studentAdditions.slice(0, 100)}"`);
    testResults.push({
      name: "Code Logic",
      pass: false,
      expected: "Loops, conditions, or calculations",
      got: "No logic found - write actual code"
    });
  } else if (mainPass) {
    testResults.push({
      name: "Code Logic",
      pass: true,
      expected: "Has logic",
      got: hasLogic ? "Loops/conditions found" : "Logic verified"
    });
  }

  const allPass = testResults.every(t => t.pass);
  return { pass: allPass, testResults };
}

function buildSqlResult(
  mainPass: boolean,
  hasSqlWork: boolean,
  hasSqlKeyword: boolean,
  hasSqlClause: boolean,
  studentCode: string,
  expected: string,
  actualOutput: string
): CheckResult {
  const testResults: { name: string; pass: boolean; expected: string; got: string }[] = [];

  testResults.push({
    name: "Output Correctness",
    pass: mainPass,
    expected: expected.slice(0, 80),
    got: actualOutput.slice(0, 80)
  });

  if (mainPass && !hasSqlWork) {
    testResults.push({
      name: "SQL Query",
      pass: false,
      expected: "SELECT/WHERE/JOIN/GROUP BY etc.",
      got: "No SQL query found - write actual SQL"
    });
  } else {
    const sqlUpper = studentCode.toUpperCase();
    const parts: string[] = [];
    if (/\bSELECT\b/.test(sqlUpper)) parts.push("SELECT");
    if (/\bWHERE\b/.test(sqlUpper)) parts.push("WHERE");
    if (/\bJOIN\b/.test(sqlUpper)) parts.push("JOIN");
    if (/\bGROUP\s+BY\b/.test(sqlUpper)) parts.push("GROUP BY");
    if (/\bORDER\s+BY\b/.test(sqlUpper)) parts.push("ORDER BY");
    testResults.push({
      name: "SQL Query",
      pass: true,
      expected: "Has SQL clauses",
      got: parts.join(", ") || "SQL verified"
    });
  }

  const allPass = testResults.every(t => t.pass);
  return { pass: allPass, testResults };
}
