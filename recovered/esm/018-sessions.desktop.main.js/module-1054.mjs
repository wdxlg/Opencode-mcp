// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/console.ts



// src/vs/base/common/console.ts
function parse9(entry) {
  const args2 = [];
  let stack;
  try {
    const parsedArguments = JSON.parse(entry.arguments);
    const stackArgument = parsedArguments[parsedArguments.length - 1];
    if (stackArgument && stackArgument.__$stack) {
      parsedArguments.pop();
      stack = stackArgument.__$stack;
    }
    args2.push(...parsedArguments);
  } catch (error) {
    args2.push("Unable to log remote console arguments", entry.arguments);
  }
  return { args: args2, stack };
}

function findFirstFrame(stack) {
  if (!stack) {
    return stack;
  }
  const newlineIndex = stack.indexOf("\n");
  if (newlineIndex === -1) {
    return stack;
  }
  return stack.substring(0, newlineIndex);
}

function log2(entry, label3) {
  const { args: args2, stack } = parse9(entry);
  const isOneStringArg = typeof args2[0] === "string" && args2.length === 1;
  let topFrame = findFirstFrame(stack);
  if (topFrame) {
    topFrame = `(${topFrame.trim()})`;
  }
  let consoleArgs = [];
  if (typeof args2[0] === "string") {
    if (topFrame && isOneStringArg) {
      consoleArgs = [`%c[${label3}] %c${args2[0]} %c${topFrame}`, color("blue"), color(""), color("grey")];
    } else {
      consoleArgs = [`%c[${label3}] %c${args2[0]}`, color("blue"), color(""), ...args2.slice(1)];
    }
  } else {
    consoleArgs = [`%c[${label3}]%`, color("blue"), ...args2];
  }
  if (topFrame && !isOneStringArg) {
    consoleArgs.push(topFrame);
  }
  if (typeof console[entry.severity] !== "function") {
    throw new Error("Unknown console method");
  }
  console[entry.severity].apply(console, consoleArgs);
}

function color(color2) {
  return `color: ${color2}`;
}
export { parse9, findFirstFrame, log2, color };
