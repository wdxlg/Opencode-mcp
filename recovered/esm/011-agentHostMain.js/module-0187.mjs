// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/streamingToolCallDisplay.ts
import { URI } from "./module-0023.mjs";
import { escapeMarkdownLinkLabel } from "./module-0115.mjs";
import { basename2 } from "./module-0025.mjs";
import { splitLines } from "./module-0021.mjs";
import { localize } from "./module-0012.mjs";


// src/vs/platform/agentHost/common/streamingToolCallDisplay.ts
var identityPathResolver = (path) => path;

var STREAMING_TOOL_DISPLAY_INTERVAL_MS = 100;

function streamingToolDisplayText(message) {
  return typeof message === "string" ? message : message.markdown;
}

function formatGenericToolInput(input, rawFallback) {
  if (!input) {
    return rawFallback;
  }
  try {
    return JSON.stringify(input, null, 2);
  } catch {
    return rawFallback;
  }
}

function markdown(value) {
  return { markdown: value };
}

function formatPath(path, resolvePath2) {
  if (typeof path !== "string" || !path) {
    return void 0;
  }
  const uri = URI.file(resolvePath2(path));
  return `[${escapeMarkdownLinkLabel(basename2(uri))}](${uri})`;
}

function streamingToolTextLineCount(value) {
  return typeof value === "string" ? splitLines(value).length : void 0;
}

function getStreamingEditMessage(path, lineCount, resolvePath2 = identityPathResolver) {
  const file = formatPath(path, resolvePath2);
  if (lineCount !== void 0) {
    if (file) {
      return lineCount === 1 ? markdown(localize(2171, null, file)) : markdown(localize(2169, null, lineCount, file));
    }
    return lineCount === 1 ? localize(2170, null) : localize(2168, null, lineCount);
  }
  return file ? markdown(localize(2167, null, file)) : localize(2166, null);
}

function getStreamingReplaceMessage(path, oldLineCount, newLineCount, resolvePath2 = identityPathResolver) {
  const file = formatPath(path, resolvePath2);
  if (oldLineCount !== void 0 && newLineCount !== void 0) {
    if (file) {
      if (oldLineCount === 1 && newLineCount === 1) {
        return markdown(localize(2195, null, file));
      }
      if (oldLineCount === 1) {
        return markdown(localize(2193, null, newLineCount, file));
      }
      if (newLineCount === 1) {
        return markdown(localize(2189, null, oldLineCount, file));
      }
      return markdown(localize(2187, null, oldLineCount, newLineCount, file));
    }
    if (oldLineCount === 1 && newLineCount === 1) {
      return localize(2194, null);
    }
    if (oldLineCount === 1) {
      return localize(2192, null, newLineCount);
    }
    if (newLineCount === 1) {
      return localize(2188, null, oldLineCount);
    }
    return localize(2186, null, oldLineCount, newLineCount);
  }
  if (oldLineCount !== void 0) {
    if (file) {
      return oldLineCount === 1 ? markdown(localize(2191, null, file)) : markdown(localize(2185, null, oldLineCount, file));
    }
    return oldLineCount === 1 ? localize(2190, null) : localize(2184, null, oldLineCount);
  }
  return getStreamingEditMessage(path, void 0, resolvePath2);
}

function getStreamingCreateMessage(path, lineCount, resolvePath2 = identityPathResolver) {
  const file = formatPath(path, resolvePath2);
  if (lineCount !== void 0) {
    if (file) {
      return lineCount === 1 ? markdown(localize(2165, null, file)) : markdown(localize(2163, null, file, lineCount));
    }
    return lineCount === 1 ? localize(2164, null) : localize(2162, null, lineCount);
  }
  return file ? markdown(localize(2161, null, file)) : localize(2160, null);
}

function getStreamingInsertMessage(path, lineCount, resolvePath2 = identityPathResolver) {
  const file = formatPath(path, resolvePath2);
  if (lineCount !== void 0) {
    if (file) {
      return lineCount === 1 ? markdown(localize(2177, null, file)) : markdown(localize(2175, null, lineCount, file));
    }
    return lineCount === 1 ? localize(2176, null) : localize(2174, null, lineCount);
  }
  return file ? markdown(localize(2173, null, file)) : localize(2172, null);
}

function getStreamingPatchMessage(paths, lineCount, resolvePath2 = identityPathResolver) {
  const fileList = paths.map((path) => formatPath(path, resolvePath2)).filter((path) => path !== void 0).join(", ") || void 0;
  if (lineCount !== void 0) {
    if (fileList) {
      return lineCount === 1 ? markdown(localize(2183, null, fileList)) : markdown(localize(2181, null, lineCount, fileList));
    }
    return lineCount === 1 ? localize(2182, null) : localize(2180, null, lineCount);
  }
  return fileList ? markdown(localize(2179, null, fileList)) : localize(2178, null);
}
export { streamingToolDisplayText, formatGenericToolInput, markdown, formatPath, streamingToolTextLineCount, getStreamingEditMessage, getStreamingReplaceMessage, getStreamingCreateMessage, getStreamingInsertMessage, getStreamingPatchMessage, identityPathResolver, STREAMING_TOOL_DISPLAY_INTERVAL_MS };
