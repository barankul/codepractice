// 拡張エントリ — extension entry point
import * as vscode from "vscode";
import { CodePracticeAppView } from "./appView";
import { explainSelectedCode } from "./aiGenerators";
import { initDatabase, runQuery, getSchema } from "./sqlRunner";
import { initSecrets, disposeAiConfigListener } from "./aiHelpers";
import { openTestPanel } from "./testPanel";
import { runSmokeTest } from "./smokeTest";
import { GhostTextProvider } from "./ghostTextProvider";

/** 有効化 — activate extension */
export async function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel("CodePractice");

  initSecrets(context.secrets);

  // SQLite初期化 — init SQLite
  initDatabase(context);

  // ゴーストテキスト — ghost text provider
  const ghostProvider = new GhostTextProvider();
  context.subscriptions.push(
    vscode.languages.registerInlineCompletionItemProvider(
      [{ language: "java" }, { language: "typescript" }],
      ghostProvider
    )
  );
  context.subscriptions.push(ghostProvider);

  // メインビュー — main webview
  const appView = new CodePracticeAppView(context, output, ghostProvider);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(CodePracticeAppView.viewType, appView)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codepractice.openApp", async () => {
      await vscode.commands.executeCommand("workbench.view.extension.codepractice");
    })
  );

  // SQL実行 — run SQL
  context.subscriptions.push(
    vscode.commands.registerCommand("codepractice.runSQL", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor");
        return;
      }

      const sql = editor.document.getText();
      if (!sql.trim()) {
        vscode.window.showErrorMessage("No SQL to run");
        return;
      }

      const result = await runQuery(sql);

      if (result.error) {
        vscode.window.showErrorMessage("SQL Error: " + result.error);
        output.appendLine("SQL Error: " + result.error);
        return;
      }

      output.show(true);
      output.appendLine("\n--- SQL Result ---");
      output.appendLine("Columns: " + result.columns.join(" | "));
      output.appendLine("-".repeat(50));
      for (const row of result.values) {
        output.appendLine(row.join(" | "));
      }
      output.appendLine("-".repeat(50));
      output.appendLine(`${result.values.length} row(s)\n`);

      vscode.window.showInformationMessage(`Query returned ${result.values.length} row(s)`);
    })
  );

  // スキーマ表示 — show schema
  context.subscriptions.push(
    vscode.commands.registerCommand("codepractice.showSchema", () => {
      output.show(true);
      output.appendLine(getSchema());
    })
  );

  // コード説明 — explain code
  context.subscriptions.push(
    vscode.commands.registerCommand("codepractice.explainCode", async () => {
      await explainSelectedCode();
    })
  );

  // テスト — tests
  context.subscriptions.push(
    vscode.commands.registerCommand("codepractice.runTests", () => {
      openTestPanel();
    })
  );

  // スモークテスト — smoke test
  context.subscriptions.push(
    vscode.commands.registerCommand("codepractice.smokeTest", () => runSmokeTest(context, output))
  );
}

/** 無効化 — deactivate extension */
export function deactivate() {
  disposeAiConfigListener();
}
