// コード検証テスト — code validation tests
import * as assert from "assert";
import { isValidCodeBlock, normalizeJavaPractice, unescapeCodeLiterals } from "../parsers.js";

suite("isValidCodeBlock", () => {

  suite("Java", () => {
    test("accepts standard Java class", () => {
      const code = "public class Practice {\n  public static void main(String[] args) {\n    System.out.println(42);\n  }\n}";
      assert.strictEqual(isValidCodeBlock(code, "Java"), true);
    });

    test("accepts Java with loops and conditionals", () => {
      const code = "int sum = 0;\nfor (int i = 0; i < 10; i++) {\n  if (i % 2 == 0) sum += i;\n}\nSystem.out.println(sum);";
      assert.strictEqual(isValidCodeBlock(code, "Java"), true);
    });

    test("rejects plain English text", () => {
      const code = "Write a function that calculates the sum\nof all elements in the array\nand returns the result";
      assert.strictEqual(isValidCodeBlock(code, "Java"), false);
    });

    test("rejects empty string", () => {
      assert.strictEqual(isValidCodeBlock("", "Java"), false);
    });

    test("rejects null/undefined", () => {
      assert.strictEqual(isValidCodeBlock(null as any, "Java"), false);
      assert.strictEqual(isValidCodeBlock(undefined as any, "Java"), false);
    });

    test("rejects whitespace only", () => {
      assert.strictEqual(isValidCodeBlock("   \n  \n  ", "Java"), false);
    });

    test("rejects template placeholder text", () => {
      const code = "Step 1: Declare an integer variable\nStep 2: Use a loop to iterate\nStep 3: Print the result";
      assert.strictEqual(isValidCodeBlock(code, "Java"), false);
    });

    test("accepts code with comments", () => {
      const code = "// Calculate sum\nint sum = 0;\nfor (int n : nums) {\n  sum += n;\n}\nSystem.out.println(sum);";
      assert.strictEqual(isValidCodeBlock(code, "Java"), true);
    });

    test("accepts minimal Java statement", () => {
      const code = "int x = 5;";
      assert.strictEqual(isValidCodeBlock(code, "Java"), true);
    });

    test("rejects prose that contains a keyword by accident", () => {
      const code = "This exercise is for learning about arrays\nYou need to declare variables properly\nThen calculate the result carefully\nFinally display the output nicely";
      assert.strictEqual(isValidCodeBlock(code, "Java"), false);
    });
  });

  suite("TypeScript", () => {
    test("accepts standard TS code", () => {
      const code = "const nums: number[] = [1, 2, 3];\nconst sum = nums.reduce((a, b) => a + b, 0);\nconsole.log(sum);";
      assert.strictEqual(isValidCodeBlock(code, "TypeScript"), true);
    });

    test("accepts TS with function declaration", () => {
      const code = "function add(a: number, b: number): number {\n  return a + b;\n}";
      assert.strictEqual(isValidCodeBlock(code, "TypeScript"), true);
    });

    test("rejects plain text for TS", () => {
      const code = "Create a variable to store the total\nLoop through each element\nAdd them together";
      assert.strictEqual(isValidCodeBlock(code, "TypeScript"), false);
    });

    test("accepts TS with let and arrow function", () => {
      const code = "let result = 0;\nconst add = (a: number) => result += a;";
      assert.strictEqual(isValidCodeBlock(code, "TypeScript"), true);
    });

    test("accepts TS with import", () => {
      const code = "import { readFile } from 'fs';\nconst data = readFile('test.txt');";
      assert.strictEqual(isValidCodeBlock(code, "TypeScript"), true);
    });
  });

  suite("SQL", () => {
    test("accepts SELECT statement", () => {
      const code = "SELECT name, age FROM students WHERE age > 18;";
      assert.strictEqual(isValidCodeBlock(code, "SQL"), true);
    });

    test("accepts INSERT statement", () => {
      const code = "INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');";
      assert.strictEqual(isValidCodeBlock(code, "SQL"), true);
    });

    test("accepts complex JOIN query", () => {
      const code = "SELECT s.name, c.title\nFROM students s\nJOIN courses c ON s.course_id = c.id\nWHERE s.grade > 80\nORDER BY s.name;";
      assert.strictEqual(isValidCodeBlock(code, "SQL"), true);
    });

    test("rejects plain text for SQL", () => {
      const code = "Write a query to find all students\nwho scored above average";
      assert.strictEqual(isValidCodeBlock(code, "SQL"), false);
    });
  });
});

suite("removeUnreachableReturns", () => {

  test("removes unreachable return false after if/else with returns", () => {
    const code = [
      "public class Practice {",
      "    static boolean check(int x) {",
      "        if (x > 0) {",
      "            return true;",
      "        } else {",
      "            return false;",
      "        }",
      "        return false;",
      "    }",
      "}"
    ].join("\n");
    const result = normalizeJavaPractice(code);
    const returns = (result.match(/\breturn\b/g) || []).length;
    assert.strictEqual(returns, 2, `Expected 2 returns but got ${returns}:\n${result}`);
  });

  test("removes unreachable return -1 after if/else", () => {
    const code = [
      "public class Practice {",
      "    static int find(int[] arr, int target) {",
      "        if (arr[0] == target) {",
      "            return 0;",
      "        } else {",
      "            return -1;",
      "        }",
      "        return -1;",
      "    }",
      "}"
    ].join("\n");
    const result = normalizeJavaPractice(code);
    const returns = (result.match(/\breturn\b/g) || []).length;
    assert.strictEqual(returns, 2);
  });

  test("removes unreachable return 0 after if/else if/else", () => {
    const code = [
      "public class Practice {",
      "    static int compare(int a, int b) {",
      "        if (a > b) {",
      "            return 1;",
      "        } else if (a < b) {",
      "            return -1;",
      "        } else {",
      "            return 0;",
      "        }",
      "        return 0;",
      "    }",
      "}"
    ].join("\n");
    const result = normalizeJavaPractice(code);
    const returns = (result.match(/\breturn\b/g) || []).length;
    assert.strictEqual(returns, 3);
  });

  // removal is aggressive: >=2 returns above trailing return triggers removal
  test("handles isPrime pattern (for loop with early returns)", () => {
    const code = [
      "public class Practice {",
      "    static boolean isPrime(int n) {",
      "        if (n <= 1) {",
      "            return false;",
      "        }",
      "        for (int i = 2; i * i <= n; i++) {",
      "            if (n % i == 0) {",
      "                return false;",
      "            }",
      "        }",
      "        return true;",
      "    }",
      "}"
    ].join("\n");
    const result = normalizeJavaPractice(code);
    const returns = (result.match(/\breturn\b/g) || []).length;
    assert.strictEqual(returns, 2);
  });

  // only 1 return above: trailing return is kept (needs >=2 to trigger removal)
  test("keeps necessary return when only one return above", () => {
    const code = [
      "public class Practice {",
      "    static int abs(int x) {",
      "        if (x < 0) {",
      "            return -x;",
      "        }",
      "        return x;",
      "    }",
      "}"
    ].join("\n");
    const result = normalizeJavaPractice(code);
    const returns = (result.match(/\breturn\b/g) || []).length;
    assert.strictEqual(returns, 2);
  });

  test("removes unreachable return null", () => {
    const code = [
      "public class Practice {",
      "    static String find(String[] arr) {",
      "        if (arr.length > 0) {",
      "            return arr[0];",
      "        } else {",
      "            return null;",
      "        }",
      "        return null;",
      "    }",
      "}"
    ].join("\n");
    const result = normalizeJavaPractice(code);
    const returns = (result.match(/\breturn\b/g) || []).length;
    assert.strictEqual(returns, 2);
  });

  test("removes unreachable return with empty string", () => {
    const code = [
      "public class Practice {",
      '    static String greet(boolean formal) {',
      "        if (formal) {",
      '            return "Hello";',
      "        } else {",
      '            return "Hi";',
      "        }",
      '        return "";',
      "    }",
      "}"
    ].join("\n");
    const result = normalizeJavaPractice(code);
    const returns = (result.match(/\breturn\b/g) || []).length;
    assert.strictEqual(returns, 2);
  });

  test("removes // placeholder comment before return", () => {
    const code = [
      "public class Practice {",
      "    static boolean check(int x) {",
      "        if (x > 0) {",
      "            return true;",
      "        } else {",
      "            return false;",
      "        }",
      "        // placeholder",
      "        return false;",
      "    }",
      "}"
    ].join("\n");
    const result = normalizeJavaPractice(code);
    assert.ok(!result.includes("placeholder"));
  });

  test("removes unreachable return 0.0", () => {
    const code = [
      "public class Practice {",
      "    static double calc(boolean flag) {",
      "        if (flag) {",
      "            return 1.5;",
      "        } else {",
      "            return 2.5;",
      "        }",
      "        return 0.0;",
      "    }",
      "}"
    ].join("\n");
    const result = normalizeJavaPractice(code);
    const returns = (result.match(/\breturn\b/g) || []).length;
    assert.strictEqual(returns, 2);
  });
});

suite("unescapeCodeLiterals", () => {
  test("converts \\n to newline", () => {
    assert.strictEqual(unescapeCodeLiterals("line1\\nline2"), "line1\nline2");
  });

  test("converts \\t to tab", () => {
    assert.strictEqual(unescapeCodeLiterals("col1\\tcol2"), "col1\tcol2");
  });

  test("removes \\r", () => {
    assert.strictEqual(unescapeCodeLiterals("line1\\r\\nline2"), "line1\nline2");
  });

  test('converts \\" to "', () => {
    assert.strictEqual(unescapeCodeLiterals('say \\"hello\\"'), 'say "hello"');
  });

  test("handles multiple escapes together", () => {
    assert.strictEqual(
      unescapeCodeLiterals('a\\nb\\tc\\r\\n\\"d\\"'),
      'a\nb\tc\n"d"'
    );
  });

  test("returns unchanged if no escapes", () => {
    const code = "int x = 5;\nSystem.out.println(x);";
    assert.strictEqual(unescapeCodeLiterals(code), code);
  });

  test("handles empty string", () => {
    assert.strictEqual(unescapeCodeLiterals(""), "");
  });
});
