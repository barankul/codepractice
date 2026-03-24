import * as assert from "assert";
import {
  buildOfflineUiMatrix,
  collectOfflineTopicCoverage,
  findEnglishLocalizationMutations,
  findOfflineTopicCoverageGaps,
} from "../offlineSmokeAudit.js";
import { getAllOfflinePractices } from "../offlinePracticeAudit.js";

suite("offlineSmokeAudit", () => {
  test("every registered offline topic has at least one practice", () => {
    const gaps = findOfflineTopicCoverageGaps();
    assert.strictEqual(
      gaps.length,
      0,
      gaps.map((gap) => `- ${gap.lang}/${gap.topic}: ${gap.detail}`).join("\n"),
    );
  });

  test("english localization is identity for source offline content", () => {
    const issues = findEnglishLocalizationMutations();
    assert.strictEqual(
      issues.length,
      0,
      issues.map((issue) => `- ${issue.lang}/${issue.topic}/${issue.title}: ${issue.detail}`).join("\n"),
    );
  });

  test("smoke matrix covers every practice in both English and Japanese", () => {
    const totalPractices = getAllOfflinePractices().length;
    const matrix = buildOfflineUiMatrix(["en", "ja"]);
    const coverage = collectOfflineTopicCoverage();

    assert.strictEqual(matrix.length, totalPractices * 2);
    assert.strictEqual(coverage.length > 0, true);
    assert.ok(matrix.some((row) => row.uiLang === "en"));
    assert.ok(matrix.some((row) => row.uiLang === "ja"));
  });
});
