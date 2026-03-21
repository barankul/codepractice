// Offline mode — API不要のプリセット練習問題 (pre-generated practices for AI-free / offline mode)

import * as vscode from "vscode";
import { getSecret } from "./aiHelpers";
import { randomizePractice } from "./practiceRandomizer";
import { JAVA_PRACTICES as OFFLINE_JAVA } from "./offlinePractices/java";
import { TYPESCRIPT_PRACTICES as OFFLINE_TS } from "./offlinePractices/typescript";
import { SQL_PRACTICES as OFFLINE_SQL } from "./offlinePractices/sql";

export interface DemoPractice {
  lang: string;
  topic: string;
  level: number;
  title: string;
  task: string;
  code: string;
  solutionCode: string;
  expectedOutput: string;
  hint: string;
  testCases?: { input: string; output: string }[];
  judgeFeedback: { summary: string; lines: { line: number; problem: string; fix: string }[] };
  altMethods?: { name: string; code: string; explanation: string }[];
  crossLang?: Record<string, { code: string; highlights: { lines: number[]; explanation: string }[] }>;
}

let _demoModeChecked = false;
let _isDemoMode = false;
let _forceOffline = false;

/** Force offline mode on/off (user toggle) */
export function setForceOffline(value: boolean): void {
  _forceOffline = value;
}

/** APIキー有無チェック — check if API key exists */
export async function checkDemoMode(): Promise<boolean> {
  if (_forceOffline) { return true; }
  if (_demoModeChecked) { return _isDemoMode; }
  try {
    const cfg = vscode.workspace.getConfiguration("codepractice");
    const provider = cfg.get<string>("aiProvider") || "local";
    if (provider === "local") {
      const endpoint = cfg.get<string>("aiEndpoint") || "";
      const key = await getSecret("endpointApiKey");
      _isDemoMode = !endpoint && !key;
    } else {
      const keyName = provider === "groq" ? "groqApiKey" : provider === "gemini" ? "geminiApiKey" : provider === "openai" ? "openaiApiKey" : provider === "claude" ? "claudeApiKey" : "endpointApiKey";
      const key = await getSecret(keyName);
      _isDemoMode = !key;
    }
  } catch {
    _isDemoMode = true;
  }
  _demoModeChecked = true;
  return _isDemoMode;
}

/** キャッシュ無効化 — reset cached result */
export function invalidateDemoModeCache(): void {
  _demoModeChecked = false;
}

let _usedIndices: Set<number> = new Set();

/** 練習問題選択 — pick a practice matching lang/topic, avoid repeats */
export function getDemoPractice(lang: string, topic: string, _level: number): DemoPractice | null {
  const matches = DEMO_PRACTICES.filter(p => p.lang === lang && p.topic === topic);
  if (matches.length === 0) {
    const langMatches = DEMO_PRACTICES.filter(p => p.lang === lang);
    if (langMatches.length === 0) { return null; }
    return randomizePractice(langMatches[Math.floor(Math.random() * langMatches.length)]) as DemoPractice;
  }
  const unused = matches.filter((_, i) => !_usedIndices.has(DEMO_PRACTICES.indexOf(matches[i])));
  const pick = unused.length > 0 ? unused[Math.floor(Math.random() * unused.length)] : matches[Math.floor(Math.random() * matches.length)];
  _usedIndices.add(DEMO_PRACTICES.indexOf(pick));
  if (_usedIndices.size >= DEMO_PRACTICES.length) { _usedIndices.clear(); }
  return randomizePractice(pick) as DemoPractice;
}

/** トピック一覧 — list available demo topics for a language */
export function getDemoTopics(lang: string): string[] {
  const topics = new Set(DEMO_PRACTICES.filter(p => p.lang === lang).map(p => p.topic));
  return [...topics];
}

// Java Practices (10)

const JAVA_PRACTICES: DemoPractice[] = [
  // Array × 2
  {
    lang: "Java", topic: "Array", level: 1,
    title: "Sum Array Elements",
    task: "Calculate the sum of all elements in the given integer array and print the result.",
    code: `public class Practice {
    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4, 5};
        int sum = 0;
        // YOUR CODE HERE

        System.out.println(sum);
    }
}`,
    solutionCode: `public class Practice {
    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int n : nums) {
            sum += n;
        }
        System.out.println(sum);
    }
}`,
    expectedOutput: "15",
    hint: "Use a for-each loop to iterate through the array and add each element to sum.",
    testCases: [
      { input: "int[] nums = {1, 2, 3, 4, 5}", output: "15" },
      { input: "int[] nums = {10, 20, 30}", output: "60" },
      { input: "int[] nums = {0}", output: "0" },
    ],
    judgeFeedback: {
      summary: "The sum variable is not being updated inside the loop.",
      lines: [
        { line: 5, problem: "Missing loop to iterate over the array", fix: "Add: for (int n : nums) { sum += n; }" }
      ]
    },
    altMethods: [
      { name: "Using Java Streams", code: `public class Practice {
    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4, 5};
        int sum = java.util.Arrays.stream(nums).sum();
        System.out.println(sum);
    }
}`, explanation: "Java 8 Streams provide a functional one-liner for summing arrays." },
      { name: "Using Traditional For Loop", code: `public class Practice {
    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int i = 0; i < nums.length; i++) {
            sum += nums[i];
        }
        System.out.println(sum);
    }
}`, explanation: "Classic index-based for loop — gives you access to the index if needed." }
    ]
  },
  {
    lang: "Java", topic: "Array", level: 2,
    title: "Find Maximum Element",
    task: "Find and print the maximum value in the integer array.",
    code: `public class Practice {
    public static void main(String[] args) {
        int[] nums = {3, 7, 2, 8, 1, 9, 4};
        int max = nums[0];
        // YOUR CODE HERE

        System.out.println(max);
    }
}`,
    solutionCode: `public class Practice {
    public static void main(String[] args) {
        int[] nums = {3, 7, 2, 8, 1, 9, 4};
        int max = nums[0];
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] > max) {
                max = nums[i];
            }
        }
        System.out.println(max);
    }
}`,
    expectedOutput: "9",
    hint: "Start with max = nums[0], then loop through comparing each element.",
    judgeFeedback: {
      summary: "The comparison inside the loop is incorrect or missing.",
      lines: [
        { line: 5, problem: "Need to compare each element with current max", fix: "Add: if (nums[i] > max) { max = nums[i]; }" }
      ]
    },
    altMethods: [
      { name: "Using Arrays.stream().max()", code: `public class Practice {
    public static void main(String[] args) {
        int[] nums = {3, 7, 2, 8, 1, 9, 4};
        int max = java.util.Arrays.stream(nums).max().getAsInt();
        System.out.println(max);
    }
}`, explanation: "Stream API provides a clean functional approach to finding max." }
    ]
  },

  // String × 2
  {
    lang: "Java", topic: "String", level: 1,
    title: "Reverse a String",
    task: "Reverse the given string and print the result.",
    code: `public class Practice {
    public static void main(String[] args) {
        String text = "hello";
        String reversed = "";
        // YOUR CODE HERE

        System.out.println(reversed);
    }
}`,
    solutionCode: `public class Practice {
    public static void main(String[] args) {
        String text = "hello";
        String reversed = "";
        for (int i = text.length() - 1; i >= 0; i--) {
            reversed += text.charAt(i);
        }
        System.out.println(reversed);
    }
}`,
    expectedOutput: "olleh",
    hint: "Loop backwards through the string using charAt() and build the reversed string.",
    judgeFeedback: {
      summary: "The loop direction or charAt index is incorrect.",
      lines: [
        { line: 5, problem: "Need to iterate from end to start", fix: "for (int i = text.length() - 1; i >= 0; i--)" }
      ]
    },
    altMethods: [
      { name: "Using StringBuilder", code: `public class Practice {
    public static void main(String[] args) {
        String text = "hello";
        String reversed = new StringBuilder(text).reverse().toString();
        System.out.println(reversed);
    }
}`, explanation: "StringBuilder.reverse() is the idiomatic Java way to reverse strings." }
    ]
  },
  {
    lang: "Java", topic: "String", level: 2,
    title: "Count Vowels",
    task: "Count and print the number of vowels (a, e, i, o, u) in the given string. Case-insensitive.",
    code: `public class Practice {
    public static void main(String[] args) {
        String text = "Hello World";
        int count = 0;
        // YOUR CODE HERE

        System.out.println(count);
    }
}`,
    solutionCode: `public class Practice {
    public static void main(String[] args) {
        String text = "Hello World";
        int count = 0;
        for (char c : text.toLowerCase().toCharArray()) {
            if ("aeiou".indexOf(c) >= 0) {
                count++;
            }
        }
        System.out.println(count);
    }
}`,
    expectedOutput: "3",
    hint: "Convert to lowercase, then check each character against 'aeiou'.",
    judgeFeedback: {
      summary: "Missing case conversion or vowel check logic.",
      lines: [
        { line: 5, problem: "Need to convert to lowercase and check vowels", fix: "Use text.toLowerCase() and check if \"aeiou\".indexOf(c) >= 0" }
      ]
    }
  },

  // Methods × 2
  {
    lang: "Java", topic: "Methods", level: 1,
    title: "Calculate Factorial",
    task: "Implement the factorial method that returns n! (n factorial). Print the result for n = 5.",
    code: `public class Practice {
    static int factorial(int n) {
        int result = 1;
        // YOUR CODE HERE

        return result;
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}`,
    solutionCode: `public class Practice {
    static int factorial(int n) {
        int result = 1;
        for (int i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}`,
    expectedOutput: "120",
    hint: "Multiply result by each number from 2 to n using a for loop.",
    judgeFeedback: {
      summary: "The loop range or multiplication logic is incorrect.",
      lines: [
        { line: 4, problem: "Missing or incorrect loop", fix: "Add: for (int i = 2; i <= n; i++) { result *= i; }" }
      ]
    },
    altMethods: [
      { name: "Recursive Approach", code: `public class Practice {
    static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}`, explanation: "Recursive factorial — elegant but uses stack space proportional to n." }
    ]
  },
  {
    lang: "Java", topic: "Methods", level: 2,
    title: "Check Palindrome",
    task: "Implement the isPalindrome method that returns true if the string reads the same forwards and backwards. Print the result for \"racecar\".",
    code: `public class Practice {
    static boolean isPalindrome(String s) {
        boolean result = false;
        // YOUR CODE HERE

        return result;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("racecar"));
    }
}`,
    solutionCode: `public class Practice {
    static boolean isPalindrome(String s) {
        boolean result = true;
        for (int i = 0; i < s.length() / 2; i++) {
            if (s.charAt(i) != s.charAt(s.length() - 1 - i)) {
                result = false;
                break;
            }
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("racecar"));
    }
}`,
    expectedOutput: "true",
    hint: "Compare characters from the start and end, moving inward.",
    judgeFeedback: {
      summary: "Character comparison or index calculation is wrong.",
      lines: [
        { line: 4, problem: "Compare s.charAt(i) with s.charAt(s.length()-1-i)", fix: "Loop from 0 to length/2, compare symmetric positions" }
      ]
    }
  },

  // ArrayList × 2
  {
    lang: "Java", topic: "ArrayList", level: 1,
    title: "Filter Even Numbers",
    task: "Filter even numbers from the ArrayList and print them.",
    code: `import java.util.ArrayList;
import java.util.Arrays;

public class Practice {
    public static void main(String[] args) {
        ArrayList<Integer> nums = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8));
        ArrayList<Integer> evens = new ArrayList<>();
        // YOUR CODE HERE

        System.out.println(evens);
    }
}`,
    solutionCode: `import java.util.ArrayList;
import java.util.Arrays;

public class Practice {
    public static void main(String[] args) {
        ArrayList<Integer> nums = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8));
        ArrayList<Integer> evens = new ArrayList<>();
        for (int n : nums) {
            if (n % 2 == 0) {
                evens.add(n);
            }
        }
        System.out.println(evens);
    }
}`,
    expectedOutput: "[2, 4, 6, 8]",
    hint: "Loop through nums, check if n % 2 == 0, and add to evens.",
    judgeFeedback: {
      summary: "The modulo check or add() call is missing.",
      lines: [
        { line: 8, problem: "Need to check even and add to list", fix: "if (n % 2 == 0) { evens.add(n); }" }
      ]
    }
  },
  {
    lang: "Java", topic: "ArrayList", level: 2,
    title: "Remove Duplicates",
    task: "Remove duplicate values from the ArrayList and print the result.",
    code: `import java.util.ArrayList;
import java.util.Arrays;

public class Practice {
    public static void main(String[] args) {
        ArrayList<Integer> nums = new ArrayList<>(Arrays.asList(1, 3, 2, 3, 1, 4, 2, 5));
        ArrayList<Integer> unique = new ArrayList<>();
        // YOUR CODE HERE

        System.out.println(unique);
    }
}`,
    solutionCode: `import java.util.ArrayList;
import java.util.Arrays;

public class Practice {
    public static void main(String[] args) {
        ArrayList<Integer> nums = new ArrayList<>(Arrays.asList(1, 3, 2, 3, 1, 4, 2, 5));
        ArrayList<Integer> unique = new ArrayList<>();
        for (int n : nums) {
            if (!unique.contains(n)) {
                unique.add(n);
            }
        }
        System.out.println(unique);
    }
}`,
    expectedOutput: "[1, 3, 2, 4, 5]",
    hint: "Check if unique already contains the element before adding.",
    judgeFeedback: {
      summary: "Missing contains() check before adding to unique list.",
      lines: [
        { line: 8, problem: "Need to check for duplicates", fix: "if (!unique.contains(n)) { unique.add(n); }" }
      ]
    }
  },

  // HashMap × 2
  {
    lang: "Java", topic: "HashMap", level: 1,
    title: "Count Character Frequency",
    task: "Count the frequency of each character in the string and print the HashMap.",
    code: `import java.util.HashMap;

public class Practice {
    public static void main(String[] args) {
        String text = "hello";
        HashMap<Character, Integer> freq = new HashMap<>();
        // YOUR CODE HERE

        System.out.println(freq);
    }
}`,
    solutionCode: `import java.util.HashMap;

public class Practice {
    public static void main(String[] args) {
        String text = "hello";
        HashMap<Character, Integer> freq = new HashMap<>();
        for (char c : text.toCharArray()) {
            freq.put(c, freq.getOrDefault(c, 0) + 1);
        }
        System.out.println(freq);
    }
}`,
    expectedOutput: "{h=1, e=1, l=2, o=1}",
    hint: "Use getOrDefault(c, 0) + 1 to increment the count for each character.",
    judgeFeedback: {
      summary: "The getOrDefault pattern for counting is missing.",
      lines: [
        { line: 7, problem: "Need to update frequency count", fix: "freq.put(c, freq.getOrDefault(c, 0) + 1)" }
      ]
    }
  },
  {
    lang: "Java", topic: "HashMap", level: 2,
    title: "Word Frequency Counter",
    task: "Count how many times each word appears in the sentence and print the result.",
    code: `import java.util.HashMap;

public class Practice {
    public static void main(String[] args) {
        String sentence = "the cat sat on the mat the cat";
        HashMap<String, Integer> wordCount = new HashMap<>();
        // YOUR CODE HERE

        System.out.println(wordCount);
    }
}`,
    solutionCode: `import java.util.HashMap;

public class Practice {
    public static void main(String[] args) {
        String sentence = "the cat sat on the mat the cat";
        HashMap<String, Integer> wordCount = new HashMap<>();
        for (String word : sentence.split(" ")) {
            wordCount.put(word, wordCount.getOrDefault(word, 0) + 1);
        }
        System.out.println(wordCount);
    }
}`,
    expectedOutput: "{the=3, cat=2, sat=1, on=1, mat=1}",
    hint: "Split the sentence by spaces, then count each word with getOrDefault.",
    judgeFeedback: {
      summary: "Missing split() call or word counting logic.",
      lines: [
        { line: 7, problem: "Split sentence into words and count each", fix: "for (String word : sentence.split(\" \")) { wordCount.put(word, wordCount.getOrDefault(word, 0) + 1); }" }
      ]
    }
  },
];

// TypeScript Practices (10)

const TS_PRACTICES: DemoPractice[] = [
  // Type Basics × 2
  {
    lang: "TypeScript", topic: "Type Basics", level: 1,
    title: "Temperature Converter",
    task: "Convert the temperature from Celsius to Fahrenheit using the formula: F = C × 9/5 + 32. Print the result.",
    code: `const celsius: number = 100;
let fahrenheit: number = 0;
// YOUR CODE HERE

console.log(fahrenheit);`,
    solutionCode: `const celsius: number = 100;
let fahrenheit: number = 0;
fahrenheit = celsius * 9 / 5 + 32;
console.log(fahrenheit);`,
    expectedOutput: "212",
    hint: "Apply the formula: fahrenheit = celsius * 9 / 5 + 32",
    judgeFeedback: {
      summary: "The conversion formula is missing or incorrect.",
      lines: [
        { line: 3, problem: "Need to apply temperature formula", fix: "fahrenheit = celsius * 9 / 5 + 32" }
      ]
    }
  },
  {
    lang: "TypeScript", topic: "Type Basics", level: 2,
    title: "Type Guard Check",
    task: "Write a function that takes a value of type string | number and returns its length if string, or the number itself if number.",
    code: `function getSize(value: string | number): number {
    let result: number = 0;
    // YOUR CODE HERE

    return result;
}

console.log(getSize("hello"));
console.log(getSize(42));`,
    solutionCode: `function getSize(value: string | number): number {
    let result: number = 0;
    if (typeof value === "string") {
        result = value.length;
    } else {
        result = value;
    }
    return result;
}

console.log(getSize("hello"));
console.log(getSize(42));`,
    expectedOutput: "5\n42",
    hint: "Use typeof to check if the value is a string or number.",
    judgeFeedback: {
      summary: "Missing typeof check for type narrowing.",
      lines: [
        { line: 3, problem: "Need type guard", fix: "if (typeof value === 'string') { result = value.length; } else { result = value; }" }
      ]
    }
  },

  // Arrays × 2
  {
    lang: "TypeScript", topic: "Arrays", level: 1,
    title: "Double Each Element",
    task: "Create a new array where each element is doubled. Print the result.",
    code: `const nums: number[] = [1, 2, 3, 4, 5];
let doubled: number[] = [];
// YOUR CODE HERE

console.log(doubled.join(", "));`,
    solutionCode: `const nums: number[] = [1, 2, 3, 4, 5];
let doubled: number[] = [];
doubled = nums.map(n => n * 2);
console.log(doubled.join(", "));`,
    expectedOutput: "2, 4, 6, 8, 10",
    hint: "Use the .map() method to transform each element.",
    judgeFeedback: {
      summary: "The map transformation is missing.",
      lines: [
        { line: 3, problem: "Need to map each element to double", fix: "doubled = nums.map(n => n * 2)" }
      ]
    },
    altMethods: [
      { name: "Using forEach", code: `const nums: number[] = [1, 2, 3, 4, 5];
let doubled: number[] = [];
nums.forEach(n => doubled.push(n * 2));
console.log(doubled.join(", "));`, explanation: "forEach with push — more imperative style." },
      { name: "Using for...of", code: `const nums: number[] = [1, 2, 3, 4, 5];
let doubled: number[] = [];
for (const n of nums) { doubled.push(n * 2); }
console.log(doubled.join(", "));`, explanation: "Traditional for-of loop — explicit and clear." }
    ]
  },
  {
    lang: "TypeScript", topic: "Arrays", level: 2,
    title: "Find Common Elements",
    task: "Find and print elements that exist in both arrays.",
    code: `const arr1: number[] = [1, 2, 3, 4, 5];
const arr2: number[] = [3, 4, 5, 6, 7];
let common: number[] = [];
// YOUR CODE HERE

console.log(common.join(", "));`,
    solutionCode: `const arr1: number[] = [1, 2, 3, 4, 5];
const arr2: number[] = [3, 4, 5, 6, 7];
let common: number[] = [];
common = arr1.filter(n => arr2.includes(n));
console.log(common.join(", "));`,
    expectedOutput: "3, 4, 5",
    hint: "Use .filter() with .includes() to find common elements.",
    judgeFeedback: {
      summary: "Missing filter/includes combination.",
      lines: [
        { line: 4, problem: "Need to find intersection", fix: "common = arr1.filter(n => arr2.includes(n))" }
      ]
    }
  },

  // Functions × 2
  {
    lang: "TypeScript", topic: "Functions", level: 1,
    title: "FizzBuzz Function",
    task: "Implement fizzBuzz: return 'Fizz' if divisible by 3, 'Buzz' if by 5, 'FizzBuzz' if both, otherwise the number as string.",
    code: `function fizzBuzz(n: number): string {
    let result: string = "";
    // YOUR CODE HERE

    return result;
}

console.log(fizzBuzz(15));
console.log(fizzBuzz(9));
console.log(fizzBuzz(10));
console.log(fizzBuzz(7));`,
    solutionCode: `function fizzBuzz(n: number): string {
    let result: string = "";
    if (n % 15 === 0) {
        result = "FizzBuzz";
    } else if (n % 3 === 0) {
        result = "Fizz";
    } else if (n % 5 === 0) {
        result = "Buzz";
    } else {
        result = String(n);
    }
    return result;
}

console.log(fizzBuzz(15));
console.log(fizzBuzz(9));
console.log(fizzBuzz(10));
console.log(fizzBuzz(7));`,
    expectedOutput: "FizzBuzz\nFizz\nBuzz\n7",
    hint: "Check divisible by 15 first (both 3 and 5), then 3, then 5.",
    judgeFeedback: {
      summary: "The order of divisibility checks matters — check 15 first.",
      lines: [
        { line: 3, problem: "Check n % 15 before n % 3 or n % 5", fix: "if (n % 15 === 0) result = 'FizzBuzz' else if (n % 3 === 0) ..." }
      ]
    }
  },
  {
    lang: "TypeScript", topic: "Functions", level: 2,
    title: "Array Flattener",
    task: "Write a function that flattens a 2D array into a 1D array. Print the result.",
    code: `function flatten(arr: number[][]): number[] {
    let result: number[] = [];
    // YOUR CODE HERE

    return result;
}

console.log(flatten([[1, 2], [3, 4], [5]]).join(", "));`,
    solutionCode: `function flatten(arr: number[][]): number[] {
    let result: number[] = [];
    for (const sub of arr) {
        for (const n of sub) {
            result.push(n);
        }
    }
    return result;
}

console.log(flatten([[1, 2], [3, 4], [5]]).join(", "));`,
    expectedOutput: "1, 2, 3, 4, 5",
    hint: "Use nested loops or .flat() to flatten the 2D array.",
    judgeFeedback: {
      summary: "Need to iterate through sub-arrays and push elements.",
      lines: [
        { line: 3, problem: "Missing nested loop or flat()", fix: "for (const sub of arr) { for (const n of sub) { result.push(n); } }" }
      ]
    },
    altMethods: [
      { name: "Using .flat()", code: `function flatten(arr: number[][]): number[] {
    return arr.flat();
}

console.log(flatten([[1, 2], [3, 4], [5]]).join(", "));`, explanation: "Array.flat() is the built-in ES2019 method for flattening arrays." },
      { name: "Using reduce + concat", code: `function flatten(arr: number[][]): number[] {
    return arr.reduce((acc, sub) => acc.concat(sub), []);
}

console.log(flatten([[1, 2], [3, 4], [5]]).join(", "));`, explanation: "Functional approach using reduce to concatenate sub-arrays." }
    ]
  },

  // Objects × 2
  {
    lang: "TypeScript", topic: "Objects", level: 1,
    title: "Object Property Counter",
    task: "Count the number of properties in the object and print the count.",
    code: `const person: Record<string, string | number> = {
    name: "Alice",
    age: 30,
    city: "Tokyo",
    job: "Engineer"
};
let count: number = 0;
// YOUR CODE HERE

console.log(count);`,
    solutionCode: `const person: Record<string, string | number> = {
    name: "Alice",
    age: 30,
    city: "Tokyo",
    job: "Engineer"
};
let count: number = 0;
count = Object.keys(person).length;
console.log(count);`,
    expectedOutput: "4",
    hint: "Use Object.keys() to get an array of property names, then check its length.",
    judgeFeedback: {
      summary: "Missing Object.keys() call.",
      lines: [
        { line: 8, problem: "Need to count object keys", fix: "count = Object.keys(person).length" }
      ]
    }
  },
  {
    lang: "TypeScript", topic: "Objects", level: 2,
    title: "Merge Objects",
    task: "Merge two objects into one. If keys overlap, the second object's values win. Print the result as JSON.",
    code: `const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { b: 20, c: 30, d: 40 };
let merged: Record<string, number> = {};
// YOUR CODE HERE

console.log(JSON.stringify(merged));`,
    solutionCode: `const obj1 = { a: 1, b: 2, c: 3 };
const obj2 = { b: 20, c: 30, d: 40 };
let merged: Record<string, number> = {};
merged = { ...obj1, ...obj2 };
console.log(JSON.stringify(merged));`,
    expectedOutput: '{"a":1,"b":20,"c":30,"d":40}',
    hint: "Use the spread operator: { ...obj1, ...obj2 }",
    judgeFeedback: {
      summary: "Missing spread operator for object merging.",
      lines: [
        { line: 4, problem: "Need to merge with spread", fix: "merged = { ...obj1, ...obj2 }" }
      ]
    }
  },

  // Union Types × 2
  {
    lang: "TypeScript", topic: "Union Types", level: 1,
    title: "Shape Area Calculator",
    task: "Calculate the area of a circle (type: 'circle', radius) or rectangle (type: 'rect', width, height). Print the area rounded to 2 decimal places.",
    code: `type Shape =
    | { type: "circle"; radius: number }
    | { type: "rect"; width: number; height: number };

function area(shape: Shape): number {
    let result: number = 0;
    // YOUR CODE HERE

    return result;
}

console.log(area({ type: "circle", radius: 5 }).toFixed(2));
console.log(area({ type: "rect", width: 4, height: 6 }).toFixed(2));`,
    solutionCode: `type Shape =
    | { type: "circle"; radius: number }
    | { type: "rect"; width: number; height: number };

function area(shape: Shape): number {
    let result: number = 0;
    if (shape.type === "circle") {
        result = Math.PI * shape.radius * shape.radius;
    } else {
        result = shape.width * shape.height;
    }
    return result;
}

console.log(area({ type: "circle", radius: 5 }).toFixed(2));
console.log(area({ type: "rect", width: 4, height: 6 }).toFixed(2));`,
    expectedOutput: "78.54\n24.00",
    hint: "Use shape.type to discriminate, then access the correct properties.",
    judgeFeedback: {
      summary: "Missing discriminated union check on shape.type.",
      lines: [
        { line: 7, problem: "Check shape.type to determine which formula to use", fix: "if (shape.type === 'circle') { result = Math.PI * r * r; } else { result = w * h; }" }
      ]
    }
  },
  {
    lang: "TypeScript", topic: "Union Types", level: 2,
    title: "Result Type Handler",
    task: "Process a Result type that is either { ok: true, value: number } or { ok: false, error: string }. Print the value or error message.",
    code: `type Result =
    | { ok: true; value: number }
    | { ok: false; error: string };

function handleResult(r: Result): string {
    let output: string = "";
    // YOUR CODE HERE

    return output;
}

console.log(handleResult({ ok: true, value: 42 }));
console.log(handleResult({ ok: false, error: "Not found" }));`,
    solutionCode: `type Result =
    | { ok: true; value: number }
    | { ok: false; error: string };

function handleResult(r: Result): string {
    let output: string = "";
    if (r.ok) {
        output = "Success: " + r.value;
    } else {
        output = "Error: " + r.error;
    }
    return output;
}

console.log(handleResult({ ok: true, value: 42 }));
console.log(handleResult({ ok: false, error: "Not found" }));`,
    expectedOutput: "Success: 42\nError: Not found",
    hint: "Check r.ok to narrow the type, then access value or error.",
    judgeFeedback: {
      summary: "Missing r.ok check for type narrowing.",
      lines: [
        { line: 7, problem: "Need to check r.ok", fix: "if (r.ok) { output = 'Success: ' + r.value; } else { output = 'Error: ' + r.error; }" }
      ]
    }
  },
];

// SQL Practices (10)

const SQL_PRACTICES: DemoPractice[] = [
  // SELECT Basics × 2
  {
    lang: "SQL", topic: "SELECT Basics", level: 1,
    title: "Select All Users",
    task: "Write a query to select all columns from the 'users' table.",
    code: "-- Write your SELECT query below\n",
    solutionCode: "SELECT * FROM users;",
    expectedOutput: "",
    hint: "Use SELECT * FROM table_name to select all columns.",
    judgeFeedback: {
      summary: "Missing SELECT statement.",
      lines: [{ line: 1, problem: "Need a SELECT query", fix: "SELECT * FROM users;" }]
    }
  },
  {
    lang: "SQL", topic: "SELECT Basics", level: 2,
    title: "Select Specific Columns",
    task: "Select only the 'name' and 'age' columns from the 'users' table, ordered by age descending.",
    code: "-- Select name and age, ordered by age descending\n",
    solutionCode: "SELECT name, age FROM users ORDER BY age DESC;",
    expectedOutput: "",
    hint: "List column names after SELECT, use ORDER BY column DESC.",
    judgeFeedback: {
      summary: "Missing column specification or ORDER BY clause.",
      lines: [{ line: 1, problem: "Specify columns and add ORDER BY", fix: "SELECT name, age FROM users ORDER BY age DESC;" }]
    }
  },

  // WHERE × 2
  {
    lang: "SQL", topic: "WHERE", level: 1,
    title: "Filter by Age",
    task: "Select users who are older than 25.",
    code: "-- Select users with age > 25\n",
    solutionCode: "SELECT * FROM users WHERE age > 25;",
    expectedOutput: "",
    hint: "Use WHERE clause with a comparison operator.",
    judgeFeedback: {
      summary: "Missing WHERE clause.",
      lines: [{ line: 1, problem: "Need WHERE condition", fix: "SELECT * FROM users WHERE age > 25;" }]
    }
  },
  {
    lang: "SQL", topic: "WHERE", level: 2,
    title: "Multiple Conditions",
    task: "Select users who are between 25 and 35 years old AND live in 'Tokyo'.",
    code: "-- Select users: age 25-35 AND city = 'Tokyo'\n",
    solutionCode: "SELECT * FROM users WHERE age BETWEEN 25 AND 35 AND city = 'Tokyo';",
    expectedOutput: "",
    hint: "Use BETWEEN for range and AND to combine conditions.",
    judgeFeedback: {
      summary: "Missing BETWEEN or AND in WHERE clause.",
      lines: [{ line: 1, problem: "Combine range and equality conditions", fix: "WHERE age BETWEEN 25 AND 35 AND city = 'Tokyo'" }]
    }
  },

  // JOIN Basics × 2
  {
    lang: "SQL", topic: "JOIN Basics", level: 1,
    title: "Inner Join Users and Orders",
    task: "Join the 'users' and 'orders' tables to show user names with their ordered products.",
    code: "-- Join users and orders tables\n",
    solutionCode: "SELECT u.name, o.product FROM users u JOIN orders o ON u.id = o.user_id;",
    expectedOutput: "",
    hint: "Use JOIN ... ON to connect tables by their foreign key relationship.",
    judgeFeedback: {
      summary: "Missing JOIN clause or ON condition.",
      lines: [{ line: 1, problem: "Need JOIN with ON condition", fix: "SELECT u.name, o.product FROM users u JOIN orders o ON u.id = o.user_id;" }]
    }
  },
  {
    lang: "SQL", topic: "JOIN Basics", level: 2,
    title: "Left Join with Null Check",
    task: "Show all users and their orders. Users without orders should show NULL for the product.",
    code: "-- Left join to include users without orders\n",
    solutionCode: "SELECT u.name, o.product FROM users u LEFT JOIN orders o ON u.id = o.user_id;",
    expectedOutput: "",
    hint: "Use LEFT JOIN to include all rows from the left table.",
    judgeFeedback: {
      summary: "Using INNER JOIN instead of LEFT JOIN.",
      lines: [{ line: 1, problem: "Need LEFT JOIN to include unmatched users", fix: "Use LEFT JOIN instead of JOIN" }]
    }
  },

  // GROUP BY × 2
  {
    lang: "SQL", topic: "GROUP BY", level: 1,
    title: "Count Users per City",
    task: "Count the number of users in each city.",
    code: "-- Count users grouped by city\n",
    solutionCode: "SELECT city, COUNT(*) as count FROM users GROUP BY city;",
    expectedOutput: "",
    hint: "Use GROUP BY with COUNT(*) aggregate function.",
    judgeFeedback: {
      summary: "Missing GROUP BY or COUNT() function.",
      lines: [{ line: 1, problem: "Need GROUP BY with aggregate", fix: "SELECT city, COUNT(*) FROM users GROUP BY city;" }]
    }
  },
  {
    lang: "SQL", topic: "GROUP BY", level: 2,
    title: "Total Spending per User",
    task: "Calculate the total order amount per user. Only show users who spent more than 500.",
    code: "-- Total spending per user, filtered by total > 500\n",
    solutionCode: "SELECT u.name, SUM(o.amount) as total FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.id HAVING SUM(o.amount) > 500;",
    expectedOutput: "",
    hint: "Use HAVING (not WHERE) to filter on aggregate results.",
    judgeFeedback: {
      summary: "Using WHERE instead of HAVING for aggregate filter.",
      lines: [{ line: 1, problem: "Filter aggregates with HAVING, not WHERE", fix: "GROUP BY u.id HAVING SUM(o.amount) > 500" }]
    }
  },

  // ORDER BY × 2
  {
    lang: "SQL", topic: "ORDER BY", level: 1,
    title: "Sort by Name",
    task: "Select all users and sort them alphabetically by name.",
    code: "-- Select all users sorted by name\n",
    solutionCode: "SELECT * FROM users ORDER BY name ASC;",
    expectedOutput: "",
    hint: "Add ORDER BY column_name at the end of your query.",
    judgeFeedback: {
      summary: "Missing ORDER BY clause.",
      lines: [{ line: 1, problem: "Need ORDER BY for sorting", fix: "SELECT * FROM users ORDER BY name ASC;" }]
    }
  },
  {
    lang: "SQL", topic: "ORDER BY", level: 2,
    title: "Top 3 Expensive Orders",
    task: "Select the top 3 orders with the highest amounts.",
    code: "-- Select top 3 orders by amount\n",
    solutionCode: "SELECT * FROM orders ORDER BY amount DESC LIMIT 3;",
    expectedOutput: "",
    hint: "Use ORDER BY ... DESC with LIMIT to get top N results.",
    judgeFeedback: {
      summary: "Missing LIMIT or wrong ORDER direction.",
      lines: [{ line: 1, problem: "Need DESC order and LIMIT 3", fix: "ORDER BY amount DESC LIMIT 3" }]
    }
  },
];

// Combined

export const DEMO_PRACTICES: DemoPractice[] = [
  ...JAVA_PRACTICES,
  ...TS_PRACTICES,
  ...SQL_PRACTICES,
  ...(OFFLINE_JAVA as DemoPractice[]),
  ...(OFFLINE_TS as DemoPractice[]),
  ...(OFFLINE_SQL as DemoPractice[]),
];
