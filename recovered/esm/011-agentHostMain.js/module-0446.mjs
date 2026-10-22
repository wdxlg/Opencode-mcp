// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/automationCron.ts



// src/vs/platform/agentHost/node/automationCron.ts
var MINUTE_MS = 6e4;

var DATE_SEARCH_STEP_MS = 12 * 60 * MINUTE_MS;

var MAX_SEARCH_MS = 10 * 366 * 24 * 60 * MINUTE_MS;

var MONTH_NAMES = /* @__PURE__ */ new Map([
  ["JAN", 1],
  ["FEB", 2],
  ["MAR", 3],
  ["APR", 4],
  ["MAY", 5],
  ["JUN", 6],
  ["JUL", 7],
  ["AUG", 8],
  ["SEP", 9],
  ["OCT", 10],
  ["NOV", 11],
  ["DEC", 12]
]);

var WEEKDAY_NAMES = /* @__PURE__ */ new Map([
  ["SUN", 0],
  ["MON", 1],
  ["TUE", 2],
  ["WED", 3],
  ["THU", 4],
  ["FRI", 5],
  ["SAT", 6]
]);

function validateAutomationCron(expression, timeZone) {
  parseAutomationCron(expression);
  createDateFormatter(timeZone);
}

function nextAutomationCronOccurrence(expression, timeZone, after) {
  const cron = parseAutomationCron(expression);
  const formatter = createDateFormatter(timeZone);
  let candidate = Math.floor(after.getTime() / MINUTE_MS) * MINUTE_MS + MINUTE_MS;
  const searchEnd = candidate + MAX_SEARCH_MS;
  let minuteSearchEnd = candidate;
  while (candidate < searchEnd) {
    const parts = readLocalDateParts(formatter, candidate);
    const dateMatches = matchesDate(cron, parts);
    if (dateMatches && matchesTime(cron, parts)) {
      return new Date(candidate);
    }
    if (dateMatches || candidate < minuteSearchEnd) {
      candidate += MINUTE_MS;
      continue;
    }
    const jumpedCandidate = Math.min(candidate + DATE_SEARCH_STEP_MS, searchEnd);
    const jumpedParts = readLocalDateParts(formatter, jumpedCandidate);
    if (matchesDate(cron, jumpedParts)) {
      minuteSearchEnd = jumpedCandidate;
      candidate += MINUTE_MS;
    } else {
      candidate = jumpedCandidate;
    }
  }
  throw new Error(`Automation schedule has no occurrence within ten years: ${expression}`);
}

function parseAutomationCron(expression) {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) {
    throw new Error(`Automation schedule must contain exactly five fields: ${expression}`);
  }
  const cron = {
    minute: parseField(fields[0], 0, 59),
    hour: parseField(fields[1], 0, 23),
    dayOfMonth: parseField(fields[2], 1, 31),
    month: parseField(fields[3], 1, 12, MONTH_NAMES),
    dayOfWeek: parseField(fields[4], 0, 7, WEEKDAY_NAMES, (value) => value === 7 ? 0 : value)
  };
  if (!hasPossibleCalendarDay(cron)) {
    throw new Error(`Automation schedule cannot match a real calendar date: ${expression}`);
  }
  return cron;
}

function hasPossibleCalendarDay(cron) {
  if (cron.dayOfMonth.unrestricted || !cron.dayOfWeek.unrestricted) {
    return true;
  }
  const maximumDayByMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (const month2 of cron.month.values) {
    const maximumDay = maximumDayByMonth[month2];
    for (const day2 of cron.dayOfMonth.values) {
      if (day2 <= maximumDay) {
        return true;
      }
    }
  }
  return false;
}

function parseField(field, minimum, maximum, names = /* @__PURE__ */ new Map(), normalize3 = (value) => value) {
  const values = /* @__PURE__ */ new Set();
  for (const segment of field.split(",")) {
    if (!segment) {
      throw new Error(`Automation schedule contains an empty field segment: ${field}`);
    }
    const stepParts = segment.split("/");
    if (stepParts.length > 2) {
      throw new Error(`Automation schedule contains an invalid step: ${segment}`);
    }
    const step = stepParts[1] === void 0 ? 1 : parsePositiveInteger(stepParts[1], segment);
    const base = stepParts[0];
    let start;
    let end;
    if (base === "*") {
      start = minimum;
      end = maximum;
    } else {
      const range = base.split("-");
      if (range.length === 1) {
        if (stepParts.length > 1) {
          throw new Error(`Automation schedule steps require '*' or a range: ${segment}`);
        }
        start = parseValue(range[0], minimum, maximum, names);
        end = start;
      } else if (range.length === 2) {
        start = parseValue(range[0], minimum, maximum, names);
        end = parseValue(range[1], minimum, maximum, names);
        if (start > end) {
          throw new Error(`Automation schedule ranges must be ascending: ${segment}`);
        }
      } else {
        throw new Error(`Automation schedule contains an invalid range: ${segment}`);
      }
    }
    for (let value = start; value <= end; value += step) {
      values.add(normalize3(value));
    }
  }
  return { values, unrestricted: field === "*" };
}

function parseValue(value, minimum, maximum, names) {
  const named = names.get(value.toUpperCase());
  const parsed = named ?? (/^\d+$/.test(value) ? Number(value) : Number.NaN);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`Automation schedule value is outside ${minimum}-${maximum}: ${value}`);
  }
  return parsed;
}

function parsePositiveInteger(value, segment) {
  const parsed = /^\d+$/.test(value) ? Number(value) : Number.NaN;
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Automation schedule step must be a positive integer: ${segment}`);
  }
  return parsed;
}

function createDateFormatter(timeZone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      weekday: "short",
      hourCycle: "h23"
    });
  } catch (error) {
    throw new Error(`Automation schedule uses an invalid time zone: ${timeZone}`, { cause: error });
  }
}

function readLocalDateParts(formatter, timestamp) {
  const parts = new Map(formatter.formatToParts(timestamp).map((part) => [part.type, part.value]));
  const weekday = WEEKDAY_NAMES.get((parts.get("weekday") ?? "").toUpperCase());
  if (weekday === void 0) {
    throw new Error("Automation schedule could not resolve the local weekday.");
  }
  return {
    minute: Number(parts.get("minute")),
    hour: Number(parts.get("hour")),
    dayOfMonth: Number(parts.get("day")),
    month: Number(parts.get("month")),
    dayOfWeek: weekday
  };
}

function matchesDate(cron, parts) {
  if (!cron.month.values.has(parts.month)) {
    return false;
  }
  const dayOfMonthMatches = cron.dayOfMonth.values.has(parts.dayOfMonth);
  const dayOfWeekMatches = cron.dayOfWeek.values.has(parts.dayOfWeek);
  if (cron.dayOfMonth.unrestricted) {
    return cron.dayOfWeek.unrestricted || dayOfWeekMatches;
  }
  if (cron.dayOfWeek.unrestricted) {
    return dayOfMonthMatches;
  }
  return dayOfMonthMatches || dayOfWeekMatches;
}

function matchesTime(cron, parts) {
  return cron.minute.values.has(parts.minute) && cron.hour.values.has(parts.hour);
}
export { validateAutomationCron, nextAutomationCronOccurrence, parseAutomationCron, hasPossibleCalendarDay, parseField, parseValue, parsePositiveInteger, createDateFormatter, readLocalDateParts, matchesDate, matchesTime, MINUTE_MS, DATE_SEARCH_STEP_MS, MAX_SEARCH_MS, MONTH_NAMES, WEEKDAY_NAMES };
