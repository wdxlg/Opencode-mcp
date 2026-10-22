// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/node/extensionSignatureVerificationService.ts
import { createDecorator } from "./module-0042.mjs";
import { getErrorMessage } from "./module-0003.mjs";
import { isDefined } from "./module-0006.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0044.mjs";
import { ITelemetryService } from "./module-0085.mjs";


// src/vs/platform/extensionManagement/node/extensionSignatureVerificationService.ts
var IExtensionSignatureVerificationService = createDecorator("IExtensionSignatureVerificationService");

var ExtensionSignatureVerificationService = class {
  constructor(logService, telemetryService) {
    this.logService = logService;
    this.telemetryService = telemetryService;
  }
  vsceSign() {
    if (!this.moduleLoadingPromise) {
      this.moduleLoadingPromise = this.resolveVsceSign();
    }
    return this.moduleLoadingPromise;
  }
  async resolveVsceSign() {
    const mod = "@vscode/vsce-sign";
    return import(mod);
  }
  async verify(extensionId, version, vsixFilePath, signatureArchiveFilePath, clientTargetPlatform) {
    let module2;
    try {
      module2 = await this.vsceSign();
    } catch (error) {
      this.logService.error("Could not load vsce-sign module", getErrorMessage(error));
      this.logService.info(`Extension signature verification is not done: ${extensionId}`);
      return void 0;
    }
    const startTime = (/* @__PURE__ */ new Date()).getTime();
    let result;
    try {
      this.logService.trace(`Verifying extension signature for ${extensionId}...`);
      result = await module2.verify(vsixFilePath, signatureArchiveFilePath, this.logService.getLevel() === 1 /* Trace */);
    } catch (e) {
      result = {
        code: "UnknownError" /* UnknownError */,
        didExecute: false,
        output: getErrorMessage(e)
      };
    }
    const duration = (/* @__PURE__ */ new Date()).getTime() - startTime;
    this.logService.info(`Extension signature verification result for ${extensionId}: ${result.code}. ${isDefined(result.internalCode) ? `Internal Code: ${result.internalCode}. ` : ""}Executed: ${result.didExecute}. Duration: ${duration}ms.`);
    this.logService.trace(`Extension signature verification output for ${extensionId}:
${result.output}`);
    this.telemetryService.publicLog2("extensionsignature:verification", {
      extensionId,
      extensionVersion: version,
      code: result.code,
      internalCode: result.internalCode,
      duration,
      didExecute: result.didExecute,
      clientTargetPlatform
    });
    return { code: result.code };
  }
};

ExtensionSignatureVerificationService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, ITelemetryService)
], ExtensionSignatureVerificationService);
export { IExtensionSignatureVerificationService, ExtensionSignatureVerificationService };
