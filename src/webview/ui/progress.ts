// Progress panel — stats, recommendations, topic mastery
import { state } from "../state";
import { dom } from "../dom";
import { t } from "../i18n";
import { post } from "../vscodeApi";
import { renderLangButtons, renderTopics } from "./langTopics";
import type { ProgressStats, Recommendation, TopicStat } from "../../shared/protocol";

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
    if (streak > 0) {
      dom.streakBanner.classList.add("show");
      if (dom.streakCount) dom.streakCount.textContent = streak + " " + t("progress.dayStreak");
      if (dom.streakBest && stats.bestStreak) dom.streakBest.textContent = t("progress.best") + " " + stats.bestStreak;
    } else {
      dom.streakBanner.classList.remove("show");
    }
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

  // Daily Goal
  renderDailyGoal(stats.dailyGoal);

  // Weekly Trend
  renderWeeklyTrend(stats.weeklyTrend);
}

function renderDailyGoal(goal?: { target: number; completed: number; date: string }): void {
  const container = document.getElementById("dailyGoal");
  if (!container) { return; }
  if (!goal) { container.style.display = "none"; return; }

  container.style.display = "";
  const pct = Math.min(100, Math.round((goal.completed / goal.target) * 100));
  const done = goal.completed >= goal.target;

  container.innerHTML = `
    <div class="daily-goal-label">${done ? "Goal reached!" : goal.completed + " / " + goal.target + " today"}</div>
    <div class="daily-goal-bar"><div class="daily-goal-fill${done ? " complete" : ""}" style="width:${pct}%"></div></div>
  `;
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
    const dayLabel = day.date.slice(5); // MM-DD
    const color = day.passRate >= 80 ? "var(--good)" : day.passRate >= 50 ? "var(--warn)" : "var(--bad)";
    html += `<div class="weekly-bar-col" title="${day.date}: ${day.practices} practices, ${day.passRate}% pass">`;
    html += `<div class="weekly-bar" style="height:${Math.max(2, h)}px;background:${day.practices > 0 ? color : "var(--card-border)"}"></div>`;
    html += `<div class="weekly-day">${dayLabel}</div></div>`;
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
    topic.textContent = rec.lang + " - " + rec.topic;
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
    dom.topicProgressList.innerHTML = '<div class="topic-progress-item"><span class="topic-progress-name">No data yet</span><div class="topic-progress-bar"><div class="topic-progress-fill" style="width: 0%"></div></div><span class="topic-progress-pct">0%</span></div>';
    return;
  }
  state.topicStats = topics;
  dom.topicProgressList.innerHTML = "";

  topics.forEach(tp => {
    const div = document.createElement("div");
    const ret = Math.round(tp.averageRetention);
    const heat = ret >= 80 ? "hot" : ret >= 50 ? "warm" : "cold";
    div.className = "topic-progress-item topic-heat-" + heat;
    const dot = document.createElement("span");
    dot.className = "topic-heat-dot";
    const name = document.createElement("span");
    name.className = "topic-progress-name";
    name.textContent = tp.lang + " - " + tp.topic;
    const bar = document.createElement("div");
    bar.className = "topic-progress-bar";
    const fill = document.createElement("div");
    fill.className = "topic-progress-fill";
    fill.style.width = ret + "%";
    bar.appendChild(fill);
    const pct = document.createElement("span");
    pct.className = "topic-progress-pct";
    pct.textContent = ret + "%";
    div.appendChild(dot);
    div.appendChild(name);
    div.appendChild(bar);
    div.appendChild(pct);
    dom.topicProgressList!.appendChild(div);
  });
}
