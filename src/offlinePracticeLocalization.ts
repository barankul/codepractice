import type { UILang } from "./i18n";
import { translateJaFallback, type JaFallbackContext } from "./offlinePracticeJaFallback";
import {
  JA_PRACTICE_TRANSLATIONS,
  TR_PRACTICE_TRANSLATIONS,
  type PracticeTranslationEntry,
} from "./offlinePracticeLocalizationData";

type LocalizedLang = Exclude<UILang, "en">;

type LocalizablePractice = {
  title: string;
  task: string;
  hint: string;
  code: string;
  solutionCode: string;
  expectedOutput: string;
  testCases?: { input: string; output: string }[];
  judgeFeedback: {
    summary: string;
    lines: { line: number; problem: string; fix: string }[];
  };
  altMethods?: { name: string; code: string; explanation: string }[];
  crossLang?: Record<string, { code: string; highlights: { lines: number[]; explanation: string }[] }>;
};

type PatternRule = {
  pattern: RegExp;
  replace: string | ((...args: string[]) => string);
};

type PracticeProse = {
  title: string;
  task: string;
  hint: string;
};

const TOKEN_RE = /`[^`\n]*`|{{[^}]+}}|'[^'\n]*'|"[^"\n]*"/g;

function maskText(text: string): { masked: string; tokens: string[] } {
  const tokens: string[] = [];
  const masked = text.replace(TOKEN_RE, (segment) => {
    const token = `@@CP${tokens.length}@@`;
    tokens.push(segment);
    return token;
  });
  return { masked, tokens };
}

function unmaskText(text: string, tokens: string[]): string {
  return text.replace(/@@CP(\d+)@@/g, (_m, idx) => tokens[Number(idx)] || _m);
}

function practiceTextKey(title: string, task: string, hint: string): string {
  return `${title}\u241f${task}\u241f${hint}`;
}

function buildPracticeTranslations(entries: PracticeTranslationEntry[]): Record<string, PracticeProse> {
  return Object.fromEntries(
    entries.map(({ source, target }) => [
      practiceTextKey(source[0], source[1], source[2]),
      { title: target[0], task: target[1], hint: target[2] },
    ]),
  );
}

const TR_EXACT: Record<string, string> = {
  "Sum All Elements": "Tum Elemanlarin Toplamini Bul",
  "Given an integer array `nums`, calculate and print the sum of all elements.": "Bir tamsayi dizisi `nums` verildiginde, tum elemanlarin toplamini hesaplayip yazdir.",
  "Use a for loop to iterate through the array and add each element to the sum variable.": "Diziyi dolasmak ve her elemani toplam degiskenine eklemek icin bir for dongusu kullan.",
  "Sum Array Elements": "Dizi Elemanlarini Topla",
  "Calculate the sum of all elements in the given integer array and print the result.": "Verilen tamsayi dizisindeki tum elemanlarin toplamini hesaplayip sonucu yazdir.",
  "Use a for-each loop to iterate through the array and add each element to sum.": "Diziyi dolasmak ve her elemani `sum` degiskenine eklemek icin for-each dongusu kullan.",
  "Find the Maximum Element": "En Buyuk Elemani Bul",
  "Given an integer array `nums`, find and print the largest element.": "Bir tamsayi dizisi `nums` verildiginde, en buyuk elemani bulup yazdir.",
  "Initialize `max` with the first element, then loop through the rest comparing each element.": "`max` degiskenini ilk elemanla baslat, sonra kalan elemanlari dolasip tek tek karsilastir.",
  "Find Maximum Element": "Maksimum Elemani Bul",
  "Find and print the maximum value in the integer array.": "Tamsayi dizisindeki maksimum degeri bulup yazdir.",
  "Start with max = nums[0], then loop through comparing each element.": "`max = nums[0]` ile basla, sonra her elemani karsilastirarak diziyi dolas.",
  "Reverse a String": "Bir String'i Ters Cevir",
  "Reverse the given string and print the result.": "Verilen metni ters cevirip sonucu yazdir.",
  "Loop backwards through the string using charAt() and build the reversed string.": "`charAt()` kullanarak metni sondan basa dolas ve ters metni olustur.",
  "Count Vowels": "Sesli Harfleri Say",
  "Count and print the number of vowels (a, e, i, o, u) in the given string. Case-insensitive.": "Verilen metindeki sesli harflerin (a, e, i, o, u) sayisini buyuk-kucuk harf duyarli olmadan sayip yazdir.",
  "Convert to lowercase, then check each character against 'aeiou'.": "Metni kucuk harfe cevir, sonra her karakteri `aeiou` ile karsilastir.",
  "Calculate Factorial": "Faktoriyel Hesapla",
  "Implement the factorial method that returns n! (n factorial). Print the result for n = 5.": "n! (n faktoriyel) degerini donduren `factorial` metodunu yaz. `n = 5` icin sonucu yazdir.",
  "Multiply result by each number from 2 to n using a for loop.": "`result` degiskenini for dongusuyle 2'den n'e kadar her sayiyla carp.",
  "Check Palindrome": "Palindrom Kontrolu",
  "Implement the isPalindrome method that returns true if the string reads the same forwards and backwards. Print the result for \"racecar\".": "Metin tersten de ayni okunuyorsa `true` donduren `isPalindrome` metodunu yaz. `\"racecar\"` icin sonucu yazdir.",
  "Compare characters from the start and end, moving inward.": "Bas ve sondaki karakterleri karsilastirip ortaya dogru ilerle.",
  "Filter Even Numbers": "Cift Sayilari Filtrele",
  "Filter even numbers from the ArrayList and print them.": "ArrayList icindeki cift sayilari filtreleyip yazdir.",
  "Loop through nums, check if n % 2 == 0, and add to evens.": "`nums` listesini dolas, `n % 2 == 0` ise `evens` listesine ekle.",
  "Remove Duplicates": "Tekrarlari Kaldir",
  "Remove duplicate values from the ArrayList and print the result.": "ArrayList'teki tekrar eden degerleri kaldirip sonucu yazdir.",
  "Check if unique already contains the element before adding.": "Eklenmeden once elemanin `unique` listesinde olup olmadigini kontrol et.",
  "Count Character Frequency": "Karakter Frekansini Say",
  "Count the frequency of each character in the string and print the HashMap.": "Metindeki her karakterin frekansini sayip HashMap'i yazdir.",
  "Use getOrDefault(c, 0) + 1 to increment the count for each character.": "Her karakterin sayisini artirmak icin `getOrDefault(c, 0) + 1` kullan.",
  "Word Frequency Counter": "Kelime Frekansi Sayaci",
  "Count how many times each word appears in the sentence and print the result.": "Cumlede her kelimenin kac kez gectigini sayip sonucu yazdir.",
  "Split the sentence by spaces, then count each word with getOrDefault.": "Cumleyi bosluklardan bol, sonra her kelimeyi `getOrDefault` ile say.",
  "Missing loop to iterate the array.": "Diziyi dolasacak dongu eksik.",
  "Missing loop to iterate the array": "Diziyi dolasacak dongu eksik.",
  "Using forEach": "forEach Kullanimi",
  "This approach uses forEach to visit each element.": "Bu yontem, her elemani dolasmak icin forEach kullanir.",
  "Python's built-in `sum()` replaces the manual loop.": "Python'daki yerlesik `sum()` fonksiyonu manuel dongunun yerini alir.",
  "Kadane's Maximum Subarray Sum": "Kadane ile Maksimum Alt Dizi Toplami",
  "Track two values: the max sum ending at the current position, and the overall max sum seen so far. At each element, decide whether to extend the previous subarray or start a new one.": "Iki degeri takip et: mevcut konumda biten maksimum toplam ve su ana kadar gorulen genel maksimum toplam. Her elemanda, onceki alt diziyi uzatip uzatmamaya veya yeni bir alt dizi baslatmaya karar ver.",
};

const JA_EXACT: Record<string, string> = {
  "Sum All Elements": "すべての要素の合計",
  "Given an integer array `nums`, calculate and print the sum of all elements.": "整数配列 `nums` が与えられたとき、すべての要素の合計を計算して出力してください。",
  "Use a for loop to iterate through the array and add each element to the sum variable.": "for ループで配列を走査し、各要素を `sum` に加算してください。",
  "Sum Array Elements": "配列要素の合計",
  "Calculate the sum of all elements in the given integer array and print the result.": "与えられた整数配列のすべての要素の合計を計算し、結果を出力してください。",
  "Use a for-each loop to iterate through the array and add each element to sum.": "for-each ループで配列を走査し、各要素を `sum` に加えてください。",
  "Find the Maximum Element": "最大の要素を見つける",
  "Given an integer array `nums`, find and print the largest element.": "整数配列 `nums` が与えられたとき、最大の要素を見つけて出力してください。",
  "Initialize `max` with the first element, then loop through the rest comparing each element.": "`max` を最初の要素で初期化し、残りの要素を順に比較してください。",
  "Find Maximum Element": "最大要素を見つける",
  "Find and print the maximum value in the integer array.": "整数配列の最大値を見つけて出力してください。",
  "Start with max = nums[0], then loop through comparing each element.": "`max = nums[0]` から始め、各要素を比較しながら走査してください。",
  "Reverse the given string and print the result.": "与えられた文字列を反転して結果を出力してください。",
  "Loop backwards through the string using charAt() and build the reversed string.": "`charAt()` を使って文字列を後ろから走査し、反転した文字列を組み立ててください。",
  "Count Vowels": "母音を数える",
  "Count and print the number of vowels (a, e, i, o, u) in the given string. Case-insensitive.": "与えられた文字列内の母音（a, e, i, o, u）の数を数えて出力してください。大文字小文字は区別しません。",
  "Convert to lowercase, then check each character against 'aeiou'.": "文字列を小文字に変換し、各文字が `aeiou` に含まれるか確認してください。",
  "Calculate Factorial": "階乗を計算する",
  "Implement the factorial method that returns n! (n factorial). Print the result for n = 5.": "n!（n の階乗）を返す `factorial` メソッドを実装してください。`n = 5` の結果を出力してください。",
  "Multiply result by each number from 2 to n using a for loop.": "for ループで 2 から n までの各数を `result` に掛けてください。",
  "Check Palindrome": "回文を判定する",
  "Implement the isPalindrome method that returns true if the string reads the same forwards and backwards. Print the result for \"racecar\".": "文字列が前から読んでも後ろから読んでも同じ場合に `true` を返す `isPalindrome` メソッドを実装してください。`\"racecar\"` の結果を出力してください。",
  "Compare characters from the start and end, moving inward.": "先頭と末尾の文字を比較しながら内側へ進めてください。",
  "Filter Even Numbers": "偶数を抽出する",
  "Filter even numbers from the ArrayList and print them.": "ArrayList から偶数を抽出して出力してください。",
  "Loop through nums, check if n % 2 == 0, and add to evens.": "`nums` を走査し、`n % 2 == 0` を満たす要素を `evens` に追加してください。",
  "Remove Duplicates": "重複を削除する",
  "Remove duplicate values from the ArrayList and print the result.": "ArrayList から重複した値を削除し、結果を出力してください。",
  "Check if unique already contains the element before adding.": "追加する前に、その要素がすでに `unique` に含まれているか確認してください。",
  "Count the frequency of each character in the string and print the HashMap.": "文字列内の各文字の出現回数を数え、HashMap を出力してください。",
  "Use getOrDefault(c, 0) + 1 to increment the count for each character.": "各文字の件数を増やすには `getOrDefault(c, 0) + 1` を使ってください。",
  "Word Frequency Counter": "単語頻度カウンタ",
  "Count how many times each word appears in the sentence and print the result.": "文の中で各単語が何回現れるかを数え、結果を出力してください。",
  "Split the sentence by spaces, then count each word with getOrDefault.": "文を空白で分割し、`getOrDefault` を使って各単語を数えてください。",
  "Reverse an Array In-Place": "配列をその場で反転する",
  "Reverse the array `nums` in-place (without creating a new array) and print the result.": "配列 `nums` を新しい配列を作らずにその場で反転し、結果を出力してください。",
  "Use two pointers — one at the start and one at the end — and swap elements moving inward.": "先頭と末尾に 2 つのポインタを置き、内側に進めながら要素を交換してください。",
  "Count Elements Greater Than Average": "平均より大きい要素を数える",
  "Given an integer array `nums`, calculate the average and count how many elements are strictly greater than the average. Print both values.": "整数配列 `nums` が与えられたとき、平均を計算し、その平均より厳密に大きい要素の数を数えてください。両方の値を出力してください。",
  "First pass: compute the sum and average. Second pass: count elements that exceed the average.": "1 回目で合計と平均を計算し、2 回目で平均を超える要素を数えてください。",
  "Merge Two Sorted Arrays": "2 つのソート済み配列をマージする",
  "Given two sorted integer arrays `a` and `b`, merge them into a single sorted array and print the result.": "2 つのソート済み整数配列 `a` と `b` が与えられたとき、1 つのソート済み配列にマージして結果を出力してください。",
  "Use three pointers: one for each input array and one for the merged array. Compare elements and place the smaller one.": "3 つのポインタを使ってください。各入力配列に 1 つずつ、マージ先配列に 1 つです。要素を比較して小さい方を入れてください。",
  "Find Second Largest Element": "2 番目に大きい要素を見つける",
  "Given an integer array `nums`, find and print the second largest element. Assume the array has at least two distinct values.": "整数配列 `nums` が与えられたとき、2 番目に大きい要素を見つけて出力してください。配列には少なくとも 2 つの異なる値があると仮定してください。",
  "Track two variables: `first` (largest) and `second` (second largest). Update both as you iterate.": "`first`（最大）と `second`（2 番目に大きい値）の 2 つを追跡し、走査しながら更新してください。",
  "Add Elements and Print Size": "要素を追加してサイズを出力する",
  "Create an ArrayList of Strings, add the names \"Alice\", \"Bob\", \"Charlie\", \"Diana\", then print the list and its size.": "文字列の ArrayList を作成し、\"Alice\"、\"Bob\"、\"Charlie\"、\"Diana\" を追加して、リストとサイズを出力してください。",
  "Use `.add()` to insert elements and `.size()` to get the count.": "要素の追加には `.add()`、要素数の取得には `.size()` を使ってください。",
  "Remove All Even Numbers": "偶数をすべて削除する",
  "Given an ArrayList of integers, remove all even numbers and print the remaining list.": "整数の ArrayList が与えられたとき、すべての偶数を削除して残りのリストを出力してください。",
  "Use `removeIf()` with a lambda, or iterate backward with a manual loop to safely remove elements.": "`removeIf()` とラムダを使うか、手動ループで後ろから走査して安全に削除してください。",
  "Find Intersection of Two Lists": "2 つのリストの共通要素を見つける",
  "Given two ArrayLists of integers, find and print the common elements (intersection). Preserve the order from the first list.": "2 つの整数 ArrayList が与えられたとき、共通要素（積集合）を見つけて出力してください。1 つ目のリストの順序を保ってください。",
  "Loop through the first list and check if each element exists in the second list using `.contains()`.": "1 つ目のリストを走査し、各要素が 2 つ目のリストに `.contains()` で存在するか確認してください。",
  "Remove Duplicates Preserving Order": "順序を保って重複を削除する",
  "Given an ArrayList of integers with duplicates, remove duplicates while keeping the original order. Print the result.": "重複を含む整数の ArrayList が与えられたとき、元の順序を保ったまま重複を削除して結果を出力してください。",
  "A `LinkedHashSet` automatically removes duplicates while preserving insertion order.": "`LinkedHashSet` を使うと、挿入順を保ったまま自動で重複を削除できます。",
  "Rotate List by K Positions": "リストを K 位置回転する",
  "Rotate the ArrayList `nums` to the right by `k` positions and print the result. For example, [1,2,3,4,5] rotated by 2 becomes [4,5,1,2,3].": "ArrayList `nums` を右に `k` 位置回転し、結果を出力してください。たとえば [1,2,3,4,5] を 2 回転すると [4,5,1,2,3] になります。",
  "Use `Collections.rotate()` or manually split the list at index `size - k` and reassemble.": "`Collections.rotate()` を使うか、`size - k` の位置でリストを分けて組み直してください。",
  "Flatten Nested Structure": "ネスト構造を平坦化する",
  "Given an ArrayList of int arrays, flatten all values into a single ArrayList and print the result.": "int 配列の ArrayList が与えられたとき、すべての値を 1 つの ArrayList に平坦化して結果を出力してください。",
  "Use nested for-each loops: outer loop over the arrays, inner loop over each array's elements.": "外側で配列群を、内側で各配列の要素を走査する二重の for-each ループを使ってください。",
  "Count Character Frequency": "文字の出現頻度を数える",
  "Given a string `str`, count the frequency of each character and print the result as a map.": "文字列 `str` が与えられたとき、各文字の出現頻度を数え、マップとして出力してください。",
  "Loop through each character. Use `getOrDefault(c, 0)` to get the current count and add 1.": "各文字を走査し、現在の件数を `getOrDefault(c, 0)` で取得して 1 を加えてください。",
  "Store and Retrieve Student Grades": "学生の成績を保存して取得する",
  "Create a HashMap mapping student names to grades. Add three students, then retrieve and print one student's grade.": "学生名から成績への HashMap を作成してください。3 人の学生を追加し、そのうち 1 人の成績を取得して出力してください。",
  "Use `put(key, value)` to add entries and `get(key)` to retrieve values.": "エントリの追加には `put(key, value)`、値の取得には `get(key)` を使ってください。",
  "Find First Non-Repeating Character": "最初の非重複文字を見つける",
  "Given a string, find and print the first character that appears only once. If all repeat, print \"None\".": "文字列が与えられたとき、1 回だけ現れる最初の文字を見つけて出力してください。すべて重複する場合は `\"None\"` を出力してください。",
  "First pass: count frequencies. Second pass: find the first character with count 1.": "1 回目で頻度を数え、2 回目で件数が 1 の最初の文字を見つけてください。",
  "Group Words by Length": "単語を長さごとにグループ化する",
  "Given an array of words, group them by their length into a HashMap where keys are lengths and values are lists of words. Print the result.": "単語の配列が与えられたとき、長さをキー、単語リストを値とする HashMap にグループ化して結果を出力してください。",
  "For each word, check if the map has a list for that length. If not, create one. Then add the word.": "各単語について、その長さ用のリストがマップにあるか確認します。なければ作成し、その後で単語を追加してください。",
  "Two Sum Problem": "Two Sum 問題",
  "Given an integer array `nums` and a target value, find all pairs of indices whose values sum to the target. Print each pair.": "整数配列 `nums` と目標値が与えられたとき、値の合計が目標値になるインデックスの組をすべて見つけて出力してください。",
  "Store each number's index in a HashMap. For each element, check if `target - nums[i]` is already in the map.": "各数値のインデックスを HashMap に保存してください。各要素について、`target - nums[i]` がすでにマップにあるか確認します。",
  "Most Frequent Element": "最頻出要素",
  "Given an integer array `nums`, find and print the element that appears most frequently. If there is a tie, print any one of them.": "整数配列 `nums` が与えられたとき、最も多く出現する要素を見つけて出力してください。同率の場合はどれか 1 つを出力すればかまいません。",
  "First, count frequencies with a HashMap. Then, iterate the map to find the key with the highest value.": "まず HashMap で頻度を数え、その後マップを走査して値が最大のキーを見つけてください。",
  "Remove Duplicate Elements from Array": "配列から重複要素を削除する",
  "Given an integer array with duplicates, use a HashSet to remove duplicates and print the unique elements.": "重複を含む整数配列が与えられたとき、HashSet を使って重複を取り除き、一意な要素を出力してください。",
  "A HashSet automatically ignores duplicate values when you `add()` them.": "HashSet は `.add()` したときに重複値を自動で無視します。",
  "Check if Two Arrays Have Common Elements": "2 つの配列に共通要素があるか調べる",
  "Given two integer arrays, determine if they share any common elements. Print the result.": "2 つの整数配列が与えられたとき、共通要素を持つかどうかを判定し、結果を出力してください。",
  "Add all elements of one array to a HashSet, then check if any element of the second array is in the set.": "一方の配列の要素をすべて HashSet に入れ、もう一方の配列にその集合に含まれる要素があるか調べてください。",
  "Find Symmetric Difference of Two Sets": "2 つの集合の対称差を見つける",
  "Given two integer arrays, find the symmetric difference (elements in either set but not both) and print it sorted.": "2 つの整数配列が与えられたとき、対称差（どちらか一方にのみ含まれる要素）を見つけ、ソートして出力してください。",
  "The symmetric difference = elements in set1 but not set2, plus elements in set2 but not set1.": "対称差は、set1 にあって set2 にない要素と、set2 にあって set1 にない要素を合わせたものです。",
  "Count Distinct Words in a Sentence": "文中の異なる単語数を数える",
  "Given a sentence, count the number of distinct words (case-insensitive) and print them.": "文が与えられたとき、異なる単語の数（大文字小文字を区別しない）を数え、それらを出力してください。",
  "Split the sentence into words, convert to lowercase, and add each to a HashSet.": "文を単語に分割し、小文字に変換してから各単語を HashSet に追加してください。",
  "Count Vowels in a String": "文字列内の母音数を数える",
  "Given a string, count and print the number of vowels (a, e, i, o, u — case-insensitive).": "文字列が与えられたとき、母音（a, e, i, o, u。大文字小文字は区別しない）の数を数えて出力してください。",
  "Loop through each character and check if it is one of 'a', 'e', 'i', 'o', 'u' (case-insensitive).": "各文字を走査し、'a'、'e'、'i'、'o'、'u' のいずれかかを確認してください。大文字小文字は区別しません。",
  "Reverse a String": "文字列を反転する",
  "Given a string, reverse it and print the result.": "文字列が与えられたとき、それを反転して結果を出力してください。",
  "Use `StringBuilder` with its `.reverse()` method, or build a new string by iterating backward.": "`.reverse()` を持つ `StringBuilder` を使うか、後ろから走査して新しい文字列を組み立ててください。",
  "Check if String is Palindrome": "文字列が回文か確認する",
  "Given a string, check if it is a palindrome (reads the same forward and backward, case-insensitive, ignoring spaces).": "文字列が与えられたとき、それが回文かどうかを確認してください（前から読んでも後ろから読んでも同じで、大文字小文字は区別せず、空白は無視します）。",
  "Remove spaces, convert to lowercase, then compare the string with its reverse.": "空白を削除して小文字に変換し、元の文字列と反転した文字列を比較してください。",
  "Count Words in a Sentence": "文中の単語数を数える",
  "Given a sentence (which may have extra spaces), count and print the number of words.": "文が与えられたとき（余分な空白を含む場合があります）、単語数を数えて出力してください。",
  "Trim the string first, then split on one or more whitespace characters using `split(\"\\\\s+\")`.": "先に文字列を `trim()` し、その後 `split(\"\\\\s+\")` を使って 1 個以上の空白で分割してください。",
  "Capitalize First Letter of Each Word": "各単語の先頭文字を大文字にする",
  "Given a sentence, capitalize the first letter of each word and print the result.": "文が与えられたとき、各単語の先頭文字を大文字にして結果を出力してください。",
  "Split into words, capitalize the first character of each using `Character.toUpperCase()`, then rejoin.": "単語に分割し、各単語の先頭文字を `Character.toUpperCase()` で大文字にしてから再結合してください。",
  "Compress a String": "文字列を圧縮する",
  "Implement basic string compression: consecutive duplicate characters are replaced with the character followed by its count. For example, \"aabccc\" becomes \"a2b1c3\".": "基本的な文字列圧縮を実装してください。連続する重複文字は、その文字と出現回数に置き換えます。たとえば `\"aabccc\"` は `\"a2b1c3\"` になります。",
  "Use a while loop. For each character, count how many consecutive times it appears, then append the character and count.": "while ループを使ってください。各文字について連続出現回数を数え、文字と回数を追加してください。",
  "Write isPrime Method": "isPrime メソッドを書く",
  "Write a method `isPrime(int n)` that returns `true` if `n` is a prime number, `false` otherwise. Test it with several values.": "`n` が素数なら `true`、それ以外なら `false` を返す `isPrime(int n)` メソッドを書いてください。いくつかの値でテストしてください。",
  "Check divisibility from 2 to sqrt(n). If any number divides evenly, it's not prime. Handle n <= 1 as not prime.": "2 から sqrt(n) までで割り切れるか確認してください。どれかで割り切れれば素数ではありません。n <= 1 は素数ではないように扱ってください。",
  "Write Factorial Method": "factorial メソッドを書く",
  "Write a method `factorial(int n)` that returns the factorial of n. Test it with values 0 through 6.": "n の階乗を返す `factorial(int n)` メソッドを書いてください。0 から 6 までの値でテストしてください。",
  "Start with result = 1 and multiply by each integer from 2 to n. Remember that 0! = 1.": "`result = 1` から始め、2 から n までの各整数を掛けてください。0! = 1 であることも忘れないでください。",
  "Write Power Method": "power メソッドを書く",
  "Write a method `power(int base, int exp)` that calculates base raised to exp WITHOUT using `Math.pow`. Test it with several inputs.": "`Math.pow` を使わずに base の exp 乗を計算する `power(int base, int exp)` メソッドを書いてください。いくつかの入力でテストしてください。",
  "Multiply `result` by `base` exactly `exp` times in a loop. Start with `result = 1`.": "ループの中で `result` に `base` をちょうど `exp` 回掛けてください。`result = 1` から始めます。",
  "Write GCD Method": "GCD メソッドを書く",
  "Write a method `gcd(int a, int b)` that returns the greatest common divisor using the Euclidean algorithm. Test it with several pairs.": "ユークリッドの互除法を使って最大公約数を返す `gcd(int a, int b)` メソッドを書いてください。いくつかの組でテストしてください。",
  "Euclidean algorithm: repeatedly replace (a, b) with (b, a % b) until b is 0. Then a is the GCD.": "ユークリッドの互除法では、b が 0 になるまで (a, b) を (b, a % b) に繰り返し置き換えます。最後に残る a が GCD です。",
  "Check if Array is Sorted": "配列がソート済みか確認する",
  "Write a method `isSorted(int[] arr)` that returns `true` if the array is sorted in non-decreasing order. Test with sorted and unsorted arrays.": "配列が非減少順にソートされていれば `true` を返す `isSorted(int[] arr)` メソッドを書いてください。ソート済み配列と未ソート配列の両方でテストしてください。",
  "Compare each element with the next one. If any element is greater than the next, the array is not sorted.": "各要素を次の要素と比較してください。どれかが次の要素より大きければ、その配列はソートされていません。",
  "Recursive Fibonacci": "再帰 Fibonacci",
  "Write a recursive method `fibonacci(int n)` that returns the nth Fibonacci number (0-indexed: fib(0)=0, fib(1)=1). Print the first 10 values.": "n 番目の Fibonacci 数を返す再帰メソッド `fibonacci(int n)` を書いてください（0 始まり: fib(0)=0, fib(1)=1）。最初の 10 個の値を出力してください。",
  "Base cases: fib(0) = 0, fib(1) = 1. Recursive case: fib(n) = fib(n-1) + fib(n-2).": "基底条件は fib(0) = 0、fib(1) = 1 です。再帰式は fib(n) = fib(n-1) + fib(n-2) です。",
  "Kadane's Maximum Subarray Sum": "Kadane の最大部分配列和",
  "Given an integer array `nums` (which may contain negative numbers), find and print the maximum sum of any contiguous subarray.": "負の数を含む可能性がある整数配列 `nums` が与えられたとき、連続する部分配列の最大合計を見つけて出力してください。",
  "Track two values: the max sum ending at the current position, and the overall max sum seen so far. At each element, decide whether to extend the previous subarray or start a new one.": "2 つの値を追跡してください。現在位置で終わる最大合計と、これまでに見つかった全体の最大合計です。各要素で、前の部分配列を延長するか、新しく開始するかを判断してください。",
  "Merge Overlapping Intervals": "重なり合う区間をマージする",
  "Given a 2D array `intervals` where each element is `{start, end}`, merge all overlapping intervals and print the result. Two intervals overlap if one starts before or when the other ends.": "各要素が `{start, end}` である 2 次元配列 `intervals` が与えられたとき、重なり合う区間をすべてマージして結果を出力してください。一方の区間の開始位置が他方の終了位置以前であれば重なっているとみなします。",
  "Sort the intervals by start time first. Then iterate: if the current interval overlaps the last merged one, extend the end; otherwise, add a new interval to the result.": "まず開始時刻で区間をソートしてください。その後走査し、現在の区間が直前にマージした区間と重なる場合は終了位置を延長し、そうでなければ新しい区間を結果に追加してください。",
  "Group Anagrams Together": "アナグラムをまとめてグループ化する",
  "Given an ArrayList of strings `words`, group the anagrams together and print each group on a separate line. Two words are anagrams if they contain the same characters in any order.": "文字列の ArrayList `words` が与えられたとき、アナグラム同士をグループ化し、各グループを別々の行に出力してください。2 つの単語が同じ文字を別順序で含む場合、それらはアナグラムです。",
  "Sort each word's characters to create a canonical key. Words with the same key are anagrams. Use a HashMap to group them.": "各単語の文字をソートして共通キーを作ってください。同じキーを持つ単語同士がアナグラムです。HashMap を使ってグループ化してください。",
  "LRU Cache Simulation": "LRU キャッシュのシミュレーション",
  "Simulate a Least Recently Used (LRU) cache with capacity 3. Process the given access sequence: on each access, if the item is in the cache move it to the front (most recent); if not, add it to the front and evict the least recently used item if capacity is exceeded. Print the cache state after each access.": "容量 3 の Least Recently Used (LRU) キャッシュをシミュレートしてください。与えられたアクセス列を処理し、各アクセスでアイテムがキャッシュ内にあれば先頭（最新）に移動し、なければ先頭に追加してください。容量を超えた場合は最も古く使われていない要素を削除します。各アクセス後のキャッシュ状態を出力してください。",
  "For each access: first remove the item if it exists (so it moves to front), then insert at index 0. If size exceeds capacity, remove the last element.": "各アクセスで、まず存在するならその要素を削除して先頭へ移動できるようにし、その後 index 0 に挿入してください。サイズが容量を超えたら最後の要素を削除してください。",
  "Two Sum with HashMap": "HashMap を使った Two Sum",
  "Given an integer array `nums` and a target sum, find all pairs of indices whose values add up to the target. Print each pair as `nums[i] + nums[j] = target`. Each element can only be used once.": "整数配列 `nums` と目標合計が与えられたとき、値の和が目標になるインデックスの組をすべて見つけてください。各組は `nums[i] + nums[j] = target` の形で出力します。各要素は 1 回だけ使用できます。",
  "For each element, compute the complement (target - current). Use a HashMap to check if the complement was seen earlier in O(1) time.": "各要素について補数（target - current）を計算してください。補数が以前に出現したかどうかを HashMap で O(1) 時間で確認します。",
  "Longest Substring Without Repeating Characters": "重複文字のない最長部分文字列",
  "Given a string `s`, find the length of the longest substring that contains no repeating characters. Use a sliding window with a HashMap to track character positions. Print the length and the substring.": "文字列 `s` が与えられたとき、重複文字を含まない最長部分文字列の長さを求めてください。文字位置の追跡には HashMap を使ったスライディングウィンドウを用い、長さと部分文字列を出力してください。",
  "Use a sliding window: maintain a `start` pointer and a HashMap of each character's last seen index. When you encounter a repeat, move `start` past the previous occurrence.": "スライディングウィンドウを使います。`start` ポインタと各文字の直近出現位置を持つ HashMap を維持し、重複に出会ったら `start` を前回の出現位置より後ろへ進めてください。",
  "Count Common Elements Between Three Arrays": "3 つの配列に共通する要素を数える",
  "Given three integer arrays, find and print the elements that appear in all three arrays, sorted in ascending order.": "3 つの整数配列が与えられたとき、3 つすべてに現れる要素を見つけ、昇順にソートして出力してください。",
  "Put two arrays into HashSets, then iterate the third checking membership in both.": "2 つの配列を HashSet に入れ、3 つ目を走査しながら両方に含まれているかを確認してください。",
  "Find Longest Consecutive Sequence": "最長連続列を見つける",
  "Given an integer array `nums`, find the length of the longest sequence of consecutive integers (elements can be in any order). Use a HashSet for O(n) lookup. Print the length and the sequence.": "整数配列 `nums` が与えられたとき、連続する整数列の最長長さを求めてください（要素の順序は任意です）。HashSet を使って O(n) で確認し、長さと列を出力してください。",
  "Put all numbers in a HashSet. For each number, check if it's the start of a sequence (no n-1 in the set). If so, count consecutive numbers forward.": "すべての数を HashSet に入れてください。各数について、それが列の開始かどうか（set に n-1 がないか）を確認し、開始なら前方向に連続数を数えてください。",
  "Find All Pairs with Given Difference": "指定差を持つすべての組を見つける",
  "Given an integer array `nums` and a target difference `k`, find all unique pairs `(a, b)` where `a - b = k` and `a > b`. Use a HashSet for efficient lookup. Print pairs sorted by the first element.": "整数配列 `nums` と目標差 `k` が与えられたとき、`a - b = k` かつ `a > b` を満たす一意な組 `(a, b)` をすべて見つけてください。効率的な検索には HashSet を使い、先頭要素でソートして出力してください。",
  "Put all numbers in a HashSet. For each number n, check if n + k exists in the set. This gives you the pair (n + k, n) where the difference is k.": "すべての数を HashSet に入れてください。各数 n について、set に n + k があるか確認します。あれば差が k の組 `(n + k, n)` が得られます。",
  "Balanced Parentheses Checker": "括弧の対応チェッカー",
  "Given a string `s` containing parentheses `()`, brackets `[]`, and braces `{}`, determine if the string is balanced. Print whether it's balanced and, if not, the position of the first mismatch.": "括弧 `()`, 角括弧 `[]`, 波括弧 `{}` を含む文字列 `s` が与えられたとき、その文字列が正しく対応しているか判定してください。対応しているかどうかと、対応していない場合は最初の不一致位置を出力してください。",
  "Use a Stack to push opening brackets. For each closing bracket, pop and verify it matches. After processing, the stack should be empty.": "開き括弧を Stack に push します。各閉じ括弧で pop して対応を確認してください。処理後に Stack は空であるべきです。",
  "Run-Length Encoding and Decoding": "ランレングス圧縮と展開",
  "Implement both run-length encoding and decoding. Encoding compresses consecutive duplicate characters (e.g., `aaabbc` becomes `a3b2c1`). Decoding reverses it. Given a string `s`, print both the encoded and then decoded result.": "ランレングス圧縮と展開の両方を実装してください。圧縮では連続する重複文字をまとめます（例: `aaabbc` は `a3b2c1` になります）。展開では元に戻します。文字列 `s` が与えられたとき、圧縮結果と展開結果の両方を出力してください。",
  "For encoding, iterate and count consecutive characters. For decoding, parse character-count pairs and repeat each character.": "圧縮では連続文字を数えながら走査します。展開では文字と個数の組を読み取り、各文字をその回数だけ繰り返してください。",
  "Matrix Spiral Order Traversal": "行列のらせん順走査",
  "Write a method `spiralOrder` that takes a 2D integer array and returns its elements in spiral order (right, down, left, up, repeating inward). Print the result.": "2 次元整数配列を受け取り、その要素をらせん順（右、下、左、上を内側へ繰り返す順）で返す `spiralOrder` メソッドを書いてください。結果を出力してください。",
  "Maintain four boundaries: top, bottom, left, right. Traverse right along top row, down along right column, left along bottom row, up along left column. Shrink boundaries after each pass.": "上端、下端、左端、右端の 4 つの境界を管理してください。上端行を右へ、右端列を下へ、下端行を左へ、左端列を上へ走査し、各周回後に境界を縮めます。",
  "Expression Evaluator": "式評価器",
  "Write methods to evaluate a simple mathematical expression string containing non-negative integers, `+`, `-`, `*`, `/` (integer division), and spaces. Respect operator precedence (* and / before + and -). No parentheses. Print the result.": "非負整数、`+`, `-`, `*`, `/`（整数除算）、および空白を含む単純な数式文字列を評価するメソッドを書いてください。演算子の優先順位（`*` と `/` が `+` と `-` より先）を守り、括弧は使いません。結果を出力してください。",
  "Use a Stack. For + and -, push the number (negate for -). For * and /, pop the top, compute, and push back. Finally, sum all values in the stack.": "Stack を使ってください。`+` と `-` では数値を push し（`-` は負にする）、`*` と `/` では一番上を pop して計算後に再び push します。最後に Stack 内のすべての値を合計してください。",
  "Missing loop to iterate the array.": "配列を走査するループがありません。",
  "Missing loop to iterate the array": "配列を走査するループがありません。",
  "Using forEach": "forEach の使用",
  "This approach uses forEach to visit each element.": "この方法では forEach を使って各要素を処理します。",
  "Python's built-in `sum()` replaces the manual loop.": "Python の組み込み `sum()` は手動ループの代わりになります。",
};

const EXACT_TEXT: Record<LocalizedLang, Record<string, string>> = {
  tr: TR_EXACT,
  ja: JA_EXACT,
};

const PATTERN_TEXT: Record<LocalizedLang, PatternRule[]> = {
  tr: [
    {
      pattern: /^Add (@@CP\d+@@)$/,
      replace: (_m, code) => `Ekle: ${code}`,
    },
    {
      pattern: /^Use (@@CP\d+@@)$/,
      replace: (_m, code) => `Kullan: ${code}`,
    },
    {
      pattern: /^Set (@@CP\d+@@)$/,
      replace: (_m, code) => `Ata: ${code}`,
    },
  ],
  ja: [
    {
      pattern: /^Add (@@CP\d+@@)$/,
      replace: (_m, code) => `追加してください: ${code}`,
    },
    {
      pattern: /^Use (@@CP\d+@@)$/,
      replace: (_m, code) => `使ってください: ${code}`,
    },
    {
      pattern: /^Set (@@CP\d+@@)$/,
      replace: (_m, code) => `設定してください: ${code}`,
    },
  ],
};

const PRACTICE_PROSE: Partial<Record<LocalizedLang, Record<string, PracticeProse>>> = {
  ja: buildPracticeTranslations(JA_PRACTICE_TRANSLATIONS),
  tr: buildPracticeTranslations(TR_PRACTICE_TRANSLATIONS),
};

function translateText(text: string, lang: UILang, context: JaFallbackContext = "general"): string {
  if (!text || lang === "en") {
    return text;
  }

  const exact = EXACT_TEXT[lang]?.[text];
  if (exact) {
    return exact;
  }

  const { masked, tokens } = maskText(text);
  for (const rule of PATTERN_TEXT[lang]) {
    if (!rule.pattern.test(masked)) {
      continue;
    }

    const safePattern = new RegExp(rule.pattern.source, rule.pattern.flags);
    const translated = masked.replace(safePattern, rule.replace as never);
    return unmaskText(translated, tokens);
  }

  if (lang === "ja") {
    return translateJaFallback(text, context);
  }

  return text;
}

export function localizeOfflinePractice<T extends LocalizablePractice>(practice: T, uiLang: UILang): T {
  if (uiLang === "en") {
    return practice;
  }

  const prose = PRACTICE_PROSE[uiLang]?.[practiceTextKey(practice.title, practice.task, practice.hint)];

  return {
    ...practice,
    title: prose?.title ?? translateText(practice.title, uiLang, "general"),
    task: prose?.task ?? translateText(practice.task, uiLang, "general"),
    hint: prose?.hint ?? translateText(practice.hint, uiLang, "general"),
    judgeFeedback: {
      summary: translateText(practice.judgeFeedback.summary, uiLang, "judge"),
      lines: practice.judgeFeedback.lines.map((line) => ({
        ...line,
        problem: translateText(line.problem, uiLang, "judge"),
        fix: translateText(line.fix, uiLang, "judge"),
      })),
    },
    altMethods: practice.altMethods?.map((method) => ({
      ...method,
      name: translateText(method.name, uiLang, "label"),
      explanation: translateText(method.explanation, uiLang, "explanation"),
    })),
    crossLang: practice.crossLang
      ? Object.fromEntries(
          Object.entries(practice.crossLang).map(([lang, value]) => [
            lang,
            {
              ...value,
              highlights: value.highlights.map((highlight) => ({
                ...highlight,
                explanation: translateText(highlight.explanation, uiLang, "explanation"),
              })),
            },
          ]),
        )
      : undefined,
  };
}
