// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/terminal/common/terminalProfiles.ts
import { init_nls, localize } from "./module-0005.mjs";
import { ThemeIcon, init_themables } from "./module-0241.mjs";
import { Codicon, init_codicons } from "./module-0085.mjs";
import { init_types, isString } from "./module-0016.mjs";
import { __esm } from "./module-0000.mjs";
import { init_uri } from "./module-0030.mjs";


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

var init_terminalProfiles = __esm({
  "src/vs/platform/terminal/common/terminalProfiles.ts"() {
    init_codicons();
    init_uri();
    init_nls();
    init_themables();
    init_types();
  }
});
export { createProfileSchemaEnums, createProfileDescription, createExtensionProfileDescription, init_terminalProfiles };
