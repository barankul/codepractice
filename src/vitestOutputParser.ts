// Vitest出力解析 — parse vitest console output into test results

export interface VitestTestCase {
  name: string;
  pass: boolean;
  error?: string;
}

export interface VitestSummary {
  total: number;
  passed: number;
  failed: number;
  testCases: VitestTestCase[];
}

export function parseVitestOutput(stdout: string): VitestSummary {
  const testCases: VitestTestCase[] = [];
  const lines = stdout.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const passMatch = line.match(/^\s+[✓√]\s+(.+)$/);
    if (passMatch) {
      const name = passMatch[1].replace(/\s+\d+ms$/, "").trim();
      if (name.endsWith(")") && /\(\d+\)$/.test(name)) { continue; }
      testCases.push({ name, pass: true });
      continue;
    }

    const failMatch = line.match(/^\s+[×✗✘]\s+(.+)$/);
    if (failMatch) {
      const name = failMatch[1].replace(/\s+\d+ms$/, "").trim();
      if (name.endsWith(")") && /\(\d+\)$/.test(name)) { continue; }

      let error = "";
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (nextLine.startsWith("→") || nextLine.startsWith("⎯")) {
          error = nextLine.replace(/^[→⎯]\s*/, "");
          break;
        }
        if (nextLine.startsWith("expected") || nextLine.startsWith("Expected") || nextLine.startsWith("AssertionError")) {
          error = nextLine;
          break;
        }
        if (nextLine === "" || /^\s*[✓√×✗✘]/.test(nextLine)) { break; }
      }

      testCases.push({ name, pass: false, error: error || "Test failed" });
      continue;
    }

    const failSummaryMatch = line.match(/FAIL\s+\S+\s+>\s+(.+)$/);
    if (failSummaryMatch && !testCases.some(t => t.name === failSummaryMatch[1].trim())) {
      testCases.push({ name: failSummaryMatch[1].trim(), pass: false, error: "Test failed" });
    }
  }

  const failed = testCases.filter(t => !t.pass).length;

  return {
    total: testCases.length,
    passed: testCases.length - failed,
    failed,
    testCases
  };
}

/** 結果変換 — convert to judge format */
export function vitestToTestResults(
  summary: VitestSummary
): { name: string; pass: boolean; expected: string; got: string }[] {
  return summary.testCases.map(tc => ({
    name: `Vitest: ${tc.name}`,
    pass: tc.pass,
    expected: "Pass",
    got: tc.pass ? "Pass" : (tc.error?.slice(0, 120) || "Failed")
  }));
}
