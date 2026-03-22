#!/bin/bash
# Install the pre-built VSIX — runs as postAttachCommand when code CLI is ready
if [ -f /tmp/codepractice.vsix ]; then
  echo ""
  echo "=== Installing CodePractice extension... ==="
  echo ""
  code --install-extension /tmp/codepractice.vsix --force
  rm -f /tmp/codepractice.vsix
  echo ""
  echo "=== CodePractice installed! ==="
  echo ""
  echo "  → Click the CodePractice icon in the left sidebar to start!"
  echo "  → If you don't see it, press Ctrl+Shift+P → 'Reload Window'"
  echo ""
else
  echo "VSIX not found — extension may already be installed."
fi
