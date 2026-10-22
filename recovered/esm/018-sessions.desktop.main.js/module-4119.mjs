// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/processExplorer/browser/processExplorerControl.ts
import { isRemoteDiagnosticError } from "./module-1702.mjs";
import { $, append, getDocument } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ByteSize } from "./module-0269.mjs";
import { Delayer } from "./module-0036.mjs";
import { WorkbenchDataTree } from "./module-0636.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { Separator, toAction } from "./module-0082.mjs";
import { isWeb } from "./module-0014.mjs";
import { coalesce } from "./module-0007.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IProductService } from "./module-0875.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { Schemas } from "./module-0033.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { ILabelService } from "./module-0641.mjs";


// src/vs/workbench/contrib/processExplorer/browser/processExplorerControl.ts
var DEBUG_FLAGS_PATTERN = /\s--inspect(?:-brk|port)?=(?<port>\d+)?/;

var DEBUG_PORT_PATTERN = /\s--inspect-port=(?<port>\d+)/;

function isMachineProcessInformation(item) {
  const candidate = item;
  return !!candidate?.name && !!candidate?.rootProcess;
}

function isProcessInformation(item) {
  const candidate = item;
  return !!candidate?.processRoots;
}

function isProcessItem(item) {
  const candidate = item;
  return typeof candidate?.pid === "number";
}

var ProcessListDelegate = class {
  getHeight() {
    return 22;
  }
  getTemplateId(element) {
    if (isProcessItem(element)) {
      return "process";
    }
    if (isMachineProcessInformation(element)) {
      return "machine";
    }
    if (isRemoteDiagnosticError(element)) {
      return "error";
    }
    if (isProcessInformation(element)) {
      return "header";
    }
    return "";
  }
};

var ProcessTreeDataSource = class {
  hasChildren(element) {
    if (isRemoteDiagnosticError(element)) {
      return false;
    }
    if (isProcessItem(element)) {
      return !!element.children?.length;
    }
    return true;
  }
  getChildren(element) {
    if (isProcessItem(element)) {
      return element.children ?? [];
    }
    if (isRemoteDiagnosticError(element)) {
      return [];
    }
    if (isProcessInformation(element)) {
      if (element.processRoots.length > 1) {
        return element.processRoots;
      }
      if (element.processRoots.length > 0) {
        return [element.processRoots[0].rootProcess];
      }
      return [];
    }
    if (isMachineProcessInformation(element)) {
      return [element.rootProcess];
    }
    return element.processes ? [element.processes] : [];
  }
};

function createRow(container2, extraClass) {
  const row = append(container2, $(".row"));
  if (extraClass) {
    row.classList.add(extraClass);
  }
  const name = append(row, $(".cell.name"));
  const cpu = append(row, $(".cell.cpu"));
  const memory = append(row, $(".cell.memory"));
  const pid = append(row, $(".cell.pid"));
  return { name, cpu, memory, pid };
}

var ProcessHeaderTreeRenderer = class {
  constructor() {
    this.templateId = "header";
  }
  renderTemplate(container2) {
    container2.previousElementSibling?.classList.add("force-no-twistie");
    return createRow(container2, "header");
  }
  renderElement(node, index2, templateData) {
    templateData.name.textContent = localize(18416, null);
    templateData.cpu.textContent = localize(18413, null);
    templateData.pid.textContent = localize(18417, null);
    templateData.memory.textContent = localize(18415, null);
  }
  disposeTemplate(templateData) {
  }
};

var MachineRenderer = class {
  constructor() {
    this.templateId = "machine";
  }
  renderTemplate(container2) {
    return createRow(container2);
  }
  renderElement(node, index2, templateData) {
    templateData.name.textContent = node.element.name;
  }
  disposeTemplate(templateData) {
  }
};

var ErrorRenderer = class {
  constructor() {
    this.templateId = "error";
  }
  renderTemplate(container2) {
    return createRow(container2);
  }
  renderElement(node, index2, templateData) {
    templateData.name.textContent = node.element.errorMessage;
  }
  disposeTemplate(templateData) {
  }
};

var ProcessItemHover = class extends Disposable {
  constructor(container2, hoverService) {
    super();
    this.content = "";
    this.hover = this._register(hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), container2, this.content));
  }
  update(content) {
    if (this.content !== content) {
      this.content = content;
      this.hover.update(content);
    }
  }
};

ProcessItemHover = __decorateClass([
  __decorateParam(1, IHoverService)
], ProcessItemHover);

var ProcessRenderer = class {
  constructor(model, hoverService) {
    this.model = model;
    this.hoverService = hoverService;
    this.templateId = "process";
  }
  renderTemplate(container2) {
    const row = createRow(container2);
    return {
      name: row.name,
      cpu: row.cpu,
      memory: row.memory,
      pid: row.pid,
      hover: new ProcessItemHover(row.name, this.hoverService)
    };
  }
  renderElement(node, index2, templateData) {
    const { element } = node;
    const pid = element.pid.toFixed(0);
    templateData.name.textContent = this.model.getName(element.pid, element.name);
    templateData.cpu.textContent = element.load.toFixed(0);
    templateData.memory.textContent = (element.mem / ByteSize.MB).toFixed(0);
    templateData.pid.textContent = pid;
    templateData.pid.parentElement.id = `pid-${pid}`;
    templateData.hover?.update(element.cmd);
  }
  disposeTemplate(templateData) {
    templateData.hover?.dispose();
  }
};

ProcessRenderer = __decorateClass([
  __decorateParam(1, IHoverService)
], ProcessRenderer);

var ProcessAccessibilityProvider = class {
  getWidgetAriaLabel() {
    return localize(18414, null);
  }
  getAriaLabel(element) {
    if (isProcessItem(element) || isMachineProcessInformation(element)) {
      return element.name;
    }
    if (isRemoteDiagnosticError(element)) {
      return element.hostName;
    }
    return null;
  }
};

var ProcessIdentityProvider = class {
  getId(element) {
    if (isProcessItem(element)) {
      return element.pid.toString();
    }
    if (isRemoteDiagnosticError(element)) {
      return element.hostName;
    }
    if (isProcessInformation(element)) {
      return "processes";
    }
    if (isMachineProcessInformation(element)) {
      return element.name;
    }
    return "header";
  }
};

var ProcessExplorerControl = class extends Disposable {
  constructor(instantiationService, productService, contextMenuService, commandService, clipboardService) {
    super();
    this.instantiationService = instantiationService;
    this.productService = productService;
    this.contextMenuService = contextMenuService;
    this.commandService = commandService;
    this.clipboardService = clipboardService;
    this.dimensions = void 0;
    this.delayer = this._register(new Delayer(1e3));
    this.model = new ProcessExplorerModel(this.productService);
  }
  create(container2) {
    this.createProcessTree(container2);
    this.update();
  }
  createProcessTree(container2) {
    container2.classList.add("process-explorer");
    container2.id = "process-explorer";
    const renderers = [
      this.instantiationService.createInstance(ProcessRenderer, this.model),
      new ProcessHeaderTreeRenderer(),
      new MachineRenderer(),
      new ErrorRenderer()
    ];
    this.tree = this._register(this.instantiationService.createInstance(
      WorkbenchDataTree,
      "processExplorer",
      container2,
      new ProcessListDelegate(),
      renderers,
      new ProcessTreeDataSource(),
      {
        accessibilityProvider: new ProcessAccessibilityProvider(),
        identityProvider: new ProcessIdentityProvider(),
        expandOnlyOnTwistieClick: true,
        renderIndentGuides: "onHover" /* OnHover */
      }
    ));
    this._register(this.tree.onKeyDown((e4) => this.onTreeKeyDown(e4)));
    this._register(this.tree.onContextMenu((e4) => this.onTreeContextMenu(container2, e4)));
    this.tree.setInput(this.model);
    this.layoutTree();
  }
  async onTreeKeyDown(e4) {
    const event = new StandardKeyboardEvent(e4);
    if (event.keyCode === 35 /* KeyE */ && event.altKey) {
      const selectionPids = this.getSelectedPids();
      await Promise.all(selectionPids.map((pid) => this.killProcess?.(pid, "SIGTERM")));
    }
  }
  onTreeContextMenu(container2, e4) {
    if (!isProcessItem(e4.element)) {
      return;
    }
    const item = e4.element;
    const pid = Number(item.pid);
    const actions = [];
    if (typeof this.killProcess === "function") {
      actions.push(toAction({ id: "killProcess", label: localize(18412, null), run: () => this.killProcess?.(pid, "SIGTERM") }));
      actions.push(toAction({ id: "forceKillProcess", label: localize(18411, null), run: () => this.killProcess?.(pid, "SIGKILL") }));
      actions.push(new Separator());
    }
    actions.push(toAction({
      id: "copy",
      label: localize(18408, null),
      run: () => {
        const selectionPids = this.getSelectedPids();
        if (!selectionPids?.includes(pid)) {
          selectionPids.length = 0;
          selectionPids.push(pid);
        }
        const rows = selectionPids?.map((e5) => getDocument(container2).getElementById(`pid-${e5}`)).filter((e5) => !!e5);
        if (rows) {
          const text2 = rows.map((e5) => e5.innerText).filter((e5) => !!e5);
          this.clipboardService.writeText(text2.join("\n"));
        }
      }
    }));
    actions.push(toAction({
      id: "copyAll",
      label: localize(18409, null),
      run: () => {
        const processList = getDocument(container2).getElementById("process-explorer");
        if (processList) {
          this.clipboardService.writeText(processList.innerText);
        }
      }
    }));
    if (this.isDebuggable(item.cmd)) {
      actions.push(new Separator());
      actions.push(toAction({ id: "debug", label: localize(18410, null), run: () => this.attachTo(item) }));
    }
    this.contextMenuService.showContextMenu({
      getAnchor: () => e4.anchor,
      getActions: () => actions
    });
  }
  isDebuggable(cmd) {
    if (isWeb) {
      return false;
    }
    const matches2 = DEBUG_FLAGS_PATTERN.exec(cmd);
    return matches2 && matches2.groups.port !== "0" || cmd.indexOf("node ") >= 0 || cmd.indexOf("node.exe") >= 0;
  }
  attachTo(item) {
    const config = {
      type: "node",
      request: "attach",
      name: `process ${item.pid}`
    };
    let matches2 = DEBUG_FLAGS_PATTERN.exec(item.cmd);
    if (matches2) {
      config.port = Number(matches2.groups.port);
    } else {
      config.processId = String(item.pid);
    }
    matches2 = DEBUG_PORT_PATTERN.exec(item.cmd);
    if (matches2) {
      config.port = Number(matches2.groups.port);
    }
    this.commandService.executeCommand("debug.startFromConfig", config);
  }
  getSelectedPids() {
    return coalesce(this.tree?.getSelection()?.map((e4) => {
      if (!isProcessItem(e4)) {
        return void 0;
      }
      return e4.pid;
    }) ?? []);
  }
  async update() {
    const { processes, pidToNames } = await this.resolveProcesses();
    this.model.update(processes, pidToNames);
    this.tree?.updateChildren();
    this.layoutTree();
    this.delayer.trigger(() => this.update());
  }
  focus() {
    this.tree?.domFocus();
  }
  layout(dimension) {
    this.dimensions = dimension;
    this.layoutTree();
  }
  layoutTree() {
    if (this.dimensions && this.tree) {
      this.tree.layout(this.dimensions.height, this.dimensions.width);
    }
  }
};

ProcessExplorerControl = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IProductService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IClipboardService)
], ProcessExplorerControl);

var ProcessExplorerModel = class {
  constructor(productService) {
    this.productService = productService;
    this.processes = { processRoots: [] };
    this.mapPidToName = /* @__PURE__ */ new Map();
  }
  update(processRoots, pidToNames) {
    this.mapPidToName.clear();
    for (const [pid, name] of pidToNames) {
      this.mapPidToName.set(pid, name);
    }
    processRoots.forEach((info, index2) => {
      if (isProcessItem(info.rootProcess)) {
        info.rootProcess.name = index2 === 0 ? this.productService.applicationName : "remote-server";
      }
    });
    this.processes = { processRoots };
  }
  getName(pid, fallback2) {
    return this.mapPidToName.get(pid) ?? fallback2;
  }
};

ProcessExplorerModel = __decorateClass([
  __decorateParam(0, IProductService)
], ProcessExplorerModel);

var BrowserProcessExplorerControl = class extends ProcessExplorerControl {
  constructor(container2, instantiationService, productService, contextMenuService, commandService, clipboardService, remoteAgentService, labelService) {
    super(instantiationService, productService, contextMenuService, commandService, clipboardService);
    this.remoteAgentService = remoteAgentService;
    this.labelService = labelService;
    this.create(container2);
  }
  async resolveProcesses() {
    const connection = this.remoteAgentService.getConnection();
    if (!connection) {
      return { pidToNames: [], processes: [] };
    }
    const processes = [];
    const hostName = this.labelService.getHostLabel(Schemas.vscodeRemote, connection.remoteAuthority);
    const result = await this.remoteAgentService.getDiagnosticInfo({ includeProcesses: true });
    if (result) {
      if (isRemoteDiagnosticError(result)) {
        processes.push({ name: result.hostName, rootProcess: result });
      } else if (result.processes) {
        processes.push({ name: hostName, rootProcess: result.processes });
      }
    }
    return { pidToNames: [], processes };
  }
};

BrowserProcessExplorerControl = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IClipboardService),
  __decorateParam(6, IRemoteAgentService),
  __decorateParam(7, ILabelService)
], BrowserProcessExplorerControl);
export { isMachineProcessInformation, isProcessInformation, isProcessItem, createRow, DEBUG_FLAGS_PATTERN, DEBUG_PORT_PATTERN, ProcessListDelegate, ProcessTreeDataSource, ProcessHeaderTreeRenderer, MachineRenderer, ErrorRenderer, ProcessItemHover, ProcessRenderer, ProcessAccessibilityProvider, ProcessIdentityProvider, ProcessExplorerControl, ProcessExplorerModel, BrowserProcessExplorerControl };
