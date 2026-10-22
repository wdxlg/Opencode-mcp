// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostManagedRules.ts



// src/vs/platform/agentHost/common/agentHostManagedRules.ts
function buildManagedFamilyRule(family) {
  return family;
}

function buildManagedRule(family, argument) {
  if (!argument.trim() || !isValidRuleArgument(argument)) {
    return void 0;
  }
  switch (family) {
    case "Shell" /* Shell */:
      return isValidShellArgument(argument) ? `${family}(${argument})` : void 0;
    case "Read" /* Read */:
    case "Write" /* Write */:
      return isValidPathArgument(argument) ? `${family}(${normalizePathSeparators(argument)})` : void 0;
    case "Domain" /* Domain */:
      return isValidDomainArgument(argument) ? `${family}(${argument})` : void 0;
  }
}

function isValidRuleArgument(argument) {
  return !argument.includes(")") && !argument.includes("\n");
}

function isValidShellArgument(argument) {
  if (argument === "*") {
    return true;
  }
  const prefix = argument.endsWith(" *") ? argument.slice(0, -2).trimEnd() : argument;
  return prefix.length > 0;
}

function isValidPathArgument(argument) {
  if (argument.startsWith("!")) {
    return false;
  }
  let depth = 0;
  for (const char of argument) {
    if (char === "{") {
      depth++;
    } else if (char === "}") {
      if (--depth < 0) {
        return false;
      }
    }
  }
  return depth === 0;
}

function normalizePathSeparators(argument) {
  return argument.replace(/\\/g, "/");
}

function isValidDomainArgument(argument) {
  if (argument.includes("$(") || argument.includes("${") || argument.includes("`")) {
    return false;
  }
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(argument);
  if (!hasScheme && argument.includes("//")) {
    return false;
  }
  if (argument === "*") {
    return false;
  }
  try {
    const url2 = new URL(hasScheme ? argument : `https://${argument}`);
    return url2.hostname.length > 0;
  } catch {
    return false;
  }
}
export { buildManagedFamilyRule, buildManagedRule, isValidRuleArgument, isValidShellArgument, isValidPathArgument, normalizePathSeparators, isValidDomainArgument };
