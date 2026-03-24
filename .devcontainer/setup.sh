#!/bin/bash
set -e
export CI=true
export DEBIAN_FRONTEND=noninteractive

# Workspace root — where Codespaces clones the repo
WS="/workspaces/codepractice"
S="$WS/GETTING_STARTED.md"

update_status() {
  cat > "$S" << EOF
# CodePractice — Setting Up... / セットアップ中...

$1

\`\`\`
$2
\`\`\`

Please wait... this takes about 1-2 minutes.
お待ちください…約1〜2分かかります。
EOF
}

update_status "## [1/4] Installing dependencies..." "[██░░░░░░░░░░░░░░░░░░] 10%"
echo "=== [1/4] Installing dependencies... ==="
npm install --yes

update_status "## [2/4] Building extension..." "[████████░░░░░░░░░░░░] 40%"
echo "=== [2/4] Building extension... ==="
npm run package

update_status "## [3/4] Packaging VSIX..." "[████████████░░░░░░░░] 60%"
echo "=== [3/4] Packaging VSIX... ==="
mv README.md /tmp/_README.md.bak 2>/dev/null || true
mv README.ja.md /tmp/_README.ja.md.bak 2>/dev/null || true
yes | npx --yes @vscode/vsce package --no-dependencies --skip-license -o /tmp/codepractice.vsix
mv /tmp/_README.md.bak README.md 2>/dev/null || true
mv /tmp/_README.ja.md.bak README.ja.md 2>/dev/null || true

update_status "## [4/4] Installing extension..." "[████████████████░░░░] 80%"
echo "=== [4/4] Installing extension... ==="
if code --install-extension /tmp/codepractice.vsix --force 2>/dev/null; then
  echo "Extension installed via code CLI."
else
  echo "code CLI not available — installing manually..."
  for DIR in \
    "$HOME/.vscode-remote/extensions" \
    "$HOME/.vscode-server/extensions" \
    "/home/codespace/.vscode-remote/extensions" \
  ; do
    if [ -d "$(dirname "$DIR")" ]; then
      EXT_DIR="$DIR/codeteacher.codepractice-0.0.1"
      mkdir -p "$EXT_DIR"
      (cd "$EXT_DIR" && unzip -oq /tmp/codepractice.vsix "extension/**" 2>/dev/null && mv extension/* . && rm -rf extension '[Content_Types].xml' extension.vsixmanifest) || true
      echo "Extension extracted to $EXT_DIR"
      break
    fi
  done
fi
rm -f /tmp/codepractice.vsix

# Done — update status to getting started guide
cat > "$S" << 'DONE'
# CodePractice — Ready! / 準備完了！

## Setup Complete / セットアップ完了

---

### How to Start

1. **Click the CodePractice icon** in the left sidebar (activity bar)
2. **Select a language** — Java, TypeScript, or SQL
3. **Pick a topic** — Arrays, Loops, Strings, etc.
4. **Click Generate** — a practice file opens in the editor
5. **Write your solution** — replace the TODO comments
6. **Click Judge** — AI checks your code

> **Tip:** Start with **Offline** mode — no API key needed! 120+ built-in practices.

---

### 使い方

1. **左サイドバーのCodePracticeアイコン**をクリック
2. **言語を選択** — Java、TypeScript、またはSQL
3. **トピックを選択** — 配列、ループ、文字列など
4. **Generateをクリック** — エディタに練習問題が開きます
5. **解答を書く** — TODOコメントを置き換えてください
6. **Judgeをクリック** — AIがコードを評価します

> **ヒント:** まずは **Offline** モードから — APIキー不要！120以上の練習問題が内蔵されています。

---

### If the sidebar icon doesn't appear / サイドバーにアイコンが表示されない場合:
Press `Ctrl+Shift+P` → type **Reload Window** → press Enter

### Want AI-generated practices? / AI生成の練習問題を使いたい場合:
Click the gear icon in the sidebar → configure a free API key:
サイドバーの歯車アイコンをクリック → 無料のAPIキーを設定：
- **Groq** — Free 100K tokens/day
- **Cerebras** — Free ~1M tokens/day
- **OpenRouter** — Free tier
- **Gemini** — Free tier
DONE

echo ""
echo "=== Setup complete! ==="
echo "Click the CodePractice icon in the left sidebar to start."
echo ""
