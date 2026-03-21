// AIヘルパーテスト — AI helper tests
import * as assert from "assert";
import { setResponseLang, getResponseLang, invalidateAiConfigCache } from "../aiHelpers.js";

suite("aiHelpers", () => {

  test("setResponseLang + getResponseLang round-trip", () => {
    setResponseLang("tr");
    assert.strictEqual(getResponseLang(), "tr");
  });

  test("setResponseLang to Japanese", () => {
    setResponseLang("ja");
    assert.strictEqual(getResponseLang(), "ja");
  });

  test("setResponseLang back to English", () => {
    setResponseLang("en");
    assert.strictEqual(getResponseLang(), "en");
  });

  test("invalidateAiConfigCache does not throw", () => {
    assert.doesNotThrow(() => invalidateAiConfigCache());
  });
});
