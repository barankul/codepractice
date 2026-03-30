import * as assert from "assert";
import { parseAlternativeMethodsResponse } from "../aiGenerators.js";

suite("aiGenerators alternative methods parsing", () => {
  test("parses methods object with raw newlines inside code strings", () => {
    const rawResponse = `{
      "methods": [
        {
          "name": "Loop Variant",
          "code": "public class Practice {
  public static void main(String[] args) {
    System.out.println(1);
  }
}",
          "explanation": "Uses a direct loop-based structure.",
          "speedPercent": 115
        }
      ]
    }`;

    const methods = parseAlternativeMethodsResponse(rawResponse, "public class Practice { public static void main(String[] args) {} }");
    assert.strictEqual(methods.length, 2);
    assert.strictEqual(methods[1].name, "Loop Variant");
    assert.ok(methods[1].code.includes("public static void main"));
  });

  test("falls back to fenced code extraction instead of returning an error card", () => {
    const rawResponse = `
Method: Stream API
This version uses the stream pipeline for filtering.
\`\`\`java
public class Practice {
    public static void main(String[] args) {
        System.out.println("A");
    }
}
\`\`\`
`;

    const methods = parseAlternativeMethodsResponse(rawResponse, "public class Practice { public static void main(String[] args) {} }", "en");
    assert.strictEqual(methods.length, 2);
    assert.strictEqual(methods[1].name, "Stream API");
    assert.strictEqual(methods[1].explanation, "This version uses the stream pipeline for filtering.");
    assert.ok(!methods.some(method => method.name === "Error"));
  });
});
