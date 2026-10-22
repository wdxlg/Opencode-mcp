// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/xterm/decorationStyles.ts
import { localize } from "./module-0001.mjs";
import { isNumber } from "./module-0010.mjs";
import { fromNow, getDurationString } from "./module-0120.mjs";
import { terminalDecorationError, terminalDecorationIncomplete, terminalDecorationSuccess } from "./module-2351.mjs";


// src/vs/workbench/contrib/terminal/browser/xterm/decorationStyles.ts
function getTerminalDecorationHoverContent(command4, hoverMessage, showCommandActions) {
  let hoverContent2 = showCommandActions ? `${localize(20124, null)}

---

` : "";
  if (!command4) {
    if (hoverMessage) {
      hoverContent2 = hoverMessage;
    } else {
      return "";
    }
  } else if (command4.markProperties || hoverMessage) {
    if (command4.markProperties?.hoverMessage || hoverMessage) {
      hoverContent2 = command4.markProperties?.hoverMessage || hoverMessage || "";
    } else {
      return "";
    }
  } else {
    if (isNumber(command4.duration)) {
      const durationText = getDurationString(command4.duration);
      if (command4.exitCode) {
        if (command4.exitCode === -1) {
          hoverContent2 += localize(20118, null, fromNow(command4.timestamp, true), durationText);
        } else {
          hoverContent2 += localize(20120, null, fromNow(command4.timestamp, true), durationText, command4.exitCode);
        }
      } else {
        hoverContent2 += localize(20123, null, fromNow(command4.timestamp, true), durationText);
      }
    } else {
      if (command4.exitCode) {
        if (command4.exitCode === -1) {
          hoverContent2 += localize(20117, null, fromNow(command4.timestamp, true));
        } else {
          hoverContent2 += localize(20119, null, fromNow(command4.timestamp, true), command4.exitCode);
        }
      } else {
        hoverContent2 += localize(20121, null);
      }
    }
  }
  return hoverContent2;
}

var unknownText = localize(20116, null);

var runningText = localize(20115, null);

function getTerminalCommandDecorationTooltip(command4, storedState) {
  if (command4) {
    return getTerminalDecorationHoverContent(command4);
  }
  if (!storedState) {
    return "";
  }
  const timestamp = storedState.timestamp;
  const exitCode = storedState.exitCode;
  const duration = storedState.duration;
  if (typeof timestamp !== "number" || timestamp === void 0) {
    return "";
  }
  let hoverContent2 = "";
  const fromNowText = fromNow(timestamp, true);
  if (typeof duration === "number") {
    const durationText = getDurationString(Math.max(duration, 0));
    if (exitCode) {
      if (exitCode === -1) {
        hoverContent2 += localize(20118, null, fromNowText, durationText);
      } else {
        hoverContent2 += localize(20120, null, fromNowText, durationText, exitCode);
      }
    } else {
      hoverContent2 += localize(20123, null, fromNowText, durationText);
    }
  } else {
    if (exitCode) {
      if (exitCode === -1) {
        hoverContent2 += localize(20117, null, fromNowText);
      } else {
        hoverContent2 += localize(20119, null, fromNowText, exitCode);
      }
    } else {
      hoverContent2 += localize(20122, null, fromNowText);
    }
  }
  return hoverContent2;
}

function getTerminalCommandDecorationState(command4, storedState, now = Date.now()) {
  let status2 = "unknown" /* Unknown */;
  const exitCode = command4?.exitCode ?? storedState?.exitCode;
  let exitCodeText = unknownText;
  const startTimestamp = command4?.timestamp ?? storedState?.timestamp;
  let startText = unknownText;
  let durationMs;
  let durationText = unknownText;
  if (typeof startTimestamp === "number") {
    startText = new Date(startTimestamp).toLocaleString();
  }
  if (command4) {
    if (command4.exitCode === void 0) {
      status2 = "running" /* Running */;
      exitCodeText = runningText;
      durationMs = startTimestamp !== void 0 ? Math.max(0, now - startTimestamp) : void 0;
    } else if (command4.exitCode !== 0) {
      status2 = "error" /* Error */;
      exitCodeText = String(command4.exitCode);
      durationMs = command4.duration ?? (startTimestamp !== void 0 ? Math.max(0, now - startTimestamp) : void 0);
    } else {
      status2 = "success" /* Success */;
      exitCodeText = String(command4.exitCode);
      durationMs = command4.duration ?? (startTimestamp !== void 0 ? Math.max(0, now - startTimestamp) : void 0);
    }
  } else if (storedState) {
    if (storedState.exitCode === void 0) {
      status2 = "running" /* Running */;
      exitCodeText = runningText;
      durationMs = startTimestamp !== void 0 ? Math.max(0, now - startTimestamp) : void 0;
    } else if (storedState.exitCode !== 0) {
      status2 = "error" /* Error */;
      exitCodeText = String(storedState.exitCode);
      durationMs = storedState.duration;
    } else {
      status2 = "success" /* Success */;
      exitCodeText = String(storedState.exitCode);
      durationMs = storedState.duration;
    }
  }
  if (typeof durationMs === "number") {
    durationText = getDurationString(Math.max(durationMs, 0));
  }
  const classNames2 = [];
  let icon2 = terminalDecorationIncomplete;
  switch (status2) {
    case "running" /* Running */:
    case "unknown" /* Unknown */:
      classNames2.push("default-color" /* DefaultColor */, "default" /* Default */);
      icon2 = terminalDecorationIncomplete;
      break;
    case "error" /* Error */:
      classNames2.push("error" /* ErrorColor */);
      icon2 = terminalDecorationError;
      break;
    case "success" /* Success */:
      classNames2.push("success");
      icon2 = terminalDecorationSuccess;
      break;
  }
  const hoverMessage = getTerminalCommandDecorationTooltip(command4, storedState);
  return {
    status: status2,
    icon: icon2,
    classNames: classNames2,
    exitCode,
    exitCodeText,
    startTimestamp,
    startText,
    duration: durationMs,
    durationText,
    hoverMessage
  };
}

function updateLayout(configurationService, element) {
  if (!element) {
    return;
  }
  const fontSize = configurationService.inspect("terminal.integrated.fontSize" /* FontSize */).value;
  const defaultFontSize = configurationService.inspect("terminal.integrated.fontSize" /* FontSize */).defaultValue;
  const lineHeight = configurationService.inspect("terminal.integrated.lineHeight" /* LineHeight */).value;
  if (isNumber(fontSize) && isNumber(defaultFontSize) && isNumber(lineHeight)) {
    const scalar = fontSize / defaultFontSize <= 1 ? fontSize / defaultFontSize : 1;
    element.style.width = `${scalar * 16 /* DefaultDimension */}px`;
    element.style.height = `${scalar * 16 /* DefaultDimension */ * lineHeight}px`;
    element.style.fontSize = `${scalar * 16 /* DefaultDimension */}px`;
    element.style.marginLeft = `${scalar * -17 /* MarginLeft */}px`;
  }
}
export { getTerminalDecorationHoverContent, getTerminalCommandDecorationTooltip, getTerminalCommandDecorationState, updateLayout, unknownText, runningText };
