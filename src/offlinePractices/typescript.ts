import type { OfflinePractice } from "../practiceRandomizer";

export const TYPESCRIPT_PRACTICES: OfflinePractice[] = [
  // ============================================================
  // TYPE BASICS — Level 1
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Type Basics",
    level: 1,
    title: "Typed Variables",
    task: "Declare three typed variables: a string called `greeting` with value \"Hello, TypeScript!\", a number called `year` with value 2026, and a boolean called `isActive` with value true. Print each variable on its own line.",
    code: `// Typed Variables
// Declare variables with explicit type annotations and print them

// YOUR CODE HERE
`,
    solutionCode: `// Typed Variables
const greeting: string = "Hello, TypeScript!";
const year: number = 2026;
const isActive: boolean = true;

console.log(greeting);
console.log(year);
console.log(isActive);
`,
    expectedOutput: `Hello, TypeScript!
2026
true`,
    testCases: [
      { input: "const greeting = \"Hello, TypeScript!\"; const year = 2026; const isActive = true", output: "Hello, TypeScript!\n2026\ntrue" },
      { input: "const greeting = \"Hi there!\"; const year = 2025; const isActive = false", output: "Hi there!\n2025\nfalse" },
      { input: "const greeting = \"Goodbye\"; const year = 2030; const isActive = true", output: "Goodbye\n2030\ntrue" },
    ],
    hint: "Use the syntax `const variableName: type = value;` to declare typed variables. TypeScript's basic types include string, number, and boolean.",
    judgeFeedback: {
      summary: "Check that each variable has an explicit type annotation and uses const.",
      lines: [
        { line: 2, problem: "Missing type annotation on greeting", fix: "Add `: string` after the variable name: `const greeting: string = \"Hello, TypeScript!\";`" },
        { line: 3, problem: "Using let instead of const for immutable value", fix: "Use `const` for values that won't change" },
        { line: 5, problem: "Missing console.log statements", fix: "Print each variable with `console.log(variableName);`" }
      ]
    },
    altMethods: [
      {
        name: "Using let with type annotations",
        code: `let greeting: string = "Hello, TypeScript!";
let year: number = 2026;
let isActive: boolean = true;

console.log(greeting);
console.log(year);
console.log(isActive);
`,
        explanation: "Using `let` instead of `const` also works, but `const` is preferred when the value won't be reassigned."
      },
      {
        name: "Using type inference",
        code: `const greeting = "Hello, TypeScript!";
const year = 2026;
const isActive = true;

console.log(greeting);
console.log(year);
console.log(isActive);
`,
        explanation: "TypeScript can infer types from assigned values. While explicit annotations are optional here, they make the code more readable and are good practice for learning."
      }
    ],
    crossLang: {
      python: {
        code: `# Python has no static types (but supports type hints)
greeting: str = "Hello, TypeScript!"
year: int = 2026
is_active: bool = True

print(greeting)
print(year)
print(is_active)
`,
        highlights: [
          { lines: [1], explanation: "Python type hints use `: type` syntax similar to TypeScript but are not enforced at runtime." },
          { lines: [4], explanation: "Python uses True/False (capitalized) instead of true/false." }
        ]
      },
      java: {
        code: `public class Main {
    public static void main(String[] args) {
        String greeting = "Hello, TypeScript!";
        int year = 2026;
        boolean isActive = true;

        System.out.println(greeting);
        System.out.println(year);
        System.out.println(isActive);
    }
}
`,
        highlights: [
          { lines: [3, 4, 5], explanation: "Java uses type names before variables (String, int, boolean) instead of after with a colon." },
          { lines: [7, 8, 9], explanation: "Java uses System.out.println() instead of console.log()." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Type Basics",
    level: 1,
    title: "Typed Array",
    task: "Create a typed array of numbers called `scores` containing [85, 92, 78, 95, 88]. Print each element on its own line using a for...of loop, then print the length of the array.",
    code: `// Typed Array
// Create a typed number array and print its elements

// YOUR CODE HERE
`,
    solutionCode: `// Typed Array
const scores: number[] = [85, 92, 78, 95, 88];

for (const score of scores) {
  console.log(score);
}
console.log(scores.length);
`,
    expectedOutput: `85
92
78
95
88
5`,
    testCases: [
      { input: "const scores = [85, 92, 78, 95, 88]", output: "85\n92\n78\n95\n88\n5" },
      { input: "const scores = [100, 50]", output: "100\n50\n2" },
      { input: "const scores = [42]", output: "42\n1" },
    ],
    hint: "Declare an array with type annotation `number[]` or `Array<number>`. Use a `for...of` loop to iterate over elements.",
    judgeFeedback: {
      summary: "Ensure the array has a type annotation and use for...of for iteration.",
      lines: [
        { line: 2, problem: "Missing type annotation on array", fix: "Add `: number[]` after the variable name" },
        { line: 4, problem: "Using index-based for loop instead of for...of", fix: "Use `for (const score of scores)` for cleaner iteration" }
      ]
    },
    altMethods: [
      {
        name: "Using Array generic syntax and forEach",
        code: `const scores: Array<number> = [85, 92, 78, 95, 88];

scores.forEach((score: number) => {
  console.log(score);
});
console.log(scores.length);
`,
        explanation: "Array<number> is equivalent to number[]. forEach is a functional approach to iteration."
      },
      {
        name: "Using traditional for loop",
        code: `const scores: number[] = [85, 92, 78, 95, 88];

for (let i: number = 0; i < scores.length; i++) {
  console.log(scores[i]);
}
console.log(scores.length);
`,
        explanation: "A traditional for loop gives you access to the index, which can be useful when you need the position of each element."
      }
    ],
    crossLang: {
      python: {
        code: `scores: list[int] = [85, 92, 78, 95, 88]

for score in scores:
    print(score)
print(len(scores))
`,
        highlights: [
          { lines: [1], explanation: "Python uses list[int] type hint (Python 3.9+) instead of number[]." },
          { lines: [3], explanation: "Python for loop doesn't need const/let keywords." },
          { lines: [5], explanation: "Python uses len() function instead of .length property." }
        ]
      },
      java: {
        code: `public class Main {
    public static void main(String[] args) {
        int[] scores = {85, 92, 78, 95, 88};

        for (int score : scores) {
            System.out.println(score);
        }
        System.out.println(scores.length);
    }
}
`,
        highlights: [
          { lines: [3], explanation: "Java uses int[] for typed arrays with curly braces for initialization." },
          { lines: [5], explanation: "Java enhanced for loop uses colon (:) instead of 'of' keyword." }
        ]
      }
    }
  },

  // ============================================================
  // TYPE BASICS — Level 2
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Type Basics",
    level: 2,
    title: "Person Interface",
    task: "Create an interface called `Person` with properties: name (string), age (number), and email (string). Create two Person objects — one for Alice (age 30, alice@example.com) and one for Bob (age 25, bob@example.com). Print each person's info in the format: \"Name: <name>, Age: <age>, Email: <email>\".",
    code: `// Person Interface
// Define an interface and create objects that implement it

// YOUR CODE HERE
`,
    solutionCode: `// Person Interface
interface Person {
  name: string;
  age: number;
  email: string;
}

const alice: Person = { name: "Alice", age: 30, email: "alice@example.com" };
const bob: Person = { name: "Bob", age: 25, email: "bob@example.com" };

console.log(\`Name: \${alice.name}, Age: \${alice.age}, Email: \${alice.email}\`);
console.log(\`Name: \${bob.name}, Age: \${bob.age}, Email: \${bob.email}\`);
`,
    expectedOutput: `Name: Alice, Age: 30, Email: alice@example.com
Name: Bob, Age: 25, Email: bob@example.com`,
    testCases: [
      { input: "const name1 = \"Alice\"; const age1 = 30; const email1 = \"alice@example.com\"; const name2 = \"Bob\"; const age2 = 25; const email2 = \"bob@example.com\"", output: "Name: Alice, Age: 30, Email: alice@example.com\nName: Bob, Age: 25, Email: bob@example.com" },
      { input: "const name1 = \"Charlie\"; const age1 = 40; const email1 = \"charlie@test.com\"; const name2 = \"Diana\"; const age2 = 22; const email2 = \"diana@test.com\"", output: "Name: Charlie, Age: 40, Email: charlie@test.com\nName: Diana, Age: 22, Email: diana@test.com" },
      { input: "const name1 = \"Eve\"; const age1 = 18; const email1 = \"eve@dev.io\"; const name2 = \"Frank\"; const age2 = 65; const email2 = \"frank@dev.io\"", output: "Name: Eve, Age: 18, Email: eve@dev.io\nName: Frank, Age: 65, Email: frank@dev.io" },
    ],
    hint: "Define an interface using `interface Name { prop: type; }`. Create objects that match the interface shape and use template literals for formatted output.",
    judgeFeedback: {
      summary: "Check that the interface is properly defined and objects conform to it.",
      lines: [
        { line: 2, problem: "Using type alias instead of interface", fix: "Use `interface Person { ... }` for object shapes" },
        { line: 8, problem: "Missing a required property in object", fix: "Ensure all properties (name, age, email) are included" },
        { line: 11, problem: "String concatenation instead of template literals", fix: "Use template literals: `\\`Name: \\${person.name}\\``" }
      ]
    },
    altMethods: [
      {
        name: "Using type alias",
        code: `type Person = {
  name: string;
  age: number;
  email: string;
};

const alice: Person = { name: "Alice", age: 30, email: "alice@example.com" };
const bob: Person = { name: "Bob", age: 25, email: "bob@example.com" };

console.log(\`Name: \${alice.name}, Age: \${alice.age}, Email: \${alice.email}\`);
console.log(\`Name: \${bob.name}, Age: \${bob.age}, Email: \${bob.email}\`);
`,
        explanation: "A type alias with `type` works similarly to an interface for object shapes. Interfaces are generally preferred for objects because they can be extended."
      },
      {
        name: "Using a class",
        code: `class Person {
  constructor(
    public name: string,
    public age: number,
    public email: string
  ) {}

  toString(): string {
    return \`Name: \${this.name}, Age: \${this.age}, Email: \${this.email}\`;
  }
}

const alice = new Person("Alice", 30, "alice@example.com");
const bob = new Person("Bob", 25, "bob@example.com");

console.log(alice.toString());
console.log(bob.toString());
`,
        explanation: "A class provides a constructor and methods. The `public` keyword in constructor parameters automatically creates and assigns properties."
      }
    ],
    crossLang: {
      python: {
        code: `from dataclasses import dataclass

@dataclass
class Person:
    name: str
    age: int
    email: str

alice = Person(name="Alice", age=30, email="alice@example.com")
bob = Person(name="Bob", age=25, email="bob@example.com")

print(f"Name: {alice.name}, Age: {alice.age}, Email: {alice.email}")
print(f"Name: {bob.name}, Age: {bob.age}, Email: {bob.email}")
`,
        highlights: [
          { lines: [3, 4, 5, 6, 7], explanation: "Python uses dataclasses as the closest equivalent to TypeScript interfaces for structured data." },
          { lines: [12, 13], explanation: "Python f-strings are similar to TypeScript template literals." }
        ]
      },
      java: {
        code: `public class Main {
    record Person(String name, int age, String email) {}

    public static void main(String[] args) {
        Person alice = new Person("Alice", 30, "alice@example.com");
        Person bob = new Person("Bob", 25, "bob@example.com");

        System.out.println("Name: " + alice.name() + ", Age: " + alice.age() + ", Email: " + alice.email());
        System.out.println("Name: " + bob.name() + ", Age: " + bob.age() + ", Email: " + bob.email());
    }
}
`,
        highlights: [
          { lines: [2], explanation: "Java records (Java 16+) are similar to TypeScript interfaces for data objects." },
          { lines: [5, 6], explanation: "Java requires `new` keyword and constructor calls to create objects." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Type Basics",
    level: 2,
    title: "Enum Days of Week",
    task: "Create an enum called `Day` with values Monday through Sunday. Create a function `isWeekend(day: Day): boolean` that returns true for Saturday and Sunday. Test it with Monday, Friday, Saturday, and Sunday, printing the day name and whether it is a weekend in the format: \"Monday: false\", etc.",
    code: `// Enum Days of Week
// Create an enum and a function that checks if a day is a weekend

// YOUR CODE HERE
`,
    solutionCode: `// Enum Days of Week
enum Day {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday
}

function isWeekend(day: Day): boolean {
  return day === Day.Saturday || day === Day.Sunday;
}

console.log(\`Monday: \${isWeekend(Day.Monday)}\`);
console.log(\`Friday: \${isWeekend(Day.Friday)}\`);
console.log(\`Saturday: \${isWeekend(Day.Saturday)}\`);
console.log(\`Sunday: \${isWeekend(Day.Sunday)}\`);
`,
    expectedOutput: `Monday: false
Friday: false
Saturday: true
Sunday: true`,
    testCases: [
      { input: "const testDays = [\"Monday\", \"Friday\", \"Saturday\", \"Sunday\"]", output: "Monday: false\nFriday: false\nSaturday: true\nSunday: true" },
      { input: "const testDays = [\"Tuesday\", \"Wednesday\", \"Thursday\"]", output: "Tuesday: false\nWednesday: false\nThursday: false" },
      { input: "const testDays = [\"Saturday\", \"Sunday\", \"Saturday\"]", output: "Saturday: true\nSunday: true\nSaturday: true" },
    ],
    hint: "Define an enum with `enum Name { Value1, Value2, ... }`. Access values with `Name.Value`. Compare using `===`.",
    judgeFeedback: {
      summary: "Ensure the enum is properly defined and the function uses proper type checking.",
      lines: [
        { line: 2, problem: "Using string union instead of enum", fix: "Use `enum Day { Monday, Tuesday, ... }` for a proper enum" },
        { line: 12, problem: "Function missing return type annotation", fix: "Add `: boolean` after the parameters: `function isWeekend(day: Day): boolean`" }
      ]
    },
    altMethods: [
      {
        name: "Using string enum",
        code: `enum Day {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday"
}

function isWeekend(day: Day): boolean {
  return day === Day.Saturday || day === Day.Sunday;
}

console.log(\`Monday: \${isWeekend(Day.Monday)}\`);
console.log(\`Friday: \${isWeekend(Day.Friday)}\`);
console.log(\`Saturday: \${isWeekend(Day.Saturday)}\`);
console.log(\`Sunday: \${isWeekend(Day.Sunday)}\`);
`,
        explanation: "String enums assign string values to each member, making debugging easier since the values are readable in logs."
      },
      {
        name: "Using const enum and array check",
        code: `const enum Day {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday
}

function isWeekend(day: Day): boolean {
  const weekends = [Day.Saturday, Day.Sunday];
  return weekends.includes(day);
}

console.log(\`Monday: \${isWeekend(Day.Monday)}\`);
console.log(\`Friday: \${isWeekend(Day.Friday)}\`);
console.log(\`Saturday: \${isWeekend(Day.Saturday)}\`);
console.log(\`Sunday: \${isWeekend(Day.Sunday)}\`);
`,
        explanation: "A const enum is inlined at compile time for better performance. Using an array with includes() makes it easy to add more weekend days."
      }
    ],
    crossLang: {
      python: {
        code: `from enum import Enum

class Day(Enum):
    Monday = 0
    Tuesday = 1
    Wednesday = 2
    Thursday = 3
    Friday = 4
    Saturday = 5
    Sunday = 6

def is_weekend(day: Day) -> bool:
    return day in (Day.Saturday, Day.Sunday)

print(f"Monday: {str(is_weekend(Day.Monday)).lower()}")
print(f"Friday: {str(is_weekend(Day.Friday)).lower()}")
print(f"Saturday: {str(is_weekend(Day.Saturday)).lower()}")
print(f"Sunday: {str(is_weekend(Day.Sunday)).lower()}")
`,
        highlights: [
          { lines: [3, 4, 5, 6], explanation: "Python enums are defined as classes extending Enum." },
          { lines: [15], explanation: "Python booleans are True/False (capitalized), so we use .lower() to match TypeScript output." }
        ]
      },
      java: {
        code: `public class Main {
    enum Day {
        Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
    }

    static boolean isWeekend(Day day) {
        return day == Day.Saturday || day == Day.Sunday;
    }

    public static void main(String[] args) {
        System.out.println("Monday: " + isWeekend(Day.Monday));
        System.out.println("Friday: " + isWeekend(Day.Friday));
        System.out.println("Saturday: " + isWeekend(Day.Saturday));
        System.out.println("Sunday: " + isWeekend(Day.Sunday));
    }
}
`,
        highlights: [
          { lines: [2, 3, 4], explanation: "Java enums are defined with the enum keyword, similar to TypeScript." },
          { lines: [6], explanation: "Java uses == for enum comparison since enums are singletons." }
        ]
      }
    }
  },

  // ============================================================
  // UNION TYPES — Level 1
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Union Types",
    level: 1,
    title: "String or Number Function",
    task: "Create a function `formatValue(value: string | number): string` that returns \"String: <value>\" if the value is a string, or \"Number: <value>\" if the value is a number. Test it with the values \"hello\", 42, \"world\", and 100, printing each result.",
    code: `// String or Number Function
// Create a function that accepts a union type parameter

// YOUR CODE HERE
`,
    solutionCode: `// String or Number Function
function formatValue(value: string | number): string {
  if (typeof value === "string") {
    return \`String: \${value}\`;
  } else {
    return \`Number: \${value}\`;
  }
}

console.log(formatValue("hello"));
console.log(formatValue(42));
console.log(formatValue("world"));
console.log(formatValue(100));
`,
    expectedOutput: `String: hello
Number: 42
String: world
Number: 100`,
    testCases: [
      { input: "const val1 = \"hello\"; const val2 = 42; const val3 = \"world\"; const val4 = 100", output: "String: hello\nNumber: 42\nString: world\nNumber: 100" },
      { input: "const val1 = \"test\"; const val2 = 0; const val3 = \"\"; const val4 = -5", output: "String: test\nNumber: 0\nString: \nNumber: -5" },
      { input: "const val1 = \"abc\"; const val2 = 999; const val3 = \"xyz\"; const val4 = 1", output: "String: abc\nNumber: 999\nString: xyz\nNumber: 1" },
    ],
    hint: "Use `typeof` to check if a value is a string or number at runtime. The union type `string | number` allows either type as input.",
    judgeFeedback: {
      summary: "Ensure the function uses proper type narrowing with typeof checks.",
      lines: [
        { line: 2, problem: "Missing union type annotation", fix: "Use `value: string | number` for the parameter type" },
        { line: 3, problem: "Using == instead of === for type check", fix: "Use `typeof value === \"string\"` with strict equality" }
      ]
    },
    altMethods: [
      {
        name: "Using ternary operator",
        code: `function formatValue(value: string | number): string {
  return typeof value === "string" ? \`String: \${value}\` : \`Number: \${value}\`;
}

console.log(formatValue("hello"));
console.log(formatValue(42));
console.log(formatValue("world"));
console.log(formatValue(100));
`,
        explanation: "A ternary operator provides a concise single-expression alternative to if/else for simple conditions."
      },
      {
        name: "Using switch on typeof",
        code: `function formatValue(value: string | number): string {
  switch (typeof value) {
    case "string":
      return \`String: \${value}\`;
    case "number":
      return \`Number: \${value}\`;
  }
}

console.log(formatValue("hello"));
console.log(formatValue(42));
console.log(formatValue("world"));
console.log(formatValue(100));
`,
        explanation: "A switch statement on typeof is useful when you have more than two types in the union, making it easy to add cases."
      }
    ],
    crossLang: {
      python: {
        code: `def format_value(value: str | int) -> str:
    if isinstance(value, str):
        return f"String: {value}"
    else:
        return f"Number: {value}"

print(format_value("hello"))
print(format_value(42))
print(format_value("world"))
print(format_value(100))
`,
        highlights: [
          { lines: [1], explanation: "Python 3.10+ supports union types with | syntax, similar to TypeScript." },
          { lines: [2], explanation: "Python uses isinstance() instead of typeof for type checking." }
        ]
      },
      java: {
        code: `public class Main {
    static String formatValue(Object value) {
        if (value instanceof String) {
            return "String: " + value;
        } else {
            return "Number: " + value;
        }
    }

    public static void main(String[] args) {
        System.out.println(formatValue("hello"));
        System.out.println(formatValue(42));
        System.out.println(formatValue("world"));
        System.out.println(formatValue(100));
    }
}
`,
        highlights: [
          { lines: [2], explanation: "Java doesn't have union types; Object is used as a common supertype." },
          { lines: [3], explanation: "Java uses instanceof for type checking instead of typeof." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Union Types",
    level: 1,
    title: "Literal Type Directions",
    task: "Create a type `Direction` as a union of literal types: \"north\", \"south\", \"east\", \"west\". Write a function `move(direction: Direction): string` that returns \"Moving <direction>\". Test with all four directions.",
    code: `// Literal Type Directions
// Create a literal union type for directions

// YOUR CODE HERE
`,
    solutionCode: `// Literal Type Directions
type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction): string {
  return \`Moving \${direction}\`;
}

console.log(move("north"));
console.log(move("south"));
console.log(move("east"));
console.log(move("west"));
`,
    expectedOutput: `Moving north
Moving south
Moving east
Moving west`,
    testCases: [
      { input: "const dirs = [\"north\", \"south\", \"east\", \"west\"]", output: "Moving north\nMoving south\nMoving east\nMoving west" },
      { input: "const dirs = [\"east\", \"east\", \"north\"]", output: "Moving east\nMoving east\nMoving north" },
      { input: "const dirs = [\"west\"]", output: "Moving west" },
    ],
    hint: "Use `type Name = \"value1\" | \"value2\"` to create a union of string literal types. This restricts the parameter to only those exact strings.",
    judgeFeedback: {
      summary: "Check that the type uses string literals and the function has proper type annotations.",
      lines: [
        { line: 2, problem: "Using plain string type instead of literals", fix: "Use `type Direction = \"north\" | \"south\" | \"east\" | \"west\"` for exact string values" },
        { line: 4, problem: "Missing return type annotation", fix: "Add `: string` return type to the function" }
      ]
    },
    altMethods: [
      {
        name: "Using enum instead of literal types",
        code: `enum Direction {
  North = "north",
  South = "south",
  East = "east",
  West = "west"
}

function move(direction: Direction): string {
  return \`Moving \${direction}\`;
}

console.log(move(Direction.North));
console.log(move(Direction.South));
console.log(move(Direction.East));
console.log(move(Direction.West));
`,
        explanation: "Enums provide named constants and can be used similarly to literal union types. They offer autocompletion in IDEs."
      },
      {
        name: "Using as const array",
        code: `const DIRECTIONS = ["north", "south", "east", "west"] as const;
type Direction = typeof DIRECTIONS[number];

function move(direction: Direction): string {
  return \`Moving \${direction}\`;
}

console.log(move("north"));
console.log(move("south"));
console.log(move("east"));
console.log(move("west"));
`,
        explanation: "Using `as const` with an array creates a readonly tuple, and `typeof arr[number]` extracts the union type from it. This avoids repeating values."
      }
    ],
    crossLang: {
      python: {
        code: `from typing import Literal

Direction = Literal["north", "south", "east", "west"]

def move(direction: str) -> str:
    return f"Moving {direction}"

print(move("north"))
print(move("south"))
print(move("east"))
print(move("west"))
`,
        highlights: [
          { lines: [3], explanation: "Python uses typing.Literal for literal types, similar to TypeScript's string literal unions." },
          { lines: [5], explanation: "Python type hints are not enforced at runtime, unlike TypeScript's compile-time checks." }
        ]
      },
      java: {
        code: `public class Main {
    enum Direction {
        NORTH("north"), SOUTH("south"), EAST("east"), WEST("west");

        private final String value;
        Direction(String value) { this.value = value; }
        public String getValue() { return value; }
    }

    static String move(Direction direction) {
        return "Moving " + direction.getValue();
    }

    public static void main(String[] args) {
        System.out.println(move(Direction.NORTH));
        System.out.println(move(Direction.SOUTH));
        System.out.println(move(Direction.EAST));
        System.out.println(move(Direction.WEST));
    }
}
`,
        highlights: [
          { lines: [2, 3, 4, 5, 6, 7], explanation: "Java uses enums with string fields as the closest equivalent to TypeScript literal union types." }
        ]
      }
    }
  },

  // ============================================================
  // UNION TYPES — Level 2
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Union Types",
    level: 2,
    title: "Type Narrowing with typeof",
    task: "Create a function `describe(value: string | number | boolean): string` that returns:\n- For strings: \"Text with <length> characters\"\n- For numbers: \"Number is <even/odd>\"\n- For booleans: \"Boolean is <true/false>\"\nTest with \"hello\", 7, true, and 42.",
    code: `// Type Narrowing with typeof
// Use typeof checks to narrow union types

// YOUR CODE HERE
`,
    solutionCode: `// Type Narrowing with typeof
function describe(value: string | number | boolean): string {
  if (typeof value === "string") {
    return \`Text with \${value.length} characters\`;
  } else if (typeof value === "number") {
    return \`Number is \${value % 2 === 0 ? "even" : "odd"}\`;
  } else {
    return \`Boolean is \${value}\`;
  }
}

console.log(describe("hello"));
console.log(describe(7));
console.log(describe(true));
console.log(describe(42));
`,
    expectedOutput: `Text with 5 characters
Number is odd
Boolean is true
Number is even`,
    testCases: [
      { input: "const val1 = \"hello\"; const val2 = 7; const val3 = true; const val4 = 42", output: "Text with 5 characters\nNumber is odd\nBoolean is true\nNumber is even" },
      { input: "const val1 = \"\"; const val2 = 0; const val3 = false; const val4 = 1", output: "Text with 0 characters\nNumber is even\nBoolean is false\nNumber is odd" },
      { input: "const val1 = \"TypeScript\"; const val2 = 100; const val3 = true; const val4 = 99", output: "Text with 10 characters\nNumber is even\nBoolean is true\nNumber is odd" },
    ],
    hint: "Use `typeof value === \"string\"` to narrow the type. Inside each branch, TypeScript knows the exact type, giving you access to type-specific properties like `.length`.",
    judgeFeedback: {
      summary: "Ensure proper type narrowing with typeof and correct return values for each type.",
      lines: [
        { line: 3, problem: "Not checking all union members", fix: "Check for string, number, and boolean using typeof" },
        { line: 6, problem: "Wrong even/odd logic", fix: "Use `value % 2 === 0` to check for even numbers" }
      ]
    },
    altMethods: [
      {
        name: "Using switch statement",
        code: `function describe(value: string | number | boolean): string {
  switch (typeof value) {
    case "string":
      return \`Text with \${value.length} characters\`;
    case "number":
      return \`Number is \${value % 2 === 0 ? "even" : "odd"}\`;
    case "boolean":
      return \`Boolean is \${value}\`;
  }
}

console.log(describe("hello"));
console.log(describe(7));
console.log(describe(true));
console.log(describe(42));
`,
        explanation: "A switch on typeof is cleaner when handling multiple types. TypeScript narrows the type within each case block."
      },
      {
        name: "Using a type guard map",
        code: `type Describer = {
  string: (v: string) => string;
  number: (v: number) => string;
  boolean: (v: boolean) => string;
};

const describers: Describer = {
  string: (v) => \`Text with \${v.length} characters\`,
  number: (v) => \`Number is \${v % 2 === 0 ? "even" : "odd"}\`,
  boolean: (v) => \`Boolean is \${v}\`,
};

function describe(value: string | number | boolean): string {
  const t = typeof value as keyof Describer;
  return (describers[t] as (v: any) => string)(value);
}

console.log(describe("hello"));
console.log(describe(7));
console.log(describe(true));
console.log(describe(42));
`,
        explanation: "This approach uses a lookup object to map types to handler functions, making it easy to add new types without modifying the main function."
      }
    ],
    crossLang: {
      python: {
        code: `def describe(value: str | int | bool) -> str:
    if isinstance(value, bool):
        return f"Boolean is {str(value).lower()}"
    elif isinstance(value, str):
        return f"Text with {len(value)} characters"
    elif isinstance(value, int):
        return f"Number is {'even' if value % 2 == 0 else 'odd'}"
    return ""

print(describe("hello"))
print(describe(7))
print(describe(True))
print(describe(42))
`,
        highlights: [
          { lines: [2], explanation: "In Python, bool must be checked before int because bool is a subclass of int." },
          { lines: [3], explanation: "Python's True/False must be converted with str().lower() to match 'true'/'false'." }
        ]
      },
      java: {
        code: `public class Main {
    static String describe(Object value) {
        if (value instanceof String s) {
            return "Text with " + s.length() + " characters";
        } else if (value instanceof Integer n) {
            return "Number is " + (n % 2 == 0 ? "even" : "odd");
        } else if (value instanceof Boolean b) {
            return "Boolean is " + b;
        }
        return "";
    }

    public static void main(String[] args) {
        System.out.println(describe("hello"));
        System.out.println(describe(7));
        System.out.println(describe(true));
        System.out.println(describe(42));
    }
}
`,
        highlights: [
          { lines: [3], explanation: "Java 16+ pattern matching with instanceof allows binding the variable in the check." },
          { lines: [5], explanation: "Java uses wrapper types (Integer, Boolean) for instanceof checks with primitives." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Union Types",
    level: 2,
    title: "Discriminated Unions with Shapes",
    task: "Create discriminated union types for shapes:\n- `Circle` with kind: \"circle\" and radius: number\n- `Rectangle` with kind: \"rectangle\", width: number, height: number\n- `Triangle` with kind: \"triangle\", base: number, height: number\nWrite a function `area(shape: Shape): number` that calculates the area (use Math.PI for circle, round to 2 decimal places with toFixed). Print the area for a circle (radius 5), rectangle (3x4), and triangle (6, height 4).",
    code: `// Discriminated Unions with Shapes
// Create shape types with a discriminant property

// YOUR CODE HERE
`,
    solutionCode: `// Discriminated Unions with Shapes
interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function area(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      return (Math.PI * shape.radius * shape.radius).toFixed(2);
    case "rectangle":
      return (shape.width * shape.height).toFixed(2);
    case "triangle":
      return (0.5 * shape.base * shape.height).toFixed(2);
  }
}

const c: Circle = { kind: "circle", radius: 5 };
const r: Rectangle = { kind: "rectangle", width: 3, height: 4 };
const t: Triangle = { kind: "triangle", base: 6, height: 4 };

console.log(\`Circle area: \${area(c)}\`);
console.log(\`Rectangle area: \${area(r)}\`);
console.log(\`Triangle area: \${area(t)}\`);
`,
    expectedOutput: `Circle area: 78.54
Rectangle area: 12.00
Triangle area: 12.00`,
    testCases: [
      { input: "const cRadius = 5; const rWidth = 3; const rHeight = 4; const tBase = 6; const tHeight = 4", output: "Circle area: 78.54\nRectangle area: 12.00\nTriangle area: 12.00" },
      { input: "const cRadius = 1; const rWidth = 10; const rHeight = 5; const tBase = 8; const tHeight = 3", output: "Circle area: 3.14\nRectangle area: 50.00\nTriangle area: 12.00" },
      { input: "const cRadius = 10; const rWidth = 7; const rHeight = 7; const tBase = 10; const tHeight = 10", output: "Circle area: 314.16\nRectangle area: 49.00\nTriangle area: 50.00" },
    ],
    hint: "A discriminated union uses a common property (like `kind`) with literal types to distinguish between variants. Use a switch statement on the discriminant property.",
    judgeFeedback: {
      summary: "Check that each shape interface has a kind property with a string literal type.",
      lines: [
        { line: 3, problem: "Missing literal type for kind property", fix: "Use `kind: \"circle\"` (literal string type) not `kind: string`" },
        { line: 21, problem: "Not using switch for exhaustive checking", fix: "Use `switch (shape.kind)` for type narrowing with discriminated unions" }
      ]
    },
    altMethods: [
      {
        name: "Using if-else chain with type predicates",
        code: `interface Circle { kind: "circle"; radius: number; }
interface Rectangle { kind: "rectangle"; width: number; height: number; }
interface Triangle { kind: "triangle"; base: number; height: number; }
type Shape = Circle | Rectangle | Triangle;

function area(shape: Shape): string {
  if (shape.kind === "circle") {
    return (Math.PI * shape.radius * shape.radius).toFixed(2);
  } else if (shape.kind === "rectangle") {
    return (shape.width * shape.height).toFixed(2);
  } else {
    return (0.5 * shape.base * shape.height).toFixed(2);
  }
}

const c: Circle = { kind: "circle", radius: 5 };
const r: Rectangle = { kind: "rectangle", width: 3, height: 4 };
const t: Triangle = { kind: "triangle", base: 6, height: 4 };

console.log(\`Circle area: \${area(c)}\`);
console.log(\`Rectangle area: \${area(r)}\`);
console.log(\`Triangle area: \${area(t)}\`);
`,
        explanation: "An if-else chain works the same as switch for discriminated unions. TypeScript narrows the type in each branch."
      },
      {
        name: "Using a record of calculators",
        code: `interface Circle { kind: "circle"; radius: number; }
interface Rectangle { kind: "rectangle"; width: number; height: number; }
interface Triangle { kind: "triangle"; base: number; height: number; }
type Shape = Circle | Rectangle | Triangle;

const calculators: Record<Shape["kind"], (shape: any) => number> = {
  circle: (s: Circle) => Math.PI * s.radius * s.radius,
  rectangle: (s: Rectangle) => s.width * s.height,
  triangle: (s: Triangle) => 0.5 * s.base * s.height,
};

function area(shape: Shape): string {
  return calculators[shape.kind](shape).toFixed(2);
}

const c: Circle = { kind: "circle", radius: 5 };
const r: Rectangle = { kind: "rectangle", width: 3, height: 4 };
const t: Triangle = { kind: "triangle", base: 6, height: 4 };

console.log(\`Circle area: \${area(c)}\`);
console.log(\`Rectangle area: \${area(r)}\`);
console.log(\`Triangle area: \${area(t)}\`);
`,
        explanation: "A Record maps each shape kind to its calculator function. This pattern is extensible — adding a new shape only requires adding a new entry."
      }
    ],
    crossLang: {
      python: {
        code: `import math
from dataclasses import dataclass

@dataclass
class Circle:
    kind: str = "circle"
    radius: float = 0

@dataclass
class Rectangle:
    kind: str = "rectangle"
    width: float = 0
    height: float = 0

@dataclass
class Triangle:
    kind: str = "triangle"
    base: float = 0
    height: float = 0

def area(shape) -> str:
    if shape.kind == "circle":
        return f"{math.pi * shape.radius ** 2:.2f}"
    elif shape.kind == "rectangle":
        return f"{shape.width * shape.height:.2f}"
    elif shape.kind == "triangle":
        return f"{0.5 * shape.base * shape.height:.2f}"
    return "0"

c = Circle(radius=5)
r = Rectangle(width=3, height=4)
t = Triangle(base=6, height=4)

print(f"Circle area: {area(c)}")
print(f"Rectangle area: {area(r)}")
print(f"Triangle area: {area(t)}")
`,
        highlights: [
          { lines: [21], explanation: "Python uses duck typing; there's no built-in discriminated union pattern, so we check the kind field manually." },
          { lines: [23], explanation: "Python's :.2f format specifier is equivalent to TypeScript's .toFixed(2)." }
        ]
      },
      java: {
        code: `public class Main {
    sealed interface Shape permits Circle, Rectangle, Triangle {}
    record Circle(double radius) implements Shape {}
    record Rectangle(double width, double height) implements Shape {}
    record Triangle(double base, double height) implements Shape {}

    static String area(Shape shape) {
        double result = switch (shape) {
            case Circle c -> Math.PI * c.radius() * c.radius();
            case Rectangle r -> r.width() * r.height();
            case Triangle t -> 0.5 * t.base() * t.height();
        };
        return String.format("%.2f", result);
    }

    public static void main(String[] args) {
        System.out.println("Circle area: " + area(new Circle(5)));
        System.out.println("Rectangle area: " + area(new Rectangle(3, 4)));
        System.out.println("Triangle area: " + area(new Triangle(6, 4)));
    }
}
`,
        highlights: [
          { lines: [2], explanation: "Java sealed interfaces (Java 17+) provide a similar pattern to TypeScript discriminated unions." },
          { lines: [8, 9, 10, 11], explanation: "Java pattern matching in switch expressions provides exhaustive type checking like TypeScript." }
        ]
      }
    }
  },

  // ============================================================
  // FUNCTIONS — Level 1
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Functions",
    level: 1,
    title: "Calculate Rectangle Area",
    task: "Write a typed function `calculateArea(width: number, height: number): number` that returns the area of a rectangle. Test it with dimensions (5, 3), (10, 7), and (4.5, 2.0). Print each result in the format: \"Area of 5x3 = 15\".",
    code: `// Calculate Rectangle Area
// Write a typed function to calculate the area of a rectangle

// YOUR CODE HERE
`,
    solutionCode: `// Calculate Rectangle Area
function calculateArea(width: number, height: number): number {
  return width * height;
}

console.log(\`Area of 5x3 = \${calculateArea(5, 3)}\`);
console.log(\`Area of 10x7 = \${calculateArea(10, 7)}\`);
console.log(\`Area of 4.5x2 = \${calculateArea(4.5, 2.0)}\`);
`,
    expectedOutput: `Area of 5x3 = 15
Area of 10x7 = 70
Area of 4.5x2 = 9`,
    testCases: [
      { input: "const w1 = 5; const h1 = 3; const w2 = 10; const h2 = 7; const w3 = 4.5; const h3 = 2.0", output: "Area of 5x3 = 15\nArea of 10x7 = 70\nArea of 4.5x2 = 9" },
      { input: "const w1 = 1; const h1 = 1; const w2 = 100; const h2 = 100; const w3 = 2.5; const h3 = 4.0", output: "Area of 1x1 = 1\nArea of 100x100 = 10000\nArea of 2.5x4 = 10" },
      { input: "const w1 = 0; const h1 = 5; const w2 = 3; const h2 = 3; const w3 = 7.5; const h3 = 2.0", output: "Area of 0x5 = 0\nArea of 3x3 = 9\nArea of 7.5x2 = 15" },
    ],
    hint: "Define a function with typed parameters and a return type annotation. Multiply width by height.",
    judgeFeedback: {
      summary: "Ensure the function has proper type annotations for parameters and return value.",
      lines: [
        { line: 2, problem: "Missing return type annotation", fix: "Add `: number` after the parameter list" },
        { line: 3, problem: "Not returning the calculated value", fix: "Use `return width * height;`" }
      ]
    },
    altMethods: [
      {
        name: "Using arrow function",
        code: `const calculateArea = (width: number, height: number): number => width * height;

console.log(\`Area of 5x3 = \${calculateArea(5, 3)}\`);
console.log(\`Area of 10x7 = \${calculateArea(10, 7)}\`);
console.log(\`Area of 4.5x2 = \${calculateArea(4.5, 2.0)}\`);
`,
        explanation: "Arrow functions provide a concise syntax. With a single expression, you can omit the braces and return keyword."
      },
      {
        name: "Using function type alias",
        code: `type AreaCalculator = (width: number, height: number) => number;

const calculateArea: AreaCalculator = (width, height) => width * height;

console.log(\`Area of 5x3 = \${calculateArea(5, 3)}\`);
console.log(\`Area of 10x7 = \${calculateArea(10, 7)}\`);
console.log(\`Area of 4.5x2 = \${calculateArea(4.5, 2.0)}\`);
`,
        explanation: "A function type alias defines the signature separately, allowing you to reuse it for multiple functions with the same shape."
      }
    ],
    crossLang: {
      python: {
        code: `def calculate_area(width: float, height: float) -> float:
    return width * height

print(f"Area of 5x3 = {int(calculate_area(5, 3))}")
print(f"Area of 10x7 = {int(calculate_area(10, 7))}")
print(f"Area of 4.5x2 = {int(calculate_area(4.5, 2.0))}")
`,
        highlights: [
          { lines: [1], explanation: "Python type hints use -> for return type, similar to TypeScript's : annotation." },
          { lines: [4], explanation: "Python prints floats with decimal point by default; int() is used to match TypeScript's integer output." }
        ]
      },
      java: {
        code: `public class Main {
    static double calculateArea(double width, double height) {
        return width * height;
    }

    public static void main(String[] args) {
        System.out.println("Area of 5x3 = " + (int) calculateArea(5, 3));
        System.out.println("Area of 10x7 = " + (int) calculateArea(10, 7));
        System.out.println("Area of 4.5x2 = " + (int) calculateArea(4.5, 2.0));
    }
}
`,
        highlights: [
          { lines: [2], explanation: "Java declares the return type before the method name, not after the parameters." },
          { lines: [7], explanation: "Java requires explicit casting with (int) to match TypeScript's integer output." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Functions",
    level: 1,
    title: "Optional and Default Parameters",
    task: "Write a function `greet(name: string, greeting?: string, punctuation: string = \"!\")` that returns a greeting string. If greeting is not provided, use \"Hello\". Test with:\n- greet(\"Alice\") => \"Hello Alice!\"\n- greet(\"Bob\", \"Hi\") => \"Hi Bob!\"\n- greet(\"Charlie\", \"Hey\", \".\") => \"Hey Charlie.\"",
    code: `// Optional and Default Parameters
// Write a function with optional and default parameters

// YOUR CODE HERE
`,
    solutionCode: `// Optional and Default Parameters
function greet(name: string, greeting?: string, punctuation: string = "!"): string {
  const g = greeting ?? "Hello";
  return \`\${g} \${name}\${punctuation}\`;
}

console.log(greet("Alice"));
console.log(greet("Bob", "Hi"));
console.log(greet("Charlie", "Hey", "."));
`,
    expectedOutput: `Hello Alice!
Hi Bob!
Hey Charlie.`,
    testCases: [
      { input: "const name1 = \"Alice\"; const name2 = \"Bob\"; const greeting2 = \"Hi\"; const name3 = \"Charlie\"; const greeting3 = \"Hey\"; const punct3 = \".\"", output: "Hello Alice!\nHi Bob!\nHey Charlie." },
      { input: "const name1 = \"Dan\"; const name2 = \"Eve\"; const greeting2 = \"Yo\"; const name3 = \"Fay\"; const greeting3 = \"Howdy\"; const punct3 = \"?\"", output: "Hello Dan!\nYo Eve!\nHowdy Fay?" },
      { input: "const name1 = \"World\"; const name2 = \"Friend\"; const greeting2 = \"Greetings\"; const name3 = \"Boss\"; const greeting3 = \"Dear\"; const punct3 = \"...\"", output: "Hello World!\nGreetings Friend!\nDear Boss..." },
    ],
    hint: "Use `?` after a parameter name to make it optional. Use `= value` to set a default. The nullish coalescing operator `??` provides a fallback for undefined values.",
    judgeFeedback: {
      summary: "Ensure optional parameter uses ? and default parameter uses = syntax.",
      lines: [
        { line: 2, problem: "Not marking greeting as optional", fix: "Add `?` after the parameter name: `greeting?: string`" },
        { line: 3, problem: "Using || instead of ?? for default", fix: "Use `??` (nullish coalescing) to only replace undefined/null, not empty strings" }
      ]
    },
    altMethods: [
      {
        name: "Using default parameter for greeting",
        code: `function greet(name: string, greeting: string = "Hello", punctuation: string = "!"): string {
  return \`\${greeting} \${name}\${punctuation}\`;
}

console.log(greet("Alice"));
console.log(greet("Bob", "Hi"));
console.log(greet("Charlie", "Hey", "."));
`,
        explanation: "Using a default value instead of optional + nullish coalescing is simpler when you always want a fallback value."
      },
      {
        name: "Using an options object",
        code: `interface GreetOptions {
  name: string;
  greeting?: string;
  punctuation?: string;
}

function greet({ name, greeting = "Hello", punctuation = "!" }: GreetOptions): string {
  return \`\${greeting} \${name}\${punctuation}\`;
}

console.log(greet({ name: "Alice" }));
console.log(greet({ name: "Bob", greeting: "Hi" }));
console.log(greet({ name: "Charlie", greeting: "Hey", punctuation: "." }));
`,
        explanation: "An options object pattern allows named parameters, making function calls more readable when there are many optional parameters."
      }
    ],
    crossLang: {
      python: {
        code: `def greet(name: str, greeting: str = "Hello", punctuation: str = "!") -> str:
    return f"{greeting} {name}{punctuation}"

print(greet("Alice"))
print(greet("Bob", "Hi"))
print(greet("Charlie", "Hey", "."))
`,
        highlights: [
          { lines: [1], explanation: "Python uses = for default values similar to TypeScript. Python doesn't have optional (?) parameters — use default values instead." }
        ]
      },
      java: {
        code: `public class Main {
    static String greet(String name, String greeting, String punctuation) {
        return greeting + " " + name + punctuation;
    }

    static String greet(String name, String greeting) {
        return greet(name, greeting, "!");
    }

    static String greet(String name) {
        return greet(name, "Hello", "!");
    }

    public static void main(String[] args) {
        System.out.println(greet("Alice"));
        System.out.println(greet("Bob", "Hi"));
        System.out.println(greet("Charlie", "Hey", "."));
    }
}
`,
        highlights: [
          { lines: [6, 7, 8, 10, 11, 12], explanation: "Java doesn't support optional or default parameters. Method overloading is used instead to simulate them." }
        ]
      }
    }
  },

  // ============================================================
  // FUNCTIONS — Level 2
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Functions",
    level: 2,
    title: "Generic Max Function",
    task: "Write a generic function `findMax<T>(arr: T[], compareFn: (a: T, b: T) => number): T` that returns the maximum element in an array using the compareFn. Test with:\n- Numbers [3, 7, 2, 9, 5]\n- Strings [\"banana\", \"apple\", \"cherry\"] (alphabetically last)\n- Objects [{name:\"Alice\",age:30}, {name:\"Bob\",age:25}, {name:\"Charlie\",age:35}] (max age)",
    code: `// Generic Max Function
// Write a generic function to find the maximum element

// YOUR CODE HERE
`,
    solutionCode: `// Generic Max Function
function findMax<T>(arr: T[], compareFn: (a: T, b: T) => number): T {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (compareFn(arr[i], max) > 0) {
      max = arr[i];
    }
  }
  return max;
}

const numbers: number[] = [3, 7, 2, 9, 5];
console.log(findMax(numbers, (a, b) => a - b));

const words: string[] = ["banana", "apple", "cherry"];
console.log(findMax(words, (a, b) => a.localeCompare(b)));

interface Person { name: string; age: number; }
const people: Person[] = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 }
];
const oldest = findMax(people, (a, b) => a.age - b.age);
console.log(\`\${oldest.name} (\${oldest.age})\`);
`,
    expectedOutput: `9
cherry
Charlie (35)`,
    testCases: [
      { input: "const numbers = [3, 7, 2, 9, 5]; const words = [\"banana\", \"apple\", \"cherry\"]; const people = [{ name: \"Alice\", age: 30 }, { name: \"Bob\", age: 25 }, { name: \"Charlie\", age: 35 }]", output: "9\ncherry\nCharlie (35)" },
      { input: "const numbers = [1]; const words = [\"zebra\", \"ant\"]; const people = [{ name: \"Dan\", age: 40 }, { name: \"Eve\", age: 40 }]", output: "1\nzebra\nDan (40)" },
      { input: "const numbers = [-3, -1, -7]; const words = [\"a\", \"b\", \"c\"]; const people = [{ name: \"Fay\", age: 1 }]", output: "-1\nc\nFay (1)" },
    ],
    hint: "Use `<T>` to define a generic type parameter. The compareFn should return a positive number if a > b, negative if a < b, and 0 if equal.",
    judgeFeedback: {
      summary: "Ensure the function uses generics properly and the compare function works correctly.",
      lines: [
        { line: 2, problem: "Not using generic type parameter", fix: "Add `<T>` after function name and use T for array and compare function types" },
        { line: 5, problem: "Wrong comparison logic", fix: "Use `compareFn(arr[i], max) > 0` to check if current element is greater" }
      ]
    },
    altMethods: [
      {
        name: "Using reduce",
        code: `function findMax<T>(arr: T[], compareFn: (a: T, b: T) => number): T {
  return arr.reduce((max, current) => compareFn(current, max) > 0 ? current : max);
}

const numbers: number[] = [3, 7, 2, 9, 5];
console.log(findMax(numbers, (a, b) => a - b));

const words: string[] = ["banana", "apple", "cherry"];
console.log(findMax(words, (a, b) => a.localeCompare(b)));

interface Person { name: string; age: number; }
const people: Person[] = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 }
];
const oldest = findMax(people, (a, b) => a.age - b.age);
console.log(\`\${oldest.name} (\${oldest.age})\`);
`,
        explanation: "Array.reduce() can accumulate the maximum value in a single pass, making the function more concise."
      },
      {
        name: "Using sort (non-mutating)",
        code: `function findMax<T>(arr: T[], compareFn: (a: T, b: T) => number): T {
  return [...arr].sort(compareFn).pop()!;
}

const numbers: number[] = [3, 7, 2, 9, 5];
console.log(findMax(numbers, (a, b) => a - b));

const words: string[] = ["banana", "apple", "cherry"];
console.log(findMax(words, (a, b) => a.localeCompare(b)));

interface Person { name: string; age: number; }
const people: Person[] = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 }
];
const oldest = findMax(people, (a, b) => a.age - b.age);
console.log(\`\${oldest.name} (\${oldest.age})\`);
`,
        explanation: "Spreading into a new array and sorting preserves the original. The last element after sorting is the maximum. The `!` asserts non-null since we know the array is non-empty."
      }
    ],
    crossLang: {
      python: {
        code: `from typing import TypeVar, Callable, List

T = TypeVar("T")

def find_max(arr: List[T], compare_fn: Callable[[T, T], int]) -> T:
    max_val = arr[0]
    for item in arr[1:]:
        if compare_fn(item, max_val) > 0:
            max_val = item
    return max_val

numbers = [3, 7, 2, 9, 5]
print(find_max(numbers, lambda a, b: a - b))

words = ["banana", "apple", "cherry"]
print(find_max(words, lambda a, b: (a > b) - (a < b)))

people = [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}, {"name": "Charlie", "age": 35}]
oldest = find_max(people, lambda a, b: a["age"] - b["age"])
print(f"{oldest['name']} ({oldest['age']})")
`,
        highlights: [
          { lines: [3], explanation: "Python uses TypeVar for generic types, whereas TypeScript uses <T> syntax." },
          { lines: [16], explanation: "Python has no localeCompare; `(a > b) - (a < b)` returns 1, -1, or 0." }
        ]
      },
      java: {
        code: `import java.util.*;
import java.util.function.*;

public class Main {
    static <T> T findMax(List<T> arr, Comparator<T> compareFn) {
        T max = arr.get(0);
        for (int i = 1; i < arr.size(); i++) {
            if (compareFn.compare(arr.get(i), max) > 0) {
                max = arr.get(i);
            }
        }
        return max;
    }

    public static void main(String[] args) {
        List<Integer> numbers = List.of(3, 7, 2, 9, 5);
        System.out.println(findMax(numbers, Integer::compareTo));

        List<String> words = List.of("banana", "apple", "cherry");
        System.out.println(findMax(words, String::compareTo));

        record Person(String name, int age) {}
        List<Person> people = List.of(
            new Person("Alice", 30), new Person("Bob", 25), new Person("Charlie", 35)
        );
        Person oldest = findMax(people, Comparator.comparingInt(Person::age));
        System.out.println(oldest.name() + " (" + oldest.age() + ")");
    }
}
`,
        highlights: [
          { lines: [5], explanation: "Java generics use <T> similar to TypeScript, placed before the return type." },
          { lines: [5], explanation: "Java uses the Comparator functional interface instead of a raw function type." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Functions",
    level: 2,
    title: "Tuple Return Type",
    task: "Write a function `minMax(arr: number[]): [number, number]` that returns a tuple of [min, max] from a number array. Also write `splitAt<T>(arr: T[], index: number): [T[], T[]]` that splits an array at the given index. Test minMax with [5, 2, 8, 1, 9] and splitAt with [\"a\",\"b\",\"c\",\"d\",\"e\"] at index 3.",
    code: `// Tuple Return Type
// Write functions that return tuples

// YOUR CODE HERE
`,
    solutionCode: `// Tuple Return Type
function minMax(arr: number[]): [number, number] {
  let min = arr[0];
  let max = arr[0];
  for (const n of arr) {
    if (n < min) min = n;
    if (n > max) max = n;
  }
  return [min, max];
}

function splitAt<T>(arr: T[], index: number): [T[], T[]] {
  return [arr.slice(0, index), arr.slice(index)];
}

const [min, max] = minMax([5, 2, 8, 1, 9]);
console.log(\`Min: \${min}, Max: \${max}\`);

const [left, right] = splitAt(["a", "b", "c", "d", "e"], 3);
console.log(\`Left: \${left.join(", ")}\`);
console.log(\`Right: \${right.join(", ")}\`);
`,
    expectedOutput: `Min: 1, Max: 9
Left: a, b, c
Right: d, e`,
    testCases: [
      { input: "const nums = [5, 2, 8, 1, 9]; const arr = [\"a\", \"b\", \"c\", \"d\", \"e\"]; const splitIndex = 3", output: "Min: 1, Max: 9\nLeft: a, b, c\nRight: d, e" },
      { input: "const nums = [3, 3, 3]; const arr = [\"x\", \"y\"]; const splitIndex = 1", output: "Min: 3, Max: 3\nLeft: x\nRight: y" },
      { input: "const nums = [-5, 0, 10, -3]; const arr = [\"p\", \"q\", \"r\", \"s\"]; const splitIndex = 2", output: "Min: -5, Max: 10\nLeft: p, q\nRight: r, s" },
    ],
    hint: "Use `[type1, type2]` syntax to define tuple return types. Destructure the result with `const [a, b] = fn()`.",
    judgeFeedback: {
      summary: "Ensure functions return typed tuples and results are properly destructured.",
      lines: [
        { line: 2, problem: "Return type is number[] instead of [number, number]", fix: "Use tuple type `[number, number]` for the return type" },
        { line: 12, problem: "Missing generic type parameter on splitAt", fix: "Add `<T>` to make the function work with any array type" }
      ]
    },
    altMethods: [
      {
        name: "Using Math.min/max with spread",
        code: `function minMax(arr: number[]): [number, number] {
  return [Math.min(...arr), Math.max(...arr)];
}

function splitAt<T>(arr: T[], index: number): [T[], T[]] {
  return [arr.slice(0, index), arr.slice(index)];
}

const [min, max] = minMax([5, 2, 8, 1, 9]);
console.log(\`Min: \${min}, Max: \${max}\`);

const [left, right] = splitAt(["a", "b", "c", "d", "e"], 3);
console.log(\`Left: \${left.join(", ")}\`);
console.log(\`Right: \${right.join(", ")}\`);
`,
        explanation: "Math.min/max with spread operator is concise but iterates the array twice. For large arrays, a single-pass approach is more efficient."
      },
      {
        name: "Using reduce for minMax",
        code: `function minMax(arr: number[]): [number, number] {
  return arr.reduce<[number, number]>(
    ([min, max], n) => [Math.min(min, n), Math.max(max, n)],
    [arr[0], arr[0]]
  );
}

function splitAt<T>(arr: T[], index: number): [T[], T[]] {
  return arr.reduce<[T[], T[]]>(
    ([left, right], item, i) => {
      (i < index ? left : right).push(item);
      return [left, right];
    },
    [[], []]
  );
}

const [min, max] = minMax([5, 2, 8, 1, 9]);
console.log(\`Min: \${min}, Max: \${max}\`);

const [left, right] = splitAt(["a", "b", "c", "d", "e"], 3);
console.log(\`Left: \${left.join(", ")}\`);
console.log(\`Right: \${right.join(", ")}\`);
`,
        explanation: "Reduce with a tuple accumulator processes both min and max in a single pass. The generic type parameter on reduce ensures correct tuple typing."
      }
    ],
    crossLang: {
      python: {
        code: `def min_max(arr: list[int]) -> tuple[int, int]:
    return (min(arr), max(arr))

def split_at(arr: list, index: int) -> tuple[list, list]:
    return (arr[:index], arr[index:])

mn, mx = min_max([5, 2, 8, 1, 9])
print(f"Min: {mn}, Max: {mx}")

left, right = split_at(["a", "b", "c", "d", "e"], 3)
print(f"Left: {', '.join(left)}")
print(f"Right: {', '.join(right)}")
`,
        highlights: [
          { lines: [1], explanation: "Python uses tuple[int, int] type hint, similar to TypeScript's [number, number]." },
          { lines: [7], explanation: "Python tuple unpacking is similar to TypeScript destructuring." }
        ]
      },
      java: {
        code: `import java.util.*;

public class Main {
    record Pair<A, B>(A first, B second) {}

    static Pair<Integer, Integer> minMax(int[] arr) {
        int min = arr[0], max = arr[0];
        for (int n : arr) {
            if (n < min) min = n;
            if (n > max) max = n;
        }
        return new Pair<>(min, max);
    }

    static <T> Pair<List<T>, List<T>> splitAt(List<T> arr, int index) {
        return new Pair<>(arr.subList(0, index), arr.subList(index, arr.size()));
    }

    public static void main(String[] args) {
        var result = minMax(new int[]{5, 2, 8, 1, 9});
        System.out.println("Min: " + result.first() + ", Max: " + result.second());

        var parts = splitAt(List.of("a", "b", "c", "d", "e"), 3);
        System.out.println("Left: " + String.join(", ", parts.first()));
        System.out.println("Right: " + String.join(", ", parts.second()));
    }
}
`,
        highlights: [
          { lines: [4], explanation: "Java has no built-in tuple type; a generic record is used as a workaround." },
          { lines: [15], explanation: "Java generics with generic record provide similar functionality to TypeScript tuples." }
        ]
      }
    }
  },

  // ============================================================
  // FUNCTIONS — Level 3
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Functions",
    level: 3,
    title: "Higher-Order Function: Map Implementation",
    task: "Implement a generic `myMap<T, U>(arr: T[], fn: (item: T, index: number) => U): U[]` function that works like Array.map. Test it with:\n1. Double numbers: [1,2,3,4,5] => [2,4,6,8,10]\n2. String lengths: [\"hello\",\"world\",\"ts\"] => [5,5,2]\n3. Index-value pairs: [\"a\",\"b\",\"c\"] => [\"0:a\",\"1:b\",\"2:c\"]",
    code: `// Higher-Order Function: Map Implementation
// Implement a generic map function

// YOUR CODE HERE
`,
    solutionCode: `// Higher-Order Function: Map Implementation
function myMap<T, U>(arr: T[], fn: (item: T, index: number) => U): U[] {
  const result: U[] = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i));
  }
  return result;
}

const doubled = myMap([1, 2, 3, 4, 5], (n) => n * 2);
console.log(doubled.join(", "));

const lengths = myMap(["hello", "world", "ts"], (s) => s.length);
console.log(lengths.join(", "));

const indexed = myMap(["a", "b", "c"], (item, i) => \`\${i}:\${item}\`);
console.log(indexed.join(", "));
`,
    expectedOutput: `2, 4, 6, 8, 10
5, 5, 2
0:a, 1:b, 2:c`,
    testCases: [
      { input: "const nums = [1, 2, 3, 4, 5]; const strs = [\"hello\", \"world\", \"ts\"]; const chars = [\"a\", \"b\", \"c\"]", output: "2, 4, 6, 8, 10\n5, 5, 2\n0:a, 1:b, 2:c" },
      { input: "const nums = [10, 20]; const strs = [\"hi\"]; const chars = [\"x\", \"y\", \"z\", \"w\"]", output: "20, 40\n2\n0:x, 1:y, 2:z, 3:w" },
      { input: "const nums = [0]; const strs = [\"abcdef\", \"ab\"]; const chars = [\"q\"]", output: "0\n6, 2\n0:q" },
    ],
    hint: "Use two generic type parameters: T for input type and U for output type. Iterate through the array, applying fn to each element and index.",
    judgeFeedback: {
      summary: "Check that the function uses two generic types and passes the index to the callback.",
      lines: [
        { line: 2, problem: "Missing second generic type parameter U", fix: "Use `<T, U>` to have separate input and output types" },
        { line: 4, problem: "Not passing index to callback", fix: "Pass both the element and index: `fn(arr[i], i)`" }
      ]
    },
    altMethods: [
      {
        name: "Using reduce",
        code: `function myMap<T, U>(arr: T[], fn: (item: T, index: number) => U): U[] {
  return arr.reduce<U[]>((acc, item, index) => {
    acc.push(fn(item, index));
    return acc;
  }, []);
}

const doubled = myMap([1, 2, 3, 4, 5], (n) => n * 2);
console.log(doubled.join(", "));

const lengths = myMap(["hello", "world", "ts"], (s) => s.length);
console.log(lengths.join(", "));

const indexed = myMap(["a", "b", "c"], (item, i) => \`\${i}:\${item}\`);
console.log(indexed.join(", "));
`,
        explanation: "Using reduce to build the output array is a functional programming approach. The generic type parameter on reduce ensures correct typing."
      },
      {
        name: "Using generator function",
        code: `function* myMapGen<T, U>(arr: T[], fn: (item: T, index: number) => U): Generator<U> {
  for (let i = 0; i < arr.length; i++) {
    yield fn(arr[i], i);
  }
}

function myMap<T, U>(arr: T[], fn: (item: T, index: number) => U): U[] {
  return [...myMapGen(arr, fn)];
}

const doubled = myMap([1, 2, 3, 4, 5], (n) => n * 2);
console.log(doubled.join(", "));

const lengths = myMap(["hello", "world", "ts"], (s) => s.length);
console.log(lengths.join(", "));

const indexed = myMap(["a", "b", "c"], (item, i) => \`\${i}:\${item}\`);
console.log(indexed.join(", "));
`,
        explanation: "A generator function lazily yields transformed elements. Spreading into an array collects all results. This is memory-efficient for large datasets."
      }
    ],
    crossLang: {
      python: {
        code: `from typing import TypeVar, Callable, List

T = TypeVar("T")
U = TypeVar("U")

def my_map(arr: List[T], fn: Callable[[T, int], U]) -> List[U]:
    return [fn(item, i) for i, item in enumerate(arr)]

doubled = my_map([1, 2, 3, 4, 5], lambda n, i: n * 2)
print(", ".join(str(x) for x in doubled))

lengths = my_map(["hello", "world", "ts"], lambda s, i: len(s))
print(", ".join(str(x) for x in lengths))

indexed = my_map(["a", "b", "c"], lambda item, i: f"{i}:{item}")
print(", ".join(indexed))
`,
        highlights: [
          { lines: [6, 7], explanation: "Python uses list comprehension with enumerate for index access, equivalent to the loop-based map." },
          { lines: [3, 4], explanation: "Python TypeVar is the equivalent of TypeScript's generic type parameters." }
        ]
      },
      java: {
        code: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class Main {
    static <T, U> List<U> myMap(List<T> arr, BiFunction<T, Integer, U> fn) {
        List<U> result = new ArrayList<>();
        for (int i = 0; i < arr.size(); i++) {
            result.add(fn.apply(arr.get(i), i));
        }
        return result;
    }

    public static void main(String[] args) {
        var doubled = myMap(List.of(1, 2, 3, 4, 5), (n, i) -> n * 2);
        System.out.println(doubled.stream().map(String::valueOf).collect(Collectors.joining(", ")));

        var lengths = myMap(List.of("hello", "world", "ts"), (s, i) -> s.length());
        System.out.println(lengths.stream().map(String::valueOf).collect(Collectors.joining(", ")));

        var indexed = myMap(List.of("a", "b", "c"), (item, i) -> i + ":" + item);
        System.out.println(String.join(", ", indexed));
    }
}
`,
        highlights: [
          { lines: [6], explanation: "Java uses BiFunction<T, Integer, U> for a callback that takes two arguments and returns a value." },
          { lines: [16], explanation: "Java requires stream operations to join elements, unlike TypeScript's simple .join()." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Functions",
    level: 3,
    title: "Function Overloads with Unions",
    task: "Write a function `format` that behaves differently based on input:\n- format(value: number, decimals: number) => formats number to N decimal places\n- format(value: string, uppercase: boolean) => converts to upper/lowercase\n- format(value: Date) => returns \"YYYY-MM-DD\" string\nUse union types and type narrowing. Test with: format(3.14159, 2), format(\"hello\", true), format(\"WORLD\", false), and format(new Date(2026, 0, 15)).",
    code: `// Function Overloads with Unions
// Write a function that handles different types differently

// YOUR CODE HERE
`,
    solutionCode: `// Function Overloads with Unions
function format(value: number, decimals: number): string;
function format(value: string, uppercase: boolean): string;
function format(value: Date): string;
function format(value: number | string | Date, option?: number | boolean): string {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return \`\${y}-\${m}-\${d}\`;
  } else if (typeof value === "number" && typeof option === "number") {
    return value.toFixed(option);
  } else if (typeof value === "string" && typeof option === "boolean") {
    return option ? value.toUpperCase() : value.toLowerCase();
  }
  return String(value);
}

console.log(format(3.14159, 2));
console.log(format("hello", true));
console.log(format("WORLD", false));
console.log(format(new Date(2026, 0, 15)));
`,
    expectedOutput: `3.14
HELLO
world
2026-01-15`,
    testCases: [
      { input: "const numVal = 3.14159; const decimals = 2; const strVal1 = \"hello\"; const upper = true; const strVal2 = \"WORLD\"; const dateVal = new Date(2026, 0, 15)", output: "3.14\nHELLO\nworld\n2026-01-15" },
      { input: "const numVal = 100.5678; const decimals = 1; const strVal1 = \"test\"; const upper = false; const strVal2 = \"MiXeD\"; const dateVal = new Date(2025, 11, 25)", output: "100.6\ntest\nmixed\n2025-12-25" },
      { input: "const numVal = 0.1; const decimals = 4; const strVal1 = \"TypeScript\"; const upper = true; const strVal2 = \"ABC\"; const dateVal = new Date(2030, 5, 1)", output: "0.1000\nTYPESCRIPT\nabc\n2030-06-01" },
    ],
    hint: "TypeScript function overloads define multiple call signatures followed by a single implementation. Use typeof and instanceof for type narrowing.",
    judgeFeedback: {
      summary: "Ensure overload signatures are correct and the implementation handles all cases.",
      lines: [
        { line: 2, problem: "Missing overload signatures", fix: "Add overload signatures before the implementation for each variant" },
        { line: 5, problem: "Implementation signature not broad enough", fix: "Use union types in the implementation to accept all overload variants" }
      ]
    },
    altMethods: [
      {
        name: "Using separate functions with a wrapper",
        code: `function formatNumber(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

function formatString(value: string, uppercase: boolean): string {
  return uppercase ? value.toUpperCase() : value.toLowerCase();
}

function formatDate(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return \`\${y}-\${m}-\${d}\`;
}

console.log(formatNumber(3.14159, 2));
console.log(formatString("hello", true));
console.log(formatString("WORLD", false));
console.log(formatDate(new Date(2026, 0, 15)));
`,
        explanation: "Separate functions with clear names can be simpler and more readable than overloads, especially when behavior is very different between types."
      },
      {
        name: "Using a discriminated union parameter",
        code: `type FormatInput =
  | { type: "number"; value: number; decimals: number }
  | { type: "string"; value: string; uppercase: boolean }
  | { type: "date"; value: Date };

function format(input: FormatInput): string {
  switch (input.type) {
    case "number":
      return input.value.toFixed(input.decimals);
    case "string":
      return input.uppercase ? input.value.toUpperCase() : input.value.toLowerCase();
    case "date": {
      const y = input.value.getFullYear();
      const m = String(input.value.getMonth() + 1).padStart(2, "0");
      const d = String(input.value.getDate()).padStart(2, "0");
      return \`\${y}-\${m}-\${d}\`;
    }
  }
}

console.log(format({ type: "number", value: 3.14159, decimals: 2 }));
console.log(format({ type: "string", value: "hello", uppercase: true }));
console.log(format({ type: "string", value: "WORLD", uppercase: false }));
console.log(format({ type: "date", value: new Date(2026, 0, 15) }));
`,
        explanation: "A discriminated union parameter makes the type narrowing explicit and type-safe. Each variant is clearly defined with its own structure."
      }
    ],
    crossLang: {
      python: {
        code: `from datetime import date
from functools import singledispatch

@singledispatch
def format_val(value, option=None):
    return str(value)

@format_val.register(int)
@format_val.register(float)
def _(value, decimals=2):
    return f"{value:.{decimals}f}"

def format_string(value: str, uppercase: bool) -> str:
    return value.upper() if uppercase else value.lower()

def format_date(value: date) -> str:
    return value.strftime("%Y-%m-%d")

print(format_val(3.14159, 2))
print(format_string("hello", True))
print(format_string("WORLD", False))
print(format_date(date(2026, 1, 15)))
`,
        highlights: [
          { lines: [4, 5, 8, 9], explanation: "Python uses @singledispatch for function overloading based on the first argument's type." },
          { lines: [17], explanation: "Python's strftime formats dates, similar to manual formatting in TypeScript." }
        ]
      },
      java: {
        code: `import java.time.LocalDate;

public class Main {
    static String format(double value, int decimals) {
        return String.format("%." + decimals + "f", value);
    }

    static String format(String value, boolean uppercase) {
        return uppercase ? value.toUpperCase() : value.toLowerCase();
    }

    static String format(LocalDate value) {
        return value.toString();
    }

    public static void main(String[] args) {
        System.out.println(format(3.14159, 2));
        System.out.println(format("hello", true));
        System.out.println(format("WORLD", false));
        System.out.println(format(LocalDate.of(2026, 1, 15)));
    }
}
`,
        highlights: [
          { lines: [4, 8, 12], explanation: "Java supports true method overloading with different parameter types, unlike TypeScript's signature-based approach." },
          { lines: [20], explanation: "Java's LocalDate.toString() outputs ISO format YYYY-MM-DD by default." }
        ]
      }
    }
  },

  // ============================================================
  // ARRAYS — Level 1
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Arrays",
    level: 1,
    title: "Filter Even Numbers",
    task: "Given a typed array of numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], filter out only the even numbers and print them as a comma-separated string. Then print the count of even numbers.",
    code: `// Filter Even Numbers
// Filter even numbers from a typed array

// YOUR CODE HERE
`,
    solutionCode: `// Filter Even Numbers
const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens: number[] = numbers.filter((n: number): boolean => n % 2 === 0);

console.log(evens.join(", "));
console.log(\`Count: \${evens.length}\`);
`,
    expectedOutput: `2, 4, 6, 8, 10
Count: 5`,
    testCases: [
      { input: "const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]", output: "2, 4, 6, 8, 10\nCount: 5" },
      { input: "const numbers = [2, 4, 6]", output: "2, 4, 6\nCount: 3" },
      { input: "const numbers = [1, 3, 5, 7]", output: "\nCount: 0" },
    ],
    hint: "Use `.filter()` with a callback that returns true for even numbers (n % 2 === 0). Use `.join(\", \")` to create a comma-separated string.",
    judgeFeedback: {
      summary: "Ensure the filter callback has proper type annotations and uses modulo for even check.",
      lines: [
        { line: 3, problem: "Filter callback missing type annotations", fix: "Add types: `(n: number): boolean => n % 2 === 0`" },
        { line: 5, problem: "Using console.log(array) instead of join", fix: "Use `.join(\", \")` for formatted output" }
      ]
    },
    altMethods: [
      {
        name: "Using for loop",
        code: `const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens: number[] = [];

for (const n of numbers) {
  if (n % 2 === 0) {
    evens.push(n);
  }
}

console.log(evens.join(", "));
console.log(\`Count: \${evens.length}\`);
`,
        explanation: "A for loop with a conditional push achieves the same result as filter. This is useful when you need more complex logic during iteration."
      },
      {
        name: "Using reduce",
        code: `const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens: number[] = numbers.reduce<number[]>((acc, n) => {
  if (n % 2 === 0) acc.push(n);
  return acc;
}, []);

console.log(evens.join(", "));
console.log(\`Count: \${evens.length}\`);
`,
        explanation: "Reduce can act as both filter and transform in one pass. The generic type parameter ensures the accumulator is correctly typed."
      }
    ],
    crossLang: {
      python: {
        code: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [n for n in numbers if n % 2 == 0]

print(", ".join(str(n) for n in evens))
print(f"Count: {len(evens)}")
`,
        highlights: [
          { lines: [2], explanation: "Python list comprehension with a condition is equivalent to TypeScript's .filter()." },
          { lines: [4], explanation: "Python needs str() conversion for join since elements are integers." }
        ]
      },
      java: {
        code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        int[] evens = Arrays.stream(numbers).filter(n -> n % 2 == 0).toArray();

        System.out.println(Arrays.stream(evens).mapToObj(String::valueOf).collect(Collectors.joining(", ")));
        System.out.println("Count: " + evens.length);
    }
}
`,
        highlights: [
          { lines: [7], explanation: "Java uses streams with .filter() similar to TypeScript, but requires .toArray() to collect." },
          { lines: [9], explanation: "Java joining requires converting ints to strings with mapToObj first." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Arrays",
    level: 1,
    title: "Map Array to Double",
    task: "Given a typed array of numbers [3, 7, 2, 9, 5], use .map() to create a new array where each element is doubled. Print the original and doubled arrays as comma-separated strings.",
    code: `// Map Array to Double
// Use map to double each element in an array

// YOUR CODE HERE
`,
    solutionCode: `// Map Array to Double
const numbers: number[] = [3, 7, 2, 9, 5];
const doubled: number[] = numbers.map((n: number): number => n * 2);

console.log(\`Original: \${numbers.join(", ")}\`);
console.log(\`Doubled: \${doubled.join(", ")}\`);
`,
    expectedOutput: `Original: 3, 7, 2, 9, 5
Doubled: 6, 14, 4, 18, 10`,
    testCases: [
      { input: "const numbers = [3, 7, 2, 9, 5]", output: "Original: 3, 7, 2, 9, 5\nDoubled: 6, 14, 4, 18, 10" },
      { input: "const numbers = [1, 2, 3]", output: "Original: 1, 2, 3\nDoubled: 2, 4, 6" },
      { input: "const numbers = [0, 100]", output: "Original: 0, 100\nDoubled: 0, 200" },
    ],
    hint: "Use `.map()` with a callback that returns the doubled value. Map creates a new array without modifying the original.",
    judgeFeedback: {
      summary: "Ensure map is used correctly and the original array is not modified.",
      lines: [
        { line: 3, problem: "Modifying array in place instead of using map", fix: "Use `.map()` which returns a new array: `numbers.map(n => n * 2)`" },
        { line: 3, problem: "Missing return type on callback", fix: "Add types: `(n: number): number => n * 2`" }
      ]
    },
    altMethods: [
      {
        name: "Using for...of loop",
        code: `const numbers: number[] = [3, 7, 2, 9, 5];
const doubled: number[] = [];

for (const n of numbers) {
  doubled.push(n * 2);
}

console.log(\`Original: \${numbers.join(", ")}\`);
console.log(\`Doubled: \${doubled.join(", ")}\`);
`,
        explanation: "A for...of loop manually builds the result array. This is useful when the transformation logic is complex."
      },
      {
        name: "Using Array.from",
        code: `const numbers: number[] = [3, 7, 2, 9, 5];
const doubled: number[] = Array.from(numbers, (n: number): number => n * 2);

console.log(\`Original: \${numbers.join(", ")}\`);
console.log(\`Doubled: \${doubled.join(", ")}\`);
`,
        explanation: "Array.from with a mapping function creates a new array in one step. It's useful when converting array-like objects while transforming."
      }
    ],
    crossLang: {
      python: {
        code: `numbers = [3, 7, 2, 9, 5]
doubled = [n * 2 for n in numbers]

print(f"Original: {', '.join(str(n) for n in numbers)}")
print(f"Doubled: {', '.join(str(n) for n in doubled)}")
`,
        highlights: [
          { lines: [2], explanation: "Python list comprehension `[expr for x in list]` is equivalent to TypeScript's .map()." }
        ]
      },
      java: {
        code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        int[] numbers = {3, 7, 2, 9, 5};
        int[] doubled = Arrays.stream(numbers).map(n -> n * 2).toArray();

        System.out.println("Original: " + Arrays.stream(numbers).mapToObj(String::valueOf).collect(Collectors.joining(", ")));
        System.out.println("Doubled: " + Arrays.stream(doubled).mapToObj(String::valueOf).collect(Collectors.joining(", ")));
    }
}
`,
        highlights: [
          { lines: [7], explanation: "Java streams provide .map() similar to TypeScript, but require .toArray() to materialize." }
        ]
      }
    }
  },

  // ============================================================
  // ARRAYS — Level 2
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Arrays",
    level: 2,
    title: "Reduce: Sum and Product",
    task: "Given a typed array [2, 3, 4, 5], use .reduce() to compute the sum and product of all elements. Print both results.",
    code: `// Reduce: Sum and Product
// Use reduce to compute sum and product

// YOUR CODE HERE
`,
    solutionCode: `// Reduce: Sum and Product
const numbers: number[] = [2, 3, 4, 5];

const sum: number = numbers.reduce((acc: number, n: number): number => acc + n, 0);
const product: number = numbers.reduce((acc: number, n: number): number => acc * n, 1);

console.log(\`Sum: \${sum}\`);
console.log(\`Product: \${product}\`);
`,
    expectedOutput: `Sum: 14
Product: 120`,
    testCases: [
      { input: "const numbers = [2, 3, 4, 5]", output: "Sum: 14\nProduct: 120" },
      { input: "const numbers = [10, 20, 30]", output: "Sum: 60\nProduct: 6000" },
      { input: "const numbers = [7]", output: "Sum: 7\nProduct: 7" },
    ],
    hint: "Use `.reduce(callback, initialValue)`. For sum, start with 0 and add. For product, start with 1 and multiply.",
    judgeFeedback: {
      summary: "Ensure reduce has proper initial values and the callback types are annotated.",
      lines: [
        { line: 4, problem: "Missing initial value for reduce", fix: "Provide 0 as initial value for sum: `.reduce((acc, n) => acc + n, 0)`" },
        { line: 5, problem: "Wrong initial value for product", fix: "Use 1 (not 0) as initial value for product to avoid multiplying by zero" }
      ]
    },
    altMethods: [
      {
        name: "Using for...of loop",
        code: `const numbers: number[] = [2, 3, 4, 5];

let sum: number = 0;
let product: number = 1;

for (const n of numbers) {
  sum += n;
  product *= n;
}

console.log(\`Sum: \${sum}\`);
console.log(\`Product: \${product}\`);
`,
        explanation: "A for loop computes both sum and product in a single pass, which is more efficient than two separate reduce calls."
      },
      {
        name: "Using single reduce with tuple accumulator",
        code: `const numbers: number[] = [2, 3, 4, 5];

const [sum, product] = numbers.reduce<[number, number]>(
  ([s, p], n) => [s + n, p * n],
  [0, 1]
);

console.log(\`Sum: \${sum}\`);
console.log(\`Product: \${product}\`);
`,
        explanation: "A single reduce with a tuple accumulator computes both values in one pass. The generic type parameter ensures the tuple is correctly typed."
      }
    ],
    crossLang: {
      python: {
        code: `from functools import reduce

numbers = [2, 3, 4, 5]

total = sum(numbers)
product = reduce(lambda acc, n: acc * n, numbers, 1)

print(f"Sum: {total}")
print(f"Product: {product}")
`,
        highlights: [
          { lines: [5], explanation: "Python has a built-in sum() function, unlike TypeScript which requires reduce." },
          { lines: [6], explanation: "Python's functools.reduce works similarly to TypeScript's .reduce()." }
        ]
      },
      java: {
        code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] numbers = {2, 3, 4, 5};

        int sum = Arrays.stream(numbers).reduce(0, Integer::sum);
        int product = Arrays.stream(numbers).reduce(1, (a, b) -> a * b);

        System.out.println("Sum: " + sum);
        System.out.println("Product: " + product);
    }
}
`,
        highlights: [
          { lines: [7], explanation: "Java streams have .reduce() with similar signature to TypeScript: initial value and a binary operator." },
          { lines: [7], explanation: "Java provides Integer::sum as a method reference for addition." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Arrays",
    level: 2,
    title: "Sort Array of Objects",
    task: "Given an array of students with name and grade, sort them by grade descending (highest first). If grades are equal, sort by name alphabetically. Print each student in format: \"Name: grade\".",
    code: `// Sort Array of Objects
// Sort students by grade (descending), then by name (ascending)

interface Student {
  name: string;
  grade: number;
}

// YOUR CODE HERE
`,
    solutionCode: `// Sort Array of Objects
interface Student {
  name: string;
  grade: number;
}

const students: Student[] = [
  { name: "Charlie", grade: 85 },
  { name: "Alice", grade: 92 },
  { name: "Bob", grade: 78 },
  { name: "Diana", grade: 92 },
  { name: "Eve", grade: 85 }
];

const sorted = [...students].sort((a: Student, b: Student): number => {
  if (b.grade !== a.grade) return b.grade - a.grade;
  return a.name.localeCompare(b.name);
});

for (const s of sorted) {
  console.log(\`\${s.name}: \${s.grade}\`);
}
`,
    expectedOutput: `Alice: 92
Diana: 92
Charlie: 85
Eve: 85
Bob: 78`,
    testCases: [
      { input: "const students = [{ name: \"Charlie\", grade: 85 }, { name: \"Alice\", grade: 92 }, { name: \"Bob\", grade: 78 }, { name: \"Diana\", grade: 92 }, { name: \"Eve\", grade: 85 }]", output: "Alice: 92\nDiana: 92\nCharlie: 85\nEve: 85\nBob: 78" },
      { input: "const students = [{ name: \"Zara\", grade: 100 }, { name: \"Yuki\", grade: 100 }, { name: \"Xander\", grade: 50 }]", output: "Yuki: 100\nZara: 100\nXander: 50" },
      { input: "const students = [{ name: \"Solo\", grade: 75 }]", output: "Solo: 75" },
    ],
    hint: "Use `.sort()` with a comparison function. Return a negative, zero, or positive number. Sort grade descending with `b.grade - a.grade`, and use `.localeCompare()` for name sorting.",
    judgeFeedback: {
      summary: "Check that sorting is descending by grade and alphabetical by name for ties.",
      lines: [
        { line: 15, problem: "Sorting mutates the original array", fix: "Use `[...students].sort()` to create a copy before sorting" },
        { line: 16, problem: "Wrong sort direction for grade", fix: "Use `b.grade - a.grade` for descending order (not `a.grade - b.grade`)" }
      ]
    },
    altMethods: [
      {
        name: "Using separate sort steps",
        code: `interface Student { name: string; grade: number; }

const students: Student[] = [
  { name: "Charlie", grade: 85 },
  { name: "Alice", grade: 92 },
  { name: "Bob", grade: 78 },
  { name: "Diana", grade: 92 },
  { name: "Eve", grade: 85 }
];

const sorted = [...students]
  .sort((a, b) => a.name.localeCompare(b.name))
  .sort((a, b) => b.grade - a.grade);

for (const s of sorted) {
  console.log(\`\${s.name}: \${s.grade}\`);
}
`,
        explanation: "Sort by name first, then by grade. Since sort is stable in modern JS engines, equal grades preserve the name order from the first sort."
      },
      {
        name: "Using custom comparator helper",
        code: `interface Student { name: string; grade: number; }

type Comparator<T> = (a: T, b: T) => number;

function chain<T>(...comparators: Comparator<T>[]): Comparator<T> {
  return (a, b) => {
    for (const cmp of comparators) {
      const result = cmp(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
}

const students: Student[] = [
  { name: "Charlie", grade: 85 },
  { name: "Alice", grade: 92 },
  { name: "Bob", grade: 78 },
  { name: "Diana", grade: 92 },
  { name: "Eve", grade: 85 }
];

const sorted = [...students].sort(chain<Student>(
  (a, b) => b.grade - a.grade,
  (a, b) => a.name.localeCompare(b.name)
));

for (const s of sorted) {
  console.log(\`\${s.name}: \${s.grade}\`);
}
`,
        explanation: "A composable comparator chain applies multiple sort criteria in sequence. This pattern is reusable and extensible for complex sort orders."
      }
    ],
    crossLang: {
      python: {
        code: `students = [
    {"name": "Charlie", "grade": 85},
    {"name": "Alice", "grade": 92},
    {"name": "Bob", "grade": 78},
    {"name": "Diana", "grade": 92},
    {"name": "Eve", "grade": 85},
]

sorted_students = sorted(students, key=lambda s: (-s["grade"], s["name"]))

for s in sorted_students:
    print(f"{s['name']}: {s['grade']}")
`,
        highlights: [
          { lines: [9], explanation: "Python's sorted() with a key tuple handles multi-criteria sorting elegantly. Negating the grade achieves descending order." }
        ]
      },
      java: {
        code: `import java.util.*;

public class Main {
    record Student(String name, int grade) {}

    public static void main(String[] args) {
        List<Student> students = new ArrayList<>(List.of(
            new Student("Charlie", 85),
            new Student("Alice", 92),
            new Student("Bob", 78),
            new Student("Diana", 92),
            new Student("Eve", 85)
        ));

        students.sort(Comparator.comparingInt(Student::grade).reversed()
            .thenComparing(Student::name));

        for (Student s : students) {
            System.out.println(s.name() + ": " + s.grade());
        }
    }
}
`,
        highlights: [
          { lines: [15, 16], explanation: "Java's Comparator provides fluent API with .reversed() and .thenComparing() for multi-criteria sorting." }
        ]
      }
    }
  },

  // ============================================================
  // ARRAYS — Level 3
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Arrays",
    level: 3,
    title: "Generic GroupBy Function",
    task: "Implement a generic function `groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]>` that groups array elements by a key. Test with:\n1. Group numbers by even/odd\n2. Group words by first letter\nPrint results with JSON-style formatting.",
    code: `// Generic GroupBy Function
// Implement a groupBy function using generics

// YOUR CODE HERE
`,
    solutionCode: `// Generic GroupBy Function
function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}

const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
const byParity = groupBy(numbers, (n) => n % 2 === 0 ? "even" : "odd");
console.log("odd:", byParity["odd"].join(", "));
console.log("even:", byParity["even"].join(", "));

const words: string[] = ["apple", "avocado", "banana", "blueberry", "cherry"];
const byLetter = groupBy(words, (w) => w[0]);
console.log("a:", byLetter["a"].join(", "));
console.log("b:", byLetter["b"].join(", "));
console.log("c:", byLetter["c"].join(", "));
`,
    expectedOutput: `odd: 1, 3, 5, 7
even: 2, 4, 6, 8
a: apple, avocado
b: banana, blueberry
c: cherry`,
    testCases: [
      { input: "const numbers = [1, 2, 3, 4, 5, 6, 7, 8]; const words = [\"apple\", \"avocado\", \"banana\", \"blueberry\", \"cherry\"]", output: "odd: 1, 3, 5, 7\neven: 2, 4, 6, 8\na: apple, avocado\nb: banana, blueberry\nc: cherry" },
      { input: "const numbers = [1, 2, 4, 7]; const words = [\"ant\", \"bear\", \"cat\"]", output: "odd: 1, 7\neven: 2, 4\na: ant\nb: bear\nc: cat" },
      { input: "const numbers = [1, 3, 5, 6]; const words = [\"apple\", \"banana\", \"cherry\"]", output: "odd: 1, 3, 5\neven: 6\na: apple\nb: banana\nc: cherry" },
    ],
    hint: "Use `Record<string, T[]>` for the result type. For each item, compute the key and push the item into the corresponding array.",
    judgeFeedback: {
      summary: "Ensure the function uses generics and properly initializes empty arrays for new keys.",
      lines: [
        { line: 2, problem: "Not using generic type parameter", fix: "Add `<T>` and use `T` for array elements and Record value type" },
        { line: 6, problem: "Not initializing array for new keys", fix: "Check if `result[key]` exists and initialize with `[]` if not" }
      ]
    },
    altMethods: [
      {
        name: "Using reduce",
        code: `function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    (acc[key] ??= []).push(item);
    return acc;
  }, {});
}

const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
const byParity = groupBy(numbers, (n) => n % 2 === 0 ? "even" : "odd");
console.log("odd:", byParity["odd"].join(", "));
console.log("even:", byParity["even"].join(", "));

const words: string[] = ["apple", "avocado", "banana", "blueberry", "cherry"];
const byLetter = groupBy(words, (w) => w[0]);
console.log("a:", byLetter["a"].join(", "));
console.log("b:", byLetter["b"].join(", "));
console.log("c:", byLetter["c"].join(", "));
`,
        explanation: "Reduce with the nullish assignment operator (??=) concisely handles both initialization and accumulation."
      },
      {
        name: "Using Map instead of Record",
        code: `function groupBy<T>(arr: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of arr) {
    const key = keyFn(item);
    const group = map.get(key);
    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
const byParity = groupBy(numbers, (n) => n % 2 === 0 ? "even" : "odd");
console.log("odd:", byParity.get("odd")!.join(", "));
console.log("even:", byParity.get("even")!.join(", "));

const words: string[] = ["apple", "avocado", "banana", "blueberry", "cherry"];
const byLetter = groupBy(words, (w) => w[0]);
console.log("a:", byLetter.get("a")!.join(", "));
console.log("b:", byLetter.get("b")!.join(", "));
console.log("c:", byLetter.get("c")!.join(", "));
`,
        explanation: "Using Map preserves insertion order and provides better type safety with .get() and .set() methods."
      }
    ],
    crossLang: {
      python: {
        code: `from collections import defaultdict
from typing import TypeVar, Callable, Dict, List

T = TypeVar("T")

def group_by(arr: List[T], key_fn: Callable[[T], str]) -> Dict[str, List[T]]:
    result: Dict[str, List[T]] = defaultdict(list)
    for item in arr:
        result[key_fn(item)].append(item)
    return dict(result)

numbers = [1, 2, 3, 4, 5, 6, 7, 8]
by_parity = group_by(numbers, lambda n: "even" if n % 2 == 0 else "odd")
print("odd:", ", ".join(str(n) for n in by_parity["odd"]))
print("even:", ", ".join(str(n) for n in by_parity["even"]))

words = ["apple", "avocado", "banana", "blueberry", "cherry"]
by_letter = group_by(words, lambda w: w[0])
print("a:", ", ".join(by_letter["a"]))
print("b:", ", ".join(by_letter["b"]))
print("c:", ", ".join(by_letter["c"]))
`,
        highlights: [
          { lines: [7], explanation: "Python's defaultdict(list) automatically creates empty lists for new keys, simplifying the logic." }
        ]
      },
      java: {
        code: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class Main {
    static <T> Map<String, List<T>> groupBy(List<T> arr, Function<T, String> keyFn) {
        Map<String, List<T>> result = new LinkedHashMap<>();
        for (T item : arr) {
            result.computeIfAbsent(keyFn.apply(item), k -> new ArrayList<>()).add(item);
        }
        return result;
    }

    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8);
        var byParity = groupBy(numbers, n -> n % 2 == 0 ? "even" : "odd");
        System.out.println("odd: " + byParity.get("odd").stream().map(String::valueOf).collect(Collectors.joining(", ")));
        System.out.println("even: " + byParity.get("even").stream().map(String::valueOf).collect(Collectors.joining(", ")));

        List<String> words = List.of("apple", "avocado", "banana", "blueberry", "cherry");
        var byLetter = groupBy(words, w -> String.valueOf(w.charAt(0)));
        System.out.println("a: " + String.join(", ", byLetter.get("a")));
        System.out.println("b: " + String.join(", ", byLetter.get("b")));
        System.out.println("c: " + String.join(", ", byLetter.get("c")));
    }
}
`,
        highlights: [
          { lines: [9], explanation: "Java's computeIfAbsent handles key initialization similarly to TypeScript's `if (!result[key]) result[key] = []`." },
          { lines: [6], explanation: "Java generics use <T> before return type, and Function<T, String> for the key extractor." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Arrays",
    level: 3,
    title: "Zip Two Arrays",
    task: "Implement a generic function `zip<T, U>(arr1: T[], arr2: U[]): [T, U][]` that combines two arrays into an array of tuples. If arrays are different lengths, stop at the shorter one. Test with:\n1. zip([1,2,3], [\"a\",\"b\",\"c\"])\n2. zip([true,false,true], [10,20]) (different lengths)",
    code: `// Zip Two Arrays
// Implement a generic zip function

// YOUR CODE HERE
`,
    solutionCode: `// Zip Two Arrays
function zip<T, U>(arr1: T[], arr2: U[]): [T, U][] {
  const length = Math.min(arr1.length, arr2.length);
  const result: [T, U][] = [];
  for (let i = 0; i < length; i++) {
    result.push([arr1[i], arr2[i]]);
  }
  return result;
}

const zipped1 = zip([1, 2, 3], ["a", "b", "c"]);
for (const [num, letter] of zipped1) {
  console.log(\`\${num} -> \${letter}\`);
}

const zipped2 = zip([true, false, true], [10, 20]);
for (const [bool, num] of zipped2) {
  console.log(\`\${bool} -> \${num}\`);
}
`,
    expectedOutput: `1 -> a
2 -> b
3 -> c
true -> 10
false -> 20`,
    testCases: [
      { input: "const arr1 = [1, 2, 3]; const arr2 = [\"a\", \"b\", \"c\"]", output: "1 -> a\n2 -> b\n3 -> c\ntrue -> 10\nfalse -> 20" },
      { input: "const arr1 = [10, 20]; const arr2 = [\"x\", \"y\", \"z\"]", output: "10 -> x\n20 -> y" },
      { input: "const arr1 = [42]; const arr2 = [\"only\"]", output: "42 -> only" },
    ],
    hint: "Use `Math.min(arr1.length, arr2.length)` to determine the result length. The return type is `[T, U][]` — an array of tuples.",
    judgeFeedback: {
      summary: "Ensure the function handles different-length arrays and uses proper generic types.",
      lines: [
        { line: 2, problem: "Not using two generic type parameters", fix: "Use `<T, U>` for the two different array element types" },
        { line: 3, problem: "Not handling different lengths", fix: "Use `Math.min(arr1.length, arr2.length)` to stop at the shorter array" }
      ]
    },
    altMethods: [
      {
        name: "Using Array.from",
        code: `function zip<T, U>(arr1: T[], arr2: U[]): [T, U][] {
  const length = Math.min(arr1.length, arr2.length);
  return Array.from({ length }, (_, i): [T, U] => [arr1[i], arr2[i]]);
}

const zipped1 = zip([1, 2, 3], ["a", "b", "c"]);
for (const [num, letter] of zipped1) {
  console.log(\`\${num} -> \${letter}\`);
}

const zipped2 = zip([true, false, true], [10, 20]);
for (const [bool, num] of zipped2) {
  console.log(\`\${bool} -> \${num}\`);
}
`,
        explanation: "Array.from with a length and mapping function creates the zipped array in a single expression."
      },
      {
        name: "Using map on the shorter array",
        code: `function zip<T, U>(arr1: T[], arr2: U[]): [T, U][] {
  const shorter = arr1.length <= arr2.length ? arr1 : arr2;
  return shorter.map((_, i): [T, U] => [arr1[i], arr2[i]]);
}

const zipped1 = zip([1, 2, 3], ["a", "b", "c"]);
for (const [num, letter] of zipped1) {
  console.log(\`\${num} -> \${letter}\`);
}

const zipped2 = zip([true, false, true], [10, 20]);
for (const [bool, num] of zipped2) {
  console.log(\`\${bool} -> \${num}\`);
}
`,
        explanation: "Mapping over the shorter array naturally limits the output length. The index parameter provides access to both arrays."
      }
    ],
    crossLang: {
      python: {
        code: `zipped1 = list(zip([1, 2, 3], ["a", "b", "c"]))
for num, letter in zipped1:
    print(f"{num} -> {letter}")

zipped2 = list(zip([True, False, True], [10, 20]))
for b, num in zipped2:
    print(f"{str(b).lower()} -> {num}")
`,
        highlights: [
          { lines: [1], explanation: "Python has a built-in zip() function that does exactly this. It stops at the shortest iterable by default." },
          { lines: [6], explanation: "Python booleans print as True/False, so str().lower() is needed to match TypeScript output." }
        ]
      },
      java: {
        code: `import java.util.*;
import java.util.stream.*;

public class Main {
    record Pair<A, B>(A first, B second) {}

    static <T, U> List<Pair<T, U>> zip(List<T> arr1, List<U> arr2) {
        int length = Math.min(arr1.size(), arr2.size());
        List<Pair<T, U>> result = new ArrayList<>();
        for (int i = 0; i < length; i++) {
            result.add(new Pair<>(arr1.get(i), arr2.get(i)));
        }
        return result;
    }

    public static void main(String[] args) {
        var zipped1 = zip(List.of(1, 2, 3), List.of("a", "b", "c"));
        for (var p : zipped1) {
            System.out.println(p.first() + " -> " + p.second());
        }

        var zipped2 = zip(List.of(true, false, true), List.of(10, 20));
        for (var p : zipped2) {
            System.out.println(p.first() + " -> " + p.second());
        }
    }
}
`,
        highlights: [
          { lines: [5], explanation: "Java has no built-in tuple type, so a generic Pair record is needed." },
          { lines: [7], explanation: "Java generics <T, U> work similarly to TypeScript for typed zip implementation." }
        ]
      }
    }
  },

  // ============================================================
  // OBJECTS — Level 1
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Objects",
    level: 1,
    title: "Merge Objects with Spread",
    task: "Create two objects: `defaults` with properties {color: \"blue\", size: 10, visible: true} and `overrides` with {color: \"red\", size: 20}. Merge them using the spread operator so overrides take precedence. Print each property of the merged object.",
    code: `// Merge Objects with Spread
// Create and merge two objects using the spread operator

// YOUR CODE HERE
`,
    solutionCode: `// Merge Objects with Spread
interface Config {
  color: string;
  size: number;
  visible: boolean;
}

const defaults: Config = { color: "blue", size: 10, visible: true };
const overrides: Partial<Config> = { color: "red", size: 20 };

const merged: Config = { ...defaults, ...overrides };

console.log(\`color: \${merged.color}\`);
console.log(\`size: \${merged.size}\`);
console.log(\`visible: \${merged.visible}\`);
`,
    expectedOutput: `color: red
size: 20
visible: true`,
    testCases: [
      { input: "const defaults = { color: \"blue\", size: 10, visible: true }; const overrides = { color: \"red\", size: 20 }", output: "color: red\nsize: 20\nvisible: true" },
      { input: "const defaults = { color: \"green\", size: 5, visible: false }; const overrides = { color: \"yellow\" }", output: "color: yellow\nsize: 5\nvisible: false" },
      { input: "const defaults = { color: \"white\", size: 100, visible: true }; const overrides = { color: \"black\", size: 0 }", output: "color: black\nsize: 0\nvisible: true" },
    ],
    hint: "Use the spread operator `{...obj1, ...obj2}` to merge objects. Properties in the later object override those in the earlier one. Use `Partial<T>` for an object where all properties are optional.",
    judgeFeedback: {
      summary: "Ensure spread operator is used correctly and an interface is defined for type safety.",
      lines: [
        { line: 9, problem: "Not using Partial for the overrides type", fix: "Use `Partial<Config>` to allow a subset of Config properties" },
        { line: 11, problem: "Wrong spread order", fix: "Put defaults first and overrides second: `{...defaults, ...overrides}`" }
      ]
    },
    altMethods: [
      {
        name: "Using Object.assign",
        code: `interface Config {
  color: string;
  size: number;
  visible: boolean;
}

const defaults: Config = { color: "blue", size: 10, visible: true };
const overrides: Partial<Config> = { color: "red", size: 20 };

const merged: Config = Object.assign({}, defaults, overrides);

console.log(\`color: \${merged.color}\`);
console.log(\`size: \${merged.size}\`);
console.log(\`visible: \${merged.visible}\`);
`,
        explanation: "Object.assign copies properties from source objects to the target. It modifies the first argument, so pass an empty object to avoid mutation."
      },
      {
        name: "Using a merge function",
        code: `interface Config {
  color: string;
  size: number;
  visible: boolean;
}

function mergeConfig(defaults: Config, overrides: Partial<Config>): Config {
  return { ...defaults, ...overrides };
}

const defaults: Config = { color: "blue", size: 10, visible: true };
const overrides: Partial<Config> = { color: "red", size: 20 };

const merged = mergeConfig(defaults, overrides);

console.log(\`color: \${merged.color}\`);
console.log(\`size: \${merged.size}\`);
console.log(\`visible: \${merged.visible}\`);
`,
        explanation: "Wrapping the merge in a typed function ensures both inputs conform to the Config interface and the output is always a complete Config."
      }
    ],
    crossLang: {
      python: {
        code: `defaults = {"color": "blue", "size": 10, "visible": True}
overrides = {"color": "red", "size": 20}

merged = {**defaults, **overrides}

print(f"color: {merged['color']}")
print(f"size: {merged['size']}")
print(f"visible: {str(merged['visible']).lower()}")
`,
        highlights: [
          { lines: [3], explanation: "Python uses ** for dictionary unpacking, similar to TypeScript's ... spread operator." },
          { lines: [7], explanation: "Python boolean True needs conversion to lowercase 'true' to match TypeScript output." }
        ]
      },
      java: {
        code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Object> defaults = new LinkedHashMap<>();
        defaults.put("color", "blue");
        defaults.put("size", 10);
        defaults.put("visible", true);

        Map<String, Object> overrides = new LinkedHashMap<>();
        overrides.put("color", "red");
        overrides.put("size", 20);

        Map<String, Object> merged = new LinkedHashMap<>(defaults);
        merged.putAll(overrides);

        System.out.println("color: " + merged.get("color"));
        System.out.println("size: " + merged.get("size"));
        System.out.println("visible: " + merged.get("visible"));
    }
}
`,
        highlights: [
          { lines: [14, 15], explanation: "Java uses Map.putAll() to merge maps, similar to the spread operator in TypeScript." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Objects",
    level: 1,
    title: "Destructure Nested Object",
    task: "Create a nested object representing a user profile with: name, address (street, city, zip), and contacts (email, phone). Destructure the nested properties and print them each on a separate line.",
    code: `// Destructure Nested Object
// Create a nested object and destructure its properties

// YOUR CODE HERE
`,
    solutionCode: `// Destructure Nested Object
interface Address {
  street: string;
  city: string;
  zip: string;
}

interface Contacts {
  email: string;
  phone: string;
}

interface UserProfile {
  name: string;
  address: Address;
  contacts: Contacts;
}

const user: UserProfile = {
  name: "Alice",
  address: {
    street: "123 Main St",
    city: "Springfield",
    zip: "62701"
  },
  contacts: {
    email: "alice@example.com",
    phone: "555-1234"
  }
};

const { name, address: { street, city, zip }, contacts: { email, phone } } = user;

console.log(\`Name: \${name}\`);
console.log(\`Street: \${street}\`);
console.log(\`City: \${city}\`);
console.log(\`Zip: \${zip}\`);
console.log(\`Email: \${email}\`);
console.log(\`Phone: \${phone}\`);
`,
    expectedOutput: `Name: Alice
Street: 123 Main St
City: Springfield
Zip: 62701
Email: alice@example.com
Phone: 555-1234`,
    testCases: [
      { input: "const user: UserProfile = { name: \"Alice\", address: { street: \"123 Main St\", city: \"Springfield\", zip: \"62701\" }, contacts: { email: \"alice@example.com\", phone: \"555-1234\" } }", output: "Name: Alice\nStreet: 123 Main St\nCity: Springfield\nZip: 62701\nEmail: alice@example.com\nPhone: 555-1234" },
      { input: "const user: UserProfile = { name: \"Bob\", address: { street: \"456 Oak Ave\", city: \"Portland\", zip: \"97201\" }, contacts: { email: \"bob@test.com\", phone: \"555-9999\" } }", output: "Name: Bob\nStreet: 456 Oak Ave\nCity: Portland\nZip: 97201\nEmail: bob@test.com\nPhone: 555-9999" },
      { input: "const user: UserProfile = { name: \"Eve\", address: { street: \"789 Pine Rd\", city: \"Denver\", zip: \"80201\" }, contacts: { email: \"eve@dev.io\", phone: \"555-0000\" } }", output: "Name: Eve\nStreet: 789 Pine Rd\nCity: Denver\nZip: 80201\nEmail: eve@dev.io\nPhone: 555-0000" },
    ],
    hint: "Use nested destructuring: `const { prop, nested: { innerProp } } = obj;`. The colon in destructuring renames or drills into nested objects.",
    judgeFeedback: {
      summary: "Ensure nested destructuring syntax is correct and all properties are extracted.",
      lines: [
        { line: 32, problem: "Not destructuring nested properties", fix: "Use `address: { street, city, zip }` to destructure nested address" },
        { line: 32, problem: "Confusing destructuring rename with nesting", fix: "In destructuring, `address: { street }` extracts street from address, not renaming" }
      ]
    },
    altMethods: [
      {
        name: "Using dot notation access",
        code: `interface Address { street: string; city: string; zip: string; }
interface Contacts { email: string; phone: string; }
interface UserProfile { name: string; address: Address; contacts: Contacts; }

const user: UserProfile = {
  name: "Alice",
  address: { street: "123 Main St", city: "Springfield", zip: "62701" },
  contacts: { email: "alice@example.com", phone: "555-1234" }
};

console.log(\`Name: \${user.name}\`);
console.log(\`Street: \${user.address.street}\`);
console.log(\`City: \${user.address.city}\`);
console.log(\`Zip: \${user.address.zip}\`);
console.log(\`Email: \${user.contacts.email}\`);
console.log(\`Phone: \${user.contacts.phone}\`);
`,
        explanation: "Dot notation is simpler when you only need a few properties. Destructuring is more useful when extracting many properties."
      },
      {
        name: "Using step-by-step destructuring",
        code: `interface Address { street: string; city: string; zip: string; }
interface Contacts { email: string; phone: string; }
interface UserProfile { name: string; address: Address; contacts: Contacts; }

const user: UserProfile = {
  name: "Alice",
  address: { street: "123 Main St", city: "Springfield", zip: "62701" },
  contacts: { email: "alice@example.com", phone: "555-1234" }
};

const { name, address, contacts } = user;
const { street, city, zip } = address;
const { email, phone } = contacts;

console.log(\`Name: \${name}\`);
console.log(\`Street: \${street}\`);
console.log(\`City: \${city}\`);
console.log(\`Zip: \${zip}\`);
console.log(\`Email: \${email}\`);
console.log(\`Phone: \${phone}\`);
`,
        explanation: "Step-by-step destructuring is more readable for deeply nested objects. Each level is destructured in a separate statement."
      }
    ],
    crossLang: {
      python: {
        code: `from dataclasses import dataclass

@dataclass
class Address:
    street: str
    city: str
    zip: str

@dataclass
class Contacts:
    email: str
    phone: str

@dataclass
class UserProfile:
    name: str
    address: Address
    contacts: Contacts

user = UserProfile(
    name="Alice",
    address=Address(street="123 Main St", city="Springfield", zip="62701"),
    contacts=Contacts(email="alice@example.com", phone="555-1234")
)

print(f"Name: {user.name}")
print(f"Street: {user.address.street}")
print(f"City: {user.address.city}")
print(f"Zip: {user.address.zip}")
print(f"Email: {user.contacts.email}")
print(f"Phone: {user.contacts.phone}")
`,
        highlights: [
          { lines: [26, 27, 28], explanation: "Python doesn't have destructuring syntax like TypeScript; dot notation is used for nested access." }
        ]
      },
      java: {
        code: `public class Main {
    record Address(String street, String city, String zip) {}
    record Contacts(String email, String phone) {}
    record UserProfile(String name, Address address, Contacts contacts) {}

    public static void main(String[] args) {
        var user = new UserProfile(
            "Alice",
            new Address("123 Main St", "Springfield", "62701"),
            new Contacts("alice@example.com", "555-1234")
        );

        System.out.println("Name: " + user.name());
        System.out.println("Street: " + user.address().street());
        System.out.println("City: " + user.address().city());
        System.out.println("Zip: " + user.address().zip());
        System.out.println("Email: " + user.contacts().email());
        System.out.println("Phone: " + user.contacts().phone());
    }
}
`,
        highlights: [
          { lines: [2, 3, 4], explanation: "Java records provide concise data classes similar to TypeScript interfaces with automatic accessors." },
          { lines: [14], explanation: "Java uses method-style accessor (user.address().street()) instead of property access." }
        ]
      }
    }
  },

  // ============================================================
  // OBJECTS — Level 2
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Objects",
    level: 2,
    title: "Typed Key-Value Store",
    task: "Create a typed key-value store using Record<string, number> that maps fruit names to their quantities. Add entries for apple(5), banana(3), cherry(8), date(2). Print all entries sorted by key, then find and print the fruit with the most quantity.",
    code: `// Typed Key-Value Store
// Use Record type for a typed key-value store

// YOUR CODE HERE
`,
    solutionCode: `// Typed Key-Value Store
const inventory: Record<string, number> = {
  apple: 5,
  banana: 3,
  cherry: 8,
  date: 2
};

const sortedKeys: string[] = Object.keys(inventory).sort();
for (const key of sortedKeys) {
  console.log(\`\${key}: \${inventory[key]}\`);
}

const maxFruit: string = Object.entries(inventory).reduce(
  (max, [key, val]) => val > max[1] ? [key, val] : max,
  ["", 0]
)[0];
console.log(\`Most: \${maxFruit} (\${inventory[maxFruit]})\`);
`,
    expectedOutput: `apple: 5
banana: 3
cherry: 8
date: 2
Most: cherry (8)`,
    testCases: [
      { input: "const inventory: Record<string, number> = { apple: 5, banana: 3, cherry: 8, date: 2 }", output: "apple: 5\nbanana: 3\ncherry: 8\ndate: 2\nMost: cherry (8)" },
      { input: "const inventory: Record<string, number> = { grape: 10, kiwi: 10, lemon: 3 }", output: "grape: 10\nkiwi: 10\nlemon: 3\nMost: grape (10)" },
      { input: "const inventory: Record<string, number> = { mango: 1 }", output: "mango: 1\nMost: mango (1)" },
    ],
    hint: "Use `Record<string, number>` for a typed dictionary. `Object.keys()` returns keys, `Object.entries()` returns [key, value] pairs. Use `.sort()` for alphabetical ordering.",
    judgeFeedback: {
      summary: "Ensure Record type is used and entries are properly sorted and searched.",
      lines: [
        { line: 2, problem: "Using plain object type instead of Record", fix: "Use `Record<string, number>` for a typed key-value mapping" },
        { line: 9, problem: "Not sorting the keys", fix: "Use `Object.keys(inventory).sort()` for alphabetical order" }
      ]
    },
    altMethods: [
      {
        name: "Using Map",
        code: `const inventory = new Map<string, number>([
  ["apple", 5],
  ["banana", 3],
  ["cherry", 8],
  ["date", 2]
]);

const sortedEntries = [...inventory.entries()].sort(([a], [b]) => a.localeCompare(b));
for (const [key, val] of sortedEntries) {
  console.log(\`\${key}: \${val}\`);
}

let maxFruit = "";
let maxVal = 0;
for (const [key, val] of inventory) {
  if (val > maxVal) {
    maxFruit = key;
    maxVal = val;
  }
}
console.log(\`Most: \${maxFruit} (\${maxVal})\`);
`,
        explanation: "Map provides a proper key-value data structure with methods like .get(), .set(), .has(). It preserves insertion order and allows any key type."
      },
      {
        name: "Using Object.entries with sort and destructuring",
        code: `const inventory: Record<string, number> = {
  apple: 5,
  banana: 3,
  cherry: 8,
  date: 2
};

Object.entries(inventory)
  .sort(([a], [b]) => a.localeCompare(b))
  .forEach(([key, val]) => console.log(\`\${key}: \${val}\`));

const [maxFruit, maxQty] = Object.entries(inventory)
  .sort(([, a], [, b]) => b - a)[0];
console.log(\`Most: \${maxFruit} (\${maxQty})\`);
`,
        explanation: "Object.entries() returns [key, value] pairs that can be sorted and destructured in a functional chain."
      }
    ],
    crossLang: {
      python: {
        code: `inventory: dict[str, int] = {
    "apple": 5,
    "banana": 3,
    "cherry": 8,
    "date": 2
}

for key in sorted(inventory.keys()):
    print(f"{key}: {inventory[key]}")

max_fruit = max(inventory, key=inventory.get)
print(f"Most: {max_fruit} ({inventory[max_fruit]})")
`,
        highlights: [
          { lines: [1], explanation: "Python uses dict[str, int] type hint, equivalent to TypeScript's Record<string, number>." },
          { lines: [11], explanation: "Python's max() with a key function finds the key with the highest value." }
        ]
      },
      java: {
        code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> inventory = new TreeMap<>();
        inventory.put("apple", 5);
        inventory.put("banana", 3);
        inventory.put("cherry", 8);
        inventory.put("date", 2);

        for (var entry : inventory.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }

        var max = Collections.max(inventory.entrySet(), Map.Entry.comparingByValue());
        System.out.println("Most: " + max.getKey() + " (" + max.getValue() + ")");
    }
}
`,
        highlights: [
          { lines: [5], explanation: "Java's TreeMap automatically sorts entries by key, equivalent to manually sorting in TypeScript." },
          { lines: [15], explanation: "Collections.max with a comparator finds the entry with the highest value." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Objects",
    level: 2,
    title: "Pick and Omit Utility Types",
    task: "Define a `User` interface with: id (number), name (string), email (string), password (string), role (string). Use Pick to create a `UserPublic` type with only id, name, email. Use Omit to create a `UserWithoutPassword` type (everything except password). Create a User and display both derived types.",
    code: `// Pick and Omit Utility Types
// Use Pick and Omit to create derived types

// YOUR CODE HERE
`,
    solutionCode: `// Pick and Omit Utility Types
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

type UserPublic = Pick<User, "id" | "name" | "email">;
type UserWithoutPassword = Omit<User, "password">;

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  password: "secret123",
  role: "admin"
};

const publicUser: UserPublic = {
  id: user.id,
  name: user.name,
  email: user.email
};

const safeUser: UserWithoutPassword = {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
};

console.log("Public user:");
console.log(\`  id: \${publicUser.id}\`);
console.log(\`  name: \${publicUser.name}\`);
console.log(\`  email: \${publicUser.email}\`);

console.log("Safe user:");
console.log(\`  id: \${safeUser.id}\`);
console.log(\`  name: \${safeUser.name}\`);
console.log(\`  email: \${safeUser.email}\`);
console.log(\`  role: \${safeUser.role}\`);
`,
    expectedOutput: `Public user:
  id: 1
  name: Alice
  email: alice@example.com
Safe user:
  id: 1
  name: Alice
  email: alice@example.com
  role: admin`,
    testCases: [
      { input: "const id = 1; const name = \"Alice\"; const email = \"alice@example.com\"; const password = \"secret123\"; const role = \"admin\"", output: "Public user:\n  id: 1\n  name: Alice\n  email: alice@example.com\nSafe user:\n  id: 1\n  name: Alice\n  email: alice@example.com\n  role: admin" },
      { input: "const id = 2; const name = \"Bob\"; const email = \"bob@test.com\"; const password = \"pass456\"; const role = \"user\"", output: "Public user:\n  id: 2\n  name: Bob\n  email: bob@test.com\nSafe user:\n  id: 2\n  name: Bob\n  email: bob@test.com\n  role: user" },
      { input: "const id = 99; const name = \"Charlie\"; const email = \"charlie@dev.io\"; const password = \"x\"; const role = \"moderator\"", output: "Public user:\n  id: 99\n  name: Charlie\n  email: charlie@dev.io\nSafe user:\n  id: 99\n  name: Charlie\n  email: charlie@dev.io\n  role: moderator" },
    ],
    hint: "Use `Pick<Type, Keys>` to select specific properties and `Omit<Type, Keys>` to exclude specific properties. Both create new types from existing ones.",
    judgeFeedback: {
      summary: "Ensure Pick and Omit are used correctly with proper key unions.",
      lines: [
        { line: 10, problem: "Wrong syntax for Pick keys", fix: "Use string literal union: `Pick<User, \"id\" | \"name\" | \"email\">`" },
        { line: 11, problem: "Including password in Omit type object", fix: "Omit<User, \"password\"> excludes password, so don't include it in the object" }
      ]
    },
    altMethods: [
      {
        name: "Using destructuring to create derived objects",
        code: `interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

type UserPublic = Pick<User, "id" | "name" | "email">;
type UserWithoutPassword = Omit<User, "password">;

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  password: "secret123",
  role: "admin"
};

const { id, name, email } = user;
const publicUser: UserPublic = { id, name, email };

const { password: _, ...safeUser } = user;
const safe: UserWithoutPassword = safeUser;

console.log("Public user:");
console.log(\`  id: \${publicUser.id}\`);
console.log(\`  name: \${publicUser.name}\`);
console.log(\`  email: \${publicUser.email}\`);

console.log("Safe user:");
console.log(\`  id: \${safe.id}\`);
console.log(\`  name: \${safe.name}\`);
console.log(\`  email: \${safe.email}\`);
console.log(\`  role: \${safe.role}\`);
`,
        explanation: "Destructuring with rest (...) can extract a subset of an object at runtime. The `password: _` pattern removes password and collects the rest."
      },
      {
        name: "Using a generic pick/omit helper",
        code: `interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

type UserPublic = Pick<User, "id" | "name" | "email">;
type UserWithoutPassword = Omit<User, "password">;

function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete (result as any)[key];
  }
  return result as Omit<T, K>;
}

const user: User = { id: 1, name: "Alice", email: "alice@example.com", password: "secret123", role: "admin" };

const publicUser = pick(user, ["id", "name", "email"]);
const safeUser = omit(user, ["password"]);

console.log("Public user:");
console.log(\`  id: \${publicUser.id}\`);
console.log(\`  name: \${publicUser.name}\`);
console.log(\`  email: \${publicUser.email}\`);

console.log("Safe user:");
console.log(\`  id: \${safeUser.id}\`);
console.log(\`  name: \${safeUser.name}\`);
console.log(\`  email: \${safeUser.email}\`);
console.log(\`  role: \${safeUser.role}\`);
`,
        explanation: "Runtime pick and omit helper functions complement TypeScript's type-level Pick and Omit. They provide both type safety and runtime behavior."
      }
    ],
    crossLang: {
      python: {
        code: `from dataclasses import dataclass, fields

@dataclass
class User:
    id: int
    name: str
    email: str
    password: str
    role: str

user = User(id=1, name="Alice", email="alice@example.com", password="secret123", role="admin")

public_user = {"id": user.id, "name": user.name, "email": user.email}
safe_user = {f.name: getattr(user, f.name) for f in fields(user) if f.name != "password"}

print("Public user:")
print(f"  id: {public_user['id']}")
print(f"  name: {public_user['name']}")
print(f"  email: {public_user['email']}")

print("Safe user:")
print(f"  id: {safe_user['id']}")
print(f"  name: {safe_user['name']}")
print(f"  email: {safe_user['email']}")
print(f"  role: {safe_user['role']}")
`,
        highlights: [
          { lines: [13, 14], explanation: "Python has no built-in Pick/Omit; dictionaries or dataclass field filtering are used instead." }
        ]
      },
      java: {
        code: `import java.util.*;

public class Main {
    record User(int id, String name, String email, String password, String role) {}
    record UserPublic(int id, String name, String email) {}
    record UserSafe(int id, String name, String email, String role) {}

    public static void main(String[] args) {
        var user = new User(1, "Alice", "alice@example.com", "secret123", "admin");

        var publicUser = new UserPublic(user.id(), user.name(), user.email());
        var safeUser = new UserSafe(user.id(), user.name(), user.email(), user.role());

        System.out.println("Public user:");
        System.out.println("  id: " + publicUser.id());
        System.out.println("  name: " + publicUser.name());
        System.out.println("  email: " + publicUser.email());

        System.out.println("Safe user:");
        System.out.println("  id: " + safeUser.id());
        System.out.println("  name: " + safeUser.name());
        System.out.println("  email: " + safeUser.email());
        System.out.println("  role: " + safeUser.role());
    }
}
`,
        highlights: [
          { lines: [5, 6], explanation: "Java has no utility types like Pick/Omit; separate record types must be manually defined." }
        ]
      }
    }
  },

  // ============================================================
  // OBJECTS — Level 3
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Objects",
    level: 3,
    title: "Deep Clone an Object",
    task: "Implement a function `deepClone<T>(obj: T): T` that creates a deep copy of an object (handling nested objects and arrays). Test by cloning a nested object, modifying the clone, and showing the original is unchanged.",
    code: `// Deep Clone an Object
// Implement a deep clone function

// YOUR CODE HERE
`,
    solutionCode: `// Deep Clone an Object
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[key] = deepClone((obj as Record<string, unknown>)[key]);
  }
  return result as T;
}

interface Config {
  name: string;
  settings: {
    theme: string;
    colors: string[];
  };
}

const original: Config = {
  name: "app",
  settings: {
    theme: "dark",
    colors: ["red", "green", "blue"]
  }
};

const clone: Config = deepClone(original);
clone.name = "clone-app";
clone.settings.theme = "light";
clone.settings.colors.push("yellow");

console.log("Original:");
console.log(\`  name: \${original.name}\`);
console.log(\`  theme: \${original.settings.theme}\`);
console.log(\`  colors: \${original.settings.colors.join(", ")}\`);

console.log("Clone:");
console.log(\`  name: \${clone.name}\`);
console.log(\`  theme: \${clone.settings.theme}\`);
console.log(\`  colors: \${clone.settings.colors.join(", ")}\`);
`,
    expectedOutput: `Original:
  name: app
  theme: dark
  colors: red, green, blue
Clone:
  name: clone-app
  theme: light
  colors: red, green, blue, yellow`,
    testCases: [
      { input: "const name = \"app\"; const theme = \"dark\"; const colors = [\"red\", \"green\", \"blue\"]", output: "Original:\n  name: app\n  theme: dark\n  colors: red, green, blue\nClone:\n  name: clone-app\n  theme: light\n  colors: red, green, blue, yellow" },
      { input: "const name = \"site\"; const theme = \"light\"; const colors = [\"white\", \"black\"]", output: "Original:\n  name: site\n  theme: light\n  colors: white, black\nClone:\n  name: clone-site\n  theme: light\n  colors: white, black, yellow" },
      { input: "const name = \"tool\"; const theme = \"blue\"; const colors = [\"cyan\"]", output: "Original:\n  name: tool\n  theme: blue\n  colors: cyan\nClone:\n  name: clone-tool\n  theme: light\n  colors: cyan, yellow" },
    ],
    hint: "Recursively copy each property. Check if value is null, a primitive, an array, or an object. Arrays need map with recursive clone, objects need key iteration.",
    judgeFeedback: {
      summary: "Ensure the clone is truly deep — modifying nested properties of the clone should not affect the original.",
      lines: [
        { line: 3, problem: "Not handling null values", fix: "Check `obj === null` first since `typeof null === 'object'`" },
        { line: 7, problem: "Not handling arrays separately", fix: "Use `Array.isArray(obj)` to check for arrays before treating as generic object" }
      ]
    },
    altMethods: [
      {
        name: "Using structuredClone",
        code: `interface Config {
  name: string;
  settings: {
    theme: string;
    colors: string[];
  };
}

const original: Config = {
  name: "app",
  settings: {
    theme: "dark",
    colors: ["red", "green", "blue"]
  }
};

const clone: Config = structuredClone(original);
clone.name = "clone-app";
clone.settings.theme = "light";
clone.settings.colors.push("yellow");

console.log("Original:");
console.log(\`  name: \${original.name}\`);
console.log(\`  theme: \${original.settings.theme}\`);
console.log(\`  colors: \${original.settings.colors.join(", ")}\`);

console.log("Clone:");
console.log(\`  name: \${clone.name}\`);
console.log(\`  theme: \${clone.settings.theme}\`);
console.log(\`  colors: \${clone.settings.colors.join(", ")}\`);
`,
        explanation: "structuredClone is a built-in function (Node 17+) that performs deep cloning. It handles circular references but doesn't clone functions."
      },
      {
        name: "Using JSON parse/stringify",
        code: `interface Config {
  name: string;
  settings: {
    theme: string;
    colors: string[];
  };
}

const original: Config = {
  name: "app",
  settings: {
    theme: "dark",
    colors: ["red", "green", "blue"]
  }
};

const clone: Config = JSON.parse(JSON.stringify(original));
clone.name = "clone-app";
clone.settings.theme = "light";
clone.settings.colors.push("yellow");

console.log("Original:");
console.log(\`  name: \${original.name}\`);
console.log(\`  theme: \${original.settings.theme}\`);
console.log(\`  colors: \${original.settings.colors.join(", ")}\`);

console.log("Clone:");
console.log(\`  name: \${clone.name}\`);
console.log(\`  theme: \${clone.settings.theme}\`);
console.log(\`  colors: \${clone.settings.colors.join(", ")}\`);
`,
        explanation: "JSON.parse(JSON.stringify(obj)) is a simple deep clone technique but doesn't handle Date, RegExp, functions, undefined, or circular references."
      }
    ],
    crossLang: {
      python: {
        code: `import copy

original = {
    "name": "app",
    "settings": {
        "theme": "dark",
        "colors": ["red", "green", "blue"]
    }
}

clone = copy.deepcopy(original)
clone["name"] = "clone-app"
clone["settings"]["theme"] = "light"
clone["settings"]["colors"].append("yellow")

print("Original:")
print(f"  name: {original['name']}")
print(f"  theme: {original['settings']['theme']}")
print(f"  colors: {', '.join(original['settings']['colors'])}")

print("Clone:")
print(f"  name: {clone['name']}")
print(f"  theme: {clone['settings']['theme']}")
print(f"  colors: {', '.join(clone['settings']['colors'])}")
`,
        highlights: [
          { lines: [11], explanation: "Python's copy.deepcopy() is the standard library solution for deep cloning, handling circular references automatically." }
        ]
      },
      java: {
        code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Object> original = new LinkedHashMap<>();
        original.put("name", "app");
        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("theme", "dark");
        settings.put("colors", new ArrayList<>(List.of("red", "green", "blue")));
        original.put("settings", settings);

        // Deep clone using manual copy
        Map<String, Object> clone = new LinkedHashMap<>(original);
        Map<String, Object> cloneSettings = new LinkedHashMap<>((Map<String, Object>) original.get("settings"));
        cloneSettings.put("colors", new ArrayList<>((List<String>) settings.get("colors")));
        clone.put("settings", cloneSettings);

        clone.put("name", "clone-app");
        ((Map<String, Object>) clone.get("settings")).put("theme", "light");
        ((List<String>) ((Map<String, Object>) clone.get("settings")).get("colors")).add("yellow");

        System.out.println("Original:");
        System.out.println("  name: " + original.get("name"));
        System.out.println("  theme: " + ((Map<String, Object>) original.get("settings")).get("theme"));
        System.out.println("  colors: " + String.join(", ", (List<String>) ((Map<String, Object>) original.get("settings")).get("colors")));

        System.out.println("Clone:");
        System.out.println("  name: " + clone.get("name"));
        System.out.println("  theme: " + ((Map<String, Object>) clone.get("settings")).get("theme"));
        System.out.println("  colors: " + String.join(", ", (List<String>) ((Map<String, Object>) clone.get("settings")).get("colors")));
    }
}
`,
        highlights: [
          { lines: [13, 14, 15, 16], explanation: "Java has no built-in deep clone for maps. Manual copying of nested structures is required, which is verbose compared to TypeScript." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Objects",
    level: 3,
    title: "Class with Getters and Setters",
    task: "Create a `BankAccount` class with:\n- Private properties: _owner (string), _balance (number)\n- Constructor that takes owner and initial balance\n- Getter/setter for balance (setter should reject negative values)\n- Methods: deposit(amount), withdraw(amount) — withdraw should fail if insufficient funds\n- Method: toString() returning \"Account(<owner>): $<balance>\"\nTest with deposits and withdrawals, including an attempted overdraft.",
    code: `// Class with Getters and Setters
// Create a BankAccount class with encapsulation

// YOUR CODE HERE
`,
    solutionCode: `// Class with Getters and Setters
class BankAccount {
  private _owner: string;
  private _balance: number;

  constructor(owner: string, initialBalance: number) {
    this._owner = owner;
    this._balance = initialBalance;
  }

  get owner(): string {
    return this._owner;
  }

  get balance(): number {
    return this._balance;
  }

  set balance(value: number) {
    if (value < 0) {
      console.log("Error: Balance cannot be negative");
      return;
    }
    this._balance = value;
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      console.log("Error: Deposit must be positive");
      return;
    }
    this._balance += amount;
    console.log(\`Deposited $\${amount}\`);
  }

  withdraw(amount: number): void {
    if (amount > this._balance) {
      console.log(\`Error: Insufficient funds (balance: $\${this._balance})\`);
      return;
    }
    this._balance -= amount;
    console.log(\`Withdrew $\${amount}\`);
  }

  toString(): string {
    return \`Account(\${this._owner}): $\${this._balance}\`;
  }
}

const account = new BankAccount("Alice", 100);
console.log(account.toString());

account.deposit(50);
console.log(account.toString());

account.withdraw(30);
console.log(account.toString());

account.withdraw(200);
console.log(account.toString());
`,
    expectedOutput: `Account(Alice): $100
Deposited $50
Account(Alice): $150
Withdrew $30
Account(Alice): $120
Error: Insufficient funds (balance: $120)
Account(Alice): $120`,
    testCases: [
      { input: "const owner = \"Alice\"; const initialBalance = 100; const depositAmt = 50; const withdrawAmt1 = 30; const withdrawAmt2 = 200", output: "Account(Alice): $100\nDeposited $50\nAccount(Alice): $150\nWithdrew $30\nAccount(Alice): $120\nError: Insufficient funds (balance: $120)\nAccount(Alice): $120" },
      { input: "const owner = \"Bob\"; const initialBalance = 500; const depositAmt = 100; const withdrawAmt1 = 200; const withdrawAmt2 = 300", output: "Account(Bob): $500\nDeposited $100\nAccount(Bob): $600\nWithdrew $200\nAccount(Bob): $400\nWithdrew $300\nAccount(Bob): $100" },
      { input: "const owner = \"Eve\"; const initialBalance = 0; const depositAmt = 75; const withdrawAmt1 = 75; const withdrawAmt2 = 1", output: "Account(Eve): $0\nDeposited $75\nAccount(Eve): $75\nWithdrew $75\nAccount(Eve): $0\nError: Insufficient funds (balance: $0)\nAccount(Eve): $0" },
    ],
    hint: "Use `private` for properties, `get` for getters, and `set` for setters. Validate inputs in setters and methods to maintain object integrity.",
    judgeFeedback: {
      summary: "Ensure properties are private and getters/setters provide controlled access.",
      lines: [
        { line: 3, problem: "Properties not marked as private", fix: "Use `private _balance: number` to prevent direct access" },
        { line: 19, problem: "Setter not validating input", fix: "Check `if (value < 0)` in the setter to prevent negative balances" }
      ]
    },
    altMethods: [
      {
        name: "Using readonly and methods only",
        code: `class BankAccount {
  readonly owner: string;
  private _balance: number;

  constructor(owner: string, initialBalance: number) {
    this.owner = owner;
    this._balance = initialBalance;
  }

  getBalance(): number {
    return this._balance;
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      console.log("Error: Deposit must be positive");
      return;
    }
    this._balance += amount;
    console.log(\`Deposited $\${amount}\`);
  }

  withdraw(amount: number): void {
    if (amount > this._balance) {
      console.log(\`Error: Insufficient funds (balance: $\${this._balance})\`);
      return;
    }
    this._balance -= amount;
    console.log(\`Withdrew $\${amount}\`);
  }

  toString(): string {
    return \`Account(\${this.owner}): $\${this._balance}\`;
  }
}

const account = new BankAccount("Alice", 100);
console.log(account.toString());

account.deposit(50);
console.log(account.toString());

account.withdraw(30);
console.log(account.toString());

account.withdraw(200);
console.log(account.toString());
`,
        explanation: "Using `readonly` for immutable properties and explicit getBalance() method instead of a getter. This is more explicit about read-only intent."
      },
      {
        name: "Using # private fields",
        code: `class BankAccount {
  #owner: string;
  #balance: number;

  constructor(owner: string, initialBalance: number) {
    this.#owner = owner;
    this.#balance = initialBalance;
  }

  get balance(): number {
    return this.#balance;
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      console.log("Error: Deposit must be positive");
      return;
    }
    this.#balance += amount;
    console.log(\`Deposited $\${amount}\`);
  }

  withdraw(amount: number): void {
    if (amount > this.#balance) {
      console.log(\`Error: Insufficient funds (balance: $\${this.#balance})\`);
      return;
    }
    this.#balance -= amount;
    console.log(\`Withdrew $\${amount}\`);
  }

  toString(): string {
    return \`Account(\${this.#owner}): $\${this.#balance}\`;
  }
}

const account = new BankAccount("Alice", 100);
console.log(account.toString());

account.deposit(50);
console.log(account.toString());

account.withdraw(30);
console.log(account.toString());

account.withdraw(200);
console.log(account.toString());
`,
        explanation: "ES2022 # private fields provide true runtime privacy (not just TypeScript compile-time). They cannot be accessed outside the class even with type assertions."
      }
    ],
    crossLang: {
      python: {
        code: `class BankAccount:
    def __init__(self, owner: str, initial_balance: float):
        self._owner = owner
        self._balance = initial_balance

    @property
    def owner(self) -> str:
        return self._owner

    @property
    def balance(self) -> float:
        return self._balance

    @balance.setter
    def balance(self, value: float):
        if value < 0:
            print("Error: Balance cannot be negative")
            return
        self._balance = value

    def deposit(self, amount: float):
        if amount <= 0:
            print("Error: Deposit must be positive")
            return
        self._balance += amount
        print(f"Deposited {amount}")

    def withdraw(self, amount: float):
        if amount > self._balance:
            print(f"Error: Insufficient funds (balance: {self._balance})")
            return
        self._balance -= amount
        print(f"Withdrew {amount}")

    def __str__(self) -> str:
        return f"Account({self._owner}): {self._balance}"

account = BankAccount("Alice", 100)
print(account)
account.deposit(50)
print(account)
account.withdraw(30)
print(account)
account.withdraw(200)
print(account)
`,
        highlights: [
          { lines: [6, 7, 8, 10, 11, 12, 14, 15], explanation: "Python uses @property decorator for getters and @name.setter for setters, equivalent to TypeScript's get/set." },
          { lines: [3], explanation: "Python convention uses _ prefix for private members (not enforced), unlike TypeScript's private keyword." }
        ]
      },
      java: {
        code: `public class Main {
    static class BankAccount {
        private final String owner;
        private double balance;

        BankAccount(String owner, double initialBalance) {
            this.owner = owner;
            this.balance = initialBalance;
        }

        double getBalance() { return balance; }

        void deposit(double amount) {
            if (amount <= 0) { System.out.println("Error: Deposit must be positive"); return; }
            balance += amount;
            System.out.println("Deposited $" + (int) amount);
        }

        void withdraw(double amount) {
            if (amount > balance) {
                System.out.println("Error: Insufficient funds (balance: $" + (int) balance + ")");
                return;
            }
            balance -= amount;
            System.out.println("Withdrew $" + (int) amount);
        }

        public String toString() {
            return "Account(" + owner + "): $" + (int) balance;
        }
    }

    public static void main(String[] args) {
        BankAccount account = new BankAccount("Alice", 100);
        System.out.println(account);
        account.deposit(50);
        System.out.println(account);
        account.withdraw(30);
        System.out.println(account);
        account.withdraw(200);
        System.out.println(account);
    }
}
`,
        highlights: [
          { lines: [3, 4], explanation: "Java uses private keyword for access control, similar to TypeScript. final makes the field immutable." },
          { lines: [11], explanation: "Java uses explicit getter methods instead of get/set syntax." }
        ]
      }
    }
  },

  // ============================================================
  // ASYNC/AWAIT — Level 1
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Async/Await",
    level: 1,
    title: "Promise with Delay",
    task: "Create a function `delay(ms: number): Promise<void>` that wraps setTimeout in a Promise. Then create a function `greetAfterDelay(name: string, ms: number): Promise<string>` that waits for the delay then returns a greeting. Call it with \"Alice\" and 100ms, printing the result.",
    code: `// Promise with Delay
// Create a Promise-based delay function

// YOUR CODE HERE
`,
    solutionCode: `// Promise with Delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function greetAfterDelay(name: string, ms: number): Promise<string> {
  await delay(ms);
  return \`Hello, \${name}!\`;
}

async function main(): Promise<void> {
  console.log("Starting...");
  const greeting = await greetAfterDelay("Alice", 100);
  console.log(greeting);
  console.log("Done!");
}

main();
`,
    expectedOutput: `Starting...
Hello, Alice!
Done!`,
    testCases: [
      { input: "const name = \"Alice\"; const ms = 100", output: "Starting...\nHello, Alice!\nDone!" },
      { input: "const name = \"Bob\"; const ms = 50", output: "Starting...\nHello, Bob!\nDone!" },
      { input: "const name = \"World\"; const ms = 200", output: "Starting...\nHello, World!\nDone!" },
    ],
    hint: "Wrap setTimeout in a Promise: `new Promise(resolve => setTimeout(resolve, ms))`. Use async/await to wait for the promise to resolve.",
    judgeFeedback: {
      summary: "Ensure the delay function returns a Promise and async/await is used correctly.",
      lines: [
        { line: 2, problem: "Not returning a Promise", fix: "Return `new Promise<void>((resolve) => setTimeout(resolve, ms))`" },
        { line: 6, problem: "Not using async keyword", fix: "Mark the function as `async` to use `await` inside it" }
      ]
    },
    altMethods: [
      {
        name: "Using .then() chain",
        code: `function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function greetAfterDelay(name: string, ms: number): Promise<string> {
  return delay(ms).then(() => \`Hello, \${name}!\`);
}

console.log("Starting...");
greetAfterDelay("Alice", 100).then((greeting) => {
  console.log(greeting);
  console.log("Done!");
});
`,
        explanation: "Using .then() chains instead of async/await. This is the older Promise pattern and can lead to callback nesting for complex flows."
      },
      {
        name: "Using Promise constructor directly",
        code: `function greetAfterDelay(name: string, ms: number): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(\`Hello, \${name}!\`);
    }, ms);
  });
}

async function main(): Promise<void> {
  console.log("Starting...");
  const greeting = await greetAfterDelay("Alice", 100);
  console.log(greeting);
  console.log("Done!");
}

main();
`,
        explanation: "Creating the Promise directly in greetAfterDelay combines the delay and greeting into a single Promise, eliminating the need for a separate delay function."
      }
    ],
    crossLang: {
      python: {
        code: `import asyncio

async def delay(ms: float) -> None:
    await asyncio.sleep(ms / 1000)

async def greet_after_delay(name: str, ms: float) -> str:
    await delay(ms)
    return f"Hello, {name}!"

async def main() -> None:
    print("Starting...")
    greeting = await greet_after_delay("Alice", 100)
    print(greeting)
    print("Done!")

asyncio.run(main())
`,
        highlights: [
          { lines: [3, 4], explanation: "Python uses asyncio.sleep() instead of wrapping setTimeout. The argument is in seconds, so we divide by 1000." },
          { lines: [16], explanation: "Python uses asyncio.run() to start the event loop, equivalent to calling main() in TypeScript." }
        ]
      },
      java: {
        code: `import java.util.concurrent.*;

public class Main {
    static CompletableFuture<Void> delay(long ms) {
        return CompletableFuture.runAsync(() -> {
            try { Thread.sleep(ms); } catch (InterruptedException e) { throw new RuntimeException(e); }
        });
    }

    static CompletableFuture<String> greetAfterDelay(String name, long ms) {
        return delay(ms).thenApply(v -> "Hello, " + name + "!");
    }

    public static void main(String[] args) throws Exception {
        System.out.println("Starting...");
        String greeting = greetAfterDelay("Alice", 100).get();
        System.out.println(greeting);
        System.out.println("Done!");
    }
}
`,
        highlights: [
          { lines: [4, 5, 6], explanation: "Java uses CompletableFuture instead of Promise, and Thread.sleep() instead of setTimeout." },
          { lines: [16], explanation: "Java's .get() blocks until the future completes, similar to await in TypeScript." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Async/Await",
    level: 1,
    title: "Sequential Async Operations",
    task: "Create an async function `fetchUser(id: number)` that simulates fetching a user (returns after 50ms with {id, name: \"User_<id>\"}). Create `fetchPosts(userId: number)` that returns after 50ms with an array of 2 posts. Chain them: fetch user 1, then fetch their posts, print results.",
    code: `// Sequential Async Operations
// Chain async operations sequentially

// YOUR CODE HERE
`,
    solutionCode: `// Sequential Async Operations
interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  userId: number;
}

function fetchUser(id: number): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: \`User_\${id}\` });
    }, 50);
  });
}

function fetchPosts(userId: number): Promise<Post[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: \`Post 1 by User_\${userId}\`, userId },
        { id: 2, title: \`Post 2 by User_\${userId}\`, userId }
      ]);
    }, 50);
  });
}

async function main(): Promise<void> {
  console.log("Fetching user...");
  const user = await fetchUser(1);
  console.log(\`User: \${user.name}\`);

  console.log("Fetching posts...");
  const posts = await fetchPosts(user.id);
  for (const post of posts) {
    console.log(\`  - \${post.title}\`);
  }
  console.log("Done!");
}

main();
`,
    expectedOutput: `Fetching user...
User: User_1
Fetching posts...
  - Post 1 by User_1
  - Post 2 by User_1
Done!`,
    testCases: [
      { input: "const userId = 1", output: "Fetching user...\nUser: User_1\nFetching posts...\n  - Post 1 by User_1\n  - Post 2 by User_1\nDone!" },
      { input: "const userId = 42", output: "Fetching user...\nUser: User_42\nFetching posts...\n  - Post 1 by User_42\n  - Post 2 by User_42\nDone!" },
      { input: "const userId = 100", output: "Fetching user...\nUser: User_100\nFetching posts...\n  - Post 1 by User_100\n  - Post 2 by User_100\nDone!" },
    ],
    hint: "Use `await` to wait for each async operation before starting the next one. This ensures sequential execution where later operations depend on earlier results.",
    judgeFeedback: {
      summary: "Ensure async operations are properly chained with await and interfaces are defined.",
      lines: [
        { line: 13, problem: "Not returning a typed Promise", fix: "Use `Promise<User>` as return type for type safety" },
        { line: 35, problem: "Starting both requests simultaneously", fix: "Use `await` for each request sequentially since posts depend on the user" }
      ]
    },
    altMethods: [
      {
        name: "Using .then() chains",
        code: `interface User { id: number; name: string; }
interface Post { id: number; title: string; userId: number; }

function fetchUser(id: number): Promise<User> {
  return new Promise((resolve) => setTimeout(() => resolve({ id, name: \`User_\${id}\` }), 50));
}

function fetchPosts(userId: number): Promise<Post[]> {
  return new Promise((resolve) => setTimeout(() => resolve([
    { id: 1, title: \`Post 1 by User_\${userId}\`, userId },
    { id: 2, title: \`Post 2 by User_\${userId}\`, userId }
  ]), 50));
}

console.log("Fetching user...");
fetchUser(1)
  .then((user) => {
    console.log(\`User: \${user.name}\`);
    console.log("Fetching posts...");
    return fetchPosts(user.id);
  })
  .then((posts) => {
    for (const post of posts) {
      console.log(\`  - \${post.title}\`);
    }
    console.log("Done!");
  });
`,
        explanation: "The .then() chain passes each result to the next handler. Returning a Promise from .then() continues the chain."
      },
      {
        name: "Using an async generator",
        code: `interface User { id: number; name: string; }
interface Post { id: number; title: string; userId: number; }

function fetchUser(id: number): Promise<User> {
  return new Promise((resolve) => setTimeout(() => resolve({ id, name: \`User_\${id}\` }), 50));
}

function fetchPosts(userId: number): Promise<Post[]> {
  return new Promise((resolve) => setTimeout(() => resolve([
    { id: 1, title: \`Post 1 by User_\${userId}\`, userId },
    { id: 2, title: \`Post 2 by User_\${userId}\`, userId }
  ]), 50));
}

async function* loadData(): AsyncGenerator<string> {
  yield "Fetching user...";
  const user = await fetchUser(1);
  yield \`User: \${user.name}\`;
  yield "Fetching posts...";
  const posts = await fetchPosts(user.id);
  for (const post of posts) {
    yield \`  - \${post.title}\`;
  }
  yield "Done!";
}

(async () => {
  for await (const line of loadData()) {
    console.log(line);
  }
})();
`,
        explanation: "An async generator yields values as they become available. `for await...of` consumes them sequentially. This pattern is useful for streaming data."
      }
    ],
    crossLang: {
      python: {
        code: `import asyncio

async def fetch_user(user_id: int) -> dict:
    await asyncio.sleep(0.05)
    return {"id": user_id, "name": f"User_{user_id}"}

async def fetch_posts(user_id: int) -> list:
    await asyncio.sleep(0.05)
    return [
        {"id": 1, "title": f"Post 1 by User_{user_id}", "userId": user_id},
        {"id": 2, "title": f"Post 2 by User_{user_id}", "userId": user_id}
    ]

async def main():
    print("Fetching user...")
    user = await fetch_user(1)
    print(f"User: {user['name']}")

    print("Fetching posts...")
    posts = await fetch_posts(user["id"])
    for post in posts:
        print(f"  - {post['title']}")
    print("Done!")

asyncio.run(main())
`,
        highlights: [
          { lines: [4], explanation: "Python uses asyncio.sleep() for async delays, equivalent to the setTimeout-based Promise." },
          { lines: [25], explanation: "Python's asyncio.run() starts the event loop, similar to calling main() in TypeScript." }
        ]
      },
      java: {
        code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    record User(int id, String name) {}
    record Post(int id, String title, int userId) {}

    static CompletableFuture<User> fetchUser(int id) {
        return CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(50); } catch (InterruptedException e) { throw new RuntimeException(e); }
            return new User(id, "User_" + id);
        });
    }

    static CompletableFuture<List<Post>> fetchPosts(int userId) {
        return CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(50); } catch (InterruptedException e) { throw new RuntimeException(e); }
            return List.of(
                new Post(1, "Post 1 by User_" + userId, userId),
                new Post(2, "Post 2 by User_" + userId, userId)
            );
        });
    }

    public static void main(String[] args) throws Exception {
        System.out.println("Fetching user...");
        User user = fetchUser(1).get();
        System.out.println("User: " + user.name());

        System.out.println("Fetching posts...");
        List<Post> posts = fetchPosts(user.id()).get();
        for (Post post : posts) {
            System.out.println("  - " + post.title());
        }
        System.out.println("Done!");
    }
}
`,
        highlights: [
          { lines: [8, 9, 10], explanation: "Java uses CompletableFuture.supplyAsync() to run tasks asynchronously, similar to Promise constructor." },
          { lines: [27], explanation: "Java's .get() blocks until completion, equivalent to await in TypeScript." }
        ]
      }
    }
  },

  // ============================================================
  // ASYNC/AWAIT — Level 2
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Async/Await",
    level: 2,
    title: "Promise.all with Multiple Tasks",
    task: "Create async functions to simulate fetching data from three endpoints (each with different delays):\n- fetchUsers(): returns [\"Alice\",\"Bob\"] after 100ms\n- fetchProducts(): returns [\"Widget\",\"Gadget\"] after 80ms\n- fetchOrders(): returns [\"Order1\",\"Order2\"] after 60ms\nUse Promise.all to fetch all three concurrently and print results.",
    code: `// Promise.all with Multiple Tasks
// Fetch multiple resources concurrently

// YOUR CODE HERE
`,
    solutionCode: `// Promise.all with Multiple Tasks
function fetchUsers(): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(["Alice", "Bob"]), 100);
  });
}

function fetchProducts(): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(["Widget", "Gadget"]), 80);
  });
}

function fetchOrders(): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(["Order1", "Order2"]), 60);
  });
}

async function main(): Promise<void> {
  console.log("Fetching all data...");

  const [users, products, orders] = await Promise.all([
    fetchUsers(),
    fetchProducts(),
    fetchOrders()
  ]);

  console.log(\`Users: \${users.join(", ")}\`);
  console.log(\`Products: \${products.join(", ")}\`);
  console.log(\`Orders: \${orders.join(", ")}\`);
  console.log("All done!");
}

main();
`,
    expectedOutput: `Fetching all data...
Users: Alice, Bob
Products: Widget, Gadget
Orders: Order1, Order2
All done!`,
    testCases: [
      { input: "const usersData = [\"Alice\", \"Bob\"]; const productsData = [\"Widget\", \"Gadget\"]; const ordersData = [\"Order1\", \"Order2\"]", output: "Fetching all data...\nUsers: Alice, Bob\nProducts: Widget, Gadget\nOrders: Order1, Order2\nAll done!" },
      { input: "const usersData = [\"Charlie\"]; const productsData = [\"Laptop\", \"Phone\", \"Tablet\"]; const ordersData = [\"Order99\"]", output: "Fetching all data...\nUsers: Charlie\nProducts: Laptop, Phone, Tablet\nOrders: Order99\nAll done!" },
      { input: "const usersData = [\"Eve\", \"Frank\", \"Grace\"]; const productsData = [\"Book\"]; const ordersData = [\"OrderA\", \"OrderB\", \"OrderC\"]", output: "Fetching all data...\nUsers: Eve, Frank, Grace\nProducts: Book\nOrders: OrderA, OrderB, OrderC\nAll done!" },
    ],
    hint: "Promise.all takes an array of promises and resolves when ALL complete. Destructure the result: `const [a, b, c] = await Promise.all([p1, p2, p3])`.",
    judgeFeedback: {
      summary: "Ensure Promise.all is used for concurrent execution rather than sequential awaits.",
      lines: [
        { line: 23, problem: "Using sequential await instead of Promise.all", fix: "Use `Promise.all([fetchUsers(), fetchProducts(), fetchOrders()])` for concurrent execution" },
        { line: 23, problem: "Not destructuring Promise.all result", fix: "Destructure: `const [users, products, orders] = await Promise.all([...])`" }
      ]
    },
    altMethods: [
      {
        name: "Using Promise.allSettled",
        code: `function fetchUsers(): Promise<string[]> {
  return new Promise((resolve) => setTimeout(() => resolve(["Alice", "Bob"]), 100));
}

function fetchProducts(): Promise<string[]> {
  return new Promise((resolve) => setTimeout(() => resolve(["Widget", "Gadget"]), 80));
}

function fetchOrders(): Promise<string[]> {
  return new Promise((resolve) => setTimeout(() => resolve(["Order1", "Order2"]), 60));
}

async function main(): Promise<void> {
  console.log("Fetching all data...");

  const results = await Promise.allSettled([
    fetchUsers(),
    fetchProducts(),
    fetchOrders()
  ]);

  const names = ["Users", "Products", "Orders"];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      console.log(\`\${names[i]}: \${result.value.join(", ")}\`);
    }
  });
  console.log("All done!");
}

main();
`,
        explanation: "Promise.allSettled waits for all promises regardless of rejection. Each result has a status ('fulfilled' or 'rejected') and value/reason."
      },
      {
        name: "Using individual try/catch with Promise.all",
        code: `function fetchUsers(): Promise<string[]> {
  return new Promise((resolve) => setTimeout(() => resolve(["Alice", "Bob"]), 100));
}

function fetchProducts(): Promise<string[]> {
  return new Promise((resolve) => setTimeout(() => resolve(["Widget", "Gadget"]), 80));
}

function fetchOrders(): Promise<string[]> {
  return new Promise((resolve) => setTimeout(() => resolve(["Order1", "Order2"]), 60));
}

async function safeFetch<T>(promise: Promise<T>, label: string): Promise<{ label: string; data: T }> {
  const data = await promise;
  return { label, data };
}

async function main(): Promise<void> {
  console.log("Fetching all data...");

  const results = await Promise.all([
    safeFetch(fetchUsers(), "Users"),
    safeFetch(fetchProducts(), "Products"),
    safeFetch(fetchOrders(), "Orders")
  ]);

  for (const { label, data } of results) {
    console.log(\`\${label}: \${data.join(", ")}\`);
  }
  console.log("All done!");
}

main();
`,
        explanation: "Wrapping each promise in a safeFetch function adds metadata (labels) to results, making it easy to identify which data came from which source."
      }
    ],
    crossLang: {
      python: {
        code: `import asyncio

async def fetch_users() -> list[str]:
    await asyncio.sleep(0.1)
    return ["Alice", "Bob"]

async def fetch_products() -> list[str]:
    await asyncio.sleep(0.08)
    return ["Widget", "Gadget"]

async def fetch_orders() -> list[str]:
    await asyncio.sleep(0.06)
    return ["Order1", "Order2"]

async def main():
    print("Fetching all data...")

    users, products, orders = await asyncio.gather(
        fetch_users(),
        fetch_products(),
        fetch_orders()
    )

    print(f"Users: {', '.join(users)}")
    print(f"Products: {', '.join(products)}")
    print(f"Orders: {', '.join(orders)}")
    print("All done!")

asyncio.run(main())
`,
        highlights: [
          { lines: [18, 19, 20, 21, 22], explanation: "Python's asyncio.gather() is equivalent to Promise.all() — it runs coroutines concurrently." }
        ]
      },
      java: {
        code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    static CompletableFuture<List<String>> fetchUsers() {
        return CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(100); } catch (InterruptedException e) { throw new RuntimeException(e); }
            return List.of("Alice", "Bob");
        });
    }

    static CompletableFuture<List<String>> fetchProducts() {
        return CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(80); } catch (InterruptedException e) { throw new RuntimeException(e); }
            return List.of("Widget", "Gadget");
        });
    }

    static CompletableFuture<List<String>> fetchOrders() {
        return CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(60); } catch (InterruptedException e) { throw new RuntimeException(e); }
            return List.of("Order1", "Order2");
        });
    }

    public static void main(String[] args) throws Exception {
        System.out.println("Fetching all data...");

        var usersFuture = fetchUsers();
        var productsFuture = fetchProducts();
        var ordersFuture = fetchOrders();

        CompletableFuture.allOf(usersFuture, productsFuture, ordersFuture).get();

        System.out.println("Users: " + String.join(", ", usersFuture.get()));
        System.out.println("Products: " + String.join(", ", productsFuture.get()));
        System.out.println("Orders: " + String.join(", ", ordersFuture.get()));
        System.out.println("All done!");
    }
}
`,
        highlights: [
          { lines: [33], explanation: "Java's CompletableFuture.allOf() is similar to Promise.all(), but doesn't return the values directly." },
          { lines: [35, 36, 37], explanation: "After allOf completes, individual .get() calls retrieve each result (they complete immediately since allOf already waited)." }
        ]
      }
    }
  },

  {
    lang: "TypeScript",
    topic: "Async/Await",
    level: 2,
    title: "Error Handling with Try/Catch",
    task: "Create an async function `riskyOperation(shouldFail: boolean): Promise<string>` that rejects with \"Operation failed\" if shouldFail is true, otherwise resolves with \"Success\". Write a wrapper that calls it three times (true, false, true) with proper try/catch error handling, printing the result or error for each call.",
    code: `// Error Handling with Try/Catch
// Handle errors in async operations

// YOUR CODE HERE
`,
    solutionCode: `// Error Handling with Try/Catch
function riskyOperation(shouldFail: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Operation failed"));
      } else {
        resolve("Success");
      }
    }, 50);
  });
}

async function safeCall(shouldFail: boolean, label: string): Promise<void> {
  try {
    const result = await riskyOperation(shouldFail);
    console.log(\`\${label}: \${result}\`);
  } catch (error) {
    if (error instanceof Error) {
      console.log(\`\${label}: Error - \${error.message}\`);
    }
  }
}

async function main(): Promise<void> {
  await safeCall(true, "Call 1");
  await safeCall(false, "Call 2");
  await safeCall(true, "Call 3");
  console.log("All calls completed");
}

main();
`,
    expectedOutput: `Call 1: Error - Operation failed
Call 2: Success
Call 3: Error - Operation failed
All calls completed`,
    testCases: [
      { input: "const calls: [boolean, string][] = [[true, \"Call 1\"], [false, \"Call 2\"], [true, \"Call 3\"]]", output: "Call 1: Error - Operation failed\nCall 2: Success\nCall 3: Error - Operation failed\nAll calls completed" },
      { input: "const calls: [boolean, string][] = [[false, \"Call 1\"], [false, \"Call 2\"], [false, \"Call 3\"]]", output: "Call 1: Success\nCall 2: Success\nCall 3: Success\nAll calls completed" },
      { input: "const calls: [boolean, string][] = [[true, \"Call 1\"], [true, \"Call 2\"]]", output: "Call 1: Error - Operation failed\nCall 2: Error - Operation failed\nAll calls completed" },
    ],
    hint: "Use try/catch around await to handle Promise rejections. Use `error instanceof Error` for type-safe error handling in TypeScript.",
    judgeFeedback: {
      summary: "Ensure try/catch properly catches rejected promises and errors are typed.",
      lines: [
        { line: 15, problem: "Not wrapping await in try/catch", fix: "Use `try { const result = await riskyOp(); } catch (error) { ... }`" },
        { line: 19, problem: "Not checking error type", fix: "Use `error instanceof Error` before accessing error.message for type safety" }
      ]
    },
    altMethods: [
      {
        name: "Using .catch() method",
        code: `function riskyOperation(shouldFail: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("Operation failed"));
      else resolve("Success");
    }, 50);
  });
}

async function main(): Promise<void> {
  const calls: [boolean, string][] = [[true, "Call 1"], [false, "Call 2"], [true, "Call 3"]];

  for (const [shouldFail, label] of calls) {
    await riskyOperation(shouldFail)
      .then((result) => console.log(\`\${label}: \${result}\`))
      .catch((error: Error) => console.log(\`\${label}: Error - \${error.message}\`));
  }
  console.log("All calls completed");
}

main();
`,
        explanation: "Using .then().catch() chains handles success and error inline without try/catch blocks. This can be more concise for simple error handling."
      },
      {
        name: "Using a result wrapper type",
        code: `type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function riskyOperation(shouldFail: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("Operation failed"));
      else resolve("Success");
    }, 50);
  });
}

async function trySafe<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const value = await promise;
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function main(): Promise<void> {
  const calls: [boolean, string][] = [[true, "Call 1"], [false, "Call 2"], [true, "Call 3"]];

  for (const [shouldFail, label] of calls) {
    const result = await trySafe(riskyOperation(shouldFail));
    if (result.ok) {
      console.log(\`\${label}: \${result.value}\`);
    } else {
      console.log(\`\${label}: Error - \${result.error}\`);
    }
  }
  console.log("All calls completed");
}

main();
`,
        explanation: "A Result type (inspired by Rust) wraps success/failure into a discriminated union, making error handling explicit without try/catch in business logic."
      }
    ],
    crossLang: {
      python: {
        code: `import asyncio

async def risky_operation(should_fail: bool) -> str:
    await asyncio.sleep(0.05)
    if should_fail:
        raise Exception("Operation failed")
    return "Success"

async def safe_call(should_fail: bool, label: str) -> None:
    try:
        result = await risky_operation(should_fail)
        print(f"{label}: {result}")
    except Exception as error:
        print(f"{label}: Error - {error}")

async def main():
    await safe_call(True, "Call 1")
    await safe_call(False, "Call 2")
    await safe_call(True, "Call 3")
    print("All calls completed")

asyncio.run(main())
`,
        highlights: [
          { lines: [5, 6], explanation: "Python uses raise Exception() instead of reject(new Error()). Exceptions propagate through await." },
          { lines: [13, 14], explanation: "Python's try/except is equivalent to TypeScript's try/catch for async error handling." }
        ]
      },
      java: {
        code: `import java.util.concurrent.*;

public class Main {
    static CompletableFuture<String> riskyOperation(boolean shouldFail) {
        return CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(50); } catch (InterruptedException e) { throw new RuntimeException(e); }
            if (shouldFail) throw new RuntimeException("Operation failed");
            return "Success";
        });
    }

    static void safeCall(boolean shouldFail, String label) {
        try {
            String result = riskyOperation(shouldFail).get();
            System.out.println(label + ": " + result);
        } catch (ExecutionException e) {
            System.out.println(label + ": Error - " + e.getCause().getMessage());
        } catch (InterruptedException e) {
            System.out.println(label + ": Interrupted");
        }
    }

    public static void main(String[] args) {
        safeCall(true, "Call 1");
        safeCall(false, "Call 2");
        safeCall(true, "Call 3");
        System.out.println("All calls completed");
    }
}
`,
        highlights: [
          { lines: [7], explanation: "Java throws RuntimeException instead of rejecting a Promise. CompletableFuture wraps it in ExecutionException." },
          { lines: [16, 17], explanation: "Java's ExecutionException wraps the original exception; use .getCause() to get the actual error." }
        ]
      }
    }
  },

  // ============================================================
  // ARRAYS — Level 4
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Arrays",
    level: 4,
    title: "Sliding Window Maximum",
    task: "Implement a function `slidingWindowMax<T extends number>(arr: T[], windowSize: number): T[]` that returns the maximum value in each sliding window of the given size. For `[1,3,-1,-3,5,3,6,7]` with window size 3, the windows are [1,3,-1],[3,-1,-3],[-1,-3,5],[-3,5,3],[5,3,6],[3,6,7] and the maximums are [3,3,5,5,6,7]. Print the result as a comma-separated string.",
    code: `// Sliding Window Maximum
// Find the maximum in each sliding window of a given size

// YOUR CODE HERE
`,
    solutionCode: `// Sliding Window Maximum
function slidingWindowMax<T extends number>(arr: T[], windowSize: number): T[] {
  const result: T[] = [];
  for (let i = 0; i <= arr.length - windowSize; i++) {
    const window = arr.slice(i, i + windowSize);
    result.push(window.reduce((max, val) => val > max ? val : max));
  }
  return result;
}

const nums1 = [1, 3, -1, -3, 5, 3, 6, 7] as const;
console.log(slidingWindowMax([...nums1], 3).join(", "));

const nums2 = [4, 2, 12, 3, 8, 1] as const;
console.log(slidingWindowMax([...nums2], 2).join(", "));

const nums3 = [10, 5, 2, 7, 8, 7] as const;
console.log(slidingWindowMax([...nums3], 1).join(", "));
`,
    expectedOutput: `3, 3, 5, 5, 6, 7
4, 12, 12, 8, 8
10, 5, 2, 7, 8, 7`,
    hint: "Use a loop from index 0 to arr.length - windowSize. For each position, slice the array to get the window, then use reduce to find the max.",
    testCases: [
      { input: "const arr = [1,3,-1,-3,5,3,6,7]; const windowSize = 3;", output: "3, 3, 5, 5, 6, 7" },
      { input: "const arr = [4,2,12,3,8,1]; const windowSize = 2;", output: "4, 12, 12, 8, 8" },
      { input: "const arr = [10,5,2,7,8,7]; const windowSize = 1;", output: "10, 5, 2, 7, 8, 7" }
    ],
    judgeFeedback: {
      summary: "Ensure the window slides correctly and handles the generic constraint `T extends number`.",
      lines: [
        { line: 2, problem: "Missing generic constraint on T", fix: "Use `T extends number` so the comparison operators work correctly on the type" },
        { line: 5, problem: "Off-by-one error in loop boundary", fix: "Loop should go up to `arr.length - windowSize` (inclusive) to capture all valid windows" }
      ]
    },
    altMethods: [
      {
        name: "Using a deque-based approach",
        code: `function slidingWindowMax<T extends number>(arr: T[], windowSize: number): T[] {
  const result: T[] = [];
  const deque: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    while (deque.length > 0 && deque[0] <= i - windowSize) {
      deque.shift();
    }
    while (deque.length > 0 && arr[deque[deque.length - 1]] <= arr[i]) {
      deque.pop();
    }
    deque.push(i);
    if (i >= windowSize - 1) {
      result.push(arr[deque[0]]);
    }
  }
  return result;
}

const nums1 = [1, 3, -1, -3, 5, 3, 6, 7];
console.log(slidingWindowMax(nums1, 3).join(", "));

const nums2 = [4, 2, 12, 3, 8, 1];
console.log(slidingWindowMax(nums2, 2).join(", "));

const nums3 = [10, 5, 2, 7, 8, 7];
console.log(slidingWindowMax(nums3, 1).join(", "));
`,
        explanation: "A deque (double-ended queue) of indices keeps track of potential maximums in O(n) time. Elements are removed from the front when they leave the window and from the back when a larger element arrives."
      },
      {
        name: "Using Array.from with map",
        code: `function slidingWindowMax<T extends number>(arr: T[], windowSize: number): T[] {
  return Array.from(
    { length: arr.length - windowSize + 1 },
    (_, i) => Math.max(...arr.slice(i, i + windowSize)) as T
  );
}

const nums1 = [1, 3, -1, -3, 5, 3, 6, 7];
console.log(slidingWindowMax(nums1, 3).join(", "));

const nums2 = [4, 2, 12, 3, 8, 1];
console.log(slidingWindowMax(nums2, 2).join(", "));

const nums3 = [10, 5, 2, 7, 8, 7];
console.log(slidingWindowMax(nums3, 1).join(", "));
`,
        explanation: "Array.from creates the result array directly by mapping each index to the max of its window using Math.max with spread."
      }
    ],
    crossLang: {
      python: {
        code: `from typing import TypeVar

T = TypeVar("T", bound=int)

def sliding_window_max(arr: list[int], window_size: int) -> list[int]:
    return [max(arr[i:i + window_size]) for i in range(len(arr) - window_size + 1)]

nums1 = [1, 3, -1, -3, 5, 3, 6, 7]
print(", ".join(str(x) for x in sliding_window_max(nums1, 3)))

nums2 = [4, 2, 12, 3, 8, 1]
print(", ".join(str(x) for x in sliding_window_max(nums2, 2)))

nums3 = [10, 5, 2, 7, 8, 7]
print(", ".join(str(x) for x in sliding_window_max(nums3, 1)))
`,
        highlights: [
          { lines: [5, 6], explanation: "Python's list comprehension with slicing and max() is more concise than TypeScript's loop approach." },
          { lines: [8], explanation: "Python uses str() to convert numbers and ', '.join() instead of .join(', ')." }
        ]
      }
    }
  },

  // ============================================================
  // ARRAYS — Level 5
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Arrays",
    level: 5,
    title: "Lazy Evaluated Pipeline",
    task: "Implement a `Pipeline<T>` class that supports lazy evaluation of chained array operations. It should support:\n- `static from<U>(arr: U[]): Pipeline<U>` — creates a pipeline from an array\n- `map<U>(fn: (item: T) => U): Pipeline<U>` — lazy map\n- `filter(fn: (item: T) => boolean): Pipeline<T>` — lazy filter\n- `take(n: number): Pipeline<T>` — lazy take first n\n- `collect(): T[]` — materializes the pipeline\nTest by creating a pipeline from [1..10], filtering evens, mapping to squares, taking 3, then collecting. Print each step description and the final result.",
    code: `// Lazy Evaluated Pipeline
// Build a lazy pipeline class for chained array operations

// YOUR CODE HERE
`,
    solutionCode: `// Lazy Evaluated Pipeline
class Pipeline<T> {
  private source: () => Generator<T>;

  private constructor(source: () => Generator<T>) {
    this.source = source;
  }

  static from<U>(arr: U[]): Pipeline<U> {
    return new Pipeline(function* () {
      for (const item of arr) yield item;
    });
  }

  map<U>(fn: (item: T) => U): Pipeline<U> {
    const prevSource = this.source;
    return new Pipeline(function* () {
      for (const item of prevSource()) yield fn(item);
    });
  }

  filter(fn: (item: T) => boolean): Pipeline<T> {
    const prevSource = this.source;
    return new Pipeline(function* () {
      for (const item of prevSource()) {
        if (fn(item)) yield item;
      }
    });
  }

  take(n: number): Pipeline<T> {
    const prevSource = this.source;
    return new Pipeline(function* () {
      let count = 0;
      for (const item of prevSource()) {
        if (count >= n) break;
        yield item;
        count++;
      }
    });
  }

  collect(): T[] {
    return [...this.source()];
  }
}

const numbers = Array.from({ length: 10 }, (_, i) => i + 1);
console.log("Source: " + numbers.join(", "));

const result = Pipeline.from(numbers)
  .filter((n) => n % 2 === 0)
  .map((n) => n * n)
  .take(3)
  .collect();

console.log("Evens squared (first 3): " + result.join(", "));

const words = ["hello", "world", "typescript", "is", "great", "for", "building"];
const longUpper = Pipeline.from(words)
  .filter((w) => w.length > 3)
  .map((w) => w.toUpperCase())
  .take(4)
  .collect();

console.log("Long words uppercased: " + longUpper.join(", "));
`,
    expectedOutput: `Source: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
Evens squared (first 3): 4, 16, 36
Long words uppercased: HELLO, WORLD, TYPESCRIPT, GREAT`,
    hint: "Use generators to defer execution. Each pipeline step returns a new Pipeline wrapping a generator that pulls from the previous step. Only `collect()` materializes values.",
    testCases: [
      { input: "const arr = [1,2,3,4,5,6,7,8,9,10];", output: "Evens squared (first 3): 4, 16, 36" },
      { input: "const arr = [\"hello\",\"world\",\"typescript\",\"is\",\"great\",\"for\",\"building\"];", output: "Long words uppercased: HELLO, WORLD, TYPESCRIPT, GREAT" },
      { input: "const arr = [1,2,3,4,5]; // filter odd, map x+10, take 2", output: "11, 13" }
    ],
    judgeFeedback: {
      summary: "Ensure operations are truly lazy — generators should not evaluate until collect() is called.",
      lines: [
        { line: 3, problem: "Storing transformed arrays eagerly instead of using generators", fix: "Use `() => Generator<T>` as the source so nothing runs until iterated" },
        { line: 32, problem: "Take not breaking early from generator", fix: "Use `break` after yielding n items to stop pulling from upstream" }
      ]
    },
    altMethods: [
      {
        name: "Using iterable protocol",
        code: `class Pipeline<T> implements Iterable<T> {
  constructor(private iterable: Iterable<T>) {}

  static from<U>(arr: U[]): Pipeline<U> {
    return new Pipeline(arr);
  }

  map<U>(fn: (item: T) => U): Pipeline<U> {
    const self = this;
    return new Pipeline({
      *[Symbol.iterator]() {
        for (const item of self) yield fn(item);
      }
    });
  }

  filter(fn: (item: T) => boolean): Pipeline<T> {
    const self = this;
    return new Pipeline({
      *[Symbol.iterator]() {
        for (const item of self) if (fn(item)) yield item;
      }
    });
  }

  take(n: number): Pipeline<T> {
    const self = this;
    return new Pipeline({
      *[Symbol.iterator]() {
        let count = 0;
        for (const item of self) {
          if (count >= n) break;
          yield item;
          count++;
        }
      }
    });
  }

  [Symbol.iterator](): Iterator<T> {
    return this.iterable[Symbol.iterator]();
  }

  collect(): T[] {
    return [...this];
  }
}

const numbers = Array.from({ length: 10 }, (_, i) => i + 1);
console.log("Source: " + numbers.join(", "));
const result = Pipeline.from(numbers).filter(n => n % 2 === 0).map(n => n * n).take(3).collect();
console.log("Evens squared (first 3): " + result.join(", "));

const words = ["hello", "world", "typescript", "is", "great", "for", "building"];
const longUpper = Pipeline.from(words).filter(w => w.length > 3).map(w => w.toUpperCase()).take(4).collect();
console.log("Long words uppercased: " + longUpper.join(", "));
`,
        explanation: "Implementing the Iterable protocol via Symbol.iterator makes the pipeline work with for...of loops and spread operator natively."
      },
      {
        name: "Using closures instead of generators",
        code: `type LazySeq<T> = () => { value: T; next: LazySeq<T> } | null;

function fromArray<T>(arr: T[]): LazySeq<T> {
  let i = 0;
  const next: LazySeq<T> = () => i < arr.length ? { value: arr[i++], next } : null;
  return next;
}

function lazyMap<T, U>(seq: LazySeq<T>, fn: (x: T) => U): LazySeq<U> {
  return () => { const r = seq(); return r ? { value: fn(r.value), next: lazyMap(r.next, fn) } : null; };
}

function lazyFilter<T>(seq: LazySeq<T>, fn: (x: T) => boolean): LazySeq<T> {
  return () => { let r = seq(); while (r && !fn(r.value)) r = r.next(); return r ? { value: r.value, next: lazyFilter(r.next, fn) } : null; };
}

function lazyTake<T>(seq: LazySeq<T>, n: number): LazySeq<T> {
  return () => n <= 0 ? null : (() => { const r = seq(); return r ? { value: r.value, next: lazyTake(r.next, n - 1) } : null; })();
}

function collect<T>(seq: LazySeq<T>): T[] {
  const result: T[] = []; let r = seq(); while (r) { result.push(r.value); r = r.next(); } return result;
}

const numbers = Array.from({ length: 10 }, (_, i) => i + 1);
console.log("Source: " + numbers.join(", "));
const result = collect(lazyTake(lazyMap(lazyFilter(fromArray(numbers), n => n % 2 === 0), n => n * n), 3));
console.log("Evens squared (first 3): " + result.join(", "));

const words = ["hello", "world", "typescript", "is", "great", "for", "building"];
const longUpper = collect(lazyTake(lazyMap(lazyFilter(fromArray(words), w => w.length > 3), w => w.toUpperCase()), 4));
console.log("Long words uppercased: " + longUpper.join(", "));
`,
        explanation: "A linked-list style lazy sequence using closures. Each step returns a thunk that computes the next element on demand, achieving laziness without generators."
      }
    ],
    crossLang: {
      python: {
        code: `from typing import TypeVar, Generic, Callable, Iterator
from itertools import islice

T = TypeVar("T")

class Pipeline(Generic[T]):
    def __init__(self, source: Iterator[T]):
        self._source = source

    @classmethod
    def from_list(cls, arr: list) -> "Pipeline":
        return cls(iter(arr))

    def map(self, fn: Callable) -> "Pipeline":
        return Pipeline(fn(x) for x in self._source)

    def filter(self, fn: Callable) -> "Pipeline":
        return Pipeline(x for x in self._source if fn(x))

    def take(self, n: int) -> "Pipeline":
        return Pipeline(islice(self._source, n))

    def collect(self) -> list:
        return list(self._source)

numbers = list(range(1, 11))
print("Source: " + ", ".join(str(x) for x in numbers))
result = Pipeline.from_list(numbers).filter(lambda n: n % 2 == 0).map(lambda n: n * n).take(3).collect()
print("Evens squared (first 3): " + ", ".join(str(x) for x in result))

words = ["hello", "world", "typescript", "is", "great", "for", "building"]
long_upper = Pipeline.from_list(words).filter(lambda w: len(w) > 3).map(lambda w: w.upper()).take(4).collect()
print("Long words uppercased: " + ", ".join(long_upper))
`,
        highlights: [
          { lines: [14, 17], explanation: "Python generators and generator expressions are naturally lazy, making this pattern simpler than TypeScript's explicit Generator type." },
          { lines: [20], explanation: "Python's itertools.islice provides lazy slicing, equivalent to the take() operation." }
        ]
      }
    }
  },

  // ============================================================
  // OBJECTS — Level 4
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Objects",
    level: 4,
    title: "Type-Safe Event Emitter",
    task: "Implement a generic `TypedEmitter<Events>` class where Events is a record mapping event names to their payload types. It should support:\n- `on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void`\n- `emit<K extends keyof Events>(event: K, payload: Events[K]): void`\n- `off<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void`\nDefine events: `{ login: { user: string }, message: { from: string; text: string }, logout: {} }`. Demonstrate by registering handlers, emitting events, removing a handler, and emitting again.",
    code: `// Type-Safe Event Emitter
// Build a generic event emitter with typed events

// YOUR CODE HERE
`,
    solutionCode: `// Type-Safe Event Emitter
class TypedEmitter<Events extends Record<string, unknown>> {
  private handlers: { [K in keyof Events]?: ((payload: Events[K]) => void)[] } = {};

  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event]!.push(handler);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const list = this.handlers[event];
    if (list) {
      list.forEach((handler) => handler(payload));
    }
  }

  off<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
    const list = this.handlers[event];
    if (list) {
      this.handlers[event] = list.filter((h) => h !== handler) as typeof list;
    }
  }
}

interface AppEvents {
  login: { user: string };
  message: { from: string; text: string };
  logout: Record<string, never>;
}

const emitter = new TypedEmitter<AppEvents>();

const loginHandler = (payload: AppEvents["login"]) => {
  console.log(\`Login: \${payload.user}\`);
};

emitter.on("login", loginHandler);
emitter.on("message", (payload) => {
  console.log(\`Message from \${payload.from}: \${payload.text}\`);
});

emitter.emit("login", { user: "Alice" });
emitter.emit("message", { from: "Bob", text: "Hello!" });

emitter.off("login", loginHandler);
console.log("Login handler removed");

emitter.emit("login", { user: "Charlie" });
emitter.emit("message", { from: "Dave", text: "Goodbye!" });
`,
    expectedOutput: `Login: Alice
Message from Bob: Hello!
Login handler removed
Message from Dave: Goodbye!`,
    hint: "Use a mapped type for the handlers storage: `{ [K in keyof Events]?: ((payload: Events[K]) => void)[] }`. The `on` method pushes handlers, `emit` calls all handlers for an event, and `off` filters out the specific handler.",
    testCases: [
      { input: "const emitter = new TypedEmitter<AppEvents>(); const loginHandler = (payload: AppEvents[\"login\"]) => { console.log(`Login: ${payload.user}`); }; emitter.on(\"login\", loginHandler); emitter.emit(\"login\", { user: \"Alice\" });", output: "Login: Alice" },
      { input: "const emitter = new TypedEmitter<AppEvents>(); const loginHandler = (payload: AppEvents[\"login\"]) => { console.log(`Login: ${payload.user}`); }; emitter.on(\"message\", (payload) => { console.log(`Message from ${payload.from}: ${payload.text}`); }); emitter.emit(\"message\", { from: \"Bob\", text: \"Hello!\" });", output: "Message from Bob: Hello!" },
      { input: "const emitter = new TypedEmitter<AppEvents>(); const loginHandler = (payload: AppEvents[\"login\"]) => { console.log(`Login: ${payload.user}`); }; emitter.on(\"login\", loginHandler); emitter.off(\"login\", loginHandler); emitter.emit(\"login\", { user: \"Charlie\" });", output: "" }
    ],
    judgeFeedback: {
      summary: "Ensure the event map is properly typed so that payloads are checked at compile time for each event name.",
      lines: [
        { line: 3, problem: "Using a plain object or Map without mapped types", fix: "Use `{ [K in keyof Events]?: ((payload: Events[K]) => void)[] }` for type-safe handler storage" },
        { line: 22, problem: "Using indexOf + splice instead of filter for off()", fix: "Use `filter(h => h !== handler)` for immutable removal to avoid issues during iteration" }
      ]
    },
    altMethods: [
      {
        name: "Using Map with Set for handlers",
        code: `class TypedEmitter<Events extends Record<string, unknown>> {
  private handlers = new Map<keyof Events, Set<(payload: any) => void>>();

  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.handlers.get(event)?.forEach((handler) => handler(payload));
  }

  off<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
    this.handlers.get(event)?.delete(handler);
  }
}

interface AppEvents {
  login: { user: string };
  message: { from: string; text: string };
  logout: Record<string, never>;
}

const emitter = new TypedEmitter<AppEvents>();
const loginHandler = (payload: AppEvents["login"]) => console.log(\`Login: \${payload.user}\`);
emitter.on("login", loginHandler);
emitter.on("message", (p) => console.log(\`Message from \${p.from}: \${p.text}\`));
emitter.emit("login", { user: "Alice" });
emitter.emit("message", { from: "Bob", text: "Hello!" });
emitter.off("login", loginHandler);
console.log("Login handler removed");
emitter.emit("login", { user: "Charlie" });
emitter.emit("message", { from: "Dave", text: "Goodbye!" });
`,
        explanation: "Using Map<K, Set<Handler>> instead of a plain object. Set provides O(1) deletion and prevents duplicate handlers."
      },
      {
        name: "Using a fluent API with method chaining",
        code: `class TypedEmitter<Events extends Record<string, unknown>> {
  private handlers: { [K in keyof Events]?: ((payload: Events[K]) => void)[] } = {};

  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): this {
    (this.handlers[event] ??= [] as any).push(handler);
    return this;
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): this {
    this.handlers[event]?.forEach((h) => h(payload));
    return this;
  }

  off<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): this {
    const list = this.handlers[event];
    if (list) this.handlers[event] = list.filter((h) => h !== handler) as typeof list;
    return this;
  }
}

interface AppEvents {
  login: { user: string };
  message: { from: string; text: string };
  logout: Record<string, never>;
}

const emitter = new TypedEmitter<AppEvents>();
const loginHandler = (p: AppEvents["login"]) => console.log(\`Login: \${p.user}\`);

emitter
  .on("login", loginHandler)
  .on("message", (p) => console.log(\`Message from \${p.from}: \${p.text}\`))
  .emit("login", { user: "Alice" })
  .emit("message", { from: "Bob", text: "Hello!" })
  .off("login", loginHandler);
console.log("Login handler removed");
emitter.emit("login", { user: "Charlie" });
emitter.emit("message", { from: "Dave", text: "Goodbye!" });
`,
        explanation: "Returning `this` from each method enables fluent chaining, making the API more expressive and concise."
      }
    ],
    crossLang: {
      python: {
        code: `from typing import TypedDict, Callable, Any
from collections import defaultdict

class LoginPayload(TypedDict):
    user: str

class MessagePayload(TypedDict):
    from_: str
    text: str

class TypedEmitter:
    def __init__(self) -> None:
        self._handlers: dict[str, list[Callable]] = defaultdict(list)

    def on(self, event: str, handler: Callable) -> None:
        self._handlers[event].append(handler)

    def emit(self, event: str, payload: Any) -> None:
        for handler in self._handlers.get(event, []):
            handler(payload)

    def off(self, event: str, handler: Callable) -> None:
        self._handlers[event] = [h for h in self._handlers[event] if h is not handler]

emitter = TypedEmitter()
login_handler = lambda p: print(f"Login: {p['user']}")
emitter.on("login", login_handler)
emitter.on("message", lambda p: print(f"Message from {p['from_']}: {p['text']}"))
emitter.emit("login", {"user": "Alice"})
emitter.emit("message", {"from_": "Bob", "text": "Hello!"})
emitter.off("login", login_handler)
print("Login handler removed")
emitter.emit("login", {"user": "Charlie"})
emitter.emit("message", {"from_": "Dave", "text": "Goodbye!"})
`,
        highlights: [
          { lines: [12, 13], explanation: "Python lacks TypeScript's mapped types, so the handlers dict uses plain string keys without compile-time event name checking." },
          { lines: [23], explanation: "Python uses `is not` for identity comparison instead of !==, which is important when comparing function references." }
        ]
      }
    }
  },

  // ============================================================
  // OBJECTS — Level 5
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Objects",
    level: 5,
    title: "Immutable State Manager with History",
    task: "Implement a generic `StateManager<T extends Record<string, unknown>>` class that manages immutable state with undo/redo support. It should support:\n- `constructor(initial: T)` — sets the initial state\n- `get state(): Readonly<T>` — returns current state (read-only)\n- `update(partial: Partial<T>): void` — merges partial update into state, pushes old state to undo stack\n- `undo(): boolean` — reverts to previous state, returns true if successful\n- `redo(): boolean` — re-applies undone state, returns true if successful\n- `subscribe(listener: (state: Readonly<T>) => void): () => void` — notifies on changes, returns unsubscribe function\nDemonstrate with a counter/settings state object.",
    code: `// Immutable State Manager with History
// Build a state manager with undo/redo and subscriptions

// YOUR CODE HERE
`,
    solutionCode: `// Immutable State Manager with History
class StateManager<T extends Record<string, unknown>> {
  private current: T;
  private undoStack: T[] = [];
  private redoStack: T[] = [];
  private listeners: Set<(state: Readonly<T>) => void> = new Set();

  constructor(initial: T) {
    this.current = { ...initial };
  }

  get state(): Readonly<T> {
    return this.current;
  }

  update(partial: Partial<T>): void {
    this.undoStack.push({ ...this.current });
    this.current = { ...this.current, ...partial };
    this.redoStack = [];
    this.notify();
  }

  undo(): boolean {
    const prev = this.undoStack.pop();
    if (!prev) return false;
    this.redoStack.push({ ...this.current });
    this.current = prev;
    this.notify();
    return true;
  }

  redo(): boolean {
    const next = this.redoStack.pop();
    if (!next) return false;
    this.undoStack.push({ ...this.current });
    this.current = next;
    this.notify();
    return true;
  }

  subscribe(listener: (state: Readonly<T>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

interface AppState {
  count: number;
  theme: string;
  lang: string;
}

const mgr = new StateManager<AppState>({ count: 0, theme: "dark", lang: "en" });

const unsub = mgr.subscribe((s) => {
  console.log(\`[sub] count=\${s.count}, theme=\${s.theme}, lang=\${s.lang}\`);
});

mgr.update({ count: 1 });
mgr.update({ theme: "light" });
mgr.update({ count: 2, lang: "ja" });

console.log(\`Undo: \${mgr.undo()}\`);
console.log(\`State: count=\${mgr.state.count}, lang=\${mgr.state.lang}\`);

console.log(\`Redo: \${mgr.redo()}\`);
console.log(\`State: count=\${mgr.state.count}, lang=\${mgr.state.lang}\`);

unsub();
mgr.update({ count: 99 });
console.log(\`Final: count=\${mgr.state.count}\`);
`,
    expectedOutput: `[sub] count=1, theme=dark, lang=en
[sub] count=1, theme=light, lang=en
[sub] count=2, theme=light, lang=ja
[sub] count=1, theme=light, lang=en
Undo: true
State: count=1, lang=en
[sub] count=2, theme=light, lang=ja
Redo: true
State: count=2, lang=ja
Final: count=99`,
    hint: "Use two stacks (arrays) for undo and redo history. On update, push current state to undo stack and clear redo stack. Use the spread operator for shallow immutable copies.",
    testCases: [
      { input: "const mgr = new StateManager<AppState>({ count: 0, theme: \"dark\", lang: \"en\" }); mgr.update({ count: 1 }); mgr.update({ count: 2 });", output: "[sub] count=1\n[sub] count=2" },
      { input: "const mgr = new StateManager<AppState>({ count: 0, theme: \"dark\", lang: \"en\" }); mgr.undo(); console.log(mgr.state.count);", output: "1" },
      { input: "const mgr = new StateManager<AppState>({ count: 0, theme: \"dark\", lang: \"en\" }); mgr.redo(); console.log(mgr.state.count);", output: "2" }
    ],
    judgeFeedback: {
      summary: "Ensure state is never mutated directly — always create copies. Undo/redo stacks must be managed symmetrically.",
      lines: [
        { line: 17, problem: "Mutating current state directly instead of creating a new copy", fix: "Always spread into a new object: `this.current = { ...this.current, ...partial }`" },
        { line: 18, problem: "Not clearing the redo stack on new updates", fix: "Set `this.redoStack = []` after each update to prevent inconsistent history" }
      ]
    },
    altMethods: [
      {
        name: "Using Proxy for change detection",
        code: `class StateManager<T extends Record<string, unknown>> {
  private snapshots: T[] = [];
  private cursor = 0;
  private listeners = new Set<(state: Readonly<T>) => void>();

  constructor(initial: T) {
    this.snapshots.push({ ...initial });
  }

  get state(): Readonly<T> {
    return this.snapshots[this.cursor];
  }

  update(partial: Partial<T>): void {
    this.snapshots.splice(this.cursor + 1);
    this.snapshots.push({ ...this.state, ...partial });
    this.cursor++;
    this.notify();
  }

  undo(): boolean {
    if (this.cursor <= 0) return false;
    this.cursor--;
    this.notify();
    return true;
  }

  redo(): boolean {
    if (this.cursor >= this.snapshots.length - 1) return false;
    this.cursor++;
    this.notify();
    return true;
  }

  subscribe(listener: (state: Readonly<T>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const l of this.listeners) l(this.state);
  }
}

interface AppState { count: number; theme: string; lang: string; }
const mgr = new StateManager<AppState>({ count: 0, theme: "dark", lang: "en" });
const unsub = mgr.subscribe(s => console.log(\`[sub] count=\${s.count}, theme=\${s.theme}, lang=\${s.lang}\`));
mgr.update({ count: 1 });
mgr.update({ theme: "light" });
mgr.update({ count: 2, lang: "ja" });
console.log(\`Undo: \${mgr.undo()}\`);
console.log(\`State: count=\${mgr.state.count}, lang=\${mgr.state.lang}\`);
console.log(\`Redo: \${mgr.redo()}\`);
console.log(\`State: count=\${mgr.state.count}, lang=\${mgr.state.lang}\`);
unsub();
mgr.update({ count: 99 });
console.log(\`Final: count=\${mgr.state.count}\`);
`,
        explanation: "Instead of two stacks, a single snapshots array with a cursor provides undo/redo. splice() removes any redo history when a new update occurs."
      },
      {
        name: "Using a command pattern",
        code: `type Command<T> = { apply: (state: T) => T; undo: (state: T) => T };

class StateManager<T extends Record<string, unknown>> {
  private current: T;
  private history: Command<T>[] = [];
  private future: Command<T>[] = [];
  private listeners = new Set<(state: Readonly<T>) => void>();

  constructor(initial: T) { this.current = { ...initial }; }
  get state(): Readonly<T> { return this.current; }

  update(partial: Partial<T>): void {
    const prev = { ...this.current };
    const cmd: Command<T> = {
      apply: (s) => ({ ...s, ...partial }),
      undo: () => ({ ...prev })
    };
    this.current = cmd.apply(this.current);
    this.history.push(cmd);
    this.future = [];
    this.notify();
  }

  undo(): boolean {
    const cmd = this.history.pop();
    if (!cmd) return false;
    this.current = cmd.undo(this.current);
    this.future.push(cmd);
    this.notify();
    return true;
  }

  redo(): boolean {
    const cmd = this.future.pop();
    if (!cmd) return false;
    this.current = cmd.apply(this.current);
    this.history.push(cmd);
    this.notify();
    return true;
  }

  subscribe(listener: (state: Readonly<T>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void { for (const l of this.listeners) l(this.state); }
}

interface AppState { count: number; theme: string; lang: string; }
const mgr = new StateManager<AppState>({ count: 0, theme: "dark", lang: "en" });
const unsub = mgr.subscribe(s => console.log(\`[sub] count=\${s.count}, theme=\${s.theme}, lang=\${s.lang}\`));
mgr.update({ count: 1 });
mgr.update({ theme: "light" });
mgr.update({ count: 2, lang: "ja" });
console.log(\`Undo: \${mgr.undo()}\`);
console.log(\`State: count=\${mgr.state.count}, lang=\${mgr.state.lang}\`);
console.log(\`Redo: \${mgr.redo()}\`);
console.log(\`State: count=\${mgr.state.count}, lang=\${mgr.state.lang}\`);
unsub();
mgr.update({ count: 99 });
console.log(\`Final: count=\${mgr.state.count}\`);
`,
        explanation: "The command pattern stores apply/undo functions for each state change, allowing more complex transformations while preserving undo/redo capability."
      }
    ],
    crossLang: {
      python: {
        code: `from typing import TypedDict, Callable
from copy import copy

class AppState(TypedDict):
    count: int
    theme: str
    lang: str

class StateManager:
    def __init__(self, initial: dict) -> None:
        self._current = dict(initial)
        self._undo_stack: list[dict] = []
        self._redo_stack: list[dict] = []
        self._listeners: list[Callable] = []

    @property
    def state(self) -> dict:
        return self._current

    def update(self, **partial: object) -> None:
        self._undo_stack.append(dict(self._current))
        self._current = {**self._current, **partial}
        self._redo_stack.clear()
        self._notify()

    def undo(self) -> bool:
        if not self._undo_stack:
            return False
        self._redo_stack.append(dict(self._current))
        self._current = self._undo_stack.pop()
        self._notify()
        return True

    def redo(self) -> bool:
        if not self._redo_stack:
            return False
        self._undo_stack.append(dict(self._current))
        self._current = self._redo_stack.pop()
        self._notify()
        return True

    def subscribe(self, listener: Callable) -> Callable:
        self._listeners.append(listener)
        return lambda: self._listeners.remove(listener)

    def _notify(self) -> None:
        for listener in self._listeners:
            listener(self.state)

mgr = StateManager({"count": 0, "theme": "dark", "lang": "en"})
unsub = mgr.subscribe(lambda s: print(f"[sub] count={s['count']}, theme={s['theme']}, lang={s['lang']}"))
mgr.update(count=1)
mgr.update(theme="light")
mgr.update(count=2, lang="ja")
print(f"Undo: {mgr.undo()}")
print(f"State: count={mgr.state['count']}, lang={mgr.state['lang']}")
print(f"Redo: {mgr.redo()}")
print(f"State: count={mgr.state['count']}, lang={mgr.state['lang']}")
unsub()
mgr.update(count=99)
print(f"Final: count={mgr.state['count']}")
`,
        highlights: [
          { lines: [20, 21], explanation: "Python uses **kwargs for partial updates, providing a clean syntax: `mgr.update(count=1)` vs TypeScript's `mgr.update({ count: 1 })`." },
          { lines: [16, 17], explanation: "Python's @property decorator provides getter-only access similar to TypeScript's `get state()`, but without Readonly<T> compile-time enforcement." }
        ]
      }
    }
  },

  // ============================================================
  // FUNCTIONS — Level 4
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Functions",
    level: 4,
    title: "Function Composition with Type Safety",
    task: "Implement a `pipe` function that composes functions left to right with full type safety. Create:\n- `pipe(fn1)` — returns a function that applies fn1\n- `pipe(fn1, fn2)` — returns a function that applies fn1 then fn2\n- `pipe(fn1, fn2, fn3)` — returns a function applying fn1, fn2, fn3 in order\nUse overloads for type safety. Test by composing: parseFloat -> double -> toFixed(1) -> addPrefix.",
    code: `// Function Composition with Type Safety
// Implement a type-safe pipe function using overloads

// YOUR CODE HERE
`,
    solutionCode: `// Function Composition with Type Safety
function pipe<A, B>(fn1: (a: A) => B): (a: A) => B;
function pipe<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C;
function pipe<A, B, C, D>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): (a: A) => D;
function pipe<A, B, C, D, E>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E): (a: A) => E;
function pipe(...fns: ((arg: any) => any)[]): (arg: any) => any {
  return (arg) => fns.reduce((acc, fn) => fn(acc), arg);
}

const double = (n: number): number => n * 2;
const toFixed1 = (n: number): string => n.toFixed(1);
const addPrefix = (s: string): string => \`Result: \${s}\`;

const transform = pipe(parseFloat, double, toFixed1, addPrefix);

console.log(transform("3.14"));
console.log(transform("10.5"));
console.log(transform("0.75"));

const shout = pipe(
  (s: string) => s.trim(),
  (s: string) => s.toUpperCase(),
  (s: string) => s + "!!!"
);

console.log(shout("  hello world  "));
console.log(shout("  typescript  "));
`,
    expectedOutput: `Result: 6.3
Result: 21.0
Result: 1.5
HELLO WORLD!!!
TYPESCRIPT!!!`,
    hint: "Use function overloads for 1, 2, 3, and 4 argument versions to preserve type flow. The implementation uses `reduce` to chain functions.",
    testCases: [
      { input: "const double = (n: number): number => n * 2; const toFixed1 = (n: number): string => n.toFixed(1); const addPrefix = (s: string): string => `Result: ${s}`; const transform = pipe(parseFloat, double, toFixed1, addPrefix);", output: "Result: 6.3" },
      { input: "const double = (n: number): number => n * 2; const toFixed1 = (n: number): string => n.toFixed(1); const addPrefix = (s: string): string => `Result: ${s}`; const transform = pipe(parseFloat, double, toFixed1, addPrefix);", output: "Result: 21.0" },
      { input: "const double = (n: number): number => n * 2; const toFixed1 = (n: number): string => n.toFixed(1); const addPrefix = (s: string): string => `Result: ${s}`; const transform = pipe(parseFloat, double, toFixed1, addPrefix);", output: "HELLO WORLD!!!" }
    ],
    judgeFeedback: {
      summary: "Ensure each overload correctly threads the return type of one function as the parameter type of the next.",
      lines: [
        { line: 2, problem: "Missing overload signatures — only the implementation exists", fix: "Add separate overload signatures for each arity: `function pipe<A,B>(fn1: (a:A)=>B): (a:A)=>B;`" },
        { line: 6, problem: "Using a loop instead of reduce for composition", fix: "Use `fns.reduce((acc, fn) => fn(acc), arg)` for cleaner function composition" }
      ]
    },
    altMethods: [
      {
        name: "Using a recursive type for unlimited pipe",
        code: `type PipeFn<T extends ((...args: any) => any)[]> =
  T extends [infer F extends (...args: any) => any]
    ? F
    : T extends [infer F extends (...args: any) => any, ...infer Rest extends ((...args: any) => any)[]]
      ? (arg: Parameters<F>[0]) => ReturnType<PipeFn<Rest>> extends never ? ReturnType<F> : ReturnType<PipeFn<Rest>>
      : never;

function pipe<A, B>(fn1: (a: A) => B): (a: A) => B;
function pipe<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C;
function pipe<A, B, C, D>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): (a: A) => D;
function pipe<A, B, C, D, E>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E): (a: A) => E;
function pipe(...fns: ((arg: any) => any)[]): (arg: any) => any {
  return (arg) => fns.reduce((acc, fn) => fn(acc), arg);
}

const double = (n: number): number => n * 2;
const toFixed1 = (n: number): string => n.toFixed(1);
const addPrefix = (s: string): string => \`Result: \${s}\`;

const transform = pipe(parseFloat, double, toFixed1, addPrefix);
console.log(transform("3.14"));
console.log(transform("10.5"));
console.log(transform("0.75"));

const shout = pipe(
  (s: string) => s.trim(),
  (s: string) => s.toUpperCase(),
  (s: string) => s + "!!!"
);
console.log(shout("  hello world  "));
console.log(shout("  typescript  "));
`,
        explanation: "A recursive conditional type can infer the chain for any number of functions, though overloads are simpler for limited arities."
      },
      {
        name: "Using a class-based builder pattern",
        code: `class Pipe<Input, Output> {
  constructor(private fn: (input: Input) => Output) {}

  then<Next>(next: (output: Output) => Next): Pipe<Input, Next> {
    const prev = this.fn;
    return new Pipe((input: Input) => next(prev(input)));
  }

  run(input: Input): Output {
    return this.fn(input);
  }
}

function pipe<A, B>(fn: (a: A) => B): Pipe<A, B> {
  return new Pipe(fn);
}

const double = (n: number): number => n * 2;
const toFixed1 = (n: number): string => n.toFixed(1);
const addPrefix = (s: string): string => \`Result: \${s}\`;

const transform = pipe(parseFloat).then(double).then(toFixed1).then(addPrefix);
console.log(transform.run("3.14"));
console.log(transform.run("10.5"));
console.log(transform.run("0.75"));

const shout = pipe((s: string) => s.trim()).then(s => s.toUpperCase()).then(s => s + "!!!");
console.log(shout.run("  hello world  "));
console.log(shout.run("  typescript  "));
`,
        explanation: "A builder-pattern Pipe class with .then() method provides unlimited chaining with full type inference at each step."
      }
    ],
    crossLang: {
      python: {
        code: `from typing import Callable, TypeVar
from functools import reduce

A = TypeVar("A")
B = TypeVar("B")

def pipe(*fns: Callable) -> Callable:
    return lambda arg: reduce(lambda acc, fn: fn(acc), fns, arg)

double = lambda n: n * 2
to_fixed1 = lambda n: f"{n:.1f}"
add_prefix = lambda s: f"Result: {s}"

transform = pipe(float, double, to_fixed1, add_prefix)

print(transform("3.14"))
print(transform("10.5"))
print(transform("0.75"))

shout = pipe(str.strip, str.upper, lambda s: s + "!!!")
print(shout("  hello world  "))
print(shout("  typescript  "))
`,
        highlights: [
          { lines: [7, 8], explanation: "Python's pipe is simpler but lacks type safety — there's no way to enforce that each function's output matches the next function's input at the type level." },
          { lines: [20], explanation: "Python can use unbound methods like str.strip and str.upper directly as function references, unlike TypeScript." }
        ]
      }
    }
  },

  // ============================================================
  // FUNCTIONS — Level 5
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Functions",
    level: 5,
    title: "Memoize with TTL and Type-Safe Cache",
    task: "Implement a `memoize` function that:\n- Accepts any function and returns a memoized version\n- Preserves the original function's type signature\n- Supports a TTL (time-to-live) in milliseconds — cached results expire\n- Has a `.cache` property to inspect cached entries\n- Has a `.clear()` method to manually clear the cache\nTest with a simulated expensive `fibonacci(n)` function. Show cache hits, expiration behavior, and manual clearing.",
    code: `// Memoize with TTL and Type-Safe Cache
// Build a memoize utility with expiring cache

// YOUR CODE HERE
`,
    solutionCode: `// Memoize with TTL and Type-Safe Cache
interface CacheEntry<T> {
  value: T;
  expiry: number;
}

interface MemoizedFn<F extends (...args: any[]) => any> {
  (...args: Parameters<F>): ReturnType<F>;
  cache: Map<string, CacheEntry<ReturnType<F>>>;
  clear: () => void;
}

function memoize<F extends (...args: any[]) => any>(fn: F, ttl: number = Infinity): MemoizedFn<F> {
  const cache = new Map<string, CacheEntry<ReturnType<F>>>();

  const memoized = ((...args: Parameters<F>): ReturnType<F> => {
    const key = JSON.stringify(args);
    const now = Date.now();

    const cached = cache.get(key);
    if (cached && now < cached.expiry) {
      console.log(\`  [cache hit] key=\${key}\`);
      return cached.value;
    }

    console.log(\`  [computing] key=\${key}\`);
    const result = fn(...args);
    cache.set(key, { value: result, expiry: now + ttl });
    return result;
  }) as MemoizedFn<F>;

  memoized.cache = cache;
  memoized.clear = () => cache.clear();

  return memoized;
}

function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoFib = memoize(fibonacci, 5000);

console.log("First calls:");
console.log(\`fib(10) = \${memoFib(10)}\`);
console.log(\`fib(10) = \${memoFib(10)}\`);
console.log(\`fib(5) = \${memoFib(5)}\`);

console.log(\`Cache size: \${memoFib.cache.size}\`);

memoFib.clear();
console.log("Cache cleared");
console.log(\`Cache size: \${memoFib.cache.size}\`);

console.log("After clear:");
console.log(\`fib(10) = \${memoFib(10)}\`);
`,
    expectedOutput: `First calls:
  [computing] key=[10]
fib(10) = 55
  [cache hit] key=[10]
fib(10) = 55
  [computing] key=[5]
fib(5) = 5
Cache size: 2
Cache cleared
Cache size: 0
After clear:
  [computing] key=[10]
fib(10) = 55`,
    hint: "Use `JSON.stringify(args)` as the cache key. Store entries as `{ value, expiry: Date.now() + ttl }`. Check if cached entry exists AND hasn't expired before returning it.",
    testCases: [
      { input: "const memoFib = memoize(fibonacci, 5000); memoFib(10);", output: "  [computing] key=[10]\nfib(10) = 55" },
      { input: "const memoFib = memoize(fibonacci, 5000); memoFib(10);", output: "  [cache hit] key=[10]\nfib(10) = 55" },
      { input: "const memoFib = memoize(fibonacci, 5000); memoFib.clear(); memoFib(10);", output: "  [computing] key=[10]\nfib(10) = 55" }
    ],
    judgeFeedback: {
      summary: "Ensure the memoized function preserves the original type signature using Parameters<F> and ReturnType<F>.",
      lines: [
        { line: 13, problem: "Not using Parameters<F> and ReturnType<F> utility types", fix: "Type the wrapper as `(...args: Parameters<F>): ReturnType<F>` to preserve the original signature" },
        { line: 21, problem: "Not checking TTL expiry on cache hits", fix: "Compare `Date.now()` against `cached.expiry` before returning cached value" }
      ]
    },
    altMethods: [
      {
        name: "Using WeakRef for memory-efficient caching",
        code: `interface MemoizedFn<F extends (...args: any[]) => any> {
  (...args: Parameters<F>): ReturnType<F>;
  cache: Map<string, { ref: WeakRef<{ value: ReturnType<F> }>; expiry: number }>;
  clear: () => void;
}

function memoize<F extends (...args: any[]) => any>(fn: F, ttl: number = Infinity): MemoizedFn<F> {
  const cache = new Map<string, { ref: WeakRef<{ value: ReturnType<F> }>; expiry: number }>();

  const memoized = ((...args: Parameters<F>): ReturnType<F> => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && now < cached.expiry) {
      const obj = cached.ref.deref();
      if (obj) {
        console.log(\`  [cache hit] key=\${key}\`);
        return obj.value;
      }
    }
    console.log(\`  [computing] key=\${key}\`);
    const result = fn(...args);
    cache.set(key, { ref: new WeakRef({ value: result }), expiry: now + ttl });
    return result;
  }) as MemoizedFn<F>;

  memoized.cache = cache as any;
  memoized.clear = () => cache.clear();
  return memoized;
}

function fibonacci(n: number): number { return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2); }
const memoFib = memoize(fibonacci, 5000);
console.log("First calls:");
console.log(\`fib(10) = \${memoFib(10)}\`);
console.log(\`fib(10) = \${memoFib(10)}\`);
console.log(\`fib(5) = \${memoFib(5)}\`);
console.log(\`Cache size: \${memoFib.cache.size}\`);
memoFib.clear();
console.log("Cache cleared");
console.log(\`Cache size: \${memoFib.cache.size}\`);
console.log("After clear:");
console.log(\`fib(10) = \${memoFib(10)}\`);
`,
        explanation: "WeakRef allows the garbage collector to reclaim cached values when memory is tight, adding another layer of cache eviction beyond TTL."
      },
      {
        name: "Using a decorator-style approach",
        code: `function memoize<F extends (...args: any[]) => any>(fn: F, ttl = Infinity) {
  const cache = new Map<string, { value: ReturnType<F>; expiry: number }>();

  function memoized(this: unknown, ...args: Parameters<F>): ReturnType<F> {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && now < cached.expiry) {
      console.log(\`  [cache hit] key=\${key}\`);
      return cached.value;
    }
    console.log(\`  [computing] key=\${key}\`);
    const result = fn.apply(this, args);
    cache.set(key, { value: result, expiry: now + ttl });
    return result;
  }

  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  return memoized as F & { cache: typeof cache; clear: () => void };
}

function fibonacci(n: number): number { return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2); }
const memoFib = memoize(fibonacci, 5000);
console.log("First calls:");
console.log(\`fib(10) = \${memoFib(10)}\`);
console.log(\`fib(10) = \${memoFib(10)}\`);
console.log(\`fib(5) = \${memoFib(5)}\`);
console.log(\`Cache size: \${memoFib.cache.size}\`);
memoFib.clear();
console.log("Cache cleared");
console.log(\`Cache size: \${memoFib.cache.size}\`);
console.log("After clear:");
console.log(\`fib(10) = \${memoFib(10)}\`);
`,
        explanation: "Using fn.apply(this, args) preserves the `this` context, making the memoized function work correctly as a method. The return type uses intersection to add cache and clear."
      }
    ],
    crossLang: {
      python: {
        code: `from functools import wraps
from time import time
import json

def memoize(ttl: float = float("inf")):
    def decorator(fn):
        cache: dict[str, tuple[object, float]] = {}

        @wraps(fn)
        def wrapper(*args):
            key = json.dumps(args)
            now = time()
            if key in cache:
                value, expiry = cache[key]
                if now < expiry:
                    print(f"  [cache hit] key={key}")
                    return value
            print(f"  [computing] key={key}")
            result = fn(*args)
            cache[key] = (result, now + ttl)
            return result

        wrapper.cache = cache
        wrapper.clear = lambda: cache.clear()
        return wrapper
    return decorator

def fibonacci(n: int) -> int:
    return n if n <= 1 else fibonacci(n - 1) + fibonacci(n - 2)

memo_fib = memoize(ttl=5.0)(fibonacci)
print("First calls:")
print(f"fib(10) = {memo_fib(10)}")
print(f"fib(10) = {memo_fib(10)}")
print(f"fib(5) = {memo_fib(5)}")
print(f"Cache size: {len(memo_fib.cache)}")
memo_fib.clear()
print("Cache cleared")
print(f"Cache size: {len(memo_fib.cache)}")
print("After clear:")
print(f"fib(10) = {memo_fib(10)}")
`,
        highlights: [
          { lines: [5, 6], explanation: "Python uses a decorator factory pattern — memoize(ttl=5.0) returns the actual decorator, which is idiomatic Python." },
          { lines: [9], explanation: "Python's @wraps preserves the original function's name and docstring, similar to preserving the type signature in TypeScript." }
        ]
      }
    }
  },

  // ============================================================
  // TYPE BASICS — Level 3
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Type Basics",
    level: 3,
    title: "Generic Constraints with keyof",
    task: "Write a generic function `getProperty<T, K extends keyof T>(obj: T, key: K): T[K]` that safely retrieves a property from an object. Test it with a `Person` interface having `name: string` and `age: number`.",
    code: `// Generic Constraints with keyof
// Write a type-safe property getter

interface Person {
  name: string;
  age: number;
}

// YOUR CODE HERE

const person: Person = { name: "Alice", age: 30 };
console.log(getProperty(person, "name"));
console.log(getProperty(person, "age"));`,
    solutionCode: `interface Person {
  name: string;
  age: number;
}

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person: Person = { name: "Alice", age: 30 };
console.log(getProperty(person, "name"));
console.log(getProperty(person, "age"));`,
    expectedOutput: "Alice\n30",
    testCases: [
      { input: "getProperty({name:'Alice',age:30},'name')", output: "Alice" },
      { input: "getProperty({name:'Bob',age:25},'age')", output: "25" },
    ],
    hint: "Use `K extends keyof T` to constrain the key parameter to valid keys of T.",
    judgeFeedback: {
      summary: "Use generic constraints with keyof to ensure type-safe property access.",
      lines: [
        { line: 6, problem: "Missing generic constraint", fix: "Add `K extends keyof T` to ensure only valid keys are accepted." },
      ],
    },
  },

  // ============================================================
  // TYPE BASICS — Level 4
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Type Basics",
    level: 4,
    title: "Utility Types: DeepReadonly and DeepPartial",
    task: "Implement two recursive utility types:\n1. `DeepReadonly<T>` — makes all properties and nested properties readonly\n2. `DeepPartial<T>` — makes all properties and nested properties optional\nCreate a nested `Config` interface, demonstrate that DeepReadonly prevents assignment, and that DeepPartial allows sparse objects. Print verification messages for each test.",
    code: `// Utility Types: DeepReadonly and DeepPartial
// Implement recursive utility types

// YOUR CODE HERE
`,
    solutionCode: `// Utility Types: DeepReadonly and DeepPartial
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends (...args: any[]) => any
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K];
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends (...args: any[]) => any
      ? T[K]
      : DeepPartial<T[K]>
    : T[K];
};

interface Config {
  app: {
    name: string;
    version: number;
    features: {
      darkMode: boolean;
      notifications: boolean;
    };
  };
  database: {
    host: string;
    port: number;
  };
}

const fullConfig: DeepReadonly<Config> = {
  app: {
    name: "MyApp",
    version: 1,
    features: { darkMode: true, notifications: false }
  },
  database: { host: "localhost", port: 5432 }
};

console.log(\`App: \${fullConfig.app.name} v\${fullConfig.app.version}\`);
console.log(\`Dark mode: \${fullConfig.app.features.darkMode}\`);
console.log(\`DB: \${fullConfig.database.host}:\${fullConfig.database.port}\`);

const partial: DeepPartial<Config> = {
  app: {
    features: { darkMode: false }
  }
};

console.log(\`Partial dark mode: \${partial.app?.features?.darkMode}\`);
console.log(\`Partial name: \${partial.app?.name ?? "not set"}\`);
console.log(\`Partial db: \${partial.database?.host ?? "not set"}\`);
`,
    expectedOutput: `App: MyApp v1
Dark mode: true
DB: localhost:5432
Partial dark mode: false
Partial name: not set
Partial db: not set`,
    hint: "Use mapped types with conditional checks: `T[K] extends object ? DeepX<T[K]> : T[K]`. Exclude functions from recursion with `T[K] extends (...args: any[]) => any`.",
    testCases: [
      { input: "const fullConfig: DeepReadonly<Config> = { app: { name: \"MyApp\", version: 1, features: { darkMode: true, notifications: false } }, database: { host: \"localhost\", port: 5432 } }; const partial: DeepPartial<Config> = { app: { features: { darkMode: false } } };", output: "App: MyApp v1" },
      { input: "const fullConfig: DeepReadonly<Config> = { app: { name: \"MyApp\", version: 1, features: { darkMode: true, notifications: false } }, database: { host: \"localhost\", port: 5432 } }; const partial: DeepPartial<Config> = { app: { features: { darkMode: false } } };", output: "Partial dark mode: false" },
      { input: "const fullConfig: DeepReadonly<Config> = { app: { name: \"MyApp\", version: 1, features: { darkMode: true, notifications: false } }, database: { host: \"localhost\", port: 5432 } }; const partial: DeepPartial<Config> = {};", output: "not set" }
    ],
    judgeFeedback: {
      summary: "Ensure the utility types recurse into nested objects but skip function types to avoid breaking callable properties.",
      lines: [
        { line: 3, problem: "Not excluding function types from recursion", fix: "Add `T[K] extends (...args: any[]) => any ? T[K] :` before recursing to avoid making function signatures readonly/partial" },
        { line: 10, problem: "Using Partial<T> instead of recursive DeepPartial", fix: "Built-in Partial only makes top-level properties optional; recurse into nested objects" }
      ]
    },
    altMethods: [
      {
        name: "Using infer with conditional types",
        code: `type DeepReadonly<T> = T extends readonly (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends (...args: any[]) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

type DeepPartial<T> = T extends readonly (infer U)[]
  ? DeepPartial<U>[]
  : T extends (...args: any[]) => any
    ? T
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

interface Config {
  app: { name: string; version: number; features: { darkMode: boolean; notifications: boolean } };
  database: { host: string; port: number };
}

const fullConfig: DeepReadonly<Config> = {
  app: { name: "MyApp", version: 1, features: { darkMode: true, notifications: false } },
  database: { host: "localhost", port: 5432 }
};
console.log(\`App: \${fullConfig.app.name} v\${fullConfig.app.version}\`);
console.log(\`Dark mode: \${fullConfig.app.features.darkMode}\`);
console.log(\`DB: \${fullConfig.database.host}:\${fullConfig.database.port}\`);

const partial: DeepPartial<Config> = { app: { features: { darkMode: false } } };
console.log(\`Partial dark mode: \${partial.app?.features?.darkMode}\`);
console.log(\`Partial name: \${partial.app?.name ?? "not set"}\`);
console.log(\`Partial db: \${partial.database?.host ?? "not set"}\`);
`,
        explanation: "This version also handles arrays by using `infer` to detect array element types and recursively apply the transformation."
      },
      {
        name: "Using a brand pattern for compile-time verification",
        code: `type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends (...args: any[]) => any ? T[K] : DeepReadonly<T[K]>
    : T[K];
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends (...args: any[]) => any ? T[K] : DeepPartial<T[K]>
    : T[K];
};

type AssertReadonly<T, _U extends DeepReadonly<T> = DeepReadonly<T>> = true;
type AssertPartial<T, _U extends DeepPartial<T> = DeepPartial<T>> = true;

interface Config {
  app: { name: string; version: number; features: { darkMode: boolean; notifications: boolean } };
  database: { host: string; port: number };
}

type _CheckReadonly = AssertReadonly<Config>;
type _CheckPartial = AssertPartial<Config>;

const fullConfig: DeepReadonly<Config> = {
  app: { name: "MyApp", version: 1, features: { darkMode: true, notifications: false } },
  database: { host: "localhost", port: 5432 }
};
console.log(\`App: \${fullConfig.app.name} v\${fullConfig.app.version}\`);
console.log(\`Dark mode: \${fullConfig.app.features.darkMode}\`);
console.log(\`DB: \${fullConfig.database.host}:\${fullConfig.database.port}\`);

const partial: DeepPartial<Config> = { app: { features: { darkMode: false } } };
console.log(\`Partial dark mode: \${partial.app?.features?.darkMode}\`);
console.log(\`Partial name: \${partial.app?.name ?? "not set"}\`);
console.log(\`Partial db: \${partial.database?.host ?? "not set"}\`);
`,
        explanation: "Assert types using conditional type constraints to verify at compile time that the utility types work correctly — a form of type-level unit testing."
      }
    ],
    crossLang: {
      python: {
        code: `from typing import TypedDict, Optional

class Features(TypedDict, total=False):
    darkMode: bool
    notifications: bool

class App(TypedDict, total=False):
    name: str
    version: int
    features: Features

class Database(TypedDict, total=False):
    host: str
    port: int

class PartialConfig(TypedDict, total=False):
    app: App
    database: Database

full_config = {
    "app": {"name": "MyApp", "version": 1, "features": {"darkMode": True, "notifications": False}},
    "database": {"host": "localhost", "port": 5432}
}
print(f"App: {full_config['app']['name']} v{full_config['app']['version']}")
print(f"Dark mode: {str(full_config['app']['features']['darkMode']).lower()}")
print(f"DB: {full_config['database']['host']}:{full_config['database']['port']}")

partial: PartialConfig = {"app": {"features": {"darkMode": False}}}
print(f"Partial dark mode: {str(partial.get('app', {}).get('features', {}).get('darkMode', '')).lower()}")
print(f"Partial name: {partial.get('app', {}).get('name', 'not set')}")
print(f"Partial db: {partial.get('database', {}).get('host', 'not set')}")
`,
        highlights: [
          { lines: [3, 7, 13, 17], explanation: "Python's TypedDict with total=False makes all keys optional, but there's no equivalent to TypeScript's DeepReadonly or recursive mapped types." },
          { lines: [30, 31], explanation: "Python lacks optional chaining (?.) — you must use nested .get() calls with defaults, which is more verbose." }
        ]
      }
    }
  },

  // ============================================================
  // TYPE BASICS — Level 5
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Type Basics",
    level: 5,
    title: "Type-Safe Builder Pattern with Phantom Types",
    task: "Implement a type-safe `QueryBuilder` that uses phantom types to enforce the correct query construction order at compile time. The builder must require:\n1. `.from(table)` first\n2. `.where(condition)` second (only callable after from)\n3. `.select(fields)` third (only callable after where)\n4. `.build()` (only callable after select)\nUse branded types / interfaces with flags to track builder state. Demonstrate building valid queries and print the SQL strings.",
    code: `// Type-Safe Builder Pattern with Phantom Types
// Enforce build order at the type level

// YOUR CODE HERE
`,
    solutionCode: `// Type-Safe Builder Pattern with Phantom Types
interface HasFrom { _hasFrom: true }
interface HasWhere { _hasWhere: true }
interface HasSelect { _hasSelect: true }

interface QueryState {
  from?: true;
  where?: true;
  select?: true;
}

class QueryBuilder<State extends QueryState = {}> {
  private query: { table: string; condition: string; fields: string[] } = {
    table: "", condition: "", fields: []
  };

  from(table: string): QueryBuilder<State & { from: true }> {
    const next = new QueryBuilder<State & { from: true }>();
    next.query = { ...this.query, table };
    return next;
  }

  where(
    this: QueryBuilder<{ from: true } & State>,
    condition: string
  ): QueryBuilder<State & { from: true; where: true }> {
    const next = new QueryBuilder<State & { from: true; where: true }>();
    next.query = { ...this.query, condition };
    return next;
  }

  select(
    this: QueryBuilder<{ from: true; where: true } & State>,
    ...fields: string[]
  ): QueryBuilder<State & { from: true; where: true; select: true }> {
    const next = new QueryBuilder<State & { from: true; where: true; select: true }>();
    next.query = { ...this.query, fields };
    return next;
  }

  build(
    this: QueryBuilder<{ from: true; where: true; select: true }>
  ): string {
    return \`SELECT \${this.query.fields.join(", ")} FROM \${this.query.table} WHERE \${this.query.condition}\`;
  }
}

const q1 = new QueryBuilder()
  .from("users")
  .where("age > 18")
  .select("name", "email")
  .build();
console.log(q1);

const q2 = new QueryBuilder()
  .from("products")
  .where("price < 100")
  .select("id", "title", "price")
  .build();
console.log(q2);

const q3 = new QueryBuilder()
  .from("orders")
  .where("status = 'active'")
  .select("*")
  .build();
console.log(q3);
`,
    expectedOutput: `SELECT name, email FROM users WHERE age > 18
SELECT id, title, price FROM products WHERE price < 100
SELECT * FROM orders WHERE status = 'active'`,
    hint: "Use a generic type parameter that tracks which steps have been completed. Each method adds a flag to the state type using intersection. The `this` parameter enforces prerequisites.",
    testCases: [
      { input: "const q = new QueryBuilder().from(\"users\").where(\"age > 18\").select(\"name\", \"email\").build();", output: "SELECT name, email FROM users WHERE age > 18" },
      { input: "const q = new QueryBuilder().from(\"products\").where(\"price < 100\").select(\"id\", \"title\", \"price\").build();", output: "SELECT id, title, price FROM products WHERE price < 100" },
      { input: "const q = new QueryBuilder().from(\"orders\").where(\"status = 'active'\").select(\"*\").build();", output: "SELECT * FROM orders WHERE status = 'active'" }
    ],
    judgeFeedback: {
      summary: "Ensure the `this` parameter type on each method enforces prerequisites — calling methods out of order should be a compile-time error.",
      lines: [
        { line: 23, problem: "where() callable without from() being called first", fix: "Add `this: QueryBuilder<{ from: true } & State>` parameter to enforce that from() was called" },
        { line: 42, problem: "build() callable at any time", fix: "Restrict build() with `this: QueryBuilder<{ from: true; where: true; select: true }>` to require all steps" }
      ]
    },
    altMethods: [
      {
        name: "Using separate classes for each state",
        code: `class QueryStart {
  from(table: string): QueryWithFrom {
    return new QueryWithFrom(table);
  }
}

class QueryWithFrom {
  constructor(private table: string) {}
  where(condition: string): QueryWithWhere {
    return new QueryWithWhere(this.table, condition);
  }
}

class QueryWithWhere {
  constructor(private table: string, private condition: string) {}
  select(...fields: string[]): QueryWithSelect {
    return new QueryWithSelect(this.table, this.condition, fields);
  }
}

class QueryWithSelect {
  constructor(private table: string, private condition: string, private fields: string[]) {}
  build(): string {
    return \`SELECT \${this.fields.join(", ")} FROM \${this.table} WHERE \${this.condition}\`;
  }
}

const q1 = new QueryStart().from("users").where("age > 18").select("name", "email").build();
console.log(q1);
const q2 = new QueryStart().from("products").where("price < 100").select("id", "title", "price").build();
console.log(q2);
const q3 = new QueryStart().from("orders").where("status = 'active'").select("*").build();
console.log(q3);
`,
        explanation: "Using separate classes for each state makes the ordering completely rigid — each class only exposes the next valid method. Simpler but more verbose."
      },
      {
        name: "Using tagged union states",
        code: `type BuilderState =
  | { step: "start" }
  | { step: "from"; table: string }
  | { step: "where"; table: string; condition: string }
  | { step: "select"; table: string; condition: string; fields: string[] };

function queryBuilder() {
  const state = { step: "start" as const };

  return {
    from(table: string) {
      return {
        where(condition: string) {
          return {
            select(...fields: string[]) {
              return {
                build(): string {
                  return \`SELECT \${fields.join(", ")} FROM \${table} WHERE \${condition}\`;
                }
              };
            }
          };
        }
      };
    }
  };
}

const q1 = queryBuilder().from("users").where("age > 18").select("name", "email").build();
console.log(q1);
const q2 = queryBuilder().from("products").where("price < 100").select("id", "title", "price").build();
console.log(q2);
const q3 = queryBuilder().from("orders").where("status = 'active'").select("*").build();
console.log(q3);
`,
        explanation: "Nested function returns enforce the build order through closure scope. Each method returns an object with only the next valid method, creating a chain of restricted APIs."
      }
    ],
    crossLang: {
      python: {
        code: `class QueryBuilder:
    def __init__(self) -> None:
        self._table = ""
        self._condition = ""
        self._fields: list[str] = []

    def from_(self, table: str) -> "QueryWithFrom":
        self._table = table
        return QueryWithFrom(self)

class QueryWithFrom:
    def __init__(self, builder: QueryBuilder) -> None:
        self._builder = builder

    def where(self, condition: str) -> "QueryWithWhere":
        self._builder._condition = condition
        return QueryWithWhere(self._builder)

class QueryWithWhere:
    def __init__(self, builder: QueryBuilder) -> None:
        self._builder = builder

    def select(self, *fields: str) -> "QueryWithSelect":
        self._builder._fields = list(fields)
        return QueryWithSelect(self._builder)

class QueryWithSelect:
    def __init__(self, builder: QueryBuilder) -> None:
        self._builder = builder

    def build(self) -> str:
        b = self._builder
        return f"SELECT {', '.join(b._fields)} FROM {b._table} WHERE {b._condition}"

q1 = QueryBuilder().from_("users").where("age > 18").select("name", "email").build()
print(q1)
q2 = QueryBuilder().from_("products").where("price < 100").select("id", "title", "price").build()
print(q2)
q3 = QueryBuilder().from_("orders").where("status = 'active'").select("*").build()
print(q3)
`,
        highlights: [
          { lines: [7], explanation: "Python uses from_ (with underscore) since 'from' is a reserved keyword. TypeScript doesn't have this restriction." },
          { lines: [11, 16, 21, 26], explanation: "Python enforces build order using separate classes (like the alt method), since it lacks TypeScript's phantom type / this-parameter mechanism." }
        ]
      }
    }
  },

  // ============================================================
  // UNION TYPES — Level 3
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Union Types",
    level: 3,
    title: "Discriminated Union with Exhaustive Check",
    task: "Create a discriminated union `Shape` with types `Circle` (radius), `Rectangle` (width, height), and `Triangle` (base, height). Write a function `area(shape: Shape): number` using a switch statement with exhaustive checking. Print the area for each shape.",
    code: `// Discriminated Union — exhaustive Shape area
// Define Circle, Rectangle, Triangle types with a 'kind' discriminant

// YOUR CODE HERE

const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rectangle", width: 4, height: 6 },
  { kind: "triangle", base: 3, height: 8 },
];

for (const s of shapes) {
  console.log(area(s).toFixed(2));
}`,
    solutionCode: `type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };
type Triangle = { kind: "triangle"; base: number; height: number };
type Shape = Circle | Rectangle | Triangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
    case "triangle": return 0.5 * shape.base * shape.height;
  }
}

const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rectangle", width: 4, height: 6 },
  { kind: "triangle", base: 3, height: 8 },
];

for (const s of shapes) {
  console.log(area(s).toFixed(2));
}`,
    expectedOutput: "78.54\n24.00\n12.00",
    testCases: [
      { input: "const shapes: Shape[] = [{ kind: \"circle\", radius: 5 }];", output: "78.54" },
      { input: "const shapes: Shape[] = [{ kind: \"rectangle\", width: 4, height: 6 }];", output: "24.00" },
      { input: "const shapes: Shape[] = [{ kind: \"triangle\", base: 3, height: 8 }];", output: "12.00" },
    ],
    hint: "Use a `kind` property as the discriminant. TypeScript narrows the type automatically in each switch case.",
    judgeFeedback: {
      summary: "Use discriminated unions with a 'kind' field and switch for exhaustive type narrowing.",
      lines: [
        { line: 7, problem: "Missing discriminant property", fix: "Each type needs a `kind` literal type to enable switch-based narrowing." },
      ],
    },
  },

  // ============================================================
  // UNION TYPES — Level 4
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Union Types",
    level: 4,
    title: "Discriminated Unions with Exhaustive Matching",
    task: "Model a shape calculation system using discriminated unions. Define shapes:\n- `Circle: { kind: \"circle\"; radius: number }`\n- `Rectangle: { kind: \"rectangle\"; width: number; height: number }`\n- `Triangle: { kind: \"triangle\"; base: number; height: number }`\n- `Polygon: { kind: \"polygon\"; sides: number; sideLength: number }`\nImplement `area(shape: Shape): number` with exhaustive matching (using a `never` check). Also implement `describe(shape: Shape): string`. Test with one of each shape.",
    code: `// Discriminated Unions with Exhaustive Matching
// Model shapes with exhaustive type narrowing

// YOUR CODE HERE
`,
    solutionCode: `// Discriminated Unions with Exhaustive Matching
interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

interface Polygon {
  kind: "polygon";
  sides: number;
  sideLength: number;
}

type Shape = Circle | Rectangle | Triangle | Polygon;

function assertNever(value: never): never {
  throw new Error(\`Unexpected value: \${value}\`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
    case "polygon": {
      const apothem = shape.sideLength / (2 * Math.tan(Math.PI / shape.sides));
      const perimeter = shape.sides * shape.sideLength;
      return 0.5 * apothem * perimeter;
    }
    default:
      return assertNever(shape);
  }
}

function describe(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      return \`Circle (r=\${shape.radius})\`;
    case "rectangle":
      return \`Rectangle (\${shape.width}x\${shape.height})\`;
    case "triangle":
      return \`Triangle (b=\${shape.base}, h=\${shape.height})\`;
    case "polygon":
      return \`Polygon (\${shape.sides} sides, len=\${shape.sideLength})\`;
    default:
      return assertNever(shape);
  }
}

const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rectangle", width: 4, height: 6 },
  { kind: "triangle", base: 3, height: 8 },
  { kind: "polygon", sides: 6, sideLength: 4 }
];

for (const shape of shapes) {
  console.log(\`\${describe(shape)}: area = \${area(shape).toFixed(2)}\`);
}
`,
    expectedOutput: `Circle (r=5): area = 78.54
Rectangle (4x6): area = 24.00
Triangle (b=3, h=8): area = 12.00
Polygon (6 sides, len=4): area = 41.57`,
    hint: "Use a `switch` on the `kind` property. Add a `default` case that calls a function taking `never` — this ensures compile-time errors if you forget a case. Each case narrows the type automatically.",
    testCases: [
      { input: "const c: Shape = { kind: \"circle\", radius: 5 };", output: "Circle (r=5): area = 78.54" },
      { input: "const r: Shape = { kind: \"rectangle\", width: 4, height: 6 };", output: "Rectangle (4x6): area = 24.00" },
      { input: "const p: Shape = { kind: \"polygon\", sides: 6, sideLength: 4 };", output: "Polygon (6 sides, len=4): area = 41.57" }
    ],
    judgeFeedback: {
      summary: "Ensure the default case uses `never` for exhaustive checking — adding a new shape variant should cause a compile error if not handled.",
      lines: [
        { line: 43, problem: "Missing default case with never check", fix: "Add `default: return assertNever(shape);` to catch unhandled shape variants at compile time" },
        { line: 27, problem: "Using if-else instead of switch for discriminated unions", fix: "Use switch on `shape.kind` for cleaner exhaustive matching with discriminated unions" }
      ]
    },
    altMethods: [
      {
        name: "Using a handler map",
        code: `interface Circle { kind: "circle"; radius: number }
interface Rectangle { kind: "rectangle"; width: number; height: number }
interface Triangle { kind: "triangle"; base: number; height: number }
interface Polygon { kind: "polygon"; sides: number; sideLength: number }
type Shape = Circle | Rectangle | Triangle | Polygon;

type ShapeHandlers<R> = { [K in Shape["kind"]]: (shape: Extract<Shape, { kind: K }>) => R };

const areaHandlers: ShapeHandlers<number> = {
  circle: (s) => Math.PI * s.radius ** 2,
  rectangle: (s) => s.width * s.height,
  triangle: (s) => 0.5 * s.base * s.height,
  polygon: (s) => {
    const apothem = s.sideLength / (2 * Math.tan(Math.PI / s.sides));
    return 0.5 * apothem * s.sides * s.sideLength;
  }
};

const describeHandlers: ShapeHandlers<string> = {
  circle: (s) => \`Circle (r=\${s.radius})\`,
  rectangle: (s) => \`Rectangle (\${s.width}x\${s.height})\`,
  triangle: (s) => \`Triangle (b=\${s.base}, h=\${s.height})\`,
  polygon: (s) => \`Polygon (\${s.sides} sides, len=\${s.sideLength})\`
};

function matchShape<R>(shape: Shape, handlers: ShapeHandlers<R>): R {
  return (handlers[shape.kind] as (s: any) => R)(shape);
}

const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rectangle", width: 4, height: 6 },
  { kind: "triangle", base: 3, height: 8 },
  { kind: "polygon", sides: 6, sideLength: 4 }
];

for (const s of shapes) {
  console.log(\`\${matchShape(s, describeHandlers)}: area = \${matchShape(s, areaHandlers).toFixed(2)}\`);
}
`,
        explanation: "A handler map with `Extract<Shape, { kind: K }>` ensures every shape kind must be handled. Missing a case is a compile error since the handler record requires all keys."
      },
      {
        name: "Using visitor pattern with classes",
        code: `interface ShapeVisitor<R> {
  visitCircle(shape: { radius: number }): R;
  visitRectangle(shape: { width: number; height: number }): R;
  visitTriangle(shape: { base: number; height: number }): R;
  visitPolygon(shape: { sides: number; sideLength: number }): R;
}

interface Circle { kind: "circle"; radius: number }
interface Rectangle { kind: "rectangle"; width: number; height: number }
interface Triangle { kind: "triangle"; base: number; height: number }
interface Polygon { kind: "polygon"; sides: number; sideLength: number }
type Shape = Circle | Rectangle | Triangle | Polygon;

function visit<R>(shape: Shape, visitor: ShapeVisitor<R>): R {
  switch (shape.kind) {
    case "circle": return visitor.visitCircle(shape);
    case "rectangle": return visitor.visitRectangle(shape);
    case "triangle": return visitor.visitTriangle(shape);
    case "polygon": return visitor.visitPolygon(shape);
  }
}

const areaVisitor: ShapeVisitor<number> = {
  visitCircle: (s) => Math.PI * s.radius ** 2,
  visitRectangle: (s) => s.width * s.height,
  visitTriangle: (s) => 0.5 * s.base * s.height,
  visitPolygon: (s) => { const a = s.sideLength / (2 * Math.tan(Math.PI / s.sides)); return 0.5 * a * s.sides * s.sideLength; }
};

const descVisitor: ShapeVisitor<string> = {
  visitCircle: (s) => \`Circle (r=\${s.radius})\`,
  visitRectangle: (s) => \`Rectangle (\${s.width}x\${s.height})\`,
  visitTriangle: (s) => \`Triangle (b=\${s.base}, h=\${s.height})\`,
  visitPolygon: (s) => \`Polygon (\${s.sides} sides, len=\${s.sideLength})\`
};

const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rectangle", width: 4, height: 6 },
  { kind: "triangle", base: 3, height: 8 },
  { kind: "polygon", sides: 6, sideLength: 4 }
];

for (const s of shapes) {
  console.log(\`\${visit(s, descVisitor)}: area = \${visit(s, areaVisitor).toFixed(2)}\`);
}
`,
        explanation: "The visitor pattern separates shape operations from shape data. Adding new operations only requires implementing a new visitor, not modifying shape classes."
      }
    ],
    crossLang: {
      python: {
        code: `from dataclasses import dataclass
from math import pi, tan
from typing import Union

@dataclass
class Circle:
    kind: str = "circle"
    radius: float = 0

@dataclass
class Rectangle:
    kind: str = "rectangle"
    width: float = 0
    height: float = 0

@dataclass
class Triangle:
    kind: str = "triangle"
    base: float = 0
    height: float = 0

@dataclass
class Polygon:
    kind: str = "polygon"
    sides: int = 0
    side_length: float = 0

Shape = Union[Circle, Rectangle, Triangle, Polygon]

def area(shape: Shape) -> float:
    match shape:
        case Circle(radius=r):
            return pi * r ** 2
        case Rectangle(width=w, height=h):
            return w * h
        case Triangle(base=b, height=h):
            return 0.5 * b * h
        case Polygon(sides=s, side_length=sl):
            apothem = sl / (2 * tan(pi / s))
            return 0.5 * apothem * s * sl

def describe(shape: Shape) -> str:
    match shape:
        case Circle(radius=r): return f"Circle (r={r})"
        case Rectangle(width=w, height=h): return f"Rectangle ({w}x{h})"
        case Triangle(base=b, height=h): return f"Triangle (b={b}, h={h})"
        case Polygon(sides=s, side_length=sl): return f"Polygon ({s} sides, len={sl})"

shapes = [Circle(radius=5), Rectangle(width=4, height=6), Triangle(base=3, height=8), Polygon(sides=6, side_length=4)]
for s in shapes:
    print(f"{describe(s)}: area = {area(s):.2f}")
`,
        highlights: [
          { lines: [31, 32], explanation: "Python 3.10+ structural pattern matching with `match/case` is similar to TypeScript's switch but can destructure directly." },
          { lines: [5, 10, 15, 20], explanation: "Python dataclasses provide a concise way to define data types, similar to TypeScript interfaces but with runtime behavior." }
        ]
      }
    }
  },

  // ============================================================
  // UNION TYPES — Level 5
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Union Types",
    level: 5,
    title: "Type-Safe Result Monad",
    task: "Implement a `Result<T, E>` type (similar to Rust's Result) using discriminated unions:\n- `Ok<T>` with `{ ok: true; value: T }`\n- `Err<E>` with `{ ok: false; error: E }`\nImplement these functions:\n- `ok<T>(value: T): Result<T, never>` and `err<E>(error: E): Result<never, E>`\n- `map<T, E, U>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>`\n- `flatMap<T, E, U>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E>`\n- `unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T`\nDemonstrate by parsing and validating user input through a chain of Result operations.",
    code: `// Type-Safe Result Monad
// Implement a Result type with map, flatMap, and unwrapOr

// YOUR CODE HERE
`,
    solutionCode: `// Type-Safe Result Monad
type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; error: E };
type Result<T, E> = Ok<T> | Err<E>;

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

function map<T, E, U>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

function flatMap<T, E, U>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}

function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}

function parseAge(input: string): Result<number, string> {
  const n = parseInt(input, 10);
  return isNaN(n) ? err("Not a number") : ok(n);
}

function validateAge(age: number): Result<number, string> {
  if (age < 0) return err("Age cannot be negative");
  if (age > 150) return err("Age is unrealistic");
  return ok(age);
}

function categorize(age: number): Result<string, string> {
  if (age < 13) return ok("child");
  if (age < 20) return ok("teenager");
  if (age < 65) return ok("adult");
  return ok("senior");
}

const inputs = ["25", "abc", "-5", "200", "15"];

for (const input of inputs) {
  const result = flatMap(
    flatMap(parseAge(input), validateAge),
    categorize
  );

  const category = unwrapOr(result, "unknown");
  const display = result.ok
    ? \`"\${input}" -> \${category}\`
    : \`"\${input}" -> Error: \${result.error}\`;
  console.log(display);
}
`,
    expectedOutput: `"25" -> adult
"abc" -> Error: Not a number
"-5" -> Error: Age cannot be negative
"200" -> Error: Age is unrealistic
"15" -> teenager`,
    hint: "Use `ok: true` / `ok: false` as the discriminant. In `map` and `flatMap`, check `result.ok` to narrow the type. `flatMap` differs from `map` in that the function itself returns a Result.",
    testCases: [
      { input: "const result = flatMap(flatMap(parseAge(\"25\"), validateAge), categorize);", output: "\"25\" -> adult" },
      { input: "const result = flatMap(flatMap(parseAge(\"abc\"), validateAge), categorize);", output: "\"abc\" -> Error: Not a number" },
      { input: "const result = flatMap(flatMap(parseAge(\"15\"), validateAge), categorize);", output: "\"15\" -> teenager" }
    ],
    judgeFeedback: {
      summary: "Ensure Result<T, E> properly narrows in map/flatMap — checking `.ok` should give access to `.value` or `.error` respectively.",
      lines: [
        { line: 15, problem: "Not returning the original error when mapping over an Err", fix: "In map/flatMap, when `result.ok` is false, return `result` unchanged to propagate the error" },
        { line: 18, problem: "Confusing map and flatMap — both unwrapping the result", fix: "map wraps the return in ok(), flatMap does not — the function itself returns a Result" }
      ]
    },
    altMethods: [
      {
        name: "Using a class-based Result with method chaining",
        code: `class Result<T, E> {
  private constructor(
    private readonly _ok: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static ok<T>(value: T): Result<T, never> { return new Result<T, never>(true, value); }
  static err<E>(error: E): Result<never, E> { return new Result<never, E>(false, undefined, error); }

  get isOk(): boolean { return this._ok; }
  get value(): T { if (!this._ok) throw new Error("No value on Err"); return this._value!; }
  get error(): E { if (this._ok) throw new Error("No error on Ok"); return this._error!; }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this._ok ? Result.ok(fn(this._value!)) : Result.err(this._error!);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this._ok ? fn(this._value!) : Result.err(this._error!);
  }

  unwrapOr(defaultValue: T): T {
    return this._ok ? this._value! : defaultValue;
  }
}

function parseAge(input: string): Result<number, string> {
  const n = parseInt(input, 10);
  return isNaN(n) ? Result.err("Not a number") : Result.ok(n);
}
function validateAge(age: number): Result<number, string> {
  if (age < 0) return Result.err("Age cannot be negative");
  if (age > 150) return Result.err("Age is unrealistic");
  return Result.ok(age);
}
function categorize(age: number): Result<string, string> {
  if (age < 13) return Result.ok("child");
  if (age < 20) return Result.ok("teenager");
  if (age < 65) return Result.ok("adult");
  return Result.ok("senior");
}

for (const input of ["25", "abc", "-5", "200", "15"]) {
  const result = parseAge(input).flatMap(validateAge).flatMap(categorize);
  const display = result.isOk
    ? \`"\${input}" -> \${result.value}\`
    : \`"\${input}" -> Error: \${result.error}\`;
  console.log(display);
}
`,
        explanation: "A class-based Result enables method chaining (.map().flatMap()) which reads more naturally than nested function calls."
      },
      {
        name: "Using match helper for pattern matching",
        code: `type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; error: E };
type Result<T, E> = Ok<T> | Err<E>;

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

function match<T, E, R>(result: Result<T, E>, handlers: { ok: (v: T) => R; err: (e: E) => R }): R {
  return result.ok ? handlers.ok(result.value) : handlers.err(result.error);
}

function chain<T, E, U>(result: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}

function parseAge(input: string): Result<number, string> {
  const n = parseInt(input, 10);
  return isNaN(n) ? err("Not a number") : ok(n);
}
function validateAge(age: number): Result<number, string> {
  if (age < 0) return err("Age cannot be negative");
  if (age > 150) return err("Age is unrealistic");
  return ok(age);
}
function categorize(age: number): Result<string, string> {
  if (age < 13) return ok("child");
  if (age < 20) return ok("teenager");
  if (age < 65) return ok("adult");
  return ok("senior");
}

for (const input of ["25", "abc", "-5", "200", "15"]) {
  const result = chain(chain(parseAge(input), validateAge), categorize);
  console.log(match(result, {
    ok: (cat) => \`"\${input}" -> \${cat}\`,
    err: (e) => \`"\${input}" -> Error: \${e}\`
  }));
}
`,
        explanation: "A match() helper with an object of handlers provides Rust-like pattern matching. It forces handling both Ok and Err cases explicitly."
      }
    ],
    crossLang: {
      python: {
        code: `from dataclasses import dataclass
from typing import TypeVar, Generic, Callable, Union

T = TypeVar("T")
E = TypeVar("E")
U = TypeVar("U")

@dataclass
class Ok(Generic[T]):
    value: T
    ok: bool = True

@dataclass
class Err(Generic[E]):
    error: E
    ok: bool = False

Result = Union[Ok[T], Err[E]]

def flat_map(result: Result, fn: Callable) -> Result:
    return fn(result.value) if result.ok else result

def unwrap_or(result: Result, default):
    return result.value if result.ok else default

def parse_age(inp: str) -> Result:
    try:
        return Ok(int(inp))
    except ValueError:
        return Err("Not a number")

def validate_age(age: int) -> Result:
    if age < 0: return Err("Age cannot be negative")
    if age > 150: return Err("Age is unrealistic")
    return Ok(age)

def categorize(age: int) -> Result:
    if age < 13: return Ok("child")
    if age < 20: return Ok("teenager")
    if age < 65: return Ok("adult")
    return Ok("senior")

for inp in ["25", "abc", "-5", "200", "15"]:
    result = flat_map(flat_map(parse_age(inp), validate_age), categorize)
    if result.ok:
        print(f'"{inp}" -> {result.value}')
    else:
        print(f'"{inp}" -> Error: {result.error}')
`,
        highlights: [
          { lines: [8, 13], explanation: "Python uses @dataclass with Generic for value containers. Unlike TypeScript's literal type discriminants, Python checks `.ok` as a boolean at runtime." },
          { lines: [20], explanation: "Python's Union type is less powerful than TypeScript's discriminated unions — the type checker cannot narrow based on the ok field as easily." }
        ]
      }
    }
  },

  // ============================================================
  // ASYNC/AWAIT — Level 3
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Async/Await",
    level: 3,
    title: "Sequential vs Parallel Async Execution",
    task: "Write two functions: `sequential()` that runs three async tasks one after another, and `parallel()` that runs them simultaneously with `Promise.all`. Each task simulates a delay. Print the execution time for each approach.",
    code: `// Sequential vs Parallel async execution
// Compare running tasks one-by-one vs concurrently

function delay(ms: number, label: string): Promise<string> {
  return new Promise(resolve => setTimeout(() => resolve(label), ms));
}

// YOUR CODE HERE — implement sequential() and parallel()

async function main() {
  const t1 = Date.now();
  const seqResults = await sequential();
  console.log("Sequential:", Date.now() - t1 + "ms", seqResults.join(", "));

  const t2 = Date.now();
  const parResults = await parallel();
  console.log("Parallel:", Date.now() - t2 + "ms", parResults.join(", "));
}

main();`,
    solutionCode: `function delay(ms: number, label: string): Promise<string> {
  return new Promise(resolve => setTimeout(() => resolve(label), ms));
}

async function sequential(): Promise<string[]> {
  const a = await delay(100, "A");
  const b = await delay(100, "B");
  const c = await delay(100, "C");
  return [a, b, c];
}

async function parallel(): Promise<string[]> {
  return Promise.all([delay(100, "A"), delay(100, "B"), delay(100, "C")]);
}

async function main() {
  const t1 = Date.now();
  const seqResults = await sequential();
  console.log("Sequential:", Date.now() - t1 + "ms", seqResults.join(", "));

  const t2 = Date.now();
  const parResults = await parallel();
  console.log("Parallel:", Date.now() - t2 + "ms", parResults.join(", "));
}

main();`,
    expectedOutput: "Sequential: 300ms A, B, C\nParallel: 100ms A, B, C",
    testCases: [
      { input: "sequential()", output: "A, B, C" },
      { input: "parallel()", output: "A, B, C" },
    ],
    hint: "For sequential: use `await` on each call. For parallel: use `Promise.all([...])` to run all at once.",
    judgeFeedback: {
      summary: "Sequential uses individual awaits; parallel wraps all promises in Promise.all.",
      lines: [
        { line: 5, problem: "Running tasks sequentially when parallel is needed", fix: "Use `Promise.all([task1(), task2(), task3()])` to run in parallel." },
      ],
    },
  },

  // ============================================================
  // ASYNC/AWAIT — Level 4
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Async/Await",
    level: 4,
    title: "Rate-Limited Concurrent Executor",
    task: "Implement `asyncPool<T>(concurrency: number, tasks: (() => Promise<T>)[]): Promise<T[]>` that executes async tasks with a concurrency limit. For example, with concurrency 2 and 5 tasks, at most 2 tasks run simultaneously. Each task should log when it starts and finishes. Return results in order. Test with simulated API calls of varying durations.",
    code: `// Rate-Limited Concurrent Executor
// Execute async tasks with a concurrency limit

// YOUR CODE HERE
`,
    solutionCode: `// Rate-Limited Concurrent Executor
async function asyncPool<T>(
  concurrency: number,
  tasks: (() => Promise<T>)[]
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < tasks.length) {
      const index = nextIndex++;
      results[index] = await tasks[index]();
    }
  }

  const workers: Promise<void>[] = [];
  for (let i = 0; i < Math.min(concurrency, tasks.length); i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  return results;
}

function createTask(id: number, ms: number): () => Promise<string> {
  return async () => {
    console.log(\`Task \${id} started\`);
    await new Promise((resolve) => setTimeout(resolve, ms));
    console.log(\`Task \${id} done (\${ms}ms)\`);
    return \`Result-\${id}\`;
  };
}

async function main(): Promise<void> {
  const tasks = [
    createTask(1, 100),
    createTask(2, 50),
    createTask(3, 80),
    createTask(4, 30),
    createTask(5, 60)
  ];

  console.log("Running with concurrency=2");
  const results = await asyncPool(2, tasks);
  console.log("Results: " + results.join(", "));
}

main();
`,
    expectedOutput: `Running with concurrency=2
Task 1 started
Task 2 started
Task 2 done (50ms)
Task 3 started
Task 3 done (80ms)
Task 4 started
Task 1 done (100ms)
Task 5 started
Task 4 done (30ms)
Task 5 done (60ms)
Results: Result-1, Result-2, Result-3, Result-4, Result-5`,
    hint: "Create N worker functions (where N = concurrency) that each pull the next task from a shared index. All workers run concurrently via Promise.all, but each worker processes tasks sequentially.",
    testCases: [
      { input: "const tasks = [createTask(1, 100), createTask(2, 50)]; const results = await asyncPool(2, tasks);", output: "Task 1 started\nTask 2 started\nTask 2 done (50ms)\nTask 1 done (100ms)\nResults: Result-1, Result-2" },
      { input: "const tasks = [createTask(1, 100), createTask(2, 50)]; const results = await asyncPool(1, tasks);", output: "Task 1 started\nTask 1 done (100ms)\nTask 2 started\nTask 2 done (50ms)" },
      { input: "const tasks = [createTask(1, 100), createTask(2, 50)]; const results = await asyncPool(5, tasks);", output: "Task 1 started\nTask 2 started\nTask 2 done (50ms)\nTask 1 done (100ms)" }
    ],
    judgeFeedback: {
      summary: "Ensure tasks run concurrently up to the limit, not all at once. Results must be in the original order regardless of completion order.",
      lines: [
        { line: 6, problem: "Using a simple for loop instead of worker pool", fix: "Create multiple worker async functions that share a task index to achieve true concurrency limiting" },
        { line: 12, problem: "Results array not preserving original task order", fix: "Pre-allocate the results array and write to `results[index]` using the captured index, not push" }
      ]
    },
    altMethods: [
      {
        name: "Using a semaphore-based approach",
        code: `class Semaphore {
  private queue: (() => void)[] = [];
  private count: number;

  constructor(max: number) { this.count = max; }

  async acquire(): Promise<void> {
    if (this.count > 0) {
      this.count--;
      return;
    }
    return new Promise<void>((resolve) => this.queue.push(resolve));
  }

  release(): void {
    const next = this.queue.shift();
    if (next) next();
    else this.count++;
  }
}

async function asyncPool<T>(concurrency: number, tasks: (() => Promise<T>)[]): Promise<T[]> {
  const sem = new Semaphore(concurrency);
  const promises = tasks.map(async (task, i) => {
    await sem.acquire();
    try { return await task(); }
    finally { sem.release(); }
  });
  return Promise.all(promises);
}

function createTask(id: number, ms: number): () => Promise<string> {
  return async () => {
    console.log(\`Task \${id} started\`);
    await new Promise(r => setTimeout(r, ms));
    console.log(\`Task \${id} done (\${ms}ms)\`);
    return \`Result-\${id}\`;
  };
}

async function main() {
  const tasks = [createTask(1, 100), createTask(2, 50), createTask(3, 80), createTask(4, 30), createTask(5, 60)];
  console.log("Running with concurrency=2");
  const results = await asyncPool(2, tasks);
  console.log("Results: " + results.join(", "));
}
main();
`,
        explanation: "A Semaphore class controls access to a limited resource. acquire() blocks when at capacity, and release() unblocks the next waiting task."
      },
      {
        name: "Using Promise.race for slot management",
        code: `async function asyncPool<T>(concurrency: number, tasks: (() => Promise<T>)[]): Promise<T[]> {
  const results: T[] = [];
  const executing = new Set<Promise<void>>();

  for (let i = 0; i < tasks.length; i++) {
    const p = tasks[i]().then((result) => {
      results[i] = result;
    });
    const tracked = p.then(() => { executing.delete(tracked); });
    executing.add(tracked);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
  return results;
}

function createTask(id: number, ms: number): () => Promise<string> {
  return async () => {
    console.log(\`Task \${id} started\`);
    await new Promise(r => setTimeout(r, ms));
    console.log(\`Task \${id} done (\${ms}ms)\`);
    return \`Result-\${id}\`;
  };
}

async function main() {
  const tasks = [createTask(1, 100), createTask(2, 50), createTask(3, 80), createTask(4, 30), createTask(5, 60)];
  console.log("Running with concurrency=2");
  const results = await asyncPool(2, tasks);
  console.log("Results: " + results.join(", "));
}
main();
`,
        explanation: "Promise.race on the executing set blocks until any task finishes, freeing a slot. This is the approach used by the popular `p-limit` library."
      }
    ],
    crossLang: {
      python: {
        code: `import asyncio

async def async_pool(concurrency: int, tasks: list) -> list:
    semaphore = asyncio.Semaphore(concurrency)
    results = [None] * len(tasks)

    async def run(index: int, task):
        async with semaphore:
            results[index] = await task()

    await asyncio.gather(*(run(i, t) for i, t in enumerate(tasks)))
    return results

def create_task(task_id: int, ms: int):
    async def task() -> str:
        print(f"Task {task_id} started")
        await asyncio.sleep(ms / 1000)
        print(f"Task {task_id} done ({ms}ms)")
        return f"Result-{task_id}"
    return task

async def main():
    tasks = [create_task(1, 100), create_task(2, 50), create_task(3, 80), create_task(4, 30), create_task(5, 60)]
    print("Running with concurrency=2")
    results = await async_pool(2, tasks)
    print("Results: " + ", ".join(results))

asyncio.run(main())
`,
        highlights: [
          { lines: [3, 4], explanation: "Python's asyncio.Semaphore provides built-in concurrency limiting, unlike TypeScript where you must implement it manually." },
          { lines: [8], explanation: "Python's `async with semaphore` context manager automatically acquires and releases, cleaner than try/finally." }
        ]
      }
    }
  },

  // ============================================================
  // ASYNC/AWAIT — Level 5
  // ============================================================
  {
    lang: "TypeScript",
    topic: "Async/Await",
    level: 5,
    title: "Retry with Exponential Backoff and Circuit Breaker",
    task: "Implement two async utilities:\n1. `retry<T>(fn: () => Promise<T>, options: { maxRetries: number; baseDelay: number; backoffFactor: number }): Promise<T>` — retries with exponential backoff on failure\n2. `CircuitBreaker` class with states: CLOSED (normal), OPEN (failing, reject immediately), HALF_OPEN (testing). Configure with `failureThreshold`, `resetTimeout`. Log state transitions.\nDemonstrate with a flaky API that fails N times then succeeds.",
    code: `// Retry with Exponential Backoff and Circuit Breaker
// Implement fault-tolerance patterns for async operations

// YOUR CODE HERE
`,
    solutionCode: `// Retry with Exponential Backoff and Circuit Breaker
async function retry<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; baseDelay: number; backoffFactor: number }
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e as Error;
      if (attempt < options.maxRetries) {
        const delay = options.baseDelay * Math.pow(options.backoffFactor, attempt);
        console.log(\`  Attempt \${attempt + 1} failed, retrying in \${delay}ms...\`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failures = 0;
  private lastFailureTime = 0;

  constructor(
    private failureThreshold: number,
    private resetTimeout: number
  ) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = "HALF_OPEN";
        console.log("  Circuit: OPEN -> HALF_OPEN");
      } else {
        throw new Error("Circuit is OPEN");
      }
    }

    try {
      const result = await fn();
      if (this.state === "HALF_OPEN") {
        this.state = "CLOSED";
        this.failures = 0;
        console.log("  Circuit: HALF_OPEN -> CLOSED");
      }
      return result;
    } catch (e) {
      this.failures++;
      this.lastFailureTime = Date.now();
      if (this.failures >= this.failureThreshold && this.state === "CLOSED") {
        this.state = "OPEN";
        console.log(\`  Circuit: CLOSED -> OPEN (failures=\${this.failures})\`);
      }
      throw e;
    }
  }
}

let callCount = 0;
function flakyApi(): Promise<string> {
  callCount++;
  if (callCount <= 2) {
    return Promise.reject(new Error(\`Fail #\${callCount}\`));
  }
  return Promise.resolve("Success!");
}

async function main(): Promise<void> {
  console.log("=== Retry Demo ===");
  try {
    const result = await retry(flakyApi, {
      maxRetries: 3,
      baseDelay: 10,
      backoffFactor: 2
    });
    console.log("Result: " + result);
  } catch (e) {
    console.log("Failed: " + (e as Error).message);
  }

  console.log("=== Circuit Breaker Demo ===");
  const cb = new CircuitBreaker(2, 50);
  callCount = 0;

  for (let i = 1; i <= 5; i++) {
    try {
      const result = await cb.call(flakyApi);
      console.log(\`Call \${i}: \${result}\`);
    } catch (e) {
      console.log(\`Call \${i}: \${(e as Error).message}\`);
    }
    if (i === 3) {
      await new Promise((r) => setTimeout(r, 60));
    }
  }
}

main();
`,
    expectedOutput: `=== Retry Demo ===
  Attempt 1 failed, retrying in 10ms...
  Attempt 2 failed, retrying in 20ms...
Result: Success!
=== Circuit Breaker Demo ===
Call 1: Fail #1
Call 2: Fail #2
  Circuit: CLOSED -> OPEN (failures=2)
Call 3: Circuit is OPEN
  Circuit: OPEN -> HALF_OPEN
Call 4: Success!
  Circuit: HALF_OPEN -> CLOSED
Call 5: Success!`,
    hint: "For retry: loop with try/catch, computing delay as `baseDelay * backoffFactor^attempt`. For circuit breaker: track failure count and timestamps. In OPEN state, check if resetTimeout has elapsed before allowing a test call (HALF_OPEN).",
    testCases: [
      { input: "// use default retry scenario", output: "Result: Success!" },
      { input: "// use default retry scenario", output: "Circuit: CLOSED -> OPEN (failures=2)" },
      { input: "// use default retry scenario", output: "Circuit: HALF_OPEN -> CLOSED" }
    ],
    judgeFeedback: {
      summary: "Ensure exponential backoff increases delay correctly and the circuit breaker transitions between all three states properly.",
      lines: [
        { line: 13, problem: "Using fixed delay instead of exponential backoff", fix: "Compute delay as `baseDelay * Math.pow(backoffFactor, attempt)` for exponential growth" },
        { line: 36, problem: "Not checking resetTimeout before rejecting in OPEN state", fix: "Compare `Date.now() - lastFailureTime >= resetTimeout` to transition to HALF_OPEN" }
      ]
    },
    altMethods: [
      {
        name: "Using a class-based retry with jitter",
        code: `class RetryPolicy {
  constructor(
    private maxRetries: number,
    private baseDelay: number,
    private backoffFactor: number,
    private jitter: boolean = true
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i <= this.maxRetries; i++) {
      try { return await fn(); }
      catch (e) {
        lastError = e as Error;
        if (i < this.maxRetries) {
          let delay = this.baseDelay * Math.pow(this.backoffFactor, i);
          if (this.jitter) delay *= 0.5 + Math.random();
          console.log(\`  Attempt \${i + 1} failed, retrying in \${Math.round(delay)}ms...\`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    throw lastError;
  }
}

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";
class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failures = 0;
  private lastFailureTime = 0;
  constructor(private threshold: number, private timeout: number) {}
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this.state = "HALF_OPEN"; console.log("  Circuit: OPEN -> HALF_OPEN");
      } else { throw new Error("Circuit is OPEN"); }
    }
    try {
      const r = await fn();
      if (this.state === "HALF_OPEN") { this.state = "CLOSED"; this.failures = 0; console.log("  Circuit: HALF_OPEN -> CLOSED"); }
      return r;
    } catch (e) {
      this.failures++; this.lastFailureTime = Date.now();
      if (this.failures >= this.threshold && this.state === "CLOSED") { this.state = "OPEN"; console.log(\`  Circuit: CLOSED -> OPEN (failures=\${this.failures})\`); }
      throw e;
    }
  }
}

let callCount = 0;
function flakyApi(): Promise<string> { callCount++; return callCount <= 2 ? Promise.reject(new Error(\`Fail #\${callCount}\`)) : Promise.resolve("Success!"); }

async function main() {
  console.log("=== Retry Demo ===");
  try { console.log("Result: " + await new RetryPolicy(3, 10, 2, false).execute(flakyApi)); } catch (e) { console.log("Failed"); }
  console.log("=== Circuit Breaker Demo ===");
  const cb = new CircuitBreaker(2, 50); callCount = 0;
  for (let i = 1; i <= 5; i++) {
    try { console.log(\`Call \${i}: \${await cb.call(flakyApi)}\`); } catch (e) { console.log(\`Call \${i}: \${(e as Error).message}\`); }
    if (i === 3) await new Promise(r => setTimeout(r, 60));
  }
}
main();
`,
        explanation: "Adding jitter (randomized delay) prevents the 'thundering herd' problem where many retrying clients synchronize their retry attempts."
      },
      {
        name: "Combining retry with circuit breaker",
        code: `async function retry<T>(fn: () => Promise<T>, opts: { maxRetries: number; baseDelay: number; backoffFactor: number }): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i <= opts.maxRetries; i++) {
    try { return await fn(); }
    catch (e) { lastError = e as Error; if (i < opts.maxRetries) { const d = opts.baseDelay * Math.pow(opts.backoffFactor, i); console.log(\`  Attempt \${i+1} failed, retrying in \${d}ms...\`); await new Promise(r => setTimeout(r, d)); } }
  }
  throw lastError;
}

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";
class CircuitBreaker {
  private state: CircuitState = "CLOSED"; private failures = 0; private lastFailureTime = 0;
  constructor(private threshold: number, private timeout: number) {}
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") { if (Date.now() - this.lastFailureTime >= this.timeout) { this.state = "HALF_OPEN"; console.log("  Circuit: OPEN -> HALF_OPEN"); } else throw new Error("Circuit is OPEN"); }
    try { const r = await fn(); if (this.state === "HALF_OPEN") { this.state = "CLOSED"; this.failures = 0; console.log("  Circuit: HALF_OPEN -> CLOSED"); } return r; }
    catch (e) { this.failures++; this.lastFailureTime = Date.now(); if (this.failures >= this.threshold && this.state === "CLOSED") { this.state = "OPEN"; console.log(\`  Circuit: CLOSED -> OPEN (failures=\${this.failures})\`); } throw e; }
  }
}

class ResilientClient {
  private cb: CircuitBreaker;
  constructor(threshold: number, resetMs: number) { this.cb = new CircuitBreaker(threshold, resetMs); }
  async call<T>(fn: () => Promise<T>, retryOpts = { maxRetries: 3, baseDelay: 10, backoffFactor: 2 }): Promise<T> {
    return this.cb.call(() => retry(fn, retryOpts));
  }
}

let callCount = 0;
function flakyApi(): Promise<string> { callCount++; return callCount <= 2 ? Promise.reject(new Error(\`Fail #\${callCount}\`)) : Promise.resolve("Success!"); }

async function main() {
  console.log("=== Retry Demo ===");
  try { console.log("Result: " + await retry(flakyApi, { maxRetries: 3, baseDelay: 10, backoffFactor: 2 })); } catch (e) { console.log("Failed"); }
  console.log("=== Circuit Breaker Demo ===");
  const cb = new CircuitBreaker(2, 50); callCount = 0;
  for (let i = 1; i <= 5; i++) {
    try { console.log(\`Call \${i}: \${await cb.call(flakyApi)}\`); } catch (e) { console.log(\`Call \${i}: \${(e as Error).message}\`); }
    if (i === 3) await new Promise(r => setTimeout(r, 60));
  }
}
main();
`,
        explanation: "A ResilientClient composes retry and circuit breaker — each call through the circuit breaker retries internally, and repeated overall failures trip the breaker."
      }
    ],
    crossLang: {
      python: {
        code: `import asyncio
from enum import Enum
from time import time

async def retry(fn, max_retries=3, base_delay=0.01, backoff_factor=2):
    last_error = None
    for attempt in range(max_retries + 1):
        try:
            return await fn()
        except Exception as e:
            last_error = e
            if attempt < max_retries:
                delay = base_delay * (backoff_factor ** attempt)
                print(f"  Attempt {attempt + 1} failed, retrying in {int(delay*1000)}ms...")
                await asyncio.sleep(delay)
    raise last_error

class State(Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"

class CircuitBreaker:
    def __init__(self, threshold: int, timeout: float):
        self.state = State.CLOSED
        self.failures = 0
        self.last_failure = 0.0
        self.threshold = threshold
        self.timeout = timeout

    async def call(self, fn):
        if self.state == State.OPEN:
            if time() - self.last_failure >= self.timeout:
                self.state = State.HALF_OPEN
                print("  Circuit: OPEN -> HALF_OPEN")
            else:
                raise Exception("Circuit is OPEN")
        try:
            result = await fn()
            if self.state == State.HALF_OPEN:
                self.state = State.CLOSED
                self.failures = 0
                print("  Circuit: HALF_OPEN -> CLOSED")
            return result
        except Exception as e:
            self.failures += 1
            self.last_failure = time()
            if self.failures >= self.threshold and self.state == State.CLOSED:
                self.state = State.OPEN
                print(f"  Circuit: CLOSED -> OPEN (failures={self.failures})")
            raise

asyncio.run(main())
`,
        highlights: [
          { lines: [18, 19, 20], explanation: "Python uses Enum for the circuit state, providing a cleaner pattern than TypeScript's string literal union types." },
          { lines: [5, 6, 7], explanation: "Python's async/await syntax is nearly identical to TypeScript's, but uses asyncio.sleep instead of setTimeout." }
        ]
      }
    }
  }
];
