#!/bin/bash
# postAttachCommand — install extension if code CLI is now available
# This runs after VS Code connects, so code CLI should work

VSIX="/tmp/codepractice.vsix"
VSIX_BACKUP="/workspaces/codepractice/.codepractice.vsix"

# Check both locations
if [ -f "$VSIX" ]; then
  TARGET="$VSIX"
elif [ -f "$VSIX_BACKUP" ]; then
  TARGET="$VSIX_BACKUP"
else
  # Extension should already be installed from postCreateCommand
  exit 0
fi

echo "=== Installing CodePractice extension... ==="
code --install-extension "$TARGET" --force 2>/dev/null && {
  rm -f "$VSIX" "$VSIX_BACKUP"
  echo "=== CodePractice installed! Click the icon in the left sidebar. ==="
} || {
  echo "code CLI failed — extension should be pre-installed from setup."
}
