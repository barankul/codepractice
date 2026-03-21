import type { OfflinePractice } from "../practiceRandomizer";

export const SQL_PRACTICES: OfflinePractice[] = [
  // ============================================================
  // SELECT Basics — Level 1
  // ============================================================
  {
    lang: "SQL",
    topic: "SELECT Basics",
    level: 1,
    title: "Select All Columns from Users",
    task: "Write a query that retrieves all columns and all rows from the `users` table.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT * FROM users;",
    expectedOutput: "All rows from the users table with columns: id, name, email, age, city",
    hint: "Use SELECT * to select every column from a table.",
    judgeFeedback: {
      summary: "Make sure you are selecting from the correct table and using the asterisk (*) wildcard to retrieve all columns.",
      lines: [
        { line: 1, problem: "Missing or incorrect table name", fix: "Use FROM users to specify the users table" },
        { line: 1, problem: "Listing columns instead of using *", fix: "While listing columns works, SELECT * is the simplest way to get all columns" }
      ]
    },
    altMethods: [
      {
        name: "Explicit column listing",
        code: "SELECT id, name, email, age, city FROM users;",
        explanation: "Instead of using *, you can explicitly list every column. This is often preferred in production code because it makes the query's intent clear and avoids issues when table schemas change."
      },
      {
        name: "Using table alias",
        code: "SELECT u.* FROM users u;",
        explanation: "You can assign an alias to the table and use alias.* to select all columns. This is useful when working with multiple tables in joins."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "SELECT Basics",
    level: 1,
    title: "Select Specific Columns",
    task: "Write a query that retrieves only the name and email columns from the `users` table.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT name, email FROM users;",
    expectedOutput: "All rows showing only the name and email columns from the users table",
    hint: "List the column names you want separated by commas after SELECT.",
    judgeFeedback: {
      summary: "Ensure you are selecting exactly the name and email columns — no more, no fewer.",
      lines: [
        { line: 1, problem: "Using SELECT * instead of specific columns", fix: "Replace * with name, email to select only those two columns" },
        { line: 1, problem: "Misspelled column name", fix: "Double-check column names: name and email (both lowercase)" }
      ]
    },
    altMethods: [
      {
        name: "With table prefix",
        code: "SELECT users.name, users.email FROM users;",
        explanation: "Prefixing column names with the table name is optional for single-table queries but becomes important when joining multiple tables that share column names."
      },
      {
        name: "With alias prefix",
        code: "SELECT u.name, u.email FROM users AS u;",
        explanation: "Using AS to define a table alias makes queries shorter and more readable, especially in complex queries with multiple tables."
      }
    ]
  },

  // ============================================================
  // SELECT Basics — Level 2
  // ============================================================
  {
    lang: "SQL",
    topic: "SELECT Basics",
    level: 2,
    title: "Select Distinct Cities",
    task: "Write a query that retrieves a list of unique cities from the `users` table. Each city should appear only once in the results.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT DISTINCT city FROM users;",
    expectedOutput: "A list of unique city values from the users table, with no duplicates",
    hint: "Use the DISTINCT keyword after SELECT to eliminate duplicate values.",
    judgeFeedback: {
      summary: "The DISTINCT keyword must appear right after SELECT to remove duplicate rows from the result.",
      lines: [
        { line: 1, problem: "Missing DISTINCT keyword", fix: "Add DISTINCT after SELECT: SELECT DISTINCT city FROM users" },
        { line: 1, problem: "DISTINCT placed in wrong position", fix: "DISTINCT must come immediately after SELECT, before the column name" }
      ]
    },
    altMethods: [
      {
        name: "Using GROUP BY",
        code: "SELECT city FROM users GROUP BY city;",
        explanation: "GROUP BY groups identical values together, effectively removing duplicates. This approach is functionally equivalent to DISTINCT for a single column."
      },
      {
        name: "Using UNION (self-union trick)",
        code: "SELECT city FROM users UNION SELECT city FROM users;",
        explanation: "UNION automatically removes duplicates between result sets. Unioning a table with itself produces distinct values, though this is less efficient and not recommended in practice."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "SELECT Basics",
    level: 2,
    title: "Select with Column Aliases",
    task: "Write a query that selects the name column as 'user_name' and the email column as 'contact_email' from the `users` table.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT name AS user_name, email AS contact_email FROM users;",
    expectedOutput: "All rows with columns labeled user_name and contact_email",
    hint: "Use the AS keyword to rename a column in the output: column_name AS alias_name.",
    judgeFeedback: {
      summary: "Column aliases rename the output columns. Use AS between the original name and the alias.",
      lines: [
        { line: 1, problem: "Missing AS keyword or alias", fix: "Use SELECT name AS user_name, email AS contact_email FROM users" },
        { line: 1, problem: "Alias names do not match requirements", fix: "The aliases must be exactly user_name and contact_email" }
      ]
    },
    altMethods: [
      {
        name: "Without AS keyword",
        code: "SELECT name user_name, email contact_email FROM users;",
        explanation: "In SQL, the AS keyword is optional — you can place the alias directly after the column name. However, using AS is more readable and recommended."
      },
      {
        name: "With quoted aliases",
        code: "SELECT name AS 'user_name', email AS 'contact_email' FROM users;",
        explanation: "Wrapping aliases in quotes allows spaces or special characters in alias names. For simple names it is optional, but it is a good habit for consistency."
      }
    ]
  },

  // ============================================================
  // SELECT Basics — Level 3
  // ============================================================
  {
    lang: "SQL",
    topic: "SELECT Basics",
    level: 3,
    title: "Select with CASE Expression",
    task: "Write a query that selects the name and age from the `users` table, and adds a column called 'age_group' that categorizes users as:\n  - 'Young' if age < 25\n  - 'Adult' if age >= 25 AND age < 40\n  - 'Senior' if age >= 40\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT name, age,\n  CASE\n    WHEN age < 25 THEN 'Young'\n    WHEN age >= 25 AND age < 40 THEN 'Adult'\n    ELSE 'Senior'\n  END AS age_group\nFROM users;",
    expectedOutput: "Each user's name, age, and their age_group classification (Young, Adult, or Senior)",
    hint: "Use a CASE WHEN ... THEN ... ELSE ... END expression to create conditional output.",
    judgeFeedback: {
      summary: "The CASE expression must cover all three age categories and be aliased as age_group.",
      lines: [
        { line: 1, problem: "Missing CASE expression", fix: "Add CASE WHEN age < 25 THEN 'Young' WHEN age >= 25 AND age < 40 THEN 'Adult' ELSE 'Senior' END AS age_group" },
        { line: 3, problem: "Incorrect boundary conditions", fix: "Make sure the ranges don't overlap: < 25 for Young, >= 25 AND < 40 for Adult, >= 40 for Senior" }
      ]
    },
    altMethods: [
      {
        name: "Using nested CASE without AND",
        code: "SELECT name, age,\n  CASE\n    WHEN age < 25 THEN 'Young'\n    WHEN age < 40 THEN 'Adult'\n    ELSE 'Senior'\n  END AS age_group\nFROM users;",
        explanation: "Since CASE evaluates conditions in order, if age < 25 is false, we already know age >= 25, so the second WHEN only needs age < 40. This is cleaner and avoids redundant conditions."
      },
      {
        name: "Using IIF (SQLite-specific)",
        code: "SELECT name, age,\n  IIF(age < 25, 'Young', IIF(age < 40, 'Adult', 'Senior')) AS age_group\nFROM users;",
        explanation: "SQLite supports the IIF function as a shorthand for simple conditional logic. Nesting IIF calls achieves the same result but can become hard to read with many conditions."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "SELECT Basics",
    level: 3,
    title: "Select with String Concatenation",
    task: "Write a query that selects a column called 'user_info' that combines each user's name and city in the format: 'Name (City)'. For example: 'Alice (New York)'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT name || ' (' || city || ')' AS user_info FROM users;",
    expectedOutput: "A single column user_info with values like 'Alice (New York)', 'Bob (London)', etc.",
    hint: "In SQLite, use the || operator to concatenate strings together.",
    judgeFeedback: {
      summary: "Use the || operator in SQLite to join strings. Make sure the format matches 'Name (City)' exactly.",
      lines: [
        { line: 1, problem: "Using + instead of || for concatenation", fix: "SQLite uses || for string concatenation, not +" },
        { line: 1, problem: "Missing parentheses or spaces in format", fix: "The format must be: name || ' (' || city || ')' to produce 'Name (City)'" }
      ]
    },
    altMethods: [
      {
        name: "Using printf function",
        code: "SELECT printf('%s (%s)', name, city) AS user_info FROM users;",
        explanation: "SQLite's printf function works like C's printf, allowing formatted string output with placeholders. This can be cleaner for complex formatting."
      },
      {
        name: "Using CONCAT via || with COALESCE for NULL safety",
        code: "SELECT COALESCE(name, '') || ' (' || COALESCE(city, '') || ')' AS user_info FROM users;",
        explanation: "Wrapping each value in COALESCE ensures that NULL values don't make the entire concatenation NULL. This is a defensive programming practice."
      }
    ]
  },

  // ============================================================
  // WHERE — Level 1
  // ============================================================
  {
    lang: "SQL",
    topic: "WHERE",
    level: 1,
    title: "Filter Users by Age",
    task: "Write a query that selects all columns from the `users` table where the user's age is greater than 25.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT * FROM users WHERE age > 25;",
    expectedOutput: "All columns for users whose age is greater than 25",
    hint: "Add a WHERE clause after FROM to filter rows: WHERE age > 25.",
    judgeFeedback: {
      summary: "The WHERE clause filters rows based on a condition. Use the > operator for 'greater than' comparisons.",
      lines: [
        { line: 1, problem: "Missing WHERE clause", fix: "Add WHERE age > 25 after FROM users" },
        { line: 1, problem: "Using >= instead of >", fix: "The requirement says greater than 25, not greater than or equal to. Use > not >=" }
      ]
    },
    altMethods: [
      {
        name: "Using NOT and <=",
        code: "SELECT * FROM users WHERE NOT age <= 25;",
        explanation: "NOT inverts the condition. NOT (age <= 25) is logically equivalent to age > 25. While valid, the direct comparison is more readable."
      },
      {
        name: "Explicit column list",
        code: "SELECT id, name, email, age, city FROM users WHERE age > 25;",
        explanation: "Listing all columns explicitly instead of using * achieves the same result but makes the selected columns clearer in the query."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "WHERE",
    level: 1,
    title: "Filter Users by City",
    task: "Write a query that selects the name and email of all users who live in 'New York'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT name, email FROM users WHERE city = 'New York';",
    expectedOutput: "Names and emails of users living in New York",
    hint: "Use WHERE city = 'New York' to filter by a specific text value. Remember to use single quotes around text values.",
    judgeFeedback: {
      summary: "String comparisons in SQL require single quotes around the text value.",
      lines: [
        { line: 1, problem: "Missing quotes around New York", fix: "Text values must be enclosed in single quotes: WHERE city = 'New York'" },
        { line: 1, problem: "Using double quotes instead of single quotes", fix: "SQL uses single quotes for string literals: 'New York' not \"New York\"" }
      ]
    },
    altMethods: [
      {
        name: "Case-insensitive comparison",
        code: "SELECT name, email FROM users WHERE LOWER(city) = 'new york';",
        explanation: "Using LOWER() on both sides ensures the comparison works regardless of how the city was stored. This is a good defensive practice."
      },
      {
        name: "Using LIKE for exact match",
        code: "SELECT name, email FROM users WHERE city LIKE 'New York';",
        explanation: "LIKE without wildcards behaves like = for exact matches. However, LIKE is case-insensitive in SQLite by default for ASCII characters, which can be a subtle difference."
      }
    ]
  },

  // ============================================================
  // WHERE — Level 2
  // ============================================================
  {
    lang: "SQL",
    topic: "WHERE",
    level: 2,
    title: "Filter with AND/OR Conditions",
    task: "Write a query that selects all columns from the `users` table where the user's age is greater than 20 AND the city is either 'New York' OR 'London'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT * FROM users WHERE age > 20 AND (city = 'New York' OR city = 'London');",
    expectedOutput: "Users older than 20 who live in New York or London",
    hint: "Use AND to combine conditions and OR for alternatives. Use parentheses to group the OR conditions.",
    judgeFeedback: {
      summary: "When mixing AND and OR, use parentheses to ensure correct evaluation order. AND has higher precedence than OR.",
      lines: [
        { line: 1, problem: "Missing parentheses around OR conditions", fix: "Wrap the OR part in parentheses: AND (city = 'New York' OR city = 'London')" },
        { line: 1, problem: "Incorrect operator precedence", fix: "Without parentheses, AND binds tighter than OR, potentially changing the logic" }
      ]
    },
    altMethods: [
      {
        name: "Using IN operator",
        code: "SELECT * FROM users WHERE age > 20 AND city IN ('New York', 'London');",
        explanation: "The IN operator is a cleaner way to check if a value matches any value in a list. It replaces multiple OR conditions on the same column."
      },
      {
        name: "Using separate conditions with UNION",
        code: "SELECT * FROM users WHERE age > 20 AND city = 'New York'\nUNION\nSELECT * FROM users WHERE age > 20 AND city = 'London';",
        explanation: "UNION combines results from two queries and removes duplicates. While this works, it is less efficient than a single query with OR or IN."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "WHERE",
    level: 2,
    title: "Filter with IN Operator",
    task: "Write a query that selects the name and city from the `users` table where the city is one of: 'New York', 'London', or 'Tokyo'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT name, city FROM users WHERE city IN ('New York', 'London', 'Tokyo');",
    expectedOutput: "Names and cities of users living in New York, London, or Tokyo",
    hint: "Use the IN operator followed by a parenthesized list of values: WHERE column IN ('value1', 'value2', 'value3').",
    judgeFeedback: {
      summary: "The IN operator checks if a value matches any value in a provided list.",
      lines: [
        { line: 1, problem: "Using multiple OR instead of IN", fix: "Replace city = 'New York' OR city = 'London' OR city = 'Tokyo' with city IN ('New York', 'London', 'Tokyo')" },
        { line: 1, problem: "Missing parentheses around the IN list", fix: "The values after IN must be enclosed in parentheses: IN ('New York', 'London', 'Tokyo')" }
      ]
    },
    altMethods: [
      {
        name: "Using multiple OR conditions",
        code: "SELECT name, city FROM users WHERE city = 'New York' OR city = 'London' OR city = 'Tokyo';",
        explanation: "Multiple OR conditions achieve the same result as IN but are more verbose. The IN operator is preferred for readability when checking against multiple values."
      },
      {
        name: "Using a subquery with VALUES",
        code: "SELECT name, city FROM users WHERE city IN (SELECT column1 FROM (VALUES ('New York'), ('London'), ('Tokyo')));",
        explanation: "You can use a subquery to provide the list of values. This approach is more useful when the list comes from another table or a complex computation."
      }
    ]
  },

  // ============================================================
  // WHERE — Level 3
  // ============================================================
  {
    lang: "SQL",
    topic: "WHERE",
    level: 3,
    title: "Filter with LIKE Pattern Matching",
    task: "Write a query that selects the name and email from the `users` table where the email ends with '@gmail.com'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT name, email FROM users WHERE email LIKE '%@gmail.com';",
    expectedOutput: "Names and emails of users with Gmail addresses",
    hint: "Use LIKE with the % wildcard. % matches any sequence of characters. To find emails ending with a pattern, put % at the beginning.",
    judgeFeedback: {
      summary: "The LIKE operator with % wildcard performs pattern matching. % at the start means 'anything before this'.",
      lines: [
        { line: 1, problem: "Missing % wildcard", fix: "Use '%@gmail.com' — the % matches any characters before @gmail.com" },
        { line: 1, problem: "Using = instead of LIKE", fix: "The = operator requires an exact match. Use LIKE for pattern matching with wildcards" }
      ]
    },
    altMethods: [
      {
        name: "Using GLOB (case-sensitive)",
        code: "SELECT name, email FROM users WHERE email GLOB '*@gmail.com';",
        explanation: "GLOB is SQLite-specific and uses * instead of % as the wildcard. Unlike LIKE, GLOB is case-sensitive by default."
      },
      {
        name: "Using SUBSTR function",
        code: "SELECT name, email FROM users WHERE SUBSTR(email, -10) = '@gmail.com';",
        explanation: "SUBSTR with a negative start position extracts characters from the end of the string. This checks if the last 10 characters are exactly '@gmail.com'."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "WHERE",
    level: 3,
    title: "Filter with BETWEEN and NOT",
    task: "Write a query that selects the name and age from the `users` table where the age is NOT between 20 and 30 (inclusive). This should return users younger than 20 or older than 30.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT name, age FROM users WHERE age NOT BETWEEN 20 AND 30;",
    expectedOutput: "Names and ages of users whose age is less than 20 or greater than 30",
    hint: "BETWEEN checks if a value is within a range (inclusive). Add NOT before BETWEEN to exclude that range.",
    judgeFeedback: {
      summary: "NOT BETWEEN excludes the specified range. BETWEEN is inclusive, so NOT BETWEEN 20 AND 30 excludes ages 20 through 30.",
      lines: [
        { line: 1, problem: "Using NOT in wrong position", fix: "NOT goes directly before BETWEEN: WHERE age NOT BETWEEN 20 AND 30" },
        { line: 1, problem: "Off-by-one error with boundary values", fix: "BETWEEN is inclusive on both ends. NOT BETWEEN 20 AND 30 excludes 20 and 30" }
      ]
    },
    altMethods: [
      {
        name: "Using comparison operators",
        code: "SELECT name, age FROM users WHERE age < 20 OR age > 30;",
        explanation: "Using < and > with OR is equivalent to NOT BETWEEN. This approach makes the boundary conditions explicit."
      },
      {
        name: "Using NOT with parenthesized BETWEEN",
        code: "SELECT name, age FROM users WHERE NOT (age BETWEEN 20 AND 30);",
        explanation: "Wrapping the BETWEEN expression in parentheses and negating the whole thing with NOT is another valid syntax that some developers find more readable."
      }
    ]
  },

  // ============================================================
  // JOIN Basics — Level 1
  // ============================================================
  {
    lang: "SQL",
    topic: "JOIN Basics",
    level: 1,
    title: "Inner Join Users and Orders",
    task: "Write a query that joins the `users` and `orders` tables to show each user's name alongside their order product and amount. Use an INNER JOIN.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT users.name, orders.product, orders.amount\nFROM users\nINNER JOIN orders ON users.id = orders.user_id;",
    expectedOutput: "Each order row paired with the user's name, showing name, product, and amount",
    hint: "Use INNER JOIN with the ON clause to specify how the tables are related: users.id = orders.user_id.",
    judgeFeedback: {
      summary: "An INNER JOIN returns only rows that have matching values in both tables. The ON clause specifies the join condition.",
      lines: [
        { line: 2, problem: "Missing or incorrect ON clause", fix: "Use ON users.id = orders.user_id to link users to their orders" },
        { line: 1, problem: "Ambiguous column names", fix: "Prefix column names with the table name (e.g., users.name) to avoid ambiguity" }
      ]
    },
    altMethods: [
      {
        name: "Using implicit join (comma syntax)",
        code: "SELECT users.name, orders.product, orders.amount\nFROM users, orders\nWHERE users.id = orders.user_id;",
        explanation: "The older comma-join syntax with a WHERE clause is functionally equivalent to INNER JOIN. However, explicit JOIN syntax is preferred for clarity."
      },
      {
        name: "Using table aliases",
        code: "SELECT u.name, o.product, o.amount\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id;",
        explanation: "Table aliases (u for users, o for orders) make queries shorter and more readable, especially with multiple joins."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "JOIN Basics",
    level: 1,
    title: "Left Join Users and Orders",
    task: "Write a query that performs a LEFT JOIN between `users` and `orders` to show all users, including those who have never placed an order. Select the user's name, order product, and amount.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT users.name, orders.product, orders.amount\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id;",
    expectedOutput: "All users with their orders. Users without orders show NULL for product and amount.",
    hint: "LEFT JOIN keeps all rows from the left table (users) even if there is no matching row in the right table (orders).",
    judgeFeedback: {
      summary: "A LEFT JOIN includes all rows from the left table. When no match exists in the right table, NULL values are returned for the right table's columns.",
      lines: [
        { line: 2, problem: "Using INNER JOIN instead of LEFT JOIN", fix: "Change INNER JOIN to LEFT JOIN to include users without orders" },
        { line: 2, problem: "Tables in wrong order", fix: "In a LEFT JOIN, the table you want to keep all rows from should come first (before LEFT JOIN)" }
      ]
    },
    altMethods: [
      {
        name: "Using LEFT OUTER JOIN",
        code: "SELECT users.name, orders.product, orders.amount\nFROM users\nLEFT OUTER JOIN orders ON users.id = orders.user_id;",
        explanation: "LEFT OUTER JOIN is the full syntax for LEFT JOIN. The OUTER keyword is optional — LEFT JOIN and LEFT OUTER JOIN are identical."
      },
      {
        name: "With aliases and COALESCE",
        code: "SELECT u.name, COALESCE(o.product, 'No orders') AS product, COALESCE(o.amount, 0) AS amount\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id;",
        explanation: "COALESCE replaces NULL values with a default. This makes the output more user-friendly by showing 'No orders' instead of NULL."
      }
    ]
  },

  // ============================================================
  // JOIN Basics — Level 2
  // ============================================================
  {
    lang: "SQL",
    topic: "JOIN Basics",
    level: 2,
    title: "Join Three Tables",
    task: "Write a query that joins `users`, `orders`, and `products` to show the user's name, the product name from the products table, and the order amount. Match orders.product to products.name.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)\n  products (id INTEGER, name TEXT, category TEXT, price REAL, stock INTEGER)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT u.name AS user_name, p.name AS product_name, o.amount\nFROM orders o\nINNER JOIN users u ON u.id = o.user_id\nINNER JOIN products p ON p.name = o.product;",
    expectedOutput: "Rows showing user_name, product_name, and order amount for each order",
    hint: "Chain multiple JOIN clauses. First join orders with users on user_id, then join with products by matching the product name.",
    judgeFeedback: {
      summary: "Multiple tables can be joined by chaining JOIN clauses. Each JOIN needs its own ON condition.",
      lines: [
        { line: 3, problem: "Missing second JOIN clause", fix: "Add another INNER JOIN for the products table: INNER JOIN products p ON p.name = o.product" },
        { line: 1, problem: "Ambiguous 'name' column", fix: "Both users and products have a 'name' column — use aliases like u.name and p.name to distinguish them" }
      ]
    },
    altMethods: [
      {
        name: "Using subquery instead of triple join",
        code: "SELECT u.name AS user_name, o.product AS product_name, o.amount\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.product IN (SELECT name FROM products);",
        explanation: "A subquery in the WHERE clause can replace the third join if you only need to filter by products that exist in the products table."
      },
      {
        name: "Comma-separated join syntax",
        code: "SELECT u.name AS user_name, p.name AS product_name, o.amount\nFROM users u, orders o, products p\nWHERE u.id = o.user_id AND p.name = o.product;",
        explanation: "The older implicit join syntax lists all tables separated by commas and puts all join conditions in the WHERE clause. Explicit JOIN syntax is recommended for readability."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "JOIN Basics",
    level: 2,
    title: "Subquery Instead of Self-Join",
    task: "Write a query that finds users who live in the same city as the user named 'Alice'. Do not include Alice herself in the results. Select name and city.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT name, city FROM users\nWHERE city = (SELECT city FROM users WHERE name = 'Alice')\nAND name != 'Alice';",
    expectedOutput: "Names and cities of users who live in the same city as Alice (excluding Alice)",
    hint: "Use a subquery in the WHERE clause to first find Alice's city, then find other users in that city.",
    judgeFeedback: {
      summary: "A subquery can be used to look up a value and use it in the outer query's WHERE clause.",
      lines: [
        { line: 2, problem: "Subquery returns multiple rows", fix: "Make sure the subquery WHERE condition uniquely identifies Alice: WHERE name = 'Alice'" },
        { line: 3, problem: "Forgot to exclude Alice from results", fix: "Add AND name != 'Alice' to exclude Alice herself from the result" }
      ]
    },
    altMethods: [
      {
        name: "Using a self-join",
        code: "SELECT u1.name, u1.city\nFROM users u1\nINNER JOIN users u2 ON u1.city = u2.city\nWHERE u2.name = 'Alice' AND u1.name != 'Alice';",
        explanation: "A self-join joins the table with itself. Here u2 finds Alice's row and u1 finds all other users in the same city."
      },
      {
        name: "Using IN with subquery",
        code: "SELECT name, city FROM users\nWHERE city IN (SELECT city FROM users WHERE name = 'Alice')\nAND name != 'Alice';",
        explanation: "Using IN instead of = with the subquery is safer when the subquery might return multiple rows. For a single expected result, both work identically."
      }
    ]
  },

  // ============================================================
  // JOIN Basics — Level 3
  // ============================================================
  {
    lang: "SQL",
    topic: "JOIN Basics",
    level: 3,
    title: "Join with Aggregate — Total Spending",
    task: "Write a query that shows each user's name and their total spending (sum of order amounts). Only include users who have placed orders. Name the total column 'total_spent'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT u.name, SUM(o.amount) AS total_spent\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nGROUP BY u.name;",
    expectedOutput: "Each user's name and their total_spent (sum of all their order amounts)",
    hint: "Join users and orders, then use GROUP BY with SUM() to calculate total spending per user.",
    judgeFeedback: {
      summary: "When using aggregate functions like SUM(), all non-aggregated columns must appear in the GROUP BY clause.",
      lines: [
        { line: 4, problem: "Missing GROUP BY clause", fix: "Add GROUP BY u.name to group results by each user" },
        { line: 1, problem: "Missing SUM aggregate", fix: "Use SUM(o.amount) AS total_spent to calculate the total" }
      ]
    },
    altMethods: [
      {
        name: "Using subquery in SELECT",
        code: "SELECT u.name,\n  (SELECT SUM(o.amount) FROM orders o WHERE o.user_id = u.id) AS total_spent\nFROM users u\nWHERE u.id IN (SELECT user_id FROM orders);",
        explanation: "A correlated subquery in the SELECT clause calculates the sum for each user. The WHERE clause filters to only users with orders."
      },
      {
        name: "Group by user ID instead of name",
        code: "SELECT u.name, SUM(o.amount) AS total_spent\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nGROUP BY u.id;",
        explanation: "Grouping by u.id is more correct than by u.name because IDs are guaranteed unique while names might not be. SQLite allows selecting u.name when grouping by u.id."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "JOIN Basics",
    level: 3,
    title: "Join with HAVING Clause",
    task: "Write a query that shows each user's name and their order count, but only for users who have placed more than 2 orders. Name the count column 'order_count'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT u.name, COUNT(o.id) AS order_count\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nGROUP BY u.name\nHAVING COUNT(o.id) > 2;",
    expectedOutput: "Names and order_count for users who have more than 2 orders",
    hint: "Use HAVING after GROUP BY to filter groups. HAVING is like WHERE but for aggregated results.",
    judgeFeedback: {
      summary: "HAVING filters groups after aggregation, while WHERE filters rows before aggregation. Use HAVING with aggregate conditions.",
      lines: [
        { line: 5, problem: "Using WHERE instead of HAVING for aggregate filter", fix: "WHERE cannot use aggregate functions. Use HAVING COUNT(o.id) > 2 after GROUP BY" },
        { line: 4, problem: "Missing GROUP BY", fix: "GROUP BY u.name is required before HAVING to group orders by user" }
      ]
    },
    altMethods: [
      {
        name: "Using a subquery",
        code: "SELECT u.name, sub.order_count\nFROM users u\nINNER JOIN (\n  SELECT user_id, COUNT(*) AS order_count\n  FROM orders\n  GROUP BY user_id\n  HAVING COUNT(*) > 2\n) sub ON u.id = sub.user_id;",
        explanation: "Moving the aggregation into a subquery separates the counting logic from the join. This can be easier to understand for complex queries."
      },
      {
        name: "Using COUNT(*) instead of COUNT(column)",
        code: "SELECT u.name, COUNT(*) AS order_count\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nGROUP BY u.name\nHAVING COUNT(*) > 2;",
        explanation: "COUNT(*) counts all rows in each group, while COUNT(o.id) counts non-NULL values. Since o.id is never NULL in matched joins, both produce the same result here."
      }
    ]
  },

  // ============================================================
  // GROUP BY — Level 1
  // ============================================================
  {
    lang: "SQL",
    topic: "GROUP BY",
    level: 1,
    title: "Count Users Per City",
    task: "Write a query that counts the number of users in each city. Select the city and the count, naming the count column 'user_count'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT city, COUNT(*) AS user_count FROM users GROUP BY city;",
    expectedOutput: "Each city with the number of users living there (e.g., New York: 3, London: 2)",
    hint: "Use GROUP BY to group rows by city, and COUNT(*) to count the number of rows in each group.",
    judgeFeedback: {
      summary: "GROUP BY groups rows with the same value together. COUNT(*) counts how many rows are in each group.",
      lines: [
        { line: 1, problem: "Missing GROUP BY clause", fix: "Add GROUP BY city after FROM users to group results by city" },
        { line: 1, problem: "COUNT without alias", fix: "Use COUNT(*) AS user_count to name the count column" }
      ]
    },
    altMethods: [
      {
        name: "Using COUNT with column name",
        code: "SELECT city, COUNT(id) AS user_count FROM users GROUP BY city;",
        explanation: "COUNT(id) counts non-NULL id values per group. Since id is never NULL, this is equivalent to COUNT(*) but explicitly references a column."
      },
      {
        name: "With ORDER BY for sorted output",
        code: "SELECT city, COUNT(*) AS user_count FROM users GROUP BY city ORDER BY user_count DESC;",
        explanation: "Adding ORDER BY user_count DESC sorts the results from the city with the most users to the fewest, making the output more useful."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "GROUP BY",
    level: 1,
    title: "Average Age Per City",
    task: "Write a query that calculates the average age of users in each city. Select the city and the average age, naming it 'avg_age'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT city, AVG(age) AS avg_age FROM users GROUP BY city;",
    expectedOutput: "Each city with the average age of its users",
    hint: "Use the AVG() aggregate function with GROUP BY to compute the average per group.",
    judgeFeedback: {
      summary: "AVG() calculates the arithmetic mean of values in each group. Non-aggregated columns must be in GROUP BY.",
      lines: [
        { line: 1, problem: "Using SUM instead of AVG", fix: "AVG(age) computes the average directly. SUM(age)/COUNT(*) would also work but AVG is simpler." },
        { line: 1, problem: "Missing GROUP BY", fix: "Without GROUP BY city, AVG will calculate the average across all users instead of per city" }
      ]
    },
    altMethods: [
      {
        name: "Manual average with SUM and COUNT",
        code: "SELECT city, CAST(SUM(age) AS REAL) / COUNT(*) AS avg_age FROM users GROUP BY city;",
        explanation: "Computing the average manually as SUM/COUNT gives the same result. CAST to REAL ensures decimal division instead of integer division."
      },
      {
        name: "Rounded average",
        code: "SELECT city, ROUND(AVG(age), 1) AS avg_age FROM users GROUP BY city;",
        explanation: "ROUND(AVG(age), 1) rounds the average to one decimal place, making the output cleaner and easier to read."
      }
    ]
  },

  // ============================================================
  // GROUP BY — Level 2
  // ============================================================
  {
    lang: "SQL",
    topic: "GROUP BY",
    level: 2,
    title: "Count Orders Per User with HAVING",
    task: "Write a query that counts orders per user and only shows users with at least 2 orders. Join users and orders, then select user name and order count (named 'order_count').\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT u.name, COUNT(*) AS order_count\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nGROUP BY u.name\nHAVING COUNT(*) >= 2;",
    expectedOutput: "User names and their order_count, only for users with 2 or more orders",
    hint: "After GROUP BY, use HAVING to filter groups based on aggregate values. HAVING COUNT(*) >= 2 keeps only groups with at least 2 rows.",
    judgeFeedback: {
      summary: "HAVING filters the results after grouping. It works with aggregate functions, unlike WHERE.",
      lines: [
        { line: 5, problem: "Using WHERE instead of HAVING", fix: "Aggregate conditions must use HAVING, not WHERE. Move COUNT(*) >= 2 to a HAVING clause" },
        { line: 5, problem: "Using > 2 instead of >= 2", fix: "The requirement says 'at least 2', which means >= 2, not > 2" }
      ]
    },
    altMethods: [
      {
        name: "Using subquery approach",
        code: "SELECT name, order_count FROM (\n  SELECT u.name, COUNT(*) AS order_count\n  FROM users u\n  INNER JOIN orders o ON u.id = o.user_id\n  GROUP BY u.name\n) WHERE order_count >= 2;",
        explanation: "Wrapping the grouped query in a subquery lets you use WHERE on the alias in the outer query. This is sometimes clearer for complex filtering."
      },
      {
        name: "Group by user ID",
        code: "SELECT u.name, COUNT(o.id) AS order_count\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nGROUP BY u.id, u.name\nHAVING COUNT(o.id) >= 2;",
        explanation: "Grouping by both u.id and u.name is more robust because it handles cases where two users share the same name. COUNT(o.id) explicitly counts order rows."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "GROUP BY",
    level: 2,
    title: "Sum and Average with GROUP BY",
    task: "Write a query that shows each product category with the total stock (named 'total_stock') and average price (named 'avg_price') from the `products` table.\n\nTable structure:\n  products (id INTEGER, name TEXT, category TEXT, price REAL, stock INTEGER)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT category, SUM(stock) AS total_stock, AVG(price) AS avg_price\nFROM products\nGROUP BY category;",
    expectedOutput: "Each product category with its total_stock and avg_price",
    hint: "You can use multiple aggregate functions in a single SELECT. Group by category to see aggregates per category.",
    judgeFeedback: {
      summary: "Multiple aggregate functions can be used in the same query. Each one operates on the groups defined by GROUP BY.",
      lines: [
        { line: 1, problem: "Only one aggregate function used", fix: "Include both SUM(stock) AS total_stock and AVG(price) AS avg_price in the SELECT" },
        { line: 2, problem: "Missing GROUP BY", fix: "Add GROUP BY category to aggregate per product category" }
      ]
    },
    altMethods: [
      {
        name: "With rounded average and sorted output",
        code: "SELECT category, SUM(stock) AS total_stock, ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY category\nORDER BY avg_price DESC;",
        explanation: "ROUND(AVG(price), 2) rounds the average to 2 decimal places for currency formatting. ORDER BY sorts categories by average price descending."
      },
      {
        name: "With additional COUNT",
        code: "SELECT category, COUNT(*) AS product_count, SUM(stock) AS total_stock, AVG(price) AS avg_price\nFROM products\nGROUP BY category;",
        explanation: "Adding COUNT(*) shows how many products are in each category, giving more context to the total_stock and avg_price values."
      }
    ]
  },

  // ============================================================
  // GROUP BY — Level 3
  // ============================================================
  {
    lang: "SQL",
    topic: "GROUP BY",
    level: 3,
    title: "Multiple Aggregations in One Query",
    task: "Write a query that shows each city with:\n  - the number of users (as 'user_count')\n  - the youngest age (as 'min_age')\n  - the oldest age (as 'max_age')\n  - the average age rounded to 1 decimal (as 'avg_age')\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT city,\n  COUNT(*) AS user_count,\n  MIN(age) AS min_age,\n  MAX(age) AS max_age,\n  ROUND(AVG(age), 1) AS avg_age\nFROM users\nGROUP BY city;",
    expectedOutput: "Each city with user_count, min_age, max_age, and avg_age",
    hint: "Use COUNT, MIN, MAX, and AVG aggregate functions together. ROUND(value, 1) rounds to 1 decimal place.",
    judgeFeedback: {
      summary: "You can combine any number of aggregate functions in one SELECT. Each operates independently on the same groups.",
      lines: [
        { line: 1, problem: "Missing one or more aggregate functions", fix: "Include all four: COUNT(*), MIN(age), MAX(age), ROUND(AVG(age), 1)" },
        { line: 5, problem: "AVG not rounded", fix: "Use ROUND(AVG(age), 1) to round the average to 1 decimal place" }
      ]
    },
    altMethods: [
      {
        name: "With age range calculation",
        code: "SELECT city,\n  COUNT(*) AS user_count,\n  MIN(age) AS min_age,\n  MAX(age) AS max_age,\n  ROUND(AVG(age), 1) AS avg_age,\n  MAX(age) - MIN(age) AS age_range\nFROM users\nGROUP BY city;",
        explanation: "Adding MAX(age) - MIN(age) as age_range shows the spread of ages in each city. Aggregate expressions can be combined with arithmetic operators."
      },
      {
        name: "Filtered with HAVING",
        code: "SELECT city,\n  COUNT(*) AS user_count,\n  MIN(age) AS min_age,\n  MAX(age) AS max_age,\n  ROUND(AVG(age), 1) AS avg_age\nFROM users\nGROUP BY city\nHAVING COUNT(*) > 1;",
        explanation: "Adding HAVING COUNT(*) > 1 filters out cities with only one user, showing aggregation statistics only where they are meaningful."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "GROUP BY",
    level: 3,
    title: "GROUP BY with CASE Categories",
    task: "Write a query that categorizes products into price ranges and counts how many products fall into each range:\n  - 'Budget' if price < 20\n  - 'Mid-Range' if price >= 20 AND price < 50\n  - 'Premium' if price >= 50\nName the category column 'price_range' and the count column 'product_count'.\n\nTable structure:\n  products (id INTEGER, name TEXT, category TEXT, price REAL, stock INTEGER)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT\n  CASE\n    WHEN price < 20 THEN 'Budget'\n    WHEN price >= 20 AND price < 50 THEN 'Mid-Range'\n    ELSE 'Premium'\n  END AS price_range,\n  COUNT(*) AS product_count\nFROM products\nGROUP BY price_range;",
    expectedOutput: "Three rows showing Budget, Mid-Range, and Premium with their product_count",
    hint: "Use a CASE expression to create categories, then GROUP BY that expression or its alias.",
    judgeFeedback: {
      summary: "You can GROUP BY a CASE expression (or its alias in SQLite) to create custom categories for aggregation.",
      lines: [
        { line: 2, problem: "CASE expression not in GROUP BY", fix: "Add GROUP BY price_range (or repeat the full CASE expression) to group by the computed categories" },
        { line: 3, problem: "Incorrect price boundaries", fix: "Ensure ranges don't overlap: < 20 for Budget, >= 20 AND < 50 for Mid-Range, >= 50 for Premium" }
      ]
    },
    altMethods: [
      {
        name: "GROUP BY the full CASE expression",
        code: "SELECT\n  CASE\n    WHEN price < 20 THEN 'Budget'\n    WHEN price < 50 THEN 'Mid-Range'\n    ELSE 'Premium'\n  END AS price_range,\n  COUNT(*) AS product_count\nFROM products\nGROUP BY\n  CASE\n    WHEN price < 20 THEN 'Budget'\n    WHEN price < 50 THEN 'Mid-Range'\n    ELSE 'Premium'\n  END;",
        explanation: "In standard SQL, you may need to repeat the CASE expression in GROUP BY. SQLite allows grouping by the alias, which is shorter."
      },
      {
        name: "With additional aggregate details",
        code: "SELECT\n  CASE\n    WHEN price < 20 THEN 'Budget'\n    WHEN price < 50 THEN 'Mid-Range'\n    ELSE 'Premium'\n  END AS price_range,\n  COUNT(*) AS product_count,\n  ROUND(AVG(price), 2) AS avg_price,\n  SUM(stock) AS total_stock\nFROM products\nGROUP BY price_range;",
        explanation: "Adding AVG(price) and SUM(stock) per price range gives a richer picture of inventory distribution across price categories."
      }
    ]
  },

  // ============================================================
  // ORDER BY — Level 1
  // ============================================================
  {
    lang: "SQL",
    topic: "ORDER BY",
    level: 1,
    title: "Sort Users by Name Alphabetically",
    task: "Write a query that selects all columns from the `users` table and sorts the results by name in alphabetical (ascending) order.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT * FROM users ORDER BY name ASC;",
    expectedOutput: "All users sorted alphabetically by name (A to Z)",
    hint: "Use ORDER BY column_name ASC for ascending order. ASC is the default and can be omitted.",
    judgeFeedback: {
      summary: "ORDER BY sorts the result set. ASC (ascending) is the default sort direction.",
      lines: [
        { line: 1, problem: "Missing ORDER BY clause", fix: "Add ORDER BY name ASC at the end of the query" },
        { line: 1, problem: "Using DESC instead of ASC", fix: "ASC sorts A to Z (alphabetical). DESC would sort Z to A." }
      ]
    },
    altMethods: [
      {
        name: "Without explicit ASC",
        code: "SELECT * FROM users ORDER BY name;",
        explanation: "Since ASC is the default sort order, you can omit it. ORDER BY name is equivalent to ORDER BY name ASC."
      },
      {
        name: "Case-insensitive sorting",
        code: "SELECT * FROM users ORDER BY LOWER(name) ASC;",
        explanation: "Wrapping the column in LOWER() ensures that sorting is case-insensitive. Without it, uppercase letters sort before lowercase in ASCII order."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "ORDER BY",
    level: 1,
    title: "Sort Orders by Amount Descending",
    task: "Write a query that selects the product and amount from the `orders` table, sorted by amount from highest to lowest.\n\nTable structure:\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT product, amount FROM orders ORDER BY amount DESC;",
    expectedOutput: "Products and amounts sorted from the highest amount to the lowest",
    hint: "Use ORDER BY column_name DESC for descending order (highest to lowest).",
    judgeFeedback: {
      summary: "DESC after ORDER BY sorts values from highest to lowest (or Z to A for text).",
      lines: [
        { line: 1, problem: "Missing DESC keyword", fix: "Add DESC after amount: ORDER BY amount DESC" },
        { line: 1, problem: "Using ASC instead of DESC", fix: "ASC sorts lowest to highest. For highest to lowest, use DESC." }
      ]
    },
    altMethods: [
      {
        name: "Using negative value trick",
        code: "SELECT product, amount FROM orders ORDER BY -amount;",
        explanation: "Sorting by the negated value in ascending order (default) produces descending order for numeric columns. This is a trick, not recommended for readability."
      },
      {
        name: "With row numbers",
        code: "SELECT ROW_NUMBER() OVER (ORDER BY amount DESC) AS rank, product, amount FROM orders ORDER BY amount DESC;",
        explanation: "ROW_NUMBER() adds a ranking column showing each order's position. This window function requires SQLite 3.25.0 or later."
      }
    ]
  },

  // ============================================================
  // ORDER BY — Level 2
  // ============================================================
  {
    lang: "SQL",
    topic: "ORDER BY",
    level: 2,
    title: "Sort with Multiple Columns",
    task: "Write a query that selects the name, city, and age from the `users` table, sorted first by city in ascending order, and then by age in descending order within each city.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT name, city, age FROM users ORDER BY city ASC, age DESC;",
    expectedOutput: "Users sorted by city alphabetically, and within each city sorted by age from oldest to youngest",
    hint: "You can sort by multiple columns by separating them with commas in ORDER BY. Each column can have its own ASC or DESC.",
    judgeFeedback: {
      summary: "Multi-column sorting applies the first sort, then uses subsequent columns to break ties.",
      lines: [
        { line: 1, problem: "Only sorting by one column", fix: "Use ORDER BY city ASC, age DESC to sort by both columns" },
        { line: 1, problem: "Wrong sort directions", fix: "City should be ASC (A-Z) and age should be DESC (oldest first)" }
      ]
    },
    altMethods: [
      {
        name: "Using column positions",
        code: "SELECT name, city, age FROM users ORDER BY 2 ASC, 3 DESC;",
        explanation: "You can use column position numbers (1-based) instead of names in ORDER BY. Here 2 refers to city and 3 refers to age. This is shorter but less readable."
      },
      {
        name: "With explicit ASC for both clarity",
        code: "SELECT name, city, age FROM users ORDER BY city COLLATE NOCASE ASC, age DESC;",
        explanation: "COLLATE NOCASE makes the city sort case-insensitive. This ensures 'london' and 'London' are grouped together."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "ORDER BY",
    level: 2,
    title: "Sort with LIMIT and OFFSET",
    task: "Write a query that selects the name and age from the `users` table, sorted by age descending, and returns only the 3rd and 4th oldest users (skip the first 2, take the next 2).\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT name, age FROM users ORDER BY age DESC LIMIT 2 OFFSET 2;",
    expectedOutput: "The 3rd and 4th oldest users by age",
    hint: "LIMIT restricts the number of rows returned. OFFSET skips a number of rows before starting to return results. LIMIT 2 OFFSET 2 skips 2 rows and returns the next 2.",
    judgeFeedback: {
      summary: "LIMIT controls how many rows to return. OFFSET controls how many rows to skip before returning results.",
      lines: [
        { line: 1, problem: "Missing LIMIT or OFFSET", fix: "Add LIMIT 2 OFFSET 2 to skip the first 2 and return the next 2 rows" },
        { line: 1, problem: "LIMIT and OFFSET values swapped", fix: "LIMIT comes before OFFSET. LIMIT 2 OFFSET 2 means return 2 rows after skipping 2" }
      ]
    },
    altMethods: [
      {
        name: "Using LIMIT with comma syntax",
        code: "SELECT name, age FROM users ORDER BY age DESC LIMIT 2, 2;",
        explanation: "SQLite supports LIMIT offset, count syntax. LIMIT 2, 2 means skip 2 rows, return 2 rows. Note the order is reversed compared to LIMIT count OFFSET offset."
      },
      {
        name: "Using subquery for pagination",
        code: "SELECT name, age FROM (\n  SELECT name, age, ROW_NUMBER() OVER (ORDER BY age DESC) AS rn\n  FROM users\n) WHERE rn BETWEEN 3 AND 4;",
        explanation: "Using ROW_NUMBER() window function with a subquery provides more flexible pagination. Filtering by rn BETWEEN 3 AND 4 gets exactly the 3rd and 4th rows."
      }
    ]
  },

  // ============================================================
  // INSERT/UPDATE — Level 1
  // ============================================================
  {
    lang: "SQL",
    topic: "INSERT/UPDATE",
    level: 1,
    title: "Insert a New User",
    task: "Write an INSERT statement to add a new user with the following values:\n  - name: 'Charlie'\n  - email: 'charlie@example.com'\n  - age: 28\n  - city: 'Berlin'\n\nTable structure:\n  users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, age INTEGER, city TEXT)\n\nNote: The id column auto-increments, so do not include it.",
    code: "-- Write your query here\n",
    solutionCode: "INSERT INTO users (name, email, age, city) VALUES ('Charlie', 'charlie@example.com', 28, 'Berlin');",
    expectedOutput: "One new row inserted into the users table with name='Charlie', email='charlie@example.com', age=28, city='Berlin'",
    hint: "Use INSERT INTO table_name (columns) VALUES (values) to add a new row.",
    judgeFeedback: {
      summary: "INSERT INTO adds a new row. List the columns in parentheses, then provide matching values in the VALUES clause.",
      lines: [
        { line: 1, problem: "Column count doesn't match value count", fix: "Ensure the number of columns matches the number of values: (name, email, age, city) VALUES ('Charlie', 'charlie@example.com', 28, 'Berlin')" },
        { line: 1, problem: "Including id in the INSERT", fix: "Omit the id column — it auto-increments in SQLite" }
      ]
    },
    altMethods: [
      {
        name: "Without column list",
        code: "INSERT INTO users VALUES (NULL, 'Charlie', 'charlie@example.com', 28, 'Berlin');",
        explanation: "You can omit the column list if you provide values for ALL columns in order. Use NULL for the auto-increment id. This is fragile if the table schema changes."
      },
      {
        name: "Using INSERT OR REPLACE",
        code: "INSERT OR REPLACE INTO users (name, email, age, city) VALUES ('Charlie', 'charlie@example.com', 28, 'Berlin');",
        explanation: "INSERT OR REPLACE will update the row if a uniqueness conflict occurs, or insert it otherwise. Useful when you want to avoid duplicate errors."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "INSERT/UPDATE",
    level: 1,
    title: "Update User City",
    task: "Write an UPDATE statement to change the city of the user named 'Alice' to 'Paris'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "UPDATE users SET city = 'Paris' WHERE name = 'Alice';",
    expectedOutput: "Alice's city is updated to 'Paris' in the users table",
    hint: "Use UPDATE table SET column = value WHERE condition to modify existing rows.",
    judgeFeedback: {
      summary: "UPDATE modifies existing rows. Always include a WHERE clause to avoid updating all rows unintentionally.",
      lines: [
        { line: 1, problem: "Missing WHERE clause", fix: "Without WHERE, ALL users' cities would be changed to Paris. Add WHERE name = 'Alice'" },
        { line: 1, problem: "Using INSERT instead of UPDATE", fix: "INSERT adds new rows. To modify existing rows, use UPDATE ... SET ... WHERE ..." }
      ]
    },
    altMethods: [
      {
        name: "Update by ID",
        code: "UPDATE users SET city = 'Paris' WHERE id = (SELECT id FROM users WHERE name = 'Alice');",
        explanation: "Using a subquery to find Alice's id and updating by id is more reliable. If multiple users are named Alice, updating by name would change all of them."
      },
      {
        name: "Update with CASE for conditional values",
        code: "UPDATE users SET city = CASE WHEN name = 'Alice' THEN 'Paris' ELSE city END;",
        explanation: "A CASE expression in SET can conditionally update values. The ELSE city part keeps other users' cities unchanged. This approach updates all rows but only changes Alice's."
      }
    ]
  },

  // ============================================================
  // INSERT/UPDATE — Level 2
  // ============================================================
  {
    lang: "SQL",
    topic: "INSERT/UPDATE",
    level: 2,
    title: "Insert Multiple Rows",
    task: "Write a single INSERT statement to add three new products to the `products` table:\n  1. name: 'Keyboard', category: 'Electronics', price: 49.99, stock: 100\n  2. name: 'Notebook', category: 'Stationery', price: 5.99, stock: 500\n  3. name: 'Headphones', category: 'Electronics', price: 29.99, stock: 200\n\nTable structure:\n  products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, stock INTEGER)\n\nNote: The id column auto-increments.",
    code: "-- Write your query here\n",
    solutionCode: "INSERT INTO products (name, category, price, stock) VALUES\n  ('Keyboard', 'Electronics', 49.99, 100),\n  ('Notebook', 'Stationery', 5.99, 500),\n  ('Headphones', 'Electronics', 29.99, 200);",
    expectedOutput: "Three new rows inserted into the products table",
    hint: "You can insert multiple rows in a single INSERT statement by separating value groups with commas.",
    judgeFeedback: {
      summary: "Multi-row INSERT uses a single INSERT INTO ... VALUES followed by multiple parenthesized value groups separated by commas.",
      lines: [
        { line: 1, problem: "Using three separate INSERT statements", fix: "Combine into one INSERT with multiple value groups separated by commas" },
        { line: 2, problem: "Values in wrong order", fix: "Values must match the column order: (name, category, price, stock)" }
      ]
    },
    altMethods: [
      {
        name: "Using UNION ALL with SELECT",
        code: "INSERT INTO products (name, category, price, stock)\nSELECT 'Keyboard', 'Electronics', 49.99, 100\nUNION ALL SELECT 'Notebook', 'Stationery', 5.99, 500\nUNION ALL SELECT 'Headphones', 'Electronics', 29.99, 200;",
        explanation: "INSERT ... SELECT with UNION ALL is an older syntax for multi-row inserts. The VALUES approach is simpler and preferred in modern SQL."
      },
      {
        name: "Three separate INSERT statements",
        code: "INSERT INTO products (name, category, price, stock) VALUES ('Keyboard', 'Electronics', 49.99, 100);\nINSERT INTO products (name, category, price, stock) VALUES ('Notebook', 'Stationery', 5.99, 500);\nINSERT INTO products (name, category, price, stock) VALUES ('Headphones', 'Electronics', 29.99, 200);",
        explanation: "Three separate INSERT statements achieve the same result but are less efficient. Each statement is a separate database operation, while multi-row INSERT is a single operation."
      }
    ]
  },
  {
    lang: "SQL",
    topic: "INSERT/UPDATE",
    level: 2,
    title: "Update with WHERE Condition",
    task: "Write an UPDATE statement that increases the price of all products in the 'Electronics' category by 10% (multiply current price by 1.1).\n\nTable structure:\n  products (id INTEGER, name TEXT, category TEXT, price REAL, stock INTEGER)",
    code: "-- Write your query here\n",
    solutionCode: "UPDATE products SET price = price * 1.1 WHERE category = 'Electronics';",
    expectedOutput: "All products in the Electronics category have their price increased by 10%",
    hint: "Use UPDATE with SET to modify a column using its current value. price = price * 1.1 increases by 10%.",
    judgeFeedback: {
      summary: "UPDATE can use the current column value in the SET expression. price * 1.1 adds 10% to the current price.",
      lines: [
        { line: 1, problem: "Using price + 10 instead of price * 1.1", fix: "Adding 10 adds a flat $10. To increase by 10%, multiply by 1.1: price = price * 1.1" },
        { line: 1, problem: "Missing WHERE clause", fix: "Without WHERE category = 'Electronics', ALL products would be updated, not just electronics" }
      ]
    },
    altMethods: [
      {
        name: "Using addition form",
        code: "UPDATE products SET price = price + (price * 0.1) WHERE category = 'Electronics';",
        explanation: "price + (price * 0.1) is mathematically equivalent to price * 1.1. Some developers find this form clearer because it explicitly shows adding 10% of the original price."
      },
      {
        name: "With ROUND for clean prices",
        code: "UPDATE products SET price = ROUND(price * 1.1, 2) WHERE category = 'Electronics';",
        explanation: "ROUND(price * 1.1, 2) rounds the result to 2 decimal places, avoiding floating-point precision issues like 49.99 * 1.1 = 54.989000000000004."
      }
    ]
  },

  // ============================================================
  // SELECT Basics — Level 4
  // ============================================================
  {
    lang: "SQL",
    topic: "SELECT Basics",
    level: 4,
    title: "Correlated Subquery in SELECT",
    task: "Write a query that selects each user's name, city, and a column called 'city_peer_count' that shows how many OTHER users live in the same city (excluding the user themselves).\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT name, city,\n  (SELECT COUNT(*) FROM users u2 WHERE u2.city = u1.city AND u2.id != u1.id) AS city_peer_count\nFROM users u1;",
    expectedOutput: "Each user's name, city, and the number of other users in their city",
    hint: "Use a correlated subquery in the SELECT clause that counts users in the same city but with a different id.",
    judgeFeedback: {
      summary: "A correlated subquery references the outer query's row. Make sure to exclude the current user from the count using an id comparison.",
      lines: [
        { line: 2, problem: "Not excluding the current user from the count", fix: "Add AND u2.id != u1.id inside the subquery to exclude the user themselves" },
        { line: 2, problem: "Subquery not correlated to outer query", fix: "Use WHERE u2.city = u1.city to correlate the subquery with the outer query's current row" }
      ]
    },
    altMethods: [
      {
        name: "Using a self-join with GROUP BY",
        code: "SELECT u1.name, u1.city, COUNT(u2.id) AS city_peer_count\nFROM users u1\nLEFT JOIN users u2 ON u1.city = u2.city AND u1.id != u2.id\nGROUP BY u1.id, u1.name, u1.city;",
        explanation: "A LEFT JOIN with the same table matches each user to their city peers (excluding themselves). GROUP BY collapses the matches into a count per user."
      },
      {
        name: "Using window function with subtraction",
        code: "SELECT name, city,\n  COUNT(*) OVER (PARTITION BY city) - 1 AS city_peer_count\nFROM users;",
        explanation: "COUNT(*) OVER (PARTITION BY city) counts all users in the same city. Subtracting 1 excludes the current user from the count."
      }
    ]
  },

  // ============================================================
  // SELECT Basics — Level 5
  // ============================================================
  {
    lang: "SQL",
    topic: "SELECT Basics",
    level: 5,
    title: "CTE with Recursive Row Generation",
    task: "Write a query using a recursive CTE named 'numbers' that generates a sequence of numbers from 1 to 10. The column should be called 'n'. Then select all rows from the CTE.\n\nNo tables are needed for this query.",
    code: "-- Write your query here\n",
    solutionCode: "WITH RECURSIVE numbers(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM numbers WHERE n < 10\n)\nSELECT n FROM numbers;",
    expectedOutput: "A single column 'n' with values 1 through 10, one per row",
    hint: "A recursive CTE has an anchor member (SELECT 1) and a recursive member (SELECT n + 1 FROM cte WHERE n < 10) joined by UNION ALL.",
    judgeFeedback: {
      summary: "Recursive CTEs require the RECURSIVE keyword, an anchor SELECT, UNION ALL, and a recursive SELECT with a termination condition to avoid infinite loops.",
      lines: [
        { line: 1, problem: "Missing RECURSIVE keyword", fix: "Use WITH RECURSIVE numbers(n) AS (...) — the RECURSIVE keyword is required for self-referencing CTEs" },
        { line: 4, problem: "Missing termination condition", fix: "Add WHERE n < 10 in the recursive member to stop at 10 and prevent infinite recursion" }
      ]
    },
    altMethods: [
      {
        name: "Using a values list",
        code: "SELECT column1 AS n FROM (\n  VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10)\n);",
        explanation: "For small fixed sequences, you can use a VALUES clause directly. This avoids recursion but does not scale well for large sequences."
      },
      {
        name: "Recursive CTE with LIMIT",
        code: "WITH RECURSIVE numbers(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM numbers\n)\nSELECT n FROM numbers LIMIT 10;",
        explanation: "Instead of a WHERE condition in the CTE, you can use LIMIT on the outer SELECT. This works but the WHERE approach is more standard and self-documenting."
      }
    ]
  },

  // ============================================================
  // WHERE — Level 4
  // ============================================================
  {
    lang: "SQL",
    topic: "WHERE",
    level: 4,
    title: "Filter with EXISTS Subquery",
    task: "Write a query that selects the name and email of users who have placed at least one order with an amount greater than 100. Use an EXISTS subquery.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT name, email FROM users u\nWHERE EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.user_id = u.id AND o.amount > 100\n);",
    expectedOutput: "Names and emails of users who have at least one order exceeding 100",
    hint: "EXISTS returns TRUE if the subquery returns at least one row. Correlate it with the outer query using the user_id foreign key.",
    judgeFeedback: {
      summary: "EXISTS checks whether a correlated subquery returns any rows. It is often more efficient than IN for large datasets because it stops at the first match.",
      lines: [
        { line: 3, problem: "Subquery not correlated to outer query", fix: "Add WHERE o.user_id = u.id to link the subquery to each user in the outer query" },
        { line: 3, problem: "Missing the amount condition", fix: "Add AND o.amount > 100 to filter for high-value orders" }
      ]
    },
    altMethods: [
      {
        name: "Using IN with subquery",
        code: "SELECT name, email FROM users\nWHERE id IN (\n  SELECT user_id FROM orders WHERE amount > 100\n);",
        explanation: "IN with a subquery collects all matching user_ids first, then filters. EXISTS is generally preferred for readability and can be faster when the subquery is large."
      },
      {
        name: "Using INNER JOIN with DISTINCT",
        code: "SELECT DISTINCT u.name, u.email\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.amount > 100;",
        explanation: "Joining and filtering with DISTINCT avoids duplicate rows when a user has multiple qualifying orders. EXISTS avoids the need for DISTINCT entirely."
      }
    ]
  },

  // ============================================================
  // WHERE — Level 5
  // ============================================================
  {
    lang: "SQL",
    topic: "WHERE",
    level: 5,
    title: "Filter Using CTE and Multiple Conditions",
    task: "Write a query using a CTE named 'user_stats' that calculates each user's total spending (sum of order amounts) and order count. Then select the name, total_spent, and order_count from the CTE where total_spent is above the average total_spent across all users AND order_count >= 2.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "WITH user_stats AS (\n  SELECT u.name, SUM(o.amount) AS total_spent, COUNT(o.id) AS order_count\n  FROM users u\n  INNER JOIN orders o ON u.id = o.user_id\n  GROUP BY u.id, u.name\n)\nSELECT name, total_spent, order_count\nFROM user_stats\nWHERE total_spent > (SELECT AVG(total_spent) FROM user_stats)\nAND order_count >= 2;",
    expectedOutput: "Users whose total spending exceeds the average and who have at least 2 orders",
    hint: "Define a CTE with the aggregated stats first. Then in the main query, compare total_spent against a subquery that computes the average from the same CTE.",
    judgeFeedback: {
      summary: "CTEs can be referenced multiple times in the same query. Here the CTE is used both as the main data source and inside a subquery to compute the average.",
      lines: [
        { line: 9, problem: "Comparing total_spent to a fixed value instead of the average", fix: "Use a subquery (SELECT AVG(total_spent) FROM user_stats) to dynamically compute the average" },
        { line: 5, problem: "Missing GROUP BY in the CTE", fix: "Add GROUP BY u.id, u.name to aggregate orders per user" }
      ]
    },
    altMethods: [
      {
        name: "Using HAVING without CTE",
        code: "SELECT u.name, SUM(o.amount) AS total_spent, COUNT(o.id) AS order_count\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nGROUP BY u.id, u.name\nHAVING SUM(o.amount) > (\n  SELECT AVG(sub.total) FROM (\n    SELECT SUM(amount) AS total FROM orders GROUP BY user_id\n  ) sub\n) AND COUNT(o.id) >= 2;",
        explanation: "A nested subquery in HAVING computes the average total spending. This avoids the CTE but is harder to read due to the deeply nested subqueries."
      },
      {
        name: "Using window function for average",
        code: "WITH user_stats AS (\n  SELECT u.name, SUM(o.amount) AS total_spent, COUNT(o.id) AS order_count\n  FROM users u\n  INNER JOIN orders o ON u.id = o.user_id\n  GROUP BY u.id, u.name\n), with_avg AS (\n  SELECT *, AVG(total_spent) OVER () AS avg_spent FROM user_stats\n)\nSELECT name, total_spent, order_count\nFROM with_avg\nWHERE total_spent > avg_spent AND order_count >= 2;",
        explanation: "A second CTE uses AVG() as a window function with an empty OVER() to compute the global average, avoiding a separate subquery."
      }
    ]
  },

  // ============================================================
  // JOIN Basics — Level 4
  // ============================================================
  {
    lang: "SQL",
    topic: "JOIN Basics",
    level: 4,
    title: "Self-Join to Compare Rows",
    task: "Write a query that finds all pairs of users who live in the same city. Select the first user's name as 'user1', the second user's name as 'user2', and the city. Avoid duplicate pairs (ensure user1's id is less than user2's id).\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT u1.name AS user1, u2.name AS user2, u1.city\nFROM users u1\nINNER JOIN users u2 ON u1.city = u2.city AND u1.id < u2.id;",
    expectedOutput: "Pairs of users sharing the same city, with no duplicate pairs",
    hint: "A self-join joins a table with itself using two different aliases. Use u1.id < u2.id to avoid pairing a user with themselves and to prevent reversed duplicates.",
    judgeFeedback: {
      summary: "Self-joins require two aliases for the same table. The condition u1.id < u2.id ensures each pair appears only once and a user is never paired with themselves.",
      lines: [
        { line: 3, problem: "Using != instead of < to avoid duplicates", fix: "u1.id != u2.id avoids self-pairs but still produces (Alice,Bob) and (Bob,Alice). Use u1.id < u2.id for unique pairs" },
        { line: 3, problem: "Missing the city matching condition", fix: "Add u1.city = u2.city in the ON clause to only pair users from the same city" }
      ]
    },
    altMethods: [
      {
        name: "Using a cross join with WHERE",
        code: "SELECT u1.name AS user1, u2.name AS user2, u1.city\nFROM users u1, users u2\nWHERE u1.city = u2.city AND u1.id < u2.id;",
        explanation: "The implicit cross join with WHERE conditions achieves the same result. The explicit INNER JOIN with ON is preferred for clarity."
      },
      {
        name: "Using EXISTS to find pairs",
        code: "SELECT u1.name AS user1,\n  (SELECT u2.name FROM users u2 WHERE u2.city = u1.city AND u2.id > u1.id ORDER BY u2.id LIMIT 1) AS user2,\n  u1.city\nFROM users u1\nWHERE EXISTS (SELECT 1 FROM users u2 WHERE u2.city = u1.city AND u2.id > u1.id);",
        explanation: "This approach uses a correlated subquery to find the next user in the same city. Note it only returns one pair per user, not all possible pairs."
      }
    ]
  },

  // ============================================================
  // JOIN Basics — Level 5
  // ============================================================
  {
    lang: "SQL",
    topic: "JOIN Basics",
    level: 5,
    title: "Window Function with JOIN — Rank Orders per User",
    task: "Write a query that shows each user's name, their order product, order amount, and a 'rank' column that ranks each user's orders from highest to lowest amount using RANK(). Only include users who have placed orders.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT u.name, o.product, o.amount,\n  RANK() OVER (PARTITION BY u.id ORDER BY o.amount DESC) AS rank\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id;",
    expectedOutput: "Each order with the user's name, product, amount, and its rank within that user's orders (highest amount = rank 1)",
    hint: "RANK() is a window function. Use PARTITION BY to rank within each user's orders and ORDER BY amount DESC to rank from highest to lowest.",
    judgeFeedback: {
      summary: "Window functions like RANK() compute a value across a set of rows related to the current row. PARTITION BY defines the groups, ORDER BY defines the ranking order.",
      lines: [
        { line: 2, problem: "Missing PARTITION BY clause", fix: "Add PARTITION BY u.id to rank orders within each user separately, not across all orders" },
        { line: 2, problem: "Using ROW_NUMBER instead of RANK", fix: "RANK() assigns the same rank to ties and skips subsequent ranks. ROW_NUMBER() gives unique sequential numbers even for ties" }
      ]
    },
    altMethods: [
      {
        name: "Using DENSE_RANK instead",
        code: "SELECT u.name, o.product, o.amount,\n  DENSE_RANK() OVER (PARTITION BY u.id ORDER BY o.amount DESC) AS rank\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id;",
        explanation: "DENSE_RANK() is like RANK() but does not skip ranks after ties. If two orders tie at rank 1, the next order is rank 2 with DENSE_RANK but rank 3 with RANK."
      },
      {
        name: "Using a correlated subquery for ranking",
        code: "SELECT u.name, o.product, o.amount,\n  (SELECT COUNT(*) + 1 FROM orders o2\n   WHERE o2.user_id = o.user_id AND o2.amount > o.amount) AS rank\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id;",
        explanation: "A correlated subquery counts how many orders by the same user have a higher amount, then adds 1. This simulates RANK() without using window functions."
      }
    ]
  },

  // ============================================================
  // GROUP BY — Level 4
  // ============================================================
  {
    lang: "SQL",
    topic: "GROUP BY",
    level: 4,
    title: "GROUP BY with HAVING on Multiple Aggregates",
    task: "Write a query that shows each product category with its product_count, avg_price (rounded to 2 decimals), and total_stock. Only include categories where the average price is above 20 AND the total stock is at least 100.\n\nTable structure:\n  products (id INTEGER, name TEXT, category TEXT, price REAL, stock INTEGER)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT category,\n  COUNT(*) AS product_count,\n  ROUND(AVG(price), 2) AS avg_price,\n  SUM(stock) AS total_stock\nFROM products\nGROUP BY category\nHAVING AVG(price) > 20 AND SUM(stock) >= 100;",
    expectedOutput: "Categories with average price above 20 and total stock of at least 100",
    hint: "HAVING can contain multiple conditions joined with AND. Use the raw aggregate expressions (not aliases) in the HAVING clause.",
    judgeFeedback: {
      summary: "HAVING filters groups after aggregation. You can combine multiple aggregate conditions with AND/OR. In standard SQL, use the aggregate expression in HAVING, not the alias.",
      lines: [
        { line: 7, problem: "Using aliases in HAVING clause", fix: "Standard SQL requires repeating the aggregate: HAVING AVG(price) > 20, not HAVING avg_price > 20" },
        { line: 7, problem: "Missing one of the HAVING conditions", fix: "Both conditions are required: HAVING AVG(price) > 20 AND SUM(stock) >= 100" }
      ]
    },
    altMethods: [
      {
        name: "Using a subquery to filter",
        code: "SELECT * FROM (\n  SELECT category,\n    COUNT(*) AS product_count,\n    ROUND(AVG(price), 2) AS avg_price,\n    SUM(stock) AS total_stock\n  FROM products\n  GROUP BY category\n) WHERE avg_price > 20 AND total_stock >= 100;",
        explanation: "Wrapping the grouped query in a subquery lets you filter on aliases with WHERE instead of repeating aggregates in HAVING."
      },
      {
        name: "Using CTE for readability",
        code: "WITH category_stats AS (\n  SELECT category,\n    COUNT(*) AS product_count,\n    ROUND(AVG(price), 2) AS avg_price,\n    SUM(stock) AS total_stock\n  FROM products\n  GROUP BY category\n)\nSELECT * FROM category_stats\nWHERE avg_price > 20 AND total_stock >= 100;",
        explanation: "A CTE (Common Table Expression) separates the aggregation from the filtering, making the query easier to read and maintain."
      }
    ]
  },

  // ============================================================
  // GROUP BY — Level 5
  // ============================================================
  {
    lang: "SQL",
    topic: "GROUP BY",
    level: 5,
    title: "Running Total with Window Function",
    task: "Write a query that shows each order's id, product, amount, order_date, and a 'running_total' column that calculates the cumulative sum of amounts ordered by order_date (and by id to break ties). The running total should include all orders, not partitioned by user.\n\nTable structure:\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT id, product, amount, order_date,\n  SUM(amount) OVER (ORDER BY order_date, id) AS running_total\nFROM orders;",
    expectedOutput: "Each order with its running cumulative total amount, ordered chronologically",
    hint: "SUM() can be used as a window function with OVER(ORDER BY ...) to compute a running total. The default window frame is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.",
    judgeFeedback: {
      summary: "A running total uses SUM() as a window function. The ORDER BY inside OVER() determines the accumulation order. Without PARTITION BY, the running total spans all rows.",
      lines: [
        { line: 2, problem: "Using GROUP BY instead of OVER", fix: "GROUP BY would collapse rows. Use SUM(amount) OVER (ORDER BY order_date, id) to keep individual rows while computing the running total" },
        { line: 2, problem: "Missing ORDER BY in the OVER clause", fix: "Without ORDER BY inside OVER(), SUM() computes the total of all rows for every row, not a running total" }
      ]
    },
    altMethods: [
      {
        name: "Using a correlated subquery",
        code: "SELECT id, product, amount, order_date,\n  (SELECT SUM(o2.amount) FROM orders o2\n   WHERE o2.order_date < o1.order_date\n   OR (o2.order_date = o1.order_date AND o2.id <= o1.id)) AS running_total\nFROM orders o1\nORDER BY order_date, id;",
        explanation: "A correlated subquery sums all amounts from orders that come before or at the same position as the current row. This works without window functions but is less efficient."
      },
      {
        name: "With explicit window frame",
        code: "SELECT id, product, amount, order_date,\n  SUM(amount) OVER (\n    ORDER BY order_date, id\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_total\nFROM orders;",
        explanation: "Explicitly specifying the window frame ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW makes the running total behavior self-documenting, even though it is the default."
      }
    ]
  },

  // ============================================================
  // ORDER BY — Level 3
  // ============================================================
  {
    lang: "SQL",
    topic: "ORDER BY",
    level: 3,
    title: "Multi-Column Sort with LIMIT",
    task: "Select the top 3 highest-paid employees. If salaries are equal, sort by name alphabetically. Show name and salary columns.\nTable: employees (id, name, department, salary)",
    code: "-- Multi-column ORDER BY with LIMIT\n-- Table: employees (id, name, department, salary)\n-- Get top 3 by salary, then by name\n",
    solutionCode: "SELECT name, salary FROM employees ORDER BY salary DESC, name ASC LIMIT 3;",
    expectedOutput: "name|salary\nBob|60000\nDiana|60000\nCharlie|55000",
    testCases: [
      { input: "employees with 5 rows", output: "name|salary\nBob|60000\nDiana|60000\nCharlie|55000" },
    ],
    hint: "Use `ORDER BY salary DESC, name ASC` for multi-column sorting, and `LIMIT 3` to restrict rows.",
    judgeFeedback: {
      summary: "Combine multiple ORDER BY columns and use LIMIT to restrict results.",
      lines: [
        { line: 1, problem: "Missing secondary sort column", fix: "Add `name ASC` after `salary DESC` to break ties alphabetically." },
      ],
    },
  },

  // ============================================================
  // ORDER BY — Level 4
  // ============================================================
  {
    lang: "SQL",
    topic: "ORDER BY",
    level: 4,
    title: "Sort by Subquery Result",
    task: "Write a query that selects each user's name, city, and age from the `users` table, sorted by how many orders they have placed (most orders first). Include users with zero orders. Name the order count column 'order_count'.\n\nTable structure:\n  users (id INTEGER, name TEXT, email TEXT, age INTEGER, city TEXT)\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "SELECT u.name, u.city, u.age,\n  (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count\nFROM users u\nORDER BY order_count DESC;",
    expectedOutput: "All users sorted by their order count descending, including users with 0 orders",
    hint: "Use a correlated subquery in the SELECT to compute the order count for each user, then ORDER BY that computed column.",
    judgeFeedback: {
      summary: "You can ORDER BY a computed column or alias. A correlated subquery in SELECT calculates a value per row that can then be used for sorting.",
      lines: [
        { line: 2, problem: "Using INNER JOIN which excludes users without orders", fix: "Use a correlated subquery or LEFT JOIN to include users with zero orders" },
        { line: 4, problem: "Sorting in ascending order instead of descending", fix: "Add DESC after ORDER BY order_count to show the most active users first" }
      ]
    },
    altMethods: [
      {
        name: "Using LEFT JOIN with GROUP BY",
        code: "SELECT u.name, u.city, u.age, COUNT(o.id) AS order_count\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.id, u.name, u.city, u.age\nORDER BY order_count DESC;",
        explanation: "LEFT JOIN preserves all users, and COUNT(o.id) counts only matched orders (NULL ids are not counted). This is often more efficient than a correlated subquery."
      },
      {
        name: "Using a CTE for the counts",
        code: "WITH order_counts AS (\n  SELECT user_id, COUNT(*) AS order_count\n  FROM orders\n  GROUP BY user_id\n)\nSELECT u.name, u.city, u.age,\n  COALESCE(oc.order_count, 0) AS order_count\nFROM users u\nLEFT JOIN order_counts oc ON u.id = oc.user_id\nORDER BY order_count DESC;",
        explanation: "A CTE pre-computes the counts, then a LEFT JOIN attaches them to users. COALESCE converts NULL to 0 for users without orders."
      }
    ]
  },

  // ============================================================
  // ORDER BY — Level 5
  // ============================================================
  {
    lang: "SQL",
    topic: "ORDER BY",
    level: 5,
    title: "Pagination with ROW_NUMBER Window Function",
    task: "Write a query using a CTE named 'ranked_orders' that assigns a row number to each order partitioned by user_id and ordered by amount descending. Then select the user_id, product, amount, and row_num from the CTE where row_num = 1 (each user's highest-value order), ordered by amount descending.\n\nTable structure:\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "WITH ranked_orders AS (\n  SELECT user_id, product, amount,\n    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) AS row_num\n  FROM orders\n)\nSELECT user_id, product, amount, row_num\nFROM ranked_orders\nWHERE row_num = 1\nORDER BY amount DESC;",
    expectedOutput: "Each user's single highest-value order, sorted by amount descending",
    hint: "ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) assigns 1 to each user's highest order. Filter with WHERE row_num = 1 in the outer query.",
    judgeFeedback: {
      summary: "The ROW_NUMBER() + CTE + filter pattern is a standard way to select the top-N rows per group. Window functions cannot be filtered directly in WHERE, so a CTE or subquery is needed.",
      lines: [
        { line: 3, problem: "Missing PARTITION BY clause", fix: "Add PARTITION BY user_id so row numbers restart at 1 for each user" },
        { line: 8, problem: "Filtering on row_num inside the CTE instead of outer query", fix: "Window functions are computed after WHERE, so filter row_num in the outer query, not inside the CTE" }
      ]
    },
    altMethods: [
      {
        name: "Using a correlated subquery",
        code: "SELECT user_id, product, amount, 1 AS row_num\nFROM orders o1\nWHERE amount = (\n  SELECT MAX(o2.amount) FROM orders o2 WHERE o2.user_id = o1.user_id\n)\nORDER BY amount DESC;",
        explanation: "A correlated subquery finds each user's max amount. This works for top-1 but does not generalize to top-N as cleanly as ROW_NUMBER()."
      },
      {
        name: "Using GROUP BY with a join back",
        code: "SELECT o.user_id, o.product, o.amount, 1 AS row_num\nFROM orders o\nINNER JOIN (\n  SELECT user_id, MAX(amount) AS max_amount\n  FROM orders\n  GROUP BY user_id\n) m ON o.user_id = m.user_id AND o.amount = m.max_amount\nORDER BY o.amount DESC;",
        explanation: "A subquery finds the max amount per user, then joins back to get the full row. This may return duplicates if a user has multiple orders with the same max amount."
      }
    ]
  },

  // ============================================================
  // INSERT/UPDATE — Level 3
  // ============================================================
  {
    lang: "SQL",
    topic: "INSERT/UPDATE",
    level: 3,
    title: "UPDATE with Subquery",
    task: "Update all employees in the 'Sales' department to have a 10% salary increase. Then select name, department, and salary for all employees ordered by salary DESC.\nTable: employees (id, name, department, salary)",
    code: "-- UPDATE with condition + verify result\n-- Table: employees (id, name, department, salary)\n",
    solutionCode: "UPDATE employees SET salary = salary * 1.1 WHERE department = 'Sales';\nSELECT name, department, salary FROM employees ORDER BY salary DESC;",
    expectedOutput: "name|department|salary\nBob|Sales|66000.0\nAlice|Engineering|60000\nCharlie|Sales|55000.0",
    testCases: [
      { input: "employees with Sales and Engineering", output: "name|department|salary with Sales salaries increased" },
    ],
    hint: "Use `UPDATE table SET column = expression WHERE condition` to modify specific rows.",
    judgeFeedback: {
      summary: "UPDATE modifies existing rows. Use WHERE to target specific rows and SET to define new values.",
      lines: [
        { line: 1, problem: "Missing WHERE clause", fix: "Add `WHERE department = 'Sales'` to only update Sales employees." },
      ],
    },
  },

  // ============================================================
  // INSERT/UPDATE — Level 4
  // ============================================================
  {
    lang: "SQL",
    topic: "INSERT/UPDATE",
    level: 4,
    title: "Insert from SELECT with Conditions",
    task: "Write a query that inserts into an `archived_orders` table all orders from the `orders` table where the order_date is before '2024-01-01'. The archived_orders table has the same structure as orders.\n\nTable structure:\n  orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)\n  archived_orders (id INTEGER, user_id INTEGER, product TEXT, amount REAL, order_date TEXT)",
    code: "-- Write your query here\n",
    solutionCode: "INSERT INTO archived_orders (id, user_id, product, amount, order_date)\nSELECT id, user_id, product, amount, order_date\nFROM orders\nWHERE order_date < '2024-01-01';",
    expectedOutput: "All orders before 2024-01-01 are copied into the archived_orders table",
    hint: "INSERT INTO ... SELECT copies rows from one table to another. Add a WHERE clause to the SELECT to filter which rows to insert.",
    judgeFeedback: {
      summary: "INSERT INTO ... SELECT is used to copy data between tables. The SELECT can include WHERE, JOIN, and other clauses to transform or filter data during the copy.",
      lines: [
        { line: 1, problem: "Using VALUES instead of SELECT", fix: "For bulk copying from another table, use INSERT INTO archived_orders SELECT ... FROM orders, not VALUES" },
        { line: 4, problem: "Incorrect date comparison", fix: "Use WHERE order_date < '2024-01-01' — SQLite compares ISO-format date strings lexicographically, which works correctly" }
      ]
    },
    altMethods: [
      {
        name: "Without explicit column list",
        code: "INSERT INTO archived_orders\nSELECT * FROM orders\nWHERE order_date < '2024-01-01';",
        explanation: "When both tables have identical columns in the same order, you can omit the column list and use SELECT *. This is shorter but more fragile if schemas diverge."
      },
      {
        name: "Using INSERT OR IGNORE to skip duplicates",
        code: "INSERT OR IGNORE INTO archived_orders (id, user_id, product, amount, order_date)\nSELECT id, user_id, product, amount, order_date\nFROM orders\nWHERE order_date < '2024-01-01';",
        explanation: "INSERT OR IGNORE silently skips rows that would cause a uniqueness constraint violation, making the operation safe to run multiple times."
      }
    ]
  },

  // ============================================================
  // INSERT/UPDATE — Level 5
  // ============================================================
  {
    lang: "SQL",
    topic: "INSERT/UPDATE",
    level: 5,
    title: "Upsert with ON CONFLICT",
    task: "Write an INSERT statement that adds a product with name 'Laptop', category 'Electronics', price 999.99, stock 50 into the `products` table. If a product with the same name already exists, update its price and stock to the new values instead. Assume there is a UNIQUE constraint on the name column.\n\nTable structure:\n  products (id INTEGER PRIMARY KEY, name TEXT UNIQUE, category TEXT, price REAL, stock INTEGER)",
    code: "-- Write your query here\n",
    solutionCode: "INSERT INTO products (name, category, price, stock)\nVALUES ('Laptop', 'Electronics', 999.99, 50)\nON CONFLICT(name) DO UPDATE SET\n  price = excluded.price,\n  stock = excluded.stock;",
    expectedOutput: "The product 'Laptop' is inserted, or its price and stock are updated if it already exists",
    hint: "Use ON CONFLICT(column) DO UPDATE SET ... to handle uniqueness violations. The special 'excluded' table refers to the values that were attempted to be inserted.",
    judgeFeedback: {
      summary: "The ON CONFLICT clause (upsert) handles insert-or-update in a single statement. The 'excluded' keyword references the row that would have been inserted, allowing you to use those values in the UPDATE.",
      lines: [
        { line: 3, problem: "Missing the conflict target column", fix: "Specify ON CONFLICT(name) to indicate which unique constraint triggers the update" },
        { line: 4, problem: "Using VALUES instead of excluded to reference new values", fix: "Use excluded.price and excluded.stock to reference the values from the attempted INSERT" }
      ]
    },
    altMethods: [
      {
        name: "Using INSERT OR REPLACE",
        code: "INSERT OR REPLACE INTO products (name, category, price, stock)\nVALUES ('Laptop', 'Electronics', 999.99, 50);",
        explanation: "INSERT OR REPLACE deletes the conflicting row and inserts a new one. This works but resets the id and any columns not specified, unlike ON CONFLICT which preserves the existing row."
      },
      {
        name: "Using separate INSERT and UPDATE with a check",
        code: "UPDATE products SET price = 999.99, stock = 50 WHERE name = 'Laptop';\nINSERT INTO products (name, category, price, stock)\nSELECT 'Laptop', 'Electronics', 999.99, 50\nWHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Laptop');",
        explanation: "Running an UPDATE first and then a conditional INSERT achieves an upsert without ON CONFLICT. This requires two statements and is not atomic like the ON CONFLICT approach."
      }
    ]
  }
];
