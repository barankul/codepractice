/** JUnit JAR配置 — ensure JUnit JAR in .codepractice dir */
import * as path from "path";
import * as fsp from "fs/promises";
import { exists } from "./testEngine";

export const JUNIT_JAR = "junit-platform-console-standalone.jar";

export async function ensureJUnitJar(
  codepracticeDir: string,
  extensionPath: string
): Promise<void> {
  const dst = path.join(codepracticeDir, JUNIT_JAR);
  if (await exists(dst)) {
    try {
      const stat = await fsp.stat(dst);
      if (stat.size > 1_000_000) { return; }
    } catch { /* fall through to re-copy */ }
  }

  const src = path.join(extensionPath, "resources", JUNIT_JAR);
  await fsp.mkdir(codepracticeDir, { recursive: true });
  await fsp.copyFile(src, dst);
}
