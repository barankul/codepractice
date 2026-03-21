// コード実行 — code execution helpers
import * as vscode from "vscode";
import { PRACTICE_DIR } from "./constants";

/** SQL実行 — run SQL practice file */
export async function runSQL(): Promise<string> {
  const { runQuery } = require("./sqlRunner");

  let sql = "";
  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document.fileName.endsWith(".sql")) {
    if (editor.document.isDirty) { await editor.document.save(); }
    sql = editor.document.getText();
  } else {
    const ws = vscode.workspace.workspaceFolders?.[0];
    if (!ws) { return "No workspace open"; }
    const fileUri = vscode.Uri.joinPath(ws.uri, PRACTICE_DIR, "Practice.sql");
    try {
      const openDoc = vscode.workspace.textDocuments.find(d => d.uri.toString() === fileUri.toString());
      if (openDoc?.isDirty) { await openDoc.save(); }
      const bytes = await vscode.workspace.fs.readFile(fileUri);
      sql = Buffer.from(bytes).toString("utf8");
    } catch {
      return "SQL file not found. Generate a SQL practice first.";
    }
  }

  if (!sql.trim()) { return "SQL file is empty"; }

  const sqlUpper = sql.toUpperCase().replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const destructive = /\b(DROP|TRUNCATE|ALTER)\b/.exec(sqlUpper);
  if (destructive) {
    return `Blocked: ${destructive[1]} statements are not allowed in practice mode.`;
  }

  const result = await runQuery(sql);

  if (result.error) {
    return `SQL Error: ${result.error}`;
  }

  if (result.columns.length === 0) {
    return "(empty result set)";
  }

  if (result.values.length === 0) {
    return result.columns.join(" | ") + "\n" + "-".repeat(40) + "\n(0 rows)";
  }

  let output = result.columns.join(" | ") + "\n";
  output += "-".repeat(40) + "\n";
  for (const row of result.values) {
    output += row.join(" | ") + "\n";
  }
  return output;
}
