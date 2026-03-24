// SQL実行 — SQLite WASM runner
import * as vscode from "vscode";
import initSqlJs, { Database } from "sql.js";
import * as path from "path";

let db: Database | null = null;
let SQL: any = null;
let _extensionPath: string | null = null;
let _initPromise: Promise<void> | null = null;

const SCHEMA_SQL = `
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      age INTEGER,
      city TEXT
    );

    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      product TEXT,
      amount REAL,
      order_date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE,
      category TEXT,
      price REAL,
      stock INTEGER
    );

    CREATE TABLE employees (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      salary REAL NOT NULL
    );

    CREATE TABLE archived_orders (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      product TEXT,
      amount REAL,
      order_date TEXT
    );

    -- Sample data
    INSERT INTO users VALUES (1, 'Alice', 'alice@gmail.com', 25, 'New York');
    INSERT INTO users VALUES (2, 'Bob', 'bob@yahoo.com', 30, 'London');
    INSERT INTO users VALUES (3, 'Charlie', 'charlie@gmail.com', 22, 'New York');
    INSERT INTO users VALUES (4, 'Diana', 'diana@example.com', 28, 'Berlin');
    INSERT INTO users VALUES (5, 'Eve', 'eve@gmail.com', 35, 'Osaka');

    INSERT INTO orders VALUES (1, 1, 'Laptop', 1200.00, '2024-01-15');
    INSERT INTO orders VALUES (2, 1, 'Mouse', 25.00, '2024-01-16');
    INSERT INTO orders VALUES (3, 2, 'Webcam', 75.00, '2024-01-17');
    INSERT INTO orders VALUES (4, 3, 'Monitor', 300.00, '2024-01-18');
    INSERT INTO orders VALUES (5, 2, 'Laptop', 1200.00, '2024-01-19');
    INSERT INTO orders VALUES (6, 1, 'Speakers', 150.00, '2024-01-20');

    INSERT INTO products VALUES (1, 'Laptop', 'Electronics', 1200.00, 50);
    INSERT INTO products VALUES (2, 'Mouse', 'Electronics', 25.00, 200);
    INSERT INTO products VALUES (3, 'Webcam', 'Electronics', 75.00, 150);
    INSERT INTO products VALUES (4, 'Monitor', 'Electronics', 300.00, 80);
    INSERT INTO products VALUES (5, 'Speakers', 'Electronics', 150.00, 120);

    INSERT INTO employees VALUES (1, 'Alice', 'Engineering', 50000);
    INSERT INTO employees VALUES (2, 'Bob', 'Sales', 60000);
    INSERT INTO employees VALUES (3, 'Charlie', 'Engineering', 55000);
    INSERT INTO employees VALUES (4, 'Diana', 'Sales', 60000);
    INSERT INTO employees VALUES (5, 'Eve', 'Marketing', 48000);
`;

/** DB初期化 — init SQLite WASM */
export function initDatabase(context: vscode.ExtensionContext): void {
  _extensionPath = context.extensionPath;
}

/** DB遅延読込 — lazy-load SQLite WASM on first use */
async function ensureDatabase(): Promise<void> {
  if (db) { return; }
  if (_initPromise) { return _initPromise; }
  _initPromise = (async () => {
    try {
      if (!_extensionPath) { throw new Error("initDatabase() not called"); }
      const wasmPath = path.join(_extensionPath, "dist", "sql-wasm.wasm");
      SQL = await initSqlJs({ locateFile: () => wasmPath });
      const newDb: Database = new SQL.Database();
      newDb.run(SCHEMA_SQL);
      db = newDb;
    } catch (e) {
      _initPromise = null; // allow retry on next call
      throw e;
    }
  })();
  return _initPromise;
}

/** DBリセット — reset database to initial state */
export async function resetDatabase(): Promise<void> {
  await ensureDatabase();
  if (!db || !SQL) { return; }
  db.close();
  const newDb: Database = new SQL.Database();
  newDb.run(SCHEMA_SQL);
  db = newDb;
}

export interface QueryResult {
  columns: string[];
  values: any[][];
  error?: string;
  rowsAffected?: number;
}

export function sanitizeSql(sql: string): string {
  let sanitized = (sql || "")
    .replace(/^```[\w]*\s*/gm, "")
    .replace(/```$/gm, "")
    .replace(/^\s*(?:SQL\s*QUERY|QUERY|SOLUTION|ANSWER|FINAL\s*QUERY|FINAL\s*ANSWER)\s*:\s*/gim, "")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/^\s*--.*$/gm, "")
    .replace(/^\s*\d+[\.\)]\s*/gm, "")
    .trim();

  const firstSqlKeyword = sanitized.search(/\b(?:SELECT|INSERT|UPDATE|DELETE|WITH|CREATE|DROP|ALTER)\b/i);
  if (firstSqlKeyword > 0) {
    sanitized = sanitized.slice(firstSqlKeyword).trim();
  }

  return sanitized;
}

/** クエリ実行 — run SQL query */
export async function runQuery(sql: string): Promise<QueryResult> {
  try {
    await ensureDatabase();
  } catch (e: any) {
    return { columns: [], values: [], error: "Database init failed: " + (e.message || e) };
  }
  if (!db) {
    return { columns: [], values: [], error: "Database not initialized" };
  }

  try {
    const sanitizedSql = sanitizeSql(sql);
    const trimmed = sanitizedSql;
    const isModify = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(trimmed);

    const results = db.exec(sanitizedSql);

    if (results.length === 0) {
      if (isModify) {
        const changes = db.getRowsModified();
        return {
          columns: ["result"],
          values: [[`${changes} row(s) affected`]],
          rowsAffected: changes
        };
      }
      return { columns: [], values: [], error: undefined };
    }
    return {
      columns: results[0].columns,
      values: results[0].values
    };
  } catch (e: any) {
    return { columns: [], values: [], error: e.message || String(e) };
  }
}

/** スキーマ取得 — get current schema */
export function getSchema(): string {
  return `DATABASE SCHEMA (SQLite, in-memory):

TABLE users:
  id INTEGER PRIMARY KEY
  name TEXT NOT NULL
  email TEXT
  age INTEGER
  city TEXT
Sample: (1,'Alice','alice@gmail.com',25,'New York'), (2,'Bob','bob@yahoo.com',30,'London'),
        (3,'Charlie','charlie@gmail.com',22,'New York'), (4,'Diana','diana@example.com',28,'Berlin'),
        (5,'Eve','eve@gmail.com',35,'Osaka')

TABLE orders:
  id INTEGER PRIMARY KEY
  user_id INTEGER (FK -> users.id)
  product TEXT
  amount REAL
  order_date TEXT
Sample: (1,1,'Laptop',1200.00,'2024-01-15'), (2,1,'Mouse',25.00,'2024-01-16'),
        (3,2,'Webcam',75.00,'2024-01-17'), (4,3,'Monitor',300.00,'2024-01-18'),
        (5,2,'Laptop',1200.00,'2024-01-19'), (6,1,'Speakers',150.00,'2024-01-20')

TABLE products:
  id INTEGER PRIMARY KEY
  name TEXT UNIQUE
  category TEXT
  price REAL
  stock INTEGER
Sample: (1,'Laptop','Electronics',1200.00,50), (2,'Mouse','Electronics',25.00,200),
        (3,'Webcam','Electronics',75.00,150), (4,'Monitor','Electronics',300.00,80),
        (5,'Speakers','Electronics',150.00,120)

TABLE employees:
  id INTEGER PRIMARY KEY
  name TEXT NOT NULL
  department TEXT NOT NULL
  salary REAL NOT NULL
Sample: (1,'Alice','Engineering',50000), (2,'Bob','Sales',60000),
        (3,'Charlie','Engineering',55000), (4,'Diana','Sales',60000),
        (5,'Eve','Marketing',48000)

TABLE archived_orders:
  id INTEGER PRIMARY KEY
  user_id INTEGER
  product TEXT
  amount REAL
  order_date TEXT
Sample: initially empty`;
}
