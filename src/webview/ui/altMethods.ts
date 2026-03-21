// Alternative methods wrap — create/remove dynamically
import { state } from "../state";
import { dom } from "../dom";
import { t } from "../i18n";

export function createAltMethodsWrap(): void {
  if (state.altMethodsWrap) return;
  state.altMethodsWrap = document.createElement("div");
  state.altMethodsWrap.className = "alt-methods-wrap";
  state.altMethodsWrap.id = "altMethodsWrap";
  const header = document.createElement("div");
  header.className = "item-head";
  header.innerHTML = '<span class="item-label">' + t("practice.altMethods") + "</span>";
  state.altMethodsWrap.appendChild(header);
  state.altMethodsList = document.createElement("div");
  state.altMethodsList.id = "altMethodsList";
  state.altMethodsWrap.appendChild(state.altMethodsList);
  if (dom.altMethodsAnchor) {
    dom.altMethodsAnchor.parentNode!.insertBefore(state.altMethodsWrap, dom.altMethodsAnchor);
  }
}

export function removeAltMethodsWrap(): void {
  if (state.altMethodsWrap) {
    state.altMethodsWrap.remove();
    state.altMethodsWrap = null;
    state.altMethodsList = null;
  }
  state.altMethodsLoaded = false;
}
