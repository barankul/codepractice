// マルチテストランナーエッジケース — multi test runner edge case tests
import * as assert from "assert";
import {
  extractMainBody,
  extractDataBlock,
  extractPrintStatement,
  extractStudentLogic,
  buildMultiTestCode,
  parseMultiTestTcLine,
} from "../multiTestRunner.js";

function javaClass(body: string): string {
  return `public class Practice {\n    public static void main(String[] args) {\n${body}\n    }\n}`;
}

suite("multiTestRunner — advanced edge cases", () => {

  suite("extractMainBody: advanced", () => {
    test("handles string literals with braces inside main", () => {
      const code = javaClass(
        '        String s = "hello { world }";' + "\n" +
        "        System.out.println(s);"
      );
      const body = extractMainBody(code, "Java");
      assert.ok(body.includes('"hello { world }"'));
      assert.ok(body.includes("System.out.println"));
    });

    test("handles char literals with braces", () => {
      const code = javaClass(
        "        char c = '{';  // brace char\n" +
        "        System.out.println(c);"
      );
      const body = extractMainBody(code, "Java");
      assert.ok(body.includes("char c"));
    });

    test("handles empty main body", () => {
      const code = "public class Practice {\n    public static void main(String[] args) {\n    }\n}";
      const body = extractMainBody(code, "Java");
      assert.strictEqual(body, "");
    });

    test("handles code with helper methods outside main", () => {
      const code = [
        "public class Practice {",
        "    static int helper(int x) { return x * 2; }",
        "    public static void main(String[] args) {",
        "        int result = helper(5);",
        "        System.out.println(result);",
        "    }",
        "}"
      ].join("\n");
      const body = extractMainBody(code, "Java");
      assert.ok(body.includes("helper(5)"));
      assert.ok(!body.includes("static int helper"));
    });

    test("returns full code for SQL", () => {
      const code = "SELECT * FROM users;";
      const body = extractMainBody(code, "SQL");
      assert.strictEqual(body, "");
    });
  });

  suite("extractDataBlock: advanced", () => {
    test("handles multi-line array initialization", () => {
      const code = javaClass(
        "        int[] nums = {\n" +
        "            1, 2, 3,\n" +
        "            4, 5, 6\n" +
        "        };\n" +
        "        // YOUR CODE HERE"
      );
      const data = extractDataBlock(code, "Java");
      assert.ok(data.length >= 1);
      assert.ok(data[0].includes("int[] nums"));
    });

    test("preserves String array data", () => {
      const code = javaClass(
        '        String[] words = {"hello", "world"};' + "\n" +
        "        // YOUR CODE HERE"
      );
      const data = extractDataBlock(code, "Java");
      assert.strictEqual(data.length, 1);
      assert.ok(data[0].includes("String[] words"));
    });

    test("handles multiple result-like variables", () => {
      const code = javaClass(
        "        int[] nums = {1, 2};\n" +
        "        int result = 0;\n" +
        "        double result2 = 0.0;\n" +
        "        // YOUR CODE HERE"
      );
      const data = extractDataBlock(code, "Java");
      assert.ok(!data.some(d => d.includes("int result")));
    });

    test("TypeScript: handles const with type annotation", () => {
      const code = "const nums: number[] = [1, 2, 3];\nconst label: string = 'test';\nlet result: number = 0;\n// YOUR CODE HERE\nconsole.log(result);";
      const data = extractDataBlock(code, "TypeScript");
      assert.ok(data.some(d => d.includes("const nums")));
      assert.ok(data.some(d => d.includes("const label")));
      assert.ok(!data.some(d => d.includes("result")));
    });

    test("stops at first YOUR CODE HERE, ignores second", () => {
      const code = javaClass(
        "        int x = 5;\n" +
        "        // YOUR CODE HERE\n" +
        "        int y = 10;\n" +
        "        // YOUR CODE HERE\n" +
        "        System.out.println(x + y);"
      );
      const data = extractDataBlock(code, "Java");
      assert.strictEqual(data.length, 1);
      assert.ok(data[0].includes("int x = 5"));
    });

    test("case-insensitive YOUR CODE HERE", () => {
      const code = javaClass(
        "        int x = 5;\n" +
        "        // your code here\n" +
        "        System.out.println(x);"
      );
      const data = extractDataBlock(code, "Java");
      assert.strictEqual(data.length, 1);
    });
  });

  suite("extractPrintStatement: advanced", () => {
    test("finds println with string concatenation", () => {
      const code = javaClass(
        '        System.out.println("Sum: " + (a + b));'
      );
      const ps = extractPrintStatement(code, "Java");
      assert.ok(ps);
      assert.ok(ps!.includes("Sum"));
    });

    test("finds println with ternary expression", () => {
      const code = javaClass(
        '        System.out.println(x > 0 ? "positive" : "non-positive");'
      );
      const ps = extractPrintStatement(code, "Java");
      assert.ok(ps);
      assert.ok(ps!.includes("positive"));
    });

    test("TypeScript: finds console.log with template literal", () => {
      const code = "const x = 5;\nconsole.log(`Result: ${x}`);";
      const ps = extractPrintStatement(code, "TypeScript");
      assert.ok(ps);
      assert.ok(ps!.includes("console.log"));
    });

    test("ignores print statements inside comments", () => {
      const code = javaClass(
        "        // System.out.println(42);\n" +
        "        System.out.println(result);"
      );
      const ps = extractPrintStatement(code, "Java");
      assert.ok(ps);
      assert.ok(ps!.includes("result"));
    });
  });

  suite("extractStudentLogic: advanced", () => {
    test("handles student who added extra variables", () => {
      const starter = javaClass(
        "        int[] nums = {1, 2, 3};\n" +
        "        int result = 0;\n" +
        "        // YOUR CODE HERE\n" +
        "        System.out.println(result);"
      );
      const student = javaClass(
        "        int[] nums = {1, 2, 3};\n" +
        "        int result = 0;\n" +
        "        int temp = 0;\n" +
        "        for (int n : nums) { temp += n; }\n" +
        "        result = temp;\n" +
        "        System.out.println(result);"
      );
      const logic = extractStudentLogic(student, starter, "Java");
      assert.ok(logic.includes("int temp = 0"));
      assert.ok(logic.includes("for (int n : nums)"));
      assert.ok(logic.includes("result = temp"));
      assert.ok(!logic.includes("System.out.println"));
    });

    test("handles student who modified the data line", () => {
      const starter = javaClass(
        "        int[] nums = {1, 2, 3};\n" +
        "        // YOUR CODE HERE\n" +
        "        System.out.println(0);"
      );
      const student = javaClass(
        "        int[] nums = {1, 2, 3};\n" +
        "        int sum = 0;\n" +
        "        for (int n : nums) sum += n;\n" +
        "        System.out.println(sum);"
      );
      const logic = extractStudentLogic(student, starter, "Java");
      assert.ok(logic.includes("int sum = 0"));
      assert.ok(logic.includes("for (int n : nums)"));
    });

    test("TypeScript: skips YOUR CODE HERE comment", () => {
      const starter = "const arr = [1, 2];\nlet result = 0;\n// YOUR CODE HERE\nconsole.log(result);";
      const student = "const arr = [1, 2];\nlet result = 0;\n// YOUR CODE HERE\nresult = arr[0] + arr[1];\nconsole.log(result);";
      const logic = extractStudentLogic(student, starter, "TypeScript");
      assert.ok(!logic.includes("YOUR CODE HERE"));
      assert.ok(logic.includes("result = arr[0]"));
    });
  });

  suite("buildMultiTestCode: advanced", () => {
    test("Java: includes imports from student code", () => {
      const student = "import java.util.Arrays;\n" + javaClass(
        "        int[] nums = {1, 2, 3};\n" +
        "        int result = 0;\n" +
        "        result = Arrays.stream(nums).sum();\n" +
        "        System.out.println(result);"
      );
      const starter = javaClass(
        "        int[] nums = {1, 2, 3};\n" +
        "        int result = 0;\n" +
        "        // YOUR CODE HERE\n" +
        "        System.out.println(result);"
      );
      const testCases = [
        { input: "int[] nums = {10, 20}", output: "30" },
      ];
      const result = buildMultiTestCode(student, starter, testCases, "Java");
      assert.ok(result);
      assert.ok(result!.includes("import java.util.Arrays"));
    });

    test("Java: handles semicolon-separated input declarations", () => {
      const student = javaClass(
        "        int a = 5;\n" +
        "        int b = 3;\n" +
        "        int result = 0;\n" +
        "        result = a + b;\n" +
        "        System.out.println(result);"
      );
      const starter = javaClass(
        "        int a = 5;\n" +
        "        int b = 3;\n" +
        "        int result = 0;\n" +
        "        // YOUR CODE HERE\n" +
        "        System.out.println(result);"
      );
      const testCases = [
        { input: "int a = 10; int b = 20", output: "30" },
      ];
      const result = buildMultiTestCode(student, starter, testCases, "Java");
      assert.ok(result);
      assert.ok(result!.includes("int a = 10;"));
      assert.ok(result!.includes("int b = 20;"));
    });

    test("TypeScript: builds multi-test blocks", () => {
      const student = "const nums = [1, 2, 3];\nlet result = 0;\nfor (const n of nums) result += n;\nconsole.log(result);";
      const starter = "const nums = [1, 2, 3];\nlet result = 0;\n// YOUR CODE HERE\nconsole.log(result);";
      const testCases = [
        { input: "const nums = [5, 5]", output: "10" },
        { input: "const nums = [0]", output: "0" },
      ];
      const result = buildMultiTestCode(student, starter, testCases, "TypeScript");
      assert.ok(result);
      assert.ok(result!.includes("TC1:"));
      assert.ok(result!.includes("TC2:"));
      assert.ok(result!.includes("const nums = [5, 5]"));
    });

    test("TypeScript: keeps full top-level declarations without dropping duplicate closing braces", () => {
      const student = `// Enum Days of Week
enum Day {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday
}

function isWeekend(day: Day): boolean {
  return day === Day.Saturday || day === Day.Sunday;
}

console.log(\`Monday: \${isWeekend(Day.Monday)}\`);
console.log(\`Friday: \${isWeekend(Day.Friday)}\`);
console.log(\`Saturday: \${isWeekend(Day.Saturday)}\`);
console.log(\`Sunday: \${isWeekend(Day.Sunday)}\`);
`;
      const starter = `// Enum Days of Week
// YOUR CODE HERE
`;
      const testCases = [
        { input: "const testDays = [\"Monday\", \"Friday\", \"Saturday\", \"Sunday\"]", output: "Monday: false\nFriday: false\nSaturday: true\nSunday: true" },
      ];
      const result = buildMultiTestCode(student, starter, testCases, "TypeScript");
      assert.ok(result);
      assert.ok(result!.includes("enum Day"));
      assert.ok(result!.includes("function isWeekend"));
      assert.ok(result!.includes("TC1:"));
    });

    test("Java: allows helper-method solutions even when main logic is minimal", () => {
      const student = [
        "public class Practice {",
        "    public static int factorial(int n) {",
        "        if (n <= 1) return 1;",
        "        return n * factorial(n - 1);",
        "    }",
        "    public static void main(String[] args) {",
        "        int n = 5;",
        "        System.out.println(factorial(n));",
        "    }",
        "}",
      ].join("\n");
      const starter = [
        "public class Practice {",
        "    public static int factorial(int n) {",
        "        // YOUR CODE HERE",
        "        return 0;",
        "    }",
        "    public static void main(String[] args) {",
        "        int n = 5;",
        "        System.out.println(factorial(n));",
        "    }",
        "}",
      ].join("\n");
      const testCases = [
        { input: "int n = 3", output: "6" },
      ];
      const result = buildMultiTestCode(student, starter, testCases, "Java");
      assert.ok(result);
      assert.ok(result!.includes("factorial"));
      assert.ok(result!.includes("TC1:"));
    });

    test("Java: captures multi-line loop output without leaking loop variables", () => {
      const student = [
        "import java.util.ArrayList;",
        "import java.util.Arrays;",
        "public class Practice {",
        "    public static void main(String[] args) {",
        "        int[][] intervals = {{1, 3}, {2, 6}, {8, 10}, {15, 18}};",
        "        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);",
        "        ArrayList<int[]> merged = new ArrayList<>();",
        "        merged.add(intervals[0]);",
        "        for (int i = 1; i < intervals.length; i++) {",
        "            int[] last = merged.get(merged.size() - 1);",
        "            if (intervals[i][0] <= last[1]) {",
        "                last[1] = Math.max(last[1], intervals[i][1]);",
        "            } else {",
        "                merged.add(intervals[i]);",
        "            }",
        "        }",
        "        for (int[] iv : merged) {",
        "            System.out.println(Arrays.toString(iv));",
        "        }",
        "    }",
        "}",
      ].join("\n");
      const starter = [
        "import java.util.ArrayList;",
        "import java.util.Arrays;",
        "public class Practice {",
        "    public static void main(String[] args) {",
        "        int[][] intervals = {{1, 3}, {2, 6}, {8, 10}, {15, 18}};",
        "        // YOUR CODE HERE",
        "    }",
        "}",
      ].join("\n");
      const testCases = [
        { input: "int[][] intervals = {{1, 3}, {2, 6}, {8, 10}, {15, 18}}", output: "[1, 6]\n[8, 10]\n[15, 18]" },
      ];
      const result = buildMultiTestCode(student, starter, testCases, "Java");
      assert.ok(result);
      assert.ok(result!.includes("System.setOut(new java.io.PrintStream(_buf1, true));"));
      assert.ok(result!.includes("System.out.println(Arrays.toString(iv));"));
      assert.ok(result!.includes("TC1:B64:"));
      assert.ok(!result!.includes('System.out.println("TC1:" + (Arrays.toString(iv)));'));
    });

    test("returns null for SQL", () => {
      const result = buildMultiTestCode("SELECT 1", "SELECT 1", [{ input: "x", output: "1" }], "SQL");
      assert.strictEqual(result, null);
    });

    test("returns null for single test case with no logic", () => {
      const code = javaClass("        System.out.println(42);");
      const result = buildMultiTestCode(code, code, [{ input: "int x = 1", output: "1" }], "Java");
      assert.strictEqual(result, null);
    });
  });

  suite("parseMultiTestTcLine", () => {
    test("decodes base64 multi-line output", () => {
      const parsed = parseMultiTestTcLine("TC2:B64:WzEsIDZdCls4LCAxMF0=");
      assert.deepStrictEqual(parsed, { tcNum: 2, output: "[1, 6]\n[8, 10]" });
    });
  });
});
