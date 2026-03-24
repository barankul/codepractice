// i18n — translation helpers
import { state } from "./state";

export function t(key: string): string {
  const dict = state.allTranslations[state.currentUiLang] || state.allTranslations["en"] || {};
  return dict[key] || key;
}

export function applyTranslations(): void {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const val = t(key);
    if (val && val !== key) {
      // Preserve child SVG icons — only replace the text, not entire content
      const svg = el.querySelector("svg");
      if (svg) {
        Array.from(el.childNodes).forEach(n => { if (n.nodeType === 3) n.remove(); });
        svg.insertAdjacentText("afterend", val);
      } else {
        el.textContent = val;
      }
    }
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.getAttribute("data-i18n-html");
    if (!key) return;
    const val = t(key);
    if (val && val !== key) el.innerHTML = val;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (!key) return;
    const val = t(key);
    if (val && val !== key) (el as HTMLInputElement).placeholder = val;
  });
}
