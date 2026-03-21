import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

public class Ai {

    // Environment variables for AI configuration
    private static final String PROVIDER = System.getenv().getOrDefault("CODETEACHER_AI_PROVIDER", "local");
    private static final String UI_LANG = System.getenv().getOrDefault("CODETEACHER_UI_LANG", "en");

    // Get language instruction for AI prompts
    public static String getLangInstruction() {
        if ("ja".equals(UI_LANG)) return "You MUST write all CONTENT in Japanese (日本語) — task descriptions, hints, explanations, comments. But KEEP the field LABELS in English exactly as specified (TITLE:, TASK:, HINT:, EXPECTED_OUTPUT:, TEST_CASES:, etc.). Only code syntax stays in English. This is mandatory.";
        if ("tr".equals(UI_LANG)) return "You MUST write all CONTENT in Turkish (Türkçe) — task descriptions, hints, explanations, comments. But KEEP the field LABELS in English exactly as specified (TITLE:, TASK:, HINT:, EXPECTED_OUTPUT:, TEST_CASES:, etc.). Only code syntax stays in English. This is mandatory.";
        return "";
    }

    // Get language prefix for prompt start (strongest position)
    public static String getLangPrefix() {
        if ("ja".equals(UI_LANG)) return "[LANGUAGE: JAPANESE] Write all content in Japanese (日本語). Keep field labels (TITLE:, TASK:, HINT:, etc.) in English.\n\n";
        if ("tr".equals(UI_LANG)) return "[LANGUAGE: TURKISH] Write all content in Turkish (Türkçe). Keep field labels (TITLE:, TASK:, HINT:, etc.) in English.\n\n";
        return "";
    }
    private static final String LOCAL_ENDPOINT = System.getenv().getOrDefault("CODETEACHER_AI_ENDPOINT",
            "http://127.0.0.1:1234/v1/chat/completions");
    private static final String ENDPOINT_API_KEY = System.getenv().getOrDefault("CODETEACHER_ENDPOINT_API_KEY", "");
    private static final String ENDPOINT_MODEL = System.getenv().getOrDefault("CODETEACHER_ENDPOINT_MODEL", "");
    private static final String AI_ENDPOINT = System.getenv().getOrDefault("CODETEACHER_AI_ENDPOINT", "");
    private static final String AI_MODEL = System.getenv().getOrDefault("CODETEACHER_AI_MODEL", "");
    private static final String GROQ_API_KEY = System.getenv().getOrDefault("CODETEACHER_GROQ_API_KEY", "");
    private static final String GROQ_MODEL = System.getenv().getOrDefault("CODETEACHER_GROQ_MODEL", "openai/gpt-oss-120b");
    private static final String GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

    // Gemini configuration
    private static final String GEMINI_API_KEY = System.getenv().getOrDefault("CODETEACHER_GEMINI_API_KEY", "");
    private static final String GEMINI_MODEL = System.getenv().getOrDefault("CODETEACHER_GEMINI_MODEL", "gemini-2.5-flash");

    public static String ask(String userPrompt) throws Exception {
        // Use Gemini if provider is gemini
        if ("gemini".equalsIgnoreCase(PROVIDER)) {
            return askGemini(userPrompt);
        }

        HttpClient client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        // Determine endpoint and model based on provider
        String endpoint;
        String model;
        String authHeader = null;

        if ("groq".equalsIgnoreCase(PROVIDER)) {
            if (GROQ_API_KEY.isEmpty()) {
                throw new Exception("Groq API key not set. Go to Settings panel to enter your key.");
            }
            endpoint = GROQ_ENDPOINT;
            model = GROQ_MODEL;
            authHeader = "Bearer " + GROQ_API_KEY;
        } else if ("cerebras".equalsIgnoreCase(PROVIDER)) {
            if (ENDPOINT_API_KEY.isEmpty()) {
                throw new Exception("Cerebras API key not set. Go to Settings panel to enter your key.");
            }
            endpoint = AI_ENDPOINT.isEmpty() ? "https://api.cerebras.ai/v1/chat/completions" : AI_ENDPOINT;
            model = AI_MODEL.isEmpty() ? "qwen-3-235b-a22b-instruct-2507" : AI_MODEL;
            authHeader = "Bearer " + ENDPOINT_API_KEY;
        } else if ("together".equalsIgnoreCase(PROVIDER)) {
            if (ENDPOINT_API_KEY.isEmpty()) {
                throw new Exception("Together API key not set. Go to Settings panel to enter your key.");
            }
            endpoint = AI_ENDPOINT.isEmpty() ? "https://api.together.xyz/v1/chat/completions" : AI_ENDPOINT;
            model = AI_MODEL.isEmpty() ? "meta-llama/Llama-3.3-70B-Instruct-Turbo" : AI_MODEL;
            authHeader = "Bearer " + ENDPOINT_API_KEY;
        } else if ("openrouter".equalsIgnoreCase(PROVIDER)) {
            if (ENDPOINT_API_KEY.isEmpty()) {
                throw new Exception("OpenRouter API key not set. Go to Settings panel to enter your key.");
            }
            endpoint = AI_ENDPOINT.isEmpty() ? "https://openrouter.ai/api/v1/chat/completions" : AI_ENDPOINT;
            model = AI_MODEL.isEmpty() ? "nvidia/nemotron-3-super-120b-a12b:free" : AI_MODEL;
            authHeader = "Bearer " + ENDPOINT_API_KEY;
        } else {
            // local / custom endpoint
            endpoint = LOCAL_ENDPOINT;
            model = ENDPOINT_MODEL.isEmpty() ? "yi-coder-9b-chat" : ENDPOINT_MODEL;
            if (!ENDPOINT_API_KEY.isEmpty()) {
                authHeader = "Bearer " + ENDPOINT_API_KEY;
            }
        }

        String jsonBody =
                "{"
              + "\"model\":\"" + model + "\","
              + "\"temperature\":0.3,"
              + "\"messages\":["
              +   "{\"role\":\"system\",\"content\":\"" + escape(getLangInstruction()) + " Generate coding exercises. Mark solution with >>>. Give ONLY raw data, NO helper variables. Test data MUST match expected output logically.\"},"
              +   "{\"role\":\"user\",\"content\":\"" + escape(userPrompt) + "\"}"
              + "]"
              + "}";

        HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json");

        // Add Authorization header for Groq
        if (authHeader != null) {
            reqBuilder.header("Authorization", authHeader);
        }

        HttpRequest req = reqBuilder
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());

        if (res.statusCode() != 200) {
            throw new Exception("API error: " + res.statusCode() + " - " + res.body());
        }

        return res.body();
    }

    // Gemini API has different format
    private static String askGemini(String userPrompt) throws Exception {
        if (GEMINI_API_KEY.isEmpty()) {
            throw new Exception("Gemini API key not set");
        }

        HttpClient client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/"
                + GEMINI_MODEL + ":generateContent?key=" + GEMINI_API_KEY;

        // Gemini uses different request format
        String systemPrompt = getLangInstruction() + " You are a coding exercise generator. Generate COMPLETE working code but mark the lines student should write with >>> prefix. Do NOT use Scanner or user input. Use hardcoded test data.";
        String fullPrompt = systemPrompt + "\n\n" + userPrompt;

        String jsonBody =
                "{"
              + "\"contents\":[{\"parts\":[{\"text\":\"" + escape(fullPrompt) + "\"}]}],"
              + "\"generationConfig\":{\"temperature\":0.3}"
              + "}";

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());

        // Check for error status
        if (res.statusCode() != 200) {
            throw new Exception("Gemini API error: " + res.statusCode() + " - " + res.body());
        }

        // Convert Gemini response to OpenAI-like format for compatibility
        String body = res.body();
        String text = extractGeminiContent(body);
        // Return in OpenAI-compatible format
        return "{\"choices\":[{\"message\":{\"content\":\"" + escape(text) + "\"}}]}";
    }

    // Extract text from Gemini response
    private static String extractGeminiContent(String rawJson) {
        // Look for "text": in Gemini response
        String key = "\"text\":";
        int keyPos = rawJson.indexOf(key);
        if (keyPos == -1) return "NO_CONTENT_FOUND";

        int firstQuote = rawJson.indexOf("\"", keyPos + key.length());
        if (firstQuote == -1) return "NO_OPEN_QUOTE";

        int start = firstQuote + 1;
        int end = -1;

        for (int i = start; i < rawJson.length(); i++) {
            char c = rawJson.charAt(i);
            if (c == '"' && rawJson.charAt(i - 1) != '\\') {
                end = i;
                break;
            }
        }
        if (end == -1) return "NO_CLOSE_QUOTE";

        String content = rawJson.substring(start, end);
        content = content
                .replace("\\n", "\n")
                .replace("\\\"", "\"")
                .replace("\\\\", "\\");
        return unescapeUnicode(content);
    }

    // Unescape Unicode sequences like \u003c to <
    private static String unescapeUnicode(String s) {
        return s
            .replace("\\u003c", "<")
            .replace("\\u003e", ">")
            .replace("\\u003C", "<")
            .replace("\\u003E", ">")
            .replace("\\u0026", "&")
            .replace("\\u0027", "'");
    }

    public static String extractContent(String rawJson) {
        // For reasoning models (gpt-oss-120b etc.), "reasoning" field may appear before "content".
        // We need to find the "content" that's inside the "message" object, not inside "reasoning".
        // Strategy: find "message" first, then find "content" after it.
        String key = "\"content\":";
        int searchFrom = 0;

        // Try to locate "message" object first to skip "reasoning" field
        int messagePos = rawJson.indexOf("\"message\"");
        if (messagePos >= 0) {
            searchFrom = messagePos;
        }

        // Find "content" key after "message" — but skip "reasoning_content" if present
        int keyPos = -1;
        int pos = searchFrom;
        while (pos < rawJson.length()) {
            int found = rawJson.indexOf(key, pos);
            if (found == -1) break;
            // Make sure this isn't "reasoning_content" — check char before "content"
            if (found > 0 && rawJson.charAt(found - 1) != '"') {
                // Check it's not part of "reasoning_content":
                int checkStart = Math.max(0, found - 20);
                String before = rawJson.substring(checkStart, found);
                if (!before.contains("reasoning")) {
                    keyPos = found;
                    break;
                }
            } else {
                keyPos = found;
                break;
            }
            pos = found + key.length();
        }

        if (keyPos == -1) {
            // Fallback: just find first "content":
            keyPos = rawJson.indexOf(key);
        }
        if (keyPos == -1) return "NO_CONTENT_FOUND";

        int firstQuote = rawJson.indexOf("\"", keyPos + key.length());
        if (firstQuote == -1) return "NO_OPEN_QUOTE";

        // Handle null content: "content": null
        String afterKey = rawJson.substring(keyPos + key.length()).trim();
        if (afterKey.startsWith("null")) {
            // Reasoning model may put actual text in "reasoning" and null in "content"
            // Try to extract from "reasoning" field instead
            int reasoningPos = rawJson.indexOf("\"reasoning\":");
            if (reasoningPos >= 0) {
                return extractStringValue(rawJson, reasoningPos + "\"reasoning\":".length());
            }
            return "NO_CONTENT_FOUND";
        }

        return extractStringValue(rawJson, keyPos + key.length());
    }

    /** Extract a JSON string value starting from the given position */
    private static String extractStringValue(String json, int fromPos) {
        int firstQuote = json.indexOf("\"", fromPos);
        if (firstQuote == -1) return "NO_OPEN_QUOTE";

        int start = firstQuote + 1;
        int end = -1;
        for (int i = start; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '"' && json.charAt(i - 1) != '\\') {
                end = i;
                break;
            }
        }
        if (end == -1) return "NO_CLOSE_QUOTE";

        String content = json.substring(start, end);
        content = content
                .replace("\\n", "\n")
                .replace("\\\"", "\"")
                .replace("\\\\", "\\");

        return unescapeUnicode(content);
    }

    static String escape(String s) {
        return s
          .replace("\\", "\\\\")
          .replace("\"", "\\\"")
          .replace("\n", "\\n")
          .replace("\r", "\\r");
    }
}
