// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugUtils.ts
import { URI } from "./module-0025.mjs";
import { isAbsolute } from "./module-0019.mjs";
import { Schemas } from "./module-0026.mjs";
import { deepClone } from "./module-0042.mjs";


// src/vs/workbench/contrib/debug/common/debugUtils.ts
function isDebuggerMainContribution(dbg) {
  return dbg.type && (dbg.label || dbg.program || dbg.runtime);
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
      const request = msg;
      switch (request.command) {
        case "setBreakpoints":
          fixSourcePath(true, request.arguments.source);
          break;
        case "breakpointLocations":
          fixSourcePath(true, request.arguments.source);
          break;
        case "source":
          fixSourcePath(true, request.arguments.source);
          break;
        case "gotoTargets":
          fixSourcePath(true, request.arguments.source);
          break;
        case "launchVSCode":
          request.arguments.args.forEach((arg) => fixSourcePath(false, arg));
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
export { isDebuggerMainContribution, isUriString, stringToUri, uriToString, convertToDAPaths, convertToVSCPaths, convertPaths, _schemePattern2 };
