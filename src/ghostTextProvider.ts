// ゴーストテキスト — inline completion for teaching mode
import * as vscode from "vscode";

function isCommentLine(line: string): boolean {
  const t = line.trim();
  return t.startsWith("//") || t.startsWith("/*") || t.startsWith("*/") || t.startsWith("*") || t.startsWith("#");
}

const GHOST_DECORATION = vscode.window.createTextEditorDecorationType({
  backgroundColor: "rgba(34, 197, 94, 0.08)",
  isWholeLine: true,
  overviewRulerColor: "rgba(34, 197, 94, 0.5)",
  overviewRulerLane: vscode.OverviewRulerLane.Left,
});

/** ゴーストテキスト — ghost text inline completion provider */
export class GhostTextProvider implements vscode.InlineCompletionItemProvider {
  private _active = false;
  private solutionLines: string[] = [];
  private starterLines: string[] = [];
  private acceptedLines = new Set<number>();
  private starterLineSet = new Set<number>();
  private disposables: vscode.Disposable[] = [];
  private targetUri?: vscode.Uri;

  public onStatusChange?: (active: boolean) => void;

  isActive(): boolean {
    return this._active;
  }

  activate(solutionCode: string, targetUri: vscode.Uri, starterCode?: string): void {
    this.deactivate();
    this.solutionLines = solutionCode.split("\n");
    this.starterLines = (starterCode || "").split("\n");
    this.targetUri = targetUri;
    this.acceptedLines.clear();

    this.starterLineSet.clear();
    for (let i = 0; i < this.solutionLines.length; i++) {
      if (i < this.starterLines.length) {
        const starterTrimmed = this.starterLines[i].trimEnd();
        const solutionTrimmed = this.solutionLines[i].trimEnd();
        if (starterTrimmed === solutionTrimmed) {
          this.starterLineSet.add(i);
        }
      }
    }

    this._active = true;

    const changeListener = vscode.workspace.onDidChangeTextDocument((e) => {
      if (!this._active || !this.targetUri) return;
      if (e.document.uri.toString() !== this.targetUri.toString()) return;
      this.updateDecorations(e.document);
    });
    this.disposables.push(changeListener);

    const editorListener = vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && this._active && this.targetUri &&
          editor.document.uri.toString() === this.targetUri.toString()) {
        this.updateDecorations(editor.document);
      }
    });
    this.disposables.push(editorListener);

    this.onStatusChange?.(true);
  }

  deactivate(): void {
    this._active = false;
    this.solutionLines = [];
    this.starterLines = [];
    this.acceptedLines.clear();
    this.starterLineSet.clear();
    this.targetUri = undefined;

    for (const editor of vscode.window.visibleTextEditors) {
      editor.setDecorations(GHOST_DECORATION, []);
    }

    for (const d of this.disposables) d.dispose();
    this.disposables = [];

    this.onStatusChange?.(false);
  }

  private updateDecorations(doc: vscode.TextDocument): void {
    const editor = vscode.window.visibleTextEditors.find(
      (e) => e.document.uri.toString() === doc.uri.toString()
    );
    if (!editor) return;

    const ranges: vscode.DecorationOptions[] = [];
    const docLineCount = doc.lineCount;

    for (let i = 0; i < Math.min(docLineCount, this.solutionLines.length); i++) {
      if (this.starterLineSet.has(i)) continue;

      const docLine = doc.lineAt(i).text;
      const solLine = this.solutionLines[i];

      if (!docLine.trim()) continue;
      if (isCommentLine(docLine)) continue;

      if (this.acceptedLines.has(i)) {
        ranges.push({ range: new vscode.Range(i, 0, i, docLine.length) });
      } else if (docLine.trimEnd() === solLine.trimEnd()) {
        this.acceptedLines.add(i);
        ranges.push({ range: new vscode.Range(i, 0, i, docLine.length) });
      }
    }

    editor.setDecorations(GHOST_DECORATION, ranges);
  }

  provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _context: vscode.InlineCompletionContext,
    _token: vscode.CancellationToken
  ): vscode.InlineCompletionItem[] | undefined {
    if (!this._active || !this.targetUri) return undefined;
    if (document.uri.toString() !== this.targetUri.toString()) return undefined;

    const line = position.line;
    if (line >= this.solutionLines.length) return undefined;

    if (this.starterLineSet.has(line)) return undefined;

    const currentText = document.lineAt(line).text;
    const solutionText = this.solutionLines[line];

    if (currentText.trimEnd() === solutionText.trimEnd()) return undefined;
    if (!solutionText.trim()) return undefined;
    if (isCommentLine(solutionText)) return undefined;

    let ghostText: string;
    if (currentText.length === 0) {
      ghostText = solutionText;
    } else if (solutionText.startsWith(currentText)) {
      ghostText = solutionText.slice(currentText.length);
    } else {
      ghostText = solutionText.slice(position.character);
      if (!ghostText.trim()) return undefined;
    }

    if (!ghostText) return undefined;

    const item = new vscode.InlineCompletionItem(
      ghostText,
      new vscode.Range(position, position)
    );

    return [item];
  }

  dispose(): void {
    this.deactivate();
  }
}
