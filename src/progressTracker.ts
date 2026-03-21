// 進捗管理 — spaced repetition + XP tracking
import * as vscode from "vscode";
import { TOPICS } from "./constants";

interface SRCard {
  due: Date;
  interval: number; // days
  ease: number; // easiness factor (2.5 default)
  reps: number; // successful repetitions
}

/** 練習カード — practice card with SR data */
export interface PracticeCard {
  card: SRCard;
  lang: string;
  topic: string;
  title: string;
  task: string;
  totalAttempts: number;
  successfulAttempts: number;
  lastAttemptDate?: string;
  created: string;
}

/** トピック統計 — per-topic stats */
export interface TopicStats {
  lang: string;
  topic: string;
  totalPractices: number;
  mastered: number;
  learning: number;
  due: number;
  averageRetention: number; // 0-100%
  streak: number;
  lastPracticeDate?: string;
  xp: number;
  xpLevel: number;
  totalXpEarned: number;
}

/** 全体進捗 — overall progress data */
export interface ProgressData {
  cards: PracticeCard[];
  topicProgress: Record<string, TopicStats>;
  lastActiveDate?: string;
}

/** 推薦 — recommended practice with reason */
export interface Recommendation {
  lang: string;
  topic: string;
  reason: string;
  priority: number;
  type: "due" | "new" | "weak" | "interleave";
}

const STORAGE_KEY = "codepractice.progress";

function createEmptyCard(now: Date): SRCard {
  return {
    due: now,
    interval: 0,
    ease: 2.5,
    reps: 0
  };
}

function scheduleCard(card: SRCard, quality: number, now: Date): SRCard {
  // quality: 0=again, 1=hard, 2=good, 3=easy
  const newCard = { ...card };

  if (quality < 1) {
    // Failed - reset
    newCard.reps = 0;
    newCard.interval = 1;
  } else {
    // Passed
    if (newCard.reps === 0) {
      newCard.interval = 1;
    } else if (newCard.reps === 1) {
      newCard.interval = 3;
    } else {
      newCard.interval = Math.round(newCard.interval * newCard.ease);
    }
    newCard.reps++;

    // Adjust ease factor
    newCard.ease = Math.max(1.3, newCard.ease + (0.1 - (2 - quality) * (0.08 + (2 - quality) * 0.02)));

    // Bonus for easy
    if (quality === 3) {
      newCard.interval = Math.round(newCard.interval * 1.3);
    }
  }

  // Cap interval at 365 days
  newCard.interval = Math.min(365, newCard.interval);

  // Set next due date
  newCard.due = new Date(now.getTime() + newCard.interval * 24 * 60 * 60 * 1000);

  return newCard;
}

/** 進捗追跡 — spaced repetition progress tracker */
export class ProgressTracker {
  private context: vscode.ExtensionContext;
  private data: ProgressData;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.data = this.load();
  }

  private load(): ProgressData {
    const stored = this.context.globalState.get<ProgressData>(STORAGE_KEY);
    if (stored) {
      stored.cards = stored.cards.map(pc => ({
        ...pc,
        card: this.restoreCard(pc.card)
      }));
      return stored;
    }
    return {
      cards: [],
      topicProgress: {}
    };
  }

  private restoreCard(cardData: any): SRCard {
    const due = new Date(cardData.due);
    return {
      ...cardData,
      due: isNaN(due.getTime()) ? new Date() : due
    };
  }

  private async save(): Promise<void> {
    await this.context.globalState.update(STORAGE_KEY, this.data);
  }

  /** 全リセット — erase all progress data */
  async resetAll(): Promise<void> {
    this.data = { cards: [], topicProgress: {} };
    await this.save();
  }

  /** 練習記録 — record practice attempt and schedule review */
  async recordPractice(
    lang: string,
    topic: string,
    title: string,
    task: string,
    passed: boolean,
    difficulty: "again" | "hard" | "good" | "easy" = passed ? "good" : "again"
  ): Promise<{ nextReview: Date }> {

    let practiceCard = this.data.cards.find(
      c => c.lang === lang && c.topic === topic && c.title === title
    );

    const now = new Date();

    if (!practiceCard) {
      practiceCard = {
        card: createEmptyCard(now),
        lang,
        topic,
        title,
        task,
        totalAttempts: 0,
        successfulAttempts: 0,
        created: now.toISOString()
      };
      this.data.cards.push(practiceCard);
    }

    practiceCard.totalAttempts++;
    if (passed) {
      practiceCard.successfulAttempts++;
    }
    practiceCard.lastAttemptDate = now.toISOString();
    this.data.lastActiveDate = now.toISOString().split("T")[0];

    // Convert difficulty to quality (0-3)
    const qualityMap: Record<string, number> = { again: 0, hard: 1, good: 2, easy: 3 };
    const quality = qualityMap[difficulty];

    // Schedule next review
    practiceCard.card = scheduleCard(practiceCard.card, quality, now);

    this.updateTopicStats(lang, topic);
    await this.save();

    return { nextReview: practiceCard.card.due };
  }

  private updateTopicStats(lang: string, topic: string): void {
    const key = `${lang}:${topic}`;
    const topicCards = this.data.cards.filter(c => c.lang === lang && c.topic === topic);

    const now = new Date();
    let mastered = 0;
    let learning = 0;
    let due = 0;
    let totalRetention = 0;
    let streak = 0;

    for (const pc of topicCards) {
      if (pc.card.interval >= 21 && pc.card.reps >= 3) {
        mastered++;
      } else {
        learning++;
      }

      if (pc.card.due <= now) {
        due++;
      }

      const retention = Math.min(100, (pc.successfulAttempts / Math.max(1, pc.totalAttempts)) * 100);
      totalRetention += retention;
    }

    const sorted = [...topicCards].sort((a, b) =>
      new Date(b.lastAttemptDate || 0).getTime() - new Date(a.lastAttemptDate || 0).getTime()
    );
    for (const pc of sorted) {
      if (pc.successfulAttempts > 0 && pc.totalAttempts === pc.successfulAttempts) {
        streak++;
      } else {
        break;
      }
    }

    // Preserve existing XP data
    const existing = this.data.topicProgress[key];
    this.data.topicProgress[key] = {
      lang,
      topic,
      totalPractices: topicCards.length,
      mastered,
      learning,
      due,
      averageRetention: topicCards.length > 0 ? totalRetention / topicCards.length : 0,
      streak,
      lastPracticeDate: topicCards.length > 0 ? sorted[0]?.lastAttemptDate : undefined,
      xp: existing?.xp || 0,
      xpLevel: existing?.xpLevel || 1,
      totalXpEarned: existing?.totalXpEarned || 0
    };
  }

  /** 推薦取得 — get practice recommendations */
  getRecommendations(lang?: string): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const now = new Date();

    // 1. Due cards
    const dueCards = this.data.cards.filter(c =>
      c.card.due <= now && (!lang || c.lang === lang)
    ).sort((a, b) => a.card.due.getTime() - b.card.due.getTime());

    for (const card of dueCards.slice(0, 3)) {
      recommendations.push({
        lang: card.lang,
        topic: card.topic,
        reason: "Due for review",
        priority: 100,
        type: "due"
      });
    }

    // 2. Weak topics
    const weakTopics = Object.values(this.data.topicProgress)
      .filter(t => t.averageRetention < 70 && (!lang || t.lang === lang))
      .sort((a, b) => a.averageRetention - b.averageRetention);

    for (const topic of weakTopics.slice(0, 2)) {
      if (!recommendations.find(r => r.lang === topic.lang && r.topic === topic.topic)) {
        recommendations.push({
          lang: topic.lang,
          topic: topic.topic,
          reason: `Needs practice (${Math.round(topic.averageRetention)}% retention)`,
          priority: 80,
          type: "weak"
        });
      }
    }

    // 3. Interleaving
    const recentTopics = this.data.cards
      .filter(c => c.lastAttemptDate && (!lang || c.lang === lang))
      .sort((a, b) =>
        new Date(b.lastAttemptDate!).getTime() - new Date(a.lastAttemptDate!).getTime()
      )
      .slice(0, 5)
      .map(c => c.topic);

    const allTopics = this.getAllTopics(lang);
    const notRecentTopics = allTopics.filter(t => !recentTopics.includes(t.topic));

    for (const topic of notRecentTopics.slice(0, 2)) {
      if (!recommendations.find(r => r.lang === topic.lang && r.topic === topic.topic)) {
        recommendations.push({
          lang: topic.lang,
          topic: topic.topic,
          reason: "Mix it up! (Interleaving)",
          priority: 60,
          type: "interleave"
        });
      }
    }

    // 4. New topics
    const practicedTopics = new Set(this.data.cards.map(c => `${c.lang}:${c.topic}`));
    for (const topic of allTopics) {
      const key = `${topic.lang}:${topic.topic}`;
      if (!practicedTopics.has(key)) {
        recommendations.push({
          lang: topic.lang,
          topic: topic.topic,
          reason: "New topic to explore",
          priority: 40,
          type: "new"
        });
      }
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  private getAllTopics(lang?: string): { lang: string; topic: string }[] {
    const result: { lang: string; topic: string }[] = [];
    for (const [l, topics] of Object.entries(TOPICS)) {
      if (!lang || l === lang) {
        for (const t of topics) {
          result.push({ lang: l, topic: t });
        }
      }
    }
    return result;
  }

  /** トピック履歴 — get recent practice titles for topic */
  getTopicHistory(lang: string, topic: string, limit = 5): string[] {
    return this.data.cards
      .filter(c => c.lang === lang && c.topic === topic)
      .sort((a, b) =>
        new Date(b.lastAttemptDate || b.created).getTime() -
        new Date(a.lastAttemptDate || a.created).getTime()
      )
      .slice(0, limit)
      .map(c => c.title);
  }

  /** 全体統計 — get overall stats (XP, streaks, mastery) */
  getOverallStats(): {
    totalPractices: number;
    masteredTopics: number;
    dueCount: number;
    weakTopics: number;
    currentStreak: number;
    bestStreak: number;
    totalXP: number;
    globalLevel: number;
    xpInLevel: number;
    xpNeeded: number;
    dailyGoal: { target: number; completed: number; date: string };
    weeklyTrend: { date: string; practices: number; passRate: number }[];
  } {
    const now = new Date();
    const dueCount = this.data.cards.filter(c => c.card.due <= now).length;
    const masteredTopics = Object.values(this.data.topicProgress)
      .filter(t => t.averageRetention >= 80 && t.totalPractices >= 3).length;
    const weakTopics = Object.values(this.data.topicProgress)
      .filter(t => t.averageRetention < 60 && t.totalPractices >= 1).length;

    // Calculate daily streak
    const { currentStreak, bestStreak } = this.calculateStreak();

    // Global XP
    const { totalXP, globalLevel, xpInLevel, xpNeeded } = this.getTotalXP();

    return {
      totalPractices: this.data.cards.reduce((sum, c) => sum + c.totalAttempts, 0),
      masteredTopics,
      dueCount,
      weakTopics,
      currentStreak,
      bestStreak,
      totalXP,
      globalLevel,
      xpInLevel,
      xpNeeded,
      dailyGoal: this.getDailyProgress(),
      weeklyTrend: this.getWeeklyTrend()
    };
  }

  private calculateStreak(): { currentStreak: number; bestStreak: number } {
    // Get unique practice dates (YYYY-MM-DD)
    const dates = new Set<string>();
    for (const card of this.data.cards) {
      if (card.lastAttemptDate) {
        dates.add(card.lastAttemptDate.split("T")[0]);
      }
    }

    if (dates.size === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    const sorted = [...dates].sort().reverse(); // most recent first
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Current streak: must include today or yesterday
    let currentStreak = 0;
    if (sorted[0] === today || sorted[0] === yesterday) {
      let expectedDate = new Date(sorted[0]);
      for (const dateStr of sorted) {
        const d = new Date(dateStr);
        const diff = Math.round((expectedDate.getTime() - d.getTime()) / 86400000);
        if (diff <= 0) {
          currentStreak++;
          expectedDate = new Date(d.getTime() - 86400000);
        } else {
          break;
        }
      }
    }

    // Best streak
    let bestStreak = 0;
    let streak = 1;
    const asc = [...dates].sort();
    for (let i = 1; i < asc.length; i++) {
      const prev = new Date(asc[i - 1]);
      const curr = new Date(asc[i]);
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (diff === 1) {
        streak++;
      } else {
        bestStreak = Math.max(bestStreak, streak);
        streak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, streak, currentStreak);

    return { currentStreak, bestStreak };
  }

  /** トピック統計取得 — get stats for a specific topic */
  getTopicStats(lang: string, topic: string): TopicStats | undefined {
    return this.data.topicProgress[`${lang}:${topic}`];
  }

  /** 全トピック統計 — get all topic stats */
  getAllTopicStats(lang?: string): TopicStats[] {
    return Object.values(this.data.topicProgress)
      .filter(t => !lang || t.lang === lang);
  }

  /** 推奨レベル — get recommended difficulty level */
  getRecommendedLevel(lang: string, topic: string): number {
    const stats = this.getTopicStats(lang, topic);
    if (stats?.xpLevel && stats.xpLevel > 1) {
      return stats.xpLevel;
    }
    if (!stats || stats.totalPractices === 0) {
      return 1;
    }

    if (stats.averageRetention >= 90 && stats.mastered >= 3) {
      return Math.min(5, 3 + Math.floor(stats.streak / 2));
    } else if (stats.averageRetention >= 75) {
      return Math.min(4, 2 + Math.floor(stats.mastered / 2));
    } else if (stats.averageRetention >= 50) {
      return 2;
    }
    return 1;
  }

  /** スマート選択 — pick topic based on progression data */
  pickSmartTopic(lang: string): { topic: string; reason: string } {
    const recs = this.getRecommendations(lang);

    // Find first recommendation matching this language
    const match = recs.find(r => r.lang === lang);
    if (match) {
      return { topic: match.topic, reason: match.reason };
    }

    // Fallback: random topic for this language
    const allTopics = this.getAllTopics(lang);
    const langTopics = allTopics.filter(t => t.lang === lang);
    if (langTopics.length > 0) {
      const pick = langTopics[Math.floor(Math.random() * langTopics.length)];
      return { topic: pick.topic, reason: "Random" };
    }

    // Ultimate fallback
    return { topic: "Array", reason: "Default" };
  }

  /** レベルアップXP — XP needed for given level */
  static xpNeededForLevel(level: number): number {
    return 100 + (level - 1) * 50;
  }

  /** トピックXP取得 — get XP info for topic */
  getTopicXP(lang: string, topic: string): { xp: number; level: number; xpNeeded: number } {
    const stats = this.getTopicStats(lang, topic);
    const level = stats?.xpLevel || 1;
    return {
      xp: stats?.xp || 0,
      level,
      xpNeeded: ProgressTracker.xpNeededForLevel(level)
    };
  }

  /** XP追加 — add XP to topic, handle level-ups */
  async addTopicXP(lang: string, topic: string, xp: number): Promise<{
    newXP: number;
    level: number;
    leveledUp: boolean;
    xpNeeded: number;
    xpEarned: number;
  }> {
    const key = `${lang}:${topic}`;
    if (!this.data.topicProgress[key]) {
      // Initialize if doesn't exist
      this.updateTopicStats(lang, topic);
    }
    const stats = this.data.topicProgress[key];

    if (!stats.xpLevel) { stats.xpLevel = 1; }
    if (!stats.xp) { stats.xp = 0; }
    if (!stats.totalXpEarned) { stats.totalXpEarned = 0; }

    stats.xp += xp;
    stats.totalXpEarned += xp;

    let leveledUp = false;
    const needed = ProgressTracker.xpNeededForLevel(stats.xpLevel);

    // Level up (could skip multiple levels with huge XP)
    while (stats.xp >= ProgressTracker.xpNeededForLevel(stats.xpLevel)) {
      stats.xp -= ProgressTracker.xpNeededForLevel(stats.xpLevel);
      stats.xpLevel++;
      leveledUp = true;
    }

    await this.save();

    return {
      newXP: stats.xp,
      level: stats.xpLevel,
      leveledUp,
      xpNeeded: ProgressTracker.xpNeededForLevel(stats.xpLevel),
      xpEarned: xp
    };
  }

  /** 日次目標 — daily goal progress */
  getDailyProgress(target: number = 3): { target: number; completed: number; date: string } {
    const today = new Date().toISOString().split("T")[0];
    const completed = this.data.cards.filter(c =>
      c.lastAttemptDate && c.lastAttemptDate.startsWith(today)
    ).length;
    return { target, completed, date: today };
  }

  /** 週間トレンド — practices and pass rate per day for last 7 days */
  getWeeklyTrend(): { date: string; practices: number; passRate: number }[] {
    const result: { date: string; practices: number; passRate: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      let total = 0;
      let passed = 0;

      for (const card of this.data.cards) {
        if (card.lastAttemptDate && card.lastAttemptDate.startsWith(dateStr)) {
          total += card.totalAttempts > 0 ? 1 : 0;
          if (card.successfulAttempts > 0) { passed++; }
        }
      }

      result.push({
        date: dateStr,
        practices: total,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0
      });
    }

    return result;
  }

  /** セッション要約 — session summary since given timestamp */
  getSessionSummary(sessionStartMs: number): {
    practicesDone: number;
    passed: number;
    failed: number;
    xpEarned: number;
    newMastered: string[];
  } {
    const sessionStart = new Date(sessionStartMs).toISOString();
    let practicesDone = 0;
    let passed = 0;
    let failed = 0;
    const newMastered: string[] = [];

    for (const card of this.data.cards) {
      if (card.lastAttemptDate && card.lastAttemptDate >= sessionStart) {
        practicesDone++;
        if (card.successfulAttempts > 0) { passed++; }
        else { failed++; }
        // Check if mastered during this session
        if (card.card.interval >= 21 && card.card.reps >= 3) {
          newMastered.push(`${card.lang}/${card.topic}`);
        }
      }
    }

    // Approximate XP earned this session
    const xpEarned = passed * 25 + failed * 5;

    return { practicesDone, passed, failed, xpEarned, newMastered: [...new Set(newMastered)] };
  }

  /** 合計XP — get total XP across all topics */
  getTotalXP(): { totalXP: number; globalLevel: number; xpInLevel: number; xpNeeded: number } {
    let totalXP = 0;
    for (const stats of Object.values(this.data.topicProgress)) {
      totalXP += stats.totalXpEarned || 0;
    }
    // Global level: 200 XP per level
    const xpPerLevel = 200;
    const globalLevel = Math.floor(totalXP / xpPerLevel) + 1;
    const xpInLevel = totalXP % xpPerLevel;
    return { totalXP, globalLevel, xpInLevel, xpNeeded: xpPerLevel };
  }

}
