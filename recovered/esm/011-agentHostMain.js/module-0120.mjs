// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/numbers.ts



// src/vs/base/common/numbers.ts
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatTokenCount(count) {
  if (count >= 1e6) {
    const value = count / 1e6;
    const floored = Math.floor(value * 10) / 10;
    return floored % 1 === 0 ? `${floored.toFixed(0)}M` : `${floored.toFixed(1)}M`;
  } else if (count > 9e5) {
    return "1M";
  } else if (count >= 1e3) {
    return `${Math.round(count / 1e3)}K`;
  }
  return count.toString();
}
export { clamp, formatTokenCount };
