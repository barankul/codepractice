<p align="center">
  日本語 | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="media/icon.png" alt="CodePractice" width="128" height="128">
</p>

<h1 align="center">CodePractice</h1>

<p align="center">
  <strong>VS Code向け AI搭載コーディング練習ジェネレーター</strong><br>
  問題生成・コード実行・自動採点・進捗管理 — すべてエディタ内で完結。
</p>

<p align="center">
  <a href="https://codespaces.new/barankul/codepractice?quickstart=1">
    <img src="https://github.com/codespaces/badge.svg" alt="GitHub Codespacesで開く" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/言語-Java%20%7C%20TypeScript%20%7C%20SQL-blue" alt="対応言語" />
  <img src="https://img.shields.io/badge/オフライン問題-140%2B-green" alt="140+オフライン問題" />
  <img src="https://img.shields.io/badge/AIプロバイダー-8-orange" alt="8 AIプロバイダー" />
  <img src="https://img.shields.io/badge/license-MIT-brightgreen" alt="MIT License" />
</p>

---

## なぜ CodePractice？

多くのコーディング練習プラットフォームはブラウザで動作します。CodePracticeは**VS Code内**で完結します — コードを書く場所で、そのまま練習できます。ブラウザとの切り替え不要。問題を生成し、エディタで解き、自動採点で即座にフィードバックを受け、間隔反復で進捗を管理します。

**主な特徴：**
- APIキー不要で**完全オフライン動作** — 140以上の組み込み問題
- **8つのAIプロバイダー**対応（無料枠あり）で無限の問題生成
- **コードランナー内蔵** — Java、TypeScript、SQLの外部セットアップ不要
- **マルチテストケース検証** — テストケースごとの詳細なフィードバック
- **FSRS間隔反復** — 最適なタイミングで復習をスケジューリング

---

## 機能一覧

### 問題生成
| 機能 | 説明 |
|------|------|
| **3言語対応** | Java、TypeScript、SQL — 各言語にランナー内蔵 |
| **適応型難易度** | 5段階、パフォーマンスに基づいて自動調整 |
| **AI生成問題** | 無料AIプロバイダーで毎回ユニークな問題 |
| **140+オフライン問題** | インターネット不要で動作する問題バンク |
| **カスタム練習** | 練習したい内容を記述するとAIが生成 |
| **バグ修正モード** | GitHubの実際のOSSコードのバグを発見・修正 |

### コード実行・採点
| 機能 | 説明 |
|------|------|
| **ランナー内蔵** | Java、TypeScript、SQLをエディタ内で直接実行 |
| **マルチテストケース** | 各問題を複数の入力で検証 |
| **自動採点** | インテリジェントな正規化による出力比較 |
| **部分合格フィードバック** | どのテストケースが不合格かを詳細表示 |
| **SQLスキーマビュー** | インメモリSQLiteのビジュアルスキーマブラウザ |

### 学習ツール
| 機能 | 説明 |
|------|------|
| **AIフィードバック** | 不正解時の行単位コードレビュー |
| **段階的ヒント** | コード内にコメントとしてヒントを挿入 |
| **クイック解答** | AIが解法を示し、アプローチを説明 |
| **ティーチミー** | 例題付きのステップバイステップ解説 |
| **ゴーストテキスト** | 入力中のインラインコード提案 |
| **代替解法** | 同じ問題に対する2-3通りのアプローチ |
| **言語間比較** | Python、JavaScript、C#、C++、Go、Rustなどでの解法表示 |

### 進捗管理
| 機能 | 説明 |
|------|------|
| **XPシステム** | 問題完了ごとにXPを獲得 |
| **レベル進行** | 上達に合わせて難易度が上昇 |
| **トピック習熟度** | 言語・トピック別の定着率追跡 |
| **デイリーゴール** | 日々の練習目標を追跡 |
| **週間トレンド** | 7日間の練習履歴と合格率 |
| **FSRSスケジューリング** | 最適な復習タイミングの間隔反復 |

### 多言語対応（i18n）
- English、日本語、Türkçe

---

## クイックスタート

### 方法1：GitHub Codespaces（最速 — セットアップ不要）

上の **「Open in GitHub Codespaces」** をクリック → セットアップ完了を待つ → サイドバーの **CodePractice** アイコンをクリック。Node.js、JDK 21、拡張機能がすべて自動インストールされます。

### 方法2：ローカル開発

```bash
git clone https://github.com/barankul/codepractice.git
cd codepractice
npm install
npm run compile
```

VS Codeで `F5` を押して拡張機能を起動し、サイドバーの **CodePractice** アイコンをクリック。

### 方法3：VSIXからインストール

```bash
npm install && npm run package
npx @vscode/vsce package --no-dependencies -o codepractice.vsix
code --install-extension codepractice.vsix
```

---

## 動作要件

| 言語 | 必要なもの | 自動インストール？ |
|------|-----------|-------------------|
| **SQL** | 不要 — SQLite (WASM) 内蔵 | N/A |
| **TypeScript** | Node.js | VS Codeに同梱 |
| **Java** | JDK 21以上 | はい — プロンプトの「Install JDK Now」をクリック |

> **Java自動インストール**は `winget`（Windows）、`brew`（macOS）、`apt`/`dnf`（Linux）を使用します。いずれも利用できない場合は [Adoptium](https://adoptium.net/) から直接ダウンロードします。

---

## AIプロバイダー

CodePracticeは複数のAIプロバイダーに対応しています。無料枠あり — **クレジットカード不要**。

| プロバイダー | 料金 | モデル |
|-------------|------|--------|
| **Groq** | 無料枠あり | Llama 3.3 70B, GPT-oss 120B |
| **Cerebras** | 無料枠あり | Llama 3.3 70B, Qwen 3 235B |
| **Google Gemini** | 無料枠あり | Gemini 2.5 Flash, 2.5 Pro |
| **Together AI** | 登録時に無料クレジット | Llama, DeepSeek, Qwen |
| **OpenRouter** | 無料モデルあり | Llama, Nemotron, Mistral |
| **OpenAI** | 従量課金 | GPT-4.1 Mini, o4-mini |
| **Claude** | 従量課金 | Sonnet 4.6, Opus 4.6 |
| **ローカル** | 無料（セルフホスト） | LM Studio, Ollama, OpenAI互換 |

**設定方法：** サイドバーを開く → 歯車アイコン → プロバイダーを選択 → APIキーを入力 → 保存。

> **APIキーがない場合** — 140以上の組み込み問題が完全オフラインで利用できます。採点、ヒント、代替解法、言語間比較、進捗管理すべて含みます。

---

## オフラインモード

APIキーやインターネット接続なしで動作します。メイン画面で **AI** と **オフライン** モードを切り替え。

- Java、TypeScript、SQLの140以上の問題
- 全難易度レベル（1-5）
- 問題ごとのマルチテスト検証
- フィードバック付き自動採点
- ヒントと解法説明
- 代替解法
- 言語間比較
- 進捗管理とXP
- ランダム化された値 — 毎回異なる数値・名前

**対応トピック：**

| Java | TypeScript | SQL |
|------|-----------|-----|
| Array, ArrayList | Arrays, Objects | SELECT, WHERE |
| HashMap, HashSet | Functions, Types | JOIN, GROUP BY |
| String, Methods | Union Types, Async | ORDER BY, INSERT/UPDATE |

---

## キーボードショートカット

| ショートカット | アクション |
|---------------|-----------|
| `Ctrl+Enter` | SQLファイルを実行 |
| `Ctrl+Shift+E` | 選択コードを説明 |

---

## アーキテクチャ

```
src/
  extension.ts            エントリーポイント・コマンド登録
  appView.ts              Webviewプロバイダー（サイドバーUIホスト）
  webviewHtml.ts          フロントエンドUI（HTML/CSS/JS）
  aiHelpers.ts            AIプロバイダールーティング・設定
  aiGenerators.ts         全AI機能のプロンプトエンジニアリング
  javaRunner.ts           Javaコンパイル・実行
  sqlRunner.ts            SQL実行（sql.js WASM経由）
  multiTestRunner.ts      マルチテストハーネス生成
  outputChecker.ts        出力正規化・比較
  parsers.ts              AIレスポンス解析・エラーパターン
  progressTracker.ts      XP、レベル、FSRS間隔反復
  practiceRandomizer.ts   オフライン問題の値ランダム化
  demoData.ts             オフラインモード検出・選択
  smokeTest.ts            自動品質監査（38以上のチェック）
  i18n.ts                 多言語対応（en/ja/tr）
  offlinePractices/       140以上の組み込み問題
  handlers/
    generateHandler.ts    問題生成フロー
    executionHandler.ts   コード実行・採点パイプライン
    aiFeatureHandler.ts   AI機能（ヒント、解説、解答、ゴーストテキスト）
    settingsHandler.ts    設定・進捗管理

core-java/src/
  CoreMain.java           問題ジェネレーター（Javaサブプロセス）
  Ai.java                 Java側AI生成用クライアント
  DebugMain.java          バグ修正問題ジェネレーター
```

**技術スタック：** TypeScript · esbuild · VS Code Webview API · sql.js (WASM) · FSRSアルゴリズム

---

## ライセンス

MIT
