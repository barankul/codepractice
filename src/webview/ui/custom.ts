// Custom practice panel — lang buttons + history
import { state } from "../state";
import { dom } from "../dom";
import { t } from "../i18n";
import { post } from "../vscodeApi";
import { langIcons } from "./langTopics";

export function renderCustomLangButtons(): void {
  if (!dom.customLangRow) return;
  dom.customLangRow.innerHTML = "";
  Object.keys(state.topics).forEach(lang => {
    const card = document.createElement("div");
    card.className = "lang-card" + (lang === state.customLang ? " active" : "");
    const svgIcon = langIcons[lang] || "";
    if (svgIcon) {
      const iconDiv = document.createElement("div");
      iconDiv.className = "lang-card-icon";
      iconDiv.innerHTML = svgIcon;
      card.appendChild(iconDiv);
    }
    const nameSpan = document.createElement("span");
    nameSpan.className = "lang-card-name";
    nameSpan.textContent = lang;
    card.appendChild(nameSpan);
    card.onclick = () => {
      state.customLang = lang;
      renderCustomLangButtons();
    };
    dom.customLangRow!.appendChild(card);
  });
}

export function renderCustomHistory(): void {
  if (!dom.customHistoryList) return;
  if (!state.customPractices || state.customPractices.length === 0) {
    dom.customHistoryList.innerHTML = '<div style="font-size:11px;color:var(--vscode-descriptionForeground);padding:8px 0;">' + t("custom.empty") + "</div>";
    return;
  }
  dom.customHistoryList.innerHTML = "";
  state.customPractices.slice().reverse().forEach(cp => {
    const div = document.createElement("div");
    div.className = "custom-history-item";
    const info = document.createElement("div");
    info.className = "custom-history-item-info";
    const title = document.createElement("div");
    title.className = "custom-history-item-title";
    title.textContent = cp.title;
    const meta = document.createElement("div");
    meta.className = "custom-history-item-meta";
    meta.textContent = cp.lang + " \u2022 " + (cp.prompt || "").slice(0, 50);
    info.appendChild(title);
    info.appendChild(meta);

    const del = document.createElement("button");
    del.className = "custom-history-item-delete";
    del.textContent = "\u00d7";
    del.title = "Delete";
    del.onclick = (e) => {
      e.stopPropagation();
      post({ type: "deleteCustomPractice", id: cp.id });
    };

    div.appendChild(info);
    div.appendChild(del);

    div.onclick = () => {
      if (dom.customPromptInput) dom.customPromptInput.value = cp.prompt || "";
      state.customLang = cp.lang || "Java";
      renderCustomLangButtons();
      state.currentLoadingAction = "generate";
      post({ type: "generateCustom", prompt: cp.prompt || "", lang: state.customLang });
    };

    dom.customHistoryList!.appendChild(div);
  });
}
