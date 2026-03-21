// 出力チェッカーエッジケース — output checker edge case tests
import * as assert from "assert";
import { normalizeOutput, checkApiOutput } from "../outputChecker.js";

suite("normalizeOutput", () => {

  test("collapses whitespace around pipes", () => {
    assert.strictEqual(normalizeOutput("a | b | c"), "a|b|c");
  });

  test("removes separator lines (---)", () => {
    assert.strictEqual(normalizeOutput("hello\n-----\nworld"), "hello world");
  });

  test("removes separator lines (===)", () => {
    assert.strictEqual(normalizeOutput("hello\n=====\nworld"), "hello world");
  });

  test("removes trailing .0 from integers", () => {
    assert.strictEqual(normalizeOutput("42.0"), "42");
    assert.strictEqual(normalizeOutput("100.0"), "100");
  });

  test("keeps meaningful decimals", () => {
    assert.strictEqual(normalizeOutput("3.14"), "3.14");
  });

  test("fixes floating point noise (trailing zeros)", () => {
    assert.strictEqual(normalizeOutput("137.20000000000002"), "137.2");
  });

  test("fixes floating point noise (trailing nines)", () => {
    const result = normalizeOutput("2.9999999999");
    assert.ok(result === "3" || result === "3.0", `Got: ${result}`);
  });

  test("collapses multiple whitespace to single space", () => {
    assert.strictEqual(normalizeOutput("a   b\t\tc"), "a b c");
  });

  test("removes whitespace inside brackets", () => {
    assert.strictEqual(normalizeOutput("[ 12, 34 ]"), "[12,34]");
  });

  test("lowercases everything", () => {
    assert.strictEqual(normalizeOutput("Hello World"), "hello world");
  });

  test("trims leading/trailing whitespace", () => {
    assert.strictEqual(normalizeOutput("  hello  "), "hello");
  });

  test("handles empty string", () => {
    assert.strictEqual(normalizeOutput(""), "");
  });

  test("handles complex mixed normalization", () => {
    const input = "Name  |  Age\n-----\nAlice | 30.0\nBob   | 25";
    const result = normalizeOutput(input);
    assert.ok(result.includes("name|age"));
    assert.ok(result.includes("alice|30"));
    assert.ok(result.includes("bob|25"));
  });
});

suite("checkApiOutput", () => {

  test("PASS with valid API output containing expected fields", () => {
    const output = "Name: Alice\nAge: 30\nCity: New York";
    const r = checkApiOutput(output, ["Name", "Age", "City"]);
    assert.strictEqual(r.pass, true);
  });

  test("FAIL when expected field is missing", () => {
    const output = "Name: Alice\nAge: 30";
    const r = checkApiOutput(output, ["Name", "Age", "Email"]);
    assert.strictEqual(r.pass, false);
    const emailTest = r.testResults?.find(t => t.name === "Field: Email");
    assert.strictEqual(emailTest?.pass, false);
  });

  test("FAIL on empty output", () => {
    const r = checkApiOutput("", ["Name"]);
    assert.strictEqual(r.pass, false);
  });

  test("FAIL on error output", () => {
    const r = checkApiOutput("error: connection refused", ["Name"]);
    assert.strictEqual(r.pass, false);
  });

  test("FAIL on exception output", () => {
    const r = checkApiOutput("exception in thread main", ["Name"]);
    assert.strictEqual(r.pass, false);
  });

  test("case-insensitive field matching", () => {
    const output = "name: Alice\nage: 30";
    const r = checkApiOutput(output, ["Name", "Age"]);
    const nameTest = r.testResults?.find(t => t.name === "Field: Name");
    assert.strictEqual(nameTest?.pass, true);
  });

  test("FAIL when output has no data values (just labels)", () => {
    const output = "This is just a single line without any colon-separated data";
    const r = checkApiOutput(output, []);
    const dataTest = r.testResults?.find(t => t.name === "Data Values");
    assert.strictEqual(dataTest?.pass, false);
  });

  // >200 char output with error keyword is not treated as error
  test("PASS with long error-like output (>200 chars is not treated as error)", () => {
    const longOutput = "error: " + "x".repeat(300) + "\nName: Alice";
    const r = checkApiOutput(longOutput, ["Name"]);
    const apiTest = r.testResults?.find(t => t.name === "API Response");
    assert.strictEqual(apiTest?.pass, true);
  });

  test("empty fields array still checks API response and data", () => {
    const output = "Status: OK\nResult: 42";
    const r = checkApiOutput(output, []);
    assert.strictEqual(r.pass, true);
  });
});
