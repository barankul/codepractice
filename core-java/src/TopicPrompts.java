import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public class TopicPrompts {

    private static final Map<String, String[]> PROMPTS = new HashMap<>();
    private static final Random random = new Random();

    static {
        // ============ ARRAY ============
        PROMPTS.put("Array", new String[]{
            // Level 1 - Tek satir
            "TITLE: Array Element Access\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        int[] numbers = {10, 20, 30, 40, 50};\n" +
            ">>>     int third = numbers[2];\n" +
            "        System.out.println(\"Third element: \" + third);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Get the third element from array\n" +
            "OUTPUT: Third element: 30",

            // Level 2 - Basit loop
            "TITLE: Array Sum\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        int[] nums = {5, 10, 15, 20};\n" +
            "        int sum = 0;\n" +
            ">>>     for (int n : nums) {\n" +
            ">>>         sum += n;\n" +
            ">>>     }\n" +
            "        System.out.println(\"Sum: \" + sum);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Write a for-each loop to sum all elements\n" +
            "OUTPUT: Sum: 50",

            // Level 3 - Loop + condition
            "TITLE: Count Even Numbers\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        int[] arr = {1, 4, 7, 8, 12, 15};\n" +
            "        int count = 0;\n" +
            ">>>     for (int i = 0; i < arr.length; i++) {\n" +
            ">>>         if (arr[i] % 2 == 0) {\n" +
            ">>>             count++;\n" +
            ">>>         }\n" +
            ">>>     }\n" +
            "        System.out.println(\"Even count: \" + count);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Count how many even numbers are in the array\n" +
            "OUTPUT: Even count: 3",

            // Level 4 - Find max/min
            "TITLE: Find Maximum\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        int[] values = {23, 7, 45, 12, 38};\n" +
            ">>>     int max = values[0];\n" +
            ">>>     for (int i = 1; i < values.length; i++) {\n" +
            ">>>         if (values[i] > max) {\n" +
            ">>>             max = values[i];\n" +
            ">>>         }\n" +
            ">>>     }\n" +
            "        System.out.println(\"Max: \" + max);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Find the maximum value in the array\n" +
            "OUTPUT: Max: 45",

            // Level 5 - Reverse array
            "TITLE: Reverse Array\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        int[] arr = {1, 2, 3, 4, 5};\n" +
            ">>>     for (int i = 0; i < arr.length / 2; i++) {\n" +
            ">>>         int temp = arr[i];\n" +
            ">>>         arr[i] = arr[arr.length - 1 - i];\n" +
            ">>>         arr[arr.length - 1 - i] = temp;\n" +
            ">>>     }\n" +
            "        System.out.print(\"Reversed: \");\n" +
            "        for (int n : arr) System.out.print(n + \" \");\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Reverse the array in-place\n" +
            "OUTPUT: Reversed: 5 4 3 2 1"
        });

        // ============ ARRAYLIST ============
        PROMPTS.put("ArrayList", new String[]{
            // Level 1
            "TITLE: Add Element\n" +
            "```java\n" +
            "import java.util.ArrayList;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        ArrayList<String> list = new ArrayList<>();\n" +
            ">>>     list.add(\"Hello\");\n" +
            "        System.out.println(list);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Add the string \"Hello\" to the ArrayList\n" +
            "OUTPUT: [Hello]",

            // Level 2
            "TITLE: ArrayList Sum\n" +
            "```java\n" +
            "import java.util.ArrayList;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        ArrayList<Integer> nums = new ArrayList<>();\n" +
            "        nums.add(10); nums.add(20); nums.add(30);\n" +
            "        int sum = 0;\n" +
            ">>>     for (int n : nums) {\n" +
            ">>>         sum += n;\n" +
            ">>>     }\n" +
            "        System.out.println(\"Sum: \" + sum);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Calculate sum of all elements using for-each loop\n" +
            "OUTPUT: Sum: 60",

            // Level 3
            "TITLE: Remove Negatives\n" +
            "```java\n" +
            "import java.util.ArrayList;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        ArrayList<Integer> list = new ArrayList<>();\n" +
            "        list.add(5); list.add(-3); list.add(8); list.add(-1);\n" +
            ">>>     for (int i = list.size() - 1; i >= 0; i--) {\n" +
            ">>>         if (list.get(i) < 0) {\n" +
            ">>>             list.remove(i);\n" +
            ">>>         }\n" +
            ">>>     }\n" +
            "        System.out.println(list);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Remove all negative numbers from the list\n" +
            "OUTPUT: [5, 8]",

            // Level 4
            "TITLE: Find Duplicates\n" +
            "```java\n" +
            "import java.util.ArrayList;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        ArrayList<Integer> list = new ArrayList<>();\n" +
            "        list.add(1); list.add(2); list.add(2); list.add(3); list.add(1);\n" +
            "        ArrayList<Integer> dups = new ArrayList<>();\n" +
            ">>>     for (int i = 0; i < list.size(); i++) {\n" +
            ">>>         for (int j = i + 1; j < list.size(); j++) {\n" +
            ">>>             if (list.get(i).equals(list.get(j)) && !dups.contains(list.get(i))) {\n" +
            ">>>                 dups.add(list.get(i));\n" +
            ">>>             }\n" +
            ">>>         }\n" +
            ">>>     }\n" +
            "        System.out.println(\"Duplicates: \" + dups);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Find all duplicate values in the list\n" +
            "OUTPUT: Duplicates: [1, 2]",

            // Level 5
            "TITLE: Merge Sorted Lists\n" +
            "```java\n" +
            "import java.util.ArrayList;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        ArrayList<Integer> a = new ArrayList<>();\n" +
            "        ArrayList<Integer> b = new ArrayList<>();\n" +
            "        a.add(1); a.add(3); a.add(5);\n" +
            "        b.add(2); b.add(4); b.add(6);\n" +
            "        ArrayList<Integer> merged = new ArrayList<>();\n" +
            ">>>     int i = 0, j = 0;\n" +
            ">>>     while (i < a.size() && j < b.size()) {\n" +
            ">>>         if (a.get(i) <= b.get(j)) merged.add(a.get(i++));\n" +
            ">>>         else merged.add(b.get(j++));\n" +
            ">>>     }\n" +
            ">>>     while (i < a.size()) merged.add(a.get(i++));\n" +
            ">>>     while (j < b.size()) merged.add(b.get(j++));\n" +
            "        System.out.println(merged);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Merge two sorted lists into one sorted list\n" +
            "OUTPUT: [1, 2, 3, 4, 5, 6]"
        });

        // ============ HASHMAP ============
        PROMPTS.put("HashMap", new String[]{
            // Level 1
            "TITLE: Put and Get\n" +
            "```java\n" +
            "import java.util.HashMap;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        HashMap<String, Integer> ages = new HashMap<>();\n" +
            ">>>     ages.put(\"Ali\", 25);\n" +
            "        System.out.println(\"Ali's age: \" + ages.get(\"Ali\"));\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Add Ali with age 25 to the HashMap\n" +
            "OUTPUT: Ali's age: 25",

            // Level 2
            "TITLE: Iterate HashMap\n" +
            "```java\n" +
            "import java.util.HashMap;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        HashMap<String, Integer> scores = new HashMap<>();\n" +
            "        scores.put(\"Math\", 90);\n" +
            "        scores.put(\"English\", 85);\n" +
            ">>>     for (String key : scores.keySet()) {\n" +
            ">>>         System.out.println(key + \": \" + scores.get(key));\n" +
            ">>>     }\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Print all key-value pairs using keySet()\n" +
            "OUTPUT: Math: 90\\nEnglish: 85",

            // Level 3
            "TITLE: Word Frequency\n" +
            "```java\n" +
            "import java.util.HashMap;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        String[] words = {\"apple\", \"banana\", \"apple\", \"cherry\", \"banana\", \"apple\"};\n" +
            "        HashMap<String, Integer> freq = new HashMap<>();\n" +
            ">>>     for (String word : words) {\n" +
            ">>>         freq.put(word, freq.getOrDefault(word, 0) + 1);\n" +
            ">>>     }\n" +
            "        System.out.println(freq);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Count frequency of each word\n" +
            "OUTPUT: {banana=2, apple=3, cherry=1}",

            // Level 4
            "TITLE: Find Max Value Key\n" +
            "```java\n" +
            "import java.util.HashMap;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        HashMap<String, Integer> scores = new HashMap<>();\n" +
            "        scores.put(\"Ali\", 85); scores.put(\"Veli\", 92); scores.put(\"Ayse\", 78);\n" +
            ">>>     String maxKey = null;\n" +
            ">>>     int maxVal = Integer.MIN_VALUE;\n" +
            ">>>     for (String key : scores.keySet()) {\n" +
            ">>>         if (scores.get(key) > maxVal) {\n" +
            ">>>             maxVal = scores.get(key);\n" +
            ">>>             maxKey = key;\n" +
            ">>>         }\n" +
            ">>>     }\n" +
            "        System.out.println(\"Winner: \" + maxKey);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Find the key with maximum value\n" +
            "OUTPUT: Winner: Veli",

            // Level 5
            "TITLE: Group By First Letter\n" +
            "```java\n" +
            "import java.util.HashMap;\n" +
            "import java.util.ArrayList;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        String[] names = {\"Ali\", \"Ayse\", \"Berk\", \"Burak\", \"Can\"};\n" +
            "        HashMap<Character, ArrayList<String>> groups = new HashMap<>();\n" +
            ">>>     for (String name : names) {\n" +
            ">>>         char first = name.charAt(0);\n" +
            ">>>         if (!groups.containsKey(first)) {\n" +
            ">>>             groups.put(first, new ArrayList<>());\n" +
            ">>>         }\n" +
            ">>>         groups.get(first).add(name);\n" +
            ">>>     }\n" +
            "        System.out.println(groups);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Group names by their first letter\n" +
            "OUTPUT: {A=[Ali, Ayse], B=[Berk, Burak], C=[Can]}"
        });

        // ============ HASHSET ============
        PROMPTS.put("HashSet", new String[]{
            // Level 1
            "TITLE: Add to Set\n" +
            "```java\n" +
            "import java.util.HashSet;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        HashSet<String> colors = new HashSet<>();\n" +
            ">>>     colors.add(\"Red\");\n" +
            ">>>     colors.add(\"Blue\");\n" +
            "        System.out.println(colors.size());\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Add Red and Blue to the HashSet\n" +
            "OUTPUT: 2",

            // Level 2
            "TITLE: Remove Duplicates\n" +
            "```java\n" +
            "import java.util.HashSet;\n" +
            "import java.util.ArrayList;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        int[] nums = {1, 2, 2, 3, 3, 3, 4};\n" +
            "        HashSet<Integer> unique = new HashSet<>();\n" +
            ">>>     for (int n : nums) {\n" +
            ">>>         unique.add(n);\n" +
            ">>>     }\n" +
            "        System.out.println(\"Unique: \" + unique.size());\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Add all numbers to set to remove duplicates\n" +
            "OUTPUT: Unique: 4",

            // Level 3
            "TITLE: Find Common Elements\n" +
            "```java\n" +
            "import java.util.HashSet;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        int[] a = {1, 2, 3, 4, 5};\n" +
            "        int[] b = {4, 5, 6, 7, 8};\n" +
            "        HashSet<Integer> setA = new HashSet<>();\n" +
            "        for (int n : a) setA.add(n);\n" +
            "        HashSet<Integer> common = new HashSet<>();\n" +
            ">>>     for (int n : b) {\n" +
            ">>>         if (setA.contains(n)) {\n" +
            ">>>             common.add(n);\n" +
            ">>>         }\n" +
            ">>>     }\n" +
            "        System.out.println(\"Common: \" + common);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Find elements that exist in both arrays\n" +
            "OUTPUT: Common: [4, 5]",

            // Level 4
            "TITLE: First Non-Repeating\n" +
            "```java\n" +
            "import java.util.HashSet;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        int[] nums = {2, 3, 4, 2, 3, 5, 4, 6};\n" +
            "        HashSet<Integer> seen = new HashSet<>();\n" +
            "        HashSet<Integer> dups = new HashSet<>();\n" +
            ">>>     for (int n : nums) {\n" +
            ">>>         if (seen.contains(n)) dups.add(n);\n" +
            ">>>         else seen.add(n);\n" +
            ">>>     }\n" +
            ">>>     for (int n : nums) {\n" +
            ">>>         if (!dups.contains(n)) {\n" +
            ">>>             System.out.println(\"First unique: \" + n);\n" +
            ">>>             break;\n" +
            ">>>         }\n" +
            ">>>     }\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Find the first non-repeating number\n" +
            "OUTPUT: First unique: 5",

            // Level 5
            "TITLE: Symmetric Difference\n" +
            "```java\n" +
            "import java.util.HashSet;\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        HashSet<Integer> a = new HashSet<>();\n" +
            "        HashSet<Integer> b = new HashSet<>();\n" +
            "        a.add(1); a.add(2); a.add(3);\n" +
            "        b.add(2); b.add(3); b.add(4);\n" +
            "        HashSet<Integer> result = new HashSet<>();\n" +
            ">>>     for (int n : a) {\n" +
            ">>>         if (!b.contains(n)) result.add(n);\n" +
            ">>>     }\n" +
            ">>>     for (int n : b) {\n" +
            ">>>         if (!a.contains(n)) result.add(n);\n" +
            ">>>     }\n" +
            "        System.out.println(result);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Find elements in A or B but not both\n" +
            "OUTPUT: [1, 4]"
        });

        // ============ STRING ============
        PROMPTS.put("String", new String[]{
            // Level 1
            "TITLE: String Length\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        String text = \"Hello World\";\n" +
            ">>>     int len = text.length();\n" +
            "        System.out.println(\"Length: \" + len);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Get the length of the string\n" +
            "OUTPUT: Length: 11",

            // Level 2
            "TITLE: Count Vowels\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        String text = \"Hello World\";\n" +
            "        int count = 0;\n" +
            ">>>     for (int i = 0; i < text.length(); i++) {\n" +
            ">>>         char c = Character.toLowerCase(text.charAt(i));\n" +
            ">>>         if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') count++;\n" +
            ">>>     }\n" +
            "        System.out.println(\"Vowels: \" + count);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Count vowels in the string\n" +
            "OUTPUT: Vowels: 3",

            // Level 3
            "TITLE: Reverse String\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        String text = \"Hello\";\n" +
            "        String reversed = \"\";\n" +
            ">>>     for (int i = text.length() - 1; i >= 0; i--) {\n" +
            ">>>         reversed += text.charAt(i);\n" +
            ">>>     }\n" +
            "        System.out.println(reversed);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Reverse the string\n" +
            "OUTPUT: olleH",

            // Level 4
            "TITLE: Is Palindrome\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        String text = \"radar\";\n" +
            "        boolean isPalindrome = true;\n" +
            ">>>     for (int i = 0; i < text.length() / 2; i++) {\n" +
            ">>>         if (text.charAt(i) != text.charAt(text.length() - 1 - i)) {\n" +
            ">>>             isPalindrome = false;\n" +
            ">>>             break;\n" +
            ">>>         }\n" +
            ">>>     }\n" +
            "        System.out.println(isPalindrome ? \"Palindrome\" : \"Not palindrome\");\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Check if string is palindrome\n" +
            "OUTPUT: Palindrome",

            // Level 5
            "TITLE: Compress String\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        String text = \"aaabbcccc\";\n" +
            "        StringBuilder result = new StringBuilder();\n" +
            ">>>     int count = 1;\n" +
            ">>>     for (int i = 1; i <= text.length(); i++) {\n" +
            ">>>         if (i < text.length() && text.charAt(i) == text.charAt(i-1)) {\n" +
            ">>>             count++;\n" +
            ">>>         } else {\n" +
            ">>>             result.append(text.charAt(i-1)).append(count);\n" +
            ">>>             count = 1;\n" +
            ">>>         }\n" +
            ">>>     }\n" +
            "        System.out.println(result);\n" +
            "    }\n" +
            "}\n" +
            "```\n" +
            "TASK: Compress string (e.g., aaabb -> a3b2)\n" +
            "OUTPUT: a3b2c4"
        });

        // ============ METHODS ============
        PROMPTS.put("Methods", new String[]{
            // Level 1
            "TITLE: Simple Method\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        greet();\n" +
            "    }\n" +
            ">>>\n" +
            ">>>     public static void greet() {\n" +
            ">>>         System.out.println(\"Hello!\");\n" +
            ">>>     }\n" +
            "}\n" +
            "```\n" +
            "TASK: Create a method that prints Hello!\n" +
            "OUTPUT: Hello!",

            // Level 2
            "TITLE: Method with Return\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        int result = add(5, 3);\n" +
            "        System.out.println(\"Sum: \" + result);\n" +
            "    }\n" +
            ">>>\n" +
            ">>>     public static int add(int a, int b) {\n" +
            ">>>         return a + b;\n" +
            ">>>     }\n" +
            "}\n" +
            "```\n" +
            "TASK: Create add method that returns sum of two numbers\n" +
            "OUTPUT: Sum: 8",

            // Level 3
            "TITLE: Array Parameter\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        int[] nums = {1, 2, 3, 4, 5};\n" +
            "        System.out.println(\"Average: \" + average(nums));\n" +
            "    }\n" +
            ">>>\n" +
            ">>>     public static double average(int[] arr) {\n" +
            ">>>         int sum = 0;\n" +
            ">>>         for (int n : arr) sum += n;\n" +
            ">>>         return (double) sum / arr.length;\n" +
            ">>>     }\n" +
            "}\n" +
            "```\n" +
            "TASK: Create method that calculates average of array\n" +
            "OUTPUT: Average: 3.0",

            // Level 4
            "TITLE: Recursive Factorial\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        System.out.println(\"5! = \" + factorial(5));\n" +
            "    }\n" +
            ">>>\n" +
            ">>>     public static int factorial(int n) {\n" +
            ">>>         if (n <= 1) return 1;\n" +
            ">>>         return n * factorial(n - 1);\n" +
            ">>>     }\n" +
            "}\n" +
            "```\n" +
            "TASK: Create recursive factorial method\n" +
            "OUTPUT: 5! = 120",

            // Level 5
            "TITLE: Multiple Methods\n" +
            "```java\n" +
            "public class Practice {\n" +
            "    public static void main(String[] args) {\n" +
            "        int[] nums = {3, 7, 2, 9, 1};\n" +
            "        System.out.println(\"Min: \" + findMin(nums));\n" +
            "        System.out.println(\"Max: \" + findMax(nums));\n" +
            "        System.out.println(\"Range: \" + range(nums));\n" +
            "    }\n" +
            ">>>\n" +
            ">>>     public static int findMin(int[] arr) {\n" +
            ">>>         int min = arr[0];\n" +
            ">>>         for (int n : arr) if (n < min) min = n;\n" +
            ">>>         return min;\n" +
            ">>>     }\n" +
            ">>>\n" +
            ">>>     public static int findMax(int[] arr) {\n" +
            ">>>         int max = arr[0];\n" +
            ">>>         for (int n : arr) if (n > max) max = n;\n" +
            ">>>         return max;\n" +
            ">>>     }\n" +
            ">>>\n" +
            ">>>     public static int range(int[] arr) {\n" +
            ">>>         return findMax(arr) - findMin(arr);\n" +
            ">>>     }\n" +
            "}\n" +
            "```\n" +
            "TASK: Create findMin, findMax, and range methods\n" +
            "OUTPUT: Min: 1\\nMax: 9\\nRange: 8"
        });
    }

    /**
     * Get a specific prompt for a topic and level
     */
    public static String getPrompt(String topic, int level) {
        String[] prompts = PROMPTS.get(topic);
        if (prompts == null) {
            return null; // Topic not found, use generic prompt
        }

        // Clamp level to valid range
        int index = Math.max(0, Math.min(level - 1, prompts.length - 1));
        return prompts[index];
    }

    // Store variations for SIMILAR practice (different fixed values)
    private static final Map<String, String[][]> VARIATIONS = new HashMap<>();

    static {
        // Array variations for SIMILAR
        VARIATIONS.put("Array", new String[][]{
            // Level 2 variations (Sum)
            {
                "TITLE: Array Sum\n```java\npublic class Practice {\n    public static void main(String[] args) {\n        int[] nums = {5, 10, 15, 20};\n        int sum = 0;\n>>>     for (int n : nums) {\n>>>         sum += n;\n>>>     }\n        System.out.println(\"Sum: \" + sum);\n    }\n}\n```\nTASK: Write a for-each loop to sum all elements\nOUTPUT: Sum: 50",
                "TITLE: Array Sum\n```java\npublic class Practice {\n    public static void main(String[] args) {\n        int[] nums = {3, 7, 12, 8};\n        int sum = 0;\n>>>     for (int n : nums) {\n>>>         sum += n;\n>>>     }\n        System.out.println(\"Sum: \" + sum);\n    }\n}\n```\nTASK: Write a for-each loop to sum all elements\nOUTPUT: Sum: 30",
                "TITLE: Array Sum\n```java\npublic class Practice {\n    public static void main(String[] args) {\n        int[] nums = {2, 4, 6, 8, 10};\n        int sum = 0;\n>>>     for (int n : nums) {\n>>>         sum += n;\n>>>     }\n        System.out.println(\"Sum: \" + sum);\n    }\n}\n```\nTASK: Write a for-each loop to sum all elements\nOUTPUT: Sum: 30",
                "TITLE: Array Sum\n```java\npublic class Practice {\n    public static void main(String[] args) {\n        int[] nums = {11, 22, 33};\n        int sum = 0;\n>>>     for (int n : nums) {\n>>>         sum += n;\n>>>     }\n        System.out.println(\"Sum: \" + sum);\n    }\n}\n```\nTASK: Write a for-each loop to sum all elements\nOUTPUT: Sum: 66"
            }
        });
    }

    /**
     * Get a different variation for SIMILAR practice
     */
    public static String getVariation(String topic, int level) {
        String[][] topicVariations = VARIATIONS.get(topic);
        if (topicVariations == null || level < 1 || level > topicVariations.length) {
            // No variations, return normal prompt
            return getPrompt(topic, level);
        }

        String[] levelVariations = topicVariations[level - 1];
        if (levelVariations == null || levelVariations.length == 0) {
            return getPrompt(topic, level);
        }

        // Pick random variation
        int idx = random.nextInt(levelVariations.length);
        return levelVariations[idx];
    }

    /**
     * Check if we have a custom prompt for this topic
     */
    public static boolean hasPrompt(String topic) {
        return PROMPTS.containsKey(topic);
    }

    /**
     * Get all available topics
     */
    public static String[] getTopics() {
        return PROMPTS.keySet().toArray(new String[0]);
    }
}
