// ゴールデンフィクスチャテスト — golden fixture regression tests
import * as assert from "assert";
import { loadFixtures, GoldenFixture } from "./fixtures/index.js";
import { checkOutput, normalizeOutput, checkApiOutput, numericMatch, jsonDeepEqual } from "../outputChecker.js";
import { parseMeta } from "../parsers.js";
import { buildMultiTestCode } from "../multiTestRunner.js";
import { PracticeData } from "../constants.js";

const mockOutput = { appendLine: () => {} } as any;

suite("Golden Fixtures", () => {
  let fixtures: GoldenFixture[];

  suiteSetup(() => {
    fixtures = loadFixtures();
    assert.ok(fixtures.length >= 15, `Expected at least 15 fixtures, got ${fixtures.length}`);
  });

  suite("parseMeta", () => {
    test("extracts title and task from all fixtures", () => {
      for (const f of fixtures) {
        if (!f.meta) { continue; }
        const parsed = parseMeta(f.meta);
        assert.ok(parsed.title.length > 0, `${f.id}: title should not be empty`);
        assert.ok(parsed.task.length > 0, `${f.id}: task should not be empty`);
      }
    });

    test("extracts expectedOutput when present in meta", () => {
      for (const f of fixtures) {
        if (!f.meta || !f.practice.expectedOutput) { continue; }
        if (f.practice.mode === "api") { continue; }
        const parsed = parseMeta(f.meta);
        if (parsed.expectedOutput) {
          const normParsed = normalizeOutput(parsed.expectedOutput, f.practice.lang);
          const normExpected = normalizeOutput(f.practice.expectedOutput, f.practice.lang);
          assert.ok(
            normParsed.includes(normExpected) || normExpected.includes(normParsed) || numericMatch(normParsed, normExpected),
            `${f.id}: parsed expectedOutput "${normParsed}" should match practice "${normExpected}"`
          );
        }
      }
    });

    test("extracts hint when present", () => {
      for (const f of fixtures) {
        if (!f.meta) { continue; }
        const parsed = parseMeta(f.meta);
        if (f.meta.includes("HINT:")) {
          assert.ok(parsed.hint.length > 0, `${f.id}: hint should be extracted`);
        }
      }
    });

    test("extracts bugExplanation for bugfix fixtures", () => {
      for (const f of fixtures) {
        if (f.practice.mode !== "bugfix" || !f.meta) { continue; }
        const parsed = parseMeta(f.meta);
        assert.ok(
          parsed.bugExplanation && parsed.bugExplanation.length > 0,
          `${f.id}: bugfix should have bugExplanation`
        );
      }
    });
  });

  suite("checkOutput — solution", () => {
    test("solution code always passes for non-api fixtures", () => {
      for (const f of fixtures) {
        if (f.practice.mode === "api") { continue; }
        if (!f.practice.expectedOutput) { continue; }
        const result = checkOutput(
          f.solutionOutput,
          f.practice,
          mockOutput,
          f.solutionCode
        );
        assert.strictEqual(result.pass, true, `${f.id}: solution should pass but got ${JSON.stringify(result.testResults)}`);
      }
    });
  });

  suite("checkOutput — variants", () => {
    test("each variant matches its expectPass value", () => {
      for (const f of fixtures) {
        if (f.practice.mode === "api") { continue; }
        if (!f.practice.expectedOutput) { continue; }
        for (const v of f.variants) {
          const result = checkOutput(
            v.output,
            f.practice,
            mockOutput,
            v.code
          );
          assert.strictEqual(
            result.pass, v.expectPass,
            `${f.id}/${v.label}: expected ${v.expectPass ? "PASS" : "FAIL"} but got ${result.pass ? "PASS" : "FAIL"}` +
            (result.testResults ? ` — ${JSON.stringify(result.testResults.filter(t => !t.pass).map(t => t.name))}` : "")
          );
        }
      }
    });
  });

  suite("checkApiOutput — api fixtures", () => {
    test("correct api output passes field checks", () => {
      for (const f of fixtures) {
        if (f.practice.mode !== "api" || !f.practice.expectedFields) { continue; }
        for (const v of f.variants) {
          const result = checkApiOutput(v.output, f.practice.expectedFields);
          assert.strictEqual(
            result.pass, v.expectPass,
            `${f.id}/${v.label}: api check expected ${v.expectPass} got ${result.pass}`
          );
        }
      }
    });
  });

  suite("normalizeOutput consistency", () => {
    test("solution output normalizes consistently with expected", () => {
      for (const f of fixtures) {
        if (!f.practice.expectedOutput || f.practice.mode === "api") { continue; }
        const lang = f.practice.lang;
        const normSolution = normalizeOutput(f.solutionOutput, lang);
        const normExpected = normalizeOutput(f.practice.expectedOutput, lang);
        const match = normSolution.includes(normExpected) ||
          normExpected.includes(normSolution) ||
          numericMatch(f.solutionOutput.trim(), f.practice.expectedOutput.trim()) ||
          jsonDeepEqual(f.solutionOutput.trim(), f.practice.expectedOutput.trim());
        assert.ok(match, `${f.id}: normalizeOutput mismatch — solution="${normSolution}" expected="${normExpected}"`);
      }
    });
  });

  suite("buildMultiTestCode", () => {
    test("generates non-null code for fixtures with testCases", () => {
      for (const f of fixtures) {
        if (!f.practice.testCases || f.practice.testCases.length === 0) { continue; }
        if (f.practice.lang === "SQL") { continue; }
        const result = buildMultiTestCode(
          f.solutionCode,
          f.practice.code,
          f.practice.testCases,
          f.practice.lang
        );
        assert.ok(result !== null, `${f.id}: buildMultiTestCode should produce code`);
      }
    });

    test("generated code has balanced braces", () => {
      for (const f of fixtures) {
        if (!f.practice.testCases || f.practice.testCases.length === 0) { continue; }
        if (f.practice.lang === "SQL") { continue; }
        const code = buildMultiTestCode(
          f.solutionCode,
          f.practice.code,
          f.practice.testCases,
          f.practice.lang
        );
        if (!code) { continue; }
        const opens = (code.match(/\{/g) || []).length;
        const closes = (code.match(/\}/g) || []).length;
        assert.strictEqual(opens, closes, `${f.id}: brace mismatch — { = ${opens}, } = ${closes}`);
      }
    });

    test("generated code contains TC markers", () => {
      for (const f of fixtures) {
        if (!f.practice.testCases || f.practice.testCases.length === 0) { continue; }
        if (f.practice.lang === "SQL") { continue; }
        const code = buildMultiTestCode(
          f.solutionCode,
          f.practice.code,
          f.practice.testCases,
          f.practice.lang
        );
        if (!code) { continue; }
        for (let i = 0; i < f.practice.testCases.length; i++) {
          assert.ok(code.includes(`TC${i + 1}:`), `${f.id}: should contain TC${i + 1}: marker`);
        }
      }
    });
  });
});
