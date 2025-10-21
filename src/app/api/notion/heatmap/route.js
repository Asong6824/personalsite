import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function buildRangeDays(daysCount) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - daysCount + 1);
  const arr = [];
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    arr.push(toDateString(d));
  }
  return arr;
}

function getText(prop) {
  if (!prop) return '';
  const t = prop.type;
  if (t === 'title') return (prop.title || []).map(x => x.plain_text).join('');
  if (t === 'rich_text') return (prop.rich_text || []).map(x => x.plain_text).join('');
  if (t === 'select') return prop.select?.name || '';
  if (t === 'multi_select') return (prop.multi_select || []).map(x => x.name).join(',');
  if (t === 'url') return prop.url || '';
  if (t === 'email') return prop.email || '';
  return '';
}

function getNumber(prop) {
  if (!prop) return 0;
  if (prop.type === 'number') return Number(prop.number || 0) || 0;
  const txt = getText(prop);
  const n = Number(txt);
  return Number.isFinite(n) ? n : 0;
}

function getDateStr(prop) {
  const iso = prop?.date?.start || '';
  if (!iso) return '';
  return iso.slice(0, 10);
}

const SYN = {
  // Activities
  date: ['date', '日期', '时间', 'day'],
  title: ['name', '标题', 'title'],
  quality: ['quality', '评分', '分数', 'score', '等级', 'level'],
  minutes: ['minutes', '时长', 'duration', 'min', 'minute', '分钟'],
  note: ['note', '备注', '说明', 'comment', 'text', '描述'],
  goalId: ['goal_id', 'goal', '目标', 'goalid', 'goalId'],
  krId: ['kr_id', 'kr', 'key_result', '关键结果', 'krid', 'krId'],
  quantity: ['quantity', '数量', '次数', '件数'],
  // Goals
  goal_goalId: ['goal_id', 'goal', '目标', 'goalid', 'goalId'],
  goal_dailyTargetMinutes: ['daily_target_minutes', 'target_minutes', '日目标分钟', 'dailyMinutes'],
  goal_weight: ['weight', '权重', '比例', 'weight_pct'],
  // KRs
  kr_krId: ['kr_id', 'kr', 'key_result', '关键结果', 'krid', 'krId'],
  kr_defaultMinutes: ['default_minutes', '每件分钟', '基准分钟', 'defaultMin', 'base_minutes'],
  kr_allowedQualityMax: ['allowed_quality_max', '质量上限', '评分上限', 'max_quality', 'quality_cap'],
  kr_goalId: ['goal_id', 'goal', '目标', 'goalid', 'goalId'],
};

function findPropByType(props, type) {
  for (const [name, def] of Object.entries(props)) {
    if (def.type === type) return name;
  }
  return null;
}

function findPropByName(props, names) {
  const set = new Set((names || []).map(n => n.toLowerCase()));
  for (const name of Object.keys(props)) {
    if (set.has(name.toLowerCase())) return name;
  }
  return null;
}

function findNumberBySyn(props, names) {
  const set = new Set((names || []).map(n => n.toLowerCase()));
  // Prefer numeric type first
  for (const [name, def] of Object.entries(props)) {
    if (def.type === 'number' && set.has(name.toLowerCase())) return name;
  }
  // Fallback: any numeric type
  for (const [name, def] of Object.entries(props)) {
    if (def.type === 'number') return name;
  }
  // Last resort: any matching name regardless of type
  return findPropByName(props, names);
}

function detectActivityProps(detail) {
  const props = detail.properties || {};
  const titleProp = findPropByType(props, 'title') || findPropByName(props, SYN.title);
  const dateProp = findPropByType(props, 'date') || findPropByName(props, SYN.date);
  const qualityProp = findNumberBySyn(props, SYN.quality);
  const minutesProp = findNumberBySyn(props, SYN.minutes);
  const quantityProp = findNumberBySyn(props, SYN.quantity);
  const goalIdProp = findPropByName(props, SYN.goalId);
  const krIdProp = findPropByName(props, SYN.krId);
  const noteProp = findPropByType(props, 'rich_text') || findPropByName(props, SYN.note);
  return { titleProp, dateProp, qualityProp, minutesProp, quantityProp, goalIdProp, krIdProp, noteProp };
}

function detectGoalProps(detail) {
  const props = detail.properties || {};
  const goalIdProp = findPropByName(props, SYN.goal_goalId);
  const dailyTargetMinutesProp = findNumberBySyn(props, SYN.goal_dailyTargetMinutes);
  const weightProp = findNumberBySyn(props, SYN.goal_weight);
  const titleProp = findPropByType(props, 'title');
  return { goalIdProp, dailyTargetMinutesProp, weightProp, titleProp };
}

function detectKrProps(detail) {
  const props = detail.properties || {};
  const krIdProp = findPropByName(props, SYN.kr_krId);
  const defaultMinutesProp = findNumberBySyn(props, SYN.kr_defaultMinutes);
  const allowedQualityMaxProp = findNumberBySyn(props, SYN.kr_allowedQualityMax);
  const goalIdProp = findPropByName(props, SYN.kr_goalId);
  const titleProp = findPropByType(props, 'title');
  const weightProp = findNumberBySyn(props, SYN.kr_weight);
  return { krIdProp, defaultMinutesProp, allowedQualityMaxProp, goalIdProp, titleProp, weightProp };
}

async function dsQueryAll(client, data_source_id) {
  let results = [];
  let cursor = undefined;
  do {
    const resp = await client.dataSources.query({ data_source_id, start_cursor: cursor });
    results = results.concat(resp.results || []);
    cursor = resp.has_more ? resp.next_cursor : undefined;
  } while (cursor);
  return results;
}

function qualityToFactor(q) {
  const num = Number.isFinite(q) ? q : 1;
  const clamped = Math.max(0, Math.min(5, num));
  return clamped / 5;
}

function normalizeCapToFactor(cap) {
  if (!Number.isFinite(cap)) return 1;
  if (cap <= 1) return Math.max(0, cap);
  return Math.min(1, cap / 5);
}

async function queryAllByDate(client, database_id, dateProp, useCreatedTime, startISO, endISO) {
  let results = [];
  let cursor = undefined;
  do {
    const resp = await client.dataSources.query({
      data_source_id: database_id,
      filter: dateProp ? {
        and: [
          { property: dateProp, date: { on_or_after: startISO } },
          { property: dateProp, date: { on_or_before: endISO } },
        ]
      } : {
        and: [
          { timestamp: 'created_time', created_time: { on_or_after: startISO } },
          { timestamp: 'created_time', created_time: { on_or_before: endISO } },
        ]
      },
      sorts: dateProp ? [{ property: dateProp, direction: 'ascending' }] : [{ timestamp: 'created_time', direction: 'ascending' }],
      start_cursor: cursor,
    });
    results = results.concat(resp.results || []);
    cursor = resp.has_more ? resp.next_cursor : undefined;
  } while (cursor);
  return results;
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const daysParam = url.searchParams.get('days');
    const DAYS = Math.round((daysParam ? Number(daysParam) : 365) / 7) * 7;

    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    let NOTION_DB_ACTIVITIES = process.env.NOTION_DB_ACTIVITIES;
    let NOTION_DB_GOALS = process.env.NOTION_DB_GOALS;
    let NOTION_DB_KRS = process.env.NOTION_DB_KRS;

    if (!NOTION_TOKEN) {
      return NextResponse.json({ error: 'Missing Notion env: NOTION_TOKEN' }, { status: 500 });
    }

    const client = new Client({ auth: NOTION_TOKEN });

    // Auto-detect Activities DB if missing
    let propsUsed = null;
    if (!NOTION_DB_ACTIVITIES) {
      try {
        const search = await client.search({ filter: { property: 'object', value: 'data_source' }, page_size: 50 });
        const candidates = search.results || [];
        let best = null;
        let bestScore = -1;
        for (const db of candidates) {
          try {
            const det = await client.dataSources.retrieve({ data_source_id: db.id.replace(/-/g, '') });
            const props = det.properties || {};
            const hasDateType = Object.values(props).some(p => p.type === 'date');
            if (!hasDateType) continue;
            // score by synonyms presence
            const namesLower = Object.keys(props).map(n => n.toLowerCase());
            const has = syns => syns.some(s => namesLower.includes(s.toLowerCase()));
            let score = 10 + (has(SYN.quality) ? 2 : 0) + (has(SYN.minutes) ? 2 : 0) + (has(SYN.note) ? 1 : 0);
            if (score > bestScore) { bestScore = score; best = db.id; }
          } catch (_) {}
        }
        if (best) NOTION_DB_ACTIVITIES = best;
      } catch (e) {
        console.warn('[heatmap] auto-detect failed', e);
      }
    }

    if (!NOTION_DB_ACTIVITIES) {
      return NextResponse.json({ error: 'Missing NOTION_DB_ACTIVITIES and auto-detect failed. Set env or use /api/notion/list-dbs to find ID.' }, { status: 500 });
    }

    if (!NOTION_DB_GOALS || !NOTION_DB_KRS) {
      return NextResponse.json({ error: 'Missing NOTION_DB_GOALS or NOTION_DB_KRS. Set env or use /api/notion/list-dbs to find IDs.' }, { status: 500 });
    }

    // Determine property names from schema
    const actDbId = (NOTION_DB_ACTIVITIES || '').replace(/-/g, '');
    const goalsDbId = (NOTION_DB_GOALS || '').replace(/-/g, '');
    const krsDbId = (NOTION_DB_KRS || '').replace(/-/g, '');

    const actSchema = await client.dataSources.retrieve({ data_source_id: actDbId });
    const goalsSchema = await client.dataSources.retrieve({ data_source_id: goalsDbId });
    const krsSchema = await client.dataSources.retrieve({ data_source_id: krsDbId });

    const aProps = detectActivityProps(actSchema);
    const gProps = detectGoalProps(goalsSchema);
    const kProps = detectKrProps(krsSchema);
    propsUsed = { activities: aProps, goals: gProps, krs: kProps };

    // Query KRs and Goals maps
    const krPages = await dsQueryAll(client, krsDbId);
    const goalPages = await dsQueryAll(client, goalsDbId);

    const krMap = new Map();
    const krsArray = [];
    for (const page of krPages) {
      const p = page.properties || {};
      const krId = kProps.krIdProp ? getText(p[kProps.krIdProp]) : '';
      if (!krId) continue;
      const defaultMinutes = kProps.defaultMinutesProp ? getNumber(p[kProps.defaultMinutesProp]) : 0;
      const allowedQualityMaxRaw = kProps.allowedQualityMaxProp ? getNumber(p[kProps.allowedQualityMaxProp]) : 1;
      const allowedQualityMaxFactor = normalizeCapToFactor(allowedQualityMaxRaw);
      const krGoalId = kProps.goalIdProp ? getText(p[kProps.goalIdProp]) : '';
      const krTitle = kProps.titleProp ? getText(p[kProps.titleProp]) : krId;
      const weight = kProps.weightProp ? getNumber(p[kProps.weightProp]) : 1;
      krMap.set(krId, { defaultMinutes, allowedQualityMaxFactor, krGoalId, krTitle, weight });
      krsArray.push({ id: krId, title: krTitle, goalId: krGoalId, weight });
    }

    const goalsMap = new Map();
    const goalsArray = [];
    for (const page of goalPages) {
      const p = page.properties || {};
      const goalId = gProps.goalIdProp ? getText(p[gProps.goalIdProp]) : '';
      if (!goalId) continue;
      const dailyTargetMinutes = gProps.dailyTargetMinutesProp ? getNumber(p[gProps.dailyTargetMinutesProp]) : 60;
      const weight = gProps.weightProp ? getNumber(p[gProps.weightProp]) : 1;
      const goalTitle = gProps.titleProp ? getText(p[gProps.titleProp]) : goalId;
      goalsMap.set(goalId, { dailyTargetMinutes, weight, goalTitle });
      goalsArray.push({ id: goalId, title: goalTitle, weight, dailyTargetMinutes });
    }

    // Date range: today - DAYS + 1 ... today
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - DAYS + 1);
    const startISO = start.toISOString().slice(0, 10);
    const endISO = end.toISOString().slice(0, 10);

    const actPages = await queryAllByDate(client, actDbId, aProps.dateProp, !aProps.dateProp, startISO, endISO);

    // Aggregate effective minutes per day per goal
    const effByDayGoal = new Map(); // date -> Map(goalId -> effMinutes)
    const entriesByDay = new Map();

    for (const page of actPages) {
      const p = page.properties || {};
      const date = aProps.dateProp ? getDateStr(p[aProps.dateProp]) : (page.created_time || '').slice(0, 10);
      if (!date) continue;
      const name = aProps.titleProp ? getText(p[aProps.titleProp]) : '';
      const minutesRaw = aProps.minutesProp ? getNumber(p[aProps.minutesProp]) : 0;
      const quantity = aProps.quantityProp ? getNumber(p[aProps.quantityProp]) : 0;
      const qualityRaw = aProps.qualityProp ? getNumber(p[aProps.qualityProp]) : 1;
      const goalIdFromActivity = aProps.goalIdProp ? getText(p[aProps.goalIdProp]) : '';
      const krId = aProps.krIdProp ? getText(p[aProps.krIdProp]) : '';
      const krInfo = krId ? krMap.get(krId) : undefined;
      const goalId = goalIdFromActivity || krInfo?.krGoalId || '';
      if (!goalId) continue;

      const minutes = minutesRaw > 0 ? minutesRaw : ((quantity > 0 ? quantity : 0) * (krInfo?.defaultMinutes || 0));
      const factor = Math.min(qualityToFactor(qualityRaw), krInfo?.allowedQualityMaxFactor ?? 1);
      const effMinutes = minutes * factor;
      const note = aProps.noteProp ? getText(p[aProps.noteProp]) : '';

      if (!effByDayGoal.has(date)) effByDayGoal.set(date, new Map());
      const gmap = effByDayGoal.get(date);
      gmap.set(goalId, (gmap.get(goalId) || 0) + effMinutes);

      const entry = { date, name, goalId, krId, minutes, quantity, quality: Math.max(0, Math.min(5, qualityRaw)), factor, effMinutes, note };
      const prevEntries = entriesByDay.get(date);
      if (!prevEntries) entriesByDay.set(date, [entry]); else prevEntries.push(entry);
    }

    const range = buildRangeDays(DAYS);
    const days = range.map(d => {
      const gEff = effByDayGoal.get(d) || new Map();
      let scoreSum = 0;
      for (const [goalId, { dailyTargetMinutes, weight }] of goalsMap) {
        const totalEffMinutes = gEff.get(goalId) || 0;
        const p_i = Math.min(1, dailyTargetMinutes > 0 ? (totalEffMinutes / dailyTargetMinutes) : 0);
        scoreSum += weight * p_i;
      }
      const dayScore100 = 100 * scoreSum;
      const score5 = Math.round(Math.max(0, Math.min(5, dayScore100 / 20)));
      return { date: d, score: score5, entries: entriesByDay.get(d) || [], rawScore: Math.round(dayScore100) };
    });

    return NextResponse.json({
      days,
      goals: goalsArray,
      krs: krsArray,
      meta: {
        daysCount: DAYS,
        notion: {
          method: 'goals-weighted',
          databases: {
            activities: NOTION_DB_ACTIVITIES,
            goals: NOTION_DB_GOALS,
            krs: NOTION_DB_KRS
          },
          props: {
            activities: aProps,
            goals: gProps,
            krs: kProps
          }
        }
      }
    }, { status: 200 });
  } catch (e) {
    console.error('[notion/heatmap] GET error', e);
    const msg = e?.message || 'unknown';
    const status = e?.status || 500;
    return NextResponse.json({ error: 'failed to build heatmap from Notion', details: msg }, { status });
  }
}