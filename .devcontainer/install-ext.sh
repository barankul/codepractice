#!/bin/bash
# postAttachCommand — runs after VS Code connects, code CLI is available

VSIX="/tmp/codepractice.vsix"
GS="/workspaces/codepractice/GETTING_STARTED.md"

# Install extension if VSIX still exists
if [ -f "$VSIX" ]; then
  echo "=== Installing CodePractice extension... ==="
  code --install-extension "$VSIX" --force 2>/dev/null && rm -f "$VSIX" || true
fi

# Open the getting started file in markdown preview
if [ -f "$GS" ]; then
  code "$GS" 2>/dev/null || true
fi
