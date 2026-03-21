// Code display helpers — escHtml, highlightCode, addCopyBtn, enhanceTask
import { t } from "../i18n";

export function escHtml(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function highlightCode(code: string): string {
  const tokens: { type: string; text: string }[] = [];
  let i = 0;
  while (i < code.length) {
    if (code[i] === "/" && code[i + 1] === "/") {
      let end = code.indexOf("\n", i);
      if (end === -1) end = code.length;
      tokens.push({ type: "comment", text: code.slice(i, end) });
      i = end;
    } else if (code[i] === "/" && code[i + 1] === "*") {
      let end2 = code.indexOf("*/", i + 2);
      if (end2 === -1) end2 = code.length; else end2 += 2;
      tokens.push({ type: "comment", text: code.slice(i, end2) });
      i = end2;
    } else if (code[i] === '"' || code[i] === "'") {
      const q = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== q) { if (code[j] === "\\") j++; j++; }
      tokens.push({ type: "string", text: code.slice(i, j + 1) });
      i = j + 1;
    } else {
      tokens.push({ type: "code", text: code[i] });
      i++;
    }
  }

  const KW = "public,private,protected,static,final,void,class,interface,extends,implements,import,package,return,if,else,for,while,do,switch,case,break,continue,new,try,catch,finally,throw,throws,this,super,int,double,float,long,short,byte,char,boolean,String,var,let,const,function,async,await,export,default,from,type,enum,abstract,instanceof,typeof,null,true,false,undefined,System,console";
  const kwSet: Record<string, number> = {};
  KW.split(",").forEach(k => { kwSet[k] = 1; });

  let out = "";
  for (let ti = 0; ti < tokens.length; ti++) {
    const tk = tokens[ti];
    const ht = escHtml(tk.text);
    if (tk.type === "comment") { out += '<span class="hl-comment">' + ht + "</span>"; }
    else if (tk.type === "string") { out += '<span class="hl-string">' + ht + "</span>"; }
    else { out += ht; }
  }
  out = out.replace(/([0-9]+\.?[0-9]*)/g, '<span class="hl-number">$1</span>');
  const kwArr = KW.split(",");
  for (let k = 0; k < kwArr.length; k++) {
    const w = kwArr[k];
    const re = new RegExp("(?<![a-zA-Z0-9_])" + w + "(?![a-zA-Z0-9_])", "g");
    out = out.replace(re, '<span class="hl-keyword">' + w + "</span>");
  }
  return out;
}

export function addCopyBtn(codeEl: HTMLElement | null): void {
  if (!codeEl || !codeEl.parentElement) return;
  const wrap = codeEl.parentElement;
  if (wrap.classList.contains("code-block-wrap")) return;
  wrap.style.position = "relative";
  wrap.classList.add("code-block-wrap");
  const btn = document.createElement("button");
  btn.className = "code-copy-btn";
  btn.textContent = t("practice.copy");
  btn.addEventListener("click", () => {
    const text = codeEl.textContent || "";
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = t("practice.copied");
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = t("practice.copy"); btn.classList.remove("copied"); }, 1500);
    }).catch(() => {
      btn.textContent = t("practice.copyFailed");
      setTimeout(() => { btn.textContent = t("practice.copy"); }, 1500);
    });
  });
  wrap.insertBefore(btn, codeEl);
}

export function enhanceTask(text: string): string {
  if (!text) return "\u2014";

  // Strip code blocks from task text
  const bt = String.fromCharCode(96);
  const codeBlockRe = new RegExp(bt + bt + bt + "[\\s\\S]*?" + bt + bt + bt, "g");
  let cleaned = text.replace(codeBlockRe, "").trim();
  cleaned = cleaned.replace(/^[ \t]{4,}.+$/gm, "").trim();
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  if (!cleaned) return "\u2014";

  let html = cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  const keywords: Record<string, [string, string]> = {
    "int": ["kw-type", "Integer - whole number type"],
    "String": ["kw-type", "String - text type"],
    "boolean": ["kw-type", "Boolean - true/false value"],
    "double": ["kw-type", "Double - decimal number"],
    "float": ["kw-type", "Float - decimal number"],
    "char": ["kw-type", "Char - single character"],
    "void": ["kw-type", "Void - returns nothing"],
    "ArrayList": ["kw-type", "ArrayList - dynamic array"],
    "HashMap": ["kw-type", "HashMap - key-value pairs"],
    "array": ["kw-type", "Array - collection of elements"],
    "for": ["keyword", "For loop - repeat"],
    "while": ["keyword", "While loop - repeat while true"],
    "if": ["keyword", "If - condition check"],
    "else": ["keyword", "Else - when condition is false"],
    "switch": ["keyword", "Switch - multi-value check"],
    "return": ["keyword", "Return - send value back"],
    "method": ["kw-method", "Method - reusable code block"],
    "function": ["kw-method", "Function - reusable code block"],
    "println": ["kw-method", "Print to console + new line"],
    "print": ["kw-method", "Print to console"],
    "length": ["kw-method", "Length of array or string"],
    "size": ["kw-method", "Element count in collection"],
    "add": ["kw-method", "Add element to collection"],
    "get": ["kw-method", "Get element at index"],
    "true": ["kw-value", "Boolean true value"],
    "false": ["kw-value", "Boolean false value"],
    "null": ["kw-value", "Null - empty reference"],
  };

  const placeholders: string[] = [];
  for (const [word, info] of Object.entries(keywords)) {
    const regex = new RegExp("\\b" + word + "\\b", "g");
    html = html.replace(regex, () => {
      const ph = "\x00PH" + placeholders.length + "\x00";
      placeholders.push('<span class="' + info[0] + '" data-tip="' + info[1] + '">' + word + "</span>");
      return ph;
    });
  }
  for (let i = 0; i < placeholders.length; i++) {
    html = html.split("\x00PH" + i + "\x00").join(placeholders[i]);
  }

  html = html.replace(/\n/g, "<br>");
  return html;
}
