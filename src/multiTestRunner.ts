// マルチテスト — multi test case runner
import { TestCase } from "./constants";

function skipStringLiteral(code: string, i: number): number {
  const quote = code[i];
  i++;
  while (i < code.length) {
    if (code[i] === "\\" ) { i += 2; continue; }
    if (code[i] === quote) { return i + 1; }
    i++;
  }
  return i;
}

function findMatchingClose(code: string, start: number, open: string, close: string): number {
  let depth = 1;
  let i = start;
  while (i < code.length && depth > 0) {
    if (code[i] === '"' || code[i] === "'") { i = skipStringLiteral(code, i); continue; }
    if (code[i] === open) { depth++; }
    if (code[i] === close) { depth--; }
    i++;
  }
  return i;
}

/** main本体抽出 — extract main method body (Java) or full code (TS) */
export function extractMainBody(code: string, lang: string): string {
  if (lang === "TypeScript") {
    // Strip >>> REPL/diff markers from lines
    return code.split("\n").map(l => l.replace(/^\s*>>>\s?/, "")).join("\n");
  }

  const mainMatch = code.match(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/);
  if (!mainMatch) { return ""; }

  const start = code.indexOf(mainMatch[0]) + mainMatch[0].length;
  const end = findMatchingClose(code, start, "{", "}");
  // Strip >>> REPL/diff markers from lines
  return code.substring(start, end - 1).trim()
    .split("\n").map(l => l.replace(/^\s*>>>\s?/, "")).join("\n");
}

/** データ行抽出 — extract data lines before YOUR CODE HERE */
export function extractDataBlock(starterCode: string, lang: string): string[] {
  const body = lang === "TypeScript" ? starterCode : extractMainBody(starterCode, lang);
  const lines = body.split("\n");
  const dataLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/\/\/\s*YOUR\s*CODE\s*HERE/i.test(trimmed)) { break; }
    if (/\/\/\s*TODO/i.test(trimmed)) { break; }
    if (!trimmed || /^\/\//.test(trimmed)) { continue; }
    if (/System\.out\.print|console\.log/.test(trimmed)) { continue; }
    if (/^\s*(?:int|long|double|float|String|boolean|char|let|const|var)\s+result\b/.test(trimmed)) { continue; }
    dataLines.push(line);
  }

  return dataLines;
}

/** print文抽出 — extract the last print statement */
export function extractPrintStatement(code: string, lang: string): string | null {
  const body = lang === "TypeScript" ? code : extractMainBody(code, lang);
  const lines = body.split("\n");

  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (lang === "Java" && /System\.out\.println?\s*\(/.test(trimmed)) {
      return lines[i];
    }
    if (lang === "TypeScript" && /console\.log\s*\(/.test(trimmed)) {
      return lines[i];
    }
  }
  return null;
}

/** 学生ロジック抽出 — extract student-written logic (minus data & print) */
export function extractStudentLogic(
  studentCode: string,
  starterCode: string,
  lang: string,
  keepPrintStmt: boolean = false
): string {
  const studentBody = lang === "TypeScript" ? studentCode : extractMainBody(studentCode, lang);
  const dataLines = extractDataBlock(starterCode, lang);
  const printStmt = extractPrintStatement(studentCode, lang);

  const bodyLines = studentBody.split("\n");
  const logicLines: string[] = [];

  const dataNorm = new Set(dataLines.map(l => l.trim()));

  let skipDepth = 0;
  for (const line of bodyLines) {
    const trimmed = line.trim();
    if (!trimmed) { continue; }
    // If inside a multi-line data block being stripped, track brace depth
    if (skipDepth > 0) {
      const opens = (trimmed.match(/\{/g) || []).length;
      const closes = (trimmed.match(/\}/g) || []).length;
      skipDepth += opens - closes;
      continue;
    }
    // Skip data lines but never skip structural brace-only lines (}, };, etc.)
    // — they also close for/if/function blocks in student logic
    if (dataNorm.has(trimmed) && !/^[{}\s;]*$/.test(trimmed)) {
      // Check if this opens a multi-line block (e.g. interface Foo {)
      const opens = (trimmed.match(/\{/g) || []).length;
      const closes = (trimmed.match(/\}/g) || []).length;
      const net = opens - closes;
      if (net > 0) { skipDepth = net; }
      continue;
    }
    if (/\/\/\s*YOUR\s*CODE\s*HERE/i.test(trimmed)) { continue; }
    if (/\/\/\s*TODO/i.test(trimmed)) { continue; }
    if (!keepPrintStmt && printStmt && trimmed === printStmt.trim()) { continue; }
    logicLines.push(line);
  }

  return logicLines.join("\n");
}

function extractImports(code: string): string[] {
  const imports = code.split("\n").filter(l => /^\s*import\s+/.test(l));
  return [...new Set(imports)];
}

/** ヘルパーメソッド抽出 — extract static methods outside main() */
function extractHelperMethods(code: string): string {
  const classMatch = code.match(/class\s+\w+\s*\{/);
  if (!classMatch) { return ""; }

  const classStart = code.indexOf(classMatch[0]) + classMatch[0].length;
  const classEnd = findMatchingClose(code, classStart, "{", "}");
  const classBody = code.substring(classStart, classEnd - 1);

  const mainMatch = classBody.match(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/);
  if (!mainMatch) { return ""; }

  const mainStart = classBody.indexOf(mainMatch[0]);
  const mainBodyStart = mainStart + mainMatch[0].length;
  const mi = findMatchingClose(classBody, mainBodyStart, "{", "}");

  const beforeMain = classBody.substring(0, mainStart).trim();
  const afterMain = classBody.substring(mi).trim();

  const helpers = [beforeMain, afterMain].filter(s => s.length > 0).join("\n\n");
  return helpers;
}

/** Extract variable name from a declaration string (handles generics, type annotations, arrays) */
function extractDeclVarName(decl: string): string | null {
  // TS-style: (let|const|var) name [: type] =
  let m = decl.match(/(?:let|const|var)\s+(\w+)\s*(?::[^=]+)?\s*=/);
  if (m) { return m[1]; }
  // Java-style: Type<Generic<Nested>>[] name = (handles ArrayList<Integer>, HashMap<String, List<Integer>>, etc.)
  // Use [^;{}]* to allow nested angle brackets within generic types
  m = decl.match(/(?:[\w]+(?:\s*<[^;{}]*>)?(?:\[\])*)\s+(\w+)\s*=/);
  if (m) { return m[1]; }
  return null;
}

/** Build regex to match any declaration of a known variable name in solution body */
function buildDeclPattern(varName: string): RegExp {
  // Matches: any type (including nested generics/arrays) + varName + optional TS type annotation + =
  // Uses [\\w<>\\[\\],\\s?]+ for type to handle HashMap<String, List<Integer>>[] etc.
  return new RegExp(
    `^\\s*(?:(?:final\\s+)?[\\w<>\\[\\],\\s?]+\\s+|(?:let|const|var)\\s+)${varName}\\s*(?::[^=]*)?\\s*=`
  );
}

/** Check if a line is a method call on one of the given variable names (e.g. list.add(...), map.put(...)) */
function isMethodCallOnVar(trimmed: string, varNames: Set<string>): boolean {
  const m = trimmed.match(/^(\w+)\.\w+\s*\(/);
  return !!m && varNames.has(m[1]);
}

/** Strip input variable declarations (including multi-line arrays/objects) and method calls on input vars */
function stripInputVarLines(
  lines: string[],
  inputVarDecls: { varName: string; pattern: RegExp }[],
  inputVarNames: Set<string>
): string[] {
  const result: string[] = [];
  let bracketDepth = 0; // Track []{} depth for multi-line declarations
  let scopeDepth = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    const currentScopeDepth = scopeDepth;
    if (bracketDepth > 0) {
      // Inside a multi-line declaration — count brackets until balanced
      const opens = (trimmed.match(/[\[{(]/g) || []).length;
      const closes = (trimmed.match(/[\]})]/g) || []).length;
      bracketDepth += opens - closes;
      continue;
    }
    // Check if this line starts an input var declaration (but never skip structural brace-only lines)
    if (currentScopeDepth === 0 && inputVarDecls.some(d => d.pattern.test(trimmed)) && !/^[{}\s;]*$/.test(trimmed)) {
      const opens = (trimmed.match(/[\[{(]/g) || []).length;
      const closes = (trimmed.match(/[\]})]/g) || []).length;
      const net = opens - closes;
      if (net > 0) { bracketDepth = net; }
      continue;
    }
    // Check method calls on input variables, including multi-line callback blocks
    if (currentScopeDepth === 0 && isMethodCallOnVar(trimmed, inputVarNames)) {
      const opens = (trimmed.match(/[\[{(]/g) || []).length;
      const closes = (trimmed.match(/[\]})]/g) || []).length;
      const net = opens - closes;
      if (net > 0) { bracketDepth = net; }
      continue;
    }
    result.push(line);
    const opens = (trimmed.match(/\{/g) || []).length;
    const closes = (trimmed.match(/\}/g) || []).length;
    scopeDepth = Math.max(0, scopeDepth + opens - closes);
  }
  return result;
}

/** Extract TS top-level declarations that must be hoisted (type, interface, function, class, enum) */
function extractTypeDeclarations(bodyLines: string[]): { typeLines: string[]; remaining: string[] } {
  const typeLines: string[] = [];
  const remaining: string[] = [];
  let collecting = false;
  let braceDepth = 0;
  let parenDepth = 0;
  let sawBrace = false;
  // Matches: type, interface, function, async function, class, enum, abstract class
  const TOP_LEVEL_DECL = /^(?:export\s+)?(?:type|interface|(?:async\s+)?function|class|abstract\s+class|enum)\s+\w+/;
  const updateDepths = (line: string): void => {
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' || ch === "'" || ch === '`') {
        i = skipStringLiteral(line, i) - 1;
        continue;
      }
      if (ch === "/" && line[i + 1] === "/") {
        break;
      }
      if (ch === "(") { parenDepth++; }
      else if (ch === ")") { parenDepth = Math.max(0, parenDepth - 1); }
      else if (ch === "{") {
        braceDepth++;
        sawBrace = true;
      } else if (ch === "}") {
        braceDepth = Math.max(0, braceDepth - 1);
      }
    }
  };
  const shouldFlush = (trimmed: string): boolean => {
    if (sawBrace) {
      return braceDepth === 0 && parenDepth === 0;
    }
    return parenDepth === 0 && /;\s*$/.test(trimmed);
  };
  for (const line of bodyLines) {
    const trimmed = line.trim();
    if (!collecting && TOP_LEVEL_DECL.test(trimmed)) {
      collecting = true;
      typeLines.push(line);
      updateDepths(line);
      if (shouldFlush(trimmed)) {
        collecting = false;
        braceDepth = 0;
        parenDepth = 0;
        sawBrace = false;
      }
      // Single-line declaration (e.g. "type Foo = string;") — already captured
    } else if (collecting) {
      typeLines.push(line);
      updateDepths(line);
      if (shouldFlush(trimmed)) {
        collecting = false;
        braceDepth = 0;
        parenDepth = 0;
        sawBrace = false;
      }
    } else {
      remaining.push(line);
    }
  }
  return { typeLines, remaining };
}

function splitTypeDeclarationBlocks(typeLines: string[]): string[] {
  const blocks: string[] = [];
  let current: string[] = [];
  let braceDepth = 0;

  for (const line of typeLines) {
    current.push(line);
    const trimmed = line.trim();
    const opens = (trimmed.match(/\{/g) || []).length;
    const closes = (trimmed.match(/\}/g) || []).length;
    braceDepth += opens - closes;

    if (braceDepth <= 0 && (/;\s*$/.test(trimmed) || /}\s*$/.test(trimmed))) {
      blocks.push(current.join("\n").trim());
      current = [];
      braceDepth = 0;
    }
  }

  if (current.length > 0) {
    blocks.push(current.join("\n").trim());
  }

  return blocks.filter(block => block.length > 0);
}

function expandDeclarations(declarations: string, indent: string): string {
  // Split by ; but respect braces (don't split inside { })
  const parts: string[] = [];
  let current = "";
  let braceDepth = 0;
  for (let i = 0; i < declarations.length; i++) {
    const ch = declarations[i];
    if (ch === "{") { braceDepth++; }
    else if (ch === "}") { braceDepth--; }
    if (ch === ";" && braceDepth <= 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) { parts.push(current.trim()); }

  return parts
    .filter(s => s.length > 0)
    .map(s => {
      // Fix malformed TS function type declarations without implementation body:
      // "const fn = (args): ReturnType" → "const fn = (args): ReturnType => (undefined as any)"
      const fnTypeDecl = s.match(/^((?:const|let|var)\s+\w+\s*=\s*\([^)]*\))\s*:\s*([^=>\s][\w<>,\s|[\]{}]*?)\s*$/);
      if (fnTypeDecl) {
        s = `${fnTypeDecl[1]}: ${fnTypeDecl[2].trim()} => (undefined as any)`;
      }
      // Fix bare function parameter pattern without return type or body:
      // "const fn = (args)" → "const fn = (args) => (undefined as any)"
      // But NOT if it already has => or { (already a valid function expression)
      if (!fnTypeDecl) {
        const bareFnDecl = s.match(/^((?:const|let|var)\s+\w+\s*=\s*\([^)]*\))\s*$/);
        if (bareFnDecl && !s.includes("=>") && !s.includes("{")) {
          s = `${bareFnDecl[1]} => (undefined as any)`;
        }
      }
      // Fix TS type annotation style: "const fn: (args) => ReturnType" or "const fn: (args)"
      // These are type-only declarations without a value — provide a dummy implementation
      if (!fnTypeDecl) {
        // "const fn: (a: T) => R" → "const fn: (a: T) => R = (() => undefined as any) as any"
        const typedFnFull = s.match(/^((?:const|let|var)\s+\w+)\s*:\s*\(([^)]*)\)\s*=>\s*(\S+)\s*$/);
        if (typedFnFull) {
          s = `${typedFnFull[1]}: (${typedFnFull[2]}) => ${typedFnFull[3]} = (() => undefined as any) as any`;
        }
        // "const fn: (a: T)" → "const fn = ((a: T) => undefined as any) as any"
        const typedFnBare = s.match(/^((?:const|let|var)\s+(\w+))\s*:\s*\(([^)]*)\)\s*$/);
        if (typedFnBare && !typedFnFull) {
          s = `${typedFnBare[1]} = ((${typedFnBare[3]}) => undefined as any) as any`;
        }
      }
      return `${indent}${s};`;
    })
    .join("\n");
}

function buildJavaCapturedOutputFooter(index: number, indent: string): string {
  return [
    `${indent}if (_tcOk${index}) {`,
    `${indent}    String _tcOut${index} = new String(_buf${index}.toByteArray(), java.nio.charset.StandardCharsets.UTF_8)`,
    `${indent}        .replace("\\r\\n", "\\n")`,
    `${indent}        .replace("\\r", "\\n")`,
    `${indent}        .trim();`,
    `${indent}    System.out.println("TC${index}:B64:" + java.util.Base64.getEncoder().encodeToString(_tcOut${index}.getBytes(java.nio.charset.StandardCharsets.UTF_8)));`,
    `${indent}}`,
  ].join("\n");
}

function buildTypeScriptCapturedOutputFooter(index: number, indent: string): string {
  return [
    `${indent}if (_tcOk${index}) {`,
    `${indent}    const _tcOut${index} = _logs${index}.join("\\n").trim();`,
    `${indent}    _origLog${index}("TC${index}:B64:" + Buffer.from(_tcOut${index}, "utf8").toString("base64"));`,
    `${indent}}`,
  ].join("\n");
}

export function parseMultiTestTcLine(line: string): { tcNum: number; output: string } | null {
  const cleaned = line.replace(/\r$/, "").trim();

  const errorMatch = cleaned.match(/^TC(\d+):(ERROR:.*)$/);
  if (errorMatch) {
    return { tcNum: parseInt(errorMatch[1], 10), output: errorMatch[2].trim() };
  }

  const base64Match = cleaned.match(/^TC(\d+):B64:(.*)$/);
  if (base64Match) {
    const tcNum = parseInt(base64Match[1], 10);
    try {
      return { tcNum, output: Buffer.from(base64Match[2], "base64").toString("utf8") };
    } catch {
      return { tcNum, output: "" };
    }
  }

  const rawMatch = cleaned.match(/^TC(\d+):(.*)$/);
  if (!rawMatch) { return null; }
  return { tcNum: parseInt(rawMatch[1], 10), output: rawMatch[2].trim() };
}

/** Reference test — use solution's full main body, swap input vars per test case */
function buildReferenceTestCode(
  solutionCode: string,
  starterCode: string,
  testCases: TestCase[],
  lang: string,
  javaClassName: string,
  printStmt: string
): string | null {
  const body = extractMainBody(solutionCode, lang);
  if (!body.trim()) { return null; }

  // Build set of data lines from starter code to strip from body
  const dataLines = extractDataBlock(starterCode, lang);
  const dataNorm = new Set(dataLines.map(l => l.trim()));

  // Also identify input variable names for fallback pattern matching
  const firstInput = testCases[0]?.input || "";
  const inputVarDecls: { varName: string; pattern: RegExp }[] = [];
  const inputParts = firstInput.split(/[;\n]/).map(s => s.trim()).filter(s => s.length > 0);
  for (const decl of inputParts) {
    const varName = extractDeclVarName(decl);
    if (varName) {
      inputVarDecls.push({ varName, pattern: buildDeclPattern(varName) });
    }
  }

  // Collect all input variable names (for stripping method calls like .add(), .put())
  const inputVarNames = new Set(inputVarDecls.map(d => d.varName));
  const staticDataLines = stripInputVarLines(dataLines, inputVarDecls, inputVarNames);

  const bodyLines = body.split("\n");

  if (lang === "Java") {
    const imports = extractImports(solutionCode);
    const importBlock = imports.length > 0 ? imports.join("\n") + "\n" : "";
    const helpers = extractHelperMethods(solutionCode);
    const indent = "            ";
    const staticBlock = staticDataLines.length > 0
      ? staticDataLines.map(l => indent + l.trim()).join("\n") + "\n"
      : "";

    let blocks = "";
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const tcInputDecls = expandDeclarations(tc.input, indent);

      // Rebuild body: strip data setup lines, keep original prints, and capture the full output per TC
      const rewritten: string[] = [];
      let refSkipDepth = 0;
      for (const line of bodyLines) {
        const trimmed = line.trim();
        if (!trimmed) { continue; }
        // If inside a multi-line block being stripped, track brace depth
        if (refSkipDepth > 0) {
          const opens = (trimmed.match(/\{/g) || []).length;
          const closes = (trimmed.match(/\}/g) || []).length;
          refSkipDepth += opens - closes;
          continue;
        }
        // Skip data lines from starter code (exact match) — but never skip structural brace-only lines
        if (dataNorm.has(trimmed) && !/^[{}\s;]*$/.test(trimmed)) {
          const opens = (trimmed.match(/\{/g) || []).length;
          const closes = (trimmed.match(/\}/g) || []).length;
          if (opens > closes) { refSkipDepth = opens - closes; }
          continue;
        }
        // Skip input variable declarations (pattern match fallback)
        if (inputVarDecls.some(d => d.pattern.test(trimmed)) && !/^[{}\s;]*$/.test(trimmed)) {
          const opens = (trimmed.match(/\{/g) || []).length;
          const closes = (trimmed.match(/\}/g) || []).length;
          if (opens > closes) { refSkipDepth = opens - closes; }
          continue;
        }
        // Skip method calls on input variables (e.g. numbers.add(...), scores.put(...))
        if (isMethodCallOnVar(trimmed, inputVarNames)) { continue; }
        rewritten.push(indent + trimmed);
      }

      // Wrap each TC in try-catch so one failure doesn't kill subsequent TCs
      blocks += `        { // TC${i + 1}\n`;
      blocks += `${indent}boolean _tcOk${i + 1} = false;\n`;
      blocks += `${indent}java.io.PrintStream _origOut${i + 1} = System.out;\n`;
      blocks += `${indent}java.io.ByteArrayOutputStream _buf${i + 1} = new java.io.ByteArrayOutputStream();\n`;
      blocks += `${indent}try {\n`;
      blocks += `${indent}    System.setOut(new java.io.PrintStream(_buf${i + 1}, true));\n`;
      blocks += tcInputDecls + "\n";
      blocks += staticBlock;
      blocks += rewritten.join("\n") + "\n";
      blocks += `${indent}    _tcOk${i + 1} = true;\n`;
      blocks += `${indent}} catch (Throwable _tcErr${i + 1}) {\n`;
      blocks += `${indent}    System.setOut(_origOut${i + 1});\n`;
      blocks += `${indent}    System.out.println("TC${i + 1}:ERROR:" + _tcErr${i + 1}.getMessage());\n`;
      blocks += `${indent}} finally {\n`;
      blocks += `${indent}    try { System.out.flush(); } catch (Throwable _flushErr${i + 1}) {}\n`;
      blocks += `${indent}    System.setOut(_origOut${i + 1});\n`;
      blocks += `${indent}}\n`;
      blocks += buildJavaCapturedOutputFooter(i + 1, indent) + "\n";
      blocks += `        }\n`;
    }

    const helperBlock = helpers ? "\n" + helpers + "\n" : "";
    return (
      `${importBlock}public class ${javaClassName} {\n` +
      `    public static void main(String[] args) {\n` +
      blocks +
      `    }\n` +
      helperBlock +
      `}\n`
    );
  }

  if (lang === "TypeScript") {
    const indent = "    ";

    // 1. Get student logic while preserving print statements so capture can serialize full output
    const studentLogic = extractStudentLogic(solutionCode, starterCode, lang, true);

    // 3. Remove hoisted lines from logic (function bodies etc. that overlap)
    //    Use brace depth tracking to strip entire multi-line blocks, not individual lines
    const { typeLines: hoisted, remaining: cleanLogicLines } = extractTypeDeclarations(studentLogic.split("\n"));
    const hoistedSet = new Set<string>();
    let hoistSkipDepth = 0;
    for (const l of [] as string[]) {
      const trimmed = l.trim();
      if (!trimmed) { continue; }
      if (hoistSkipDepth > 0) {
        const opens = (trimmed.match(/\{/g) || []).length;
        const closes = (trimmed.match(/\}/g) || []).length;
        hoistSkipDepth += opens - closes;
        continue;
      }
      // Skip hoisted lines but never skip structural brace-only lines (}, };, etc.)
      // — they also close for/if/function blocks in student logic
      if (hoistedSet.has(trimmed) && !/^[{}\s;]*$/.test(trimmed)) {
        const opens = (trimmed.match(/\{/g) || []).length;
        const closes = (trimmed.match(/\}/g) || []).length;
        const net = opens - closes;
        if (net > 0) { hoistSkipDepth = net; }
        continue;
      }
      cleanLogicLines.push(l);
    }

    // 4. Strip input var declarations (including multi-line) and method calls on input vars
    const finalLogicLines = stripInputVarLines(cleanLogicLines, inputVarDecls, inputVarNames);
    const { typeLines: staticTypes, remaining: staticRemaining } = extractTypeDeclarations(staticDataLines);

    // 5. Build hoist block (deduplicated)
    const declarationBlocks = [...new Set([
      ...splitTypeDeclarationBlocks(hoisted),
      ...splitTypeDeclarationBlocks(staticTypes),
    ])];
    const hoistBlock = declarationBlocks.length > 0 ? declarationBlocks.join("\n\n") + "\n\n" : "";
    const tsStaticBlock = staticRemaining.length > 0
      ? staticRemaining.map(l => indent + l.trim()).join("\n") + "\n"
      : "";

    let blocks = "";
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const tcInputDecls = expandDeclarations(tc.input, indent);

      const reindentedLogic = finalLogicLines.map(l => {
        const trimmed = l.trim();
        if (!trimmed) { return ""; }
        return indent + trimmed;
      }).join("\n");

      // Wrap each TC in try-catch for resilience
      blocks += `{ // TC${i + 1}\n`;
      blocks += `${indent}const _logs${i + 1}: string[] = [];\n`;
      blocks += `${indent}const _origLog${i + 1} = console.log;\n`;
      blocks += `${indent}let _tcOk${i + 1} = false;\n`;
      blocks += `${indent}try {\n`;
      blocks += `${indent}    console.log = (...args: unknown[]) => {\n`;
      blocks += `${indent}        _logs${i + 1}.push(args.map(_v => typeof _v === "string" ? _v : typeof _v === "object" && _v !== null ? JSON.stringify(_v) : String(_v)).join(" "));\n`;
      blocks += `${indent}    };\n`;
      blocks += tcInputDecls + "\n";
      blocks += tsStaticBlock;
      blocks += reindentedLogic + "\n";
      blocks += `${indent}    _tcOk${i + 1} = true;\n`;
      blocks += `${indent}} catch (_e) {\n`;
      blocks += `${indent}    console.log = _origLog${i + 1};\n`;
      blocks += `${indent}    _origLog${i + 1}("TC${i + 1}:ERROR:" + (_e instanceof Error ? _e.message : String(_e)));\n`;
      blocks += `${indent}} finally {\n`;
      blocks += `${indent}    console.log = _origLog${i + 1};\n`;
      blocks += `${indent}}\n`;
      blocks += buildTypeScriptCapturedOutputFooter(i + 1, indent) + "\n";
      blocks += `}\n`;
    }

    // Always wrap in async IIFE + .catch for ESM/CJS safety and uncaught exception prevention
    let refCode: string;
    refCode = hoistBlock + `(async () => {\n${blocks}})().catch(e => { console.error(String(e?.stack||e)); process.exit(1); });\n`;

    // Strip stray import/export (same as student path)
    refCode = refCode
      .split("\n")
      .filter(l => {
        const t = l.trim();
        if (/^export\s*\{\s*\}\s*;?\s*$/.test(t)) { return false; }
        if (/^import\s+.*\s+from\s+['"]/.test(t)) { return false; }
        if (/^import\s+['"]/.test(t)) { return false; }
        return true;
      })
      .join("\n")
      .replace(/^export\s+(default\s+)?(?=(function|class|const|let|var|enum|interface|type)\b)/gm, "");
    return refCode;
  }

  return null;
}

/** Validate brace balance — return true if all {}, [], () are properly matched */
function hasBraceBalance(code: string): boolean {
  let depth = 0;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (ch === '"' || ch === "'" || ch === '`') { i = skipStringLiteral(code, i) - 1; continue; }
    if (ch === '/' && code[i + 1] === '/') { while (i < code.length && code[i] !== '\n') { i++; } continue; }
    if (ch === '{') { depth++; }
    else if (ch === '}') { depth--; }
    if (depth < 0) { return false; }
  }
  return depth === 0;
}

/** テストコード生成 — build multi-test runner code */
export function buildMultiTestCode(
  studentCode: string,
  starterCode: string,
  testCases: TestCase[],
  lang: string,
  javaClassName: string = "PracticeTC"
): string | null {
  if (!testCases || testCases.length === 0) { return null; }

  const isReference = javaClassName.endsWith("Ref");
  const printStmt = extractPrintStatement(studentCode, lang);

  console.error(`[buildMultiTestCode] class=${javaClassName}, lang=${lang}, isRef=${isReference}, printStmt=${printStmt ? '"' + printStmt.trim() + '"' : 'NULL'}`);
  if (!printStmt) { console.error(`[buildMultiTestCode] FAIL: no print statement found`); return null; }

  // For reference runs: use entire main body, only replace input variable declarations per test case
  if (isReference) {
    const code = buildReferenceTestCode(studentCode, starterCode, testCases, lang, javaClassName, printStmt);
    if (code && !hasBraceBalance(code)) {
      console.error(`[buildMultiTestCode] FAIL: reference code has unbalanced braces — skipping`);
      return null;
    }
    return code;
  }

  const studentLogic = extractStudentLogic(studentCode, starterCode, lang, true);
  const helperMethods = lang === "Java" ? extractHelperMethods(studentCode) : "";

  console.error(`[buildMultiTestCode] logic=${studentLogic.trim().length} chars`);
  if (!studentLogic.trim() && !helperMethods.trim()) {
    console.error(`[buildMultiTestCode] FAIL: no logic extracted`);
    return null;
  }

  const firstInput = testCases[0]?.input || "";
  const inputVarDecls: { varName: string; pattern: RegExp }[] = [];
  const inputParts = firstInput.split(/[;\n]/).map(s => s.trim()).filter(s => s.length > 0);
  for (const decl of inputParts) {
    const varName = extractDeclVarName(decl);
    if (varName) {
      inputVarDecls.push({ varName, pattern: buildDeclPattern(varName) });
    }
  }
  const inputVarNames = new Set(inputVarDecls.map(d => d.varName));

  // Strip test-case input variable declarations AND method calls on TC vars from student logic
  // (e.g. map.put(), list.add(), set.add() — these are in the TC input, not student logic)
  const filteredLogic = stripInputVarLines(
    studentLogic.split("\n"),
    inputVarDecls,
    inputVarNames
  ).join("\n");

  // Find starter data lines NOT covered by test case input (e.g. "int[] merged = new int[a.length + b.length]")
  // These are "static data" that must be included in each test block
  const starterDataLines = extractDataBlock(starterCode, lang);
  const staticDataLines = stripInputVarLines(
    starterDataLines,
    inputVarDecls,
    inputVarNames
  );

  if (lang === "Java") {
    const imports = extractImports(studentCode);
    const importBlock = imports.length > 0 ? imports.join("\n") + "\n" : "";
    const helpers = helperMethods;
    const indent = "            ";
    const staticBlock = staticDataLines.length > 0
      ? staticDataLines.map(l => indent + l.trim()).join("\n") + "\n"
      : "";

    let blocks = "";
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const dataBlock = expandDeclarations(tc.input, indent);

      const reindentedLogic = filteredLogic.split("\n").map(l => {
        const trimmed = l.trim();
        if (!trimmed) { return ""; }
        return indent + trimmed;
      }).join("\n");

      // Wrap each TC in try-catch so one failure doesn't kill subsequent TCs
      blocks += `        { // TC${i + 1}\n`;
      blocks += `${indent}boolean _tcOk${i + 1} = false;\n`;
      blocks += `${indent}java.io.PrintStream _origOut${i + 1} = System.out;\n`;
      blocks += `${indent}java.io.ByteArrayOutputStream _buf${i + 1} = new java.io.ByteArrayOutputStream();\n`;
      blocks += `${indent}try {\n`;
      blocks += `${indent}    System.setOut(new java.io.PrintStream(_buf${i + 1}, true));\n`;
      blocks += dataBlock + "\n";
      blocks += staticBlock;
      blocks += reindentedLogic + "\n";
      blocks += `${indent}    _tcOk${i + 1} = true;\n`;
      blocks += `${indent}} catch (Throwable _tcErr${i + 1}) {\n`;
      blocks += `${indent}    System.setOut(_origOut${i + 1});\n`;
      blocks += `${indent}    System.out.println("TC${i + 1}:ERROR:" + _tcErr${i + 1}.getMessage());\n`;
      blocks += `${indent}} finally {\n`;
      blocks += `${indent}    try { System.out.flush(); } catch (Throwable _flushErr${i + 1}) {}\n`;
      blocks += `${indent}    System.setOut(_origOut${i + 1});\n`;
      blocks += `${indent}}\n`;
      blocks += buildJavaCapturedOutputFooter(i + 1, indent) + "\n";
      blocks += `        }\n`;
    }

    const helperBlock = helpers ? "\n" + helpers + "\n" : "";

    const javaCode = (
      `${importBlock}public class ${javaClassName} {\n` +
      `    public static void main(String[] args) {\n` +
      blocks +
      `    }\n` +
      helperBlock +
      `}\n`
    );
    if (!hasBraceBalance(javaCode)) {
      console.error(`[buildMultiTestCode] FAIL: student Java code has unbalanced braces — skipping`);
      return null;
    }
    return javaCode;
  }

  if (lang === "TypeScript") {
    const indent = "    ";

    // Extract type/interface declarations from logic and static data — hoist to top level
    const logicLines = filteredLogic.split("\n");
    const { typeLines: logicTypes, remaining: logicRemaining } = extractTypeDeclarations(logicLines);
    const { typeLines: staticTypes, remaining: staticRemaining } = extractTypeDeclarations(staticDataLines);
    const declarationBlocks = [...new Set([
      ...splitTypeDeclarationBlocks(logicTypes),
      ...splitTypeDeclarationBlocks(staticTypes),
    ])];
    const typeBlock = declarationBlocks.length > 0 ? declarationBlocks.join("\n\n") + "\n\n" : "";

    const tsStaticBlock = staticRemaining.length > 0
      ? staticRemaining.map(l => indent + l.trim()).join("\n") + "\n"
      : "";

    let blocks = "";
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const dataBlock = expandDeclarations(tc.input, indent);

      const reindentedLogic = logicRemaining.map(l => {
        const trimmed = l.trim();
        if (!trimmed) { return ""; }
        return indent + trimmed;
      }).join("\n");

      // Wrap each TC in try-catch for resilience
      blocks += `{ // TC${i + 1}\n`;
      blocks += `${indent}const _logs${i + 1}: string[] = [];\n`;
      blocks += `${indent}const _origLog${i + 1} = console.log;\n`;
      blocks += `${indent}let _tcOk${i + 1} = false;\n`;
      blocks += `${indent}try {\n`;
      blocks += `${indent}    console.log = (...args: unknown[]) => {\n`;
      blocks += `${indent}        _logs${i + 1}.push(args.map(_v => typeof _v === "string" ? _v : typeof _v === "object" && _v !== null ? JSON.stringify(_v) : String(_v)).join(" "));\n`;
      blocks += `${indent}    };\n`;
      blocks += dataBlock + "\n";
      blocks += tsStaticBlock;
      blocks += reindentedLogic + "\n";
      blocks += `${indent}    _tcOk${i + 1} = true;\n`;
      blocks += `${indent}} catch (_e) {\n`;
      blocks += `${indent}    console.log = _origLog${i + 1};\n`;
      blocks += `${indent}    _origLog${i + 1}("TC${i + 1}:ERROR:" + (_e instanceof Error ? _e.message : String(_e)));\n`;
      blocks += `${indent}} finally {\n`;
      blocks += `${indent}    console.log = _origLog${i + 1};\n`;
      blocks += `${indent}}\n`;
      blocks += buildTypeScriptCapturedOutputFooter(i + 1, indent) + "\n";
      blocks += `}\n`;
    }

    // Always wrap in async IIFE + .catch for ESM/CJS safety and uncaught exception prevention
    let tsCode: string;
    tsCode = typeBlock + `(async () => {\n${blocks}})().catch(e => { console.error(String(e?.stack||e)); process.exit(1); });\n`;

    // Strip stray import/export statements that cause runtime errors
    tsCode = tsCode
      .split("\n")
      .filter(l => {
        const t = l.trim();
        // Remove: export {}, export default, import ... from "..."
        if (/^export\s*\{\s*\}\s*;?\s*$/.test(t)) { return false; }
        if (/^import\s+.*\s+from\s+['"]/.test(t)) { return false; }
        if (/^import\s+['"]/.test(t)) { return false; }  // import "module"
        // Remove: export keyword from declarations (keep the declaration)
        return true;
      })
      .join("\n")
      // Strip leading 'export' from remaining declarations (e.g. "export function foo" → "function foo")
      .replace(/^export\s+(default\s+)?(?=(function|class|const|let|var|enum|interface|type)\b)/gm, "");

    if (!hasBraceBalance(tsCode)) {
      console.error(`[buildMultiTestCode] FAIL: student TS code has unbalanced braces — skipping`);
      return null;
    }
    return tsCode;
  }

  return null;
}
