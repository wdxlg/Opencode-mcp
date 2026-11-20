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

// OpenCode: 工具调用翻译——把 PowerShell / bash 命令和常见工具参数翻成一句短话（参考 Arena 命令翻译 v1.2.7 的读/改/搜索分类）
function ocDescShort(p) {
  let s = String(p ?? "").trim().replace(/^["'`]+|["'`]+$/g, "");
  if (!s || /^\$|^\(|^@\(|^\{/.test(s)) return "";
  s = s.replace(/[\\/]+$/, "");
  const parts = s.split(/[\\/]/).filter(Boolean);
  let b = parts.length ? parts[parts.length - 1] : s;
  if (/^[A-Za-z]:$/.test(b)) b = b + "\\";
  if (b === "~" || b === "." ) return b;
  return b.length > 48 ? b.slice(0, 47) + "…" : b;
}
function ocDescTokens(seg) {
  const out = [];
  const re = /"((?:[^"`]|`.)*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(seg))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}
function ocDescArg(toks, names, skipVals) {
  for (let i = 1; i < toks.length - 1; i++) {
    if (names.includes(toks[i].toLowerCase())) return toks[i + 1];
  }
  for (let i = 1; i < toks.length; i++) {
    const t = toks[i];
    if (/^-/.test(t)) {
      if (skipVals && skipVals.includes(t.toLowerCase()) && i + 1 < toks.length) i++;
      continue;
    }
    if (/^[|<>&;]+$/.test(t)) break;
    return t;
  }
  return "";
}
const OC_DESC_PS = (() => {
  const m = {};
  const add = (verb, names) => names.split(" ").forEach((n) => m[n] = verb);
  add("read", "get-content gc cat type more less head tail bat");
  add("list", "get-childitem gci ls dir tree find");
  add("search", "select-string sls findstr rg grep ag");
  add("write", "set-content add-content out-file tee-object tee");
  add("del", "remove-item rm del erase rmdir rd ri unlink");
  add("copy", "copy-item cp copy cpi xcopy robocopy");
  add("move", "move-item mv move mi rename-item ren rni");
  add("mkdir", "mkdir md");
  add("check", "test-path");
  add("stat", "get-item gi get-itemproperty gp stat get-filehash certutil");
  add("net", "invoke-webrequest iwr invoke-restmethod irm curl curl.exe wget");
  add("start", "start-process start saps");
  add("proc", "get-process gps ps tasklist");
  add("kill", "stop-process kill spps taskkill");
  add("zip", "expand-archive compress-archive tar unzip zip 7z");
  add("sed", "sed awk");
  add("skip", "cd set-location sl pushd popd chdir echo write-host write-output write-verbose write-error out-null out-string select-object select sort-object sort measure-object where-object where foreach-object % ? format-table ft format-list fl convertto-json convertfrom-json get-date start-sleep sleep clear cls exit return param try catch finally if else elseif foreach for while new-object get-location pwd join-path split-path resolve-path true false export import");
  return m;
})();
function ocDescSegment(seg, acts, vars) {
  seg = seg.trim().replace(/^[&.]\s+/, "");
  if (!seg || seg.startsWith("#")) return;
  // .NET 文件读写
  let mm = /\[(?:System\.)?IO\.File\]::(ReadAll\w*|WriteAll\w*|AppendAll\w*|Exists|Delete|Copy|Move)\(\s*["']?([^"',)]*)/i.exec(seg);
  if (mm) {
    const f = ocDescShort(mm[2]);
    const k = mm[1].toLowerCase();
    acts.push(k.startsWith("read") ? ["读", f] : k === "exists" ? ["检查", f] : k === "delete" ? ["删除", f] : k === "copy" ? ["复制", f] : k === "move" ? ["移动", f] : ["写", f]);
    return;
  }
  const redir = /(?:^|[^2])>>?\s*["']?([^\s"'|;&]+)/.exec(seg);
  const toks = ocDescTokens(seg.replace(/^\$\w+\s*=\s*/, ""));
  if (!toks.length) return;
  let cmd = toks[0].replace(/^.*[\\/]/, "").toLowerCase();
  if (cmd.endsWith(".exe")) cmd = cmd.slice(0, -4);
  const verb = OC_DESC_PS[cmd];
  const rawPath = () => ocDescArg(toks, ["-path", "-literalpath", "-filepath", "-p"], ["-encoding", "-tail", "-totalcount", "-first", "-head", "-n", "-filter", "-include", "-exclude", "-depth", "-raw"]);
  const pathArg = () => {
    const raw = rawPath();
    const v = /^\$(\w+)$/.exec(raw || "");
    if (v && vars && vars.has(v[1].toLowerCase())) return vars.get(v[1].toLowerCase());
    return ocDescShort(raw);
  };
  if (verb === "read") { const f = pathArg(); if (f) acts.push(["读", f]); }
  else if (verb === "list") acts.push([toks.some((t) => /^-r(ecurse)?$/i.test(t)) ? "遍历" : "列出", rawPath() ? pathArg() : "当前目录"]);
  else if (verb === "search") {
    const pat = ocDescArg(toks, ["-pattern", "-e"], ["-path", "-literalpath", "-g", "--glob", "-t", "--type", "-c", "-a", "-b", "-m", "--max-count"]);
    acts.push(["搜索", pat ? "“" + (pat.length > 30 ? pat.slice(0, 29) + "…" : pat) + "”" : ""]);
  } else if (verb === "write") acts.push(["写", pathArg()]);
  else if (verb === "del") acts.push(["删除", pathArg()]);
  else if (verb === "copy") acts.push(["复制", pathArg()]);
  else if (verb === "move") acts.push([/^ren|rename/.test(cmd) ? "重命名" : "移动", pathArg()]);
  else if (verb === "mkdir") acts.push(["新建目录", pathArg()]);
  else if (cmd === "new-item" || cmd === "ni") acts.push([toks.some((t) => /^director/i.test(t)) ? "新建目录" : "新建", pathArg()]);
  else if (verb === "check") acts.push(["检查", pathArg()]);
  else if (verb === "stat") acts.push(["查看", pathArg()]);
  else if (verb === "net") {
    const u = toks.find((t) => /^https?:\/\//i.test(t)) || "";
    const h = /^https?:\/\/([^/?#]+)/i.exec(u);
    acts.push(["请求", h ? h[1] : ""]);
  } else if (verb === "start") acts.push(["启动", pathArg()]);
  else if (verb === "proc") acts.push(["查看进程", ""]);
  else if (verb === "kill") acts.push(["结束进程", ""]);
  else if (verb === "zip") acts.push([/expand|unzip|-x/.test(seg.toLowerCase()) ? "解压" : "压缩", pathArg()]);
  else if (verb === "sed") acts.push([/\s-i\b/.test(seg) ? "改" : "读", ocDescShort(toks[toks.length - 1])]);
  else if (cmd === "git") acts.push(["git " + (toks.slice(1).find((t) => !t.startsWith("-") && !/^-c$/.test(t)) || ""), ""]);
  else if (["npm", "pnpm", "yarn", "npx", "bun", "dotnet", "cargo", "go", "pip", "pip3", "msbuild", "csc", "cmake", "make", "winget", "choco", "scoop"].includes(cmd)) {
    const words = toks.slice(1).filter((t) => !t.startsWith("-"));
    acts.push([cmd + " " + (words[0] === "run" || words[0] === "exec" ? words.slice(0, 2).join(" ") : words[0] || ""), ""]);
  }
  else if (["node", "python", "python3", "py", "deno", "pwsh", "powershell", "bash", "sh", "cmd"].includes(cmd)) {
    const script = toks.slice(1).find((t) => !t.startsWith("-") && /\.\w{1,5}$/.test(t));
    if (script) acts.push(["运行", ocDescShort(script)]);
    else if (toks.some((t) => /^(-c|-e|-command|--eval|\/c)$/i.test(t))) acts.push(["运行 " + cmd + " 脚本", ""]);
    else acts.push(["运行", cmd]);
  } else if (verb === "skip" || /^\$|^\[|^\(|^\{|^\}|^@/.test(toks[0])) {
    // 不单独显示
  } else if (/^[a-z][\w.-]*$/i.test(cmd)) acts.push(["运行", toks[0].replace(/^.*[\\/]/, "")]);
  if (redir && verb !== "write" && !/^(\$null|null|nul|&1|&2)$/i.test(redir[1])) acts.push(["写", ocDescShort(redir[1])]);
}
function ocDescribeCommand(command) {
  const acts = [];
  const text = String(command || "").replace(/`\r?\n/g, " ");
  const vars = new Map();
  const asg = /\$(\w+)\s*=\s*(@\(([^)]*)\)|"[^"]*"|'[^']*')/g;
  let am;
  while ((am = asg.exec(text))) {
    const lits = (am[3] ?? am[2]).match(/"[^"]*"|'[^']*'/g) || [];
    const names = lits.map((x) => ocDescShort(x.slice(1, -1).replace(/\$env:\w+/gi, ""))).filter(Boolean);
    if (names.length) vars.set(am[1].toLowerCase(), names.length > 2 ? names.slice(0, 2).join("、") + " 等 " + names.length + " 个" : names.join("、"));
  }
  const loopVar = /foreach\s*\(\s*\$(\w+)\s+in\s+\$(\w+)\s*\)/gi;
  while ((am = loopVar.exec(text))) if (vars.has(am[2].toLowerCase())) vars.set(am[1].toLowerCase(), vars.get(am[2].toLowerCase()));
  for (const line of text.split(/\r?\n|[{}]/)) {
    for (let seg of line.split(/\s*(?:;|&&|\|\||\|)\s*/)) {
      const kw = /^\s*(?:if|elseif|while|foreach|for|switch)\s*\((.*)\)\s*$/i.exec(seg);
      if (kw) seg = kw[1].replace(/^\$\w+\s+in\s+/i, "");
      try { ocDescSegment(seg, acts, vars); } catch { }
    }
  }
  return acts;
}
function ocDescJoin(acts) {
  const seen = new Set();
  const groups = new Map();
  for (const [verb, obj] of acts) {
    const key = verb + "\0" + obj;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!groups.has(verb)) groups.set(verb, []);
    if (obj) groups.get(verb).push(obj);
  }
  const parts = [];
  for (const [verb, objs] of groups) {
    if (!objs.length) parts.push(verb);
    else if (objs.length <= 2) parts.push(verb + " " + objs.join("、"));
    else parts.push(verb + " " + objs.slice(0, 2).join("、") + " 等 " + objs.length + " 个");
  }
  if (!parts.length) return "";
  return parts.length > 3 ? parts.slice(0, 3).join(" · ") + " 等" : parts.join(" · ");
}
// 返回一句短话；认不出时返回 undefined（沿用原来的「正在运行 X」）
function ocDescribeToolCall(toolName, input) {
  try {
    if (typeof input === "string") {
      try { input = JSON.parse(input); } catch { input = { command: input }; }
    }
    if (!input || typeof input !== "object") return void 0;
    const name = String(toolName || "").toLowerCase();
    const cmd = input.command ?? input.cmd ?? input.script ?? input.commandLine;
    if (typeof cmd === "string" && cmd.trim()) {
      const s = ocDescJoin(ocDescribeCommand(cmd));
      if (s) return s;
      const first = cmd.trim().split(/\r?\n/)[0];
      return "运行 " + (first.length > 40 ? first.slice(0, 39) + "…" : first);
    }
    const mode = String(input.mode ?? input.action ?? input.operation ?? "").toLowerCase();
    const p = ocDescShort(input.path ?? input.file ?? input.filePath ?? input.file_path ?? input.target ?? input.directory ?? input.dir ?? "");
    const q = input.query ?? input.pattern ?? input.regex ?? input.search;
    const verbs = { list: "列出", ls: "列出", tree: "遍历", read: "读", view: "读", cat: "读", write: "写", create: "新建", append: "追加", edit: "改", replace: "改", patch: "改", delete: "删除", remove: "删除", copy: "复制", move: "移动", rename: "重命名", search: "搜索", find: "搜索", grep: "搜索", info: "查看", stat: "查看", exists: "检查", mkdir: "新建目录" };
    let verb = verbs[mode];
    if (!verb) {
      for (const k of Object.keys(verbs)) {
        if (new RegExp("(^|[_\\-.])" + k + "($|[_\\-.]|file|dir)", "i").test(name)) { verb = verbs[k]; break; }
      }
    }
    if (verb === "搜索" || (!verb && typeof q === "string" && q)) {
      const qs = typeof q === "string" && q ? "“" + (q.length > 30 ? q.slice(0, 29) + "…" : q) + "”" : "";
      return ["搜索", qs + (p ? "（" + p + "）" : "")].filter(Boolean).join(" ");
    }
    if (verb && p) return verb + " " + p;
    const url = input.url ?? input.uri;
    if (typeof url === "string") {
      const h = /^https?:\/\/([^/?#]+)/i.exec(url);
      if (h) return "请求 " + h[1];
    }
    return void 0;
  } catch {
    return void 0;
  }
}

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
    // OpenCode: MCP 工具（如 Windows-MCP 的 PowerShell / FileSystem）按参数翻成一句短话，不再全是「正在运行 PowerShell」
    const ocDesc = ocDescribeToolCall(tool.definition.name, context2.parameters);
    return {
      confirmationMessages: confirm,
      invocationMessage: ocDesc ? new MarkdownString().appendText(`${ocDesc}…`) : new MarkdownString(localize(17157, null, title)),
      pastTenseMessage: ocDesc ? new MarkdownString().appendText(ocDesc) : new MarkdownString(localize(17156, null, title)),
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
