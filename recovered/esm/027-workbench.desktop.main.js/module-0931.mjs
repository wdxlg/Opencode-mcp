// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/editor/common/customEditorLabelService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { MRUCache } from "./module-0008.mjs";
import { dirname, isAbsolute, parse } from "./module-0026.mjs";
import { parse4 } from "./module-0857.mjs";
import { dirname2, relativePath } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { createDecorator } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/editor/common/customEditorLabelService.ts
var CustomEditorLabelService = class extends Disposable {
  constructor(configurationService, workspaceContextService) {
    super();
    this.configurationService = configurationService;
    this.workspaceContextService = workspaceContextService;
    this._onDidChange = this._register(new Emitter({
      leakWarningThreshold: 500,
      leakWarningName: "CustomEditorLabelService._onDidChange"
      /* increased for users with hundreds of inputs opened */
    }));
    this.onDidChange = this._onDidChange.event;
    this.patterns = [];
    this.enabled = true;
    this.cache = new MRUCache(1e3);
    this._templateRegexValidation = /[a-zA-Z0-9]/;
    this._parsedTemplateExpression = /\$\{(dirname|filename|extname|extname\((?<extnameN>[-+]?\d+)\)|dirname\((?<dirnameN>[-+]?\d+)\))\}/g;
    this._filenameCaptureExpression = /(?<filename>^\.*[^.]*)/;
    this.storeEnablementState();
    this.storeCustomPatterns();
    this.registerListeners();
  }
  static {
    this.SETTING_ID_PATTERNS = "workbench.editor.customLabels.patterns";
  }
  static {
    this.SETTING_ID_ENABLED = "workbench.editor.customLabels.enabled";
  }
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(CustomEditorLabelService.SETTING_ID_ENABLED)) {
        const oldEnablement = this.enabled;
        this.storeEnablementState();
        if (oldEnablement !== this.enabled && this.patterns.length > 0) {
          this._onDidChange.fire();
        }
      } else if (e.affectsConfiguration(CustomEditorLabelService.SETTING_ID_PATTERNS)) {
        this.cache.clear();
        this.storeCustomPatterns();
        this._onDidChange.fire();
      }
    }));
  }
  storeEnablementState() {
    this.enabled = this.configurationService.getValue(CustomEditorLabelService.SETTING_ID_ENABLED);
  }
  storeCustomPatterns() {
    this.patterns = [];
    const customLabelPatterns = this.configurationService.getValue(CustomEditorLabelService.SETTING_ID_PATTERNS);
    for (const pattern in customLabelPatterns) {
      const template2 = customLabelPatterns[pattern];
      if (!this._templateRegexValidation.test(template2)) {
        continue;
      }
      const isAbsolutePath2 = isAbsolute(pattern);
      const parsedPattern = parse4(pattern, { ignoreCase: true });
      this.patterns.push({ pattern, template: template2, isAbsolutePath: isAbsolutePath2, parsedPattern });
    }
    this.patterns.sort((a, b) => this.patternWeight(b.pattern) - this.patternWeight(a.pattern));
  }
  patternWeight(pattern) {
    let weight5 = 0;
    for (const fragment of pattern.split("/")) {
      if (fragment === "**") {
        weight5 += 1;
      } else if (fragment === "*") {
        weight5 += 10;
      } else if (fragment.includes("*") || fragment.includes("?")) {
        weight5 += 50;
      } else if (fragment !== "") {
        weight5 += 100;
      }
    }
    return weight5;
  }
  getName(resource) {
    if (!this.enabled || this.patterns.length === 0) {
      return void 0;
    }
    const key3 = resource.toString();
    const cached = this.cache.get(key3);
    if (cached !== void 0) {
      return cached ?? void 0;
    }
    const result = this.applyPatterns(resource);
    this.cache.set(key3, result ?? null);
    return result;
  }
  applyPatterns(resource) {
    const root = this.workspaceContextService.getWorkspaceFolder(resource);
    let relativePath2;
    for (const pattern of this.patterns) {
      let relevantPath;
      if (root && !pattern.isAbsolutePath) {
        if (!relativePath2) {
          relativePath2 = relativePath(dirname2(root.uri), resource) ?? resource.path;
        }
        relevantPath = relativePath2;
      } else {
        relevantPath = resource.path;
      }
      if (pattern.parsedPattern(relevantPath)) {
        return this.applyTemplate(pattern.template, resource, relevantPath);
      }
    }
    return void 0;
  }
  applyTemplate(template2, resource, relevantPath) {
    let parsedPath;
    return template2.replace(this._parsedTemplateExpression, (match2, variable, ...args2) => {
      parsedPath = parsedPath ?? parse(resource.path);
      const { dirnameN = "0", extnameN = "0" } = args2.pop();
      if (variable === "filename") {
        const { filename } = this._filenameCaptureExpression.exec(parsedPath.base)?.groups ?? {};
        if (filename) {
          return filename;
        }
      } else if (variable === "extname") {
        const extension = this.getExtnames(parsedPath.base);
        if (extension) {
          return extension;
        }
      } else if (variable.startsWith("extname")) {
        const n2 = parseInt(extnameN);
        const nthExtname = this.getNthExtname(parsedPath.base, n2);
        if (nthExtname) {
          return nthExtname;
        }
      } else if (variable.startsWith("dirname")) {
        const n2 = parseInt(dirnameN);
        const nthDir = this.getNthDirname(dirname(relevantPath), n2);
        if (nthDir) {
          return nthDir;
        }
      }
      return match2;
    });
  }
  removeLeadingDot(path) {
    let withoutLeadingDot = path;
    while (withoutLeadingDot.startsWith(".")) {
      withoutLeadingDot = withoutLeadingDot.slice(1);
    }
    return withoutLeadingDot;
  }
  getNthDirname(path, n2) {
    path = path.startsWith("/") ? path.slice(1) : path;
    const pathFragments = path.split("/");
    return this.getNthFragment(pathFragments, n2);
  }
  getExtnames(fullFileName) {
    return this.removeLeadingDot(fullFileName).split(".").slice(1).join(".");
  }
  getNthExtname(fullFileName, n2) {
    const extensionNameFragments = this.removeLeadingDot(fullFileName).split(".");
    extensionNameFragments.shift();
    return this.getNthFragment(extensionNameFragments, n2);
  }
  getNthFragment(fragments2, n2) {
    const length = fragments2.length;
    let nth;
    if (n2 < 0) {
      nth = Math.abs(n2) - 1;
    } else {
      nth = length - n2 - 1;
    }
    const nthFragment = fragments2[nth];
    if (nthFragment === void 0 || nthFragment === "") {
      return void 0;
    }
    return nthFragment;
  }
};

CustomEditorLabelService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IWorkspaceContextService)
], CustomEditorLabelService);

var ICustomEditorLabelService = createDecorator("ICustomEditorLabelService");

registerSingleton(ICustomEditorLabelService, CustomEditorLabelService, 1 /* Delayed */);
export { CustomEditorLabelService, ICustomEditorLabelService };
