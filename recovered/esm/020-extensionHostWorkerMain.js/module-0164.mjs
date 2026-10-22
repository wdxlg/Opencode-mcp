// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/telemetry/common/telemetryUtils.ts
import { localize } from "./module-0015.mjs";
import { getRemoteName } from "./module-0039.mjs";
import { cloneAndChange } from "./module-0055.mjs";


// src/vs/platform/telemetry/common/telemetryUtils.ts
var TelemetryTrustedValue = class {
  constructor(value) {
    this.value = value;
    // This is merely used as an identifier as the instance will be lost during serialization over the exthost
    this.isTrustedTelemetryValue = true;
  }
};

var NullTelemetryServiceShape = class {
  constructor() {
    this.telemetryLevel = 0 /* NONE */;
    this.sessionId = "someValue.sessionId";
    this.machineId = "someValue.machineId";
    this.sqmId = "someValue.sqmId";
    this.devDeviceId = "someValue.devDeviceId";
    this.firstSessionDate = "someValue.firstSessionDate";
    this.sendErrorTelemetry = false;
  }
  publicLog() {
  }
  publicLog2() {
  }
  publicLogError() {
  }
  publicLogError2() {
  }
  setExperimentProperty() {
  }
  setCommonProperty() {
  }
};

var NullTelemetryService = new NullTelemetryServiceShape();

var telemetryLogId = "telemetry";

var TelemetryLogGroup = { id: telemetryLogId, name: localize(3263, null) };

function cleanRemoteAuthority(remoteAuthority, config) {
  if (!remoteAuthority) {
    return "none";
  }
  const remoteName = getRemoteName(remoteAuthority);
  const set1 = config?.remoteExtensionTips;
  if (set1 && Object.prototype.hasOwnProperty.call(set1, remoteName)) {
    return remoteName;
  }
  const set2 = config?.virtualWorkspaceExtensionTips;
  if (set2 && Object.prototype.hasOwnProperty.call(set2, remoteName)) {
    return remoteName;
  }
  return "other";
}

function anonymizeFilePaths(stack, cleanupPatterns) {
  if (!stack || !stack.includes("/") && !stack.includes("\\")) {
    return stack;
  }
  let updatedStack = stack;
  const cleanUpIndexes = [];
  for (const regexp of cleanupPatterns) {
    while (true) {
      const result = regexp.exec(stack);
      if (!result) {
        break;
      }
      cleanUpIndexes.push([result.index, regexp.lastIndex]);
    }
  }
  const nodeModulesRegex = /(?:^|[\\\/])((node_modules|node_modules\.asar)[\\\/].*)$/;
  const vscodeExtensionsPathRegex = /^(.*?)((?:\.vscode(?:-[a-z]+)*|resources[\\\/]app)[\\\/]extensions[\\\/].*)$/i;
  const fileRegex = /(file:\/\/)?([a-zA-Z]:(\\\\|\\|\/)|(\\\\|\\|\/))?([\w\-\._@]+(\\\\|\\|\/))+[\w\-\._@]*/g;
  let lastIndex = 0;
  updatedStack = "";
  while (true) {
    const result = fileRegex.exec(stack);
    if (!result) {
      break;
    }
    const overlappingRange = cleanUpIndexes.some(([start, end]) => result.index < end && start < fileRegex.lastIndex);
    if (!overlappingRange) {
      const vscodeExtMatch = vscodeExtensionsPathRegex.exec(result[0]);
      if (vscodeExtMatch) {
        updatedStack += stack.substring(lastIndex, result.index) + "<REDACTED: user-file-path>/" + vscodeExtMatch[2];
      } else {
        const nodeModulesMatch = nodeModulesRegex.exec(result[0]);
        if (nodeModulesMatch) {
          updatedStack += stack.substring(lastIndex, result.index) + "<REDACTED: user-file-path>/" + nodeModulesMatch[1];
        } else {
          updatedStack += stack.substring(lastIndex, result.index) + "<REDACTED: user-file-path>";
        }
      }
      lastIndex = fileRegex.lastIndex;
    }
  }
  if (lastIndex < stack.length) {
    updatedStack += stack.substr(lastIndex);
  }
  return updatedStack;
}

var userDataRegexes = [
  { label: "URL", regex: /[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s]*/ },
  { label: "Google API Key", regex: /AIza[A-Za-z0-9_\\\-]{35}/ },
  { label: "JWT", regex: /eyJ[0eXAiOiJKV1Qi|hbGci|a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/ },
  { label: "Slack Token", regex: /xox[pbar]\-[A-Za-z0-9]/ },
  { label: "GitHub Token", regex: /(gh[psuro]_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})/ },
  { label: "Generic Secret", regex: /(key|token|sig|secret|signature|password|passwd|pwd|android:value)[^a-zA-Z0-9]/i },
  { label: "CLI Credentials", regex: /((login|psexec|(certutil|psexec)\.exe).{1,50}(\s-u(ser(name)?)?\s+.{3,100})?\s-(admin|user|vm|root)?p(ass(word)?)?\s+["']?[^$\-\/\s]|(^|[\s\r\n\\])net(\.exe)?.{1,5}(user\s+|share\s+\/user:| user -? secrets ? set) \s + [^ $\s \/])/ },
  { label: "Microsoft Entra ID", regex: /eyJ(?:0eXAiOiJKV1Qi|hbGci|[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.)/ },
  { label: "Email", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ }
];

function redactIfPossibleUserInfo(value, probe = value) {
  for (const secretRegex of userDataRegexes) {
    if (secretRegex.regex.test(probe)) {
      return `<REDACTED: ${secretRegex.label}>`;
    }
  }
  return value;
}

function removePropertiesWithPossibleUserInfo(property) {
  if (!property) {
    return property;
  }
  let hasMatch = false;
  for (const secretRegex of userDataRegexes) {
    if (secretRegex.regex.test(property)) {
      hasMatch = true;
      break;
    }
  }
  if (!hasMatch) {
    return property;
  }
  if (!property.includes("\n")) {
    return redactIfPossibleUserInfo(property);
  }
  const lines = property.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const probe = i < lines.length - 1 ? lines[i] + "\n" : lines[i];
    lines[i] = redactIfPossibleUserInfo(lines[i], probe);
  }
  return lines.join("\n");
}

function cleanData(data2, cleanUpPatterns) {
  if (!data2) {
    return {};
  }
  return cloneAndChange(data2, (value) => {
    if (value instanceof TelemetryTrustedValue || Object.hasOwnProperty.call(value, "isTrustedTelemetryValue")) {
      return value.value;
    }
    if (typeof value === "string") {
      let updatedProperty = value.replaceAll("%20", " ");
      updatedProperty = anonymizeFilePaths(updatedProperty, cleanUpPatterns);
      for (const regexp of cleanUpPatterns) {
        updatedProperty = updatedProperty.replace(regexp, "");
      }
      updatedProperty = removePropertiesWithPossibleUserInfo(updatedProperty);
      return updatedProperty;
    }
    return void 0;
  });
}
export { cleanRemoteAuthority, anonymizeFilePaths, redactIfPossibleUserInfo, removePropertiesWithPossibleUserInfo, cleanData, TelemetryTrustedValue, NullTelemetryServiceShape, NullTelemetryService, telemetryLogId, TelemetryLogGroup, userDataRegexes };
