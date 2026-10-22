// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/utils/flexBoxLayout.ts



// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/utils/flexBoxLayout.ts
function distributeFlexBoxLayout(totalSize, parts) {
  const normalizedParts = {};
  for (const [key3, part] of Object.entries(parts)) {
    if (Array.isArray(part)) {
      normalizedParts[key3] = { min: 0, rules: part };
    } else {
      normalizedParts[key3] = {
        min: part.min ?? 0,
        rules: part.rules ?? [{ max: part.max, priority: part.priority, share: part.share }]
      };
    }
  }
  const result = {};
  let usedSize = 0;
  for (const [key3, part] of Object.entries(normalizedParts)) {
    result[key3] = part.min;
    usedSize += part.min;
  }
  if (usedSize > totalSize) {
    return null;
  }
  let remainingSize = totalSize - usedSize;
  while (remainingSize > 0) {
    const candidateRules = [];
    for (const [key3, part] of Object.entries(normalizedParts)) {
      for (let i2 = 0; i2 < part.rules.length; i2++) {
        const rule = part.rules[i2];
        const currentUsage = result[key3];
        const maxSize = rule.max ?? Infinity;
        if (currentUsage < maxSize) {
          candidateRules.push({
            partKey: key3,
            ruleIndex: i2,
            rule,
            priority: rule.priority ?? 0,
            share: rule.share ?? 1
          });
        }
      }
    }
    if (candidateRules.length === 0) {
      break;
    }
    const maxPriority2 = Math.max(...candidateRules.map((c) => c.priority));
    const highestPriorityCandidates = candidateRules.filter((c) => c.priority === maxPriority2);
    const totalShare = highestPriorityCandidates.reduce((sum2, c) => sum2 + c.share, 0);
    let distributedThisRound = 0;
    const distributions = [];
    for (const candidate of highestPriorityCandidates) {
      const rule = candidate.rule;
      const currentUsage = result[candidate.partKey];
      const maxSize = rule.max ?? Infinity;
      const availableForThisRule = maxSize - currentUsage;
      const idealShare = remainingSize * candidate.share / totalShare;
      const actualAmount = Math.min(idealShare, availableForThisRule);
      distributions.push({
        partKey: candidate.partKey,
        ruleIndex: candidate.ruleIndex,
        amount: actualAmount
      });
      distributedThisRound += actualAmount;
    }
    if (distributedThisRound === 0) {
      break;
    }
    for (const dist of distributions) {
      result[dist.partKey] += dist.amount;
    }
    remainingSize -= distributedThisRound;
    if (remainingSize < 1e-4) {
      break;
    }
  }
  return result;
}
export { distributeFlexBoxLayout };
