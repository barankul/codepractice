/**
 * Generates structured lessons for learning a programming language from scratch.
 * Each language has a curriculum with progressive topics.
 */
public class LessonGenerator {

    // Curriculum definitions for each language
    private static final String[][] JAVA_CURRICULUM = {
        {"1", "Variables", "Learn how to store data using variables"},
        {"2", "Data Types", "Understanding int, String, boolean, double"},
        {"3", "Operators", "Arithmetic, comparison, and logical operators"},
        {"4", "If-Else", "Making decisions with conditional statements"},
        {"5", "Loops", "Repeating code with for and while loops"},
        {"6", "Arrays", "Storing multiple values in arrays"},
        {"7", "Methods", "Creating reusable code blocks"},
        {"8", "ArrayList", "Dynamic arrays with ArrayList"},
        {"9", "HashMap", "Key-value pairs with HashMap"},
        {"10", "OOP Basics", "Classes, objects, and constructors"}
    };

    private static final String[][] TYPESCRIPT_CURRICULUM = {
        {"1", "Type Basics", "Understanding TypeScript types"},
        {"2", "Variables", "let, const, and type annotations"},
        {"3", "Functions", "Typed functions and arrow functions"},
        {"4", "Arrays", "Typed arrays and array methods"},
        {"5", "Objects", "Object types and interfaces basics"},
        {"6", "Union Types", "Combining types with unions"},
        {"7", "Interfaces", "Defining object shapes"},
        {"8", "Classes", "Object-oriented TypeScript"},
        {"9", "Generics", "Reusable type-safe code"},
        {"10", "Async/Await", "Handling asynchronous operations"}
    };

    private static final String[][] SQL_CURRICULUM = {
        {"1", "SELECT Basics", "Retrieving data from tables"},
        {"2", "WHERE", "Filtering rows with conditions"},
        {"3", "ORDER BY", "Sorting query results"},
        {"4", "LIMIT", "Limiting number of results"},
        {"5", "Aggregate Functions", "COUNT, SUM, AVG, MIN, MAX"},
        {"6", "GROUP BY", "Grouping data for aggregation"},
        {"7", "HAVING", "Filtering grouped data"},
        {"8", "JOIN Basics", "Combining data from multiple tables"},
        {"9", "LEFT/RIGHT JOIN", "Including unmatched rows"},
        {"10", "Subqueries", "Queries within queries"}
    };

    public static void main(String[] args) throws Exception {
        if (args.length < 2) {
            System.out.println("{\"error\":\"Usage: LessonGenerator <command> <language> [lessonNum]\"}");
            return;
        }

        String command = args[0];
        String lang = args[1];

        switch (command.toLowerCase()) {
            case "curriculum":
                printCurriculum(lang);
                break;
            case "lesson":
                if (args.length < 3) {
                    System.out.println("{\"error\":\"Lesson number required\"}");
                    return;
                }
                int lessonNum = Integer.parseInt(args[2]);
                generateLesson(lang, lessonNum);
                break;
            case "practice":
                if (args.length < 3) {
                    System.out.println("{\"error\":\"Lesson number required\"}");
                    return;
                }
                int practiceNum = Integer.parseInt(args[2]);
                generatePractice(lang, practiceNum);
                break;
            default:
                System.out.println("{\"error\":\"Unknown command: " + command + "\"}");
        }
    }

    private static String[][] getCurriculum(String lang) {
        switch (lang.toLowerCase()) {
            case "java": return JAVA_CURRICULUM;
            case "typescript": return TYPESCRIPT_CURRICULUM;
            case "sql": return SQL_CURRICULUM;
            default: return new String[0][];
        }
    }

    private static void printCurriculum(String lang) {
        String[][] curriculum = getCurriculum(lang);
        if (curriculum.length == 0) {
            System.out.println("{\"error\":\"Unknown language: " + lang + "\"}");
            return;
        }

        StringBuilder json = new StringBuilder();
        json.append("{\"language\":\"").append(lang).append("\",\"lessons\":[");

        for (int i = 0; i < curriculum.length; i++) {
            if (i > 0) json.append(",");
            json.append("{");
            json.append("\"id\":").append(curriculum[i][0]).append(",");
            json.append("\"topic\":").append(Json.quote(curriculum[i][1])).append(",");
            json.append("\"description\":").append(Json.quote(curriculum[i][2]));
            json.append("}");
        }

        json.append("]}");
        System.out.println(json.toString());
    }

    private static void generateLesson(String lang, int lessonNum) throws Exception {
        String[][] curriculum = getCurriculum(lang);
        if (lessonNum < 1 || lessonNum > curriculum.length) {
            System.out.println("{\"error\":\"Invalid lesson number\"}");
            return;
        }

        String[] lesson = curriculum[lessonNum - 1];
        String topic = lesson[1];
        String description = lesson[2];

        // Get previous topics for context
        StringBuilder previousTopics = new StringBuilder();
        for (int i = 0; i < lessonNum - 1; i++) {
            if (i > 0) previousTopics.append(", ");
            previousTopics.append(curriculum[i][1]);
        }

        String prompt = buildLessonPrompt(lang, topic, description, previousTopics.toString(), lessonNum);

        String raw = Ai.ask(prompt);
        String content = Ai.extractContent(raw);

        String json = "{"
            + "\"lessonId\":" + lessonNum + ","
            + "\"topic\":" + Json.quote(topic) + ","
            + "\"description\":" + Json.quote(description) + ","
            + "\"content\":" + Json.quote(content)
            + "}";

        System.out.println(json);
    }

    private static String buildLessonPrompt(String lang, String topic, String description, String previousTopics, int lessonNum) {
        StringBuilder prompt = new StringBuilder();

        prompt.append(Ai.getLangPrefix());
        prompt.append("You are teaching ").append(lang).append(" to a complete beginner.\n");
        prompt.append("This is Lesson ").append(lessonNum).append(": ").append(topic).append("\n");
        prompt.append("Topic: ").append(description).append("\n\n");

        if (!previousTopics.isEmpty()) {
            prompt.append("The student has already learned: ").append(previousTopics).append("\n");
            prompt.append("Build on this knowledge.\n\n");
        } else {
            prompt.append("This is the FIRST lesson - assume NO prior knowledge.\n\n");
        }

        prompt.append("Write a SHORT lesson (max 200 words) that:\n");
        prompt.append("1. Explains the concept simply\n");
        prompt.append("2. Shows 1-2 simple code examples\n");
        prompt.append("3. Uses everyday analogies if helpful\n\n");
        prompt.append("Format:\n");
        prompt.append("EXPLANATION:\n[Simple explanation]\n\n");
        prompt.append("EXAMPLE:\n```").append(lang.toLowerCase()).append("\n[code example]\n```\n\n");
        prompt.append("KEY POINT:\n[One sentence summary]\n");
        prompt.append(Ai.getLangInstruction());

        return prompt.toString();
    }

    private static void generatePractice(String lang, int lessonNum) throws Exception {
        String[][] curriculum = getCurriculum(lang);
        if (lessonNum < 1 || lessonNum > curriculum.length) {
            System.out.println("{\"error\":\"Invalid lesson number\"}");
            return;
        }

        String[] lesson = curriculum[lessonNum - 1];
        String topic = lesson[1];

        // Build practice prompt
        String prompt = buildPracticePrompt(lang, topic, lessonNum);

        String raw = Ai.ask(prompt);
        String content = Ai.extractContent(raw);
        String code = Extract.firstCodeBlock(content);
        if (code == null) code = "// No code generated";

        String filename = getFilename(lang);

        String json = "{"
            + "\"lessonId\":" + lessonNum + ","
            + "\"topic\":" + Json.quote(topic) + ","
            + "\"filename\":" + Json.quote(filename) + ","
            + "\"content\":" + Json.quote(code) + ","
            + "\"meta\":" + Json.quote(content)
            + "}";

        System.out.println(json);
    }

    private static String buildPracticePrompt(String lang, String topic, int lessonNum) {
        StringBuilder prompt = new StringBuilder();

        prompt.append(Ai.getLangPrefix());
        prompt.append("Generate 1 VERY SIMPLE ").append(lang).append(" practice for a beginner.\n");
        prompt.append("Topic: ").append(topic).append(" (Lesson ").append(lessonNum).append(")\n\n");

        prompt.append("This is for someone who JUST learned this topic.\n");
        prompt.append("Make it VERY EASY - they should feel successful!\n\n");

        prompt.append("Return ONLY in this format:\n");
        prompt.append("TITLE: (short title)\n");
        prompt.append("TASK: (what to do - keep it simple)\n");
        prompt.append("STARTER_CODE:\n```").append(lang.toLowerCase()).append("\n[code with TODO comments, max 15 lines]\n```\n");
        prompt.append("EXPECTED_OUTPUT: (exact output)\n");
        prompt.append("HINT: (helpful hint)\n");
        prompt.append(Ai.getLangInstruction());

        return prompt.toString();
    }

    private static String getFilename(String lang) {
        switch (lang.toLowerCase()) {
            case "java": return "Practice.java";
            case "typescript": return "Practice.ts";
            case "sql": return "Practice.sql";
            default: return "Practice.txt";
        }
    }
}
