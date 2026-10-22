// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/sandbox/common/terminalSandboxCommandRules.ts



// src/vs/platform/sandbox/common/terminalSandboxCommandRules.ts
function matchesTerminalSandboxCommandRule(command4, rule, context2) {
  if (!rule.keywords.includes(command4.keyword.toLowerCase())) {
    return false;
  }
  if (rule.condition && (!context2 || !rule.condition(context2))) {
    return false;
  }
  if (rule.subcommands) {
    const subcommand = getCommandSubcommand(command4.args, rule.optionsWithValue);
    if (subcommand === void 0 || !rule.subcommands.includes(subcommand)) {
      return false;
    }
  }
  return rule.when?.(command4) ?? true;
}

function getCommandSubcommand(args2, optionsWithValue) {
  for (let i2 = 0; i2 < args2.length; i2++) {
    const arg = args2[i2];
    if (arg === "--") {
      return void 0;
    }
    if (arg.startsWith("-")) {
      const option2 = arg.includes("=") ? arg.substring(0, arg.indexOf("=")) : arg;
      if (!arg.includes("=") && optionsWithValue?.has(option2)) {
        i2++;
      }
      continue;
    }
    return arg.toLowerCase();
  }
  return void 0;
}
export { matchesTerminalSandboxCommandRule, getCommandSubcommand };
