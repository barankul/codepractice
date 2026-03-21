public class DebugMain {
    public static void main(String[] args) throws Exception {
        // args: <Language> <Topic>
        if (args.length < 2) {
            System.out.println("{\"error\":\"Usage: <Language> <Topic>\"}");
            return;
        }

        String lang = args[0];
        String topic = args[1];

        // Get level from environment
        int level = 1;
        try {
            level = Integer.parseInt(System.getenv().getOrDefault("CODETEACHER_LEVEL", "1"));
        } catch (Exception e) {
            level = 1;
        }

        // Build difficulty description based on level
        String bugDifficulty;
        if (level == 1) {
            bugDifficulty = "simple typo or off-by-one error";
        } else if (level == 2) {
            bugDifficulty = "logic error like wrong operator or missing condition";
        } else if (level == 3) {
            bugDifficulty = "subtle bug like incorrect loop bounds or wrong variable";
        } else {
            bugDifficulty = "tricky bug requiring careful analysis";
        }

        String prompt =
            "Generate a DEBUG PRACTICE for " + lang + " about " + topic + ".\n" +
            "Bug difficulty: " + bugDifficulty + " (Level " + level + ")\n\n" +
            "Return ONLY in this format:\n" +
            "TITLE: (short title describing the buggy code)\n" +
            "DESCRIPTION: (what the code is SUPPOSED to do)\n" +
            "BUGGY_CODE: (complete code with ONE intentional bug)\n" +
            "BUG_HINT: (vague hint about where to look, don't reveal the bug)\n" +
            "BUG_EXPLANATION: (what the bug is and how to fix it - shown after user gives up)\n" +
            "EXPECTED_OUTPUT: (correct output after bug is fixed)\n\n" +
            "IMPORTANT:\n" +
            "- The code must have exactly ONE bug\n" +
            "- The bug should be related to " + topic + "\n" +
            "- Do NOT add comments pointing to the bug\n" +
            "- The code should look reasonable but produce wrong results\n" +
            "- Keep code under 30 lines\n" +
            "No extra commentary.";

        // File extension based on language
        String filename;
        if (lang.equalsIgnoreCase("TypeScript")) {
            filename = "Practice.ts";
        } else if (lang.equalsIgnoreCase("SQL")) {
            filename = "Practice.sql";
        } else {
            filename = "Practice.java";
        }

        // Get AI response
        String raw = Ai.ask(prompt);
        String text = Ai.extractContent(raw);

        String code = Extract.firstCodeBlock(text);
        if (code == null) code = "// NO_CODE_BLOCK_FOUND\n";

        // JSON output
        String json =
            "{"
          + "\"filename\":" + Json.quote(filename) + ","
          + "\"content\":" + Json.quote(code) + ","
          + "\"meta\":" + Json.quote(text) + ","
          + "\"mode\":\"debug\""
          + "}";

        System.out.println(json);
    }
}
