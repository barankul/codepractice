#!/bin/bash
set -e
export CI=true
export DEBIAN_FRONTEND=noninteractive

echo "=== CodePractice — Setting up... ==="

# Install dependencies
npm install --yes

# Build extension
npm run package

# Package as VSIX and install
# Temporarily hide README to avoid vsce SVG restriction
mv README.md /tmp/_README.md.bak 2>/dev/null || true
mv README.ja.md /tmp/_README.ja.md.bak 2>/dev/null || true
yes | npx --yes @vscode/vsce package --no-dependencies --skip-license -o /tmp/codepractice.vsix
mv /tmp/_README.md.bak README.md 2>/dev/null || true
mv /tmp/_README.ja.md.bak README.ja.md 2>/dev/null || true
# Install VSIX — code CLI may not be available during postCreateCommand
if command -v code &>/dev/null; then
  code --install-extension /tmp/codepractice.vsix --force
else
  # Fallback: copy to default extensions dir so VS Code picks it up on start
  EXT_DIR="$HOME/.vscode-server/extensions/codeteacher.codepractice-0.0.1"
  mkdir -p "$EXT_DIR"
  cd "$EXT_DIR" && unzip -o /tmp/codepractice.vsix "extension/**" && mv extension/* . && rm -rf extension '[Content_Types].xml' 2>/dev/null || true
  cd /workspaces/codepractice-lite 2>/dev/null || cd /workspaces/* 2>/dev/null || true
fi
rm -f /tmp/codepractice.vsix

# Create a sample workspace so user has a folder open
mkdir -p /workspaces/codepractice-demo
cat > /workspaces/codepractice-demo/README.md << 'EOF'
# CodePractice Demo

Click the **CodePractice** icon in the left sidebar to get started!

## Features
- Generate coding practices (Java, TypeScript, SQL)
- AI-powered code judging
- Multiple test cases validation
- Alternative solutions & cross-language comparison
- Works offline with 120+ built-in practices
- XP system with level progression

## Quick Start
1. Click the CodePractice icon (sidebar)
2. Select a language & topic
3. Click "Generate"
4. Write your solution
5. Click "Judge" to check your code
EOF

echo ""
echo "=== Setup complete! ==="
echo "Click the CodePractice icon in the left sidebar to start."
echo ""
