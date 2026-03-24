#!/bin/bash
# postAttachCommand — runs after VS Code connects, code CLI is available

VSIX="/tmp/codepractice.vsix"
GS="/workspaces/codepractice/GETTING_STARTED.md"

# Install extension if VSIX still exists
if [ -f "$VSIX" ]; then
  echo "=== Installing CodePractice extension... ==="
  code --install-extension "$VSIX" --force 2>/dev/null && rm -f "$VSIX" || true
fi

# Wait for VS Code to be fully ready, then open getting started file
if [ -f "$GS" ]; then
  sleep 3
  # Open file first, then show markdown preview to the side (right panel)
  code "$GS" 2>/dev/null || true
  sleep 1
  code --command "markdown.showPreviewToSide" 2>/dev/null || true
fi
