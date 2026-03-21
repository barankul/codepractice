// GitHubコード索引 — open-source code index for bug-fix exercises

export type CodeSize = "snippet" | "codebase";

export interface CodeEntry {
  repo: string;      // "owner/name"
  branch: string;    // "main" or "master"
  path: string;      // file path within repo
  lang: string;      // "Java" | "TypeScript" | "SQL"
  topics: string[];  // matching TOPICS from constants.ts
  minLevel: number;  // minimum difficulty level (1-5)
  maxLevel: number;  // maximum difficulty level (1-5)
  size: CodeSize;    // "snippet" = small file, "codebase" = large production file
}

export const GITHUB_CODE_INDEX: CodeEntry[] = [

  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/sorts/BubbleSort.java", lang: "Java", topics: ["Array"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/sorts/SelectionSort.java", lang: "Java", topics: ["Array"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/sorts/InsertionSort.java", lang: "Java", topics: ["Array"], minLevel: 1, maxLevel: 3, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/sorts/MergeSort.java", lang: "Java", topics: ["Array"], minLevel: 3, maxLevel: 5, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/sorts/QuickSort.java", lang: "Java", topics: ["Array"], minLevel: 3, maxLevel: 5, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/sorts/HeapSort.java", lang: "Java", topics: ["Array"], minLevel: 4, maxLevel: 5, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/searches/BinarySearch.java", lang: "Java", topics: ["Array"], minLevel: 2, maxLevel: 4, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/searches/LinearSearch.java", lang: "Java", topics: ["Array"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/maths/Factorial.java", lang: "Java", topics: ["Methods"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/maths/Fibonacci.java", lang: "Java", topics: ["Methods", "Array"], minLevel: 1, maxLevel: 3, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/maths/GCD.java", lang: "Java", topics: ["Methods"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/maths/PrimeCheck.java", lang: "Java", topics: ["Methods"], minLevel: 1, maxLevel: 3, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/maths/PalindromeNumber.java", lang: "Java", topics: ["Methods", "String"], minLevel: 1, maxLevel: 3, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/maths/Average.java", lang: "Java", topics: ["Array", "Methods"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/strings/ReverseString.java", lang: "Java", topics: ["String"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/strings/Palindrome.java", lang: "Java", topics: ["String"], minLevel: 1, maxLevel: 3, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/strings/Anagram.java", lang: "Java", topics: ["String", "HashMap"], minLevel: 2, maxLevel: 4, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/strings/Rotation.java", lang: "Java", topics: ["String"], minLevel: 2, maxLevel: 3, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/datastructures/lists/SinglyLinkedList.java", lang: "Java", topics: ["ArrayList", "Methods"], minLevel: 3, maxLevel: 5, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/datastructures/stacks/StackArray.java", lang: "Java", topics: ["Array", "Methods"], minLevel: 2, maxLevel: 4, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/datastructures/hashmap/hashing/HashMap.java", lang: "Java", topics: ["HashMap"], minLevel: 3, maxLevel: 5, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/others/TwoPointers.java", lang: "Java", topics: ["Array", "Methods"], minLevel: 2, maxLevel: 4, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/others/SieveOfEratosthenes.java", lang: "Java", topics: ["Array", "Methods"], minLevel: 2, maxLevel: 4, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/others/Dijkstra.java", lang: "Java", topics: ["HashMap", "ArrayList", "Methods"], minLevel: 4, maxLevel: 5, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/dynamicprogramming/LongestCommonSubsequence.java", lang: "Java", topics: ["Array", "String", "Methods"], minLevel: 3, maxLevel: 5, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/dynamicprogramming/Knapsack.java", lang: "Java", topics: ["Array", "Methods"], minLevel: 3, maxLevel: 5, size: "snippet" },
  { repo: "TheAlgorithms/Java", branch: "master", path: "src/main/java/com/thealgorithms/conversions/DecimalToHexadecimal.java", lang: "Java", topics: ["String", "Methods"], minLevel: 2, maxLevel: 4, size: "snippet" },

  { repo: "google/guava", branch: "master", path: "guava/src/com/google/common/base/Strings.java", lang: "Java", topics: ["String", "Methods"], minLevel: 2, maxLevel: 5, size: "codebase" },
  { repo: "google/guava", branch: "master", path: "guava/src/com/google/common/base/Joiner.java", lang: "Java", topics: ["String", "ArrayList", "Methods"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "google/guava", branch: "master", path: "guava/src/com/google/common/base/Splitter.java", lang: "Java", topics: ["String", "ArrayList", "Methods"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "google/guava", branch: "master", path: "guava/src/com/google/common/base/CharMatcher.java", lang: "Java", topics: ["String", "Methods"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "google/guava", branch: "master", path: "guava/src/com/google/common/base/Preconditions.java", lang: "Java", topics: ["Methods"], minLevel: 2, maxLevel: 5, size: "codebase" },
  { repo: "google/guava", branch: "master", path: "guava/src/com/google/common/collect/Lists.java", lang: "Java", topics: ["ArrayList", "Methods"], minLevel: 2, maxLevel: 5, size: "codebase" },
  { repo: "google/guava", branch: "master", path: "guava/src/com/google/common/collect/Sets.java", lang: "Java", topics: ["HashSet", "Methods"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "google/guava", branch: "master", path: "guava/src/com/google/common/collect/Maps.java", lang: "Java", topics: ["HashMap", "Methods"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "google/guava", branch: "master", path: "guava/src/com/google/common/collect/ImmutableList.java", lang: "Java", topics: ["ArrayList", "Methods"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "google/guava", branch: "master", path: "guava/src/com/google/common/collect/Iterables.java", lang: "Java", topics: ["ArrayList", "Methods"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "google/guava", branch: "master", path: "guava/src/com/google/common/primitives/Ints.java", lang: "Java", topics: ["Array", "Methods"], minLevel: 2, maxLevel: 5, size: "codebase" },
  { repo: "google/guava", branch: "master", path: "guava/src/com/google/common/math/IntMath.java", lang: "Java", topics: ["Methods"], minLevel: 3, maxLevel: 5, size: "codebase" },

  { repo: "apache/commons-lang", branch: "master", path: "src/main/java/org/apache/commons/lang3/StringUtils.java", lang: "Java", topics: ["String", "Methods"], minLevel: 2, maxLevel: 5, size: "codebase" },
  { repo: "apache/commons-lang", branch: "master", path: "src/main/java/org/apache/commons/lang3/ArrayUtils.java", lang: "Java", topics: ["Array", "Methods"], minLevel: 2, maxLevel: 5, size: "codebase" },
  { repo: "apache/commons-lang", branch: "master", path: "src/main/java/org/apache/commons/lang3/math/NumberUtils.java", lang: "Java", topics: ["Methods", "String"], minLevel: 2, maxLevel: 4, size: "codebase" },
  { repo: "apache/commons-lang", branch: "master", path: "src/main/java/org/apache/commons/lang3/ObjectUtils.java", lang: "Java", topics: ["Methods"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "apache/commons-lang", branch: "master", path: "src/main/java/org/apache/commons/lang3/RegExUtils.java", lang: "Java", topics: ["String", "Methods"], minLevel: 3, maxLevel: 5, size: "codebase" },

  { repo: "apache/commons-collections", branch: "master", path: "src/main/java/org/apache/commons/collections4/ListUtils.java", lang: "Java", topics: ["ArrayList", "Methods"], minLevel: 2, maxLevel: 5, size: "codebase" },
  { repo: "apache/commons-collections", branch: "master", path: "src/main/java/org/apache/commons/collections4/MapUtils.java", lang: "Java", topics: ["HashMap", "Methods"], minLevel: 2, maxLevel: 5, size: "codebase" },
  { repo: "apache/commons-collections", branch: "master", path: "src/main/java/org/apache/commons/collections4/CollectionUtils.java", lang: "Java", topics: ["ArrayList", "HashSet", "Methods"], minLevel: 3, maxLevel: 5, size: "codebase" },

  { repo: "spring-projects/spring-framework", branch: "main", path: "spring-core/src/main/java/org/springframework/util/StringUtils.java", lang: "Java", topics: ["String", "Methods", "ArrayList"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "spring-projects/spring-framework", branch: "main", path: "spring-core/src/main/java/org/springframework/util/CollectionUtils.java", lang: "Java", topics: ["ArrayList", "HashMap", "HashSet", "Methods"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "spring-projects/spring-framework", branch: "main", path: "spring-core/src/main/java/org/springframework/util/ObjectUtils.java", lang: "Java", topics: ["Array", "Methods", "String"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "spring-projects/spring-framework", branch: "main", path: "spring-core/src/main/java/org/springframework/util/AntPathMatcher.java", lang: "Java", topics: ["String", "Methods", "HashMap"], minLevel: 4, maxLevel: 5, size: "codebase" },

  { repo: "elastic/elasticsearch", branch: "main", path: "server/src/main/java/org/elasticsearch/common/Strings.java", lang: "Java", topics: ["String", "Methods"], minLevel: 3, maxLevel: 5, size: "codebase" },

  { repo: "netty/netty", branch: "4.1", path: "common/src/main/java/io/netty/util/internal/StringUtil.java", lang: "Java", topics: ["String", "Methods", "Array"], minLevel: 3, maxLevel: 5, size: "codebase" },

  { repo: "apache/kafka", branch: "trunk", path: "clients/src/main/java/org/apache/kafka/common/utils/Utils.java", lang: "Java", topics: ["String", "Array", "Methods", "HashMap"], minLevel: 3, maxLevel: 5, size: "codebase" },

  { repo: "google/gson", branch: "main", path: "gson/src/main/java/com/google/gson/Gson.java", lang: "Java", topics: ["Methods", "HashMap", "String"], minLevel: 4, maxLevel: 5, size: "codebase" },

  { repo: "junit-team/junit5", branch: "main", path: "junit-jupiter-api/src/main/java/org/junit/jupiter/api/Assertions.java", lang: "Java", topics: ["Methods", "Array", "String"], minLevel: 3, maxLevel: 5, size: "codebase" },

  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "sorts/bubble_sort.ts", lang: "TypeScript", topics: ["Arrays", "Functions"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "sorts/selection_sort.ts", lang: "TypeScript", topics: ["Arrays", "Functions"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "sorts/insertion_sort.ts", lang: "TypeScript", topics: ["Arrays", "Functions"], minLevel: 1, maxLevel: 3, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "sorts/merge_sort.ts", lang: "TypeScript", topics: ["Arrays", "Functions"], minLevel: 3, maxLevel: 5, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "sorts/quick_sort.ts", lang: "TypeScript", topics: ["Arrays", "Functions"], minLevel: 3, maxLevel: 5, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "search/binary_search.ts", lang: "TypeScript", topics: ["Arrays", "Functions"], minLevel: 2, maxLevel: 4, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "search/linear_search.ts", lang: "TypeScript", topics: ["Arrays", "Functions"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "maths/factorial.ts", lang: "TypeScript", topics: ["Functions"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "maths/fibonacci.ts", lang: "TypeScript", topics: ["Functions", "Arrays"], minLevel: 1, maxLevel: 3, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "maths/is_palindrome.ts", lang: "TypeScript", topics: ["Functions"], minLevel: 1, maxLevel: 3, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "maths/primes.ts", lang: "TypeScript", topics: ["Functions", "Arrays"], minLevel: 2, maxLevel: 4, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "string/reverse_string.ts", lang: "TypeScript", topics: ["Functions"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "string/is_anagram.ts", lang: "TypeScript", topics: ["Functions", "Objects"], minLevel: 2, maxLevel: 4, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "dynamic_programming/knapsack.ts", lang: "TypeScript", topics: ["Arrays", "Functions"], minLevel: 3, maxLevel: 5, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "data_structures/stack/stack.ts", lang: "TypeScript", topics: ["Arrays", "Functions", "Type Basics"], minLevel: 2, maxLevel: 4, size: "snippet" },
  { repo: "TheAlgorithms/TypeScript", branch: "master", path: "data_structures/queue/queue.ts", lang: "TypeScript", topics: ["Arrays", "Functions", "Type Basics"], minLevel: 2, maxLevel: 4, size: "snippet" },

  { repo: "microsoft/vscode", branch: "main", path: "src/vs/base/common/strings.ts", lang: "TypeScript", topics: ["Functions", "Type Basics"], minLevel: 2, maxLevel: 5, size: "codebase" },
  { repo: "microsoft/vscode", branch: "main", path: "src/vs/base/common/arrays.ts", lang: "TypeScript", topics: ["Arrays", "Functions", "Type Basics"], minLevel: 2, maxLevel: 5, size: "codebase" },
  { repo: "microsoft/vscode", branch: "main", path: "src/vs/base/common/objects.ts", lang: "TypeScript", topics: ["Objects", "Functions", "Type Basics"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "microsoft/vscode", branch: "main", path: "src/vs/base/common/types.ts", lang: "TypeScript", topics: ["Type Basics", "Union Types", "Functions"], minLevel: 2, maxLevel: 5, size: "codebase" },
  { repo: "microsoft/vscode", branch: "main", path: "src/vs/base/common/async.ts", lang: "TypeScript", topics: ["Async/Await", "Functions", "Type Basics"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "microsoft/vscode", branch: "main", path: "src/vs/base/common/event.ts", lang: "TypeScript", topics: ["Functions", "Type Basics", "Objects"], minLevel: 4, maxLevel: 5, size: "codebase" },
  { repo: "microsoft/vscode", branch: "main", path: "src/vs/base/common/uri.ts", lang: "TypeScript", topics: ["Functions", "Type Basics", "Objects"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "microsoft/vscode", branch: "main", path: "src/vs/base/common/path.ts", lang: "TypeScript", topics: ["Functions", "Type Basics"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "microsoft/vscode", branch: "main", path: "src/vs/base/common/glob.ts", lang: "TypeScript", topics: ["Functions", "Type Basics"], minLevel: 4, maxLevel: 5, size: "codebase" },
  { repo: "microsoft/vscode", branch: "main", path: "src/vs/base/common/json.ts", lang: "TypeScript", topics: ["Functions", "Type Basics", "Objects"], minLevel: 3, maxLevel: 5, size: "codebase" },

  { repo: "microsoft/TypeScript", branch: "main", path: "src/compiler/core.ts", lang: "TypeScript", topics: ["Functions", "Type Basics", "Arrays", "Objects"], minLevel: 4, maxLevel: 5, size: "codebase" },

  { repo: "angular/angular", branch: "main", path: "packages/common/src/pipes/date_pipe.ts", lang: "TypeScript", topics: ["Functions", "Type Basics", "Objects"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "angular/angular", branch: "main", path: "packages/common/src/pipes/async_pipe.ts", lang: "TypeScript", topics: ["Async/Await", "Functions", "Type Basics"], minLevel: 4, maxLevel: 5, size: "codebase" },

  { repo: "nestjs/nest", branch: "master", path: "packages/common/utils/shared.utils.ts", lang: "TypeScript", topics: ["Functions", "Type Basics", "Objects"], minLevel: 2, maxLevel: 5, size: "codebase" },
  { repo: "nestjs/nest", branch: "master", path: "packages/common/pipes/validation.pipe.ts", lang: "TypeScript", topics: ["Functions", "Type Basics", "Async/Await", "Objects"], minLevel: 3, maxLevel: 5, size: "codebase" },

  { repo: "ReactiveX/rxjs", branch: "master", path: "src/internal/operators/map.ts", lang: "TypeScript", topics: ["Functions", "Type Basics"], minLevel: 3, maxLevel: 5, size: "codebase" },
  { repo: "ReactiveX/rxjs", branch: "master", path: "src/internal/operators/filter.ts", lang: "TypeScript", topics: ["Functions", "Type Basics", "Arrays"], minLevel: 3, maxLevel: 5, size: "codebase" },

  { repo: "colinhacks/zod", branch: "main", path: "src/types.ts", lang: "TypeScript", topics: ["Type Basics", "Union Types", "Functions", "Objects"], minLevel: 3, maxLevel: 5, size: "codebase" },

  { repo: "DefinitelyTyped/DefinitelyTyped", branch: "master", path: "types/lodash/common/array.d.ts", lang: "TypeScript", topics: ["Type Basics", "Arrays", "Functions"], minLevel: 2, maxLevel: 5, size: "codebase" },

  { repo: "lerocha/chinook-database", branch: "master", path: "ChinookDatabase/DataSources/Chinook_Sqlite_AutoIncrementPKs.sql", lang: "SQL", topics: ["SELECT Basics", "WHERE", "JOIN Basics", "GROUP BY", "ORDER BY", "INSERT/UPDATE"], minLevel: 1, maxLevel: 5, size: "codebase" },
  { repo: "datacharmer/test_db", branch: "master", path: "employees.sql", lang: "SQL", topics: ["SELECT Basics", "INSERT/UPDATE", "WHERE"], minLevel: 1, maxLevel: 3, size: "codebase" },
  { repo: "bbrumm/databasestar", branch: "main", path: "sample_databases/sample_db_superheroes/01_create_tables.sql", lang: "SQL", topics: ["SELECT Basics", "INSERT/UPDATE"], minLevel: 1, maxLevel: 3, size: "snippet" },
  { repo: "bbrumm/databasestar", branch: "main", path: "sample_databases/sample_db_superheroes/02_insert_data.sql", lang: "SQL", topics: ["INSERT/UPDATE"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "WebDevSimplified/Learn-SQL", branch: "master", path: "schema.sql", lang: "SQL", topics: ["SELECT Basics", "INSERT/UPDATE"], minLevel: 1, maxLevel: 2, size: "snippet" },
  { repo: "TheAlgorithms/SQL", branch: "main", path: "Window-Functions/dense_rank.sql", lang: "SQL", topics: ["SELECT Basics", "ORDER BY", "GROUP BY"], minLevel: 3, maxLevel: 5, size: "snippet" },
];

/** ランダム選択 — pick random entry matching lang/topic/level */
export function pickRandomEntry(lang: string, topic: string, level: number, size?: CodeSize): CodeEntry | null {
  let pool = GITHUB_CODE_INDEX.filter(
    e => e.lang === lang && e.topics.includes(topic) && level >= e.minLevel && level <= e.maxLevel
      && (!size || e.size === size)
  );

  if (pool.length === 0) {
    pool = GITHUB_CODE_INDEX.filter(e => e.lang === lang && e.topics.includes(topic) && (!size || e.size === size));
  }

  if (pool.length === 0) {
    pool = GITHUB_CODE_INDEX.filter(e => e.lang === lang && (!size || e.size === size));
  }

  if (pool.length === 0) {
    pool = GITHUB_CODE_INDEX.filter(e => e.lang === lang);
  }

  if (pool.length === 0) {
    return null;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
