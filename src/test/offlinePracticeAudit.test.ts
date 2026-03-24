import * as assert from "assert";
import {
  auditOfflinePracticeCatalogStructure,
  collectLocalizationCoverage,
  findLocalizationGaps,
  formatCatalogIssues,
  formatLocalizationGaps,
} from "../offlinePracticeAudit.js";

suite("offlinePracticeAudit", () => {
  test("offline practice catalog has no language/topic/content mismatches", () => {
    const issues = auditOfflinePracticeCatalogStructure();
    assert.strictEqual(issues.length, 0, formatCatalogIssues(issues));
  });

  test("Japanese offline practice prose and explanation fields are fully localized", () => {
    const gaps = findLocalizationGaps("ja", ["title", "task", "hint", "judge", "altMethods", "crossLang"]);
    assert.strictEqual(gaps.length, 0, formatLocalizationGaps(gaps));
  });

  test("audit report exposes localization coverage for prose and explanation fields", () => {
    const jaCoverage = collectLocalizationCoverage("ja");
    const trCoverage = collectLocalizationCoverage("tr");

    assert.strictEqual(jaCoverage.length, 3);
    assert.strictEqual(trCoverage.length, 3);

    for (const report of jaCoverage) {
      assert.strictEqual(
        report.localizedProsePractices,
        report.totalPractices,
        `Expected full Japanese prose coverage for ${report.lang}`
      );
      assert.strictEqual(
        report.localizedJudgeFields,
        report.totalJudgeFields,
        `Expected full Japanese judge coverage for ${report.lang}`
      );
      assert.strictEqual(
        report.localizedAltFields,
        report.totalAltFields,
        `Expected full Japanese alt-method coverage for ${report.lang}`
      );
      assert.strictEqual(
        report.localizedCrossFields,
        report.totalCrossFields,
        `Expected full Japanese cross-language coverage for ${report.lang}`
      );
    }

    const tsJa = jaCoverage.find((report) => report.lang === "TypeScript");
    const sqlTr = trCoverage.find((report) => report.lang === "SQL");

    assert.ok((tsJa?.totalAltFields || 0) > 0, "Expected TypeScript audit to include alt method explanation fields");
    assert.ok((tsJa?.totalJudgeFields || 0) > 0, "Expected TypeScript audit to include judge feedback fields");
    assert.ok((sqlTr?.totalPractices || 0) > 0, "Expected Turkish audit to include SQL practices");
  });
});
