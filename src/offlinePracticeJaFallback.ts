type Rule = {
  pattern: RegExp;
  replace: string | ((...args: string[]) => string);
};

export type JaFallbackContext = "general" | "judge" | "label" | "explanation";

const TOKEN_RE = /`[^`\n]*`|{{[^}]+}}|'[^'\n]*'|"[^"\n]*"/g;

function maskText(text: string): { masked: string; tokens: string[] } {
  const tokens: string[] = [];
  const masked = text.replace(TOKEN_RE, (segment) => {
    const token = `@@JA${tokens.length}@@`;
    tokens.push(segment);
    return token;
  });
  return { masked, tokens };
}

function unmaskText(text: string, tokens: string[]): string {
  return text.replace(/@@JA(\d+)@@/g, (_match, index) => tokens[Number(index)] || _match);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyFirstRule(text: string, rules: Rule[]): string | undefined {
  for (const rule of rules) {
    if (!rule.pattern.test(text)) {
      continue;
    }
    const safePattern = new RegExp(rule.pattern.source, rule.pattern.flags);
    return text.replace(safePattern, rule.replace as never);
  }
  return undefined;
}

function applyPhrases(text: string, replacements: ReadonlyArray<readonly [string, string]>): string {
  let out = text;
  for (const [source, target] of replacements) {
    out = out.replace(new RegExp(escapeRegExp(source), "gi"), target);
  }
  return out;
}

function applyRegexRules(text: string, rules: Rule[]): string {
  let out = text;
  for (const rule of rules) {
    const flags = rule.pattern.flags.includes("g") ? rule.pattern.flags : `${rule.pattern.flags}g`;
    const safePattern = new RegExp(rule.pattern.source, flags);
    out = out.replace(safePattern, rule.replace as never);
  }
  return out;
}

function looksLikeLabel(text: string): boolean {
  return !/[.!?]/.test(text) && text.length <= 90;
}

const ALLOWED_ENGLISH_WORDS = new Set([
  "java", "python", "typescript", "sql", "hashmap", "hashset", "treeset", "arraylist",
  "linkedhashmap", "linkedhashset", "linkedlist", "deque", "iterator", "promise",
  "stream", "streams", "map", "set", "record", "enum", "readonly", "cte", "sqlite",
  "async", "await", "generator", "switch", "default", "case", "typeof", "public",
  "private", "true", "false", "insert", "update", "delete", "select", "where", "group",
  "by", "having", "order", "limit", "offset", "join", "left", "right", "inner", "outer",
  "distinct", "union", "all", "rank", "dense_rank", "row_number", "over", "partition",
  "sum", "avg", "count", "max", "min", "like", "glob", "iif", "coalesce", "printf",
  "substr", "json", "proxy", "weakref", "regex", "infer", "const", "int", "char", "id",
  "desc", "asc", "str", "dict", "pick", "omit", "try",
]);

const JA_LABEL_RULES: Rule[] = [
  { pattern: /^Using (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} を使う方法` },
  { pattern: /^With (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} を加えた方法` },
  { pattern: /^Without (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} なし` },
  { pattern: /^Recursive approach$/i, replace: "再帰的な方法" },
  { pattern: /^Recursive (.+)$/i, replace: (_match, body) => `再帰: ${translateJaBody(body)}` },
  { pattern: /^Enhanced for-loop$/i, replace: "拡張 for ループ" },
  { pattern: /^Two-pass approach$/i, replace: "2回走査の方法" },
  { pattern: /^Two-pointer approach$/i, replace: "両端ポインタ法" },
  { pattern: /^For-loop swap$/i, replace: "for ループによる swap" },
];

const JA_PREFIX_RULES: Rule[] = [
  { pattern: /^Missing (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} が不足しています。` },
  { pattern: /^Not (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} ができていません。` },
  { pattern: /^Wrong (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} が誤っています。` },
  { pattern: /^Use (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} を使ってください。` },
  { pattern: /^Add (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} を追加してください。` },
  { pattern: /^Set (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} を設定してください。` },
  { pattern: /^Ensure (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} ことを確認してください。` },
  { pattern: /^Check (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} を確認してください。` },
  { pattern: /^Make sure (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} ようにしてください。` },
  { pattern: /^Forgot to (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} のを忘れています。` },
  { pattern: /^Using (.+)$/i, replace: (_match, body) => `${translateJaBody(body)}。` },
  { pattern: /^With (.+)$/i, replace: (_match, body) => `${translateJaBody(body)}。` },
  { pattern: /^Without (.+)$/i, replace: (_match, body) => `${translateJaBody(body)}。` },
  { pattern: /^Recursive (.+)$/i, replace: (_match, body) => `再帰では ${translateJaBody(body)}。` },
  { pattern: /^Python's (.+)$/i, replace: (_match, body) => `Python の ${translateJaBody(body)}。` },
  { pattern: /^Python (.+)$/i, replace: (_match, body) => `Python では ${translateJaBody(body)}。` },
  { pattern: /^Java's (.+)$/i, replace: (_match, body) => `Java の ${translateJaBody(body)}。` },
  { pattern: /^Java (.+)$/i, replace: (_match, body) => `Java では ${translateJaBody(body)}。` },
  { pattern: /^TypeScript (.+)$/i, replace: (_match, body) => `TypeScript では ${translateJaBody(body)}。` },
  { pattern: /^This approach uses (.+)$/i, replace: (_match, body) => `この方法では ${translateJaBody(body)}。` },
  { pattern: /^This approach (.+)$/i, replace: (_match, body) => `この方法では ${translateJaBody(body)}。` },
  { pattern: /^This variation (.+)$/i, replace: (_match, body) => `このバリエーションでは ${translateJaBody(body)}。` },
  { pattern: /^This version (.+)$/i, replace: (_match, body) => `このバージョンでは ${translateJaBody(body)}。` },
  { pattern: /^A (.+)$/i, replace: (_match, body) => `${translateJaBody(body)}。` },
  { pattern: /^An (.+)$/i, replace: (_match, body) => `${translateJaBody(body)}。` },
  { pattern: /^The (.+)$/i, replace: (_match, body) => `${translateJaBody(body)}。` },
  { pattern: /^After (.+)$/i, replace: (_match, body) => `その後、${translateJaBody(body)}。` },
  { pattern: /^When (.+)$/i, replace: (_match, body) => `${translateJaBody(body)}。` },
  { pattern: /^Only (.+)$/i, replace: (_match, body) => `${translateJaBody(body)}。` },
  { pattern: /^In (.+)$/i, replace: (_match, body) => `${translateJaBody(body)}。` },
  { pattern: /^Compare (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} を比較します。` },
  { pattern: /^Convert (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} に変換します。` },
  { pattern: /^Split (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} に分割します。` },
  { pattern: /^Sort (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} をソートします。` },
  { pattern: /^Iterate (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} を走査します。` },
  { pattern: /^Loop (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} をループします。` },
  { pattern: /^Return (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} を返します。` },
  { pattern: /^Build (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} を構築します。` },
  { pattern: /^Put (.+)$/i, replace: (_match, body) => `${translateJaBody(body)} を入れます。` },
  { pattern: /^Wrapping (.+)$/i, replace: (_match, body) => `${translateJaBody(body)}。` },
  { pattern: /^Adding (.+)$/i, replace: (_match, body) => `${translateJaBody(body)}。` },
];

const JA_PHRASE_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  ["instead of", "の代わりに"],
  ["similar to", "に似た"],
  ["equivalent to", "と同等の"],
  ["not enforced at runtime", "実行時には強制されません"],
  ["works regardless of", "に関係なく動作します"],
  ["works with", "で動作します"],
  ["works correctly", "正しく動作します"],
  ["works the same", "同じように動作します"],
  ["also works", "でも動作します"],
  ["won't be reassigned", "再代入されません"],
  ["you don't need the index", "インデックスが不要な場合"],
  ["you do not need the index", "インデックスが不要な場合"],
  ["this avoids repeating values", "これにより値の重複記述を避けられます"],
  ["enhanced for-each loop", "拡張 for-each ループ"],
  ["with type annotations", "型注釈付き"],
  ["with type annotation", "型注釈付き"],
  ["similar to TypeScript but are not enforced at runtime", "TypeScript に似ていますが、実行時には強制されません"],
  ["similar to TypeScript but is not enforced at runtime", "TypeScript に似ていますが、実行時には強制されません"],
  ["works, but", "でも動作しますが、"],
  ["works but", "でも動作しますが、"],
  ["for object shapes", "オブジェクト形状のために"],
  ["for cleaner iteration", "より分かりやすい反復のために"],
  ["for descending order", "降順のために"],
  ["for off()", "off() のために"],
  ["for greeting", "greeting のために"],
  ["for arrays", "配列のために"],
  ["for arrays before treating as generic object", "配列をジェネリックなオブジェクトとして扱う前に"],
  ["for each student", "各生徒に対して"],
  ["for exact string values", "厳密な文字列値のために"],
  ["for mutable", "可変にするために"],
  ["type hints", "型ヒント"],
  ["type hint", "型ヒント"],
  ["exact string values", "厳密な文字列値"],
  ["full Japanese prose coverage", "日本語本文の完全カバレッジ"],
  ["is useful when", "は次のような場合に有効です:"],
  ["is cleaner when", "は次のような場合に分かりやすいです:"],
  ["is safer when", "は次のような場合に安全です:"],
  ["is preferred", "が推奨されます"],
  ["is recommended", "が推奨されます"],
  ["is required", "が必要です"],
  ["is optional", "は省略可能です"],
  ["makes it easy to", "を簡単にします:"],
  ["making it easy to", "しやすくなります:"],
  ["built-in", "組み込み"],
  ["manual loop", "手動ループ"],
  ["single pass", "1回の走査"],
  ["two passes", "2回の走査"],
  ["two-pass", "2回走査"],
  ["two-pointer", "両端ポインタ"],
  ["lookup object", "ルックアップオブジェクト"],
  ["lookup table", "ルックアップテーブル"],
  ["handler map", "ハンドラマップ"],
  ["window function", "ウィンドウ関数"],
  ["table alias", "テーブル別名"],
  ["table aliases", "テーブル別名"],
  ["outer query", "外側のクエリ"],
  ["current row", "現在の行"],
  ["result set", "結果セット"],
  ["aggregate function", "集約関数"],
  ["aggregate results", "集約結果"],
  ["generic type parameter", "ジェネリック型パラメータ"],
  ["generic type", "ジェネリック型"],
  ["type parameter", "型パラメータ"],
  ["type annotation", "型注釈"],
  ["return type annotation", "戻り値の型注釈"],
  ["return type", "戻り値の型"],
  ["literal type", "リテラル型"],
  ["union type", "ユニオン型"],
  ["discriminated union", "判別可能共用体"],
  ["type narrowing", "型の絞り込み"],
  ["type-safe", "型安全な"],
  ["type safety", "型安全性"],
  ["compile-time", "コンパイル時"],
  ["runtime", "実行時"],
  ["utility types", "ユーティリティ型"],
  ["conditional types", "条件型"],
  ["mapped types", "mapped types"],
  ["tuple accumulator", "タプルのアキュムレータ"],
  ["readonly tuple", "読み取り専用タプル"],
  ["bracket pairs", "括弧の対応"],
  ["structured data", "構造化データ"],
  ["partial updates", "部分更新"],
  ["state change", "状態変更"],
  ["worker pool", "ワーカープール"],
  ["thundering herd", "サンダリングハード"],
  ["fluent API", "流れるような API"],
  ["command pattern", "コマンドパターン"],
  ["visitor pattern", "ビジターパターン"],
  ["brand pattern", "ブランドパターン"],
  ["phantom type", "ファントム型"],
  ["type guard", "型ガード"],
  ["type alias", "型エイリアス"],
  ["interface shape", "インターフェース形状"],
  ["off-by-one", "off-by-one"],
  ["default value", "デフォルト値"],
  ["deep clone", "ディープクローン"],
  ["deep partial", "DeepPartial"],
  ["deep readonly", "DeepReadonly"],
  ["memory-efficient", "メモリ効率の良い"],
  ["case-sensitive", "大文字小文字を区別する"],
  ["case-insensitive", "大文字小文字を区別しない"],
  ["in one call", "1回の呼び出しで"],
  ["in one step", "1ステップで"],
  ["one line", "1行で"],
  ["one step", "1ステップ"],
  ["one call", "1回の呼び出し"],
  ["at compile time", "コンパイル時に"],
  ["at runtime", "実行時に"],
  ["for clarity", "分かりやすさのために"],
  ["for readability", "読みやすさのために"],
  ["for type safety", "型安全性のために"],
  ["for efficiency", "効率のために"],
  ["for exact match", "完全一致のために"],
  ["for sorted output", "ソート済み出力のために"],
  ["for clean prices", "見やすい価格表示のために"],
  ["for ranking", "順位付けのために"],
  ["for pagination", "ページネーションのために"],
  ["for average", "平均のために"],
  ["for mutability", "可変性のために"],
  ["for immutability", "不変性のために"],
  ["for exhaustive checking", "網羅チェックのために"],
  ["for pattern matching", "パターンマッチングのために"],
  ["for compile-time verification", "コンパイル時検証のために"],
  ["on greeting", "greeting に対する"],
  ["on array", "配列に対する"],
  ["on callback", "コールバックに対する"],
  ["on the whole word", "単語全体に対して"],
  ["one of the", "いずれかの"],
  ["up to the", "最大で"],
  ["more readable", "より読みやすい"],
  ["more context", "より多くの文脈"],
  ["more useful", "より有用"],
  ["shorter and more readable", "より短く読みやすい"],
  ["in the original order", "元の順序で"],
  ["in the same city", "同じ都市で"],
  ["in the current window", "現在のウィンドウ内で"],
  ["in the set", "Set 内で"],
  ["for fast lookup", "高速検索のために"],
  ["for fast membership testing", "高速メンバーシップ判定のために"],
  ["for exact string values", "厳密な文字列値のために"],
  ["for immutable removal", "不変の削除処理のために"],
  ["greater than or equal to", "以上"],
  ["greater than", "より大きい"],
  ["less than or equal to", "以下"],
  ["less than", "より小さい"],
];

const JA_WORD_RULES: Rule[] = [
  { pattern: /\bfunctions\b/gi, replace: "関数" },
  { pattern: /\bfunction\b/gi, replace: "関数" },
  { pattern: /\barrays\b/gi, replace: "配列" },
  { pattern: /\barray\b/gi, replace: "配列" },
  { pattern: /\belements\b/gi, replace: "要素" },
  { pattern: /\belement\b/gi, replace: "要素" },
  { pattern: /\bstrings\b/gi, replace: "文字列" },
  { pattern: /\bstring\b/gi, replace: "文字列" },
  { pattern: /\bnumbers\b/gi, replace: "数値" },
  { pattern: /\bnumber\b/gi, replace: "数値" },
  { pattern: /\bboolean\b/gi, replace: "真偽値" },
  { pattern: /\bobjects\b/gi, replace: "オブジェクト" },
  { pattern: /\bobject\b/gi, replace: "オブジェクト" },
  { pattern: /\bproperties\b/gi, replace: "プロパティ" },
  { pattern: /\bproperty\b/gi, replace: "プロパティ" },
  { pattern: /\bvalues\b/gi, replace: "値" },
  { pattern: /\bvalue\b/gi, replace: "値" },
  { pattern: /\bqueries\b/gi, replace: "クエリ" },
  { pattern: /\bquery\b/gi, replace: "クエリ" },
  { pattern: /\btables\b/gi, replace: "テーブル" },
  { pattern: /\btable\b/gi, replace: "テーブル" },
  { pattern: /\bcolumns\b/gi, replace: "列" },
  { pattern: /\bcolumn\b/gi, replace: "列" },
  { pattern: /\brows\b/gi, replace: "行" },
  { pattern: /\brow\b/gi, replace: "行" },
  { pattern: /\busers\b/gi, replace: "ユーザー" },
  { pattern: /\buser\b/gi, replace: "ユーザー" },
  { pattern: /\borders\b/gi, replace: "注文" },
  { pattern: /\border\b/gi, replace: "注文" },
  { pattern: /\bcities\b/gi, replace: "都市" },
  { pattern: /\bcity\b/gi, replace: "都市" },
  { pattern: /\bprice\b/gi, replace: "価格" },
  { pattern: /\bage\b/gi, replace: "年齢" },
  { pattern: /\bname\b/gi, replace: "名前" },
  { pattern: /\bid\b/gi, replace: "ID" },
  { pattern: /\blist\b/gi, replace: "リスト" },
  { pattern: /\btype\b/gi, replace: "型" },
  { pattern: /\btypes\b/gi, replace: "型" },
  { pattern: /\bgroup\b/gi, replace: "グループ" },
  { pattern: /\bcount\b/gi, replace: "数" },
  { pattern: /\bresult\b/gi, replace: "結果" },
  { pattern: /\bresults\b/gi, replace: "結果" },
  { pattern: /\bloop\b/gi, replace: "ループ" },
  { pattern: /\bloops\b/gi, replace: "ループ" },
  { pattern: /\bindex\b/gi, replace: "インデックス" },
  { pattern: /\baverage\b/gi, replace: "平均" },
  { pattern: /\bduplicates\b/gi, replace: "重複" },
  { pattern: /\bduplicate\b/gi, replace: "重複" },
  { pattern: /\bcondition\b/gi, replace: "条件" },
  { pattern: /\bconditions\b/gi, replace: "条件" },
  { pattern: /\bcache\b/gi, replace: "キャッシュ" },
  { pattern: /\bstate\b/gi, replace: "状態" },
  { pattern: /\bhandler\b/gi, replace: "ハンドラ" },
  { pattern: /\bpayload\b/gi, replace: "ペイロード" },
  { pattern: /\bworker\b/gi, replace: "ワーカー" },
  { pattern: /\bmethod\b/gi, replace: "メソッド" },
  { pattern: /\bmethods\b/gi, replace: "メソッド" },
  { pattern: /\bparameter\b/gi, replace: "パラメータ" },
  { pattern: /\bparameters\b/gi, replace: "パラメータ" },
  { pattern: /\boutput\b/gi, replace: "出力" },
  { pattern: /\berror\b/gi, replace: "エラー" },
  { pattern: /\bnull\b/gi, replace: "NULL" },
  { pattern: /\bsubquery\b/gi, replace: "サブクエリ" },
  { pattern: /\bnested\b/gi, replace: "ネストされた" },
  { pattern: /\bdestructuring\b/gi, replace: "分割代入" },
  { pattern: /\breduce\b/gi, replace: "reduce" },
  { pattern: /\bcallback\b/gi, replace: "コールバック" },
  { pattern: /\baccess\b/gi, replace: "アクセス" },
  { pattern: /\bmatching\b/gi, replace: "一致" },
  { pattern: /\bmatch\b/gi, replace: "一致" },
  { pattern: /\brecursive\b/gi, replace: "再帰" },
  { pattern: /\bcorrelated\b/gi, replace: "相関付き" },
  { pattern: /\baggregate\b/gi, replace: "集約" },
  { pattern: /\biteration\b/gi, replace: "反復" },
  { pattern: /\bfunctional\b/gi, replace: "関数型" },
  { pattern: /\bimmutable\b/gi, replace: "不変" },
  { pattern: /\bconcise\b/gi, replace: "簡潔" },
  { pattern: /\bcomplex\b/gi, replace: "複雑" },
  { pattern: /\bunique\b/gi, replace: "一意の" },
  { pattern: /\btyped\b/gi, replace: "型付き" },
  { pattern: /\bdefined\b/gi, replace: "定義された" },
  { pattern: /\bshape\b/gi, replace: "図形" },
  { pattern: /\bspread\b/gi, replace: "spread" },
  { pattern: /\balias\b/gi, replace: "別名" },
  { pattern: /\baliases\b/gi, replace: "別名" },
  { pattern: /\bdesc\b/gi, replace: "DESC" },
  { pattern: /\basc\b/gi, replace: "ASC" },
  { pattern: /\bamount\b/gi, replace: "金額" },
  { pattern: /\btotal\b/gi, replace: "合計" },
  { pattern: /\btime\b/gi, replace: "時間" },
  { pattern: /\blength\b/gi, replace: "長さ" },
  { pattern: /\breverse\b/gi, replace: "反転" },
  { pattern: /\bcopy\b/gi, replace: "コピー" },
  { pattern: /\bpairs\b/gi, replace: "ペア" },
  { pattern: /\bpair\b/gi, replace: "ペア" },
  { pattern: /\bdata\b/gi, replace: "データ" },
  { pattern: /\bint\b/gi, replace: "int" },
  { pattern: /\bchar\b/gi, replace: "char" },
  { pattern: /\bconst\b/gi, replace: "const" },
  { pattern: /\bclass\b/gi, replace: "クラス" },
  { pattern: /\bclasses\b/gi, replace: "クラス" },
  { pattern: /\bconstructor\b/gi, replace: "コンストラクタ" },
  { pattern: /\bimplementation\b/gi, replace: "実装" },
  { pattern: /\bsignature\b/gi, replace: "シグネチャ" },
  { pattern: /\boverload\b/gi, replace: "オーバーロード" },
  { pattern: /\boverloads\b/gi, replace: "オーバーロード" },
  { pattern: /\bgenerics\b/gi, replace: "ジェネリクス" },
  { pattern: /\bliterals\b/gi, replace: "リテラル" },
  { pattern: /\benums\b/gi, replace: "enum" },
  { pattern: /\bkind\b/gi, replace: "kind" },
  { pattern: /\bformat\b/gi, replace: "形式" },
  { pattern: /\bnon\b/gi, replace: "非" },
  { pattern: /\bkey\b/gi, replace: "キー" },
  { pattern: /\bkeys\b/gi, replace: "キー" },
  { pattern: /\bexpression\b/gi, replace: "式" },
  { pattern: /\bexpressions\b/gi, replace: "式" },
  { pattern: /\bomit\b/gi, replace: "Omit" },
  { pattern: /\blog\b/gi, replace: "ログ" },
  { pattern: /\blogs\b/gi, replace: "ログ" },
  { pattern: /\bproper\b/gi, replace: "適切な" },
  { pattern: /\bensures\b/gi, replace: "を保証します" },
  { pattern: /\bunlike\b/gi, replace: "とは異なり" },
  { pattern: /\bevery\b/gi, replace: "すべての" },
  { pattern: /\binteger\b/gi, replace: "整数" },
  { pattern: /\bthem\b/gi, replace: "それら" },
  { pattern: /\badding\b/gi, replace: "追加" },
  { pattern: /\bsimple\b/gi, replace: "単純" },
  { pattern: /\bcomputes\b/gi, replace: "計算します" },
  { pattern: /\bwindow\b/gi, replace: "ウィンドウ" },
  { pattern: /\bmany\b/gi, replace: "多くの" },
  { pattern: /\bshould\b/gi, replace: "べきです" },
  { pattern: /\bself\b/gi, replace: "自身" },
  { pattern: /\bthree\b/gi, replace: "3つの" },
  { pattern: /\bpick\b/gi, replace: "Pick" },
  { pattern: /\bdifferent\b/gi, replace: "異なる" },
  { pattern: /\bcomprehension\b/gi, replace: "内包表記" },
  { pattern: /\bgives\b/gi, replace: "与えます" },
  { pattern: /\bchaining\b/gi, replace: "連結" },
  { pattern: /\boperations\b/gi, replace: "操作" },
  { pattern: /\bemail\b/gi, replace: "メール" },
  { pattern: /\bshorter\b/gi, replace: "より短い" },
  { pattern: /\breferences\b/gi, replace: "参照" },
  { pattern: /\btry\b/gi, replace: "try" },
  { pattern: /\byork\b/gi, replace: "York" },
  { pattern: /\bwould\b/gi, replace: "でしょう" },
  { pattern: /\bstandard\b/gi, replace: "標準的な" },
  { pattern: /\bdecimal\b/gi, replace: "小数" },
  { pattern: /\bstep\b/gi, replace: "ステップ" },
  { pattern: /\biterating\b/gi, replace: "走査" },
  { pattern: /\btop\b/gi, replace: "上位" },
  { pattern: /\bcompute\b/gi, replace: "計算" },
  { pattern: /\brecursion\b/gi, replace: "再帰" },
  { pattern: /\bmanually\b/gi, replace: "手動で" },
  { pattern: /\bconsecutive\b/gi, replace: "連続した" },
  { pattern: /\bruns\b/gi, replace: "実行します" },
  { pattern: /\brun\b/gi, replace: "実行" },
  { pattern: /\bless\b/gi, replace: "より少ない" },
  { pattern: /\blarge\b/gi, replace: "大きい" },
  { pattern: /\buntil\b/gi, replace: "まで" },
  { pattern: /\bmapping\b/gi, replace: "マッピング" },
  { pattern: /\bmulti\b/gi, replace: "複数" },
  { pattern: /\bboundary\b/gi, replace: "境界" },
  { pattern: /\bbecause\b/gi, replace: "なぜなら" },
  { pattern: /\bcalls\b/gi, replace: "呼び出し" },
  { pattern: /\bstr\b/gi, replace: "str" },
  { pattern: /\binclude\b/gi, replace: "含める" },
  { pattern: /\bdelay\b/gi, replace: "遅延" },
  { pattern: /\basyncio\b/gi, replace: "asyncio" },
  { pattern: /\brunning\b/gi, replace: "実行中" },
  { pattern: /\baggregation\b/gi, replace: "集約" },
  { pattern: /\bround\b/gi, replace: "丸める" },
  { pattern: /\bstock\b/gi, replace: "在庫" },
  { pattern: /\bconflict\b/gi, replace: "競合" },
  { pattern: /\bswap\b/gi, replace: "swap" },
  { pattern: /\bback\b/gi, replace: "戻す" },
  { pattern: /\blists\b/gi, replace: "リスト" },
  { pattern: /\bplace\b/gi, replace: "配置" },
  { pattern: /\bpass\b/gi, replace: "パス" },
  { pattern: /\bstatement\b/gi, replace: "文" },
  { pattern: /\bend\b/gi, replace: "終端" },
  { pattern: /\bkeeps\b/gi, replace: "保持します" },
  { pattern: /\balways\b/gi, replace: "常に" },
  { pattern: /\bissues\b/gi, replace: "問題" },
  { pattern: /\bout\b/gi, replace: "外へ" },
  { pattern: /\bclear\b/gi, replace: "クリア" },
  { pattern: /\bhere\b/gi, replace: "ここで" },
  { pattern: /\bentry\b/gi, replace: "エントリ" },
  { pattern: /\bdict\b/gi, replace: "dict" },
  { pattern: /\bcomparator\b/gi, replace: "コンパレータ" },
  { pattern: /\bhighest\b/gi, replace: "最も高い" },
  { pattern: /\bother\b/gi, replace: "その他の" },
  { pattern: /\bcombine\b/gi, replace: "組み合わせる" },
  { pattern: /\bdirection\b/gi, replace: "方向" },
  { pattern: /\bspaces\b/gi, replace: "空白" },
  { pattern: /\bform\b/gi, replace: "形式" },
  { pattern: /\bsimilar\b/gi, replace: "似た" },
  { pattern: /\bcases\b/gi, replace: "ケース" },
  { pattern: /\bnaturally\b/gi, replace: "自然に" },
  { pattern: /\bidentical\b/gi, replace: "同一の" },
  { pattern: /\bnegative\b/gi, replace: "負の" },
  { pattern: /\blayer\b/gi, replace: "レイヤー" },
  { pattern: /\bprecedence\b/gi, replace: "優先順位" },
  { pattern: /\belse\b/gi, replace: "それ以外" },
  { pattern: /\bsignatures\b/gi, replace: "シグネチャ" },
  { pattern: /\bpromise\b/gi, replace: "Promise" },
  { pattern: /\bstreams\b/gi, replace: "Stream" },
  { pattern: /\bstream\b/gi, replace: "Stream" },
  { pattern: /\bhashmap\b/gi, replace: "HashMap" },
  { pattern: /\bhashset\b/gi, replace: "HashSet" },
  { pattern: /\btreeset\b/gi, replace: "TreeSet" },
  { pattern: /\barraylist\b/gi, replace: "ArrayList" },
  { pattern: /\blinkedhashmap\b/gi, replace: "LinkedHashMap" },
  { pattern: /\blinkedhashset\b/gi, replace: "LinkedHashSet" },
  { pattern: /\blinkedlist\b/gi, replace: "LinkedList" },
  { pattern: /\bdeque\b/gi, replace: "Deque" },
  { pattern: /\biterator\b/gi, replace: "Iterator" },
  { pattern: /\bgenerator\b/gi, replace: "ジェネレータ" },
  { pattern: /\binterface\b/gi, replace: "インターフェース" },
  { pattern: /\binterfaces\b/gi, replace: "インターフェース" },
  { pattern: /\benum\b/gi, replace: "enum" },
  { pattern: /\btuple\b/gi, replace: "タプル" },
  { pattern: /\brecord\b/gi, replace: "Record" },
  { pattern: /\bmap\b/gi, replace: "Map" },
  { pattern: /\bset\b/gi, replace: "Set" },
  { pattern: /\bclause\b/gi, replace: "句" },
  { pattern: /\bkeyword\b/gi, replace: "キーワード" },
  { pattern: /\boperator\b/gi, replace: "演算子" },
  { pattern: /\bsyntax\b/gi, replace: "構文" },
  { pattern: /\bpattern\b/gi, replace: "パターン" },
  { pattern: /\bapproach\b/gi, replace: "方法" },
  { pattern: /\blogic\b/gi, replace: "ロジック" },
  { pattern: /\bcomparison\b/gi, replace: "比較" },
  { pattern: /\bliteral\b/gi, replace: "リテラル" },
  { pattern: /\bgeneric\b/gi, replace: "ジェネリック" },
  { pattern: /\boptional\b/gi, replace: "省略可能" },
  { pattern: /\breadonly\b/gi, replace: "readonly" },
  { pattern: /\bprivate\b/gi, replace: "private" },
  { pattern: /\bpublic\b/gi, replace: "public" },
  { pattern: /\bbuild\b/gi, replace: "構築" },
  { pattern: /\bcreate\b/gi, replace: "作成" },
  { pattern: /\bcreates\b/gi, replace: "作成します" },
  { pattern: /\bremove\b/gi, replace: "削除" },
  { pattern: /\bremoves\b/gi, replace: "削除します" },
  { pattern: /\badd\b/gi, replace: "追加" },
  { pattern: /\badds\b/gi, replace: "追加します" },
  { pattern: /\breplace\b/gi, replace: "置換" },
  { pattern: /\breplaces\b/gi, replace: "置き換えます" },
  { pattern: /\bconvert\b/gi, replace: "変換" },
  { pattern: /\bconverts\b/gi, replace: "変換します" },
  { pattern: /\bflatten\b/gi, replace: "平坦化" },
  { pattern: /\bmerge\b/gi, replace: "マージ" },
  { pattern: /\bcalculate\b/gi, replace: "計算" },
  { pattern: /\bcalculates\b/gi, replace: "計算します" },
  { pattern: /\breturns\b/gi, replace: "を返します" },
  { pattern: /\breturn\b/gi, replace: "返す" },
  { pattern: /\bprints\b/gi, replace: "を出力します" },
  { pattern: /\bprint\b/gi, replace: "出力" },
  { pattern: /\buses\b/gi, replace: "を使います" },
  { pattern: /\buse\b/gi, replace: "使う" },
  { pattern: /\bprovides\b/gi, replace: "を提供します" },
  { pattern: /\bprovide\b/gi, replace: "提供" },
  { pattern: /\ballows\b/gi, replace: "を可能にします" },
  { pattern: /\ballow\b/gi, replace: "可能にする" },
  { pattern: /\bavoids\b/gi, replace: "を避けます" },
  { pattern: /\bavoid\b/gi, replace: "避ける" },
  { pattern: /\bhandles\b/gi, replace: "を処理します" },
  { pattern: /\bhandle\b/gi, replace: "処理" },
  { pattern: /\btracks\b/gi, replace: "を追跡します" },
  { pattern: /\btrack\b/gi, replace: "追跡" },
  { pattern: /\bcompares\b/gi, replace: "を比較します" },
  { pattern: /\bcompare\b/gi, replace: "比較" },
  { pattern: /\bcounts\b/gi, replace: "を数えます" },
  { pattern: /\bcounting\b/gi, replace: "数え上げ" },
  { pattern: /\bfilters\b/gi, replace: "を絞り込みます" },
  { pattern: /\bfilter\b/gi, replace: "絞り込み" },
  { pattern: /\bgroups\b/gi, replace: "をグループ化します" },
  { pattern: /\bgrouping\b/gi, replace: "グループ化" },
  { pattern: /\bsorts\b/gi, replace: "をソートします" },
  { pattern: /\bsorting\b/gi, replace: "ソート" },
  { pattern: /\bsorted\b/gi, replace: "ソート済み" },
  { pattern: /\bpreserves\b/gi, replace: "を保持します" },
  { pattern: /\bpreserve\b/gi, replace: "保持" },
  { pattern: /\bprevents\b/gi, replace: "を防ぎます" },
  { pattern: /\bprevent\b/gi, replace: "防ぐ" },
  { pattern: /\brequires\b/gi, replace: "が必要です" },
  { pattern: /\brequire\b/gi, replace: "必要" },
  { pattern: /\bmust\b/gi, replace: "必要があります" },
  { pattern: /\bcan\b/gi, replace: "できます" },
  { pattern: /\bworks\b/gi, replace: "動作します" },
  { pattern: /\bwork\b/gi, replace: "動作" },
  { pattern: /\bcorrectly\b/gi, replace: "正しく" },
  { pattern: /\bproperly\b/gi, replace: "適切に" },
  { pattern: /\bexplicitly\b/gi, replace: "明示的に" },
  { pattern: /\bexplicit\b/gi, replace: "明示的" },
  { pattern: /\bcleaner\b/gi, replace: "より分かりやすい" },
  { pattern: /\breadable\b/gi, replace: "読みやすい" },
  { pattern: /\befficient\b/gi, replace: "効率的" },
  { pattern: /\bsimpler\b/gi, replace: "より簡単" },
  { pattern: /\buseful\b/gi, replace: "有用" },
  { pattern: /\bcurrent\b/gi, replace: "現在の" },
  { pattern: /\boriginal\b/gi, replace: "元の" },
  { pattern: /\bdefault\b/gi, replace: "デフォルト" },
  { pattern: /\bseparate\b/gi, replace: "別々の" },
  { pattern: /\bmultiple\b/gi, replace: "複数の" },
  { pattern: /\bsingle\b/gi, replace: "単一の" },
  { pattern: /\bfirst\b/gi, replace: "最初の" },
  { pattern: /\bsecond\b/gi, replace: "2番目の" },
  { pattern: /\blast\b/gi, replace: "最後の" },
  { pattern: /\bnext\b/gi, replace: "次の" },
  { pattern: /\binner\b/gi, replace: "内側の" },
  { pattern: /\bouter\b/gi, replace: "外側の" },
  { pattern: /\bleft\b/gi, replace: "左" },
  { pattern: /\bright\b/gi, replace: "右" },
  { pattern: /\btrue\b/gi, replace: "true" },
  { pattern: /\bfalse\b/gi, replace: "false" },
  { pattern: /\beach\b/gi, replace: "各" },
  { pattern: /\bmore\b/gi, replace: "より" },
  { pattern: /\bboth\b/gi, replace: "両方" },
  { pattern: /\bwith\b/gi, replace: "付きの" },
  { pattern: /\bwithout\b/gi, replace: "なしの" },
  { pattern: /\bfrom\b/gi, replace: "から" },
  { pattern: /\binto\b/gi, replace: "へ" },
  { pattern: /\bin\b/gi, replace: "で" },
  { pattern: /\bon\b/gi, replace: "に対する" },
  { pattern: /\bof\b/gi, replace: "の" },
  { pattern: /\bfor\b/gi, replace: "のための" },
  { pattern: /\bto\b/gi, replace: "に" },
  { pattern: /\bas\b/gi, replace: "として" },
  { pattern: /\bat\b/gi, replace: "で" },
  { pattern: /\bper\b/gi, replace: "ごとの" },
  { pattern: /\band\b/gi, replace: "と" },
  { pattern: /\bor\b/gi, replace: "または" },
  { pattern: /\bbut\b/gi, replace: "ただし" },
  { pattern: /\bso\b/gi, replace: "そのため" },
  { pattern: /\bsince\b/gi, replace: "ので" },
  { pattern: /\bwhile\b/gi, replace: "一方で" },
  { pattern: /\bthen\b/gi, replace: "その後" },
  { pattern: /\bbefore\b/gi, replace: "前に" },
  { pattern: /\bafter\b/gi, replace: "後で" },
  { pattern: /\bonly\b/gi, replace: "のみ" },
  { pattern: /\bany\b/gi, replace: "任意の" },
  { pattern: /\bsame\b/gi, replace: "同じ" },
  { pattern: /\bnew\b/gi, replace: "新しい" },
  { pattern: /\bmanual\b/gi, replace: "手動" },
  { pattern: /\bcorrect\b/gi, replace: "正しい" },
  { pattern: /\bincorrect\b/gi, replace: "不正な" },
  { pattern: /\bnot\b/gi, replace: "ない" },
  { pattern: /\bbe\b/gi, replace: "である" },
  { pattern: /\bthan\b/gi, replace: "より" },
  { pattern: /\bbetween\b/gi, replace: "の間の" },
  { pattern: /\bthis\b/gi, replace: "この" },
  { pattern: /\bthat\b/gi, replace: "その" },
  { pattern: /\bwhich\b/gi, replace: "これは" },
  { pattern: /\bwhen\b/gi, replace: "場合" },
  { pattern: /\bif\b/gi, replace: "もし" },
  { pattern: /\byou\b/gi, replace: "" },
  { pattern: /\bit\b/gi, replace: "それ" },
  { pattern: /\bthey\b/gi, replace: "それら" },
  { pattern: /\bhave\b/gi, replace: "を持ちます" },
  { pattern: /\bhas\b/gi, replace: "を持ちます" },
  { pattern: /\bneed\b/gi, replace: "必要" },
  { pattern: /\bneeded\b/gi, replace: "必要" },
  { pattern: /\bmake\b/gi, replace: "作る" },
  { pattern: /\bmakes\b/gi, replace: "にします" },
  { pattern: /\bmaking\b/gi, replace: "にしながら" },
  { pattern: /\bfind\b/gi, replace: "見つける" },
  { pattern: /\bfinds\b/gi, replace: "見つけます" },
  { pattern: /\bget\b/gi, replace: "取得" },
  { pattern: /\bgets\b/gi, replace: "取得します" },
  { pattern: /\bchecks\b/gi, replace: "確認します" },
  { pattern: /\bchecking\b/gi, replace: "確認" },
  { pattern: /\bhandles\b/gi, replace: "を処理します" },
  { pattern: /\bhandling\b/gi, replace: "処理" },
  { pattern: /\bmatching\b/gi, replace: "一致" },
  { pattern: /\bused\b/gi, replace: "使われる" },
  { pattern: /\busing\b/gi, replace: "使用" },
  { pattern: /\bdirectly\b/gi, replace: "直接" },
  { pattern: /\bexactly\b/gi, replace: "正確に" },
  { pattern: /\binside\b/gi, replace: "内側" },
  { pattern: /\bexists\b/gi, replace: "存在します" },
  { pattern: /\bautomatically\b/gi, replace: "自動的に" },
  { pattern: /\bempty\b/gi, replace: "空" },
  { pattern: /\beven\b/gi, replace: "偶数" },
  { pattern: /\bbase\b/gi, replace: "基底" },
  { pattern: /\bstart\b/gi, replace: "開始" },
  { pattern: /\bstack\b/gi, replace: "Stack" },
  { pattern: /\bposition\b/gi, replace: "位置" },
  { pattern: /\bchain\b/gi, replace: "連鎖" },
  { pattern: /\bcommon\b/gi, replace: "共通" },
  { pattern: /\bcharacters\b/gi, replace: "文字" },
  { pattern: /\bcharacter\b/gi, replace: "文字" },
  { pattern: /\blowercase\b/gi, replace: "小文字" },
  { pattern: /\buppercase\b/gi, replace: "大文字" },
  { pattern: /\bquotes\b/gi, replace: "引用符" },
  { pattern: /\bparentheses\b/gi, replace: "括弧" },
  { pattern: /\bproducts\b/gi, replace: "商品" },
  { pattern: /\bproduct\b/gi, replace: "商品" },
  { pattern: /\bdoesn'?t\b/gi, replace: "しません" },
  { pattern: /\bdon'?t\b/gi, replace: "しないでください" },
  { pattern: /\bare\b/gi, replace: "です" },
  { pattern: /\bis\b/gi, replace: "です" },
];

function translateJaBody(text: string): string {
  let out = text;
  out = applyPhrases(out, JA_PHRASE_REPLACEMENTS);
  out = applyRegexRules(out, JA_WORD_RULES);
  out = out
    .replace(/\b(a|an|the)\b/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/,\s*/g, "、")
    .replace(/\s+\)/g, ")")
    .replace(/\(\s+/g, "(")
    .trim();
  return out;
}

function englishResidueCount(text: string): number {
  const plain = text
    .replace(TOKEN_RE, " ")
    .replace(/[^A-Za-z]+/g, " ")
    .toLowerCase();

  let count = 0;
  for (const word of plain.split(/\s+/)) {
    if (!word || word.length < 3 || ALLOWED_ENGLISH_WORDS.has(word)) {
      continue;
    }
    count++;
  }
  return count;
}

function summarizeJaLabel(text: string): string {
  if (/stream/i.test(text)) {
    return "Stream を使う方法";
  }
  if (/reduce/i.test(text)) {
    return "reduce を使う方法";
  }
  if (/foreach/i.test(text)) {
    return "forEach を使う方法";
  }
  if (/recursive|recursion/i.test(text)) {
    return "再帰的な方法";
  }
  if (/hashmap|map/i.test(text)) {
    return "Map を使う方法";
  }
  if (/hashset|treeset|set/i.test(text)) {
    return "Set を使う方法";
  }
  if (/join/i.test(text)) {
    return "JOIN を使う方法";
  }
  if (/group by|having|aggregate/i.test(text)) {
    return "集約を使う方法";
  }
  if (/subquery|cte|window/i.test(text)) {
    return "SQL の別解";
  }
  if (/class/i.test(text)) {
    return "クラスを使う方法";
  }
  if (/type|generic|interface|enum/i.test(text)) {
    return "型を活かす方法";
  }
  if (/sort/i.test(text)) {
    return "並べ替えを使う方法";
  }
  return "別の実装方法";
}

function summarizeJaJudge(text: string): string {
  if (/type annotation|generic|interface|enum|literal|union|keyof/i.test(text)) {
    return "必要な型指定や型の制約が不足しているか、正しくありません。";
  }
  if (/loop|iterate|for|foreach|reduce/i.test(text)) {
    return "必要な反復処理や集約処理が不足しているか、書き方が適切ではありません。";
  }
  if (/sort|order|compare|merge|pointer|window/i.test(text)) {
    return "順序付けや比較、走査のロジックが要件と一致していません。";
  }
  if (/hashmap|hashset|map|set|contains|key/i.test(text)) {
    return "使うべきデータ構造や参照方法が要件と一致していません。";
  }
  if (/where|join|group by|having|subquery|cte|partition|over|limit|offset/i.test(text)) {
    return "SQL 句の選び方や条件の書き方が要件と一致していません。";
  }
  return "実装内容が要件と一致していません。";
}

function summarizeJaExplanation(text: string): string {
  if (/python/i.test(text) && /sum\(\)|max\(\)|len\(\)|dict|set|list comprehension|generator/i.test(text)) {
    return "Python では組み込み関数や簡潔な構文を使って、同じ考え方をより短く表現できます。";
  }
  if (/python/i.test(text)) {
    return "Python では対応する組み込み機能や構文を使って、同じ考え方を実装できます。";
  }
  if (/java/i.test(text) && /system\.out\.println|record|stream|arraylist|hashmap/i.test(text)) {
    return "Java では標準 API やクラスを使って、同じ考え方を明示的に実装できます。";
  }
  if (/java/i.test(text)) {
    return "Java では対応する標準 API や構文を使って、同じ考え方を実装できます。";
  }
  if (/typescript/i.test(text) && /type|generic|interface|enum|union|literal|keyof/i.test(text)) {
    return "TypeScript では型情報を活かして、同じ考え方を型安全に表現できます。";
  }
  if (/stream|reduce|foreach|map\(|filter\(/i.test(text)) {
    return "標準 API や関数型の書き方を使って、処理を簡潔に表現する別解です。";
  }
  if (/let|const|readonly|private|getter|setter/i.test(text)) {
    return "宣言方法やアクセス方法を変えて、同じ目的を分かりやすく実装する別解です。";
  }
  if (/hashmap|map/i.test(text) && /set/i.test(text)) {
    return "Map と Set を組み合わせて、対応関係の保持と高速な判定を行う方法です。";
  }
  if (/hashmap|map/i.test(text)) {
    return "Map 系のデータ構造で対応関係を保持しながら、効率よく処理する方法です。";
  }
  if (/hashset|treeset|set/i.test(text)) {
    return "Set 系のデータ構造を使って、重複除去や高速な存在確認を行う方法です。";
  }
  if (/recursive|recursion/i.test(text)) {
    return "再帰を使って同じ処理を表現する別解です。";
  }
  if (/sort|sorted|order/i.test(text)) {
    return "並べ替えや順序制御を活用して解く別解です。";
  }
  if (/join|group by|having|aggregate/i.test(text)) {
    return "複数テーブルの結合や集約を活用する SQL の別解です。";
  }
  if (/subquery|cte|window|partition|over/i.test(text)) {
    return "サブクエリや CTE、ウィンドウ関数を使って要件を表現する SQL の別解です。";
  }
  if (/async|await|promise|concurrent|sequential|retry|circuit breaker|semaphore/i.test(text)) {
    return "非同期処理の制御方法を変えて、同じ目的を達成する別解です。";
  }
  if (/generator|lazy/i.test(text)) {
    return "ジェネレータや遅延評価を活用して、必要な分だけ処理する別解です。";
  }
  if (/type|generic|interface|enum|literal|keyof|mapped|conditional/i.test(text)) {
    return "型定義や型推論を活かして、安全かつ明確に表現する別解です。";
  }
  return "同じ処理を別の考え方で実装する説明です。";
}

function summarizeJaFallback(text: string, context: JaFallbackContext): string {
  if (context === "label") {
    return summarizeJaLabel(text);
  }
  if (context === "judge") {
    return summarizeJaJudge(text);
  }
  if (context === "explanation") {
    return summarizeJaExplanation(text);
  }
  return summarizeJaExplanation(text);
}

export function translateJaFallback(text: string, context: JaFallbackContext = "general"): string {
  if (!text || !/[A-Za-z]/.test(text)) {
    return text;
  }

  const { masked, tokens } = maskText(text);
  const prefixed = looksLikeLabel(masked)
    ? applyFirstRule(masked, JA_LABEL_RULES) || applyFirstRule(masked, JA_PREFIX_RULES)
    : applyFirstRule(masked, JA_PREFIX_RULES);

  let translated = prefixed ?? translateJaBody(masked);
  if (translated === masked) {
    translated = `補足: ${translateJaBody(masked)}`;
  }

  const residueThreshold = context === "explanation" ? 1 : 5;
  if (englishResidueCount(translated) >= residueThreshold) {
    translated = summarizeJaFallback(text, context);
  }

  translated = unmaskText(translated, tokens)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();

  if (looksLikeLabel(text)) {
    return translated.replace(/[。.!?]+$/u, "");
  }

  if (!/[。.!?]$/u.test(translated)) {
    return `${translated}。`;
  }

  return translated;
}
