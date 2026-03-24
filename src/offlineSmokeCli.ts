import * as fs from "fs";
import * as path from "path";
import {
  formatOfflineSmokeReport,
  hasOfflineSmokeFailures,
  runOfflineSmokeAudit,
} from "./offlineSmokeAudit";

async function main(): Promise<void> {
  const workspaceRoot = process.cwd();
  const tempRoot = path.join(workspaceRoot, ".codepractice", "offline-smoke");
  const report = await runOfflineSmokeAudit({
    workspaceRoot,
    distRoot: path.join(workspaceRoot, "dist"),
    tempRoot,
    uiLangs: ["en", "ja"],
  });

  const textReport = formatOfflineSmokeReport(report);
  await fs.promises.mkdir(tempRoot, { recursive: true });
  await fs.promises.writeFile(path.join(tempRoot, "report.txt"), textReport, "utf8");
  await fs.promises.writeFile(path.join(tempRoot, "report.json"), JSON.stringify(report, null, 2), "utf8");

  console.log(textReport);
  process.exitCode = hasOfflineSmokeFailures(report) ? 1 : 0;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
