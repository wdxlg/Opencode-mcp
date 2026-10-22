// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/telemetry/common/telemetryUtils.ts
import { TELEMETRY_CRASH_REPORTER_SETTING_ID, TELEMETRY_OLD_SETTING_ID, TELEMETRY_SETTING_ID, init_telemetry } from "./module-0104.mjs";
import { init_commonProperties, verifyMicrosoftInternalDomain } from "./module-0214.mjs";
import { cloneAndChange, init_objects } from "./module-0121.mjs";
import { __esm } from "./module-0000.mjs";
import { init_types } from "./module-0016.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { init_remoteHosts } from "./module-0127.mjs";


// src/vs/platform/telemetry/common/telemetryUtils.ts
function supportsTelemetry(productService, environmentService) {
  if (!environmentService.isBuilt && !environmentService.disableTelemetry) {
    return true;
  }
  return !(environmentService.disableTelemetry || !productService.enableTelemetry);
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

function cleanData(data, cleanUpPatterns) {
  if (!data) {
    return {};
  }
  return cloneAndChange(data, (value) => {
    if (value instanceof TelemetryTrustedValue || Object.hasOwnProperty.call(value, "isTrustedTelemetryValue")) {
      return value.value;
    }
    if (typeof value === "string") {
      let updatedProperty = value.replaceAll("%20", " ");
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

var TelemetryTrustedValue, NullTelemetryServiceShape, NullTelemetryService, telemetryLogId, TelemetryLogGroup, userDataRegexes;

var init_telemetryUtils = __esm({
  "src/vs/platform/telemetry/common/telemetryUtils.ts"() {
    init_objects();
    init_types();
    init_nls();
    init_remoteHosts();
    init_commonProperties();
    init_telemetry();
    TelemetryTrustedValue = class {
      constructor(value) {
        this.value = value;
        // This is merely used as an identifier as the instance will be lost during serialization over the exthost
        this.isTrustedTelemetryValue = true;
      }
    };
    NullTelemetryServiceShape = class {
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
    NullTelemetryService = new NullTelemetryServiceShape();
    telemetryLogId = "telemetry";
    TelemetryLogGroup = { id: telemetryLogId, name: localize(3263, null) };
    userDataRegexes = [
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
  }
});
export { supportsTelemetry, getTelemetryLevel, isInternalTelemetry, getPiiPathsFromEnvironment, anonymizeFilePaths, redactIfPossibleUserInfo, removePropertiesWithPossibleUserInfo, cleanData, TelemetryTrustedValue, NullTelemetryServiceShape, NullTelemetryService, telemetryLogId, TelemetryLogGroup, userDataRegexes, init_telemetryUtils };
