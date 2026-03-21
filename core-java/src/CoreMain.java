public class CoreMain {

    // Fix common AI mistakes (Java-specific)
    private static String fixJavaMistakes(String code) {
        // Remove Scanner import
        code = code.replaceAll("import java\\.util\\.Scanner;\\n?", "");

        // Remove Scanner lines
        code = code.replaceAll(".*Scanner.*=.*new Scanner.*\\n?", "");
        code = code.replaceAll(".*scanner\\..*\\n?", "");
        code = code.replaceAll(".*Scanner\\..*\\n?", "");

        // Fix class name to Practice
        code = code.replaceAll("public class \\w+", "public class Practice");

        // Fix: AI sometimes puts static methods INSIDE main() — move them before main()
        code = extractMethodsFromMain(code);

        return code;
    }

    /**
     * Find static/non-main methods defined inside main() body and move them
     * to class level (before main). Uses brace-depth tracking.
     */
    private static String extractMethodsFromMain(String code) {
        // Find main method opening brace
        int mainIdx = code.indexOf("public static void main");
        if (mainIdx < 0) return code;

        // Find the opening brace of main
        int mainBrace = code.indexOf('{', mainIdx);
        if (mainBrace < 0) return code;

        // Scan inside main body for method declarations
        // A method inside main looks like: [public] [static] returnType methodName(params) {
        java.util.regex.Pattern methodPat = java.util.regex.Pattern.compile(
            "^\\s*(public\\s+)?(static\\s+)(\\w+(?:\\[\\])?\\s+)(\\w+)(\\s*\\([^)]*\\)\\s*\\{)",
            java.util.regex.Pattern.MULTILINE
        );

        // Track depth to know we're inside main
        StringBuilder extracted = new StringBuilder();
        boolean changed = false;

        // We need to repeatedly find and extract methods since positions shift
        for (int pass = 0; pass < 5; pass++) {
            java.util.regex.Matcher m = methodPat.matcher(code);
            boolean found = false;

            while (m.find()) {
                // Skip the main method declaration itself
                String methodName = m.group(4);
                if (methodName.equals("main")) continue;

                // Check this match is INSIDE main (after main's opening brace)
                int matchPos = m.start();
                int currentMainBrace = code.indexOf('{', code.indexOf("public static void main"));
                if (matchPos <= currentMainBrace) continue;

                // Verify we're inside main by checking brace depth
                int depth = 0;
                boolean insideMain = false;
                for (int i = currentMainBrace; i < matchPos; i++) {
                    if (code.charAt(i) == '{') depth++;
                    else if (code.charAt(i) == '}') depth--;
                }
                if (depth < 1) continue; // not inside main

                // Extract the full method (match braces to find end)
                int braceCount = 0;
                int methodEnd = -1;
                for (int i = matchPos; i < code.length(); i++) {
                    if (code.charAt(i) == '{') braceCount++;
                    else if (code.charAt(i) == '}') {
                        braceCount--;
                        if (braceCount == 0) { methodEnd = i + 1; break; }
                    }
                }
                if (methodEnd < 0) continue;

                // Get the method text, strip >>> markers, ensure class-level indentation
                String method = code.substring(matchPos, methodEnd).trim();
                method = method.replace(">>>", "   "); // preserve alignment
                // Re-indent to 4 spaces (class level)
                String[] methodLines = method.split("\n");
                StringBuilder indented = new StringBuilder();
                for (String line : methodLines) {
                    indented.append("    ").append(line.stripLeading()).append("\n");
                }
                extracted.append("\n").append(indented);

                // Remove from original position (including trailing newline)
                int removeEnd = methodEnd;
                while (removeEnd < code.length() && code.charAt(removeEnd) == '\n') removeEnd++;
                code = code.substring(0, matchPos) + code.substring(removeEnd);
                changed = true;
                found = true;
                break; // restart scan since positions shifted
            }
            if (!found) break;
        }

        if (changed && extracted.length() > 0) {
            // Insert extracted methods before main
            int insertPos = code.indexOf("public static void main");
            code = code.substring(0, insertPos) + extracted.toString() + "\n    " + code.substring(insertPos);
        }

        return code;
    }

    // Fix common AI mistakes based on language
    private static String fixCommonMistakes(String code, String lang) {
        if (lang.equalsIgnoreCase("Java")) {
            return fixJavaMistakes(code);
        }
        // TypeScript: no special fixes needed
        return code;
    }

    // Remove lines marked with >>> and replace with placeholder
    private static String removeMarkedLines(String code) {
        String[] lines = code.split("\n");
        StringBuilder result = new StringBuilder();
        boolean addedPlaceholder = false;

        for (String line : lines) {
            // Check if line contains >>> anywhere
            if (line.contains(">>>")) {
                // This is a solution line - skip it
                if (!addedPlaceholder) {
                    // Add placeholder only once
                    result.append("        // YOUR CODE HERE\n");
                    result.append("        \n");
                    result.append("        \n");
                    addedPlaceholder = true;
                }
            } else {
                result.append(line).append("\n");
                // Reset flag when we hit non-empty, non-solution code
                String trimmed = line.trim();
                if (!trimmed.isEmpty() && !trimmed.equals("}")) {
                    addedPlaceholder = false;
                }
            }
        }



        return result.toString();
    }

    public static void main(String[] args) throws Exception {
        // args: <Language> <Topic>
        if (args.length < 2) {
            System.out.println("{\"error\":\"Usage: <Language> <Topic>\"}");
            return;
        }

        String lang = args[0];
        String topic = args[1];

        // Get level and history from environment
        int level = 1;
        try {
            level = Integer.parseInt(System.getenv().getOrDefault("CODETEACHER_LEVEL", "1"));
        } catch (Exception e) {
            level = 1;
        }

        String historyRaw = System.getenv().getOrDefault("CODETEACHER_HISTORY", "");
        String[] previousPractices = historyRaw.isEmpty() ? new String[0] : historyRaw.split("\\|\\|\\|");

        // Build difficulty description based on level
        String difficulty;
        String levelRules;
        if (level == 1) {
            difficulty = "BEGINNER";
            levelRules = "Level 1 rules: Single concept only. Student fills in 1 LINE of code. Example: fill in a print statement, assign a variable, or write ONE simple expression. NO methods, NO loops, NO conditions.\n" +
                "BANNED at L1-L2: Do NOT use streams, lambda expressions, .stream(), Collectors, .map(), .filter(), .reduce(), .forEach(), :: method references, or functional interfaces. Use ONLY basic for/while loops and if/else.";
        } else if (level == 2) {
            difficulty = "EASY";
            levelRules = "Level 2 rules: One simple loop OR one if-statement. Student fills in 2-3 LINES. Example: write a for loop to iterate array, or write an if-else. NO nested structures, NO methods.\n" +
                "BANNED at L1-L2: Do NOT use streams, lambda expressions, .stream(), Collectors, .map(), .filter(), .reduce(), .forEach(), :: method references, or functional interfaces. Use ONLY basic for/while loops and if/else.";
        } else if (level == 3) {
            difficulty = "INTERMEDIATE";
            levelRules = "Level 3 rules: Combine loop + condition. Student fills in 4-6 LINES. Example: loop through array and sum only even numbers. Can have nested if inside loop.\n" +
                "BANNED at L1-L3: Do NOT use Java streams, lambda expressions, .stream(), Collectors, :: method references. Use ONLY basic loops and conditions.";
        } else if (level == 4) {
            difficulty = "CHALLENGING";
            levelRules = "Level 4 rules: Multiple steps or helper method. Student fills in 8-15 LINES of code (this is CHALLENGING level — do NOT make it too short). Example: implement a method that processes data with multiple conditions, nested loops, or multi-step algorithms. The solution MUST have at least 8 lines of real logic (not counting braces or comments).";
        } else {
            difficulty = "ADVANCED (Level " + level + ")";
            levelRules = "Level 5+ rules: Complex algorithm or data structure manipulation. Student implements significant logic with multiple methods or nested loops.";
        }

        // Build history avoidance string
        StringBuilder historyNote = new StringBuilder();
        boolean isSimilarRequest = false;
        String similarTask = "";

        if (previousPractices.length > 0) {
            // Check if this is a SIMILAR practice request
            if (previousPractices[0].startsWith("SIMILAR REQUEST:")) {
                isSimilarRequest = true;
                similarTask = previousPractices[0].replace("SIMILAR REQUEST:", "").trim();
            } else {
                historyNote.append("\n\nIMPORTANT - DO NOT repeat these previous practices:\n");
                for (String prev : previousPractices) {
                    if (!prev.trim().isEmpty()) {
                        historyNote.append("- ").append(prev.trim()).append("\n");
                    }
                }
                historyNote.append("Create something DIFFERENT from the above!\n");
            }
        }

        // Exercise variety lists by topic
        String[] arrayExercises = {
            "Find the second largest element",
            "Count elements greater than average",
            "Find first element that appears twice",
            "Rotate array left by 2 positions",
            "Check if array is sorted ascending",
            "Find the missing number (1 to n)",
            "Swap first and last elements",
            "Find index of target value",
            "Calculate product of all elements",
            "Count pairs that sum to target",
            "Find longest streak of same value",
            "Merge two sorted arrays",
            "Check if array has duplicates",
            "Find element appearing odd times",
            "Reverse only even-indexed elements"
        };

        String[] arrayListExercises = {
            "Remove all elements at odd indices",
            "Insert element at middle position",
            "Find and return all elements > 10",
            "Count distinct elements",
            "Replace all negatives with zero",
            "Find intersection of two lists",
            "Remove consecutive duplicates",
            "Split list into two halves",
            "Find second smallest element",
            "Check if list is palindrome",
            "Move all zeros to end",
            "Find most frequent element",
            "Rotate list right by k positions",
            "Flatten nested ArrayList",
            "Group elements by even/odd"
        };

        String[] hashMapExercises = {
            "Count character frequency in string",
            "Find first non-repeating character",
            "Check if two strings are anagrams",
            "Group words by their length",
            "Find key with minimum value",
            "Invert map (swap keys and values)",
            "Merge two HashMaps summing values",
            "Find duplicate values in map",
            "Create map from two arrays (keys, values)",
            "Filter map entries by value threshold",
            "Sort map by values",
            "Count words starting with each letter",
            "Find all keys with same value",
            "Remove entries with null values",
            "Convert list to frequency map"
        };

        String[] hashSetExercises = {
            "Find elements in A but not B",
            "Check if set is subset of another",
            "Find union of two sets",
            "Remove common elements from set",
            "Check if string has all unique chars",
            "Find pairs with given difference",
            "Count unique words in sentence",
            "Find longest consecutive sequence",
            "Check if arrays have common element",
            "Remove duplicates preserving order",
            "Find missing elements in range",
            "Check if sets are disjoint",
            "Find symmetric pairs",
            "Count distinct prime factors",
            "Find elements appearing in all arrays"
        };

        String[] stringExercises = {
            "Count words in sentence",
            "Find longest word in string",
            "Check if string contains only digits",
            "Remove duplicate characters",
            "Capitalize first letter of each word",
            "Count occurrences of substring",
            "Check if strings are rotations",
            "Find common prefix of two strings",
            "Replace spaces with dashes",
            "Reverse words in sentence",
            "Check if brackets are balanced",
            "Find first repeated character",
            "Remove all vowels from string",
            "Check if string is anagram",
            "Convert camelCase to snake_case"
        };

        String[] methodsExercises = {
            "Create isPrime method",
            "Create method to calculate GCD",
            "Create method to check palindrome number",
            "Create method to count digits",
            "Create method to reverse a number",
            "Create power method (base^exponent)",
            "Create method to find LCM",
            "Create fibonacci method",
            "Create method to check Armstrong number",
            "Create method to sum digits",
            "Create method to check perfect number",
            "Create binary search method",
            "Create method to find factorial",
            "Create method to check leap year",
            "Create method swap two variables"
        };

        // SQL exercise varieties per topic
        // TypeScript exercise varieties per topic
        String[] tsTypeBasicsExercises = {
            "Annotate variables with correct types",
            "Fix type errors in variable declarations",
            "Use type assertion to fix assignment",
            "Declare typed constants",
            "Create typed function parameters",
            "Use literal types for status values",
            "Type a variable that can be string or number",
            "Fix implicit any errors",
            "Use typeof to narrow types",
            "Annotate return type of a function"
        };
        String[] tsUnionTypesExercises = {
            "Create union type for shape kinds",
            "Narrow union with typeof check",
            "Handle string | number parameter",
            "Create discriminated union for events",
            "Use union type for API response",
            "Narrow union with in operator",
            "Create type guard function",
            "Handle null | undefined with narrowing",
            "Union type for config options",
            "Use exhaustive switch on union"
        };
        String[] tsFunctionsExercises = {
            "Write typed arrow function",
            "Create function with optional parameters",
            "Write function with default values",
            "Create overloaded function signatures",
            "Write generic identity function",
            "Create callback-typed parameter",
            "Write rest parameter function",
            "Create function returning union type",
            "Write higher-order function with types",
            "Create typed predicate function"
        };
        String[] tsArraysExercises = {
            "Filter array with type predicate",
            "Map array to different type",
            "Reduce array to compute total",
            "Sort typed array of objects",
            "Find element in typed array",
            "Create readonly array",
            "Use tuple type for coordinates",
            "Flatten nested typed arrays",
            "Group array elements by property",
            "Remove duplicates from typed array"
        };
        String[] tsObjectsExercises = {
            "Define interface for user object",
            "Use optional properties in interface",
            "Create nested object type",
            "Use index signature for dynamic keys",
            "Merge two typed objects with spread",
            "Pick specific properties from type",
            "Create readonly object type",
            "Use Record utility type",
            "Define type for API response object",
            "Create mapped type from interface"
        };
        String[] tsAsyncExercises = {
            "Write async function with return type",
            "Handle Promise rejection with try/catch",
            "Use Promise.all with typed results",
            "Create typed async fetch wrapper",
            "Write async generator function",
            "Chain multiple async operations",
            "Use Promise.race with timeout",
            "Create async retry function",
            "Handle multiple error types in async",
            "Convert callback to async/await"
        };

        String[] sqlSelectExercises = {
            "Select all users from a specific city",
            "Select users older than a threshold",
            "Select products under a price",
            "Select user names and emails",
            "Select orders for a specific product",
            "Count total number of users",
            "Find the most expensive product",
            "Select users with email containing keyword",
            "Find average user age",
            "Select distinct cities from users"
        };
        String[] sqlWhereExercises = {
            "Find users in Tokyo older than 25",
            "Find orders with amount > 500",
            "Find products with stock < 100",
            "Find users whose name starts with a letter",
            "Find orders between two dates",
            "Find products in a price range",
            "Find users NOT in a city",
            "Find orders where amount is above average",
            "Find products with stock above threshold AND price below limit",
            "Find users with age BETWEEN two values"
        };
        String[] sqlJoinExercises = {
            "Show user names with their order products",
            "Find users who placed orders",
            "Join orders with product prices",
            "Find users with no orders (LEFT JOIN)",
            "Show order details with user names and product prices",
            "Find users who bought a specific product",
            "Count orders per user using JOIN",
            "Find total spending per user",
            "Show products ordered by each city",
            "Find users who ordered the most expensive product"
        };
        String[] sqlGroupByExercises = {
            "Count users per city",
            "Find total order amount per user",
            "Average product price per category",
            "Count orders per product",
            "Find city with most users",
            "Sum order amounts per month",
            "Find maximum order amount per user",
            "Count products per price range",
            "Average age per city",
            "Find products ordered more than once"
        };
        String[] sqlOrderByExercises = {
            "Sort users by age descending",
            "Sort products by price ascending",
            "Sort orders by date newest first",
            "Sort users alphabetically by name",
            "Top 3 most expensive orders",
            "Sort products by stock descending, then price",
            "Find youngest user in each city (ORDER + GROUP)",
            "Sort users by city then by name",
            "Last 3 orders by date",
            "Sort products by name length"
        };
        String[] sqlInsertUpdateExercises = {
            "Insert a new user record",
            "Update user email by name",
            "Delete orders below a threshold",
            "Insert a new product",
            "Update stock for a specific product",
            "Delete a user by id",
            "Update all prices by percentage increase",
            "Insert multiple orders for a user",
            "Update city for users matching condition",
            "Delete products with zero stock"
        };

        // Pick random exercise type for variety
        java.util.Random rand = new java.util.Random();
        String exerciseType = "";
        String[] exerciseList = null;

        if (topic.equalsIgnoreCase("Array")) exerciseList = arrayExercises;
        else if (topic.equalsIgnoreCase("ArrayList")) exerciseList = arrayListExercises;
        else if (topic.equalsIgnoreCase("HashMap")) exerciseList = hashMapExercises;
        else if (topic.equalsIgnoreCase("HashSet")) exerciseList = hashSetExercises;
        else if (topic.equalsIgnoreCase("String")) exerciseList = stringExercises;
        else if (topic.equalsIgnoreCase("Methods")) exerciseList = methodsExercises;
        // TypeScript topics
        else if (topic.equalsIgnoreCase("Type Basics")) exerciseList = tsTypeBasicsExercises;
        else if (topic.equalsIgnoreCase("Union Types")) exerciseList = tsUnionTypesExercises;
        else if (topic.equalsIgnoreCase("Functions")) exerciseList = tsFunctionsExercises;
        else if (topic.equalsIgnoreCase("Arrays")) exerciseList = tsArraysExercises;
        else if (topic.equalsIgnoreCase("Objects")) exerciseList = tsObjectsExercises;
        else if (topic.equalsIgnoreCase("Async/Await")) exerciseList = tsAsyncExercises;
        // SQL topics
        else if (topic.equalsIgnoreCase("SELECT Basics")) exerciseList = sqlSelectExercises;
        else if (topic.equalsIgnoreCase("WHERE")) exerciseList = sqlWhereExercises;
        else if (topic.equalsIgnoreCase("JOIN Basics")) exerciseList = sqlJoinExercises;
        else if (topic.equalsIgnoreCase("GROUP BY")) exerciseList = sqlGroupByExercises;
        else if (topic.equalsIgnoreCase("ORDER BY")) exerciseList = sqlOrderByExercises;
        else if (topic.equalsIgnoreCase("INSERT/UPDATE")) exerciseList = sqlInsertUpdateExercises;

        if (exerciseList != null && exerciseList.length > 0) {
            exerciseType = exerciseList[rand.nextInt(exerciseList.length)];
        }

        // Always use AI generation
        String prompt;
        String text;
        String code;

        // SQL schema for prompts
        String sqlSchema =
            "DATABASE SCHEMA (SQLite) — use ONLY these exact column names:\n\n" +
            "TABLE users — columns: id, name, email, age, city\n" +
            "  (id INTEGER PRIMARY KEY, name TEXT, email TEXT, age INTEGER, city TEXT)\n" +
            "  Data: (1,'Alice','alice@mail.com',25,'Tokyo'), (2,'Bob','bob@mail.com',30,'Osaka'),\n" +
            "        (3,'Charlie','charlie@mail.com',22,'Tokyo'), (4,'Diana','diana@mail.com',28,'Kyoto'),\n" +
            "        (5,'Eve','eve@mail.com',35,'Osaka')\n\n" +
            "TABLE orders — columns: id, user_id, product, amount, order_date\n" +
            "  (id INTEGER PRIMARY KEY, user_id INTEGER FK->users.id, product TEXT, amount REAL, order_date TEXT)\n" +
            "  WARNING: The column is 'id' NOT 'order_id'. The column is 'user_id' NOT 'uid'.\n" +
            "  Data: (1,1,'Laptop',1200,'2024-01-15'), (2,1,'Mouse',25,'2024-01-16'),\n" +
            "        (3,2,'Keyboard',75,'2024-01-17'), (4,3,'Monitor',300,'2024-01-18'),\n" +
            "        (5,2,'Laptop',1200,'2024-01-19'), (6,4,'Headphones',150,'2024-01-20')\n\n" +
            "TABLE products — columns: id, name, price, category, stock\n" +
            "  (id INTEGER PRIMARY KEY, name TEXT, price REAL, category TEXT, stock INTEGER)\n" +
            "  Data: (1,'Laptop',1200,'Electronics',50), (2,'Mouse',25,'Electronics',200),\n" +
            "        (3,'Keyboard',75,'Electronics',150), (4,'Monitor',300,'Electronics',80),\n" +
            "        (5,'Headphones',150,'Electronics',120)\n\n" +
            "CRITICAL: Do NOT invent column names. Use ONLY the exact column names listed above.\n";

        if (isSimilarRequest && lang.equalsIgnoreCase("SQL")) {
            prompt =
                Ai.getLangPrefix() +
                "Create a SIMILAR SQL exercise to: " + similarTask + "\n" +
                "Topic: " + topic + ", Level " + level + ".\n" +
                "Use the SAME tables but ask a DIFFERENT question.\n\n" +
                sqlSchema + "\n" +
                "Mark solution lines with >>>.\n" +
                "Format: TITLE: / TASK: / ```sql...``` / OUTPUT: / HINT: / TEST_CASES:\n" +
                "CRITICAL: Give a SQL comment with the task, then >>> the solution query.\n" +
                "The student must write the SQL query themselves.\n" +
                "OUTPUT must show the EXACT result of running the query against the data above.\n" +
                "TEST_CASES: Generate 3-5 test cases. Format: - Check Name | exact value from output\n" +
                Ai.getLangInstruction();
        } else if (isSimilarRequest && lang.equalsIgnoreCase("TypeScript")) {
            prompt =
                Ai.getLangPrefix() +
                "Create a SIMILAR TypeScript exercise to: " + similarTask + "\n" +
                "Use DIFFERENT data theme and DIFFERENT values! Topic: " + topic + ", Level " + level + ".\n" +
                "If original used movies, use something else (products, recipes, scores, etc.).\n" +
                "Write pure TypeScript code (NO classes, NO imports unless needed). Use console.log() for output.\n" +
                "Mark solution lines with >>>.\n" +
                "Format: TITLE: / TASK: / ```typescript...``` / OUTPUT: / HINT: / TEST_CASES:\n" +
                "CRITICAL: Give ONLY raw data + console.log. Student writes ALL logic.\n" +
                "TEST_CASES: Format: - declaration1; declaration2 -> expected_output (use SAME var names, DIFFERENT values)\n" +
                Ai.getLangInstruction();
        } else if (isSimilarRequest) {
            // Similar practice - same type, different values (Java)
            prompt =
                Ai.getLangPrefix() +
                "Create a SIMILAR exercise to: " + similarTask + "\n" +
                "Use DIFFERENT data theme and DIFFERENT numbers! Topic: " + topic + ", Level " + level + ".\n" +
                "If original used songs, use something else (movies, products, recipes, etc.).\n" +
                "Class: Practice, NO Scanner.\n" +
                "Mark solution lines with >>>.\n" +
                "Format: TITLE: / TASK: / ```java...``` / OUTPUT: / HINT: / TEST_CASES:\n" +
                "CRITICAL: Give ONLY raw data + print. Student writes ALL logic (loops, variables, conditions).\n" +
                "TEST_CASES: Format: - declaration1; declaration2 -> expected_output (use SAME var names, DIFFERENT values)\n" +
                Ai.getLangInstruction();
        } else if (lang.equalsIgnoreCase("SQL")) {
            String exerciseInstruction = exerciseType.isEmpty() ? "" :
                "\n\nSPECIFIC EXERCISE: " + exerciseType + "\n" +
                "(Create an exercise based on this concept.)\n";
            String topicRules = getTopicRules(lang, topic);

            prompt =
                Ai.getLangPrefix() +
                "Create a SQL exercise about " + topic + ". Level " + level + "/" + difficulty + ".\n" +
                levelRules + "\n" +
                exerciseInstruction + "\n" +
                topicRules + "\n" +
                sqlSchema + "\n" +
                "RULES:\n" +
                "- Use ONLY the tables and data shown above (SQLite syntax)\n" +
                "- Mark EVERY solution line with >>> prefix (these lines will be removed)\n" +
                "- The student sees only a comment describing the task and must write the query\n" +
                "- VERIFY: Calculate the exact output by running the query mentally against the data\n\n" +
                "Format:\n" +
                "TITLE: short descriptive title\n" +
                "TASK: what SQL query to write (be specific about expected columns and conditions)\n" +
                "CALCULATION: (step-by-step: which rows match, what the output should be)\n" +
                "```sql\n-- Task: [description]\n-- Write your SQL query below\n>>> SELECT ... FROM ... WHERE ...;\n```\n" +
                "CRITICAL CODE BLOCK RULES:\n" +
                "- The code block MUST contain ONLY SQL code (comments + query). NEVER plain text, output rows, or column values.\n" +
                "- WRONG: ```sql\\nKeyboard | 75\\nHeadphones | 150\\n``` (this is OUTPUT, not SQL code!)\n" +
                "- RIGHT: ```sql\\n-- Task: ...\\n-- Write your SQL query below\\n>>> SELECT name, price FROM products WHERE ...;\\n```\n" +
                "The code block is the STARTER CODE the student sees — it should have:\n" +
                "  1. A comment describing the task (non->>> line)\n" +
                "  2. The solution query marked with >>> (will be removed for student)\n" +
                "  3. The placeholder '-- YOUR CODE HERE' as a non->>> line so student knows where to write\n" +
                "Example:\n" +
                "```sql\n-- Task: Find users older than 25\n-- Write your SQL query below\n        // YOUR CODE HERE\n        \n        \n```\n" +
                "And the solution lines (marked >>>) go BETWEEN the comment and YOUR CODE HERE.\n\n" +
                "OUTPUT: exact expected output (column | column format, one row per line)\n" +
                "HINT: one SQL hint\n" +
                "TEST_CASES:\n" +
                "- Check Name | exact value that must appear in output\n" +
                "IMPORTANT: Each test case output MUST be an EXACT substring from the OUTPUT above.\n" +
                "Example: if OUTPUT is 'Alice | 95\\nBob | 87', test cases should be:\n" +
                "- Top student | Alice | 95\n" +
                "- Second student | Bob | 87\n" +
                "- Has 2 rows | (just check a value from each row)\n" +
                "(Generate 3-5 test cases. Each value must appear verbatim in the actual output.)\n" +
                Ai.getLangInstruction() + "\n" +
                historyNote.toString();
        } else if (lang.equalsIgnoreCase("TypeScript")) {
            String exerciseInstruction = exerciseType.isEmpty() ? "" :
                "\n\nSPECIFIC EXERCISE: " + exerciseType + "\n" +
                "(Create an exercise based on this concept. Be creative with the data values!)\n";
            String topicRules = getTopicRules(lang, topic);

            prompt =
                Ai.getLangPrefix() +
                "Create a TypeScript exercise about " + topic + ". Level " + level + "/" + difficulty + ".\n" +
                levelRules + "\n" +
                exerciseInstruction + "\n" +
                topicRules + "\n" +
                "RULES:\n" +
                "- Write pure TypeScript code — NO classes wrapping everything, just top-level code\n" +
                "- Use console.log() for output (NOT System.out.println)\n" +
                "- Use TypeScript type annotations where appropriate\n" +
                "- NO external imports unless needed for the topic\n" +
                "- Hardcode all data — NO user input (no readline, no prompt)\n" +
                "- Mark EVERY solution line with >>> prefix (these lines will be removed)\n" +
                "- CRITICAL: The student must write ALL logic themselves. Give ONLY:\n" +
                "  1. Raw typed data (arrays, objects, variables with type annotations)\n" +
                "  2. The final console.log() at the end\n" +
                "- NEVER give: loops, if-statements, helper variables, method calls, or any logic\n" +
                "- BAD: giving 'const filtered = arr.filter(x => x > 5);' — student must write the logic\n" +
                "- BAD: giving 'for (const item of items)' — student must write the loop\n" +
                "- GOOD: give typed data + empty space with >>> solution lines + console.log\n" +
                "- SOLUTION COMPLETENESS: The >>> solution lines MUST contain REAL working code (loops, conditions, function calls, assignments) that produces the expected output. NEVER leave >>> lines as:\n" +
                "  - TODO comments like '// write ONE line that uses...'\n" +
                "  - Numbered step comments like '// 1️⃣ Loop over each item'\n" +
                "  - Empty lines or placeholder text\n" +
                "  The solution is what the student sees when they click 'Show Solution' — it MUST be complete, correct, runnable code.\n\n" +
                "USE CREATIVE REAL-WORLD DATA (pick one randomly):\n" +
                "- Stock prices, calories, temperatures, exam scores, player stats\n" +
                "- Movie ratings, product prices, recipe ingredients, workout reps\n" +
                "- Travel distances, game scores, employee salaries, age data\n" +
                "DO NOT use boring data like [1,2,3,4,5]. Make it interesting!\n\n" +
                "UNIQUENESS: Use a DIFFERENT data theme and exercise concept each time.\n" +
                "Be creative!\n\n" +
                "VERIFY YOUR MATH (internal only, don't show to user):\n" +
                "- Calculate the answer step by step before writing OUTPUT\n" +
                "- The OUTPUT MUST be mathematically correct for the given data\n\n" +
                "Format:\n" +
                "TITLE: creative short title\n" +
                "TASK: what to do (use real-world context)\n" +
                "CALCULATION: (your step-by-step calculation - will be hidden from user)\n" +
                "```typescript\n// typed data here\nconst data: number[] = [...];\nlet result: number = 0; // default — student overwrites this\n\n>>>  // student writes logic here to compute result\n\nconsole.log(result);\n```\n" +
                "CODE BLOCK INTEGRITY: The ```typescript code block MUST contain ONLY valid TypeScript code.\n" +
                "- First line must be a valid TS statement (const/let/type/interface/function) — NEVER plain text or format descriptions.\n" +
                "- NEVER put expected output format strings like 'Player <name> total: <score>' as code lines.\n" +
                "- NEVER put template descriptions like 'Team <teamId> members: ...' as code.\n" +
                "- If the TASK describes an output format, put that description in TASK only, not in the code block.\n" +
                "- The code block must be a COMPLETE, RUNNABLE TypeScript file.\n\n" +
                "IMPORTANT: The variable in console.log() MUST be named 'result' and declared BEFORE >>> lines.\n" +
                "Use the correct type: let result: number = 0; or let result: string = \"\"; etc.\n" +
                "The >>> solution lines MUST ASSIGN to 'result' (e.g. result = ...; or result += ...;), NOT declare a new variable.\n" +
                "BAD: >>> const answer = 5; (creates new variable, 'result' stays 0)\n" +
                "GOOD: >>> result = 5; (assigns to the pre-declared 'result')\n\n" +
                "OUTPUT: exact expected output\n" +
                "HINT: one hint\n" +
                "TEST_CASES:\n" +
                "Each test case provides DIFFERENT input data and expected output.\n" +
                "Format: - declaration1; declaration2 -> expected_output\n" +
                "Use the SAME variable names as in the code, but with DIFFERENT values.\n" +
                "IMPORTANT: Calculate the correct expected_output for each test case!\n" +
                "expected_output MUST be a concrete value (number, string, boolean) — NEVER descriptive text.\n" +
                "The expected_output is what console.log would print for that input.\n" +
                "Example: if code has 'const prices: number[] = [10, 20, 30]' and task is sum:\n" +
                "- const prices: number[] = [5, 15, 25] -> 45\n" +
                "- const prices: number[] = [100] -> 100\n" +
                "- const prices: number[] = [0, 0, 0] -> 0\n" +
                "Generate 3 test cases with DIFFERENT values. Keep same variable count and types.\n" +
                Ai.getLangInstruction() + "\n" +
                historyNote.toString();
        } else {
            // Java prompt
            String exerciseInstruction = exerciseType.isEmpty() ? "" :
                "\n\nSPECIFIC EXERCISE: " + exerciseType + "\n" +
                "(Create an exercise based on this concept. Be creative with the data values!)\n";
            String topicRules = getTopicRules(lang, topic);

            prompt =
                Ai.getLangPrefix() +
                "Create a " + lang + " exercise about " + topic + ". Level " + level + "/" + difficulty + ".\n" +
                levelRules + "\n" +
                exerciseInstruction + "\n" +
                topicRules + "\n" +
                "RULES:\n" +
                "- Class: Practice\n" +
                "- NO Scanner - hardcode data\n" +
                "- Mark EVERY solution line with >>> prefix (these lines will be removed)\n" +
                "- CRITICAL: The student must write ALL logic themselves. Give ONLY:\n" +
                "  1. Raw data (the array/list/map with values)\n" +
                "  2. A result variable with a default value (so the code COMPILES without the solution)\n" +
                "  3. The final System.out.println() at the end\n" +
                "- NEVER give: loops, if-statements, split(), method calls, or any logic\n" +
                "- COMPILATION RULE: The code MUST compile even when >>> lines are removed!\n" +
                "  This means System.out.println() must ONLY reference variables declared OUTSIDE >>> lines.\n" +
                "- SOLUTION COMPLETENESS: The >>> solution lines MUST contain REAL working code (loops, conditions, method calls, assignments) that produces the expected output. NEVER leave >>> lines as:\n" +
                "  - TODO comments like '// write ONE line that uses...'\n" +
                "  - Numbered step comments like '// 1. Loop over each item'\n" +
                "  - Empty lines or placeholder text\n" +
                "  The solution is what the student sees when they click 'Show Solution' — it MUST be complete, correct, runnable code.\n" +
                "- BAD: giving 'String[] cityArray = cities.split(\" \");' — student must figure this out\n" +
                "- BAD: giving 'for (int i = ...)' — student must write the loop\n" +
                "- GOOD: give data + result variable with default + >>> solution lines + print statement\n\n" +
                "USE CREATIVE REAL-WORLD DATA (pick one randomly):\n" +
                "- Stock prices, calories, temperatures, exam scores, player stats\n" +
                "- Movie ratings, product prices, recipe ingredients, workout reps\n" +
                "- Travel distances, game scores, employee salaries, age data\n" +
                "- Song durations, battery levels, speed readings, weight measurements\n" +
                "DO NOT use boring data like {1,2,3,4,5}. Make it interesting!\n\n" +
                "UNIQUENESS: Use a DIFFERENT data theme and exercise concept each time.\n" +
                "Do NOT repeat song/city/student patterns. Be creative!\n\n" +
                "VERIFY YOUR MATH (internal only, don't show to user):\n" +
                "- Calculate the answer step by step before writing OUTPUT\n" +
                "- The OUTPUT MUST be mathematically correct for the given data\n\n" +
                "Format:\n" +
                "TITLE: creative short title\n" +
                "TASK: what to do (use real-world context)\n" +
                "CALCULATION: (your step-by-step calculation - will be hidden from user)\n" +
                "```java\npublic class Practice {\n    public static void main(String[] args) {\n        // data here (array, list, map, etc.)\n        int result = 0; // default — student overwrites this\n>>>     // student writes logic here to compute result\n        System.out.println(result);\n    }\n}\n```\n" +
                "CODE BLOCK INTEGRITY: The ```java code block MUST contain ONLY valid Java code.\n" +
                "- First line must be 'public class Practice' or an import — NEVER plain text or format descriptions.\n" +
                "- NEVER put expected output format strings as code lines.\n" +
                "- The code block must be a COMPLETE, COMPILABLE Java file.\n\n" +
                "IMPORTANT: The variable in System.out.println() MUST be named 'result' and declared BEFORE >>> lines.\n" +
                "Use the correct type: int result = 0; or String result = \"\"; or boolean result = false; etc.\n" +
                "The >>> solution lines MUST ASSIGN to 'result' (e.g. result = ...; or result += ...;), NOT declare a new variable.\n" +
                "BAD: >>> int answer = 5; (creates new variable, 'result' stays 0)\n" +
                "GOOD: >>> result = 5; (assigns to the pre-declared 'result')\n\n" +
                "OUTPUT: exact expected output\n" +
                "HINT: one hint\n" +
                "TEST_CASES:\n" +
                "Each test case provides DIFFERENT input data and expected output.\n" +
                "Format: - declaration1; declaration2 -> expected_output\n" +
                "Use the SAME variable names as in the code, but with DIFFERENT values.\n" +
                "IMPORTANT: Calculate the correct expected_output for each test case!\n" +
                "expected_output MUST be a concrete value (number, string, boolean) — NEVER descriptive text.\n" +
                "The expected_output is what System.out.println would print for that input.\n" +
                "Example: if code has 'int[] nums = {1,2,3}' and task is find sum:\n" +
                "- int[] nums = {10, 20, 30} -> 60\n" +
                "- int[] nums = {5} -> 5\n" +
                "- int[] nums = {0, -1, 1} -> 0\n" +
                "Generate 3 test cases with DIFFERENT values. Keep same variable count and types.\n" +
                Ai.getLangInstruction() + "\n" +
                historyNote.toString();
        }

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
        text = Ai.extractContent(raw);
        // Strip markdown bold from labels: **TITLE:** → TITLE:
        text = text.replaceAll("\\*\\*([A-Z_]+):\\*\\*", "$1:");
        text = text.replaceAll("\\*\\*([A-Z_]+):", "$1:");
        code = Extract.firstCodeBlock(text);
        if (code == null) code = "// NO_CODE_BLOCK_FOUND\n";

        // Get solution code (before removing >>> markers) for verification
        String solutionCode = code.replace(">>>", "").replace(">>> ", "");
        solutionCode = fixCommonMistakes(solutionCode, lang);

        // Verify expected output by actually running the solution (Java only)
        String actualOutput = "";
        if (lang.equalsIgnoreCase("Java") && !solutionCode.contains("NO_CODE_BLOCK_FOUND")) {
            actualOutput = runAndCaptureOutput(solutionCode);
        }

        // Remove >>> marked lines and replace with placeholder
        code = removeMarkedLines(code);

        // Post-process: fix common AI mistakes
        code = fixCommonMistakes(code, lang);

        // JSON output - include actualOutput and solutionCode for verification
        String json =
            "{"
          + "\"filename\":" + Json.quote(filename) + ","
          + "\"content\":" + Json.quote(code) + ","
          + "\"meta\":" + Json.quote(text) + ","
          + "\"actualOutput\":" + Json.quote(actualOutput) + ","
          + "\"solutionCode\":" + Json.quote(solutionCode)
          + "}";

        System.out.println(json);
    }

    // Compile and run Java code, return the output
    private static String runAndCaptureOutput(String javaCode) {
        try {
            // Create temp directory
            java.nio.file.Path tempDir = java.nio.file.Files.createTempDirectory("codeteacher");
            java.nio.file.Path javaFile = tempDir.resolve("Practice.java");

            // Write code to file
            java.nio.file.Files.writeString(javaFile, javaCode);

            // Compile
            ProcessBuilder compileBuilder = new ProcessBuilder("javac", "-encoding", "UTF-8", "Practice.java");
            compileBuilder.directory(tempDir.toFile());
            compileBuilder.redirectErrorStream(true);
            Process compileProcess = compileBuilder.start();

            compileProcess.getInputStream().readAllBytes();
            int compileExit = compileProcess.waitFor();

            if (compileExit != 0) {
                // Cleanup
                deleteDirectory(tempDir.toFile());
                return "";
            }

            // Run
            ProcessBuilder runBuilder = new ProcessBuilder("java", "Practice");
            runBuilder.directory(tempDir.toFile());
            runBuilder.redirectErrorStream(true);
            Process runProcess = runBuilder.start();

            // Timeout after 5 seconds
            boolean finished = runProcess.waitFor(5, java.util.concurrent.TimeUnit.SECONDS);
            if (!finished) {
                runProcess.destroyForcibly();
                deleteDirectory(tempDir.toFile());
                return "";
            }

            String output = new String(runProcess.getInputStream().readAllBytes()).trim();

            // Cleanup
            deleteDirectory(tempDir.toFile());

            return output;
        } catch (Exception e) {
            return "";
        }
    }

    private static void deleteDirectory(java.io.File dir) {
        java.io.File[] files = dir.listFiles();
        if (files != null) {
            for (java.io.File f : files) {
                if (f.isDirectory()) {
                    deleteDirectory(f);
                } else {
                    f.delete();
                }
            }
        }
        dir.delete();
    }

    // ── Per-language per-topic prompt rules ─────────────────────────────
    private static String getTopicRules(String lang, String topic) {
        if (lang.equalsIgnoreCase("Java")) {
            return getJavaTopicRules(topic);
        } else if (lang.equalsIgnoreCase("TypeScript")) {
            return getTsTopicRules(topic);
        } else if (lang.equalsIgnoreCase("SQL")) {
            return getSqlTopicRules(topic);
        }
        return "";
    }

    // ── Java topic rules ────────────────────────────────────────────────
    private static String getJavaTopicRules(String topic) {
        switch (topic) {
            case "Array":
                return "\nTOPIC-SPECIFIC RULES (Array):\n" +
                    "- Give a raw int[] or double[] array with real-world data\n" +
                    "- VARY the theme each time! Pick randomly from: exam scores, product prices, distances, ages, heights, weights, salaries, game scores, ratings, speeds, calories, steps, population, votes, timestamps\n" +
                    "- DO NOT always use temperatures or stock prices — be creative!\n" +
                    "- Student writes loops, conditions, and logic to compute a NUMERIC result\n" +
                    "- OUTPUT must be a concrete computed value (a number, a word, true/false)\n" +
                    "- Example structure:\n" +
                    "  int[] scores = {85, 92, 78, 64, 97};\n" +
                    "  >>> int max = scores[0];\n" +
                    "  >>> for (int s : scores) if (s > max) max = s;\n" +
                    "  System.out.println(max); // OUTPUT: 97\n";

            case "ArrayList":
                return "\nTOPIC-SPECIFIC RULES (ArrayList):\n" +
                    "- Give a pre-filled ArrayList<Integer> or ArrayList<String> with real data\n" +
                    "- Student writes add/remove/get/set/contains operations or iteration logic\n" +
                    "- Import java.util.ArrayList at the top\n" +
                    "- OUTPUT must be a concrete value (number, string, list contents)\n" +
                    "- Example structure:\n" +
                    "  ArrayList<Integer> scores = new ArrayList<>(Arrays.asList(85, 92, 78, 95));\n" +
                    "  >>> scores.removeIf(s -> s < 80);\n" +
                    "  System.out.println(scores); // OUTPUT: [85, 92, 95]\n";

            case "HashMap":
                return "\nTOPIC-SPECIFIC RULES (HashMap):\n" +
                    "- Give a pre-filled HashMap<String, Integer> or similar with real data\n" +
                    "- Student writes put/get/containsKey/iterate/entrySet logic\n" +
                    "- Import java.util.HashMap at the top\n" +
                    "- OUTPUT must be a concrete value — a count, a sum, a boolean, or a specific get() result\n" +
                    "- CRITICAL: HashMap iteration order is NOT guaranteed! Design tasks so the OUTPUT does NOT depend on iteration order.\n" +
                    "  GOOD outputs: a sum of all values, a count, a boolean (containsKey), a specific get(key) result, the size()\n" +
                    "  BAD outputs: 'first key found', 'first entry matching X' — these depend on iteration order and will be non-deterministic!\n" +
                    "  If you MUST iterate and pick an item, use a DETERMINISTIC criterion (e.g. max value, min key alphabetically)\n" +
                    "- Example structure:\n" +
                    "  HashMap<String, Integer> ages = new HashMap<>();\n" +
                    "  ages.put(\"Alice\", 25); ages.put(\"Bob\", 30);\n" +
                    "  >>> int total = 0;\n" +
                    "  >>> for (int v : ages.values()) total += v;\n" +
                    "  System.out.println(total); // OUTPUT: 55\n";

            case "HashSet":
                return "\nTOPIC-SPECIFIC RULES (HashSet):\n" +
                    "- Give arrays or lists as raw data for the student to convert/process with HashSet\n" +
                    "- Student writes add/contains/remove/retainAll/removeAll set operations\n" +
                    "- Import java.util.HashSet at the top\n" +
                    "- OUTPUT must be a concrete value — a count, boolean, or set contents\n" +
                    "- Example structure:\n" +
                    "  int[] a = {1,2,3,4}; int[] b = {3,4,5,6};\n" +
                    "  >>> HashSet<Integer> set = new HashSet<>();\n" +
                    "  >>> for (int x : a) set.add(x);\n" +
                    "  >>> int count = 0; for (int x : b) if (set.contains(x)) count++;\n" +
                    "  System.out.println(count); // OUTPUT: 2\n";

            case "String":
                return "\nTOPIC-SPECIFIC RULES (String):\n" +
                    "- Give a String variable with real-world text (names, sentences, codes)\n" +
                    "- Student writes charAt/substring/split/replace/indexOf/length operations\n" +
                    "- OUTPUT must be a concrete value — a count, modified string, boolean\n" +
                    "- Example structure:\n" +
                    "  String sentence = \"hello world hello java\";\n" +
                    "  >>> int count = 0;\n" +
                    "  >>> for (String w : sentence.split(\" \")) if (w.equals(\"hello\")) count++;\n" +
                    "  System.out.println(count); // OUTPUT: 2\n";

            case "Methods":
                return "\nTOPIC-SPECIFIC RULES (Methods):\n" +
                    "- Student must DEFINE a static method AND call it from main\n" +
                    "- Give the method signature hint (outside >>> lines so it compiles), student writes the body\n" +
                    "- Method should take parameters and return a value\n" +
                    "- OUTPUT must be the method's computed return value\n" +
                    "- CRITICAL: The solution MUST use a REAL algorithm with loops/conditions — NEVER hardcode return values!\n" +
                    "  BAD: return n == 2 || n == 3 || n == 5; (hardcoded list)\n" +
                    "  GOOD: for (int i = 2; i <= Math.sqrt(n); i++) if (n % i == 0) return false; (real algorithm)\n" +
                    "- CRITICAL: The starter code must have MATCHING BRACES. The method signature + opening/closing braces must be in non->>> lines.\n" +
                    "  Give the method stub with braces, student fills in the body:\n" +
                    "  static int factorial(int n) {\n" +
                    "  >>>     if (n <= 1) return 1;\n" +
                    "  >>>     return n * factorial(n - 1);\n" +
                    "  }\n" +
                    "  The { and } lines are NOT marked with >>> so the code compiles even without solution lines.\n" +
                    "- CRITICAL: Use a RESULT VARIABLE pattern for ALL return types, NEVER a bare return:\n" +
                    "  WRONG (causes unreachable statement for ANY return type!):\n" +
                    "    static int search(...) { return -1; >>> return Arrays.binarySearch(...); } // TWO RETURNS = UNREACHABLE!\n" +
                    "    static boolean check(...) { return false; >>> return x > 0; } // TWO RETURNS = UNREACHABLE!\n" +
                    "    static String format(...) { return \"\"; >>> return x.toUpperCase(); } // TWO RETURNS = UNREACHABLE!\n" +
                    "  RIGHT (uses result variable — works for ALL types):\n" +
                    "    static int search(...) { int ans = -1; >>> ans = Arrays.binarySearch(...); return ans; }\n" +
                    "    static boolean check(...) { boolean ans = false; >>> ans = x > 0; return ans; }\n" +
                    "    static String format(...) { String ans = \"\"; >>> ans = x.toUpperCase(); return ans; }\n" +
                    "  RULE: TYPE ans = DEFAULT; >>> ans = COMPUTATION; return ans;\n" +
                    "  NEVER: return DEFAULT; >>> return COMPUTATION; (compiler error for int, boolean, String, double, ANY type)\n" +
                    "- Example structure:\n" +
                    "  static int factorial(int n) {\n" +
                    "      int ans = 1; // default — compiles without solution\n" +
                    "  >>>     for (int i = 2; i <= n; i++) ans *= i;\n" +
                    "      return ans;\n" +
                    "  }\n" +
                    "  // in main:\n" +
                    "  System.out.println(factorial(5)); // OUTPUT: 120\n";

            default:
                return "";
        }
    }

    // ── TypeScript topic rules ──────────────────────────────────────────
    private static String getTsTopicRules(String topic) {
        switch (topic) {
            case "Type Basics":
                return "\nTOPIC-SPECIFIC RULES (Type Basics):\n" +
                    "- Focus on TypeScript type annotations: number, string, boolean, arrays, tuples\n" +
                    "- Give typed variables with real data, student writes logic using them\n" +
                    "- CRITICAL: OUTPUT must be a COMPUTED VALUE (number, string, boolean) — NEVER a type name!\n" +
                    "- BAD output: 'number | string', 'string[]', 'boolean' as literal text\n" +
                    "- GOOD output: '42', 'hello world', 'true', '3.14'\n" +
                    "- CRITICAL CODE BLOCK RULES:\n" +
                    "  1. The ```typescript code block MUST start with valid TS code (const/let/type/interface) — NEVER with plain text or format descriptions.\n" +
                    "  2. WRONG: 'Avg passed score: <average>' or 'Average: <average>, Pass Rate: <percentage>%' as code — these are NOT valid TypeScript!\n" +
                    "  3. RIGHT: 'const scores: number[] = [85, 92, 78];\\nlet result: string = \"\";\\n>>> ...\\nconsole.log(result);'\n" +
                    "  4. If the TASK describes an output format like 'Average: X', put that in TASK only. The code block must be RUNNABLE TypeScript.\n" +
                    "- Example structure:\n" +
                    "  const prices: number[] = [29.99, 49.99, 19.99];\n" +
                    "  const taxRate: number = 0.08;\n" +
                    "  >>> let total: number = 0;\n" +
                    "  >>> for (const p of prices) total += p;\n" +
                    "  >>> total = Math.round(total * (1 + taxRate) * 100) / 100;\n" +
                    "  console.log(total); // OUTPUT: 107.97\n";

            case "Union Types":
                return "\nTOPIC-SPECIFIC RULES (Union Types):\n" +
                    "- Give a union-typed variable (string | number, etc.) with a concrete value\n" +
                    "- Student writes type narrowing (typeof, in, instanceof) to process the value\n" +
                    "- CRITICAL: OUTPUT must be a COMPUTED VALUE from the narrowing logic\n" +
                    "- BAD output: 'string | number', 'narrowed type'\n" +
                    "- GOOD output: 'HELLO', '42.50', 'valid'\n" +
                    "- The solution MUST contain ACTUAL executable code (if/else, typeof checks, etc.) — NEVER just a comment like '// TODO: implement' or '// Write your logic here'\n" +
                    "- NARROWING RULES:\n" +
                    "  - Use `typeof x === 'string'` for string | number unions (PREFERRED — always works)\n" +
                    "  - Use `'prop' in x` ONLY when BOTH sides of the union are OBJECTS (not strings or numbers!)\n" +
                    "  - WRONG: `'sides' in shape` when shape is `'circle' | { sides: number }` — `in` operator crashes on string values!\n" +
                    "  - RIGHT: `typeof shape === 'string'` to narrow string vs object\n" +
                    "- Example structure:\n" +
                    "  const input: string | number = \"hello world\";\n" +
                    "  >>> let result: string;\n" +
                    "  >>> if (typeof input === 'string') { result = input.toUpperCase(); }\n" +
                    "  >>> else { result = (input * 2).toString(); }\n" +
                    "  console.log(result); // OUTPUT: HELLO WORLD\n";

            case "Functions":
                return "\nTOPIC-SPECIFIC RULES (Functions):\n" +
                    "- Student must DEFINE a typed function AND call it\n" +
                    "- Function should have typed parameters and explicit return type\n" +
                    "- OUTPUT must be the function's computed return value\n" +
                    "- Use arrow functions or regular function syntax\n" +
                    "- Example structure:\n" +
                    "  const data: number[] = [10, 20, 30, 40];\n" +
                    "  >>> const average = (nums: number[]): number => {\n" +
                    "  >>>   return nums.reduce((a, b) => a + b, 0) / nums.length;\n" +
                    "  >>> };\n" +
                    "  console.log(average(data)); // OUTPUT: 25\n";

            case "Arrays":
                return "\nTOPIC-SPECIFIC RULES (Arrays):\n" +
                    "- Give a typed array (number[], string[], etc.) with real-world data\n" +
                    "- Student writes array methods: map, filter, reduce, find, sort, etc.\n" +
                    "- OUTPUT must be a concrete computed value\n" +
                    "- Encourage TypeScript-specific patterns (type predicates, generics)\n" +
                    "- Example structure:\n" +
                    "  const temps: number[] = [72, 85, 91, 68, 77, 95];\n" +
                    "  >>> const hot: number[] = temps.filter(t => t > 80);\n" +
                    "  >>> const avg: number = Math.round(hot.reduce((a, b) => a + b, 0) / hot.length);\n" +
                    "  console.log(avg); // OUTPUT: 90\n";

            case "Objects":
                return "\nTOPIC-SPECIFIC RULES (Objects):\n" +
                    "- Define an interface or type, give typed object(s) with real data\n" +
                    "- Student writes property access, spread, destructuring, or Partial/Pick/Record logic\n" +
                    "- OUTPUT must be a concrete computed value from the objects\n" +
                    "- CRITICAL CODE BLOCK RULES:\n" +
                    "  1. The ```typescript code block MUST start with valid TS code (interface/type/const/let/function) — NEVER with plain text, formulas, or format descriptions.\n" +
                    "  2. If the TASK mentions a formula like 'score = (x * 2) + y', do NOT put the formula as a line of code. Instead, put it in the TASK description only.\n" +
                    "  3. The code block must be a complete, runnable TypeScript file with console.log at the end.\n" +
                    "  4. WRONG code block: 'performanceScore = (totalPoints * 2) + ...' (this is not valid TS)\n" +
                    "  5. RIGHT code block: 'interface Player { ... }\\nconst players: Player[] = [...];\\nlet result = 0;\\n>>> ...\\nconsole.log(result);'\n" +
                    "- Example structure:\n" +
                    "  interface Product { name: string; price: number; qty: number; }\n" +
                    "  const items: Product[] = [\n" +
                    "    { name: 'Laptop', price: 999, qty: 2 },\n" +
                    "    { name: 'Mouse', price: 29, qty: 5 }\n" +
                    "  ];\n" +
                    "  >>> const total: number = items.reduce((sum, i) => sum + i.price * i.qty, 0);\n" +
                    "  console.log(total); // OUTPUT: 2143\n";

            case "Async/Await":
                return "\nTOPIC-SPECIFIC RULES (Async/Await):\n" +
                    "- Create mock async functions using Promise or setTimeout\n" +
                    "- Student writes async/await logic to call and process results\n" +
                    "- Use simple patterns: async function, await, try/catch, Promise.all\n" +
                    "- OUTPUT must be a concrete value (resolved promise result)\n" +
                    "- IMPORTANT: Code must actually run and produce output with console.log\n" +
                    "- CRITICAL TIMING RULE: The console.log MUST run AFTER all async operations complete!\n" +
                    "  Two correct patterns:\n" +
                    "  Pattern A — .then() callback: main().then(() => console.log(result));\n" +
                    "  Pattern B — top-level await: await main(); console.log(result);\n" +
                    "  WRONG: main(); console.log(result); — this logs BEFORE the async function finishes!\n" +
                    "  If using setTimeout in mock functions, use very short delays (5-10ms) to avoid test timeouts.\n" +
                    "- Example structure:\n" +
                    "  const fetchPrice = (item: string): Promise<number> =>\n" +
                    "    Promise.resolve(item === 'apple' ? 1.5 : 2.0);\n" +
                    "  >>> const main = async (): Promise<void> => {\n" +
                    "  >>>   const apple = await fetchPrice('apple');\n" +
                    "  >>>   const banana = await fetchPrice('banana');\n" +
                    "  >>>   result = apple + banana;\n" +
                    "  >>> };\n" +
                    "  main().then(() => console.log(result)); // OUTPUT: 3.5\n";

            default:
                return "";
        }
    }

    // ── SQL topic rules ─────────────────────────────────────────────────
    private static String getSqlTopicRules(String topic) {
        switch (topic) {
            case "SELECT Basics":
                return "\nTOPIC-SPECIFIC RULES (SELECT Basics):\n" +
                    "- Use simple SELECT with specific columns or SELECT *\n" +
                    "- May use COUNT(), AVG(), MIN(), MAX() for aggregate queries\n" +
                    "- NO JOINs, NO subqueries, NO GROUP BY\n" +
                    "- OUTPUT format: column_name | column_name (pipe-separated)\n" +
                    "- Calculate the EXACT result from the schema data\n";

            case "WHERE":
                return "\nTOPIC-SPECIFIC RULES (WHERE):\n" +
                    "- Use SELECT with WHERE clause for filtering\n" +
                    "- Practice: =, >, <, >=, <=, BETWEEN, LIKE, IN, AND, OR, NOT\n" +
                    "- NO JOINs in this topic\n" +
                    "- OUTPUT: the filtered rows in column | column format\n" +
                    "- Count the matching rows from the schema data carefully\n" +
                    "- For L3+: Combine multiple WHERE conditions (AND, OR, BETWEEN, LIKE). Use subqueries or CASE WHEN for L4+.\n" +
                    "- For L4+: The query must be multi-line (at least 5 lines of SQL). Use CASE WHEN, multiple conditions, or computed columns.\n";

            case "JOIN Basics":
                return "\nTOPIC-SPECIFIC RULES (JOIN Basics):\n" +
                    "- Use INNER JOIN or LEFT JOIN between 2-3 tables\n" +
                    "- Always specify the ON condition clearly\n" +
                    "- Focus on understanding how tables relate via foreign keys\n" +
                    "- OUTPUT: joined result in column | column format\n" +
                    "- Trace through the data mentally to get exact output\n";

            case "GROUP BY":
                return "\nTOPIC-SPECIFIC RULES (GROUP BY):\n" +
                    "- Use GROUP BY with aggregate functions: COUNT, SUM, AVG, MIN, MAX\n" +
                    "- May include HAVING for filtering groups\n" +
                    "- OUTPUT: grouped result with aggregate values\n" +
                    "- Calculate each group's aggregate value from the schema data\n" +
                    "- REMINDER: The ```sql code block must contain ONLY SQL code (comments + query), NEVER output rows like 'Electronics | 6 | 2950'\n";

            case "ORDER BY":
                return "\nTOPIC-SPECIFIC RULES (ORDER BY):\n" +
                    "- Use ORDER BY with ASC/DESC\n" +
                    "- May combine with LIMIT for top-N queries\n" +
                    "- May use multiple sort columns\n" +
                    "- OUTPUT: sorted rows in correct order\n" +
                    "- Verify the sort order matches the data exactly\n";

            case "INSERT/UPDATE":
                return "\nTOPIC-SPECIFIC RULES (INSERT/UPDATE):\n" +
                    "- Use INSERT INTO, UPDATE SET, or DELETE FROM\n" +
                    "- For INSERT: show the exact row to insert\n" +
                    "- For UPDATE: specify WHERE condition to target specific rows\n" +
                    "- After the modification, add a SELECT to show the result\n" +
                    "- OUTPUT: the SELECT result after the data modification\n";

            default:
                return "";
        }
    }
}
