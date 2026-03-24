import * as assert from "assert";
import { canonicalCrossLangName, getAvailableCrossLangTargets } from "../constants.js";

suite("crossLanguageTargets", () => {
  test("canonicalCrossLangName normalizes known lowercase targets", () => {
    assert.strictEqual(canonicalCrossLangName("python"), "Python");
    assert.strictEqual(canonicalCrossLangName("java"), "Java");
    assert.strictEqual(canonicalCrossLangName("TypeScript"), "TypeScript");
  });

  test("getAvailableCrossLangTargets returns actual offline targets in UI order", () => {
    const targets = getAvailableCrossLangTargets({
      python: { code: "print('x')" },
      java: { code: "class Practice {}" },
    }, "TypeScript");

    assert.deepStrictEqual(targets, ["Java", "Python"]);
  });

  test("getAvailableCrossLangTargets excludes the current language", () => {
    const targets = getAvailableCrossLangTargets({
      python: { code: "print('x')" },
      java: { code: "class Practice {}" },
    }, "Java");

    assert.deepStrictEqual(targets, ["Python"]);
  });

  test("getAvailableCrossLangTargets returns empty when no targets exist", () => {
    assert.deepStrictEqual(getAvailableCrossLangTargets(undefined, "SQL"), []);
    assert.deepStrictEqual(getAvailableCrossLangTargets({}, "SQL"), []);
  });
});
