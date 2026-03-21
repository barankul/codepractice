/** Vitest環境構築 — ensure vitest is installed in .codepractice dir */
import * as vscode from "vscode";
import * as path from "path";
import { exists, spawnWithLimits } from "./testEngine";

const PACKAGE_JSON = JSON.stringify({
  name: "codepractice-workspace",
  private: true,
  type: "module",
  devDependencies: {
    vitest: "^3.0.0"
  }
}, null, 2);

export async function ensureVitestScaffold(
  codepracticeDir: vscode.Uri
): Promise<void> {
  const target = codepracticeDir.fsPath;

  const pkgPath = path.join(target, "package.json");
  if (!(await exists(pkgPath))) {
    await vscode.workspace.fs.writeFile(
      vscode.Uri.joinPath(codepracticeDir, "package.json"),
      Buffer.from(PACKAGE_JSON, "utf8")
    );
  }

  const vitestDir = path.join(target, "node_modules", "vitest");
  if (!(await exists(vitestDir))) {
    const result = await spawnWithLimits("npm", ["install"], {
      cwd: target,
      timeoutMs: 60_000,
      maxOutputBytes: 500_000,
      shell: process.platform === "win32",
    });

    if (result.exitCode !== 0) {
      throw new Error(`npm install failed: ${result.stderr.slice(0, 200)}`);
    }
  }
}
