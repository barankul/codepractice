// Webview entry point — acquireVsCodeApi must be called first
import "./vscodeApi";
import { post } from "./vscodeApi";
import { initEventListeners } from "./handlers/eventListeners";
import { initMessageHandler } from "./handlers/messageHandler";

// Initialize all event listeners and message handler
initEventListeners();
initMessageHandler();

// Signal ready to extension
post({ type: "ready" });
