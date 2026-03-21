<p align="center">
  <a href="README.ja.md">日本語</a> | English
</p>

<p align="center">
  <img src="media/icon.png" alt="CodePractice" width="128" height="128">
</p>

<h1 align="center">CodePractice</h1>

<p align="center">
  <strong>AI-powered coding practice generator for VS Code</strong><br>
  Generate exercises, run code, auto-judge, and track your progress — all inside your editor.
</p>

<p align="center">
  <a href="https://codespaces.new/barankul/codepractice?quickstart=1">
    <img src="https://github.com/codespaces/badge.svg" alt="Open in GitHub Codespaces" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/languages-Java%20%7C%20TypeScript%20%7C%20SQL-blue" alt="Languages" />
  <img src="https://img.shields.io/badge/offline_practices-140%2B-green" alt="140+ Offline Practices" />
  <img src="https://img.shields.io/badge/AI_providers-8-orange" alt="8 AI Providers" />
  <img src="https://img.shields.io/badge/license-MIT-brightgreen" alt="MIT License" />
</p>

---

## Why CodePractice?

Most coding practice platforms run in a browser. CodePractice brings the entire experience **inside VS Code** — where you already write code. No context switching, no browser tabs. Generate a problem, solve it in the editor, get instant feedback with auto-judging, and track your progress with spaced repetition.

**Key highlights:**
- Works **100% offline** with 140+ built-in exercises — no API key needed
- Supports **8 AI providers** (free tiers available) for unlimited unique exercises
- Built-in **code runners** — no external setup for Java, TypeScript, or SQL
- **Multi-test validation** with detailed pass/fail feedback per test case
- **FSRS spaced repetition** to schedule reviews at optimal intervals

---

## Features

### Practice Generation
| Feature | Description |
|---------|-------------|
| **3 Languages** | Java, TypeScript, SQL — each with built-in runner |
| **Adaptive Difficulty** | 5 levels, auto-adjusted based on your performance |
| **AI-Generated** | Unique problems every time via free AI providers |
| **140+ Offline** | Full exercise bank that works without internet |
| **Custom Practice** | Describe what you want to practice, AI generates it |
| **Bug Fix Mode** | Find and fix bugs in real open-source code from GitHub |

### Code Execution & Judging
| Feature | Description |
|---------|-------------|
| **Built-in Runners** | Run Java, TypeScript, SQL directly — no terminal needed |
| **Multi-Test Cases** | Each exercise validated against multiple inputs |
| **Auto Judge** | Output comparison with intelligent normalization |
| **Partial Pass Feedback** | See exactly which test cases failed and why |
| **SQL Schema View** | In-memory SQLite with visual schema browser |

### Learning Tools
| Feature | Description |
|---------|-------------|
| **AI Feedback** | Line-by-line code review on wrong solutions |
| **Progressive Hints** | Hints inserted as comments in your code |
| **Quick Solve** | AI solves and explains the approach |
| **Teach Me** | Step-by-step teaching with examples |
| **Ghost Text** | Inline code suggestions while you type |
| **Alternative Solutions** | 2-3 different approaches to the same problem |
| **Cross-Language** | See your solution in Python, JavaScript, C#, C++, Go, Rust, and more |

### Progress Tracking
| Feature | Description |
|---------|-------------|
| **XP System** | Earn XP for each completed exercise |
| **Level Progression** | Difficulty scales as you improve |
| **Topic Mastery** | Per-language, per-topic retention tracking |
| **Daily Goals** | Track daily practice targets |
| **Weekly Trends** | 7-day practice history with pass rates |
| **FSRS Scheduling** | Spaced repetition for optimal review timing |

### Internationalization
- English, Japanese, Turkish

---

## Quick Start

### Option 1: GitHub Codespaces (Fastest — zero setup)

Click **"Open in GitHub Codespaces"** above → wait for setup → click the **CodePractice** icon in the sidebar. Everything is pre-configured: Node.js, JDK 21, and the extension auto-installed.

### Option 2: Local Development

```bash
git clone https://github.com/barankul/codepractice.git
cd codepractice
npm install
npm run compile
```

Press `F5` in VS Code to launch the extension, then click the **CodePractice** icon in the sidebar.

### Option 3: Install from VSIX

```bash
npm install && npm run package
npx @vscode/vsce package --no-dependencies -o codepractice.vsix
code --install-extension codepractice.vsix
```

---

## Requirements

| Language | Requirement | Auto-install? |
|----------|------------|---------------|
| **SQL** | Nothing — built-in SQLite (WASM) | N/A |
| **TypeScript** | Node.js | Comes with VS Code |
| **Java** | JDK 21+ | Yes — click "Install JDK Now" when prompted |

> **Java auto-install** uses `winget` (Windows), `brew` (macOS), or `apt`/`dnf` (Linux). If none are available, it downloads directly from [Adoptium](https://adoptium.net/).

---

## AI Providers

CodePractice works with multiple AI providers. Free tiers are available — **no credit card required**.

| Provider | Pricing | Models |
|----------|---------|--------|
| **Groq** | Free tier available | Llama 3.3 70B, GPT-oss 120B |
| **Cerebras** | Free tier available | Llama 3.3 70B, Qwen 3 235B |
| **Google Gemini** | Free tier available | Gemini 2.5 Flash, 2.5 Pro |
| **Together AI** | Free credit on signup | Llama, DeepSeek, Qwen |
| **OpenRouter** | Free models available | Llama, Nemotron, Mistral |
| **OpenAI** | Pay-as-you-go | GPT-4.1 Mini, o4-mini |
| **Claude** | Pay-as-you-go | Sonnet 4.6, Opus 4.6 |
| **Local** | Free (self-hosted) | LM Studio, Ollama, any OpenAI-compatible |

**Setup:** Open sidebar → gear icon → select provider → enter API key → Save.

> **No API key?** CodePractice includes 140+ built-in exercises that work completely offline with full judging, hints, alternative solutions, cross-language comparison, and progress tracking.

---

## Offline Mode

Works without any API key or internet connection. Toggle between **AI** and **Offline** mode from the main screen.

- 140+ practices across Java, TypeScript, and SQL
- All difficulty levels (1-5)
- Multi-test validation per exercise
- Full judging with feedback
- Hints and solution explanations
- Alternative solution methods
- Cross-language comparison
- Progress tracking and XP
- Randomized values — different numbers/names each time

**Topics covered:**

| Java | TypeScript | SQL |
|------|-----------|-----|
| Array, ArrayList | Arrays, Objects | SELECT, WHERE |
| HashMap, HashSet | Functions, Types | JOIN, GROUP BY |
| String, Methods | Union Types, Async | ORDER BY, INSERT/UPDATE |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Run SQL file |
| `Ctrl+Shift+E` | Explain selected code |

---

## Architecture

```
src/
  extension.ts            Entry point & command registration
  appView.ts              Webview provider (sidebar UI host)
  webviewHtml.ts          Frontend UI (HTML/CSS/JS)
  aiHelpers.ts            AI provider routing & configuration
  aiGenerators.ts         Prompt engineering for all AI features
  javaRunner.ts           Java compilation & execution
  sqlRunner.ts            SQL execution via sql.js (WASM)
  multiTestRunner.ts      Multi-test harness generation
  outputChecker.ts        Output normalization & comparison
  parsers.ts              AI response parsing & error patterns
  progressTracker.ts      XP, levels, FSRS spaced repetition
  practiceRandomizer.ts   Offline practice value randomization
  demoData.ts             Offline mode detection & selection
  smokeTest.ts            Automated quality audit (38+ checks)
  i18n.ts                 Internationalization (en/ja/tr)
  offlinePractices/       140+ built-in exercises
  handlers/
    generateHandler.ts    Practice generation flow
    executionHandler.ts   Code execution & judging pipeline
    aiFeatureHandler.ts   AI features (hints, teach, solve, ghost text)
    settingsHandler.ts    Settings & progress management

core-java/src/
  CoreMain.java           Practice generator (Java subprocess)
  Ai.java                 AI client for Java-side generation
  DebugMain.java          Bug fix practice generator
```

**Tech stack:** TypeScript · esbuild · VS Code Webview API · sql.js (WASM) · FSRS algorithm

---

## License

MIT
