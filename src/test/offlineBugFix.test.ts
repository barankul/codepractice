import * as assert from "assert";
import { createOfflineBugFixPractice } from "../offlineBugFix.js";

suite("offlineBugFix", () => {
  test("creates a Java offline bug-fix practice from a verified mutation", async () => {
    const practice = {
      lang: "Java",
      topic: "Array",
      level: 1,
      title: "Sum Array Elements",
      task: "Calculate the sum of all elements in the given integer array and print the result.",
      code: [
        "public class Practice {",
        "    public static void main(String[] args) {",
        "        int[] nums = {1, 2, 3, 4, 5};",
        "        int sum = 0;",
        "        // YOUR CODE HERE",
        "        System.out.println(sum);",
        "    }",
        "}",
      ].join("\n"),
      solutionCode: [
        "public class Practice {",
        "    public static void main(String[] args) {",
        "        int[] nums = {1, 2, 3, 4, 5};",
        "        int sum = 0;",
        "        for (int n : nums) {",
        "            sum += n;",
        "        }",
        "        System.out.println(sum);",
        "    }",
        "}",
      ].join("\n"),
      expectedOutput: "15",
      hint: "Use a loop to accumulate the total.",
      testCases: [{ input: "int[] nums = {1, 2, 3, 4, 5}", output: "15" }],
    };

    const bugFix = await createOfflineBugFixPractice(
      practice,
      async (code) => code.includes("sum -= n;") ? "5" : code.includes("sum += n;") ? "15" : null,
      "en"
    );

    assert.ok(bugFix);
    assert.strictEqual(bugFix!.mode, "bugfix");
    assert.ok(bugFix!.title.includes("Bug Fix"));
    assert.ok(bugFix!.task.includes("Find and fix the bug"));
    assert.ok(bugFix!.code.includes("sum -= n;"));
    assert.strictEqual(bugFix!.solutionCode, practice.solutionCode);
    assert.strictEqual(bugFix!.judgeFeedback.lines[0].line, 6);
  });

  test("creates an offline SQL bug-fix practice when an aggregate is changed", async () => {
    const practice = {
      lang: "SQL",
      topic: "GROUP BY",
      level: 2,
      title: "Total Revenue",
      task: "Calculate the total revenue and return it as a single value.",
      code: "SELECT SUM(amount) AS total_revenue FROM orders;",
      solutionCode: "SELECT SUM(amount) AS total_revenue FROM orders;",
      expectedOutput: "42",
      hint: "Use the correct aggregate function.",
      testCases: [{ input: "orders", output: "42" }],
    };

    const bugFix = await createOfflineBugFixPractice(
      practice,
      async (code) => code.includes("COUNT(") ? "3" : code.includes("SUM(") ? "42" : null,
      "en"
    );

    assert.ok(bugFix);
    assert.ok(bugFix!.code.includes("COUNT(amount)"));
    assert.ok(bugFix!.bugExplanation.includes("COUNT("));
  });
});
