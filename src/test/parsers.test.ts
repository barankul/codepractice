// パーサーテスト — parser unit tests
import * as assert from "assert";
import { stripCodeBlocks, parseMeta, parseCompileError, normalizeJavaPractice, escapeHtml, enhanceTaskText } from "../parsers.js";

suite("parsers", () => {

  suite("stripCodeBlocks", () => {
    test("removes fences with language tag", () => {
      assert.strictEqual(stripCodeBlocks("```java\nint x = 1;\n```"), "int x = 1;");
    });

    test("removes fences without language tag", () => {
      assert.strictEqual(stripCodeBlocks("```\nhello\n```"), "hello");
    });

    test("leaves text without fences unchanged", () => {
      assert.strictEqual(stripCodeBlocks("no fences here"), "no fences here");
    });

    test("returns empty-ish input as-is", () => {
      assert.strictEqual(stripCodeBlocks(""), "");
      assert.strictEqual(stripCodeBlocks(null as any), null);
      assert.strictEqual(stripCodeBlocks(undefined as any), undefined);
    });

    test("handles multiple code blocks", () => {
      const input = "```js\na\n```\ntext\n```ts\nb\n```";
      const result = stripCodeBlocks(input);
      assert.ok(!result.includes("```"));
      assert.ok(result.includes("a"));
      assert.ok(result.includes("b"));
    });

    test("trims whitespace", () => {
      assert.strictEqual(stripCodeBlocks("  ```\n  code  \n```  "), "code");
    });
  });

  suite("parseMeta", () => {
    test("parses basic TITLE/TASK/EXPECTED_OUTPUT", () => {
      const meta = "TITLE: Sum Two\nTASK: Add two numbers\nEXPECTED_OUTPUT: 42";
      const r = parseMeta(meta);
      assert.strictEqual(r.title, "Sum Two");
      assert.strictEqual(r.task, "Add two numbers");
      assert.strictEqual(r.expectedOutput, "42");
    });

    test("parses HINT", () => {
      const meta = "TITLE: T\nTASK: Do\nHINT: Try a loop";
      assert.strictEqual(parseMeta(meta).hint, "Try a loop");
    });

    test("parses OUTPUT fallback (when EXPECTED_OUTPUT missing)", () => {
      const meta = "TITLE: T\nTASK: Do\nOUTPUT: 99";
      assert.strictEqual(parseMeta(meta).expectedOutput, "99");
    });

    test("parses MINI_TEST fallback", () => {
      const meta = "TITLE: T\nTASK: Do\nMINI_TEST: 5";
      assert.strictEqual(parseMeta(meta).expectedOutput, "5");
    });

    test("multi-line value continues until next KEY", () => {
      const meta = "TITLE: T\nTASK: Line one\nLine two\nLine three\nEXPECTED_OUTPUT: 10";
      const r = parseMeta(meta);
      assert.ok(r.task.includes("Line one"));
      assert.ok(r.task.includes("Line two"));
      assert.ok(r.task.includes("Line three"));
      assert.strictEqual(r.expectedOutput, "10");
    });

    test("empty input returns empty fields", () => {
      const r = parseMeta("");
      assert.strictEqual(r.title, "");
      assert.strictEqual(r.task, "");
      assert.strictEqual(r.expectedOutput, "");
    });

    test("strips code fences from expected output", () => {
      const meta = "TITLE: T\nTASK: Do\nEXPECTED_OUTPUT: ```\n42\n```";
      assert.strictEqual(parseMeta(meta).expectedOutput, "42");
    });

    test("parses BUG_EXPLANATION", () => {
      const meta = "TITLE: T\nTASK: Do\nBUG_EXPLANATION: Off by one error";
      assert.strictEqual(parseMeta(meta).bugExplanation, "Off by one error");
    });

    test("parses TEST_CASES", () => {
      const meta = "TITLE: T\nTASK: Do\nTEST_CASES:\n- input: [1,2] | output: 3\n- input: [0,0] | output: 0";
      const r = parseMeta(meta);
      assert.ok(r.testCases);
      assert.strictEqual(r.testCases!.length, 2);
      assert.strictEqual(r.testCases![0].output, "3");
    });

    test("case-insensitive keys", () => {
      const meta = "title: T\ntask: Do\nexpected_output: 5";
      const r = parseMeta(meta);
      assert.strictEqual(r.title, "T");
      assert.strictEqual(r.expectedOutput, "5");
    });

    test("handles \\r\\n line endings", () => {
      const meta = "TITLE: T\r\nTASK: Do\r\nEXPECTED_OUTPUT: 5";
      const r = parseMeta(meta);
      assert.strictEqual(r.title, "T");
      assert.strictEqual(r.expectedOutput, "5");
    });
  });

  suite("parseCompileError", () => {
    test("extracts line number from Java error", () => {
      const err = "Practice.java:7: error: ';' expected\n        int x = 5\n                 ^";
      const r = parseCompileError(err, "Java");
      assert.ok(r.includes("7"));
    });

    test("handles garbled encoding with semicolon hint", () => {
      const err = "Practice.java:3: \u0080\u0081\u0082: ';'\n^";
      const r = parseCompileError(err, "Java");
      assert.ok(r.toLowerCase().includes("semicolon") || r.includes(";"));
      assert.ok(r.includes("3"));
    });

    test("handles garbled with cannot find symbol", () => {
      const err = "Practice.java:5: \u0080\u0081\u0082: cannot find symbol\nresult";
      const r = parseCompileError(err, "Java");
      assert.ok(r.toLowerCase().includes("not found") || r.toLowerCase().includes("symbol"));
    });

    test("handles garbled with parenthesis", () => {
      const err = "Practice.java:2: \u0080\u0081\u0082: ')'";
      const r = parseCompileError(err, "Java");
      assert.ok(r.toLowerCase().includes("parenthesis"));
    });

    test("handles garbled with brace", () => {
      const err = "Practice.java:4: \u0080\u0081\u0082: '}'";
      const r = parseCompileError(err, "Java");
      assert.ok(r.toLowerCase().includes("brace"));
    });

    test("handles empty error", () => {
      const r = parseCompileError("", "Java");
      assert.ok(r.toLowerCase().includes("error") || r.toLowerCase().includes("syntax"));
    });

    test("simplifies readable Java error", () => {
      const err = "Practice.java:10: error: incompatible types\n  found: String\n  required: int";
      const r = parseCompileError(err, "Java");
      assert.ok(r.includes("10"));
    });

    test("limits output length", () => {
      const longErr = "x".repeat(1000);
      const r = parseCompileError(longErr, "Java");
      assert.ok(r.length <= 600);
    });
  });

  suite("normalizeJavaPractice", () => {
    test("renames public class to Practice", () => {
      const code = "public class Foo {\n  public static void main(String[] args) {}\n}";
      const r = normalizeJavaPractice(code);
      assert.ok(r.includes("public class Practice"));
      assert.ok(!r.includes("class Foo"));
    });

    test("renames class Main to Practice", () => {
      const code = "class Main {\n}";
      assert.ok(normalizeJavaPractice(code).includes("class Practice"));
    });

    test("leaves Practice as-is", () => {
      const code = "public class Practice {\n}";
      assert.strictEqual(normalizeJavaPractice(code), code);
    });

    test("handles empty/null input", () => {
      assert.strictEqual(normalizeJavaPractice(""), "");
      assert.strictEqual(normalizeJavaPractice(null as any), "");
    });

    test("only renames top-level class", () => {
      const code = "public class Foo {\n  class Inner {}\n}";
      const r = normalizeJavaPractice(code);
      assert.ok(r.includes("class Inner"));
      assert.ok(r.includes("public class Practice"));
    });
  });

  suite("escapeHtml", () => {
    test("escapes angle brackets", () => {
      assert.strictEqual(escapeHtml("<div>"), "&lt;div&gt;");
    });

    test("escapes ampersand", () => {
      assert.strictEqual(escapeHtml("a & b"), "a &amp; b");
    });

    test("escapes quotes", () => {
      assert.ok(escapeHtml('"hello"').includes("&quot;"));
      assert.ok(escapeHtml("'hello'").includes("&#039;"));
    });

    test("converts newlines to <br>", () => {
      assert.strictEqual(escapeHtml("a\nb"), "a<br>b");
    });

    test("handles empty string", () => {
      assert.strictEqual(escapeHtml(""), "");
    });

    test("escapes all special chars together", () => {
      const r = escapeHtml('<a href="x">&');
      assert.ok(!r.includes("<a"));
      assert.ok(r.includes("&amp;"));
      assert.ok(r.includes("&lt;"));
    });
  });

  suite("enhanceTaskText", () => {
    test("wraps inline backtick code in <code>", () => {
      const r = enhanceTaskText("Use `myVar` to store");
      assert.ok(r.includes("<code>myVar</code>"));
    });

    test("adds keyword spans for Java types", () => {
      const r = enhanceTaskText("Declare an int variable");
      assert.ok(r.includes('class="kw-type"'));
      assert.ok(r.includes("int"));
    });

    test("adds keyword spans for control flow", () => {
      const r = enhanceTaskText("Use a for loop");
      assert.ok(r.includes('class="keyword"'));
    });

    test("strips code blocks from task text", () => {
      const r = enhanceTaskText("Do this:\n```java\nint x = 1;\n```\nDone.");
      assert.ok(!r.includes("```"));
      assert.ok(r.includes("Do this:"));
    });

    test("converts newlines to <br>", () => {
      const r = enhanceTaskText("Line 1\nLine 2");
      assert.ok(r.includes("<br>"));
    });

    test("escapes HTML entities", () => {
      const r = enhanceTaskText("a < b && c > d");
      assert.ok(!r.includes("<") || r.includes("&lt;"));
      assert.ok(r.includes("&amp;"));
    });

    test("returns original if cleaning removes everything", () => {
      const code = "```java\nint x = 1;\n```";
      const r = enhanceTaskText(code);
      assert.ok(r.length > 0);
    });
  });
});
