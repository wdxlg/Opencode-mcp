// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimelineLayout.ts



// src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimelineLayout.ts
var MIN_HOST_WIDTH = 320;

function spaceMarkCenters(marks, height, minGap) {
  const n2 = marks.length;
  if (n2 === 0) {
    return;
  }
  const lo = minGap / 2;
  const hi = height - minGap / 2;
  if (hi <= lo) {
    return;
  }
  if ((n2 - 1) * minGap > hi - lo) {
    const step = (hi - lo) / (n2 - 1);
    for (let i2 = 0; i2 < n2; i2++) {
      marks[i2].center = lo + i2 * step;
    }
    return;
  }
  let prev = lo - minGap;
  for (let i2 = 0; i2 < n2; i2++) {
    prev = marks[i2].center = Math.max(marks[i2].center, prev + minGap, lo);
  }
  let next = hi + minGap;
  for (let i2 = n2 - 1; i2 >= 0; i2--) {
    next = marks[i2].center = Math.min(marks[i2].center, next - minGap, hi);
  }
}
export { spaceMarkCenters, MIN_HOST_WIDTH };
