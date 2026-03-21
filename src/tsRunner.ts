// TypeScript実行 — TS code runner
import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

const IS_WIN = process.platform === "win32";

/** TS変換 — transpile TS to JS */
export function transpileToJs(tsFilePath: string): string {
  const tsCode = fs.readFileSync(tsFilePath, "utf8");
  const result = ts.transpileModule(tsCode, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      strict: false,
    },
  });
  const jsPath = tsFilePath.replace(/\.ts$/, ".js");
  fs.writeFileSync(jsPath, result.outputText, "utf8");
  return jsPath;
}

/** 実行コマンド — build TS run command */
export function buildTsRunCommand(
  workspaceRoot: string,
  tsFilename: string
): { command: string; cleanup?: string } {
  const tsxBin = path.join(workspaceRoot, "node_modules", ".bin", IS_WIN ? "tsx.cmd" : "tsx");
  if (fs.existsSync(tsxBin)) {
    return { command: `"${tsxBin}" ${tsFilename}` };
  }

  const tsFilePath = path.join(workspaceRoot, tsFilename);
  const jsPath = transpileToJs(tsFilePath);
  const jsFilename = path.basename(jsPath);
  return { command: `node ${jsFilename}`, cleanup: jsPath };
}
