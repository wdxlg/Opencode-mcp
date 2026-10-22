// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/terminalProfiles.ts
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { isObject, isString } from "./module-0010.mjs";
import { URI, isUriComponents } from "./module-0032.mjs";


// src/vs/platform/terminal/common/terminalProfiles.ts
function createProfileSchemaEnums(detectedProfiles, extensionProfiles) {
  const result = [{
    name: null,
    description: localize(3298, null)
  }];
  result.push(...detectedProfiles.map((e) => {
    return {
      name: e.profileName,
      description: createProfileDescription(e)
    };
  }));
  if (extensionProfiles) {
    result.push(...extensionProfiles.map((extensionProfile) => {
      return {
        name: extensionProfile.title,
        description: createExtensionProfileDescription(extensionProfile)
      };
    }));
  }
  return {
    values: result.map((e) => e.name),
    markdownDescriptions: result.map((e) => e.description)
  };
}

function createProfileDescription(profile) {
  let description = `$(${ThemeIcon.isThemeIcon(profile.icon) ? profile.icon.id : profile.icon ? profile.icon : Codicon.terminal.id}) ${profile.profileName}
- path: ${profile.path}`;
  if (profile.args) {
    if (isString(profile.args)) {
      description += `
- args: "${profile.args}"`;
    } else {
      description += `
- args: [${profile.args.length === 0 ? "" : `'${profile.args.join(`','`)}'`}]`;
    }
  }
  if (profile.overrideName !== void 0) {
    description += `
- overrideName: ${profile.overrideName}`;
  }
  if (profile.color) {
    description += `
- color: ${profile.color}`;
  }
  if (profile.env) {
    description += `
- env: ${JSON.stringify(profile.env)}`;
  }
  return description;
}

function createExtensionProfileDescription(profile) {
  const description = `$(${ThemeIcon.isThemeIcon(profile.icon) ? profile.icon.id : profile.icon ? profile.icon : Codicon.terminal.id}) ${profile.title}
- extensionIdentifier: ${profile.extensionIdentifier}`;
  return description;
}

function terminalProfileArgsMatch(args1, args2) {
  if (!args1 && !args2) {
    return true;
  } else if (isString(args1) && isString(args2)) {
    return args1 === args2;
  } else if (Array.isArray(args1) && Array.isArray(args2)) {
    if (args1.length !== args2.length) {
      return false;
    }
    for (let i2 = 0; i2 < args1.length; i2++) {
      if (args1[i2] !== args2[i2]) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function terminalIconsEqual(a, b) {
  if (!a && !b) {
    return true;
  } else if (!a || !b) {
    return false;
  }
  if (ThemeIcon.isThemeIcon(a) && ThemeIcon.isThemeIcon(b)) {
    return a.id === b.id && a.color === b.color;
  }
  if (isObject(a) && !URI.isUri(a) && !ThemeIcon.isThemeIcon(a) && isObject(b) && !URI.isUri(b) && !ThemeIcon.isThemeIcon(b)) {
    const castedA = a;
    const castedB = b;
    if ((URI.isUri(castedA.light) || isUriComponents(castedA.light)) && (URI.isUri(castedA.dark) || isUriComponents(castedA.dark)) && (URI.isUri(castedB.light) || isUriComponents(castedB.light)) && (URI.isUri(castedB.dark) || isUriComponents(castedB.dark))) {
      return castedA.light.path === castedB.light.path && castedA.dark.path === castedB.dark.path;
    }
  }
  if (URI.isUri(a) && URI.isUri(b) || (isUriComponents(a) || isUriComponents(b))) {
    const castedA = a;
    const castedB = b;
    return castedA.path === castedB.path && castedA.scheme === castedB.scheme;
  }
  return false;
}
export { createProfileSchemaEnums, createProfileDescription, createExtensionProfileDescription, terminalProfileArgsMatch, terminalIconsEqual };
