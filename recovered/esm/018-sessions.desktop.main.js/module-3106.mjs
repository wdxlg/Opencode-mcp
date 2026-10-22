// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/executeStrategy/executeStrategy.ts
import { DisposableStore } from "./module-0012.mjs";
import { DeferredPromise, RunOnceScheduler } from "./module-0036.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/executeStrategy/executeStrategy.ts
async function waitForIdle(onData, idleDurationMs) {
  const store = new DisposableStore();
  const deferred = new DeferredPromise();
  const scheduler = store.add(new RunOnceScheduler(() => deferred.complete(), idleDurationMs));
  store.add(onData(() => scheduler.schedule()));
  scheduler.schedule();
  return deferred.p.finally(() => store.dispose());
}

function detectsCommonPromptPattern(cursorLine) {
  if (cursorLine.trim().length === 0) {
    return { detected: false, reason: "Content is empty or contains only whitespace" };
  }
  if (/PS\s+[A-Z]:\\.*>\s*$/.test(cursorLine)) {
    return { detected: true, reason: `PowerShell prompt pattern detected: "${cursorLine}"` };
  }
  if (/^[A-Z]:\\.*>\s*$/.test(cursorLine)) {
    return { detected: true, reason: `Command Prompt pattern detected: "${cursorLine}"` };
  }
  if (/\$\s*$/.test(cursorLine)) {
    return { detected: true, reason: `Bash-style prompt pattern detected: "${cursorLine}"` };
  }
  if (/#\s*$/.test(cursorLine)) {
    return { detected: true, reason: `Root prompt pattern detected: "${cursorLine}"` };
  }
  if (/^>>>\s*$/.test(cursorLine)) {
    return { detected: true, reason: `Python REPL prompt pattern detected: "${cursorLine}"` };
  }
  if (/\u276f\s*$/.test(cursorLine)) {
    return { detected: true, reason: `Starship prompt pattern detected: "${cursorLine}"` };
  }
  if (/[>%]\s*$/.test(cursorLine)) {
    return { detected: true, reason: `Generic prompt pattern detected: "${cursorLine}"` };
  }
  return { detected: false, reason: `No common prompt pattern found in last line: "${cursorLine}"` };
}

async function waitForIdleWithPromptHeuristics(onData, instance2, idlePollIntervalMs, extendedTimeoutMs) {
  await waitForIdle(onData, idlePollIntervalMs);
  const xterm = await instance2.xtermReadyPromise;
  if (!xterm) {
    return { detected: false, reason: `Xterm not available, using ${idlePollIntervalMs}ms timeout` };
  }
  const startTime = Date.now();
  while (Date.now() - startTime < extendedTimeoutMs) {
    try {
      let content = "";
      const buffer = xterm.raw.buffer.active;
      const line = buffer.getLine(buffer.baseY + buffer.cursorY);
      if (line) {
        content = line.translateToString(true);
      }
      const promptResult = detectsCommonPromptPattern(content);
      if (promptResult.detected) {
        return promptResult;
      }
    } catch (error) {
    }
    await waitForIdle(onData, Math.min(idlePollIntervalMs, extendedTimeoutMs - (Date.now() - startTime)));
  }
  try {
    let content = "";
    const buffer = xterm.raw.buffer.active;
    const line = buffer.getLine(buffer.baseY + buffer.cursorY);
    if (line) {
      content = line.translateToString(true) + "\n";
    }
    return { detected: false, reason: `Extended timeout reached without prompt detection. Last line: "${content.trim()}"` };
  } catch (error) {
    return { detected: false, reason: `Extended timeout reached. Error reading terminal content: ${error}` };
  }
}

async function trackIdleOnPrompt(instance2, idleDurationMs, store, promptFallbackMs, logService, options3) {
  const idleOnPrompt = new DeferredPromise();
  const onData = instance2.onData;
  const log4 = logService ? (msg) => logService.info(`trackIdleOnPrompt: ${msg}`) : void 0;
  let TerminalState2;
  ((TerminalState3) => {
    TerminalState3[TerminalState3["Initial"] = 0] = "Initial";
    TerminalState3[TerminalState3["Prompt"] = 1] = "Prompt";
    TerminalState3[TerminalState3["Executing"] = 2] = "Executing";
    TerminalState3[TerminalState3["PromptAfterExecuting"] = 3] = "PromptAfterExecuting";
  })(TerminalState2 || (TerminalState2 = {}));
  const stateNames = {
    [0 /* Initial */]: "Initial",
    [1 /* Prompt */]: "Prompt",
    [2 /* Executing */]: "Executing",
    [3 /* PromptAfterExecuting */]: "PromptAfterExecuting"
  };
  let state = 0 /* Initial */;
  let dataEventCount = 0;
  function setState(newState, reason) {
    if (state !== newState) {
      log4?.(`State ${stateNames[state]} \u2192 ${stateNames[newState]} (${reason})`);
      state = newState;
    }
  }
  const scheduler = store.add(new RunOnceScheduler(() => {
    log4?.(`Idle scheduler fired, completing (dataEvents=${dataEventCount})`);
    idleOnPrompt.complete();
  }, idleDurationMs));
  const promptFallbackScheduler = store.add(new RunOnceScheduler(() => {
    if (state === 2 /* Executing */ || state === 3 /* PromptAfterExecuting */) {
      promptFallbackScheduler.cancel();
      return;
    }
    log4?.(`Prompt fallback fired (dataEvents=${dataEventCount})`);
    setState(3 /* PromptAfterExecuting */, "promptFallback");
    scheduler.schedule();
  }, promptFallbackMs ?? 1e3));
  const disableFallbacks = options3?.disableFallbacks ?? false;
  const initialFallbackScheduler = store.add(new RunOnceScheduler(() => {
    if (state === 2 /* Executing */ || state === 3 /* PromptAfterExecuting */) {
      log4?.(`Initial fallback fired but state is ${stateNames[state]}, skipping`);
      return;
    }
    log4?.(`Initial fallback fired, no data events received`);
    setState(3 /* PromptAfterExecuting */, "initialFallback");
    scheduler.schedule();
  }, 1e4));
  if (!disableFallbacks) {
    initialFallbackScheduler.schedule();
  }
  const executingFallbackScheduler = store.add(new RunOnceScheduler(() => {
    if (state === 2 /* Executing */) {
      log4?.(`Executing fallback fired after 30s data-idle (dataEvents=${dataEventCount})`);
      setState(3 /* PromptAfterExecuting */, "executingFallback");
      scheduler.schedule();
    }
  }, 3e4));
  const hardCapScheduler = store.add(new RunOnceScheduler(() => {
    if (state === 0 /* Initial */ || state === 1 /* Prompt */) {
      log4?.(`Hard cap fired after 5min in state ${stateNames[state]} (dataEvents=${dataEventCount})`);
      setState(3 /* PromptAfterExecuting */, "hardCap");
      scheduler.schedule();
    }
  }, 6e4));
  if (!disableFallbacks) {
    hardCapScheduler.schedule();
  }
  store.add(onData((e4) => {
    dataEventCount++;
    initialFallbackScheduler.cancel();
    const matches2 = e4.matchAll(/(?:\x1b\]|\x9d)[16]33;(?<type>[ACD])(?:;.*)?(?:\x1b\\|\x07|\x9c)/g);
    for (const match2 of matches2) {
      if (match2.groups?.type === "A") {
        if (state === 0 /* Initial */) {
          setState(1 /* Prompt */, "sequence A");
        } else if (state === 2 /* Executing */) {
          setState(3 /* PromptAfterExecuting */, "sequence A after executing");
          executingFallbackScheduler.cancel();
        }
      } else if (match2.groups?.type === "C" || match2.groups?.type === "D") {
        setState(2 /* Executing */, `sequence ${match2.groups?.type}`);
        if (!disableFallbacks) {
          executingFallbackScheduler.schedule();
        }
      }
    }
    if (state === 3 /* PromptAfterExecuting */) {
      promptFallbackScheduler.cancel();
      executingFallbackScheduler.cancel();
      scheduler.schedule();
    } else {
      scheduler.cancel();
      if (state === 0 /* Initial */ || state === 1 /* Prompt */) {
        if (!disableFallbacks) {
          promptFallbackScheduler.schedule();
        }
      } else {
        promptFallbackScheduler.cancel();
        if (!disableFallbacks) {
          executingFallbackScheduler.schedule();
        }
      }
    }
  }));
  return idleOnPrompt.p;
}
export { waitForIdle, detectsCommonPromptPattern, waitForIdleWithPromptHeuristics, trackIdleOnPrompt };
