/** コード取得 — fetch code from GitHub with caching */
import * as vscode from "vscode";
import { CodeEntry } from "./githubIndex";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function fetchGitHubCode(
  entry: CodeEntry,
  context: vscode.ExtensionContext
): Promise<string | null> {
  const cached = await readCache(entry, context);
  if (cached !== null) {
    return cached;
  }

  const url = `https://raw.githubusercontent.com/${entry.repo}/${entry.branch}/${entry.path}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[CodePractice] GitHub fetch ${response.status}: ${url}`);
      return null;
    }

    const content = await response.text();

    await writeCache(entry, content, context);

    return content;
  } catch (e: any) {
    console.warn(`[CodePractice] GitHub fetch error: ${e.message}`);
    return null;
  }
}

function cacheKey(entry: CodeEntry): string {
  return `gh_${entry.repo.replace(/\//g, "_")}_${entry.path.replace(/[\/\\]/g, "_")}`;
}

async function readCache(entry: CodeEntry, context: vscode.ExtensionContext): Promise<string | null> {
  try {
    const key = cacheKey(entry);
    const tsKey = key + "_ts";

    const cached = context.globalState.get<string>(key);
    const timestamp = context.globalState.get<number>(tsKey);

    if (cached && timestamp && Date.now() - timestamp < CACHE_TTL_MS) {
      return cached;
    }
  } catch { /* ignore */ }
  return null;
}

async function writeCache(entry: CodeEntry, content: string, context: vscode.ExtensionContext): Promise<void> {
  try {
    const key = cacheKey(entry);
    if (content.length < 50_000) {
      await context.globalState.update(key, content);
      await context.globalState.update(key + "_ts", Date.now());

      const cacheKeys = context.globalState.get<string[]>("gh_cache_keys") || [];
      if (!cacheKeys.includes(key)) {
        cacheKeys.push(key);
        while (cacheKeys.length > 100) {
          const oldKey = cacheKeys.shift()!;
          await context.globalState.update(oldKey, undefined);
          await context.globalState.update(oldKey + "_ts", undefined);
        }
        await context.globalState.update("gh_cache_keys", cacheKeys);
      }
    }
  } catch { /* ignore */ }
}
