// Item 5 — squad & leader routing (design + switch, default off). Builds on the existing multi-model collaboration
// framework without enabling it: the leader turns a list of sub-tasks into assignments for squad members by tag /
// keyword match, then least-loaded, then round robin. Disabled → dry-run plan only, nothing recorded or dispatched.
import { statePath, appendJsonl, readJsonlFamily, nowIso } from "./core.mjs";

const assignmentsFile = () => statePath("squad", "assignments.jsonl");
const words = (s) => String(s ?? "").toLowerCase();

export function planAssignments(tasks, squad, load = {}) {
  const members = (squad?.members ?? []).filter((m) => m && m.id && m.enabled !== false);
  if (!members.length) return { leader: squad?.leader ?? null, assignments: [], unassigned: tasks.map((t) => t.id ?? t.title), reason: "没有可用成员" };
  const counts = { ...load };
  let rr = 0;
  const assignments = tasks.map((task, i) => {
    const tags = (task.tags ?? []).map(words);
    const hay = `${words(task.title)} ${words(task.text)}`;
    const scored = members.map((m) => {
      const mt = (m.tags ?? []).map(words);
      const score = squad.strategy === "round_robin" ? 0 : mt.filter((t) => tags.includes(t)).length * 2 + mt.filter((t) => t && hay.includes(t)).length;
      const full = m.maxConcurrent && (counts[m.id] ?? 0) >= m.maxConcurrent;
      return { m, score: full ? -1 : score };
    }).filter((x) => x.score >= 0);
    if (!scored.length) return { task: task.id ?? `t${i + 1}`, member: null, reason: "成员均已满载" };
    const best = Math.max(...scored.map((x) => x.score));
    let pool = scored.filter((x) => x.score === best);
    const minLoad = Math.min(...pool.map((x) => counts[x.m.id] ?? 0));
    pool = pool.filter((x) => (counts[x.m.id] ?? 0) === minLoad);
    const pick = pool[rr++ % pool.length].m;
    counts[pick.id] = (counts[pick.id] ?? 0) + 1;
    return { task: task.id ?? `t${i + 1}`, title: task.title ?? null, member: pick.id, model: pick.model ?? null, score: best,
      reason: best > 0 ? "标签/关键词匹配" : "无匹配，按负载轮转" };
  });
  return { leader: squad.leader ?? null, strategy: squad.strategy ?? "tags", assignments };
}

export function squadPlan({ tasks = [], commit = false, task_id = null }, config) {
  const squad = config.squad ?? {};
  if (!Array.isArray(tasks) || !tasks.length) throw Object.assign(new Error("tasks 必须是非空数组 [{id,title,tags,text}]"), { code: "INVALID_ARGUMENT" });
  const plan = planAssignments(tasks, squad);
  if (!squad.enabled) return { enabled: false, dry_run: true, note: "squad.enabled=false：仅给出组长分派预案，不记录、不派发；多模型协作开关保持原状", ...plan };
  if (commit) for (const a of plan.assignments) appendJsonl(assignmentsFile(), { at: nowIso(), parent_task: task_id, leader: plan.leader, ...a });
  return { enabled: true, dry_run: !commit, ...plan };
}

export const squadFeature = {
  id: "squad",
  actions: {
    squad_plan: (a, c) => squadPlan(a, c.config),
    squad_status: (a, c) => ({ enabled: !!c.config.squad?.enabled, leader: c.config.squad?.leader ?? null, members: c.config.squad?.members ?? [],
      recent: readJsonlFamily(assignmentsFile(), 1).slice(-(a.limit ?? 20)) })
  }
};
