// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/extensions/common/extensions.ts
import { ExtensionIdentifier } from "./module-0040.mjs";
import { URI } from "./module-0023.mjs";
import { createDecorator } from "./module-0038.mjs";
import { Disposable, toDisposable } from "./module-0011.mjs";


// src/vs/workbench/services/extensions/common/extensions.ts
var nullExtensionDescription = Object.freeze({
  identifier: new ExtensionIdentifier("nullExtensionDescription"),
  name: "Null Extension Description",
  version: "0.0.0",
  publisher: "vscode",
  engines: { vscode: "" },
  extensionLocation: URI.parse("void:location"),
  isBuiltin: false,
  targetPlatform: "undefined" /* UNDEFINED */,
  isUserBuiltin: false,
  isUnderDevelopment: false,
  preRelease: false
});

var IExtensionService = createDecorator("extensionService");

var MissingExtensionDependency = class {
  constructor(dependency) {
    this.dependency = dependency;
  }
};

function isProposedApiEnabled(extension, proposal) {
  if (!extension.enabledApiProposals) {
    return false;
  }
  let enabled = extension.enabledApiProposals.includes(proposal);
  if (!enabled && _proposedApiEnabledResolver?.(extension, proposal)) {
    enabled = true;
  }
  if (!enabled) {
    reportDisabledProposedApiUsage(extension, proposal);
  }
  return enabled;
}

var _proposedApiUsageReporter;

var _reportedProposedApiUsages = /* @__PURE__ */ new Set();

function setProposedApiUsageReporter(reporter) {
  _proposedApiUsageReporter = reporter;
  return toDisposable(() => {
    if (_proposedApiUsageReporter === reporter) {
      _proposedApiUsageReporter = void 0;
    }
  });
}

function reportDisabledProposedApiUsage(extension, proposal) {
  const reporter = _proposedApiUsageReporter;
  if (!reporter) {
    return;
  }
  const key = `${ExtensionIdentifier.toKey(extension.identifier)}/${proposal}`;
  if (_reportedProposedApiUsages.has(key)) {
    return;
  }
  _reportedProposedApiUsages.add(key);
  reporter({ extensionId: extension.identifier.value, proposalName: proposal });
}

var _proposedApiEnabledResolver;

var enabledApiProposalsFallbackNone = "none";

function setEnabledApiProposalsFallbackExperiment(value, quality) {
  if (quality !== "stable") {
    return Disposable.None;
  }
  const allowed = /* @__PURE__ */ new Set();
  if (value !== void 0 && value !== enabledApiProposalsFallbackNone) {
    for (const entry of value.split(",")) {
      const trimmed = entry.trim();
      const idx = trimmed.indexOf(":");
      if (idx <= 0 || idx === trimmed.length - 1) {
        continue;
      }
      const extensionId = ExtensionIdentifier.toKey(trimmed.slice(0, idx));
      const proposal = trimmed.slice(idx + 1);
      allowed.add(`${extensionId}:${proposal}`);
    }
  }
  const resolver = value === void 0 ? () => true : (extension, proposal) => allowed.has(`${ExtensionIdentifier.toKey(extension.identifier)}:${proposal}`);
  _proposedApiEnabledResolver = resolver;
  return toDisposable(() => {
    if (_proposedApiEnabledResolver === resolver) {
      _proposedApiEnabledResolver = void 0;
    }
  });
}

function checkProposedApiEnabled(extension, proposal) {
  if (!isProposedApiEnabled(extension, proposal)) {
    throw new Error(`Extension '${extension.identifier.value}' CANNOT use API proposal: ${proposal}.
Its package.json#enabledApiProposals-property declares: ${extension.enabledApiProposals?.join(", ") ?? "[]"} but NOT ${proposal}.
 The missing proposal MUST be added and you must start in extension development mode or use the following command line switch: --enable-proposed-api ${extension.identifier.value}`);
  }
}
export { isProposedApiEnabled, setProposedApiUsageReporter, reportDisabledProposedApiUsage, setEnabledApiProposalsFallbackExperiment, checkProposedApiEnabled, nullExtensionDescription, IExtensionService, MissingExtensionDependency, _proposedApiUsageReporter, _reportedProposedApiUsages, _proposedApiEnabledResolver, enabledApiProposalsFallbackNone };
