// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugUtils.ts
import { equalsIgnoreCase } from "./module-0030.mjs";
import { coalesce } from "./module-0007.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Range2 } from "./module-0106.mjs";
import { URI } from "./module-0032.mjs";
import { isAbsolute } from "./module-0026.mjs";
import { Schemas } from "./module-0033.mjs";
import { deepClone } from "./module-0098.mjs";
import { OS } from "./module-0014.mjs";


// src/vs/workbench/contrib/debug/common/debugUtils.ts
var _formatPIIRegexp = /{([^}]+)}/g;

function formatPII(value2, excludePII, args2) {
  return value2.replace(_formatPIIRegexp, function(match2, group2) {
    if (excludePII && group2.length > 0 && group2[0] !== "_") {
      return match2;
    }
    return args2 && args2.hasOwnProperty(group2) ? args2[group2] : match2;
  });
}

function filterExceptionsFromTelemetry(data) {
  const output = {};
  for (const key3 of Object.keys(data)) {
    if (!key3.startsWith("!")) {
      output[key3] = data[key3];
    }
  }
  return output;
}

function isSessionAttach(session) {
  return session.configuration.request === "attach" && !getExtensionHostDebugSession(session) && (!session.parentSession || isSessionAttach(session.parentSession));
}

function getExtensionHostDebugSession(session) {
  let type = session.configuration.type;
  if (!type) {
    return;
  }
  if (type === "vslsShare") {
    type = session.configuration.adapterProxy?.configuration?.type || type;
  }
  if (equalsIgnoreCase(type, "extensionhost") || equalsIgnoreCase(type, "pwa-extensionhost")) {
    return session;
  }
  return session.parentSession ? getExtensionHostDebugSession(session.parentSession) : void 0;
}

function isDebuggerMainContribution(dbg) {
  return dbg.type && (dbg.label || dbg.program || dbg.runtime);
}

function getExactExpressionStartAndEnd(lineContent, looseStart, looseEnd) {
  let matchingExpression = void 0;
  let startOffset = 0;
  const expression = /([^()\[\]{}<>\s+\-/%~#^;=|,`!]|\->)+/g;
  let result = null;
  while (result = expression.exec(lineContent)) {
    const start = result.index + 1;
    const end = start + result[0].length;
    if (start <= looseStart && end >= looseEnd) {
      matchingExpression = result[0];
      startOffset = start;
      break;
    }
  }
  if (matchingExpression) {
    const spreadMatch = matchingExpression.match(/^\.\.\.(.+)/);
    if (spreadMatch) {
      matchingExpression = spreadMatch[1];
      startOffset += 3;
    }
  }
  if (matchingExpression) {
    const subExpression = /(\w|\p{L})+/gu;
    let subExpressionResult = null;
    while (subExpressionResult = subExpression.exec(matchingExpression)) {
      const subEnd = subExpressionResult.index + 1 + startOffset + subExpressionResult[0].length;
      if (subEnd >= looseEnd) {
        break;
      }
    }
    if (subExpressionResult) {
      matchingExpression = matchingExpression.substring(0, subExpression.lastIndex);
    }
  }
  return matchingExpression ? { start: startOffset, end: startOffset + matchingExpression.length - 1 } : { start: 0, end: 0 };
}

async function getEvaluatableExpressionAtPosition(languageFeaturesService, model, position2, token) {
  if (languageFeaturesService.evaluatableExpressionProvider.has(model)) {
    const supports = languageFeaturesService.evaluatableExpressionProvider.ordered(model);
    const results = coalesce(await Promise.all(supports.map(async (support) => {
      try {
        return await support.provideEvaluatableExpression(model, position2, token ?? CancellationToken.None);
      } catch (err) {
        return void 0;
      }
    })));
    if (results.length > 0) {
      let matchingExpression = results[0].expression;
      const range2 = results[0].range;
      if (!matchingExpression) {
        const lineContent = model.getLineContent(position2.lineNumber);
        matchingExpression = lineContent.substring(range2.startColumn - 1, range2.endColumn - 1);
      }
      return { range: range2, matchingExpression };
    }
  } else {
    const lineContent = model.getLineContent(position2.lineNumber);
    const { start, end } = getExactExpressionStartAndEnd(lineContent, position2.column, position2.column);
    const matchingExpression = lineContent.substring(start - 1, end);
    return {
      matchingExpression,
      range: new Range2(position2.lineNumber, start, position2.lineNumber, start + matchingExpression.length)
    };
  }
  return null;
}

var _schemePattern2 = /^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/;

function isUriString(s) {
  return !!(s && s.match(_schemePattern2));
}

function stringToUri(source) {
  if (typeof source.path === "string") {
    if (typeof source.sourceReference === "number" && source.sourceReference > 0) {
    } else {
      if (isUriString(source.path)) {
        return URI.parse(source.path);
      } else {
        if (isAbsolute(source.path)) {
          return URI.file(source.path);
        } else {
        }
      }
    }
  }
  return source.path;
}

function uriToString(source) {
  if (typeof source.path === "object") {
    const u = URI.revive(source.path);
    if (u) {
      if (u.scheme === Schemas.file) {
        return u.fsPath;
      } else {
        return u.toString();
      }
    }
  }
  return source.path;
}

function convertToDAPaths(message, toUri) {
  const fixPath = toUri ? stringToUri : uriToString;
  const msg = deepClone(message);
  convertPaths(msg, (toDA, source) => {
    if (toDA && source) {
      source.path = fixPath(source);
    }
  });
  return msg;
}

function convertToVSCPaths(message, toUri) {
  const fixPath = toUri ? stringToUri : uriToString;
  const msg = deepClone(message);
  convertPaths(msg, (toDA, source) => {
    if (!toDA && source) {
      source.path = fixPath(source);
    }
  });
  return msg;
}

function convertPaths(msg, fixSourcePath) {
  switch (msg.type) {
    case "event": {
      const event = msg;
      switch (event.event) {
        case "output":
          fixSourcePath(false, event.body.source);
          break;
        case "loadedSource":
          fixSourcePath(false, event.body.source);
          break;
        case "breakpoint":
          fixSourcePath(false, event.body.breakpoint.source);
          break;
        default:
          break;
      }
      break;
    }
    case "request": {
      const request2 = msg;
      switch (request2.command) {
        case "setBreakpoints":
          fixSourcePath(true, request2.arguments.source);
          break;
        case "breakpointLocations":
          fixSourcePath(true, request2.arguments.source);
          break;
        case "source":
          fixSourcePath(true, request2.arguments.source);
          break;
        case "gotoTargets":
          fixSourcePath(true, request2.arguments.source);
          break;
        case "launchVSCode":
          request2.arguments.args.forEach((arg) => fixSourcePath(false, arg));
          break;
        default:
          break;
      }
      break;
    }
    case "response": {
      const response = msg;
      if (response.success && response.body) {
        switch (response.command) {
          case "stackTrace":
            response.body.stackFrames.forEach((frame) => fixSourcePath(false, frame.source));
            break;
          case "loadedSources":
            response.body.sources.forEach((source) => fixSourcePath(false, source));
            break;
          case "scopes":
            response.body.scopes.forEach((scope) => fixSourcePath(false, scope.source));
            break;
          case "setFunctionBreakpoints":
            response.body.breakpoints.forEach((bp) => fixSourcePath(false, bp.source));
            break;
          case "setBreakpoints":
            response.body.breakpoints.forEach((bp) => fixSourcePath(false, bp.source));
            break;
          case "disassemble":
            {
              const di = response;
              di.body?.instructions.forEach((di2) => fixSourcePath(false, di2.location));
            }
            break;
          case "locations":
            fixSourcePath(false, response.body?.source);
            break;
          default:
            break;
        }
      }
      break;
    }
  }
}

function getVisibleAndSorted(array3) {
  return array3.filter((config) => !config.presentation?.hidden).sort((first2, second) => {
    if (!first2.presentation) {
      if (!second.presentation) {
        return 0;
      }
      return 1;
    }
    if (!second.presentation) {
      return -1;
    }
    if (!first2.presentation.group) {
      if (!second.presentation.group) {
        return compareOrders(first2.presentation.order, second.presentation.order);
      }
      return 1;
    }
    if (!second.presentation.group) {
      return -1;
    }
    if (first2.presentation.group !== second.presentation.group) {
      return first2.presentation.group.localeCompare(second.presentation.group);
    }
    return compareOrders(first2.presentation.order, second.presentation.order);
  });
}

function compareOrders(first2, second) {
  if (typeof first2 !== "number") {
    if (typeof second !== "number") {
      return 0;
    }
    return 1;
  }
  if (typeof second !== "number") {
    return -1;
  }
  return first2 - second;
}

async function saveAllBeforeDebugStart(configurationService, editorService) {
  const saveBeforeStartConfig = configurationService.getValue("debug.saveBeforeStart", { overrideIdentifier: editorService.activeTextEditorLanguageId });
  if (saveBeforeStartConfig !== "none") {
    await editorService.saveAll();
    if (saveBeforeStartConfig === "allEditorsInActiveGroup") {
      const activeEditor = editorService.activeEditorPane;
      if (activeEditor && activeEditor.input.resource?.scheme === Schemas.untitled) {
        await editorService.save({ editor: activeEditor.input, groupId: activeEditor.group.id });
      }
    }
  }
  await configurationService.reloadConfiguration();
}

var sourcesEqual = (a, b) => !a || !b ? a === b : a.name === b.name && a.path === b.path && a.sourceReference === b.sourceReference;

function resolveChildSession(session, allSessions) {
  const childSessions = allSessions.filter((s) => s.parentSession === session);
  if (childSessions.length > 0) {
    const stoppedChildSession = childSessions.find((s) => s.state === 2 /* Stopped */);
    if (stoppedChildSession) {
      return stoppedChildSession;
    } else {
      return childSessions[0];
    }
  }
  return session;
}

function getPlatformSpecificConfig(config, os) {
  switch (os) {
    case 1 /* Windows */:
      return config.windows;
    case 2 /* Macintosh */:
      return config.osx;
    case 3 /* Linux */:
      return config.linux;
  }
}

function getEffectiveConfigForPlatform(config, os = OS) {
  const platformConfig = getPlatformSpecificConfig(config, os);
  if (!platformConfig) {
    return config;
  }
  return {
    ...config,
    ...platformConfig,
    presentation: platformConfig.presentation ? { ...config.presentation, ...platformConfig.presentation } : config.presentation
  };
}
export { formatPII, filterExceptionsFromTelemetry, isSessionAttach, getExtensionHostDebugSession, isDebuggerMainContribution, getExactExpressionStartAndEnd, getEvaluatableExpressionAtPosition, isUriString, stringToUri, uriToString, convertToDAPaths, convertToVSCPaths, convertPaths, getVisibleAndSorted, compareOrders, saveAllBeforeDebugStart, resolveChildSession, getPlatformSpecificConfig, getEffectiveConfigForPlatform, _formatPIIRegexp, _schemePattern2, sourcesEqual };
