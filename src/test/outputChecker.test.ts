// 出力チェッカーテスト — output checker tests
import * as assert from "assert";
import { checkOutput } from "../outputChecker.js";
import { PracticeData } from "../constants.js";

const mockOutput = { appendLine: () => {} } as any;

function makePractice(overrides: Partial<PracticeData> = {}): PracticeData {
  return {
    lang: "Java",
    topic: "Array",
    task: "Sum the array",
    code: 'public class Practice {\n  public static void main(String[] args) {\n    // YOUR CODE HERE\n  }\n}',
    expectedOutput: "42",
    ...overrides
  };
}

suite("outputChecker", () => {

  test("PASS when output matches expected", () => {
    const r = checkOutput("42", makePractice(), mockOutput, 'public class Practice {\n  public static void main(String[] args) {\n    int sum = 42;\n    System.out.println(sum);\n  }\n}');
    assert.strictEqual(r.pass, true);
  });

  test("FAIL when output does not match", () => {
    const r = checkOutput("99", makePractice(), mockOutput, 'public class Practice {\n  public static void main(String[] args) {\n    System.out.println(99);\n  }\n}');
    assert.strictEqual(r.pass, false);
  });

  test("FAIL when output contains error", () => {
    const r = checkOutput("error: NullPointerException", makePractice(), mockOutput);
    assert.strictEqual(r.pass, false);
    assert.ok(r.testResults?.[0]?.name.includes("Compilation"));
  });

  test("FAIL when output contains exception", () => {
    const r = checkOutput("java.lang.ArrayIndexOutOfBoundsException", makePractice(), mockOutput);
    assert.strictEqual(r.pass, false);
  });

  test("FAIL when code is unchanged from starter", () => {
    const practice = makePractice();
    const r = checkOutput("42", practice, mockOutput, practice.code);
    assert.strictEqual(r.pass, false);
    assert.ok(r.testResults?.[0]?.name.includes("Code Modified"));
  });

  test("unchanged check ignores whitespace differences", () => {
    const practice = makePractice();
    const sameCodeDiffSpaces = practice.code.replace(/\n/g, "\n  ");
    const r = checkOutput("42", practice, mockOutput, sameCodeDiffSpaces);
    assert.strictEqual(r.pass, false);
  });

  test("PASS with extra spaces in output", () => {
    const code = 'public class Practice {\n  public static void main(String[] args) {\n    System.out.println("hello  world");\n  }\n}';
    const r = checkOutput("hello  world", makePractice({ expectedOutput: "hello world" }), mockOutput, code);
    assert.strictEqual(r.pass, true);
  });

  test("PASS with pipe spacing normalization", () => {
    const code = 'public class Practice {\n  public static void main(String[] args) {\n    System.out.println("a | b");\n  }\n}';
    const r = checkOutput("a | b", makePractice({ expectedOutput: "a|b" }), mockOutput, code);
    assert.strictEqual(r.pass, true);
  });

  test("PASS: 45.0 matches 45", () => {
    const code = 'public class Practice {\n  public static void main(String[] args) {\n    double[] a = {10.0, 45.0};\n    double sum = 0;\n    for (double v : a) sum += v;\n    System.out.println(sum);\n  }\n}';
    const r = checkOutput("45.0", makePractice({ expectedOutput: "45" }), mockOutput, code);
    assert.strictEqual(r.pass, true);
  });

  test("skips comment lines in expected output", () => {
    const code = 'public class Practice {\n  public static void main(String[] args) {\n    int x = 3 + 2;\n    System.out.println(x);\n  }\n}';
    const r = checkOutput("5", makePractice({ expectedOutput: "// Some comment\n5" }), mockOutput, code);
    assert.strictEqual(r.pass, true);
  });

  test("handles Key: Value format in expected output", () => {
    const code = 'public class Practice {\n  public static void main(String[] args) {\n    int x = 5 * 2;\n    System.out.println(x);\n  }\n}';
    const r = checkOutput("10", makePractice({ expectedOutput: "Result: 10" }), mockOutput, code);
    assert.strictEqual(r.pass, true);
  });

  test("skips separator lines (-----)", () => {
    const code = 'public class Practice {\n  public static void main(String[] args) {\n    int x = 3 + 4;\n    System.out.println(x);\n  }\n}';
    const r = checkOutput("7", makePractice({ expectedOutput: "-----\n7\n-----" }), mockOutput, code);
    assert.strictEqual(r.pass, true);
  });

  test("PASS when no expectedOutput and output exists (no errors)", () => {
    const r = checkOutput("some output", makePractice({ expectedOutput: undefined }), mockOutput);
    assert.strictEqual(r.pass, true);
  });

  test("FAIL when no expectedOutput and no output", () => {
    const r = checkOutput("", makePractice({ expectedOutput: undefined }), mockOutput);
    assert.strictEqual(r.pass, false);
  });

  test("FAIL when no expectedOutput and output has error", () => {
    const r = checkOutput("error something", makePractice({ expectedOutput: undefined }), mockOutput);
    assert.strictEqual(r.pass, false);
  });

  test("PASS when output correct + has method calls", () => {
    const code = 'public class Practice {\n  public static void main(String[] args) {\n    int[] a = {1,2,3};\n    java.util.Arrays.sort(a);\n    System.out.println(a[0]);\n  }\n}';
    const r = checkOutput("1", makePractice({ expectedOutput: "1" }), mockOutput, code);
    assert.strictEqual(r.pass, true);
    const logicTest = r.testResults?.find(t => t.name === "Code Logic");
    assert.strictEqual(logicTest?.pass, true);
  });

  test("PASS when output correct + has loops", () => {
    const code = 'public class Practice {\n  public static void main(String[] args) {\n    int sum = 0;\n    for (int i = 0; i < 10; i++) sum += i;\n    System.out.println(sum);\n  }\n}';
    const r = checkOutput("45", makePractice({ expectedOutput: "45" }), mockOutput, code);
    assert.strictEqual(r.pass, true);
  });

  // hardcoded println without logic should fail
  test("FAIL when output correct but no real work (hardcoded)", () => {
    const code = 'public class Practice {\n  public static void main(String[] args) {\n    System.out.println(42);\n  }\n}';
    const r = checkOutput("42", makePractice({ expectedOutput: "42" }), mockOutput, code);
    assert.strictEqual(r.pass, false);
    const logicTest = r.testResults?.find(t => t.name === "Code Logic");
    assert.strictEqual(logicTest?.pass, false);
  });

  test("SQL: PASS with correct output + SQL keywords", () => {
    const code = "SELECT name FROM users WHERE age > 18;";
    const r = checkOutput("Alice\nBob", makePractice({
      lang: "SQL", expectedOutput: "Alice\nBob", code: ""
    }), mockOutput, code);
    assert.strictEqual(r.pass, true);
    const sqlTest = r.testResults?.find(t => t.name === "SQL Query");
    assert.strictEqual(sqlTest?.pass, true);
  });

  test("SQL: FAIL when output correct but no SQL work", () => {
    const code = "-- nothing";
    const r = checkOutput("Alice", makePractice({
      lang: "SQL", expectedOutput: "Alice", code: ""
    }), mockOutput, code);
    assert.strictEqual(r.pass, false);
  });

  test("SQL: FAIL when output wrong", () => {
    const code = "SELECT name FROM users;";
    const r = checkOutput("Charlie", makePractice({
      lang: "SQL", expectedOutput: "Alice", code: ""
    }), mockOutput, code);
    assert.strictEqual(r.pass, false);
  });

  test("strips code fences from expected output", () => {
    const code = 'public class Practice {\n  public static void main(String[] args) {\n    for(int i=0;i<3;i++) System.out.println(i);\n  }\n}';
    const r = checkOutput("0\n1\n2", makePractice({ expectedOutput: "```\n0\n1\n2\n```" }), mockOutput, code);
    assert.strictEqual(r.pass, true);
  });
});
