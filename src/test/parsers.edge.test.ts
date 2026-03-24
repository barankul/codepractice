// パーサーエッジケース — parser edge case tests
import * as assert from "assert";
import { parseMeta, stripCodeBlocks, normalizeJavaPractice, parseCompileError } from "../parsers.js";

suite("parsers — edge cases", () => {

  suite("parseMeta: markdown bold labels", () => {
    test("parses **TITLE:** bold format", () => {
      const meta = "**TITLE:** My Exercise\n**TASK:** Do something\n**HINT:** Use a loop";
      const r = parseMeta(meta);
      assert.strictEqual(r.title, "My Exercise");
      assert.strictEqual(r.task, "Do something");
      assert.strictEqual(r.hint, "Use a loop");
    });

    test("parses **TITLE: (no closing **) format", () => {
      const meta = "**TITLE: My Exercise\n**TASK: Do something";
      const r = parseMeta(meta);
      assert.strictEqual(r.title, "My Exercise");
      assert.strictEqual(r.task, "Do something");
    });

    test("parses mixed bold and plain labels", () => {
      const meta = "**TITLE:** Bold Title\nTASK: Plain task\n**HINT:** Bold hint";
      const r = parseMeta(meta);
      assert.strictEqual(r.title, "Bold Title");
      assert.strictEqual(r.task, "Plain task");
      assert.strictEqual(r.hint, "Bold hint");
    });

    test("parses **BUG_EXPLANATION:** bold", () => {
      const meta = "**TITLE:** Bug\n**TASK:** Fix\n**BUG_EXPLANATION:** Off by one";
      const r = parseMeta(meta);
      assert.strictEqual(r.bugExplanation, "Off by one");
    });

    test("parses **TEST_CASES:** with bold arrow results", () => {
      const meta = "**TITLE:** T\n**TASK:** D\n**TEST_CASES:**\n- `x = 5` → `10`\n- `x = 0` → `0`";
      const r = parseMeta(meta);
      assert.ok(r.testCases);
      assert.strictEqual(r.testCases!.length, 2);
      assert.strictEqual(r.testCases![0].output, "10");
      assert.strictEqual(r.testCases![1].output, "0");
    });
  });

  suite("parseMeta: unicode and special chars", () => {
    test("handles en-dash in title", () => {
      const meta = "TITLE: Temperature Trend – Longest Streak\nTASK: Find streak";
      const r = parseMeta(meta);
      assert.ok(r.title.includes("–"));
      assert.strictEqual(r.task, "Find streak");
    });

    test("handles Japanese text", () => {
      const meta = "TITLE: 配列の合計\nTASK: 配列の全要素を合計してください\nHINT: forループを使用";
      const r = parseMeta(meta);
      assert.strictEqual(r.title, "配列の合計");
      assert.strictEqual(r.task, "配列の全要素を合計してください");
      assert.strictEqual(r.hint, "forループを使用");
    });

    test("handles Turkish characters", () => {
      const meta = "TITLE: Dizi Toplamı\nTASK: Tüm elemanları toplayın\nHINT: Döngü kullanın";
      const r = parseMeta(meta);
      assert.strictEqual(r.title, "Dizi Toplamı");
      assert.ok(r.hint.includes("Döngü"));
    });

    test("handles degree symbol and backticks in task", () => {
      const meta = "TITLE: Temp\nTASK: Given temperatures in °C stored in `int[]`, compute average";
      const r = parseMeta(meta);
      assert.ok(r.task.includes("°C"));
      assert.ok(r.task.includes("`int[]`"));
    });
  });

  suite("parseMeta: multiline and formatting", () => {
    test("multi-line task with blank lines", () => {
      const meta = "TITLE: T\nTASK: Line 1\n\nLine 2\n\nLine 3\nHINT: H";
      const r = parseMeta(meta);
      assert.ok(r.task.includes("Line 1"));
      assert.ok(r.task.includes("Line 2"));
      assert.ok(r.task.includes("Line 3"));
      assert.strictEqual(r.hint, "H");
    });

    test("CALCULATION field between TASK and HINT", () => {
      const meta = "TITLE: T\nTASK: Do math\nCALCULATION: 2+3=5\nHINT: Add them";
      const r = parseMeta(meta);
      assert.strictEqual(r.task, "Do math");
      assert.strictEqual(r.hint, "Add them");
    });

    test("DESCRIPTION fallback when TASK is empty", () => {
      const meta = "TITLE: T\nDESCRIPTION: Find the maximum value";
      const r = parseMeta(meta);
      assert.strictEqual(r.task, "Find the maximum value");
    });

    test("BUG_HINT fallback when HINT is empty", () => {
      const meta = "TITLE: T\nTASK: Fix\nBUG_HINT: Check loop bounds";
      const r = parseMeta(meta);
      assert.strictEqual(r.hint, "Check loop bounds");
    });

    test("BUG_EXPLANATION falls back to BUG_HINT when omitted", () => {
      const meta = "TITLE: T\nTASK: Fix\nBUG_HINT: Check loop bounds";
      const r = parseMeta(meta);
      assert.strictEqual(r.bugExplanation, "Check loop bounds");
    });

    test("parses Japanese bug fields with localized labels", () => {
      const meta =
        "\u30bf\u30a4\u30c8\u30eb: \u30d0\u30b0\u4fee\u6b63\n" +
        "\u8ab2\u984c: \u30d0\u30b0\u3092\u898b\u3064\u3051\u3066\u4fee\u6b63\u3057\u3066\u304f\u3060\u3055\u3044\n" +
        "\u30d0\u30b0\u30d2\u30f3\u30c8: \u30eb\u30fc\u30d7\u6761\u4ef6\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\n" +
        "\u30d0\u30b0\u8aac\u660e: <= \u306e\u4ee3\u308f\u308a\u306b < \u3092\u4f7f\u3046\u3079\u304d\u3067\u3059";
      const r = parseMeta(meta);
      assert.strictEqual(r.hint, "\u30eb\u30fc\u30d7\u6761\u4ef6\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044");
      assert.strictEqual(r.bugExplanation, "<= \u306e\u4ee3\u308f\u308a\u306b < \u3092\u4f7f\u3046\u3079\u304d\u3067\u3059");
    });

    test("parses Japanese full-width colon labels", () => {
      const meta =
        "\u30bf\u30a4\u30c8\u30eb\uff1a \u30d0\u30b0\u4fee\u6b63\n" +
        "\u30bf\u30b9\u30af\uff1a \u30ed\u30b8\u30c3\u30af\u3092\u4fee\u6b63\u3057\u3066\u304f\u3060\u3055\u3044\n" +
        "\u30d0\u30b0\u8aac\u660e\uff1a \u6761\u4ef6\u5f0f\u304c\u9006\u3067\u3059";
      const r = parseMeta(meta);
      assert.strictEqual(r.title, "\u30d0\u30b0\u4fee\u6b63");
      assert.strictEqual(r.task, "\u30ed\u30b8\u30c3\u30af\u3092\u4fee\u6b63\u3057\u3066\u304f\u3060\u3055\u3044");
      assert.strictEqual(r.bugExplanation, "\u6761\u4ef6\u5f0f\u304c\u9006\u3067\u3059");
    });

    test("parses Japanese natural labels with の", () => {
      const meta =
        "\u30bf\u30a4\u30c8\u30eb: \u30d0\u30b0\u4fee\u6b63\n" +
        "\u30bf\u30b9\u30af: \u30ed\u30b8\u30c3\u30af\u3092\u4fee\u6b63\u3057\u3066\u304f\u3060\u3055\u3044\n" +
        "\u30d0\u30b0\u306e\u30d2\u30f3\u30c8: \u30eb\u30fc\u30d7\u6761\u4ef6\u3092\u898b\u76f4\u3057\u3066\u304f\u3060\u3055\u3044\n" +
        "\u30d0\u30b0\u306e\u8aac\u660e: \u6bd4\u8f03\u6f14\u7b97\u5b50\u304c\u9006\u3067\u3059";
      const r = parseMeta(meta);
      assert.strictEqual(r.hint, "\u30eb\u30fc\u30d7\u6761\u4ef6\u3092\u898b\u76f4\u3057\u3066\u304f\u3060\u3055\u3044");
      assert.strictEqual(r.bugExplanation, "\u6bd4\u8f03\u6f14\u7b97\u5b50\u304c\u9006\u3067\u3059");
    });

    test("null/undefined input", () => {
      const r1 = parseMeta(null as any);
      assert.strictEqual(r1.title, "");
      assert.strictEqual(r1.task, "");
      const r2 = parseMeta(undefined as any);
      assert.strictEqual(r2.title, "");
    });

    test("only whitespace input", () => {
      const r = parseMeta("   \n  \n   ");
      assert.strictEqual(r.title, "");
      assert.strictEqual(r.task, "");
    });

    test("keys with extra whitespace after colon", () => {
      const meta = "TITLE:    Spaced Title   \nTASK:   Spaced Task  ";
      const r = parseMeta(meta);
      assert.strictEqual(r.title, "Spaced Title");
      assert.strictEqual(r.task, "Spaced Task");
    });
  });

  suite("parseMeta: test case formats", () => {
    test("unicode arrow → separator", () => {
      const meta = "TITLE: T\nTASK: D\nTEST_CASES:\n- int[] a = {1,2,3} → 6\n- int[] a = {0} → 0";
      const r = parseMeta(meta);
      assert.ok(r.testCases);
      assert.strictEqual(r.testCases!.length, 2);
      assert.strictEqual(r.testCases![0].output, "6");
    });

    test("fat arrow => separator", () => {
      const meta = "TITLE: T\nTASK: D\nTEST_CASES:\n- x = 5 => 25\n- x = 3 => 9";
      const r = parseMeta(meta);
      assert.ok(r.testCases);
      assert.strictEqual(r.testCases!.length, 2);
      assert.strictEqual(r.testCases![0].output, "25");
    });

    test("plain -> separator", () => {
      const meta = "TITLE: T\nTASK: D\nTEST_CASES:\n- x = 5 -> 25";
      const r = parseMeta(meta);
      assert.ok(r.testCases);
      assert.strictEqual(r.testCases![0].output, "25");
    });

    test("pipe | separator", () => {
      const meta = "TITLE: T\nTASK: D\nTEST_CASES:\n- input: [1,2] | output: 3";
      const r = parseMeta(meta);
      assert.ok(r.testCases);
      assert.strictEqual(r.testCases![0].output, "3");
    });

    test("backtick-wrapped output: `42`", () => {
      const meta = "TITLE: T\nTASK: D\nTEST_CASES:\n- int[] a = {1,2} → `3`";
      const r = parseMeta(meta);
      assert.ok(r.testCases);
      assert.strictEqual(r.testCases![0].output, "3");
    });

    test("bold-wrapped output: **42**", () => {
      const meta = "TITLE: T\nTASK: D\nTEST_CASES:\n- int[] a = {1,2} → **3**";
      const r = parseMeta(meta);
      assert.ok(r.testCases);
      assert.strictEqual(r.testCases![0].output, "3");
    });

    test("backtick-wrapped input and output", () => {
      const meta = "TITLE: T\nTASK: D\nTEST_CASES:\n- `int[] a = {5, 10}` → `15`";
      const r = parseMeta(meta);
      assert.ok(r.testCases);
      assert.strictEqual(r.testCases![0].input, "int[] a = {5, 10}");
      assert.strictEqual(r.testCases![0].output, "15");
    });

    test("no test cases returns undefined", () => {
      const meta = "TITLE: T\nTASK: D\nTEST_CASES:";
      const r = parseMeta(meta);
      assert.strictEqual(r.testCases, undefined);
    });

    test("test cases with trailing explanation text", () => {
      const meta = "TITLE: T\nTASK: D\nTEST_CASES:\n- int[] a = {1,2,3} → 6  (sum of all)\n- int[] a = {0} → 0";
      const r = parseMeta(meta);
      assert.ok(r.testCases);
      assert.strictEqual(r.testCases!.length, 2);
    });

    test("negative number output", () => {
      const meta = "TITLE: T\nTASK: D\nTEST_CASES:\n- int[] a = {-5, 3} → -2";
      const r = parseMeta(meta);
      assert.ok(r.testCases);
      assert.strictEqual(r.testCases![0].output, "-2");
    });

    test("string output with spaces", () => {
      const meta = "TITLE: T\nTASK: D\nTEST_CASES:\n- names = {\"a\",\"b\"} -> a b";
      const r = parseMeta(meta);
      assert.ok(r.testCases);
      assert.strictEqual(r.testCases![0].output, "a b");
    });
  });

  suite("normalizeJavaPractice: edge cases", () => {
    test("renames class with generic types", () => {
      const code = "public class Solution<T> {\n}";
      const r = normalizeJavaPractice(code);
      assert.ok(r.includes("public class Practice"));
    });

    test("does not rename inner class", () => {
      const code = "public class Outer {\n  class Inner {\n    class Deep {}\n  }\n}";
      const r = normalizeJavaPractice(code);
      assert.ok(r.includes("public class Practice"));
      assert.ok(r.includes("class Inner"));
      assert.ok(r.includes("class Deep"));
    });

    test("renames class Main", () => {
      const code = "class Main {\n  public static void main(String[] args) {}\n}";
      const r = normalizeJavaPractice(code);
      assert.ok(r.includes("class Practice"));
      assert.ok(!r.includes("class Main"));
    });

    test("handles code with imports", () => {
      const code = "import java.util.*;\n\npublic class ArraySum {\n  public static void main(String[] args) {}\n}";
      const r = normalizeJavaPractice(code);
      assert.ok(r.includes("import java.util.*"));
      assert.ok(r.includes("public class Practice"));
    });

    test("handles code without class declaration", () => {
      const code = "int x = 5;";
      const r = normalizeJavaPractice(code);
      assert.strictEqual(r, "int x = 5;");
    });
  });

  suite("parseCompileError: edge cases", () => {
    test("multiple errors only shows first 5", () => {
      let err = "";
      for (let i = 1; i <= 10; i++) {
        err += `Practice.java:${i}: error: ';' expected\n`;
      }
      const r = parseCompileError(err, "Java");
      const lineMatches = r.match(/Line \d+/g);
      assert.ok(lineMatches);
      assert.ok(lineMatches!.length <= 5);
    });

    test("TypeScript error format", () => {
      const err = "Practice.ts:5: error TS2304: Cannot find name 'foo'";
      const r = parseCompileError(err, "TypeScript");
      assert.ok(r.includes("5"));
    });

    test("handles very long error message — truncated", () => {
      const longErr = "Practice.java:1: error: " + "x".repeat(2000);
      const r = parseCompileError(longErr, "Java");
      assert.ok(r.length < 2100);
    });

    test("not a statement error", () => {
      const err = "Practice.java:3: \u0080\u0081\u0082: not a statement";
      const r = parseCompileError(err, "Java");
      assert.ok(r.toLowerCase().includes("statement") || r.toLowerCase().includes("typo"));
    });
  });

  suite("stripCodeBlocks: edge cases", () => {
    test("nested code blocks", () => {
      const input = "```java\ncode with ```inner``` block\n```";
      const r = stripCodeBlocks(input);
      assert.ok(!r.startsWith("```"));
    });

    test("code block without closing fence", () => {
      const input = "```java\nint x = 1;";
      const r = stripCodeBlocks(input);
      assert.ok(r.includes("int x = 1;"));
    });

    test("multiple language tags", () => {
      const input = "```typescript\nconst x = 1;\n```\n\n```java\nint x = 1;\n```";
      const r = stripCodeBlocks(input);
      assert.ok(r.includes("const x = 1;"));
      assert.ok(r.includes("int x = 1;"));
      assert.ok(!r.includes("```"));
    });
  });
});
