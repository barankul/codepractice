// VS Code API singleton — must be the first import in the webview entry point
import type { WebviewToExtMsg } from "../shared/protocol";

declare function acquireVsCodeApi(): { postMessage(msg: unknown): void; getState(): unknown; setState(s: unknown): void };

const _vscode = acquireVsCodeApi();

/** Type-safe post message to extension */
export function post(msg: WebviewToExtMsg): void {
  _vscode.postMessage(msg);
}
