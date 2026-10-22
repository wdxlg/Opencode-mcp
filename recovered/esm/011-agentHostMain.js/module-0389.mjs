// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexThreadList.ts



// src/vs/platform/agentHost/node/codex/codexThreadList.ts
var THREAD_LIST_PAGE_SIZE = 100;

var THREAD_LIST_MAX_PAGES = 50;

function buildThreadListPageRequest(cursor) {
  return {
    limit: THREAD_LIST_PAGE_SIZE,
    modelProviders: [],
    ...cursor !== void 0 ? { cursor } : {}
  };
}

async function collectThreadListPages(fetchPage, onTruncated) {
  const items = [];
  const seenCursors = /* @__PURE__ */ new Set();
  let cursor;
  for (let page = 0; page < THREAD_LIST_MAX_PAGES; page++) {
    const response = await fetchPage(buildThreadListPageRequest(cursor));
    items.push(...response.data);
    const nextCursor = response.nextCursor ?? void 0;
    if (nextCursor === void 0 || seenCursors.has(nextCursor)) {
      return items;
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }
  onTruncated?.(items.length);
  return items;
}
export { buildThreadListPageRequest, collectThreadListPages, THREAD_LIST_PAGE_SIZE, THREAD_LIST_MAX_PAGES };
