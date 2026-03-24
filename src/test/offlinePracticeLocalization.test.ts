import * as assert from "assert";
import { localizeOfflinePractice } from "../offlinePracticeLocalization.js";

suite("offlinePracticeLocalization", () => {
  const practice = {
    title: "Sum All Elements",
    task: "Given an integer array `nums`, calculate and print the sum of all elements.",
    hint: "Use a for loop to iterate through the array and add each element to the sum variable.",
    code: "console.log('code');",
    solutionCode: "console.log('solution');",
    expectedOutput: "Sum: 21",
    testCases: [{ input: "nums = [1, 2, 3]", output: "6" }],
    judgeFeedback: {
      summary: "Missing loop to iterate the array.",
      lines: [
        {
          line: 1,
          problem: "Missing loop to iterate the array",
          fix: "Add `for (const n of nums) { total += n; }`",
        },
      ],
    },
    altMethods: [
      {
        name: "Using forEach",
        code: "nums.forEach(() => {});",
        explanation: "This approach uses forEach to visit each element.",
      },
    ],
    crossLang: {
      python: {
        code: "print(sum(nums))",
        highlights: [{ lines: [1], explanation: "Python's built-in `sum()` replaces the manual loop." }],
      },
    },
  };

  test("Turkish localization changes supported prose and keeps runnable fields intact", () => {
    const localized = localizeOfflinePractice(practice, "tr");

    assert.notStrictEqual(localized.title, practice.title);
    assert.notStrictEqual(localized.task, practice.task);
    assert.ok(localized.task.includes("`nums`"));
    assert.ok(/toplam|yazdir/i.test(localized.task));
    assert.strictEqual(localized.code, practice.code);
    assert.strictEqual(localized.solutionCode, practice.solutionCode);
    assert.strictEqual(localized.expectedOutput, practice.expectedOutput);
    assert.deepStrictEqual(localized.testCases, practice.testCases);
    assert.ok(localized.judgeFeedback.lines[0].fix.includes("`for (const n of nums) { total += n; }`"));
  });

  test("Japanese localization translates the sum-all-elements practice", () => {
    const localized = localizeOfflinePractice(practice, "ja");

    assert.strictEqual(localized.title, "すべての要素の合計");
    assert.strictEqual(
      localized.task,
      "整数配列 `nums` が与えられたとき、すべての要素の合計を計算して出力してください。"
    );
    assert.strictEqual(
      localized.hint,
      "for ループで配列を走査し、各要素を `sum` に加算してください。"
    );
    assert.strictEqual(localized.judgeFeedback.summary, "配列を走査するループがありません。");
    assert.strictEqual(localized.altMethods?.[0].name, "forEach の使用");
    assert.strictEqual(
      localized.crossLang?.python.highlights[0].explanation,
      "Python の組み込み `sum()` は手動ループの代わりになります。"
    );
  });

  test("Japanese localization covers max-element practice without falling back to English", () => {
    const localized = localizeOfflinePractice(
      {
        ...practice,
        title: "Find the Maximum Element",
        task: "Given an integer array `nums`, find and print the largest element.",
        hint: "Initialize `max` with the first element, then loop through the rest comparing each element.",
      },
      "ja"
    );

    assert.strictEqual(localized.title, "最大の要素を見つける");
    assert.strictEqual(
      localized.task,
      "整数配列 `nums` が与えられたとき、最大の要素を見つけて出力してください。"
    );
    assert.strictEqual(
      localized.hint,
      "`max` を最初の要素で初期化し、残りの要素を順に比較してください。"
    );
  });

  test("Japanese localization also covers legacy demoData Java practice strings", () => {
    const localized = localizeOfflinePractice(
      {
        ...practice,
        title: "Sum Array Elements",
        task: "Calculate the sum of all elements in the given integer array and print the result.",
        hint: "Use a for-each loop to iterate through the array and add each element to sum.",
      },
      "ja"
    );

    assert.strictEqual(localized.title, "配列要素の合計");
    assert.strictEqual(
      localized.task,
      "与えられた整数配列のすべての要素の合計を計算し、結果を出力してください。"
    );
    assert.strictEqual(
      localized.hint,
      "for-each ループで配列を走査し、各要素を `sum` に加えてください。"
    );
  });

  test("Japanese localization covers legacy TypeScript practice strings", () => {
    const localized = localizeOfflinePractice(
      {
        ...practice,
        title: "Temperature Converter",
        task: "Convert the temperature from Celsius to Fahrenheit using the formula: F = C × 9/5 + 32. Print the result.",
        hint: "Apply the formula: fahrenheit = celsius * 9 / 5 + 32",
      },
      "ja"
    );

    assert.strictEqual(localized.title, "温度変換");
    assert.strictEqual(
      localized.task,
      "式 `F = C × 9/5 + 32` を使って摂氏を華氏に変換し、結果を出力してください。"
    );
    assert.strictEqual(
      localized.hint,
      "式 `fahrenheit = celsius * 9 / 5 + 32` を使ってください。"
    );
  });

  test("Japanese localization covers legacy SQL practice strings", () => {
    const localized = localizeOfflinePractice(
      {
        ...practice,
        title: "Select All Users",
        task: "Write a query to select all columns from the 'users' table.",
        hint: "Use SELECT * FROM table_name to select all columns.",
      },
      "ja"
    );

    assert.strictEqual(localized.title, "すべてのユーザーを取得する");
    assert.strictEqual(
      localized.task,
      "`users` テーブルのすべての列を取得するクエリを書いてください。\n\nテーブル構造:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)"
    );
    assert.strictEqual(
      localized.hint,
      "すべての列を選ぶには `SELECT * FROM table_name` を使ってください。"
    );
  });

  test("Japanese localization handles Kadane task without mixed English text", () => {
    const localized = localizeOfflinePractice(
      {
        ...practice,
        title: "Kadane's Maximum Subarray Sum",
        task: "Given an integer array `nums` (which may contain negative numbers), find and print the maximum sum of any contiguous subarray.",
        hint: "Track two values: the max sum ending at the current position, and the overall max sum seen so far. At each element, decide whether to extend the previous subarray or start a new one.",
      },
      "ja"
    );

    assert.strictEqual(localized.title, "Kadane の最大部分配列和");
    assert.strictEqual(
      localized.task,
      "負の数を含む可能性がある整数配列 `nums` が与えられたとき、連続する部分配列の最大合計を見つけて出力してください。"
    );
    assert.strictEqual(
      localized.hint,
      "2 つの値を追跡してください。現在位置で終わる最大合計と、これまでに見つかった全体の最大合計です。各要素で、前の部分配列を延長するか、新しく開始するかを判断してください。"
    );
    assert.ok(!/\bthe\b|\bof\b|\bfind\b|\bprint\b/i.test(localized.task));
  });

  test("Japanese localization covers advanced TypeScript practice strings", () => {
    const localized = localizeOfflinePractice(
      {
        ...practice,
        title: "Generic Max Function",
        task: "Write a generic function `findMax<T>(arr: T[], compareFn: (a: T, b: T) => number): T` that returns the maximum element in an array using the compareFn. Test with:\n- Numbers [3, 7, 2, 9, 5]\n- Strings [\"banana\", \"apple\", \"cherry\"] (alphabetically last)\n- Objects [{name:\"Alice\",age:30}, {name:\"Bob\",age:25}, {name:\"Charlie\",age:35}] (max age)",
        hint: "Use `<T>` to define a generic type parameter. The compareFn should return a positive number if a > b, negative if a < b, and 0 if equal.",
      },
      "ja"
    );

    assert.strictEqual(localized.title, "ジェネリックな最大値関数");
    assert.notStrictEqual(localized.task, "Write a generic function `findMax<T>(arr: T[], compareFn: (a: T, b: T) => number): T` that returns the maximum element in an array using the compareFn. Test with:\n- Numbers [3, 7, 2, 9, 5]\n- Strings [\"banana\", \"apple\", \"cherry\"] (alphabetically last)\n- Objects [{name:\"Alice\",age:30}, {name:\"Bob\",age:25}, {name:\"Charlie\",age:35}] (max age)");
    assert.ok(localized.task.includes("最大要素"));
    assert.ok(localized.hint.includes("ジェネリック型パラメータ"));
  });

  test("Japanese localization covers advanced SQL practice strings", () => {
    const localized = localizeOfflinePractice(
      {
        ...practice,
        title: "Window Function with JOIN — Rank Orders per User",
        task: "Write a query that shows each user's name, their order product, order amount, and a 'rank' column that ranks each user's orders from highest to lowest amount using RANK(). Only include users who have placed orders.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
        hint: "RANK() is a window function. Use PARTITION BY to rank within each user's orders and ORDER BY amount DESC to rank from highest to lowest.",
      },
      "ja"
    );

    assert.strictEqual(localized.title, "JOIN とウィンドウ関数で注文順位を付ける");
    assert.ok(localized.task.includes("注文商品"));
    assert.ok(localized.task.includes("`RANK()`"));
    assert.ok(localized.hint.includes("`PARTITION BY`"));
  });

  test("Unsupported text stays English instead of becoming mixed language", () => {
    const localized = localizeOfflinePractice(
      {
        ...practice,
        task: "Create a type-safe pipeline that supports map, filter, and reduce over async values.",
      },
      "ja"
    );

    assert.strictEqual(
      localized.task,
      "Create a type-safe pipeline that supports map, filter, and reduce over async values."
    );
  });
});
