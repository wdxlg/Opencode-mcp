// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/automations/schedule.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/common/automations/schedule.ts
var DAYS_OF_WEEK = [
  localize(12843, null),
  localize(12841, null),
  localize(12845, null),
  localize(12846, null),
  localize(12844, null),
  localize(12840, null),
  localize(12842, null)
];

function computeNextRunAt(schedule, now) {
  const { interval, scheduleHour, scheduleMinute, scheduleDay } = schedule;
  switch (interval) {
    case "manual":
      return void 0;
    case "hourly":
      return new Date(now.getTime() + 60 * 60 * 1e3);
    case "daily": {
      if (!isValidHourMinute(scheduleHour, scheduleMinute)) {
        return void 0;
      }
      const today = buildLocalDate(now.getFullYear(), now.getMonth(), now.getDate(), scheduleHour, scheduleMinute);
      if (today.getTime() > now.getTime()) {
        return today;
      }
      return buildLocalDate(now.getFullYear(), now.getMonth(), now.getDate() + 1, scheduleHour, scheduleMinute);
    }
    case "weekly": {
      if (!isValidHourMinute(scheduleHour, scheduleMinute)) {
        return void 0;
      }
      if (!Number.isInteger(scheduleDay) || scheduleDay < 0 || scheduleDay > 6) {
        return void 0;
      }
      const currentDay = now.getDay();
      let daysAhead = scheduleDay - currentDay;
      const sameDayButPassed = daysAhead === 0 && (now.getHours() > scheduleHour || now.getHours() === scheduleHour && now.getMinutes() >= scheduleMinute);
      if (daysAhead < 0 || sameDayButPassed) {
        daysAhead += 7;
      }
      return buildLocalDate(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead, scheduleHour, scheduleMinute);
    }
    default:
      return void 0;
  }
}

function isValidHourMinute(hour2, minute2) {
  return Number.isInteger(hour2) && hour2 >= 0 && hour2 <= 23 && Number.isInteger(minute2) && minute2 >= 0 && minute2 <= 59;
}

function buildLocalDate(year2, monthIndex, day2, hour2, minute2) {
  const candidate = new Date(year2, monthIndex, day2, hour2, minute2, 0, 0);
  if (candidate.getHours() === hour2 && candidate.getMinutes() === minute2) {
    return candidate;
  }
  for (let shift2 = 1; shift2 <= 3; shift2++) {
    const shifted = new Date(year2, monthIndex, day2, hour2 + shift2, minute2, 0, 0);
    if (shifted.getHours() === (hour2 + shift2) % 24 && shifted.getMinutes() === minute2) {
      return shifted;
    }
  }
  return candidate;
}
export { computeNextRunAt, isValidHourMinute, buildLocalDate, DAYS_OF_WEEK };
