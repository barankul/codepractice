// Progress panel — stats, recommendations, topic mastery
import { state } from "../state";
import { dom } from "../dom";
import { t } from "../i18n";
import { post } from "../vscodeApi";
import { renderLangButtons, renderTopics } from "./langTopics";
import type { ProgressStats, Recommendation, TopicStat } from "../../shared/protocol";

function getPracticeWord(): string {
  const lang = state.currentUiLang;
  if (lang === "ja") return "\u554f";
  if (lang === "tr") return "al\u0131\u015ft\u0131rma";
  return "practices";
}

function getUiLocale(): string {
  if (state.currentUiLang === "ja") return "ja-JP";
  if (state.currentUiLang === "tr") return "tr-TR";
  return "en-US";
}

function formatWeeklyDay(dateText: string): string {
  const parsed = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return dateText.slice(5);
  }
  return parsed.toLocaleDateString(getUiLocale(), { weekday: "short" });
}

export function renderProgressStats(stats: ProgressStats): void {
  if (!stats) return;
  state.progressStats = stats;

  if (dom.statDue) dom.statDue.textContent = String(stats.dueCount || 0);
  if (dom.statWeak) dom.statWeak.textContent = String(stats.weakTopics || 0);
  if (dom.statMastered) dom.statMastered.textContent = String(stats.masteredTopics || 0);
  if (dom.statTotal) dom.statTotal.textContent = String(stats.totalPractices || 0);
  if (dom.dueNumber) dom.dueNumber.textContent = String(stats.dueCount || 0);

  // Streak
  const streak = stats.currentStreak || 0;
  if (dom.streakBanner) {
    dom.streakBanner.classList.add("show");
    if (dom.streakCount) dom.streakCount.textContent = String(streak);
    const streakLabel = document.querySelector("#streakBanner .streak-label") as HTMLElement | null;
    if (streakLabel) {
      streakLabel.textContent = stats.bestStreak
        ? `${t("progress.dayStreak")} • ${t("progress.best")}: ${stats.bestStreak}`
        : t("progress.dayStreak");
    }
    if (dom.streakBest) dom.streakBest.textContent = "";
  }

  // XP Level
  const xpPerLevel = stats.xpNeeded || 200;
  const level = stats.globalLevel || 1;
  const xpInLevel = stats.xpInLevel || 0;
  const pct = xpPerLevel > 0 ? Math.round((xpInLevel / xpPerLevel) * 100) : 0;

  const xpBarFill = document.getElementById("xpBarFill");
  const xpLevel = document.getElementById("xpLevel");
  const xpCount = document.getElementById("xpCount");
  const xpNext = document.getElementById("xpNext");

  if (xpBarFill) (xpBarFill as HTMLElement).style.width = pct + "%";
  if (xpLevel) xpLevel.textContent = t("progress.level") + " " + level;
  if (xpCount) xpCount.textContent = xpInLevel + " / " + xpPerLevel + " " + t("progress.xp");
  if (xpNext) xpNext.textContent = (xpPerLevel - xpInLevel) + " " + t("progress.xpToNext");
  const progressFooterText = document.getElementById("progressFooterText");
  if (progressFooterText) {
    progressFooterText.textContent = `${t("progress.level")} ${level} \u2022 ${stats.totalPractices || 0} ${getPracticeWord()}`;
  }

  const dailyGoal = document.getElementById("dailyGoal");
  if (dailyGoal) {
    dailyGoal.style.display = "none";
    dailyGoal.innerHTML = "";
  }

  // Weekly Trend
  renderWeeklyTrend(stats.weeklyTrend);
}

function renderWeeklyTrend(trend?: { date: string; practices: number; passRate: number }[]): void {
  const container = document.getElementById("weeklyTrend");
  if (!container) { return; }
  if (!trend || trend.length === 0) { container.style.display = "none"; return; }

  container.style.display = "";
  const maxP = Math.max(1, ...trend.map(d => d.practices));

  let html = '<div class="weekly-trend-label">' + t("progress.weeklyTrend") + '</div><div class="weekly-bars">';
  for (const day of trend) {
    const h = Math.round((day.practices / maxP) * 40);
    const color = day.passRate >= 80 ? "var(--good)" : day.passRate >= 50 ? "var(--warn)" : "var(--bad)";
    const dayLabel = formatWeeklyDay(day.date);
    html += `<div class="weekly-bar" title="${dayLabel}: ${day.practices} ${getPracticeWord()}, ${day.passRate}% ${t("progress.passRate")}" style="height:${Math.max(3, h)}px;background:${day.practices > 0 ? color : "var(--card-border)"}"></div>`;
  }
  html += "</div>";
  container.innerHTML = html;
}

export function renderRecommendations(recs: Recommendation[]): void {
  if (!dom.recList) return;
  if (!recs || recs.length === 0) {
    dom.recList.innerHTML = '<div class="rec-item"><span class="rec-type">-</span><div class="rec-info"><div class="rec-topic">' + t("progress.startPracticing") + '</div><div class="rec-reason">' + t("progress.pickTopic") + "</div></div></div>";
    return;
  }
  state.recommendations = recs;
  dom.recList.innerHTML = "";

  const typeIcons: Record<string, string> = { due: "!", weak: "~", interleave: "*", new: "+" };
  const typeReasons: Record<string, string> = {
    due: t("rec.timeToReview"), weak: t("rec.weakTopic"),
    interleave: t("rec.mixItUp"), new: t("rec.newTopic"),
  };

  recs.slice(0, 5).forEach(rec => {
    const div = document.createElement("div");
    div.className = "rec-item " + rec.type;
    const icon = document.createElement("span");
    icon.className = "rec-type";
    icon.textContent = typeIcons[rec.type] || "-";
    const info = document.createElement("div");
    info.className = "rec-info";
    const topic = document.createElement("div");
    topic.className = "rec-topic";
    topic.textContent = rec.lang + " • " + rec.topic;
    const reason = document.createElement("div");
    reason.className = "rec-reason";
    reason.textContent = typeReasons[rec.type] || rec.reason || "";
    info.appendChild(topic);
    info.appendChild(reason);
    div.appendChild(icon);
    div.appendChild(info);

    div.onclick = () => {
      document.querySelectorAll(".tab").forEach(tb => tb.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      document.querySelector('.tab[data-tab="practice"]')?.classList.add("active");
      dom.practicePanel?.classList.add("active");
      state.selectedLang = rec.lang;
      state.selectedTopic = rec.topic;
      renderLangButtons();
      renderTopics();
      state.currentLoadingAction = "generate";
      post({ type: "generate", lang: state.selectedLang, topic: state.selectedTopic, mode: state.selectedMode, codeSize: state.selectedCodeSize });
    };

    dom.recList!.appendChild(div);
  });
}

export function renderTopicProgress(topics: TopicStat[]): void {
  if (!dom.topicProgressList) return;
  if (!topics || topics.length === 0) {
    dom.topicProgressList.innerHTML = '<div class="topic-progress-item"><span class="topic-progress-name">' + t("progress.noDataInline") + '</span><div class="topic-progress-bar"><div class="topic-progress-fill" style="width: 0%"></div></div><span class="topic-progress-pct">0%</span></div>';
    return;
  }
  state.topicStats = topics;
  dom.topicProgressList.innerHTML = "";

  topics.forEach(tp => {
    const div = document.createElement("div");
    const ret = Math.round(tp.averageRetention);
    div.className = "topic-progress-item";
    div.title = `${tp.lang} • ${tp.topic}`;
    const name = document.createElement("span");
    name.className = "topic-progress-name";
    name.textContent = tp.topic;
    const bar = document.createElement("div");
    bar.className = "topic-progress-bar";
    const fill = document.createElement("div");
    fill.className = "topic-progress-fill";
    fill.style.width = ret + "%";
    fill.style.background = ret >= 80 ? "var(--good)" : ret >= 50 ? "var(--accent)" : "var(--warn)";
    bar.appendChild(fill);
    const pct = document.createElement("span");
    pct.className = "topic-progress-pct";
    pct.textContent = ret + "%";
    div.appendChild(name);
    div.appendChild(bar);
    div.appendChild(pct);
    dom.topicProgressList!.appendChild(div);
  });
}
