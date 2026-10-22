// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpLanguageModelToolContribution.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { isContributionEnabled } from "./module-1018.mjs";
import { equals4 } from "./module-0098.mjs";
import { mcpServerToSourceData } from "./module-2199.mjs";
import { Lazy } from "./module-0028.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { IMcpService, McpResourceURI, McpToolResourceLinkMimeType } from "./module-1206.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IMcpRegistry } from "./module-1447.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { McpServer } from "./module-2334.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { mcpAppsEnabledConfig } from "./module-1196.mjs";
import { isDefined } from "./module-0010.mjs";
import { VSBuffer, decodeBase64 } from "./module-0038.mjs";
import { ChatResponseResource, getAttachableImageExtension } from "./module-1193.mjs";
import { basename2 } from "./module-0034.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IProductService } from "./module-0873.mjs";
import { IFileService } from "./module-0269.mjs";
import { IImageResizeService } from "./module-2971.mjs";


// src/vs/workbench/contrib/mcp/common/mcpLanguageModelToolContribution.ts
var McpLanguageModelToolContribution = class extends Disposable {
  constructor(_toolsService, mcpService, _instantiationService, _mcpRegistry, lifecycleService) {
    super();
    this._toolsService = _toolsService;
    this._instantiationService = _instantiationService;
    this._mcpRegistry = _mcpRegistry;
    this.lifecycleService = lifecycleService;
    const previous = this._register(new DisposableMap());
    this._register(autorun((reader) => {
      const servers = mcpService.servers.read(reader);
      const toDelete = new Set(previous.keys());
      for (const server of servers) {
        if (!isContributionEnabled(server.enablement.read(reader))) {
          continue;
        }
        const previousRec = previous.get(server);
        if (previousRec) {
          toDelete.delete(server);
          if (!previousRec.source || equals4(previousRec.source, mcpServerToSourceData(server, reader))) {
            continue;
          }
          previousRec.dispose();
        }
        const store = new DisposableStore();
        const rec = { dispose: () => store.dispose() };
        const toolSet = new Lazy(() => {
          const source = rec.source = mcpServerToSourceData(server);
          const referenceName = server.definition.label.toLowerCase().replace(/\s+/g, "-");
          const toolSet2 = store.add(this._toolsService.createToolSet(
            source,
            server.definition.id,
            referenceName,
            {
              icon: Codicon.mcp,
              description: localize(17155, null, server.definition.label),
              deprecated: true
            }
          ));
          return { toolSet: toolSet2, source };
        });
        this._syncTools(server, toolSet, store);
        previous.set(server, rec);
      }
      for (const key3 of toDelete) {
        previous.deleteAndDispose(key3);
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.mcp.languageModelTools";
  }
  _syncTools(server, collectionData, store) {
    const tools = /* @__PURE__ */ new Map();
    const collectionObservable = this._mcpRegistry.collections.map((collections) => collections.find((c) => c.id === server.collection.id));
    store.add(autorun((reader) => {
      const toDelete = new Set(tools.keys());
      const toRegister = [];
      const registerTool = (tool, toolData, store2) => {
        store2.add(this._toolsService.registerTool(toolData, this._instantiationService.createInstance(McpToolImplementation, tool, server)));
        store2.add(collectionData.value.toolSet.addTool(toolData));
      };
      if (this.lifecycleService.willShutdown) {
        return;
      }
      const collection = collectionObservable.read(reader);
      if (!collection) {
        tools.forEach((t2) => t2.store.dispose());
        tools.clear();
        return;
      }
      for (const tool of server.tools.read(reader)) {
        if (!(tool.visibility & 1 /* Model */)) {
          continue;
        }
        const existing = tools.get(tool.id);
        const icons2 = tool.icons.getUrl(22);
        const toolData = {
          id: tool.id,
          source: collectionData.value.source,
          icon: icons2 || Codicon.tools,
          // duplicative: https://github.com/modelcontextprotocol/modelcontextprotocol/pull/813
          displayName: tool.definition.annotations?.title || tool.definition.title || tool.definition.name,
          toolReferenceName: tool.referenceName,
          modelDescription: tool.definition.description ?? "",
          userDescription: tool.definition.description ?? "",
          inputSchema: tool.definition.inputSchema,
          canBeReferencedInPrompt: true,
          alwaysDisplayInputOutput: true,
          canRequestPreApproval: !tool.definition.annotations?.readOnlyHint,
          canRequestPostApproval: !!tool.definition.annotations?.openWorldHint,
          runsInWorkspace: collection?.scope === 1 /* WORKSPACE */ || !!collection?.remoteAuthority,
          tags: ["mcp"]
        };
        if (existing) {
          if (!equals4(existing.toolData, toolData)) {
            existing.toolData = toolData;
            existing.store.clear();
            registerTool(tool, toolData, existing.store);
          }
          toDelete.delete(tool.id);
        } else {
          const store2 = new DisposableStore();
          toRegister.push(() => registerTool(tool, toolData, store2));
          tools.set(tool.id, { toolData, store: store2 });
        }
      }
      for (const id2 of toDelete) {
        const tool = tools.get(id2);
        if (tool) {
          tool.store.dispose();
          tools.delete(id2);
        }
      }
      for (const fn of toRegister) {
        fn();
      }
      this._toolsService.flushToolUpdates();
    }));
    store.add(toDisposable(() => {
      for (const tool of tools.values()) {
        tool.store.dispose();
      }
    }));
  }
};

McpLanguageModelToolContribution = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, IMcpService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IMcpRegistry),
  __decorateParam(4, ILifecycleService)
], McpLanguageModelToolContribution);

var McpToolImplementation = class {
  constructor(_tool, _server, _configurationService, _productService, _fileService, _imageResizeService) {
    this._tool = _tool;
    this._server = _server;
    this._configurationService = _configurationService;
    this._productService = _productService;
    this._fileService = _fileService;
    this._imageResizeService = _imageResizeService;
  }
  async prepareToolInvocation(context2) {
    const tool = this._tool;
    const server = this._server;
    const sandboxEnabled = await McpServer.callOn(server, async (_handler, connection) => {
      return connection.definition.sandboxEnabled;
    });
    const isSandboxedServer = sandboxEnabled === true;
    const mcpToolWarning = localize(
      17154,
      null,
      this._productService.nameShort
    );
    const title = tool.definition.annotations?.title || tool.definition.title || "`" + tool.definition.name + "`";
    let confirm;
    if (!isSandboxedServer) {
      confirm = {};
      if (!tool.definition.annotations?.readOnlyHint) {
        confirm.title = new MarkdownString(localize(17159, null, title));
        confirm.message = new MarkdownString(tool.definition.description, { supportThemeIcons: true });
        confirm.disclaimer = mcpToolWarning;
        confirm.allowAutoConfirm = true;
      }
      if (tool.definition.annotations?.openWorldHint) {
        confirm.confirmResults = true;
      }
    }
    const mcpUiEnabled = this._configurationService.getValue(mcpAppsEnabledConfig);
    return {
      confirmationMessages: confirm,
      invocationMessage: new MarkdownString(localize(17157, null, title)),
      pastTenseMessage: new MarkdownString(localize(17156, null, title)),
      originMessage: localize(17158, null, server.definition.label),
      toolSpecificData: {
        kind: "input",
        rawInput: context2.parameters,
        mcpAppData: mcpUiEnabled && tool.uiResourceUri ? {
          kind: "local",
          resourceUri: tool.uiResourceUri,
          serverDefinitionId: server.definition.id,
          collectionId: server.collection.id
        } : void 0
      }
    };
  }
  async invoke(invocation, _countTokens, progress, token) {
    const result = {
      content: []
    };
    const callResult = await this._tool.callWithProgress(invocation.parameters, progress, {
      chatRequestId: invocation.chatRequestId,
      chatSessionResource: invocation.context?.sessionResource,
      traceparent: invocation.traceparent,
      tracestate: invocation.tracestate
    }, token);
    const details = {
      input: JSON.stringify(invocation.parameters, void 0, 2),
      output: [],
      isError: callResult.isError === true
    };
    for (const item of callResult.content) {
      const audience = item.annotations?.audience?.map((a) => {
        if (a === "assistant") {
          return 0 /* Assistant */;
        } else if (a === "user") {
          return 1 /* User */;
        } else {
          return void 0;
        }
      }).filter(isDefined);
      if (audience?.includes(1 /* User */)) {
        if (item.type === "text") {
          progress.report({ message: item.text });
        }
      }
      const addAsInlineData = async (mimeType, value2, uri5) => {
        details.output.push({ type: "embed", mimeType, value: value2, uri: uri5, audience });
        if (isForModel) {
          let finalData;
          try {
            const resized = await this._imageResizeService.resizeImage(decodeBase64(value2).buffer, mimeType);
            finalData = VSBuffer.wrap(resized);
          } catch {
            finalData = decodeBase64(value2);
          }
          result.content.push({ kind: "data", value: { mimeType, data: finalData }, audience });
        }
      };
      const addAsLinkedResource = (uri5, mimeType) => {
        const json = { uri: uri5, underlyingMimeType: mimeType };
        result.content.push({
          kind: "data",
          audience,
          value: {
            mimeType: McpToolResourceLinkMimeType,
            data: VSBuffer.fromString(JSON.stringify(json))
          }
        });
      };
      const isForModel = !audience || audience.includes(0 /* Assistant */);
      if (item.type === "text") {
        details.output.push({ type: "embed", isText: true, value: item.text });
        if (isForModel && !callResult.structuredContent) {
          result.content.push({
            kind: "text",
            audience,
            value: item.text
          });
        }
      } else if (item.type === "image" || item.type === "audio") {
        await addAsInlineData(item.mimeType || "image/png", item.data);
      } else if (item.type === "resource_link") {
        const uri5 = McpResourceURI.fromServer(this._server.definition, item.uri);
        details.output.push({
          type: "ref",
          uri: uri5,
          audience,
          mimeType: item.mimeType
        });
        if (isForModel) {
          if (item.mimeType && getAttachableImageExtension(item.mimeType)) {
            result.content.push({
              kind: "data",
              audience,
              value: {
                mimeType: item.mimeType,
                data: await this._fileService.readFile(uri5).then((f) => f.value).catch(() => VSBuffer.alloc(0))
              }
            });
          } else {
            addAsLinkedResource(uri5, item.mimeType);
          }
        }
      } else if (item.type === "resource") {
        const uri5 = McpResourceURI.fromServer(this._server.definition, item.resource.uri);
        if (item.resource.mimeType && getAttachableImageExtension(item.resource.mimeType) && "blob" in item.resource) {
          await addAsInlineData(item.resource.mimeType, item.resource.blob, uri5);
        } else {
          details.output.push({
            type: "embed",
            uri: uri5,
            isText: "text" in item.resource,
            mimeType: item.resource.mimeType,
            value: "blob" in item.resource ? item.resource.blob : item.resource.text,
            audience,
            asResource: true
          });
          if (isForModel) {
            const permalink = invocation.context && ChatResponseResource.createUri(invocation.context.sessionResource, invocation.chatStreamToolCallId || invocation.callId, result.content.length, basename2(uri5));
            addAsLinkedResource(permalink || uri5, item.resource.mimeType);
          }
        }
      }
    }
    if (callResult.structuredContent) {
      details.output.push({ type: "embed", isText: true, value: JSON.stringify(callResult.structuredContent, null, 2), audience: [0 /* Assistant */] });
      result.content.push({ kind: "text", value: JSON.stringify(callResult.structuredContent), audience: [0 /* Assistant */] });
    }
    if (this._tool.uiResourceUri) {
      details.mcpOutput = callResult;
    }
    result.toolResultDetails = details;
    return result;
  }
};

McpToolImplementation = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IImageResizeService)
], McpToolImplementation);
export { McpLanguageModelToolContribution, McpToolImplementation };
