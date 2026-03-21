#!/bin/bash
set -e

echo "=== CodePractice — Setting up... ==="

# Install dependencies
npm install

# Build extension
npm run package

# Package as VSIX and install
npx --yes @vscode/vsce package --no-dependencies -o /tmp/codepractice.vsix
code --install-extension /tmp/codepractice.vsix --force
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
