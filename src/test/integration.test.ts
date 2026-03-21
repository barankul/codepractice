// 統合テスト — cross-module integration tests
import * as assert from "assert";
import { normalizeOutput, numericMatch, jsonDeepEqual, checkOutput, checkApiOutput } from "../outputChecker.js";
import { parseMeta, stripCodeBlocks } from "../parsers.js";
import { buildMultiTestCode, extractMainBody, extractStudentLogic } from "../multiTestRunner.js";
import { PracticeData } from "../constants.js";

const mockOutput = { appendLine: () => {} } as any;

suite("Integration", () => {

  // ─── normalizeOutput lang-awareness ───

  suite("normalizeOutput lang-aware", () => {
    test("SQL preserves separator lines", () => {
      const input = "name|salary\n---|---\nAlice|50000";
      const sql = normalizeOutput(input, "SQL");
      const nonSql = normalizeOutput(input);
      assert.ok(sql.includes("---"), "SQL should preserve separators");
      assert.ok(!nonSql.includes("---"), "non-SQL should remove separators");
    });

    test("SQL preserves pipe-separated data", () => {
      const input = "Alice | 50000 | Engineering";
      const result = normalizeOutput(input, "SQL");
      assert.ok(result.includes("alice|50000|engineering"));
    });

    test("non-SQL removes decorative lines", () => {
      const result = normalizeOutput("Title\n==========\nValue");
      assert.ok(!result.includes("="), "decorative === lines should be removed");
    });
  });

  // ─── numericMatch ───

  suite("numericMatch precision", () => {
    test("matches identical integers", () => {
      assert.ok(numericMatch("42", "42"));
    });

    test("matches float precision edge (15.12 vs 15.120000000000001)", () => {
      assert.ok(numericMatch("15.120000000000001", "15.12"));
    });

    test("matches within 0.5% tolerance", () => {
      assert.ok(numericMatch("100.4", "100"));
    });

    test("rejects values outside tolerance", () => {
      assert.ok(!numericMatch("340", "350"));
    });

    test("rejects non-numeric strings", () => {
      assert.ok(!numericMatch("hello", "42"));
    });

    test("handles negative numbers", () => {
      assert.ok(numericMatch("-10", "-10.001"));
    });

    test("handles zero", () => {
      assert.ok(numericMatch("0", "0.005"));
    });
  });

  // ─── jsonDeepEqual ───

  suite("jsonDeepEqual key order", () => {
    test("matches objects with different key order", () => {
      assert.ok(jsonDeepEqual('{"b":2,"a":1}', '{"a":1,"b":2}'));
    });

    test("matches nested objects with different order", () => {
      assert.ok(jsonDeepEqual(
        '{"user":{"age":20,"name":"Alice"}}',
        '{"user":{"name":"Alice","age":20}}'
      ));
    });

    test("rejects objects with different values", () => {
      assert.ok(!jsonDeepEqual('{"a":1}', '{"a":2}'));
    });

    test("handles arrays (order matters)", () => {
      assert.ok(jsonDeepEqual('[1,2,3]', '[1,2,3]'));
      assert.ok(!jsonDeepEqual('[1,2,3]', '[3,2,1]'));
    });

    test("rejects invalid JSON gracefully", () => {
      assert.ok(!jsonDeepEqual("not json", '{"a":1}'));
    });
  });

  // ─── SQL header stripping in checkOutput ───

  suite("SQL header stripping", () => {
    test("checkOutput passes when output has column header but expected does not", () => {
      const practice: PracticeData = {
        lang: "SQL",
        topic: "SELECT",
        task: "Select names",
        code: "SELECT name FROM users;",
        expectedOutput: "Alice\nBob"
      };
      const outputWithHeader = "name\nAlice\nBob";
      const result = checkOutput(outputWithHeader, practice, mockOutput, practice.code);
      assert.strictEqual(result.pass, true, "Should pass with header stripping");
    });

    test("checkOutput passes when pipe-separated output has header", () => {
      const practice: PracticeData = {
        lang: "SQL",
        topic: "SELECT",
        task: "Select data",
        code: "SELECT name, salary FROM employees;",
        expectedOutput: "Alice|50000\nBob|60000"
      };
      const outputWithHeader = "name|salary\nAlice|50000\nBob|60000";
      const result = checkOutput(outputWithHeader, practice, mockOutput, practice.code);
      assert.strictEqual(result.pass, true, "Should pass with pipe header stripping");
    });
  });

  // ─── Anti-cheat per language ───

  suite("anti-cheat detection", () => {
    test("Java: detects hardcoded System.out.println with literal", () => {
      const practice: PracticeData = {
        lang: "Java",
        topic: "Array",
        task: "Sum array",
        code: "public class Practice {\n  public static void main(String[] args) {\n    int[] nums = {1,2,3};\n    // YOUR CODE HERE\n  }\n}",
        expectedOutput: "6"
      };
      const hardcoded = "public class Practice {\n  public static void main(String[] args) {\n    int[] nums = {1,2,3};\n    System.out.println(6);\n  }\n}";
      const result = checkOutput("6", practice, mockOutput, hardcoded);
      assert.strictEqual(result.pass, false, "Hardcoded Java output should fail");
    });

    test("TypeScript: detects hardcoded console.log with literal", () => {
      const practice: PracticeData = {
        lang: "TypeScript",
        topic: "Functions",
        task: "Calculate total",
        code: "// YOUR CODE HERE\nconsole.log(calculateTotal(100));",
        expectedOutput: "108.4"
      };
      const hardcoded = "console.log(108.4);";
      const result = checkOutput("108.4", practice, mockOutput, hardcoded);
      assert.strictEqual(result.pass, false, "Hardcoded TS output should fail");
    });

    test("Java: passes when real logic is present", () => {
      const practice: PracticeData = {
        lang: "Java",
        topic: "Array",
        task: "Sum array",
        code: "public class Practice {\n  public static void main(String[] args) {\n    int[] nums = {1,2,3};\n    // YOUR CODE HERE\n  }\n}",
        expectedOutput: "6"
      };
      const withLogic = "public class Practice {\n  public static void main(String[] args) {\n    int[] nums = {1,2,3};\n    int sum = 0;\n    for (int n : nums) sum += n;\n    System.out.println(sum);\n  }\n}";
      const result = checkOutput("6", practice, mockOutput, withLogic);
      assert.strictEqual(result.pass, true, "Code with logic should pass");
    });
  });

  // ─── parseMeta → checkOutput pipeline ───

  suite("parseMeta → checkOutput pipeline", () => {
    test("full pipeline: meta → practice → check", () => {
      const meta = "TITLE: Sum Array\nTASK: Calculate the sum of all elements.\nEXPECTED_OUTPUT: 15\nHINT: Use a for loop.";
      const parsed = parseMeta(meta);

      const practice: PracticeData = {
        lang: "Java",
        topic: "Array",
        task: parsed.task,
        code: "public class Practice {\n  public static void main(String[] args) {\n    int[] nums = {1,2,3,4,5};\n    // TODO\n  }\n}",
        expectedOutput: parsed.expectedOutput,
        title: parsed.title,
        hint: parsed.hint
      };

      const studentCode = "public class Practice {\n  public static void main(String[] args) {\n    int[] nums = {1,2,3,4,5};\n    int sum = 0;\n    for (int n : nums) sum += n;\n    System.out.println(sum);\n  }\n}";

      const result = checkOutput("15", practice, mockOutput, studentCode);
      assert.strictEqual(result.pass, true);
    });

    test("pipeline with stripCodeBlocks in expectedOutput", () => {
      const meta = "TITLE: Hello\nTASK: Print hello\nEXPECTED_OUTPUT: ```\nhello\n```";
      const parsed = parseMeta(meta);
      const stripped = stripCodeBlocks(parsed.expectedOutput);
      assert.strictEqual(stripped.trim(), "hello");
    });
  });

  // ─── buildMultiTestCode round-trip ───

  suite("buildMultiTestCode", () => {
    test("Java: generates code with TC markers and balanced braces", () => {
      const starter = "public class Practice {\n  public static void main(String[] args) {\n    int[] nums = {1,2,3};\n    // YOUR CODE HERE\n  }\n}";
      const solution = "public class Practice {\n  public static void main(String[] args) {\n    int[] nums = {1,2,3};\n    int sum = 0;\n    for (int n : nums) sum += n;\n    System.out.println(sum);\n  }\n}";
      const testCases = [
        { input: "int[] nums = {10, 20}", output: "30" },
        { input: "int[] nums = {0, 0}", output: "0" }
      ];

      const code = buildMultiTestCode(solution, starter, testCases, "Java");
      assert.ok(code !== null, "Should generate code");
      assert.ok(code!.includes("TC1:"), "Should have TC1 marker");
      assert.ok(code!.includes("TC2:"), "Should have TC2 marker");

      const opens = (code!.match(/\{/g) || []).length;
      const closes = (code!.match(/\}/g) || []).length;
      assert.strictEqual(opens, closes, "Braces should be balanced");
    });

    test("TypeScript: generates code with TC markers", () => {
      const starter = "const nums: number[] = [1,2,3];\n// YOUR CODE HERE";
      const solution = "const nums: number[] = [1,2,3];\nlet sum = 0;\nfor (const n of nums) sum += n;\nconsole.log(sum);";
      const testCases = [
        { input: "const nums = [5, 5]", output: "10" },
        { input: "const nums = [0]", output: "0" }
      ];

      const code = buildMultiTestCode(solution, starter, testCases, "TypeScript");
      assert.ok(code !== null, "Should generate TS code");
      assert.ok(code!.includes("TC1:"), "Should have TC1 marker");
      assert.ok(code!.includes("TC2:"), "Should have TC2 marker");
    });

    test("extractStudentLogic isolates student additions", () => {
      const starter = "public class Practice {\n  public static void main(String[] args) {\n    int[] nums = {1,2,3};\n    // YOUR CODE HERE\n  }\n}";
      const student = "public class Practice {\n  public static void main(String[] args) {\n    int[] nums = {1,2,3};\n    int sum = 0;\n    for (int n : nums) sum += n;\n    System.out.println(sum);\n  }\n}";

      const logic = extractStudentLogic(student, starter, "Java");
      assert.ok(logic.includes("sum"), "Should extract sum logic");
      assert.ok(!logic.includes("int[] nums"), "Should not include data block");
    });
  });

  // ─── checkApiOutput ───

  suite("checkApiOutput", () => {
    test("passes when all fields present", () => {
      const output = "Name: Leanne Graham\nEmail: Sincere@april.biz\nPhone: 1-770-736-8031";
      const result = checkApiOutput(output, ["name", "email"]);
      assert.strictEqual(result.pass, true);
    });

    test("fails when field missing", () => {
      const output = "Name: Leanne Graham";
      const result = checkApiOutput(output, ["name", "email"]);
      assert.strictEqual(result.pass, false);
    });

    test("fails on error output", () => {
      const output = "error: fetch failed";
      const result = checkApiOutput(output, ["name"]);
      assert.strictEqual(result.pass, false);
    });

    test("fails on empty output", () => {
      const result = checkApiOutput("", ["name"]);
      assert.strictEqual(result.pass, false);
    });
  });
});
