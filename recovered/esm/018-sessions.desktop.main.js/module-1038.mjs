// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadLanguageModelTools.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { revive } from "./module-0265.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { ILanguageModelToolsService, ToolDataSource, ToolSet, toolResultHasBuffers } from "./module-0991.mjs";
import { SerializableObjectWithBuffers } from "./module-0921.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { URI, isUriComponents } from "./module-0032.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { toToolSetKey } from "./module-1037.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProductService } from "./module-0875.mjs";


// src/vs/workbench/api/browser/mainThreadLanguageModelTools.ts
var MainThreadLanguageModelTools = class extends Disposable {
  constructor(extHostContext, _languageModelToolsService, _logService, _productService) {
    super();
    this._languageModelToolsService = _languageModelToolsService;
    this._logService = _logService;
    this._productService = _productService;
    this._tools = this._register(new DisposableMap());
    this._runningToolCalls = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostLanguageModelTools);
    this._register(this._languageModelToolsService.onDidChangeTools((e4) => this._proxy.$onDidChangeTools(this.getToolDtos())));
  }
  getToolDtos() {
    const fullReferenceNameMap = this._languageModelToolsService.getFullReferenceNameMap();
    return Array.from(this._languageModelToolsService.getAllToolsIncludingDisabled()).map((tool) => ({
      id: tool.id,
      displayName: tool.displayName,
      toolReferenceName: tool.toolReferenceName,
      legacyToolReferenceFullNames: tool.legacyToolReferenceFullNames,
      fullReferenceName: fullReferenceNameMap.get(tool) ?? void 0,
      tags: tool.tags,
      userDescription: tool.userDescription,
      modelDescription: tool.modelDescription,
      inputSchema: tool.inputSchema,
      source: tool.source
    }));
  }
  async $getTools() {
    return this.getToolDtos();
  }
  async $invokeTool(dto, token) {
    const result = await this._languageModelToolsService.invokeTool(
      revive(dto),
      (input, token2) => this._proxy.$countTokensForInvocation(dto.callId, input, token2),
      token ?? CancellationToken.None
    );
    const out = {
      content: result.content,
      toolMetadata: result.toolMetadata,
      toolResultError: result.toolResultError
    };
    return toolResultHasBuffers(result) ? new SerializableObjectWithBuffers(out) : out;
  }
  $acceptToolProgress(callId, progress) {
    this._runningToolCalls.get(callId)?.progress.report(progress);
  }
  $countTokensForInvocation(callId, input, token) {
    const fn = this._runningToolCalls.get(callId);
    if (!fn) {
      throw new Error(`Tool invocation call ${callId} not found`);
    }
    return fn.countTokens(input, token);
  }
  $registerTool(id2, hasHandleToolStream) {
    const disposable = this._languageModelToolsService.registerToolImplementation(
      id2,
      {
        invoke: async (dto, countTokens, progress, token) => {
          try {
            this._runningToolCalls.set(dto.callId, { countTokens, progress });
            const resultSerialized = await this._proxy.$invokeTool(dto, token);
            const resultDto = resultSerialized instanceof SerializableObjectWithBuffers ? resultSerialized.value : resultSerialized;
            return revive(resultDto);
          } finally {
            this._runningToolCalls.delete(dto.callId);
          }
        },
        prepareToolInvocation: (context2, token) => this._proxy.$prepareToolInvocation(id2, context2, token),
        handleToolStream: hasHandleToolStream ? (context2, token) => this._proxy.$handleToolStream(id2, context2, token) : void 0
      }
    );
    this._tools.set(id2, disposable);
  }
  $registerToolWithDefinition(extensionId, definition, hasHandleToolStream) {
    let icon2;
    if (definition.icon) {
      if (ThemeIcon.isThemeIcon(definition.icon)) {
        icon2 = definition.icon;
      } else if (typeof definition.icon === "object" && definition.icon !== null && isUriComponents(definition.icon)) {
        icon2 = { dark: URI.revive(definition.icon) };
      } else {
        const iconObj = definition.icon;
        icon2 = { dark: URI.revive(iconObj.dark), light: iconObj.light ? URI.revive(iconObj.light) : void 0 };
      }
    }
    const isBuiltinTool = this._productService.defaultChatAgent?.chatExtensionId ? ExtensionIdentifier.equals(extensionId, this._productService.defaultChatAgent.chatExtensionId) : false;
    const source = isBuiltinTool ? ToolDataSource.Internal : revive(definition.source);
    const toolData = {
      id: definition.id,
      displayName: definition.displayName,
      toolReferenceName: definition.toolReferenceName,
      legacyToolReferenceFullNames: definition.legacyToolReferenceFullNames,
      tags: definition.tags,
      userDescription: definition.userDescription,
      modelDescription: definition.modelDescription,
      inputSchema: definition.inputSchema,
      source,
      icon: icon2,
      models: definition.models,
      canBeReferencedInPrompt: !!definition.userDescription && !definition.toolSet
    };
    const id2 = definition.id;
    const store = new DisposableStore();
    store.add(this._languageModelToolsService.registerTool(
      toolData,
      {
        invoke: async (dto, countTokens, progress, token) => {
          try {
            this._runningToolCalls.set(dto.callId, { countTokens, progress });
            const resultSerialized = await this._proxy.$invokeTool(dto, token);
            const resultDto = resultSerialized instanceof SerializableObjectWithBuffers ? resultSerialized.value : resultSerialized;
            return revive(resultDto);
          } finally {
            this._runningToolCalls.delete(dto.callId);
          }
        },
        handleToolStream: hasHandleToolStream ? (context2, token) => this._proxy.$handleToolStream(id2, context2, token) : void 0,
        prepareToolInvocation: (context2, token) => this._proxy.$prepareToolInvocation(id2, context2, token)
      }
    ));
    if (definition.toolSet) {
      const ts = this._languageModelToolsService.getToolSet(toToolSetKey(extensionId, definition.toolSet)) || this._languageModelToolsService.getToolSet(definition.toolSet);
      if (!ts || !(ts instanceof ToolSet)) {
        this._logService.warn(`ToolSet ${definition.toolSet} not found for tool ${definition.id} from extension ${extensionId.value}`);
      } else {
        store.add(ts.addTool(toolData));
      }
    }
    this._tools.set(id2, store);
  }
  $unregisterTool(name) {
    this._tools.deleteAndDispose(name);
  }
};

MainThreadLanguageModelTools = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadLanguageModelTools),
  __decorateParam(1, ILanguageModelToolsService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IProductService)
], MainThreadLanguageModelTools);
export { MainThreadLanguageModelTools };
