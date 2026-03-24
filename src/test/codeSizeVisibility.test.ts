import * as assert from "assert";
import { shouldShowCodeSizeGroup } from "../webview/ui/langTopics.js";

suite("codeSizeGroup visibility", () => {
  test("shows only for AI bug-fix mode on non-API topics", () => {
    assert.strictEqual(shouldShowCodeSizeGroup("bugfix", "ai", "Array"), true);
    assert.strictEqual(shouldShowCodeSizeGroup("bugfix", "offline", "Array"), false);
    assert.strictEqual(shouldShowCodeSizeGroup("practice", "ai", "Array"), false);
    assert.strictEqual(shouldShowCodeSizeGroup("bugfix", "ai", "API"), false);
  });
});
