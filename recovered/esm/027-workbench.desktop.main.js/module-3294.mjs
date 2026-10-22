// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/common/terminalExtensionPoints.ts
import { ExtensionsRegistry } from "./module-0876.mjs";
import { terminalContributionsDescriptor } from "./module-1173.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Emitter } from "./module-0017.mjs";
import { isProposedApiEnabled } from "./module-0887.mjs";
import { isObject, isString } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/terminal/common/terminalExtensionPoints.ts
var terminalsExtPoint = ExtensionsRegistry.registerExtensionPoint(terminalContributionsDescriptor);

var ITerminalContributionService = createDecorator("terminalContributionsService");

var TerminalContributionService = class {
  constructor() {
    this._terminalProfiles = [];
    this._terminalCompletionProviders = [];
    this._onDidChangeTerminalCompletionProviders = new Emitter();
    this.onDidChangeTerminalCompletionProviders = this._onDidChangeTerminalCompletionProviders.event;
    terminalsExtPoint.setHandler((contributions) => {
      this._terminalProfiles = contributions.map((c) => {
        return c.value?.profiles?.filter((p) => hasValidTerminalIcon(p)).map((e) => {
          return { ...e, extensionIdentifier: c.description.identifier.value };
        }) || [];
      }).flat();
      this._terminalCompletionProviders = contributions.map((c) => {
        if (!isProposedApiEnabled(c.description, "terminalCompletionProvider")) {
          return [];
        }
        return c.value?.completionProviders?.map((p) => {
          return { ...p, extensionIdentifier: c.description.identifier.value };
        }) || [];
      }).flat();
      this._onDidChangeTerminalCompletionProviders.fire();
    });
  }
  get terminalProfiles() {
    return this._terminalProfiles;
  }
  get terminalCompletionProviders() {
    return this._terminalCompletionProviders;
  }
};

function hasValidTerminalIcon(profile) {
  function isValidDarkLightIcon(obj) {
    return isObject(obj) && "light" in obj && URI.isUri(obj.light) && "dark" in obj && URI.isUri(obj.dark);
  }
  return !profile.icon || (isString(profile.icon) || URI.isUri(profile.icon) || isValidDarkLightIcon(profile.icon));
}
export { hasValidTerminalIcon, terminalsExtPoint, ITerminalContributionService, TerminalContributionService };
