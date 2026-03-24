export type PracticeTranslationEntry = {
  source: [title: string, task: string, hint: string];
  target: [title: string, task: string, hint: string];
};

const USERS_SCHEMA = "テーブル構造:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)";
const ORDERS_SCHEMA = "テーブル構造:\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)";
const PRODUCTS_SCHEMA = "テーブル構造:\n  products (id INTEGER, name TEXT, category TEXT, price REAL, stock INTEGER)";
const USERS_ORDERS_SCHEMA = `${USERS_SCHEMA}\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)`;
const USERS_ORDERS_PRODUCTS_SCHEMA = `${USERS_SCHEMA}\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)\n  products (id INTEGER, name TEXT, category TEXT, price REAL, stock INTEGER)`;
const ORDERS_ARCHIVED_SCHEMA = `${ORDERS_SCHEMA}\n  archived_orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)`;
const EMPLOYEES_SCHEMA = "テーブル: employees (id, name, department, salary)";
const NO_TABLE_NEEDED = "このクエリではテーブルは不要です。";
const q = (body: string, schema: string): string => `${body}\n\n${schema}`;

export const JA_PRACTICE_TRANSLATIONS: PracticeTranslationEntry[] = [
  {
    source: [
      "Temperature Converter",
      "Convert the temperature from Celsius to Fahrenheit using the formula: F = C × 9/5 + 32. Print the result.",
      "Apply the formula: fahrenheit = celsius * 9 / 5 + 32",
    ],
    target: [
      "温度変換",
      "式 `F = C × 9/5 + 32` を使って摂氏を華氏に変換し、結果を出力してください。",
      "式 `fahrenheit = celsius * 9 / 5 + 32` を使ってください。",
    ],
  },
  {
    source: [
      "Type Guard Check",
      "Write a function that takes a value of type string | number and returns its length if string, or the number itself if number.",
      "Use typeof to check if the value is a string or number.",
    ],
    target: [
      "型ガードの確認",
      "`string | number` 型の値を受け取り、文字列なら長さを、数値ならその値自身を返す関数を書いてください。",
      "値が string か number かを `typeof` で確認してください。",
    ],
  },
  {
    source: [
      "Double Each Element",
      "Create a new array where each element is doubled. Print the result.",
      "Use the .map() method to transform each element.",
    ],
    target: [
      "各要素を 2 倍にする",
      "各要素を 2 倍にした新しい配列を作成し、結果を出力してください。",
      "各要素を変換するには `.map()` を使ってください。",
    ],
  },
  {
    source: [
      "Find Common Elements",
      "Find and print elements that exist in both arrays.",
      "Use .filter() with .includes() to find common elements.",
    ],
    target: [
      "共通要素を見つける",
      "2 つの配列の両方に存在する要素を見つけて出力してください。",
      "共通要素を見つけるには `.filter()` と `.includes()` を使ってください。",
    ],
  },
  {
    source: [
      "FizzBuzz Function",
      "Implement fizzBuzz: return 'Fizz' if divisible by 3, 'Buzz' if by 5, 'FizzBuzz' if both, otherwise the number as string.",
      "Check divisible by 15 first (both 3 and 5), then 3, then 5.",
    ],
    target: [
      "FizzBuzz 関数",
      "`fizzBuzz` を実装してください。3 で割り切れれば 'Fizz'、5 で割り切れれば 'Buzz'、両方で割り切れれば 'FizzBuzz'、それ以外は数値を文字列として返します。",
      "最初に 15 で割り切れるかを確認し、その後に 3、最後に 5 を確認してください。",
    ],
  },
  {
    source: [
      "Array Flattener",
      "Write a function that flattens a 2D array into a 1D array. Print the result.",
      "Use nested loops or .flat() to flatten the 2D array.",
    ],
    target: [
      "配列の平坦化",
      "2 次元配列を 1 次元配列に平坦化する関数を書き、結果を出力してください。",
      "2 次元配列の平坦化には二重ループまたは `.flat()` を使ってください。",
    ],
  },
  {
    source: [
      "Object Property Counter",
      "Count the number of properties in the object and print the count.",
      "Use Object.keys() to get an array of property names, then check its length.",
    ],
    target: [
      "オブジェクトのプロパティ数",
      "オブジェクトのプロパティ数を数えて出力してください。",
      "`Object.keys()` でプロパティ名の配列を取得し、その長さを確認してください。",
    ],
  },
  {
    source: [
      "Merge Objects",
      "Merge two objects into one. If keys overlap, the second object's values win. Print the result as JSON.",
      "Use the spread operator: { ...obj1, ...obj2 }",
    ],
    target: [
      "オブジェクトをマージする",
      "2 つのオブジェクトを 1 つにマージしてください。キーが重複する場合は 2 つ目のオブジェクトの値を優先し、結果を JSON として出力してください。",
      "スプレッド演算子 `{ ...obj1, ...obj2 }` を使ってください。",
    ],
  },
  {
    source: [
      "Shape Area Calculator",
      "Calculate the area of a circle (type: 'circle', radius) or rectangle (type: 'rect', width, height). Print the area rounded to 2 decimal places.",
      "Use shape.type to discriminate, then access the correct properties.",
    ],
    target: [
      "図形の面積計算",
      "`circle`（radius）または `rect`（width, height）の面積を計算し、小数第 2 位まで丸めて出力してください。",
      "`shape.type` で分岐し、対応するプロパティを参照してください。",
    ],
  },
  {
    source: [
      "Result Type Handler",
      "Process a Result type that is either { ok: true, value: number } or { ok: false, error: string }. Print the value or error message.",
      "Check r.ok to narrow the type, then access value or error.",
    ],
    target: [
      "Result 型の処理",
      "`{ ok: true, value: number }` または `{ ok: false, error: string }` の Result 型を処理し、値またはエラーメッセージを出力してください。",
      "`r.ok` を確認して型を絞り込み、その後で `value` または `error` にアクセスしてください。",
    ],
  },
  {
    source: [
      "Select All Users",
      "Write a query to select all columns from the 'users' table.",
      "Use SELECT * FROM table_name to select all columns.",
    ],
    target: [
      "すべてのユーザーを取得する",
      "`users` テーブルのすべての列を取得するクエリを書いてください。\n\nテーブル構造:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "すべての列を選ぶには `SELECT * FROM table_name` を使ってください。",
    ],
  },
  {
    source: [
      "Select Specific Columns",
      "Select only the 'name' and 'age' columns from the 'users' table, ordered by age descending.",
      "List column names after SELECT, use ORDER BY column DESC.",
    ],
    target: [
      "特定の列を取得する",
      "`users` テーブルから `name` と `age` 列だけを取得し、年齢の降順で並べるクエリを書いてください。\n\nテーブル構造:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "`SELECT` の後に列名を並べ、並び替えには `ORDER BY column DESC` を使ってください。",
    ],
  },
  {
    source: [
      "Filter by Age",
      "Select users who are older than 25.",
      "Use WHERE clause with a comparison operator.",
    ],
    target: [
      "年齢で絞り込む",
      "25 歳より上のユーザーを取得するクエリを書いてください。\n\nテーブル構造:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "比較演算子を使った `WHERE` 句を利用してください。",
    ],
  },
  {
    source: [
      "Multiple Conditions",
      "Select users who are between 25 and 35 years old AND live in 'Tokyo'.",
      "Use BETWEEN for range and AND to combine conditions.",
    ],
    target: [
      "複数条件の絞り込み",
      "25 歳以上 35 歳以下で、かつ `Tokyo` に住んでいるユーザーを取得するクエリを書いてください。\n\nテーブル構造:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "範囲指定には `BETWEEN`、条件の結合には `AND` を使ってください。",
    ],
  },
  {
    source: [
      "Inner Join Users and Orders",
      "Join the 'users' and 'orders' tables to show user names with their ordered products.",
      "Use JOIN ... ON to connect tables by their foreign key relationship.",
    ],
    target: [
      "users と orders の内部結合",
      `\`users\` テーブルと \`orders\` テーブルを結合し、ユーザー名と注文商品を表示するクエリを書いてください。\n\n${USERS_ORDERS_SCHEMA}`,
      "外部キーの関係でテーブルを結ぶには `JOIN ... ON` を使ってください。",
    ],
  },
  {
    source: [
      "Left Join with Null Check",
      "Show all users and their orders. Users without orders should show NULL for the product.",
      "Use LEFT JOIN to include all rows from the left table.",
    ],
    target: [
      "LEFT JOIN と NULL 確認",
      `すべてのユーザーとその注文を表示するクエリを書いてください。注文がないユーザーは product が \`NULL\` になるようにしてください。\n\n${USERS_ORDERS_SCHEMA}`,
      "左側テーブルの全行を残すには `LEFT JOIN` を使ってください。",
    ],
  },
  {
    source: [
      "Count Users per City",
      "Count the number of users in each city.",
      "Use GROUP BY with COUNT(*) aggregate function.",
    ],
    target: [
      "都市ごとのユーザー数",
      `各都市のユーザー数を数えるクエリを書いてください。\n\n${USERS_SCHEMA}`,
      "`GROUP BY` と集約関数 `COUNT(*)` を使ってください。",
    ],
  },
  {
    source: [
      "Total Spending per User",
      "Calculate the total order amount per user. Only show users who spent more than 500.",
      "Use HAVING (not WHERE) to filter on aggregate results.",
    ],
    target: [
      "ユーザーごとの合計支出",
      `ユーザーごとの注文金額合計を計算し、500 を超えたユーザーだけを表示するクエリを書いてください。\n\n${USERS_ORDERS_SCHEMA}`,
      "集約結果を絞り込むときは `WHERE` ではなく `HAVING` を使ってください。",
    ],
  },
  {
    source: [
      "Sort by Name",
      "Select all users and sort them alphabetically by name.",
      "Add ORDER BY column_name at the end of your query.",
    ],
    target: [
      "名前順で並べ替える",
      `すべてのユーザーを取得し、名前のアルファベット順で並べるクエリを書いてください。\n\n${USERS_SCHEMA}`,
      "クエリの末尾に `ORDER BY column_name` を追加してください。",
    ],
  },
  {
    source: [
      "Top 3 Expensive Orders",
      "Select the top 3 orders with the highest amounts.",
      "Use ORDER BY ... DESC with LIMIT to get top N results.",
    ],
    target: [
      "高額注文トップ 3",
      `金額が最も高い注文を上位 3 件取得するクエリを書いてください。\n\n${ORDERS_SCHEMA}`,
      "上位 N 件を取得するには `ORDER BY ... DESC` と `LIMIT` を組み合わせてください。",
    ],
  },
  {
    source: [
      "Typed Variables",
      "Declare three typed variables: a string called `greeting` with value \"Hello, TypeScript!\", a number called `year` with value 2026, and a boolean called `isActive` with value true. Print each variable on its own line.",
      "Use the syntax `const variableName: type = value;` to declare typed variables. TypeScript's basic types include string, number, and boolean.",
    ],
    target: [
      "型付き変数",
      "型付き変数を 3 つ宣言してください。`greeting` という文字列に \"Hello, TypeScript!\"、`year` という数値に 2026、`isActive` という真偽値に true を代入し、それぞれを別の行に出力してください。",
      "型付き変数の宣言には `const variableName: type = value;` を使います。TypeScript の基本型には string、number、boolean があります。",
    ],
  },
  {
    source: [
      "Typed Array",
      "Create a typed array of numbers called `scores` containing [85, 92, 78, 95, 88]. Print each element on its own line using a for...of loop, then print the length of the array.",
      "Declare an array with type annotation `number[]` or `Array<number>`. Use a `for...of` loop to iterate over elements.",
    ],
    target: [
      "型付き配列",
      "[85, 92, 78, 95, 88] を持つ `scores` という型付き数値配列を作成してください。`for...of` ループで各要素を 1 行ずつ出力し、その後で配列の長さも出力してください。",
      "配列は `number[]` または `Array<number>` の型注釈で宣言できます。要素の走査には `for...of` ループを使ってください。",
    ],
  },
  {
    source: [
      "Person Interface",
      "Create an interface called `Person` with properties: name (string), age (number), and email (string). Create two Person objects — one for Alice (age 30, alice@example.com) and one for Bob (age 25, bob@example.com). Print each person's info in the format: \"Name: <name>, Age: <age>, Email: <email>\".",
      "Define an interface using `interface Name { prop: type; }`. Create objects that match the interface shape and use template literals for formatted output.",
    ],
    target: [
      "Person インターフェース",
      "`name`（string）、`age`（number）、`email`（string）を持つ `Person` インターフェースを作成してください。Alice（30 歳, alice@example.com）と Bob（25 歳, bob@example.com）の 2 つの Person オブジェクトを作り、`\"Name: <name>, Age: <age>, Email: <email>\"` の形式で出力してください。",
      "インターフェースは `interface Name { prop: type; }` の形で定義します。オブジェクトはその形に合わせ、整形出力にはテンプレートリテラルを使ってください。",
    ],
  },
  {
    source: [
      "Enum Days of Week",
      "Create an enum called `Day` with values Monday through Sunday. Create a function `isWeekend(day: Day): boolean` that returns true for Saturday and Sunday. Test it with Monday, Friday, Saturday, and Sunday, printing the day name and whether it is a weekend in the format: \"Monday: false\", etc.",
      "Define an enum with `enum Name { Value1, Value2, ... }`. Access values with `Name.Value`. Compare using `===`.",
    ],
    target: [
      "曜日 enum",
      "Monday から Sunday までの値を持つ `Day` という enum を作成してください。Saturday と Sunday のときに true を返す `isWeekend(day: Day): boolean` 関数も作成し、Monday、Friday、Saturday、Sunday でテストして `\"Monday: false\"` の形式で出力してください。",
      "enum は `enum Name { Value1, Value2, ... }` の形で定義します。値へのアクセスは `Name.Value`、比較には `===` を使ってください。",
    ],
  },
  {
    source: [
      "String or Number Function",
      "Create a function `formatValue(value: string | number): string` that returns \"String: <value>\" if the value is a string, or \"Number: <value>\" if the value is a number. Test it with the values \"hello\", 42, \"world\", and 100, printing each result.",
      "Use `typeof` to check if a value is a string or number at runtime. The union type `string | number` allows either type as input.",
    ],
    target: [
      "文字列または数値の関数",
      "値が文字列なら `\"String: <value>\"`、数値なら `\"Number: <value>\"` を返す `formatValue(value: string | number): string` 関数を作成してください。`\"hello\"`、42、`\"world\"`、100 でテストし、それぞれの結果を出力してください。",
      "実行時には `typeof` を使って string か number かを確認します。`string | number` の union 型で両方を受け取れます。",
    ],
  },
  {
    source: [
      "Literal Type Directions",
      "Create a type `Direction` as a union of literal types: \"north\", \"south\", \"east\", \"west\". Write a function `move(direction: Direction): string` that returns \"Moving <direction>\". Test with all four directions.",
      "Use `type Name = \"value1\" | \"value2\"` to create a union of string literal types. This restricts the parameter to only those exact strings.",
    ],
    target: [
      "Direction リテラル型",
      "\"north\"、\"south\"、\"east\"、\"west\" のリテラル型 union として `Direction` 型を作成してください。`\"Moving <direction>\"` を返す `move(direction: Direction): string` 関数を書き、4 方向すべてでテストしてください。",
      "文字列リテラル union の作成には `type Name = \"value1\" | \"value2\"` を使います。これで引数をその文字列だけに制限できます。",
    ],
  },
  {
    source: [
      "Type Narrowing with typeof",
      "Create a function `describe(value: string | number | boolean): string` that returns:\n- For strings: \"Text with <length> characters\"\n- For numbers: \"Number is <even/odd>\"\n- For booleans: \"Boolean is <true/false>\"\nTest with \"hello\", 7, true, and 42.",
      "Use `typeof value === \"string\"` to narrow the type. Inside each branch, TypeScript knows the exact type, giving you access to type-specific properties like `.length`.",
    ],
    target: [
      "typeof による型の絞り込み",
      "次を返す `describe(value: string | number | boolean): string` 関数を作成してください。\n- 文字列: `\"Text with <length> characters\"`\n- 数値: `\"Number is <even/odd>\"`\n- 真偽値: `\"Boolean is <true/false>\"`\n`\"hello\"`、7、true、42 でテストしてください。",
      "`typeof value === \"string\"` のようにして型を絞り込んでください。各分岐内では TypeScript が正しい型を認識するので、`.length` のような型固有のプロパティが使えます。",
    ],
  },
  {
    source: [
      "Discriminated Unions with Shapes",
      "Create discriminated union types for shapes:\n- `Circle` with kind: \"circle\" and radius: number\n- `Rectangle` with kind: \"rectangle\", width: number, height: number\n- `Triangle` with kind: \"triangle\", base: number, height: number\nWrite a function `area(shape: Shape): number` that calculates the area (use Math.PI for circle, round to 2 decimal places with toFixed). Print the area for a circle (radius 5), rectangle (3x4), and triangle (6, height 4).",
      "A discriminated union uses a common property (like `kind`) with literal types to distinguish between variants. Use a switch statement on the discriminant property.",
    ],
    target: [
      "図形の判別共用体",
      "図形の判別共用体型を作成してください。\n- `Circle`: `kind: \"circle\"`, `radius: number`\n- `Rectangle`: `kind: \"rectangle\"`, `width: number`, `height: number`\n- `Triangle`: `kind: \"triangle\"`, `base: number`, `height: number`\n面積を計算する `area(shape: Shape): number` 関数を書き、円（半径 5）、長方形（3x4）、三角形（底辺 6, 高さ 4）の面積を出力してください。円は `Math.PI` を使い、結果は `toFixed` で小数第 2 位までにしてください。",
      "判別共用体では `kind` のような共通プロパティのリテラル値で型を区別します。判別用プロパティに対して `switch` を使ってください。",
    ],
  },
  {
    source: [
      "Calculate Rectangle Area",
      "Write a typed function `calculateArea(width: number, height: number): number` that returns the area of a rectangle. Test it with dimensions (5, 3), (10, 7), and (4.5, 2.0). Print each result in the format: \"Area of 5x3 = 15\".",
      "Define a function with typed parameters and a return type annotation. Multiply width by height.",
    ],
    target: [
      "長方形の面積を計算する",
      "長方形の面積を返す型付き関数 `calculateArea(width: number, height: number): number` を書いてください。(5, 3)、(10, 7)、(4.5, 2.0) でテストし、`\"Area of 5x3 = 15\"` の形式で結果を出力してください。",
      "引数と戻り値に型注釈を付け、`width * height` を計算してください。",
    ],
  },
  {
    source: [
      "Optional and Default Parameters",
      "Write a function `greet(name: string, greeting?: string, punctuation: string = \"!\")` that returns a greeting string. If greeting is not provided, use \"Hello\". Test with:\n- greet(\"Alice\") => \"Hello Alice!\"\n- greet(\"Bob\", \"Hi\") => \"Hi Bob!\"\n- greet(\"Charlie\", \"Hey\", \".\") => \"Hey Charlie.\"",
      "Use `?` after a parameter name to make it optional. Use `= value` to set a default. The nullish coalescing operator `??` provides a fallback for undefined values.",
    ],
    target: [
      "オプショナル引数とデフォルト引数",
      "挨拶文を返す `greet(name: string, greeting?: string, punctuation: string = \"!\")` 関数を書いてください。`greeting` が渡されない場合は `\"Hello\"` を使います。次でテストしてください。\n- `greet(\"Alice\")` => `\"Hello Alice!\"`\n- `greet(\"Bob\", \"Hi\")` => `\"Hi Bob!\"`\n- `greet(\"Charlie\", \"Hey\", \".\")` => `\"Hey Charlie.\"`",
      "オプショナル引数には引数名の後ろに `?` を付け、デフォルト値には `= value` を使います。`??` は undefined のときのフォールバックに使えます。",
    ],
  },
  {
    source: [
      "Select All Columns from Users",
      "Write a query that retrieves all columns and all rows from the `users` table.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use SELECT * to select every column from a table.",
    ],
    target: [
      "users から全列を取得する",
      q("`users` テーブルの全列と全行を取得するクエリを書いてください。", USERS_SCHEMA),
      "テーブルのすべての列を選ぶには `SELECT *` を使ってください。",
    ],
  },
  {
    source: [
      "Select Specific Columns",
      "Write a query that retrieves only the name and email columns from the `users` table.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "List the column names you want separated by commas after SELECT.",
    ],
    target: [
      "特定の列を取得する",
      q("`users` テーブルから `name` 列と `email` 列だけを取得するクエリを書いてください。", USERS_SCHEMA),
      "`SELECT` の後に、取得したい列名をカンマ区切りで並べてください。",
    ],
  },
  {
    source: [
      "Select Distinct Cities",
      "Write a query that retrieves a list of unique cities from the `users` table. Each city should appear only once in the results.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use the DISTINCT keyword after SELECT to eliminate duplicate values.",
    ],
    target: [
      "重複しない都市一覧",
      q("`users` テーブルから重複しない都市一覧を取得するクエリを書いてください。各都市は結果に 1 回だけ現れるようにしてください。", USERS_SCHEMA),
      "重複を除くには `SELECT` の後に `DISTINCT` を使ってください。",
    ],
  },
  {
    source: [
      "Select with Column Aliases",
      "Write a query that selects the name column as 'user_name' and the email column as 'contact_email' from the `users` table.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use the AS keyword to rename a column in the output: column_name AS alias_name.",
    ],
    target: [
      "列エイリアス付き SELECT",
      q("`users` テーブルから `name` 列を `user_name`、`email` 列を `contact_email` として取得するクエリを書いてください。", USERS_SCHEMA),
      "出力列名を変えるには `column_name AS alias_name` の形で `AS` を使ってください。",
    ],
  },
  {
    source: [
      "Select with CASE Expression",
      "Write a query that selects the name and age from the `users` table, and adds a column called 'age_group' that categorizes users as:\n  - 'Young' if age < 25\n  - 'Adult' if age >= 25 AND age < 40\n  - 'Senior' if age >= 40\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use a CASE WHEN ... THEN ... ELSE ... END expression to create conditional output.",
    ],
    target: [
      "CASE 式付き SELECT",
      q("`users` テーブルから `name` と `age` を取得し、`age_group` という列を追加してください。分類条件は次のとおりです。\n  - age < 25 の場合は `Young`\n  - age >= 25 AND age < 40 の場合は `Adult`\n  - age >= 40 の場合は `Senior`", USERS_SCHEMA),
      "条件分岐による出力を作るには `CASE WHEN ... THEN ... ELSE ... END` を使ってください。",
    ],
  },
  {
    source: [
      "Select with String Concatenation",
      "Write a query that selects a column called 'user_info' that combines each user's name and city in the format: 'Name (City)'. For example: 'Alice (New York)'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "In SQLite, use the || operator to concatenate strings together.",
    ],
    target: [
      "文字列連結付き SELECT",
      q("各ユーザーの名前と都市を `Name (City)` 形式で結合した `user_info` 列を取得するクエリを書いてください。例: `Alice (New York)`", USERS_SCHEMA),
      "SQLite で文字列を連結するには `||` 演算子を使ってください。",
    ],
  },
  {
    source: [
      "Filter Users by Age",
      "Write a query that selects all columns from the `users` table where the user's age is greater than 25.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Add a WHERE clause after FROM to filter rows: WHERE age > 25.",
    ],
    target: [
      "年齢でユーザーを絞り込む",
      q("`users` テーブルから、年齢が 25 より大きいユーザーの全列を取得するクエリを書いてください。", USERS_SCHEMA),
      "行を絞り込むには `FROM` の後に `WHERE` 句を追加します。例: `WHERE age > 25`",
    ],
  },
  {
    source: [
      "Filter Users by City",
      "Write a query that selects the name and email of all users who live in 'New York'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use WHERE city = 'New York' to filter by a specific text value. Remember to use single quotes around text values.",
    ],
    target: [
      "都市でユーザーを絞り込む",
      q("`New York` に住んでいるすべてのユーザーの `name` と `email` を取得するクエリを書いてください。", USERS_SCHEMA),
      "特定の文字列で絞り込むには `WHERE city = 'New York'` を使ってください。文字列はシングルクォートで囲みます。",
    ],
  },
  {
    source: [
      "Filter with AND/OR Conditions",
      "Write a query that selects all columns from the `users` table where the user's age is greater than 20 AND the city is either 'New York' OR 'London'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use AND to combine conditions and OR for alternatives. Use parentheses to group the OR conditions.",
    ],
    target: [
      "AND/OR 条件で絞り込む",
      q("`users` テーブルから、年齢が 20 より大きく、かつ都市が `New York` または `London` のユーザーの全列を取得するクエリを書いてください。", USERS_SCHEMA),
      "条件の結合には `AND`、選択肢には `OR` を使います。`OR` 条件は括弧でまとめてください。",
    ],
  },
  {
    source: [
      "Filter with IN Operator",
      "Write a query that selects the name and city from the `users` table where the city is one of: 'New York', 'London', or 'Tokyo'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use the IN operator followed by a parenthesized list of values: WHERE column IN ('value1', 'value2', 'value3').",
    ],
    target: [
      "IN 演算子で絞り込む",
      q("`users` テーブルから、都市が `New York`、`London`、`Tokyo` のいずれかであるユーザーの `name` と `city` を取得するクエリを書いてください。", USERS_SCHEMA),
      "`IN` 演算子と値のリストを使います。例: `WHERE column IN ('value1', 'value2', 'value3')`",
    ],
  },
  {
    source: [
      "Filter with LIKE Pattern Matching",
      "Write a query that selects the name and email from the `users` table where the email ends with '@gmail.com'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use LIKE with the % wildcard. % matches any sequence of characters. To find emails ending with a pattern, put % at the beginning.",
    ],
    target: [
      "LIKE パターンで絞り込む",
      q("`users` テーブルから、email が `@gmail.com` で終わるユーザーの `name` と `email` を取得するクエリを書いてください。", USERS_SCHEMA),
      "`LIKE` と `%` ワイルドカードを使ってください。末尾一致を探す場合は `%` を先頭に置きます。",
    ],
  },
  {
    source: [
      "Filter with BETWEEN and NOT",
      "Write a query that selects the name and age from the `users` table where the age is NOT between 20 and 30 (inclusive). This should return users younger than 20 or older than 30.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "BETWEEN checks if a value is within a range (inclusive). Add NOT before BETWEEN to exclude that range.",
    ],
    target: [
      "BETWEEN と NOT で絞り込む",
      q("`users` テーブルから、年齢が 20 以上 30 以下ではないユーザーの `name` と `age` を取得するクエリを書いてください。つまり 20 歳未満または 30 歳超のユーザーを返します。", USERS_SCHEMA),
      "`BETWEEN` は範囲内かどうかを判定します。範囲外を取りたい場合は `BETWEEN` の前に `NOT` を付けてください。",
    ],
  },
  {
    source: [
      "Inner Join Users and Orders",
      "Write a query that joins the `users` and `orders` tables to show each user's name alongside their order product and amount. Use an INNER JOIN.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
      "Use INNER JOIN with the ON clause to specify how the tables are related: users.id = orders.user_id.",
    ],
    target: [
      "users と orders の INNER JOIN",
      q("`users` テーブルと `orders` テーブルを INNER JOIN し、各ユーザーの名前・注文商品・金額を表示するクエリを書いてください。", USERS_ORDERS_SCHEMA),
      "テーブルの結合条件は `ON` 句で指定します。例: `users.id = orders.user_id`",
    ],
  },
  {
    source: [
      "Left Join Users and Orders",
      "Write a query that performs a LEFT JOIN between `users` and `orders` to show all users, including those who have never placed an order. Select the user's name, order product, and amount.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
      "LEFT JOIN keeps all rows from the left table (users) even if there is no matching row in the right table (orders).",
    ],
    target: [
      "users と orders の LEFT JOIN",
      q("`users` と `orders` を LEFT JOIN し、注文したことがないユーザーも含めて全ユーザーを表示するクエリを書いてください。取得する列はユーザー名・商品名・金額です。", USERS_ORDERS_SCHEMA),
      "`LEFT JOIN` は、右側に一致する行がなくても左側テーブル（users）の全行を残します。",
    ],
  },
  {
    source: [
      "Join Three Tables",
      "Write a query that joins `users`, `orders`, and `products` to show the user's name, the product name from the products table, and the order amount. Match orders.product to products.name.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)\n  products (id INTEGER, name TEXT, category TEXT, price REAL, stock INTEGER)",
      "Chain multiple JOIN clauses. First join orders with users on user_id, then join with products by matching the product name.",
    ],
    target: [
      "3 つのテーブルを結合する",
      q("`users`、`orders`、`products` を結合し、ユーザー名・products テーブルの商品名・注文金額を表示するクエリを書いてください。`orders.product` と `products.name` を対応付けてください。", USERS_ORDERS_PRODUCTS_SCHEMA),
      "複数の `JOIN` を連ねてください。まず orders と users を `user_id` で結合し、その後に商品名で products と結合します。",
    ],
  },
  {
    source: [
      "Subquery Instead of Self-Join",
      "Write a query that finds users who live in the same city as the user named 'Alice'. Do not include Alice herself in the results. Select name and city.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use a subquery in the WHERE clause to first find Alice's city, then find other users in that city.",
    ],
    target: [
      "自己結合の代わりにサブクエリを使う",
      q("`Alice` と同じ都市に住むユーザーを見つけるクエリを書いてください。Alice 自身は結果に含めず、`name` と `city` を取得してください。", USERS_SCHEMA),
      "`WHERE` 句のサブクエリで先に Alice の都市を取得し、その都市に住む他のユーザーを探してください。",
    ],
  },
  {
    source: [
      "Join with Aggregate — Total Spending",
      "Write a query that shows each user's name and their total spending (sum of order amounts). Only include users who have placed orders. Name the total column 'total_spent'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
      "Join users and orders, then use GROUP BY with SUM() to calculate total spending per user.",
    ],
    target: [
      "集計付き JOIN — 合計支出",
      q("各ユーザーの名前と総支出（注文金額の合計）を表示するクエリを書いてください。注文したことのあるユーザーだけを含め、合計列名は `total_spent` にしてください。", USERS_ORDERS_SCHEMA),
      "users と orders を結合し、`GROUP BY` と `SUM()` でユーザーごとの合計支出を計算してください。",
    ],
  },
  {
    source: [
      "Join with HAVING Clause",
      "Write a query that shows each user's name and their order count, but only for users who have placed more than 2 orders. Name the count column 'order_count'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
      "Use HAVING after GROUP BY to filter groups. HAVING is like WHERE but for aggregated results.",
    ],
    target: [
      "HAVING 句付き JOIN",
      q("各ユーザーの名前と注文数を表示するクエリを書いてください。ただし 2 件より多く注文したユーザーだけを対象とし、件数列名は `order_count` にしてください。", USERS_ORDERS_SCHEMA),
      "グループを絞り込むには `GROUP BY` の後で `HAVING` を使います。`HAVING` は集計結果用の `WHERE` のようなものです。",
    ],
  },
  {
    source: [
      "Count Users Per City",
      "Write a query that counts the number of users in each city. Select the city and the count, naming the count column 'user_count'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use GROUP BY to group rows by city, and COUNT(*) to count the number of rows in each group.",
    ],
    target: [
      "都市ごとのユーザー数",
      q("各都市のユーザー数を数えるクエリを書いてください。取得する列は `city` と件数で、件数列名は `user_count` にしてください。", USERS_SCHEMA),
      "都市ごとに行をまとめるには `GROUP BY`、各グループの行数を数えるには `COUNT(*)` を使ってください。",
    ],
  },
  {
    source: [
      "Average Age Per City",
      "Write a query that calculates the average age of users in each city. Select the city and the average age, naming it 'avg_age'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use the AVG() aggregate function with GROUP BY to compute the average per group.",
    ],
    target: [
      "都市ごとの平均年齢",
      q("各都市のユーザー平均年齢を計算するクエリを書いてください。取得する列は `city` と平均年齢で、平均列名は `avg_age` にしてください。", USERS_SCHEMA),
      "グループごとの平均を求めるには `GROUP BY` と集約関数 `AVG()` を使ってください。",
    ],
  },
  {
    source: [
      "Count Orders Per User with HAVING",
      "Write a query that counts orders per user and only shows users with at least 2 orders. Join users and orders, then select user name and order count (named 'order_count').\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
      "After GROUP BY, use HAVING to filter groups based on aggregate values. HAVING COUNT(*) >= 2 keeps only groups with at least 2 rows.",
    ],
    target: [
      "HAVING 付きユーザー別注文数",
      q("ユーザーごとの注文数を数え、2 件以上注文したユーザーだけを表示するクエリを書いてください。users と orders を結合し、ユーザー名と `order_count` を取得してください。", USERS_ORDERS_SCHEMA),
      "`GROUP BY` の後に `HAVING` を使うと、集計値でグループを絞り込めます。`HAVING COUNT(*) >= 2` なら 2 行以上のグループだけ残ります。",
    ],
  },
  {
    source: [
      "Sum and Average with GROUP BY",
      "Write a query that shows each product category with the total stock (named 'total_stock') and average price (named 'avg_price') from the `products` table.\n\nTable structure:\n  products (id INTEGER, name TEXT, category TEXT, price REAL, stock INTEGER)",
      "You can use multiple aggregate functions in a single SELECT. Group by category to see aggregates per category.",
    ],
    target: [
      "GROUP BY で合計と平均を求める",
      q("`products` テーブルから、各カテゴリごとの総在庫数（`total_stock`）と平均価格（`avg_price`）を表示するクエリを書いてください。", PRODUCTS_SCHEMA),
      "1 つの `SELECT` で複数の集約関数を使えます。カテゴリごとに集計するには `GROUP BY category` を使ってください。",
    ],
  },
  {
    source: [
      "Multiple Aggregations in One Query",
      "Write a query that shows each city with:\n  - the number of users (as 'user_count')\n  - the youngest age (as 'min_age')\n  - the oldest age (as 'max_age')\n  - the average age rounded to 1 decimal (as 'avg_age')\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use COUNT, MIN, MAX, and AVG aggregate functions together. ROUND(value, 1) rounds to 1 decimal place.",
    ],
    target: [
      "1 クエリで複数集計",
      q("各都市について次を表示するクエリを書いてください。\n  - ユーザー数（`user_count`）\n  - 最小年齢（`min_age`）\n  - 最大年齢（`max_age`）\n  - 小数第 1 位まで丸めた平均年齢（`avg_age`）", USERS_SCHEMA),
      "`COUNT`、`MIN`、`MAX`、`AVG` を一緒に使ってください。`ROUND(value, 1)` で小数第 1 位に丸められます。",
    ],
  },
  {
    source: [
      "GROUP BY with CASE Categories",
      "Write a query that categorizes products into price ranges and counts how many products fall into each range:\n  - 'Budget' if price < 20\n  - 'Mid-Range' if price >= 20 AND price < 50\n  - 'Premium' if price >= 50\nName the category column 'price_range' and the count column 'product_count'.\n\nTable structure:\n  products (id INTEGER, name TEXT, category TEXT, price REAL, stock INTEGER)",
      "Use a CASE expression to create categories, then GROUP BY that expression or its alias.",
    ],
    target: [
      "CASE 分類付き GROUP BY",
      q("商品を価格帯に分類し、各価格帯に属する商品数を数えるクエリを書いてください。\n  - price < 20 の場合 `Budget`\n  - price >= 20 AND price < 50 の場合 `Mid-Range`\n  - price >= 50 の場合 `Premium`\n分類列名は `price_range`、件数列名は `product_count` にしてください。", PRODUCTS_SCHEMA),
      "`CASE` 式でカテゴリを作り、その式またはエイリアスで `GROUP BY` してください。",
    ],
  },
  {
    source: [
      "Sort Users by Name Alphabetically",
      "Write a query that selects all columns from the `users` table and sorts the results by name in alphabetical (ascending) order.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use ORDER BY column_name ASC for ascending order. ASC is the default and can be omitted.",
    ],
    target: [
      "ユーザーを名前順に並べる",
      q("`users` テーブルの全列を取得し、名前のアルファベット昇順で並べるクエリを書いてください。", USERS_SCHEMA),
      "昇順ソートには `ORDER BY column_name ASC` を使います。`ASC` は省略してもかまいません。",
    ],
  },
  {
    source: [
      "Sort Orders by Amount Descending",
      "Write a query that selects the product and amount from the `orders` table, sorted by amount from highest to lowest.\n\nTable structure:\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
      "Use ORDER BY column_name DESC for descending order (highest to lowest).",
    ],
    target: [
      "注文を金額降順で並べる",
      q("`orders` テーブルから `product` と `amount` を取得し、金額の高い順に並べるクエリを書いてください。", ORDERS_SCHEMA),
      "降順ソートには `ORDER BY column_name DESC` を使います。",
    ],
  },
  {
    source: [
      "Sort with Multiple Columns",
      "Write a query that selects the name, city, and age from the `users` table, sorted first by city in ascending order, and then by age in descending order within each city.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "You can sort by multiple columns by separating them with commas in ORDER BY. Each column can have its own ASC or DESC.",
    ],
    target: [
      "複数列で並べ替える",
      q("`users` テーブルから `name`、`city`、`age` を取得し、まず `city` を昇順で、その後に各都市内で `age` を降順に並べるクエリを書いてください。", USERS_SCHEMA),
      "`ORDER BY` で列をカンマ区切りにすると複数列でソートできます。各列ごとに `ASC` / `DESC` を指定できます。",
    ],
  },
  {
    source: [
      "Sort with LIMIT and OFFSET",
      "Write a query that selects the name and age from the `users` table, sorted by age descending, and returns only the 3rd and 4th oldest users (skip the first 2, take the next 2).\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "LIMIT restricts the number of rows returned. OFFSET skips a number of rows before starting to return results. LIMIT 2 OFFSET 2 skips 2 rows and returns the next 2.",
    ],
    target: [
      "LIMIT と OFFSET で並べ替える",
      q("`users` テーブルから `name` と `age` を取得し、年齢の降順で並べたうえで 3 番目と 4 番目に高齢のユーザーだけを返すクエリを書いてください（最初の 2 行を飛ばして次の 2 行を取得）。", USERS_SCHEMA),
      "`LIMIT` は返す行数を制限し、`OFFSET` は先頭から何行飛ばすかを指定します。`LIMIT 2 OFFSET 2` は 2 行飛ばして次の 2 行を返します。",
    ],
  },
  {
    source: [
      "Insert a New User",
      "Write an INSERT statement to add a new user with the following values:\n  - name: 'Charlie'\n  - email: 'charlie@example.com'\n  - age: 28\n  - city: 'Berlin'\n\nTable structure:\n  users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, age INTEGER, city TEXT)\n\nNote: The id column auto-increments, so do not include it.",
      "Use INSERT INTO table_name (columns) VALUES (values) to add a new row.",
    ],
    target: [
      "新しいユーザーを追加する",
      "次の値を持つ新しいユーザーを追加する `INSERT` 文を書いてください。\n  - name: 'Charlie'\n  - email: 'charlie@example.com'\n  - age: 28\n  - city: 'Berlin'\n\nテーブル構造:\n  users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, age INTEGER, city TEXT)\n\n注: id 列は自動採番なので含めないでください。",
      "新しい行を追加するには `INSERT INTO table_name (columns) VALUES (values)` を使ってください。",
    ],
  },
  {
    source: [
      "Update User City",
      "Write an UPDATE statement to change the city of the user named 'Alice' to 'Paris'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use UPDATE table SET column = value WHERE condition to modify existing rows.",
    ],
    target: [
      "ユーザーの都市を更新する",
      q("`Alice` という名前のユーザーの都市を `Paris` に変更する `UPDATE` 文を書いてください。", USERS_SCHEMA),
      "既存行を更新するには `UPDATE table SET column = value WHERE condition` を使ってください。",
    ],
  },
  {
    source: [
      "Insert Multiple Rows",
      "Write a single INSERT statement to add three new products to the `products` table:\n  1. name: 'Keyboard', category: 'Electronics', price: 49.99, stock: 100\n  2. name: 'Notebook', category: 'Stationery', price: 5.99, stock: 500\n  3. name: 'Headphones', category: 'Electronics', price: 29.99, stock: 200\n\nTable structure:\n  products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, stock INTEGER)\n\nNote: The id column auto-increments.",
      "You can insert multiple rows in a single INSERT statement by separating value groups with commas.",
    ],
    target: [
      "複数行を INSERT する",
      "1 つの `INSERT` 文で `products` テーブルに次の 3 商品を追加してください。\n  1. name: 'Keyboard', category: 'Electronics', price: 49.99, stock: 100\n  2. name: 'Notebook', category: 'Stationery', price: 5.99, stock: 500\n  3. name: 'Headphones', category: 'Electronics', price: 29.99, stock: 200\n\nテーブル構造:\n  products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, stock INTEGER)\n\n注: id 列は自動採番です。",
      "1 つの `INSERT` 文で複数行を追加するには、値のグループをカンマで区切って並べてください。",
    ],
  },
  {
    source: [
      "Update with WHERE Condition",
      "Write an UPDATE statement that increases the price of all products in the 'Electronics' category by 10% (multiply current price by 1.1).\n\nTable structure:\n  products (id INTEGER, name TEXT, category TEXT, price REAL, stock INTEGER)",
      "Use UPDATE with SET to modify a column using its current value. price = price * 1.1 increases by 10%.",
    ],
    target: [
      "WHERE 条件付き UPDATE",
      q("`Electronics` カテゴリのすべての商品の価格を 10% 上げる `UPDATE` 文を書いてください（現在価格に 1.1 を掛けます）。", PRODUCTS_SCHEMA),
      "`UPDATE` と `SET` を使うと、現在の値を使って列を更新できます。`price = price * 1.1` で 10% 増加します。",
    ],
  },
  {
    source: [
      "Correlated Subquery in SELECT",
      "Write a query that selects each user's name, city, and a column called 'city_peer_count' that shows how many OTHER users live in the same city (excluding the user themselves).\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "Use a correlated subquery in the SELECT clause that counts users in the same city but with a different id.",
    ],
    target: [
      "SELECT 内の相関サブクエリ",
      q("各ユーザーの `name`、`city`、および同じ都市に住む他のユーザー数を表す `city_peer_count` 列を取得するクエリを書いてください（本人は除外します）。", USERS_SCHEMA),
      "`SELECT` 句の相関サブクエリを使い、同じ都市かつ id が異なるユーザー数を数えてください。",
    ],
  },
  {
    source: [
      "CTE with Recursive Row Generation",
      "Write a query using a recursive CTE named 'numbers' that generates a sequence of numbers from 1 to 10. The column should be called 'n'. Then select all rows from the CTE.\n\nNo tables are needed for this query.",
      "A recursive CTE has an anchor member (SELECT 1) and a recursive member (SELECT n + 1 FROM cte WHERE n < 10) joined by UNION ALL.",
    ],
    target: [
      "再帰 CTE で行を生成する",
      "`numbers` という名前の再帰 CTE を使って 1 から 10 までの数列を生成するクエリを書いてください。列名は `n` にし、その後 CTE から全行を取得してください。\n\nこのクエリではテーブルは不要です。",
      "再帰 CTE はアンカー部（`SELECT 1`）と再帰部（`SELECT n + 1 FROM cte WHERE n < 10`）を `UNION ALL` で結合して作ります。",
    ],
  },
  {
    source: [
      "Filter with EXISTS Subquery",
      "Write a query that selects the name and email of users who have placed at least one order with an amount greater than 100. Use an EXISTS subquery.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
      "EXISTS returns TRUE if the subquery returns at least one row. Correlate it with the outer query using the user_id foreign key.",
    ],
    target: [
      "EXISTS サブクエリで絞り込む",
      q("100 を超える金額の注文を少なくとも 1 件行ったユーザーの `name` と `email` を取得するクエリを書いてください。`EXISTS` サブクエリを使ってください。", USERS_ORDERS_SCHEMA),
      "`EXISTS` はサブクエリが 1 行以上返せば TRUE になります。`user_id` 外部キーで外側のクエリと関連付けてください。",
    ],
  },
  {
    source: [
      "Filter Using CTE and Multiple Conditions",
      "Write a query using a CTE named 'user_stats' that calculates each user's total spending (sum of order amounts) and order count. Then select the name, total_spent, and order_count from the CTE where total_spent is above the average total_spent across all users AND order_count >= 2.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
      "Define a CTE with the aggregated stats first. Then in the main query, compare total_spent against a subquery that computes the average from the same CTE.",
    ],
    target: [
      "CTE と複数条件で絞り込む",
      q("`user_stats` という CTE を使い、各ユーザーの総支出（注文金額合計）と注文数を計算してください。その後、`total_spent` が全ユーザー平均より大きく、かつ `order_count >= 2` の行だけを CTE から選択し、`name`、`total_spent`、`order_count` を表示してください。", USERS_ORDERS_SCHEMA),
      "先に集計用 CTE を定義し、本体クエリでその CTE から求めた平均値との比較をサブクエリで行ってください。",
    ],
  },
  {
    source: [
      "Self-Join to Compare Rows",
      "Write a query that finds all pairs of users who live in the same city. Select the first user's name as 'user1', the second user's name as 'user2', and the city. Avoid duplicate pairs (ensure user1's id is less than user2's id).\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
      "A self-join joins a table with itself using two different aliases. Use u1.id < u2.id to avoid pairing a user with themselves and to prevent reversed duplicates.",
    ],
    target: [
      "自己結合で行を比較する",
      q("同じ都市に住むユーザーのすべての組み合わせを見つけるクエリを書いてください。1 人目の名前を `user1`、2 人目の名前を `user2`、都市を `city` として取得し、重複組み合わせを避けるために `user1` の id が `user2` より小さいものだけにしてください。", USERS_SCHEMA),
      "自己結合では同じテーブルを別名 2 つで結合します。`u1.id < u2.id` を使うと自己ペアや逆順の重複を避けられます。",
    ],
  },
  {
    source: [
      "Window Function with JOIN — Rank Orders per User",
      "Write a query that shows each user's name, their order product, order amount, and a 'rank' column that ranks each user's orders from highest to lowest amount using RANK(). Only include users who have placed orders.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
      "RANK() is a window function. Use PARTITION BY to rank within each user's orders and ORDER BY amount DESC to rank from highest to lowest.",
    ],
    target: [
      "JOIN とウィンドウ関数で注文順位を付ける",
      q("各ユーザーの名前、注文商品、注文金額、および `RANK()` を使って高額順に順位付けした `rank` 列を表示するクエリを書いてください。注文したことのあるユーザーだけを含めてください。", USERS_ORDERS_SCHEMA),
      "`RANK()` はウィンドウ関数です。各ユーザー内で順位付けするには `PARTITION BY` を使い、高額順にするには `ORDER BY amount DESC` を使ってください。",
    ],
  },
  {
    source: [
      "GROUP BY with HAVING on Multiple Aggregates",
      "Write a query that shows each product category with its product_count, avg_price (rounded to 2 decimals), and total_stock. Only include categories where the average price is above 20 AND the total stock is at least 100.\n\nTable structure:\n  products (id INTEGER, name TEXT, category TEXT, price REAL, stock INTEGER)",
      "HAVING can contain multiple conditions joined with AND. Use the raw aggregate expressions (not aliases) in the HAVING clause.",
    ],
    target: [
      "複数集計条件の HAVING",
      q("各商品カテゴリについて `product_count`、小数第 2 位まで丸めた `avg_price`、`total_stock` を表示するクエリを書いてください。平均価格が 20 より大きく、かつ総在庫が 100 以上のカテゴリだけを含めてください。", PRODUCTS_SCHEMA),
      "`HAVING` には `AND` で複数条件を書けます。`HAVING` 句ではエイリアスではなく元の集約式を使ってください。",
    ],
  },
  {
    source: [
      "Running Total with Window Function",
      "Write a query that shows each order's id, product, amount, order_date, and a 'running_total' column that calculates the cumulative sum of amounts ordered by order_date (and by id to break ties). The running total should include all orders, not partitioned by user.\n\nTable structure:\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
      "SUM() can be used as a window function with OVER(ORDER BY ...) to compute a running total. The default window frame is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.",
    ],
    target: [
      "ウィンドウ関数で累積合計を出す",
      q("各注文の `id`、`product`、`amount`、`order_date`、および `order_date`（同日の場合は id）順で累積合計を計算する `running_total` 列を表示するクエリを書いてください。累積合計はユーザーごとではなく全注文を対象にします。", ORDERS_SCHEMA),
      "`SUM()` は `OVER(ORDER BY ...)` と組み合わせるとウィンドウ関数として累積合計を計算できます。既定のフレームは `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` です。",
    ],
  },
  {
    source: [
      "Multi-Column Sort with LIMIT",
      "Select the top 3 highest-paid employees. If salaries are equal, sort by name alphabetically. Show name and salary columns.\nTable: employees (id, name, department, salary)",
      "Use `ORDER BY salary DESC, name ASC` for multi-column sorting, and `LIMIT 3` to restrict rows.",
    ],
    target: [
      "複数列ソートと LIMIT",
      "給与が最も高い従業員を上位 3 名取得してください。給与が同じ場合は名前のアルファベット順で並べ、`name` と `salary` を表示してください。\nテーブル: employees (id, name, department, salary)",
      "複数列での並べ替えには `ORDER BY salary DESC, name ASC`、件数制限には `LIMIT 3` を使ってください。",
    ],
  },
  {
    source: [
      "Sort by Subquery Result",
      "Write a query that selects each user's name, city, and age from the `users` table, sorted by how many orders they have placed (most orders first). Include users with zero orders. Name the order count column 'order_count'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
      "Use a correlated subquery in the SELECT to compute the order count for each user, then ORDER BY that computed column.",
    ],
    target: [
      "サブクエリ結果で並べ替える",
      q("`users` テーブルから各ユーザーの `name`、`city`、`age` を取得し、注文数の多い順に並べるクエリを書いてください。注文が 0 件のユーザーも含め、注文数列名は `order_count` にしてください。", USERS_ORDERS_SCHEMA),
      "`SELECT` 句の相関サブクエリで各ユーザーの注文数を計算し、その計算結果で `ORDER BY` してください。",
    ],
  },
  {
    source: [
      "Pagination with ROW_NUMBER Window Function",
      "Write a query using a CTE named 'ranked_orders' that assigns a row number to each order partitioned by user_id and ordered by amount descending. Then select the user_id, product, amount, and row_num from the CTE where row_num = 1 (each user's highest-value order), ordered by amount descending.\n\nTable structure:\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
      "ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) assigns 1 to each user's highest order. Filter with WHERE row_num = 1 in the outer query.",
    ],
    target: [
      "ROW_NUMBER によるページング",
      q("`ranked_orders` という CTE を使い、各注文に対して `user_id` ごとに区切り、`amount` の降順で並べた行番号を付けるクエリを書いてください。その後、`row_num = 1`（各ユーザーの最高額注文）だけを CTE から選び、`user_id`、`product`、`amount`、`row_num` を金額降順で表示してください。", ORDERS_SCHEMA),
      "`ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC)` を使うと、各ユーザーの最高額注文に 1 を付けられます。外側のクエリで `WHERE row_num = 1` としてください。",
    ],
  },
  {
    source: [
      "UPDATE with Subquery",
      "Update all employees in the 'Sales' department to have a 10% salary increase. Then select name, department, and salary for all employees ordered by salary DESC.\nTable: employees (id, name, department, salary)",
      "Use `UPDATE table SET column = expression WHERE condition` to modify specific rows.",
    ],
    target: [
      "サブクエリ付き UPDATE",
      "`Sales` 部門の全従業員の給与を 10% 増やしてください。その後、すべての従業員の `name`、`department`、`salary` を給与降順で表示してください。\nテーブル: employees (id, name, department, salary)",
      "特定の行を更新するには `UPDATE table SET column = expression WHERE condition` を使ってください。",
    ],
  },
  {
    source: [
      "Insert from SELECT with Conditions",
      "Write a query that inserts into an `archived_orders` table all orders from the `orders` table where the order_date is before '2024-01-01'. The archived_orders table has the same structure as orders.\n\nTable structure:\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)\n  archived_orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
      "INSERT INTO ... SELECT copies rows from one table to another. Add a WHERE clause to the SELECT to filter which rows to insert.",
    ],
    target: [
      "条件付き INSERT ... SELECT",
      q("`orders` テーブルのうち `order_date` が `'2024-01-01'` より前の注文をすべて `archived_orders` テーブルへ挿入するクエリを書いてください。`archived_orders` は `orders` と同じ構造です。", ORDERS_ARCHIVED_SCHEMA),
      "`INSERT INTO ... SELECT` を使うと、あるテーブルの行を別テーブルへコピーできます。どの行を入れるかは `SELECT` 側に `WHERE` を付けて絞り込んでください。",
    ],
  },
  {
    source: [
      "Upsert with ON CONFLICT",
      "Write an INSERT statement that adds a product with name 'Laptop', category 'Electronics', price 999.99, stock 50 into the `products` table. If a product with the same name already exists, update its price and stock to the new values instead. Assume there is a UNIQUE constraint on the name column.\n\nTable structure:\n  products (id INTEGER PRIMARY KEY, name TEXT UNIQUE, category TEXT, price REAL, stock INTEGER)",
      "Use ON CONFLICT(column) DO UPDATE SET ... to handle uniqueness violations. The special 'excluded' table refers to the values that were attempted to be inserted.",
    ],
    target: [
      "ON CONFLICT を使った UPSERT",
      "名前が `'Laptop'`、カテゴリが `'Electronics'`、価格が 999.99、在庫が 50 の商品を `products` テーブルに追加する `INSERT` 文を書いてください。同じ名前の商品がすでに存在する場合は、価格と在庫を新しい値で更新してください。`name` 列には UNIQUE 制約があるものとします。\n\nテーブル構造:\n  products (id INTEGER PRIMARY KEY, name TEXT UNIQUE, category TEXT, price REAL, stock INTEGER)",
      "一意制約違反を処理するには `ON CONFLICT(column) DO UPDATE SET ...` を使ってください。特別な `excluded` テーブルは、挿入しようとした値を参照します。",
    ],
  },
  {
    source: [
      "Generic Max Function",
      "Write a generic function `findMax<T>(arr: T[], compareFn: (a: T, b: T) => number): T` that returns the maximum element in an array using the compareFn. Test with:\n- Numbers [3, 7, 2, 9, 5]\n- Strings [\"banana\", \"apple\", \"cherry\"] (alphabetically last)\n- Objects [{name:\"Alice\",age:30}, {name:\"Bob\",age:25}, {name:\"Charlie\",age:35}] (max age)",
      "Use `<T>` to define a generic type parameter. The compareFn should return a positive number if a > b, negative if a < b, and 0 if equal.",
    ],
    target: [
      "ジェネリックな最大値関数",
      "`compareFn` を使って配列の最大要素を返すジェネリック関数 `findMax<T>(arr: T[], compareFn: (a: T, b: T) => number): T` を書いてください。次でテストしてください。\n- 数値 `[3, 7, 2, 9, 5]`\n- 文字列 `[\"banana\", \"apple\", \"cherry\"]`（アルファベット順で最後）\n- オブジェクト `[{name:\"Alice\",age:30}, {name:\"Bob\",age:25}, {name:\"Charlie\",age:35}]`（年齢最大）",
      "`<T>` を使ってジェネリック型パラメータを定義します。`compareFn` は `a > b` なら正、`a < b` なら負、等しければ 0 を返すようにしてください。",
    ],
  },
  {
    source: [
      "Tuple Return Type",
      "Write a function `minMax(arr: number[]): [number, number]` that returns a tuple of [min, max] from a number array. Also write `splitAt<T>(arr: T[], index: number): [T[], T[]]` that splits an array at the given index. Test minMax with [5, 2, 8, 1, 9] and splitAt with [\"a\",\"b\",\"c\",\"d\",\"e\"] at index 3.",
      "Use `[type1, type2]` syntax to define tuple return types. Destructure the result with `const [a, b] = fn()`.",
    ],
    target: [
      "タプルの戻り値型",
      "数値配列から `[min, max]` のタプルを返す関数 `minMax(arr: number[]): [number, number]` を書いてください。さらに、配列を指定した index で分割する `splitAt<T>(arr: T[], index: number): [T[], T[]]` も書いてください。`minMax` は `[5, 2, 8, 1, 9]`、`splitAt` は `[\"a\",\"b\",\"c\",\"d\",\"e\"]` と index 3 でテストしてください。",
      "タプルの戻り値型は `[type1, type2]` の構文で定義します。結果は `const [a, b] = fn()` のように分割代入できます。",
    ],
  },
  {
    source: [
      "Higher-Order Function: Map Implementation",
      "Implement a generic `myMap<T, U>(arr: T[], fn: (item: T, index: number) => U): U[]` function that works like Array.map. Test it with:\n1. Double numbers: [1,2,3,4,5] => [2,4,6,8,10]\n2. String lengths: [\"hello\",\"world\",\"ts\"] => [5,5,2]\n3. Index-value pairs: [\"a\",\"b\",\"c\"] => [\"0:a\",\"1:b\",\"2:c\"]",
      "Use two generic type parameters: T for input type and U for output type. Iterate through the array, applying fn to each element and index.",
    ],
    target: [
      "高階関数で Map を実装する",
      "Array.map のように動くジェネリック関数 `myMap<T, U>(arr: T[], fn: (item: T, index: number) => U): U[]` を実装してください。次でテストしてください。\n1. 数値を 2 倍: `[1,2,3,4,5]` => `[2,4,6,8,10]`\n2. 文字列の長さ: `[\"hello\",\"world\",\"ts\"]` => `[5,5,2]`\n3. index と値の組: `[\"a\",\"b\",\"c\"]` => `[\"0:a\",\"1:b\",\"2:c\"]`",
      "ジェネリック型パラメータを 2 つ使います。`T` は入力型、`U` は出力型です。配列を順に走査し、各要素と index に `fn` を適用してください。",
    ],
  },
  {
    source: [
      "Function Overloads with Unions",
      "Write a function `format` that behaves differently based on input:\n- format(value: number, decimals: number) => formats number to N decimal places\n- format(value: string, uppercase: boolean) => converts to upper/lowercase\n- format(value: Date) => returns \"YYYY-MM-DD\" string\nUse union types and type narrowing. Test with: format(3.14159, 2), format(\"hello\", true), format(\"WORLD\", false), and format(new Date(2026, 0, 15)).",
      "TypeScript function overloads define multiple call signatures followed by a single implementation. Use typeof and instanceof for type narrowing.",
    ],
    target: [
      "ユニオン型を使った関数オーバーロード",
      "入力に応じて動作が変わる関数 `format` を書いてください。\n- `format(value: number, decimals: number)` => 数値を小数点以下 N 桁に整形\n- `format(value: string, uppercase: boolean)` => 大文字または小文字に変換\n- `format(value: Date)` => `\"YYYY-MM-DD\"` 形式の文字列を返す\nユニオン型と型の絞り込みを使って実装し、`format(3.14159, 2)`、`format(\"hello\", true)`、`format(\"WORLD\", false)`、`format(new Date(2026, 0, 15))` でテストしてください。",
      "TypeScript の関数オーバーロードは、複数の呼び出しシグネチャの後に 1 つの実装を書きます。型の絞り込みには `typeof` と `instanceof` を使ってください。",
    ],
  },
  {
    source: [
      "Filter Even Numbers",
      "Given a typed array of numbers [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], filter out only the even numbers and print them as a comma-separated string. Then print the count of even numbers.",
      "Use `.filter()` with a callback that returns true for even numbers (n % 2 === 0). Use `.join(\", \")` to create a comma-separated string.",
    ],
    target: [
      "偶数だけを抽出する",
      "型付き数値配列 `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]` から偶数だけを抽出し、カンマ区切りの文字列として出力してください。続けて偶数の個数も出力してください。",
      "偶数判定には `.filter()` と `n % 2 === 0` を使ってください。カンマ区切り文字列は `.join(\", \")` で作れます。",
    ],
  },
  {
    source: [
      "Map Array to Double",
      "Given a typed array of numbers [3, 7, 2, 9, 5], use .map() to create a new array where each element is doubled. Print the original and doubled arrays as comma-separated strings.",
      "Use `.map()` with a callback that returns the doubled value. Map creates a new array without modifying the original.",
    ],
    target: [
      "配列を 2 倍に写像する",
      "型付き数値配列 `[3, 7, 2, 9, 5]` に対して `.map()` を使い、各要素を 2 倍にした新しい配列を作ってください。元の配列と 2 倍後の配列を、それぞれカンマ区切り文字列で出力してください。",
      "2 倍した値を返すコールバックを `.map()` に渡してください。map は元の配列を変更せず、新しい配列を作ります。",
    ],
  },
  {
    source: [
      "Reduce: Sum and Product",
      "Given a typed array [2, 3, 4, 5], use .reduce() to compute the sum and product of all elements. Print both results.",
      "Use `.reduce(callback, initialValue)`. For sum, start with 0 and add. For product, start with 1 and multiply.",
    ],
    target: [
      "reduce で合計と積を求める",
      "型付き配列 `[2, 3, 4, 5]` に対して `.reduce()` を使い、全要素の合計と積を計算してください。両方の結果を出力してください。",
      "`.reduce(callback, initialValue)` を使ってください。合計は 0 から開始して加算し、積は 1 から開始して乗算します。",
    ],
  },
  {
    source: [
      "Sort Array of Objects",
      "Given an array of students with name and grade, sort them by grade descending (highest first). If grades are equal, sort by name alphabetically. Print each student in format: \"Name: grade\".",
      "Use `.sort()` with a comparison function. Return a negative, zero, or positive number. Sort grade descending with `b.grade - a.grade`, and use `.localeCompare()` for name sorting.",
    ],
    target: [
      "オブジェクト配列を並べ替える",
      "name と grade を持つ学生配列を、grade の降順（高い順）で並べ替えてください。grade が同じ場合は name をアルファベット順で並べてください。各学生を `\"Name: grade\"` の形式で出力してください。",
      "比較関数付きの `.sort()` を使ってください。戻り値は負、0、正のいずれかです。grade の降順には `b.grade - a.grade` を使い、name の並べ替えには `.localeCompare()` を使ってください。",
    ],
  },
  {
    source: [
      "Generic GroupBy Function",
      "Implement a generic function `groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]>` that groups array elements by a key. Test with:\n1. Group numbers by even/odd\n2. Group words by first letter\nPrint results with JSON-style formatting.",
      "Use `Record<string, T[]>` for the result type. For each item, compute the key and push the item into the corresponding array.",
    ],
    target: [
      "ジェネリックな GroupBy 関数",
      "配列要素をキーごとにグループ化するジェネリック関数 `groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]>` を実装してください。次でテストしてください。\n1. 数値を偶数/奇数で分類\n2. 単語を先頭文字で分類\n結果は JSON 風の形式で出力してください。",
      "結果型には `Record<string, T[]>` を使ってください。各要素ごとにキーを計算し、対応する配列へ追加します。",
    ],
  },
  {
    source: [
      "Zip Two Arrays",
      "Implement a generic function `zip<T, U>(arr1: T[], arr2: U[]): [T, U][]` that combines two arrays into an array of tuples. If arrays are different lengths, stop at the shorter one. Test with:\n1. zip([1,2,3], [\"a\",\"b\",\"c\"])\n2. zip([true,false,true], [10,20]) (different lengths)",
      "Use `Math.min(arr1.length, arr2.length)` to determine the result length. The return type is `[T, U][]` — an array of tuples.",
    ],
    target: [
      "2 つの配列を zip する",
      "2 つの配列をタプル配列にまとめるジェネリック関数 `zip<T, U>(arr1: T[], arr2: U[]): [T, U][]` を実装してください。配列の長さが異なる場合は、短い方に合わせて止めてください。次でテストしてください。\n1. `zip([1,2,3], [\"a\",\"b\",\"c\"])`\n2. `zip([true,false,true], [10,20])`（長さが異なるケース）",
      "結果の長さは `Math.min(arr1.length, arr2.length)` で決めてください。戻り値型は `[T, U][]`、つまりタプルの配列です。",
    ],
  },
  {
    source: [
      "Merge Objects with Spread",
      "Create two objects: `defaults` with properties {color: \"blue\", size: 10, visible: true} and `overrides` with {color: \"red\", size: 20}. Merge them using the spread operator so overrides take precedence. Print each property of the merged object.",
      "Use the spread operator `{...obj1, ...obj2}` to merge objects. Properties in the later object override those in the earlier one. Use `Partial<T>` for an object where all properties are optional.",
    ],
    target: [
      "スプレッドでオブジェクトをマージする",
      "2 つのオブジェクトを作ってください。`defaults` は `{color: \"blue\", size: 10, visible: true}`、`overrides` は `{color: \"red\", size: 20}` とします。スプレッド演算子でマージし、`overrides` が優先されるようにしてください。マージ後のオブジェクトの各プロパティを出力してください。",
      "オブジェクトのマージにはスプレッド演算子 `{...obj1, ...obj2}` を使います。後ろのオブジェクトのプロパティが前の値を上書きします。すべてのプロパティを省略可能にしたい場合は `Partial<T>` が使えます。",
    ],
  },
  {
    source: [
      "Destructure Nested Object",
      "Create a nested object representing a user profile with: name, address (street, city, zip), and contacts (email, phone). Destructure the nested properties and print them each on a separate line.",
      "Use nested destructuring: `const { prop, nested: { innerProp } } = obj;`. The colon in destructuring renames or drills into nested objects.",
    ],
    target: [
      "ネストしたオブジェクトを分割代入する",
      "name、address（street, city, zip）、contacts（email, phone）を持つユーザープロフィールのネストしたオブジェクトを作ってください。ネストしたプロパティを分割代入し、それぞれを別の行に出力してください。",
      "ネストした分割代入は `const { prop, nested: { innerProp } } = obj;` のように書けます。コロンは名前変更やネスト内部への展開に使います。",
    ],
  },
  {
    source: [
      "Typed Key-Value Store",
      "Create a typed key-value store using Record<string, number> that maps fruit names to their quantities. Add entries for apple(5), banana(3), cherry(8), date(2). Print all entries sorted by key, then find and print the fruit with the most quantity.",
      "Use `Record<string, number>` for a typed dictionary. `Object.keys()` returns keys, `Object.entries()` returns [key, value] pairs. Use `.sort()` for alphabetical ordering.",
    ],
    target: [
      "型付きキー値ストア",
      "`Record<string, number>` を使って、果物名を個数に対応付ける型付きキー値ストアを作ってください。`apple(5)`、`banana(3)`、`cherry(8)`、`date(2)` を追加し、まずキー順に並べた全エントリを出力してください。その後、個数が最も多い果物を見つけて出力してください。",
      "型付き辞書には `Record<string, number>` を使います。`Object.keys()` はキー、`Object.entries()` は `[key, value]` の組を返します。アルファベット順の並べ替えには `.sort()` を使ってください。",
    ],
  },
  {
    source: [
      "Pick and Omit Utility Types",
      "Define a `User` interface with: id (number), name (string), email (string), password (string), role (string). Use Pick to create a `UserPublic` type with only id, name, email. Use Omit to create a `UserWithoutPassword` type (everything except password). Create a User and display both derived types.",
      "Use `Pick<Type, Keys>` to select specific properties and `Omit<Type, Keys>` to exclude specific properties. Both create new types from existing ones.",
    ],
    target: [
      "Pick と Omit のユーティリティ型",
      "`id`（number）、`name`（string）、`email`（string）、`password`（string）、`role`（string）を持つ `User` インターフェースを定義してください。Pick を使って `id`、`name`、`email` だけを持つ `UserPublic` 型を作り、Omit を使って `password` を除いた `UserWithoutPassword` 型を作ってください。User オブジェクトを 1 つ作り、両方の派生型を表示してください。",
      "特定のプロパティだけ選ぶには `Pick<Type, Keys>`、特定のプロパティを除外するには `Omit<Type, Keys>` を使います。どちらも既存の型から新しい型を作るためのものです。",
    ],
  },
  {
    source: [
      "Deep Clone an Object",
      "Implement a function `deepClone<T>(obj: T): T` that creates a deep copy of an object (handling nested objects and arrays). Test by cloning a nested object, modifying the clone, and showing the original is unchanged.",
      "Recursively copy each property. Check if value is null, a primitive, an array, or an object. Arrays need map with recursive clone, objects need key iteration.",
    ],
    target: [
      "オブジェクトをディープクローンする",
      "ネストしたオブジェクトや配列も含めて深いコピーを作る関数 `deepClone<T>(obj: T): T` を実装してください。ネストしたオブジェクトをクローンし、クローン側を変更しても元が変わらないことを確認してください。",
      "各プロパティを再帰的にコピーしてください。値が `null`、プリミティブ、配列、オブジェクトのどれかを判定します。配列は再帰クローン付きの map、オブジェクトはキー走査で処理してください。",
    ],
  },
  {
    source: [
      "Class with Getters and Setters",
      "Create a `BankAccount` class with:\n- Private properties: _owner (string), _balance (number)\n- Constructor that takes owner and initial balance\n- Getter/setter for balance (setter should reject negative values)\n- Methods: deposit(amount), withdraw(amount) — withdraw should fail if insufficient funds\n- Method: toString() returning \"Account(<owner>): $<balance>\"\nTest with deposits and withdrawals, including an attempted overdraft.",
      "Use `private` for properties, `get` for getters, and `set` for setters. Validate inputs in setters and methods to maintain object integrity.",
    ],
    target: [
      "ゲッターとセッターを持つクラス",
      "次の条件を満たす `BankAccount` クラスを作ってください。\n- private プロパティ: `_owner`（string）、`_balance`（number）\n- owner と初期残高を受け取るコンストラクタ\n- balance 用の getter / setter（setter は負の値を拒否する）\n- メソッド: `deposit(amount)`、`withdraw(amount)`。`withdraw` は残高不足なら失敗する\n- `\"Account(<owner>): $<balance>\"` を返す `toString()` メソッド\n入金・出金・残高超過の出金を含めてテストしてください。",
      "プロパティには `private`、ゲッターには `get`、セッターには `set` を使ってください。セッターやメソッドの中で入力を検証し、オブジェクトの整合性を保ちます。",
    ],
  },
  {
    source: [
      "Promise with Delay",
      "Create a function `delay(ms: number): Promise<void>` that wraps setTimeout in a Promise. Then create a function `greetAfterDelay(name: string, ms: number): Promise<string>` that waits for the delay then returns a greeting. Call it with \"Alice\" and 100ms, printing the result.",
      "Wrap setTimeout in a Promise: `new Promise(resolve => setTimeout(resolve, ms))`. Use async/await to wait for the promise to resolve.",
    ],
    target: [
      "遅延付き Promise",
      "`setTimeout` を Promise で包む関数 `delay(ms: number): Promise<void>` を作ってください。続けて、待機後に挨拶を返す関数 `greetAfterDelay(name: string, ms: number): Promise<string>` を作ってください。`\"Alice\"` と `100ms` で呼び出し、結果を出力してください。",
      "`setTimeout` は `new Promise(resolve => setTimeout(resolve, ms))` の形で Promise 化できます。Promise の完了待ちには async/await を使ってください。",
    ],
  },
  {
    source: [
      "Sequential Async Operations",
      "Create an async function `fetchUser(id: number)` that simulates fetching a user (returns after 50ms with {id, name: \"User_<id>\"}). Create `fetchPosts(userId: number)` that returns after 50ms with an array of 2 posts. Chain them: fetch user 1, then fetch their posts, print results.",
      "Use `await` to wait for each async operation before starting the next one. This ensures sequential execution where later operations depend on earlier results.",
    ],
    target: [
      "順次実行する非同期処理",
      "ユーザー取得を模擬する async 関数 `fetchUser(id: number)` を作ってください（50ms 後に `{id, name: \"User_<id>\"}` を返す）。続けて、50ms 後に 2 件の投稿配列を返す `fetchPosts(userId: number)` を作ってください。`fetch user 1` を行った後、そのユーザーの投稿を取得して結果を出力してください。",
      "次の非同期処理を始める前に `await` で現在の処理の完了を待ってください。こうすると、前の結果に依存する処理を順番に実行できます。",
    ],
  },
  {
    source: [
      "Promise.all with Multiple Tasks",
      "Create async functions to simulate fetching data from three endpoints (each with different delays):\n- fetchUsers(): returns [\"Alice\",\"Bob\"] after 100ms\n- fetchProducts(): returns [\"Widget\",\"Gadget\"] after 80ms\n- fetchOrders(): returns [\"Order1\",\"Order2\"] after 60ms\nUse Promise.all to fetch all three concurrently and print results.",
      "Promise.all takes an array of promises and resolves when ALL complete. Destructure the result: `const [a, b, c] = await Promise.all([p1, p2, p3])`.",
    ],
    target: [
      "Promise.all で複数タスクを実行する",
      "3 つのエンドポイントからの取得を模擬する async 関数を作ってください（それぞれ遅延は異なります）。\n- `fetchUsers()` は 100ms 後に `[\"Alice\",\"Bob\"]` を返す\n- `fetchProducts()` は 80ms 後に `[\"Widget\",\"Gadget\"]` を返す\n- `fetchOrders()` は 60ms 後に `[\"Order1\",\"Order2\"]` を返す\n`Promise.all` を使って 3 つすべてを同時に取得し、結果を出力してください。",
      "`Promise.all` は Promise の配列を受け取り、すべて完了したときに解決されます。結果は `const [a, b, c] = await Promise.all([p1, p2, p3])` のように分割代入できます。",
    ],
  },
  {
    source: [
      "Error Handling with Try/Catch",
      "Create an async function `riskyOperation(shouldFail: boolean): Promise<string>` that rejects with \"Operation failed\" if shouldFail is true, otherwise resolves with \"Success\". Write a wrapper that calls it three times (true, false, true) with proper try/catch error handling, printing the result or error for each call.",
      "Use try/catch around await to handle Promise rejections. Use `error instanceof Error` for type-safe error handling in TypeScript.",
    ],
    target: [
      "try/catch でエラーを処理する",
      "`shouldFail` が true のときは `\"Operation failed\"` で reject し、それ以外は `\"Success\"` で resolve する async 関数 `riskyOperation(shouldFail: boolean): Promise<string>` を作ってください。これを `(true, false, true)` の順で 3 回呼び出すラッパーを書き、各呼び出しについて結果またはエラーを出力してください。",
      "Promise の reject を処理するには `await` を `try/catch` で囲んでください。TypeScript で型安全に扱うには `error instanceof Error` を使います。",
    ],
  },
  {
    source: [
      "Sliding Window Maximum",
      "Implement a function `slidingWindowMax<T extends number>(arr: T[], windowSize: number): T[]` that returns the maximum value in each sliding window of the given size. For `[1,3,-1,-3,5,3,6,7]` with window size 3, the windows are [1,3,-1],[3,-1,-3],[-1,-3,5],[-3,5,3],[5,3,6],[3,6,7] and the maximums are [3,3,5,5,6,7]. Print the result as a comma-separated string.",
      "Use a loop from index 0 to arr.length - windowSize. For each position, slice the array to get the window, then use reduce to find the max.",
    ],
    target: [
      "スライディングウィンドウの最大値",
      "指定サイズの各スライディングウィンドウごとの最大値を返す関数 `slidingWindowMax<T extends number>(arr: T[], windowSize: number): T[]` を実装してください。`[1,3,-1,-3,5,3,6,7]` を window size 3 で処理すると、ウィンドウは `[1,3,-1]`、`[3,-1,-3]`、`[-1,-3,5]`、`[-3,5,3]`、`[5,3,6]`、`[3,6,7]` で、最大値は `[3,3,5,5,6,7]` になります。結果をカンマ区切り文字列で出力してください。",
      "index 0 から `arr.length - windowSize` までループしてください。各位置で `slice` によりウィンドウを取り出し、その中の最大値は `reduce` で求めます。",
    ],
  },
  {
    source: [
      "Lazy Evaluated Pipeline",
      "Implement a `Pipeline<T>` class that supports lazy evaluation of chained array operations. It should support:\n- `static from<U>(arr: U[]): Pipeline<U>` — creates a pipeline from an array\n- `map<U>(fn: (item: T) => U): Pipeline<U>` — lazy map\n- `filter(fn: (item: T) => boolean): Pipeline<T>` — lazy filter\n- `take(n: number): Pipeline<T>` — lazy take first n\n- `collect(): T[]` — materializes the pipeline\nTest by creating a pipeline from [1..10], filtering evens, mapping to squares, taking 3, then collecting. Print each step description and the final result.",
      "Use generators to defer execution. Each pipeline step returns a new Pipeline wrapping a generator that pulls from the previous step. Only `collect()` materializes values.",
    ],
    target: [
      "遅延評価パイプライン",
      "配列操作をチェーンしつつ遅延評価できる `Pipeline<T>` クラスを実装してください。次をサポートする必要があります。\n- `static from<U>(arr: U[]): Pipeline<U>` — 配列からパイプラインを作る\n- `map<U>(fn: (item: T) => U): Pipeline<U>` — 遅延 map\n- `filter(fn: (item: T) => boolean): Pipeline<T>` — 遅延 filter\n- `take(n: number): Pipeline<T>` — 先頭 n 件の遅延取得\n- `collect(): T[]` — パイプラインを実体化する\n`[1..10]` からパイプラインを作り、偶数を抽出し、二乗に変換し、3 件だけ取り、最後に collect してテストしてください。各ステップの説明と最終結果を出力してください。",
      "実行を遅らせるために generator を使ってください。各パイプライン段階は、前の段階から値を引き出す generator を包んだ新しい Pipeline を返します。値が実体化されるのは `collect()` のときだけです。",
    ],
  },
  {
    source: [
      "Type-Safe Event Emitter",
      "Implement a generic `TypedEmitter<Events>` class where Events is a record mapping event names to their payload types. It should support:\n- `on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void`\n- `emit<K extends keyof Events>(event: K, payload: Events[K]): void`\n- `off<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void`\nDefine events: `{ login: { user: string }, message: { from: string; text: string }, logout: {} }`. Demonstrate by registering handlers, emitting events, removing a handler, and emitting again.",
      "Use a mapped type for the handlers storage: `{ [K in keyof Events]?: ((payload: Events[K]) => void)[] }`. The `on` method pushes handlers, `emit` calls all handlers for an event, and `off` filters out the specific handler.",
    ],
    target: [
      "型安全なイベントエミッター",
      "`Events` をイベント名から payload 型への record とするジェネリッククラス `TypedEmitter<Events>` を実装してください。次をサポートする必要があります。\n- `on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void`\n- `emit<K extends keyof Events>(event: K, payload: Events[K]): void`\n- `off<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void`\nイベントは `{ login: { user: string }, message: { from: string; text: string }, logout: {} }` と定義してください。ハンドラの登録、イベント発火、ハンドラの削除、再度の発火を実演してください。",
      "ハンドラ保存には `{ [K in keyof Events]?: ((payload: Events[K]) => void)[] }` のような mapped type を使ってください。`on` はハンドラを追加し、`emit` は対象イベントの全ハンドラを呼び出し、`off` は特定のハンドラを取り除きます。",
    ],
  },
  {
    source: [
      "Immutable State Manager with History",
      "Implement a generic `StateManager<T extends Record<string, unknown>>` class that manages immutable state with undo/redo support. It should support:\n- `constructor(initial: T)` — sets the initial state\n- `get state(): Readonly<T>` — returns current state (read-only)\n- `update(partial: Partial<T>): void` — merges partial update into state, pushes old state to undo stack\n- `undo(): boolean` — reverts to previous state, returns true if successful\n- `redo(): boolean` — re-applies undone state, returns true if successful\n- `subscribe(listener: (state: Readonly<T>) => void): () => void` — notifies on changes, returns unsubscribe function\nDemonstrate with a counter/settings state object.",
      "Use two stacks (arrays) for undo and redo history. On update, push current state to undo stack and clear redo stack. Use the spread operator for shallow immutable copies.",
    ],
    target: [
      "履歴付きイミュータブル状態管理",
      "undo/redo を備えたイミュータブル状態管理クラス `StateManager<T extends Record<string, unknown>>` を実装してください。次をサポートする必要があります。\n- `constructor(initial: T)` — 初期状態を設定\n- `get state(): Readonly<T>` — 現在の状態を読み取り専用で返す\n- `update(partial: Partial<T>): void` — 部分更新をマージし、更新前状態を undo スタックへ積む\n- `undo(): boolean` — 1 つ前の状態へ戻し、成功なら true\n- `redo(): boolean` — 取り消した状態を再適用し、成功なら true\n- `subscribe(listener: (state: Readonly<T>) => void): () => void` — 変更通知を行い、unsubscribe 関数を返す\ncounter/settings を持つ状態オブジェクトで実演してください。",
      "undo と redo の履歴には 2 つのスタック（配列）を使ってください。`update` のたびに現在状態を undo スタックへ積み、redo スタックは空にします。浅いイミュータブルコピーにはスプレッド演算子を使います。",
    ],
  },
  {
    source: [
      "Function Composition with Type Safety",
      "Implement a `pipe` function that composes functions left to right with full type safety. Create:\n- `pipe(fn1)` — returns a function that applies fn1\n- `pipe(fn1, fn2)` — returns a function that applies fn1 then fn2\n- `pipe(fn1, fn2, fn3)` — returns a function applying fn1, fn2, fn3 in order\nUse overloads for type safety. Test by composing: parseFloat -> double -> toFixed(1) -> addPrefix.",
      "Use function overloads for 1, 2, 3, and 4 argument versions to preserve type flow. The implementation uses `reduce` to chain functions.",
    ],
    target: [
      "型安全な関数合成",
      "左から右へ関数を合成する `pipe` 関数を、完全な型安全性付きで実装してください。次を作ってください。\n- `pipe(fn1)` — `fn1` を適用する関数を返す\n- `pipe(fn1, fn2)` — `fn1` の結果に `fn2` を適用する関数を返す\n- `pipe(fn1, fn2, fn3)` — `fn1`、`fn2`、`fn3` を順に適用する関数を返す\n型安全性のためにオーバーロードを使い、`parseFloat -> double -> toFixed(1) -> addPrefix` の合成でテストしてください。",
      "型の流れを保つために、1 個、2 個、3 個、4 個の引数版それぞれに関数オーバーロードを定義してください。実装本体では `reduce` を使って関数を連結できます。",
    ],
  },
  {
    source: [
      "Memoize with TTL and Type-Safe Cache",
      "Implement a `memoize` function that:\n- Accepts any function and returns a memoized version\n- Preserves the original function's type signature\n- Supports a TTL (time-to-live) in milliseconds — cached results expire\n- Has a `.cache` property to inspect cached entries\n- Has a `.clear()` method to manually clear the cache\nTest with a simulated expensive `fibonacci(n)` function. Show cache hits, expiration behavior, and manual clearing.",
      "Use `JSON.stringify(args)` as the cache key. Store entries as `{ value, expiry: Date.now() + ttl }`. Check if cached entry exists AND hasn't expired before returning it.",
    ],
    target: [
      "TTL 付き型安全メモ化キャッシュ",
      "`memoize` 関数を実装してください。要件は次のとおりです。\n- 任意の関数を受け取り、メモ化された関数を返す\n- 元の関数の型シグネチャを保つ\n- ミリ秒単位の TTL（time-to-live）をサポートし、キャッシュ結果は期限切れになる\n- キャッシュ内容を確認できる `.cache` プロパティを持つ\n- 手動でキャッシュを消せる `.clear()` メソッドを持つ\n重い処理を模擬した `fibonacci(n)` 関数でテストし、キャッシュヒット、期限切れ、手動クリアの挙動を見せてください。",
      "キャッシュキーには `JSON.stringify(args)` を使ってください。エントリは `{ value, expiry: Date.now() + ttl }` として保存します。返す前に、該当エントリが存在し、かつ期限切れでないことを確認してください。",
    ],
  },
  {
    source: [
      "Generic Constraints with keyof",
      "Write a generic function `getProperty<T, K extends keyof T>(obj: T, key: K): T[K]` that safely retrieves a property from an object. Test it with a `Person` interface having `name: string` and `age: number`.",
      "Use `K extends keyof T` to constrain the key parameter to valid keys of T.",
    ],
    target: [
      "keyof を使ったジェネリック制約",
      "オブジェクトから安全にプロパティを取得するジェネリック関数 `getProperty<T, K extends keyof T>(obj: T, key: K): T[K]` を書いてください。`name: string` と `age: number` を持つ `Person` インターフェースでテストしてください。",
      "キー引数を T の有効なキーに制限するには `K extends keyof T` を使ってください。",
    ],
  },
  {
    source: [
      "Utility Types: DeepReadonly and DeepPartial",
      "Implement two recursive utility types:\n1. `DeepReadonly<T>` — makes all properties and nested properties readonly\n2. `DeepPartial<T>` — makes all properties and nested properties optional\nCreate a nested `Config` interface, demonstrate that DeepReadonly prevents assignment, and that DeepPartial allows sparse objects. Print verification messages for each test.",
      "Use mapped types with conditional checks: `T[K] extends object ? DeepX<T[K]> : T[K]`. Exclude functions from recursion with `T[K] extends (...args: any[]) => any`.",
    ],
    target: [
      "DeepReadonly と DeepPartial",
      "再帰的なユーティリティ型を 2 つ実装してください。\n1. `DeepReadonly<T>` — すべてのプロパティとネストしたプロパティを readonly にする\n2. `DeepPartial<T>` — すべてのプロパティとネストしたプロパティを optional にする\nネストした `Config` インターフェースを作り、DeepReadonly では代入できないこと、DeepPartial では疎なオブジェクトを許可できることを示してください。各テストの確認メッセージも出力してください。",
      "mapped type と条件型を組み合わせて `T[K] extends object ? DeepX<T[K]> : T[K]` のように書いてください。関数は `T[K] extends (...args: any[]) => any` で判定し、再帰対象から除外します。",
    ],
  },
  {
    source: [
      "Type-Safe Builder Pattern with Phantom Types",
      "Implement a type-safe `QueryBuilder` that uses phantom types to enforce the correct query construction order at compile time. The builder must require:\n1. `.from(table)` first\n2. `.where(condition)` second (only callable after from)\n3. `.select(fields)` third (only callable after where)\n4. `.build()` (only callable after select)\nUse branded types / interfaces with flags to track builder state. Demonstrate building valid queries and print the SQL strings.",
      "Use a generic type parameter that tracks which steps have been completed. Each method adds a flag to the state type using intersection. The `this` parameter enforces prerequisites.",
    ],
    target: [
      "ファントム型による型安全ビルダーパターン",
      "コンパイル時に正しいクエリ構築順序を強制する、型安全な `QueryBuilder` をファントム型で実装してください。ビルダーは次の順序を必須にします。\n1. 先に `.from(table)`\n2. 次に `.where(condition)`（`from` の後でのみ呼べる）\n3. その次に `.select(fields)`（`where` の後でのみ呼べる）\n4. 最後に `.build()`（`select` の後でのみ呼べる）\nブランド型 / フラグ付きインターフェースで状態を追跡し、正しいクエリを組み立てて SQL 文字列を出力してください。",
      "どの手順まで完了したかを表すジェネリック型パラメータを使ってください。各メソッドは intersection により状態型へフラグを追加します。`this` パラメータで呼び出し前提条件を強制できます。",
    ],
  },
  {
    source: [
      "Discriminated Union with Exhaustive Check",
      "Create a discriminated union `Shape` with types `Circle` (radius), `Rectangle` (width, height), and `Triangle` (base, height). Write a function `area(shape: Shape): number` using a switch statement with exhaustive checking. Print the area for each shape.",
      "Use a `kind` property as the discriminant. TypeScript narrows the type automatically in each switch case.",
    ],
    target: [
      "網羅チェック付き判別可能共用体",
      "`Circle`（radius）、`Rectangle`（width, height）、`Triangle`（base, height）からなる判別可能共用体 `Shape` を作ってください。網羅チェック付きの switch 文を使って `area(shape: Shape): number` を書き、各図形の面積を出力してください。",
      "判別には `kind` プロパティを使ってください。TypeScript は switch の各 case の中で型を自動的に絞り込みます。",
    ],
  },
  {
    source: [
      "Discriminated Unions with Exhaustive Matching",
      "Model a shape calculation system using discriminated unions. Define shapes:\n- `Circle: { kind: \"circle\"; radius: number }`\n- `Rectangle: { kind: \"rectangle\"; width: number; height: number }`\n- `Triangle: { kind: \"triangle\"; base: number; height: number }`\n- `Polygon: { kind: \"polygon\"; sides: number; sideLength: number }`\nImplement `area(shape: Shape): number` with exhaustive matching (using a `never` check). Also implement `describe(shape: Shape): string`. Test with one of each shape.",
      "Use a `switch` on the `kind` property. Add a `default` case that calls a function taking `never` — this ensures compile-time errors if you forget a case. Each case narrows the type automatically.",
    ],
    target: [
      "網羅的マッチングを使う判別可能共用体",
      "判別可能共用体を使って図形計算システムをモデル化してください。次の図形を定義します。\n- `Circle: { kind: \"circle\"; radius: number }`\n- `Rectangle: { kind: \"rectangle\"; width: number; height: number }`\n- `Triangle: { kind: \"triangle\"; base: number; height: number }`\n- `Polygon: { kind: \"polygon\"; sides: number; sideLength: number }`\n`never` チェックを使った網羅的マッチングで `area(shape: Shape): number` を実装し、さらに `describe(shape: Shape): string` も実装してください。各図形を 1 つずつ使ってテストしてください。",
      "`kind` プロパティに対する `switch` を使ってください。`default` で `never` を受け取る関数を呼ぶと、case の書き漏れがあるとコンパイル時に検出できます。各 case では型が自動的に絞り込まれます。",
    ],
  },
  {
    source: [
      "Type-Safe Result Monad",
      "Implement a `Result<T, E>` type (similar to Rust's Result) using discriminated unions:\n- `Ok<T>` with `{ ok: true; value: T }`\n- `Err<E>` with `{ ok: false; error: E }`\nImplement these functions:\n- `ok<T>(value: T): Result<T, never>` and `err<E>(error: E): Result<never, E>`\n- `map<T, E, U>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>`\n- `flatMap<T, E, U>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E>`\n- `unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T`\nDemonstrate by parsing and validating user input through a chain of Result operations.",
      "Use `ok: true` / `ok: false` as the discriminant. In `map` and `flatMap`, check `result.ok` to narrow the type. `flatMap` differs from `map` in that the function itself returns a Result.",
    ],
    target: [
      "型安全な Result モナド",
      "判別可能共用体を使って `Result<T, E>` 型（Rust の Result に似たもの）を実装してください。\n- `Ok<T>` は `{ ok: true; value: T }`\n- `Err<E>` は `{ ok: false; error: E }`\nさらに次の関数を実装してください。\n- `ok<T>(value: T): Result<T, never>` と `err<E>(error: E): Result<never, E>`\n- `map<T, E, U>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>`\n- `flatMap<T, E, U>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E>`\n- `unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T`\nResult 操作を連鎖させて、ユーザー入力の解析と検証を実演してください。",
      "`ok: true` / `ok: false` を判別用プロパティとして使ってください。`map` と `flatMap` では `result.ok` を確認して型を絞り込みます。`flatMap` は、渡す関数自体が Result を返す点で `map` と異なります。",
    ],
  },
  {
    source: [
      "Sequential vs Parallel Async Execution",
      "Write two functions: `sequential()` that runs three async tasks one after another, and `parallel()` that runs them simultaneously with `Promise.all`. Each task simulates a delay. Print the execution time for each approach.",
      "For sequential: use `await` on each call. For parallel: use `Promise.all([...])` to run all at once.",
    ],
    target: [
      "順次実行と並列実行の比較",
      "2 つの関数を書いてください。`sequential()` は 3 つの async タスクを 1 つずつ順番に実行し、`parallel()` は `Promise.all` で同時実行します。各タスクは遅延を模擬します。それぞれの実行時間を出力してください。",
      "順次実行では各呼び出しごとに `await` を使います。並列実行では `Promise.all([...])` を使って一度に走らせてください。",
    ],
  },
  {
    source: [
      "Rate-Limited Concurrent Executor",
      "Implement `asyncPool<T>(concurrency: number, tasks: (() => Promise<T>)[]): Promise<T[]>` that executes async tasks with a concurrency limit. For example, with concurrency 2 and 5 tasks, at most 2 tasks run simultaneously. Each task should log when it starts and finishes. Return results in order. Test with simulated API calls of varying durations.",
      "Create N worker functions (where N = concurrency) that each pull the next task from a shared index. All workers run concurrently via Promise.all, but each worker processes tasks sequentially.",
    ],
    target: [
      "同時実行数を制限する実行器",
      "同時実行数に上限を設けて async タスクを実行する `asyncPool<T>(concurrency: number, tasks: (() => Promise<T>)[]): Promise<T[]>` を実装してください。たとえば concurrency が 2、タスクが 5 個なら、同時に走るのは最大 2 個までです。各タスクは開始時と終了時にログを出し、結果は元の順序で返してください。実行時間の異なる疑似 API 呼び出しでテストしてください。",
      "N 個（`N = concurrency`）の worker 関数を作り、それぞれが共有 index から次のタスクを引き取る形にしてください。worker 同士は `Promise.all` で並列実行しますが、各 worker の中ではタスクを順番に処理します。",
    ],
  },
  {
    source: [
      "Retry with Exponential Backoff and Circuit Breaker",
      "Implement two async utilities:\n1. `retry<T>(fn: () => Promise<T>, options: { maxRetries: number; baseDelay: number; backoffFactor: number }): Promise<T>` — retries with exponential backoff on failure\n2. `CircuitBreaker` class with states: CLOSED (normal), OPEN (failing, reject immediately), HALF_OPEN (testing). Configure with `failureThreshold`, `resetTimeout`. Log state transitions.\nDemonstrate with a flaky API that fails N times then succeeds.",
      "For retry: loop with try/catch, computing delay as `baseDelay * backoffFactor^attempt`. For circuit breaker: track failure count and timestamps. In OPEN state, check if resetTimeout has elapsed before allowing a test call (HALF_OPEN).",
    ],
    target: [
      "指数バックオフ付きリトライとサーキットブレーカー",
      "2 つの async ユーティリティを実装してください。\n1. `retry<T>(fn: () => Promise<T>, options: { maxRetries: number; baseDelay: number; backoffFactor: number }): Promise<T>` — 失敗時に指数バックオフで再試行する\n2. `CircuitBreaker` クラス。状態は CLOSED（通常）、OPEN（障害中で即 reject）、HALF_OPEN（試験中）です。`failureThreshold` と `resetTimeout` で設定し、状態遷移をログに出してください。\nN 回失敗した後に成功する不安定な API を使って実演してください。",
      "retry では `try/catch` を使ってループし、待機時間を `baseDelay * backoffFactor^attempt` で計算してください。circuit breaker では失敗回数と時刻を追跡します。OPEN 状態では `resetTimeout` が経過したか確認してから試験呼び出し（HALF_OPEN）を許可してください。",
    ],
  },
];

export const TR_PRACTICE_TRANSLATIONS: PracticeTranslationEntry[] = [];
