// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/taskCommand.ts
import { CommandString2 } from "./module-3258.mjs";


// src/vs/sessions/contrib/chat/browser/taskCommand.ts
function osToTaskTargetOS(os) {
  switch (os) {
    case 1 /* Windows */:
      return "windows";
    case 2 /* Macintosh */:
      return "osx";
    case 3 /* Linux */:
    default:
      return "linux";
  }
}

function expandVariables(value2, ctx) {
  return ctx.resolveVariables ? ctx.resolveVariables(value2) : value2;
}

var POSIX_NEEDS_QUOTING = /[^A-Za-z0-9_\-.,:/=@%+]/;

function posixStrong(value2) {
  return `'${value2.replace(/'/g, `'\\''`)}'`;
}

function posixWeak(value2) {
  return `"${value2.replace(/(["\\$`])/g, "\\$1")}"`;
}

function posixEscape(value2) {
  return value2.replace(/([\\\s"'`$&|;<>(){}[\]*?#~!])/g, "\\$1");
}

async function renderArg(arg, ctx) {
  if (typeof arg === "string") {
    const value3 = await expandVariables(arg, ctx);
    return POSIX_NEEDS_QUOTING.test(value3) ? posixStrong(value3) : value3;
  }
  if (Array.isArray(arg)) {
    return (await Promise.all(arg.map((a) => renderArg(a, ctx)))).join(" ");
  }
  const value2 = await expandVariables(CommandString2.value(arg), ctx);
  switch (arg.quoting) {
    case "strong":
      return posixStrong(value2);
    case "weak":
      return posixWeak(value2);
    case "escape":
      return posixEscape(value2);
    default:
      return POSIX_NEEDS_QUOTING.test(value2) ? posixStrong(value2) : value2;
  }
}

async function resolveOwnCommand(task, ctx) {
  const override = ctx.targetOS ? task[ctx.targetOS] : void 0;
  const command4 = override?.command ?? task.command;
  const args2 = override?.args ?? task.args;
  if (command4) {
    const parts = [await expandVariables(command4, ctx)];
    if (args2) {
      for (const arg of args2) {
        parts.push(await renderArg(arg, ctx));
      }
    }
    return parts.join(" ");
  }
  if (task.script && (!task.type || task.type === "npm")) {
    return `npm run ${task.script}`;
  }
  return void 0;
}

async function resolveDependencies(task, ctx, stack) {
  if (!task.dependsOn || !ctx.lookup) {
    return void 0;
  }
  const depLabels = typeof task.dependsOn === "string" ? [task.dependsOn] : task.dependsOn;
  const resolved = [];
  for (const label3 of depLabels) {
    const dep = ctx.lookup(label3);
    if (!dep) {
      continue;
    }
    const cmd = await resolveInternal(dep, ctx, stack);
    if (cmd) {
      resolved.push(cmd);
    }
  }
  if (resolved.length === 0) {
    return void 0;
  }
  if (resolved.length === 1) {
    return resolved[0];
  }
  return task.dependsOrder === "parallel" ? `${resolved.map((c) => `( ${c} )`).join(" & ")} & wait` : resolved.join(" && ");
}

async function resolveInternal(task, ctx, stack) {
  if (stack.has(task.label)) {
    return void 0;
  }
  stack.add(task.label);
  try {
    const own = await resolveOwnCommand(task, ctx);
    const deps = await resolveDependencies(task, ctx, stack);
    if (own && deps) {
      return `${deps} && ${own}`;
    }
    return own ?? deps;
  } finally {
    stack.delete(task.label);
  }
}

function resolveTaskCommand(task, ctx) {
  return resolveInternal(task, ctx ?? {}, /* @__PURE__ */ new Set());
}
export { osToTaskTargetOS, expandVariables, posixStrong, posixWeak, posixEscape, renderArg, resolveOwnCommand, resolveDependencies, resolveInternal, resolveTaskCommand, POSIX_NEEDS_QUOTING };
