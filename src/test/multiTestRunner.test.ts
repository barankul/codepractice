// マルチテストランナーテスト — multi test runner tests
import * as assert from "assert";
import {
  extractMainBody,
  extractDataBlock,
  extractPrintStatement,
  extractStudentLogic,
  buildMultiTestCode,
} from "../multiTestRunner.js";

function javaClass(body: string): string {
  return `public class Practice {\n    public static void main(String[] args) {\n${body}\n    }\n}`;
}

suite("multiTestRunner — edge cases", () => {

  suite("extractMainBody", () => {
    test("extracts body from standard Java class", () => {
      const code = javaClass("        int x = 5;\n        System.out.println(x);");
      const body = extractMainBody(code, "Java");
      assert.ok(body.includes("int x = 5"));
      assert.ok(body.includes("System.out.println"));
    });

    test("returns empty for Java code without main", () => {
      const code = "public class Practice {\n  int x = 5;\n}";
      assert.strictEqual(extractMainBody(code, "Java"), "");
    });

    test("returns full code for TypeScript", () => {
      const code = "const x = 5;\nconsole.log(x);";
      assert.strictEqual(extractMainBody(code, "TypeScript"), code);
    });

    test("handles nested braces inside main", () => {
      const code = javaClass(
        "        for (int i = 0; i < 3; i++) {\n" +
        "            if (i > 0) {\n" +
        "                System.out.println(i);\n" +
        "            }\n" +
        "        }"
      );
      const body = extractMainBody(code, "Java");
      assert.ok(body.includes("for (int i = 0"));
      assert.ok(body.includes("System.out.println(i)"));
    });

    test("handles main with String[] args variant", () => {
      const code = "public class Practice {\n    public static void main(String args[]) {\n        int x = 1;\n    }\n}";
      const body = extractMainBody(code, "Java");
      assert.ok(body.includes("int x = 1"));
    });
  });

  suite("extractDataBlock", () => {
    test("extracts data lines before YOUR CODE HERE", () => {
      const code = javaClass(
        "        int[] nums = {1, 2, 3};\n" +
        "        // YOUR CODE HERE\n" +
        "        System.out.println(result);"
      );
      const data = extractDataBlock(code, "Java");
      assert.strictEqual(data.length, 1);
      assert.ok(data[0].includes("int[] nums"));
    });

    test("stops at TODO marker", () => {
      const code = javaClass(
        "        int[] nums = {4, 5};\n" +
        "        // TODO: compute sum\n" +
        "        System.out.println(result);"
      );
      const data = extractDataBlock(code, "Java");
      assert.strictEqual(data.length, 1);
      assert.ok(data[0].includes("int[] nums"));
    });

    test("skips result variable initializer", () => {
      const code = javaClass(
        "        int[] nums = {1, 2};\n" +
        "        int result = 0;\n" +
        "        // YOUR CODE HERE\n" +
        "        System.out.println(result);"
      );
      const data = extractDataBlock(code, "Java");
      assert.strictEqual(data.length, 1);
      assert.ok(data[0].includes("int[] nums"));
      assert.ok(!data.some(d => d.includes("result")));
    });

    test("skips String result initializer", () => {
      const code = javaClass(
        '        String[] names = {"a", "b"};\n' +
        '        String result = "";\n' +
        "        // YOUR CODE HERE"
      );
      const data = extractDataBlock(code, "Java");
      assert.strictEqual(data.length, 1);
      assert.ok(!data.some(d => d.includes("result")));
    });

    test("skips double result initializer", () => {
      const code = javaClass(
        "        double[] vals = {1.5, 2.5};\n" +
        "        double result = 0.0;\n" +
        "        // YOUR CODE HERE"
      );
      const data = extractDataBlock(code, "Java");
      assert.strictEqual(data.length, 1);
    });

    test("skips boolean result initializer", () => {
      const code = javaClass(
        "        int[] nums = {1};\n" +
        "        boolean result = false;\n" +
        "        // YOUR CODE HERE"
      );
      const data = extractDataBlock(code, "Java");
      assert.strictEqual(data.length, 1);
    });

    test("skips System.out.println lines", () => {
      const code = javaClass(
        "        int x = 5;\n" +
        "        System.out.println(x);\n" +
        "        // YOUR CODE HERE"
      );
      const data = extractDataBlock(code, "Java");
      assert.strictEqual(data.length, 1);
      assert.ok(data[0].includes("int x"));
    });

    test("skips empty lines and comments", () => {
      const code = javaClass(
        "        // This is a comment\n" +
        "        \n" +
        "        int[] nums = {1};\n" +
        "        // YOUR CODE HERE"
      );
      const data = extractDataBlock(code, "Java");
      assert.strictEqual(data.length, 1);
      assert.ok(data[0].includes("int[] nums"));
    });

    test("handles multiple data lines", () => {
      const code = javaClass(
        "        int[] a = {1, 2};\n" +
        "        int[] b = {3, 4};\n" +
        "        String label = \"test\";\n" +
        "        // YOUR CODE HERE"
      );
      const data = extractDataBlock(code, "Java");
      assert.strictEqual(data.length, 3);
    });

    test("TypeScript: extracts data before YOUR CODE HERE", () => {
      const code = "const nums: number[] = [1, 2, 3];\nlet result = 0;\n// YOUR CODE HERE\nconsole.log(result);";
      const data = extractDataBlock(code, "TypeScript");
      assert.strictEqual(data.length, 1);
      assert.ok(data[0].includes("const nums"));
    });

    test("TypeScript: skips let result initializer", () => {
      const code = "const nums = [1, 2];\nlet result = 0;\n// YOUR CODE HERE";
      const data = extractDataBlock(code, "TypeScript");
      assert.ok(!data.some(d => d.includes("result")));
    });

    test("empty code returns empty data", () => {
      const data = extractDataBlock("", "Java");
      assert.strictEqual(data.length, 0);
    });
  });

  suite("extractPrintStatement", () => {
    test("finds Java System.out.println", () => {
      const code = javaClass("        int x = 5;\n        System.out.println(x);");
      const ps = extractPrintStatement(code, "Java");
      assert.ok(ps);
      assert.ok(ps!.includes("System.out.println(x)"));
    });

    test("returns null for System.out.print (no ln)", () => {
      const code = javaClass("        System.out.print(42);");
      const ps = extractPrintStatement(code, "Java");
      assert.strictEqual(ps, null);
    });

    test("finds TypeScript console.log", () => {
      const code = "const x = 5;\nconsole.log(x);";
      const ps = extractPrintStatement(code, "TypeScript");
      assert.ok(ps);
      assert.ok(ps!.includes("console.log(x)"));
    });

    test("finds last print statement (multiple prints)", () => {
      const code = javaClass(
        "        System.out.println(\"debug\");\n" +
        "        System.out.println(result);"
      );
      const ps = extractPrintStatement(code, "Java");
      assert.ok(ps);
      assert.ok(ps!.includes("result"));
    });

    test("returns null when no print found", () => {
      const code = javaClass("        int x = 5;");
      const ps = extractPrintStatement(code, "Java");
      assert.strictEqual(ps, null);
    });

    test("handles complex print expression", () => {
      const code = javaClass('        System.out.println("Result: " + (a + b));');
      const ps = extractPrintStatement(code, "Java");
      assert.ok(ps);
      assert.ok(ps!.includes("Result"));
    });
  });

  suite("extractStudentLogic", () => {
    test("extracts logic between data and print", () => {
      const starter = javaClass(
        "        int[] nums = {1, 2, 3};\n" +
        "        int result = 0;\n" +
        "        // YOUR CODE HERE\n" +
        "        System.out.println(result);"
      );
      const student = javaClass(
        "        int[] nums = {1, 2, 3};\n" +
        "        int result = 0;\n" +
        "        for (int n : nums) result += n;\n" +
        "        System.out.println(result);"
      );
      const logic = extractStudentLogic(student, starter, "Java");
      assert.ok(logic.includes("int result = 0"));
      assert.ok(logic.includes("for (int n : nums) result += n"));
      assert.ok(!logic.includes("int[] nums"));
      assert.ok(!logic.includes("System.out.println"));
    });

    test("preserves result initializer in logic", () => {
      const starter = javaClass(
        "        int[] nums = {1};\n" +
        "        int result = 0;\n" +
        "        // YOUR CODE HERE\n" +
        "        System.out.println(result);"
      );
      const student = javaClass(
        "        int[] nums = {1};\n" +
        "        int result = 0;\n" +
        "        result = nums[0] * 2;\n" +
        "        System.out.println(result);"
      );
      const logic = extractStudentLogic(student, starter, "Java");
      assert.ok(logic.includes("int result = 0"));
      assert.ok(logic.includes("result = nums[0] * 2"));
    });

    test("empty when student hasn't written code", () => {
      const starter = javaClass(
        "        int[] nums = {1};\n" +
        "        // YOUR CODE HERE\n" +
        "        System.out.println(0);"
      );
      const student = javaClass(
        "        int[] nums = {1};\n" +
        "        // YOUR CODE HERE\n" +
        "        System.out.println(0);"
      );
      const logic = extractStudentLogic(student, starter, "Java");
      assert.strictEqual(logic.trim(), "");
    });

    test("TypeScript student logic extraction", () => {
      const starter = "const nums = [1, 2, 3];\nlet result = 0;\n// YOUR CODE HERE\nconsole.log(result);";
      const student = "const nums = [1, 2, 3];\nlet result = 0;\nfor (const n of nums) result += n;\nconsole.log(result);";
      const logic = extractStudentLogic(student, starter, "TypeScript");
      assert.ok(logic.includes("let result = 0"));
      assert.ok(logic.includes("for (const n of nums)"));
    });
  });

  suite("buildMultiTestCode", () => {
    test("returns null for empty test cases", () => {
      assert.strictEqual(buildMultiTestCode("code", "starter", [], "Java"), null);
    });

    test("builds Java multi-test with test cases", () => {
      const student = javaClass(
        "        int[] nums = {1, 2, 3};\n" +
        "        int result = 0;\n" +
        "        for (int n : nums) result += n;\n" +
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
        { input: "int[] nums = {0, 0, 0}", output: "0" }
      ];
      const result = buildMultiTestCode(student, starter, testCases, "Java");
      assert.ok(result);
      assert.ok(result!.includes("PracticeTC"));
      assert.ok(result!.includes("TC1:"));
      assert.ok(result!.includes("TC2:"));
      assert.ok(result!.includes("int[] nums = {10, 20}"));
      assert.ok(result!.includes("int[] nums = {0, 0, 0}"));
    });

    test("returns null when no logic extracted", () => {
      const starter = javaClass("        // YOUR CODE HERE\n        System.out.println(0);");
      const student = javaClass("        // YOUR CODE HERE\n        System.out.println(0);");
      const testCases = [{ input: "int x = 1", output: "1" }];
      const result = buildMultiTestCode(student, starter, testCases, "Java");
      assert.strictEqual(result, null);
    });

    test("returns null when no print statement found", () => {
      const student = javaClass("        int x = 5;");
      const starter = javaClass("        int x = 5;");
      const testCases = [{ input: "int x = 1", output: "1" }];
      const result = buildMultiTestCode(student, starter, testCases, "Java");
      assert.strictEqual(result, null);
    });
  });

});
