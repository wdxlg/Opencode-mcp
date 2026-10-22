// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/telemetry/common/telemetryUtils.ts
import { localize } from "./module-0001.mjs";
import { TELEMETRY_CRASH_REPORTER_SETTING_ID, TELEMETRY_OLD_SETTING_ID, TELEMETRY_SETTING_ID } from "./module-0093.mjs";
import { getRemoteName } from "./module-0687.mjs";
import { verifyMicrosoftInternalDomain } from "./module-0884.mjs";
import { cloneAndChange } from "./module-0098.mjs";


// src/vs/platform/telemetry/common/telemetryUtils.ts
var TelemetryTrustedValue = class {
  constructor(value2) {
    this.value = value2;
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

function supportsTelemetry(productService, environmentService) {
  if (!environmentService.isBuilt && !environmentService.disableTelemetry) {
    return true;
  }
  return !(environmentService.disableTelemetry || !productService.enableTelemetry);
}

function isLoggingOnly(productService, environmentService) {
  if (environmentService.extensionTestsLocationURI) {
    return true;
  }
  if (environmentService.isBuilt) {
    return false;
  }
  if (environmentService.disableTelemetry) {
    return false;
  }
  if (productService.enableTelemetry && productService.aiConfig?.ariaKey) {
    return false;
  }
  return true;
}

function getTelemetryLevel(configurationService) {
  const newConfig = configurationService.getValue(TELEMETRY_SETTING_ID);
  const crashReporterConfig = configurationService.getValue(TELEMETRY_CRASH_REPORTER_SETTING_ID);
  const oldConfig = configurationService.getValue(TELEMETRY_OLD_SETTING_ID);
  if (oldConfig === false || crashReporterConfig === false) {
    return 0 /* NONE */;
  }
  switch (newConfig === void 0 ? "all" /* ON */ : newConfig) {
    case "all" /* ON */:
      return 3 /* USAGE */;
    case "error" /* ERROR */:
      return 2 /* ERROR */;
    case "crash" /* CRASH */:
      return 1 /* CRASH */;
    case "off" /* OFF */:
      return 0 /* NONE */;
    default:
      return 0 /* NONE */;
  }
}

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

function isInternalTelemetry(productService, configService) {
  const msftInternalDomains = productService.msftInternalDomains || [];
  const internalTesting = configService.getValue("telemetry.internalTesting");
  return verifyMicrosoftInternalDomain(msftInternalDomains) || internalTesting;
}

function getPiiPathsFromEnvironment(paths) {
  return [paths.appRoot, paths.extensionsPath, paths.userHome.fsPath, paths.tmpDir.fsPath, paths.userDataPath];
}

function anonymizeFilePaths(stack, cleanupPatterns) {
  if (!stack || !stack.includes("/") && !stack.includes("\\")) {
    return stack;
  }
  let updatedStack = stack;
  const cleanUpIndexes = [];
  for (const regexp2 of cleanupPatterns) {
    while (true) {
      const result = regexp2.exec(stack);
      if (!result) {
        break;
      }
      cleanUpIndexes.push([result.index, regexp2.lastIndex]);
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

function redactIfPossibleUserInfo(value2, probe = value2) {
  for (const secretRegex of userDataRegexes) {
    if (secretRegex.regex.test(probe)) {
      return `<REDACTED: ${secretRegex.label}>`;
    }
  }
  return value2;
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
  for (let i2 = 0; i2 < lines.length; i2++) {
    const probe = i2 < lines.length - 1 ? lines[i2] + "\n" : lines[i2];
    lines[i2] = redactIfPossibleUserInfo(lines[i2], probe);
  }
  return lines.join("\n");
}

function cleanData(data, cleanUpPatterns) {
  if (!data) {
    return {};
  }
  return cloneAndChange(data, (value2) => {
    if (value2 instanceof TelemetryTrustedValue || Object.hasOwnProperty.call(value2, "isTrustedTelemetryValue")) {
      return value2.value;
    }
    if (typeof value2 === "string") {
      let updatedProperty = value2.replaceAll("%20", " ");
      updatedProperty = anonymizeFilePaths(updatedProperty, cleanUpPatterns);
      for (const regexp2 of cleanUpPatterns) {
        updatedProperty = updatedProperty.replace(regexp2, "");
      }
      updatedProperty = removePropertiesWithPossibleUserInfo(updatedProperty);
      return updatedProperty;
    }
    return void 0;
  });
}
export { supportsTelemetry, isLoggingOnly, getTelemetryLevel, cleanRemoteAuthority, isInternalTelemetry, getPiiPathsFromEnvironment, anonymizeFilePaths, redactIfPossibleUserInfo, removePropertiesWithPossibleUserInfo, cleanData, TelemetryTrustedValue, NullTelemetryServiceShape, NullTelemetryService, telemetryLogId, TelemetryLogGroup, userDataRegexes };
