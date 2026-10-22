// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptTimeline/promptBucketing.ts



// src/vs/workbench/contrib/chat/browser/promptTimeline/promptBucketing.ts
var MAX_TICKS = 24;

var oneDayMs = 864e5;

function bucketKey(date, now) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date >= startOfToday) {
    return `today-${date.getTime()}`;
  }
  const daysAgo = (startOfToday.getTime() - date.getTime()) / oneDayMs;
  if (daysAgo < 1) {
    return `yesterday-h${date.getHours()}`;
  }
  if (daysAgo < 30) {
    return `day-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
  return `month-${date.getFullYear()}-${date.getMonth()}`;
}

function toBucket(prompt, prompts = [prompt]) {
  return {
    prompt,
    prompts,
    count: prompts.length
  };
}

function bucketPrompts(prompts, now) {
  const buckets = [];
  let currentKey;
  for (const prompt of prompts) {
    const key3 = bucketKey(new Date(prompt.timestamp), now);
    const current = buckets[buckets.length - 1];
    if (!current || key3 !== currentKey) {
      buckets.push(toBucket(prompt));
      currentKey = key3;
    } else {
      const groupedPrompts = [...current.prompts, prompt];
      buckets[buckets.length - 1] = toBucket(current.prompt, groupedPrompts);
    }
  }
  return buckets;
}

function uniformSample(buckets, maxTicks) {
  if (buckets.length <= maxTicks) {
    return buckets;
  }
  const first2 = buckets[0];
  const last = buckets[buckets.length - 1];
  if (maxTicks <= 2) {
    return [first2, last];
  }
  const sampled = [first2];
  const step = (buckets.length - 1) / (maxTicks - 1);
  for (let i2 = 1; i2 <= maxTicks - 2; i2++) {
    const index2 = Math.round(i2 * step);
    if (index2 > 0 && index2 < buckets.length - 1) {
      sampled.push(buckets[index2]);
    }
  }
  sampled.push(last);
  return sampled;
}

function expandBucket(bucket, budget) {
  if (bucket.count <= budget + 1) {
    return bucket.prompts.map((prompt) => toBucket(prompt));
  }
  const expandedCount = budget;
  const remainder = bucket.prompts.slice(0, bucket.count - expandedCount);
  const expandedPrompts = bucket.prompts.slice(bucket.count - expandedCount);
  return [
    toBucket(remainder[0], remainder),
    ...expandedPrompts.map((prompt) => toBucket(prompt))
  ];
}

function expandRecentBuckets(buckets, maxTicks) {
  if (buckets.length >= maxTicks) {
    return buckets;
  }
  let expanded2 = buckets;
  let total = buckets.length;
  for (let i2 = expanded2.length - 1; i2 >= 0 && total < maxTicks; i2--) {
    const bucket = expanded2[i2];
    if (bucket.count <= 1) {
      continue;
    }
    const replacement = expandBucket(bucket, maxTicks - total);
    total += replacement.length - 1;
    expanded2 = [
      ...expanded2.slice(0, i2),
      ...replacement,
      ...expanded2.slice(i2 + 1)
    ];
  }
  return expanded2;
}

function budgetBucketPrompts(prompts, now = Date.now(), maxTicks = MAX_TICKS) {
  const cap = Math.min(MAX_TICKS, Math.max(1, maxTicks));
  const buckets = bucketPrompts(prompts, new Date(now));
  if (buckets.length > cap) {
    return uniformSample(buckets, cap);
  }
  if (buckets.length < cap) {
    return expandRecentBuckets(buckets, cap);
  }
  return buckets;
}
export { bucketKey, toBucket, bucketPrompts, uniformSample, expandBucket, expandRecentBuckets, budgetBucketPrompts, MAX_TICKS, oneDayMs };
