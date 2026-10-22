// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/disassemblyView.ts
import { localize } from "./module-0001.mjs";
import { EditorPane } from "./module-1089.mjs";
import { CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST, DISASSEMBLY_VIEW_ID, IDebugService } from "./module-1057.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { Emitter } from "./module-0017.mjs";
import { createBareFontInfoFromRawSettings } from "./module-0220.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { WorkbenchTable } from "./module-0636.mjs";
import { editorBackground } from "./module-0229.mjs";
import { InstructionBreakpoint } from "./module-1064.mjs";
import { Range2 } from "./module-0106.mjs";
import { binarySearch2 } from "./module-0007.mjs";
import { isUriString, sourcesEqual } from "./module-1059.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { breakpoint, debugBreakpointHint, debugStackframe, debugStackframeFocused } from "./module-1891.mjs";
import { $, addStandardDisposableListener, append } from "./module-0075.mjs";
import { Disposable, dispose } from "./module-0012.mjs";
import { focusedStackFrameColor, topStackFrameColor } from "./module-2451.mjs";
import { StringBuilder } from "./module-0127.mjs";
import { URI } from "./module-0032.mjs";
import { isAbsolute } from "./module-0026.mjs";
import { getUriFromSource } from "./module-1061.mjs";
import { applyFontInfo } from "./module-0213.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { COPY_ADDRESS_ID, COPY_ADDRESS_LABEL } from "./module-2406.mjs";
import { IClipboardService } from "./module-0487.mjs";


// src/vs/workbench/contrib/debug/browser/disassemblyView.ts
var disassemblyNotAvailable = {
  allowBreakpoint: false,
  isBreakpointSet: false,
  isBreakpointEnabled: false,
  instructionReference: "",
  instructionOffset: 0,
  instructionReferenceOffset: 0,
  address: 0n,
  instruction: {
    address: "-1",
    instruction: localize(14599, null)
  }
};

var DisassemblyView = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, _configurationService, _instantiationService, _debugService, _contextMenuService, menuService, contextKeyService) {
    super(DISASSEMBLY_VIEW_ID, group2, telemetryService, themeService, storageService);
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._debugService = _debugService;
    this._contextMenuService = _contextMenuService;
    this._instructionBpList = [];
    this._enableSourceCodeRender = true;
    this._loadingLock = false;
    this._referenceToMemoryAddress = /* @__PURE__ */ new Map();
    this.menu = menuService.createMenu(MenuId.DebugDisassemblyContext, contextKeyService);
    this._register(this.menu);
    this._disassembledInstructions = void 0;
    this._onDidChangeStackFrame = this._register(new Emitter({ leakWarningThreshold: 1e3, leakWarningName: "DisassemblyView._onDidChangeStackFrame" }));
    this._previousDebuggingState = _debugService.state;
    this._register(_configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("debug")) {
        const newValue = this._configurationService.getValue("debug").disassemblyView.showSourceCode;
        if (this._enableSourceCodeRender !== newValue) {
          this._enableSourceCodeRender = newValue;
        } else {
          this._disassembledInstructions?.rerender();
        }
      }
    }));
  }
  static {
    this.NUM_INSTRUCTIONS_TO_LOAD = 50;
  }
  get fontInfo() {
    if (!this._fontInfo) {
      this._fontInfo = this.createFontInfo();
      this._register(this._configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("editor")) {
          this._fontInfo = this.createFontInfo();
        }
      }));
    }
    return this._fontInfo;
  }
  createFontInfo() {
    return createBareFontInfoFromRawSettings(this._configurationService.getValue("editor"), PixelRatio.getInstance(this.window).value);
  }
  get currentInstructionAddresses() {
    return this._debugService.getModel().getSessions(false).map((session) => session.getAllThreads()).reduce((prev, curr) => prev.concat(curr), []).map((thread) => thread.getTopStackFrame()).map((frame) => frame?.instructionPointerReference).map((ref) => ref ? this.getReferenceAddress(ref) : void 0);
  }
  // Instruction reference of the top stack frame of the focused stack
  get focusedCurrentInstructionReference() {
    return this._debugService.getViewModel().focusedStackFrame?.thread.getTopStackFrame()?.instructionPointerReference;
  }
  get focusedCurrentInstructionAddress() {
    const ref = this.focusedCurrentInstructionReference;
    return ref ? this.getReferenceAddress(ref) : void 0;
  }
  get focusedInstructionReference() {
    return this._debugService.getViewModel().focusedStackFrame?.instructionPointerReference;
  }
  get focusedInstructionAddress() {
    const ref = this.focusedInstructionReference;
    return ref ? this.getReferenceAddress(ref) : void 0;
  }
  get isSourceCodeRender() {
    return this._enableSourceCodeRender;
  }
  get debugSession() {
    return this._debugService.getViewModel().focusedSession;
  }
  get onDidChangeStackFrame() {
    return this._onDidChangeStackFrame.event;
  }
  get focusedAddressAndOffset() {
    const element = this._disassembledInstructions?.getFocusedElements()[0];
    if (!element) {
      return void 0;
    }
    return this.getAddressAndOffset(element);
  }
  getAddressAndOffset(element) {
    const reference = element.instructionReference;
    const offset = Number(element.address - this.getReferenceAddress(reference));
    return { reference, offset, address: element.address };
  }
  createEditor(parent) {
    this._enableSourceCodeRender = this._configurationService.getValue("debug").disassemblyView.showSourceCode;
    const lineHeight = this.fontInfo.lineHeight;
    const thisOM = this;
    const delegate = new class {
      constructor() {
        this.headerRowHeight = 0;
      }
      // No header
      getHeight(row) {
        if (thisOM.isSourceCodeRender && row.showSourceLocation && row.instruction.location?.path && row.instruction.line) {
          if (row.instruction.endLine) {
            return lineHeight * Math.max(2, row.instruction.endLine - row.instruction.line + 2);
          } else {
            return lineHeight * 2;
          }
        }
        return lineHeight;
      }
    }();
    const instructionRenderer = this._register(this._instantiationService.createInstance(InstructionRenderer, this));
    this._disassembledInstructions = this._register(this._instantiationService.createInstance(
      WorkbenchTable,
      "DisassemblyView",
      parent,
      delegate,
      [
        {
          label: "",
          tooltip: "",
          weight: 0,
          minimumWidth: this.fontInfo.lineHeight,
          maximumWidth: this.fontInfo.lineHeight,
          templateId: BreakpointRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        },
        {
          label: localize(14594, null),
          tooltip: "",
          weight: 0.3,
          templateId: InstructionRenderer.TEMPLATE_ID,
          project(row) {
            return row;
          }
        }
      ],
      [
        this._instantiationService.createInstance(BreakpointRenderer, this),
        instructionRenderer
      ],
      {
        identityProvider: { getId: (e) => e.instruction.address },
        horizontalScrolling: false,
        overrideStyles: {
          listBackground: editorBackground
        },
        multipleSelectionSupport: false,
        setRowLineHeight: false,
        openOnSingleClick: false,
        accessibilityProvider: new AccessibilityProvider3(),
        mouseSupport: false
      }
    ));
    this._disassembledInstructions.domNode.classList.add("disassembly-view");
    if (this.focusedInstructionReference) {
      this.reloadDisassembly(this.focusedInstructionReference, 0);
    }
    this._register(this._disassembledInstructions.onDidScroll((e) => {
      if (this._disassembledInstructions?.row(0) === disassemblyNotAvailable) {
        return;
      }
      if (this._loadingLock) {
        return;
      }
      if (e.oldScrollTop > e.scrollTop && e.scrollTop < e.height) {
        this._loadingLock = true;
        const prevTop = Math.floor(e.scrollTop / this.fontInfo.lineHeight);
        this.scrollUp_LoadDisassembledInstructions(DisassemblyView.NUM_INSTRUCTIONS_TO_LOAD).then((loaded) => {
          if (loaded > 0) {
            this._disassembledInstructions.reveal(prevTop + loaded, 0);
          }
        }).finally(() => {
          this._loadingLock = false;
        });
      } else if (e.oldScrollTop < e.scrollTop && e.scrollTop + e.height > e.scrollHeight - e.height) {
        this._loadingLock = true;
        this.scrollDown_LoadDisassembledInstructions(DisassemblyView.NUM_INSTRUCTIONS_TO_LOAD).finally(() => {
          this._loadingLock = false;
        });
      }
    }));
    this._register(this._disassembledInstructions.onContextMenu((e) => this.onContextMenu(e)));
    this._register(this._debugService.getViewModel().onDidFocusStackFrame(({ stackFrame }) => {
      if (this._disassembledInstructions && stackFrame?.instructionPointerReference) {
        this.goToInstructionAndOffset(stackFrame.instructionPointerReference, 0);
      }
      this._onDidChangeStackFrame.fire();
    }));
    this._register(this._debugService.getModel().onDidChangeBreakpoints((bpEvent) => {
      if (bpEvent && this._disassembledInstructions) {
        let changed = false;
        bpEvent.added?.forEach((bp) => {
          if (bp instanceof InstructionBreakpoint) {
            const index2 = this.getIndexFromReferenceAndOffset(bp.instructionReference, bp.offset);
            if (index2 >= 0) {
              this._disassembledInstructions.row(index2).isBreakpointSet = true;
              this._disassembledInstructions.row(index2).isBreakpointEnabled = bp.enabled;
              changed = true;
            }
          }
        });
        bpEvent.removed?.forEach((bp) => {
          if (bp instanceof InstructionBreakpoint) {
            const index2 = this.getIndexFromReferenceAndOffset(bp.instructionReference, bp.offset);
            if (index2 >= 0) {
              this._disassembledInstructions.row(index2).isBreakpointSet = false;
              changed = true;
            }
          }
        });
        bpEvent.changed?.forEach((bp) => {
          if (bp instanceof InstructionBreakpoint) {
            const index2 = this.getIndexFromReferenceAndOffset(bp.instructionReference, bp.offset);
            if (index2 >= 0) {
              if (this._disassembledInstructions.row(index2).isBreakpointEnabled !== bp.enabled) {
                this._disassembledInstructions.row(index2).isBreakpointEnabled = bp.enabled;
                changed = true;
              }
            }
          }
        });
        this._instructionBpList = this._debugService.getModel().getInstructionBreakpoints();
        for (const bp of this._instructionBpList) {
          this.primeMemoryReference(bp.instructionReference);
        }
        if (changed) {
          this._onDidChangeStackFrame.fire();
        }
      }
    }));
    this._register(this._debugService.onDidChangeState((e) => {
      if ((e === 3 /* Running */ || e === 2 /* Stopped */) && (this._previousDebuggingState !== 3 /* Running */ && this._previousDebuggingState !== 2 /* Stopped */)) {
        this.clear();
        this._enableSourceCodeRender = this._configurationService.getValue("debug").disassemblyView.showSourceCode;
      }
      this._previousDebuggingState = e;
      this._onDidChangeStackFrame.fire();
    }));
  }
  layout(dimension) {
    this._disassembledInstructions?.layout(dimension.height);
  }
  async goToInstructionAndOffset(instructionReference, offset, focus) {
    let addr = this._referenceToMemoryAddress.get(instructionReference);
    if (addr === void 0) {
      await this.loadDisassembledInstructions(instructionReference, 0, -DisassemblyView.NUM_INSTRUCTIONS_TO_LOAD, DisassemblyView.NUM_INSTRUCTIONS_TO_LOAD * 2);
      addr = this._referenceToMemoryAddress.get(instructionReference);
    }
    if (addr) {
      this.goToAddress(addr + BigInt(offset), focus);
    }
  }
  /** Gets the address associated with the instruction reference. */
  getReferenceAddress(instructionReference) {
    return this._referenceToMemoryAddress.get(instructionReference);
  }
  /**
   * Go to the address provided. If no address is provided, reveal the address of the currently focused stack frame. Returns false if that address is not available.
   */
  goToAddress(address, focus) {
    if (!this._disassembledInstructions) {
      return false;
    }
    if (!address) {
      return false;
    }
    const index2 = this.getIndexFromAddress(address);
    if (index2 >= 0) {
      this._disassembledInstructions.reveal(index2);
      if (focus) {
        this._disassembledInstructions.domFocus();
        this._disassembledInstructions.setFocus([index2]);
      }
      return true;
    }
    return false;
  }
  async scrollUp_LoadDisassembledInstructions(instructionCount) {
    const first2 = this._disassembledInstructions?.row(0);
    if (first2) {
      return this.loadDisassembledInstructions(
        first2.instructionReference,
        first2.instructionReferenceOffset,
        first2.instructionOffset - instructionCount,
        instructionCount
      );
    }
    return 0;
  }
  async scrollDown_LoadDisassembledInstructions(instructionCount) {
    const last = this._disassembledInstructions?.row(this._disassembledInstructions?.length - 1);
    if (last) {
      return this.loadDisassembledInstructions(
        last.instructionReference,
        last.instructionReferenceOffset,
        last.instructionOffset + 1,
        instructionCount
      );
    }
    return 0;
  }
  /**
   * Sets the memory reference address. We don't just loadDisassembledInstructions
   * for this, since we can't really deal with discontiguous ranges (we can't
   * detect _if_ a range is discontiguous since we don't know how much memory
   * comes between instructions.)
   */
  async primeMemoryReference(instructionReference) {
    if (this._referenceToMemoryAddress.has(instructionReference)) {
      return true;
    }
    const s = await this.debugSession?.disassemble(instructionReference, 0, 0, 1);
    if (s && s.length > 0) {
      try {
        this._referenceToMemoryAddress.set(instructionReference, BigInt(s[0].address));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
  /** Loads disasembled instructions. Returns the number of instructions that were loaded. */
  async loadDisassembledInstructions(instructionReference, offset, instructionOffset, instructionCount) {
    const session = this.debugSession;
    const resultEntries = await session?.disassemble(instructionReference, offset, instructionOffset, instructionCount);
    if (!this._referenceToMemoryAddress.has(instructionReference) && instructionOffset !== 0) {
      await this.loadDisassembledInstructions(instructionReference, 0, 0, DisassemblyView.NUM_INSTRUCTIONS_TO_LOAD);
    }
    if (session && resultEntries && this._disassembledInstructions) {
      const newEntries = [];
      let lastLocation;
      let lastLine;
      for (let i2 = 0; i2 < resultEntries.length; i2++) {
        const instruction = resultEntries[i2];
        const thisInstructionOffset = instructionOffset + i2;
        if (instruction.location) {
          lastLocation = instruction.location;
          lastLine = void 0;
        }
        if (instruction.line) {
          const currentLine = {
            startLineNumber: instruction.line,
            startColumn: instruction.column ?? 0,
            endLineNumber: instruction.endLine ?? instruction.line,
            endColumn: instruction.endColumn ?? 0
          };
          if (!Range2.equalsRange(currentLine, lastLine ?? null)) {
            lastLine = currentLine;
            instruction.location = lastLocation;
          }
        }
        let address;
        try {
          address = BigInt(instruction.address);
        } catch {
          console.error(`Could not parse disassembly address ${instruction.address} (in ${JSON.stringify(instruction)})`);
          continue;
        }
        if (address === -1n) {
          continue;
        }
        const entry = {
          allowBreakpoint: true,
          isBreakpointSet: false,
          isBreakpointEnabled: false,
          instructionReference,
          instructionReferenceOffset: offset,
          instructionOffset: thisInstructionOffset,
          instruction,
          address
        };
        newEntries.push(entry);
        if (offset === 0 && thisInstructionOffset === 0) {
          this._referenceToMemoryAddress.set(instructionReference, address);
        }
      }
      if (newEntries.length === 0) {
        return 0;
      }
      const refBaseAddress = this._referenceToMemoryAddress.get(instructionReference);
      const bps = this._instructionBpList.map((p) => {
        const base = this._referenceToMemoryAddress.get(p.instructionReference);
        if (!base) {
          return void 0;
        }
        return {
          enabled: p.enabled,
          address: base + BigInt(p.offset || 0)
        };
      });
      if (refBaseAddress !== void 0) {
        for (const entry of newEntries) {
          const bp = bps.find((p) => p?.address === entry.address);
          if (bp) {
            entry.isBreakpointSet = true;
            entry.isBreakpointEnabled = bp.enabled;
          }
        }
      }
      const da = this._disassembledInstructions;
      if (da.length === 1 && this._disassembledInstructions.row(0) === disassemblyNotAvailable) {
        da.splice(0, 1);
      }
      const firstAddr = newEntries[0].address;
      const lastAddr = newEntries[newEntries.length - 1].address;
      const startN = binarySearch2(da.length, (i2) => Number(da.row(i2).address - firstAddr));
      const start = startN < 0 ? ~startN : startN;
      const endN = binarySearch2(da.length, (i2) => Number(da.row(i2).address - lastAddr));
      const end = endN < 0 ? ~endN : endN + 1;
      const toDelete = end - start;
      let lastLocated;
      for (let i2 = start - 1; i2 >= 0; i2--) {
        const { instruction } = da.row(i2);
        if (instruction.location && instruction.line !== void 0) {
          lastLocated = instruction;
          break;
        }
      }
      const shouldShowLocation = (instruction) => instruction.line !== void 0 && instruction.location !== void 0 && (!lastLocated || !sourcesEqual(instruction.location, lastLocated.location) || instruction.line !== lastLocated.line);
      for (const entry of newEntries) {
        if (shouldShowLocation(entry.instruction)) {
          entry.showSourceLocation = true;
          lastLocated = entry.instruction;
        }
      }
      da.splice(start, toDelete, newEntries);
      return newEntries.length - toDelete;
    }
    return 0;
  }
  getIndexFromReferenceAndOffset(instructionReference, offset) {
    const addr = this._referenceToMemoryAddress.get(instructionReference);
    if (addr === void 0) {
      return -1;
    }
    return this.getIndexFromAddress(addr + BigInt(offset));
  }
  getIndexFromAddress(address) {
    const disassembledInstructions = this._disassembledInstructions;
    if (disassembledInstructions && disassembledInstructions.length > 0) {
      return binarySearch2(disassembledInstructions.length, (index2) => {
        const row = disassembledInstructions.row(index2);
        return Number(row.address - address);
      });
    }
    return -1;
  }
  /**
   * Clears the table and reload instructions near the target address
   */
  reloadDisassembly(instructionReference, offset) {
    if (!this._disassembledInstructions) {
      return;
    }
    this._loadingLock = true;
    this.clear();
    this._instructionBpList = this._debugService.getModel().getInstructionBreakpoints();
    this.loadDisassembledInstructions(instructionReference, offset, -DisassemblyView.NUM_INSTRUCTIONS_TO_LOAD * 4, DisassemblyView.NUM_INSTRUCTIONS_TO_LOAD * 8).then(() => {
      if (this._disassembledInstructions.length > 0) {
        let targetIndex = void 0;
        const refBaseAddress = this._referenceToMemoryAddress.get(instructionReference);
        if (refBaseAddress !== void 0) {
          const da = this._disassembledInstructions;
          targetIndex = binarySearch2(da.length, (i2) => Number(da.row(i2).address - refBaseAddress));
          if (targetIndex < 0) {
            targetIndex = ~targetIndex;
          }
        }
        if (targetIndex === void 0) {
          targetIndex = Math.floor(this._disassembledInstructions.length / 2);
        }
        this._disassembledInstructions.reveal(targetIndex, 0.5);
        this._disassembledInstructions.domFocus();
        this._disassembledInstructions.setFocus([targetIndex]);
      }
      this._loadingLock = false;
    });
  }
  clear() {
    this._referenceToMemoryAddress.clear();
    this._disassembledInstructions?.splice(0, this._disassembledInstructions.length, [disassemblyNotAvailable]);
  }
  onContextMenu(e) {
    const actions = getFlatContextMenuActions(this.menu.getActions({ shouldForwardArgs: true }));
    this._contextMenuService.showContextMenu({
      getAnchor: () => e.anchor,
      getActions: () => actions,
      getActionsContext: () => e.element
    });
  }
};

DisassemblyView = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IDebugService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IMenuService),
  __decorateParam(9, IContextKeyService)
], DisassemblyView);

var BreakpointRenderer = class {
  constructor(_disassemblyView, _debugService) {
    this._disassemblyView = _disassemblyView;
    this._debugService = _debugService;
    this.templateId = BreakpointRenderer.TEMPLATE_ID;
    this._breakpointIcon = "codicon-" + breakpoint.regular.id;
    this._breakpointDisabledIcon = "codicon-" + breakpoint.disabled.id;
    this._breakpointHintIcon = "codicon-" + debugBreakpointHint.id;
    this._debugStackframe = "codicon-" + debugStackframe.id;
    this._debugStackframeFocused = "codicon-" + debugStackframeFocused.id;
  }
  static {
    this.TEMPLATE_ID = "breakpoint";
  }
  renderTemplate(container3) {
    container3.style.alignSelf = "flex-end";
    const icon2 = append(container3, $(".codicon"));
    icon2.style.display = "flex";
    icon2.style.alignItems = "center";
    icon2.style.justifyContent = "center";
    icon2.style.height = this._disassemblyView.fontInfo.lineHeight + "px";
    const currentElement = { element: void 0 };
    const disposables = [
      this._disassemblyView.onDidChangeStackFrame(() => this.rerenderDebugStackframe(icon2, currentElement.element)),
      addStandardDisposableListener(container3, "mouseover", () => {
        if (currentElement.element?.allowBreakpoint) {
          icon2.classList.add(this._breakpointHintIcon);
        }
      }),
      addStandardDisposableListener(container3, "mouseout", () => {
        if (currentElement.element?.allowBreakpoint) {
          icon2.classList.remove(this._breakpointHintIcon);
        }
      }),
      addStandardDisposableListener(container3, "click", () => {
        if (currentElement.element?.allowBreakpoint) {
          icon2.classList.add(this._breakpointHintIcon);
          const reference = currentElement.element.instructionReference;
          const address = currentElement.element.address;
          const offset = Number(address - this._disassemblyView.getReferenceAddress(reference));
          if (currentElement.element.isBreakpointSet) {
            this._debugService.removeInstructionBreakpoints(reference, offset, address);
          } else if (currentElement.element.allowBreakpoint && !currentElement.element.isBreakpointSet) {
            this._debugService.addInstructionBreakpoint({ instructionReference: reference, offset, address, canPersist: false });
          }
        }
      })
    ];
    return { currentElement, icon: icon2, disposables };
  }
  renderElement(element, index2, templateData) {
    templateData.currentElement.element = element;
    this.rerenderDebugStackframe(templateData.icon, element);
  }
  disposeTemplate(templateData) {
    dispose(templateData.disposables);
    templateData.disposables = [];
  }
  rerenderDebugStackframe(icon2, element) {
    if (element?.address === this._disassemblyView.focusedCurrentInstructionAddress) {
      icon2.classList.add(this._debugStackframe);
    } else if (element?.address === this._disassemblyView.focusedInstructionAddress) {
      icon2.classList.add(this._debugStackframeFocused);
    } else {
      icon2.classList.remove(this._debugStackframe);
      icon2.classList.remove(this._debugStackframeFocused);
    }
    icon2.classList.remove(this._breakpointHintIcon);
    if (element?.isBreakpointSet) {
      if (element.isBreakpointEnabled) {
        icon2.classList.add(this._breakpointIcon);
        icon2.classList.remove(this._breakpointDisabledIcon);
      } else {
        icon2.classList.remove(this._breakpointIcon);
        icon2.classList.add(this._breakpointDisabledIcon);
      }
    } else {
      icon2.classList.remove(this._breakpointIcon);
      icon2.classList.remove(this._breakpointDisabledIcon);
    }
  }
};

BreakpointRenderer = __decorateClass([
  __decorateParam(1, IDebugService)
], BreakpointRenderer);

var InstructionRenderer = class extends Disposable {
  constructor(_disassemblyView, themeService, editorService, textModelService, uriService, logService) {
    super();
    this._disassemblyView = _disassemblyView;
    this.editorService = editorService;
    this.textModelService = textModelService;
    this.uriService = uriService;
    this.logService = logService;
    this.templateId = InstructionRenderer.TEMPLATE_ID;
    this._topStackFrameColor = themeService.getColorTheme().getColor(topStackFrameColor);
    this._focusedStackFrameColor = themeService.getColorTheme().getColor(focusedStackFrameColor);
    this._register(themeService.onDidColorThemeChange((e) => {
      this._topStackFrameColor = e.getColor(topStackFrameColor);
      this._focusedStackFrameColor = e.getColor(focusedStackFrameColor);
    }));
  }
  static {
    this.TEMPLATE_ID = "instruction";
  }
  static {
    this.INSTRUCTION_ADDR_MIN_LENGTH = 25;
  }
  static {
    this.INSTRUCTION_BYTES_MIN_LENGTH = 30;
  }
  renderTemplate(container3) {
    const sourcecode = append(container3, $(".sourcecode"));
    const instruction = append(container3, $(".instruction"));
    this.applyFontInfo(sourcecode);
    this.applyFontInfo(instruction);
    const currentElement = { element: void 0 };
    const cellDisposable = [];
    const disposables = [
      this._disassemblyView.onDidChangeStackFrame(() => this.rerenderBackground(instruction, sourcecode, currentElement.element)),
      addStandardDisposableListener(sourcecode, "dblclick", () => this.openSourceCode(currentElement.element?.instruction))
    ];
    return { currentElement, instruction, sourcecode, cellDisposable, disposables };
  }
  renderElement(element, index2, templateData) {
    this.renderElementInner(element, index2, templateData);
  }
  async renderElementInner(element, index2, templateData) {
    templateData.currentElement.element = element;
    const instruction = element.instruction;
    templateData.sourcecode.innerText = "";
    const sb = new StringBuilder(1e3);
    if (this._disassemblyView.isSourceCodeRender && element.showSourceLocation && instruction.location?.path && instruction.line !== void 0) {
      const sourceURI = this.getUriFromSource(instruction);
      if (sourceURI) {
        let textModel = void 0;
        const sourceSB = new StringBuilder(1e4);
        const ref = await this.textModelService.createModelReference(sourceURI);
        if (templateData.currentElement.element !== element) {
          ref.dispose();
          return;
        }
        textModel = ref.object.textEditorModel;
        templateData.cellDisposable.push(ref);
        if (textModel && templateData.currentElement.element === element) {
          let lineNumber = instruction.line;
          while (lineNumber && lineNumber >= 1 && lineNumber <= textModel.getLineCount()) {
            const lineContent = textModel.getLineContent(lineNumber);
            sourceSB.appendString(`  ${lineNumber}: `);
            sourceSB.appendString(lineContent + "\n");
            if (instruction.endLine && lineNumber < instruction.endLine) {
              lineNumber++;
              continue;
            }
            break;
          }
          templateData.sourcecode.innerText = sourceSB.build();
        }
      }
    }
    let spacesToAppend = 10;
    if (instruction.address !== "-1") {
      sb.appendString(instruction.address);
      if (instruction.address.length < InstructionRenderer.INSTRUCTION_ADDR_MIN_LENGTH) {
        spacesToAppend = InstructionRenderer.INSTRUCTION_ADDR_MIN_LENGTH - instruction.address.length;
      }
      for (let i2 = 0; i2 < spacesToAppend; i2++) {
        sb.appendString(" ");
      }
    }
    if (instruction.instructionBytes) {
      sb.appendString(instruction.instructionBytes);
      spacesToAppend = 10;
      if (instruction.instructionBytes.length < InstructionRenderer.INSTRUCTION_BYTES_MIN_LENGTH) {
        spacesToAppend = InstructionRenderer.INSTRUCTION_BYTES_MIN_LENGTH - instruction.instructionBytes.length;
      }
      for (let i2 = 0; i2 < spacesToAppend; i2++) {
        sb.appendString(" ");
      }
    }
    sb.appendString(instruction.instruction);
    templateData.instruction.innerText = sb.build();
    this.rerenderBackground(templateData.instruction, templateData.sourcecode, element);
  }
  disposeElement(element, index2, templateData) {
    dispose(templateData.cellDisposable);
    templateData.cellDisposable = [];
  }
  disposeTemplate(templateData) {
    dispose(templateData.disposables);
    templateData.disposables = [];
  }
  rerenderBackground(instruction, sourceCode, element) {
    if (element && this._disassemblyView.currentInstructionAddresses.includes(element.address)) {
      instruction.style.background = this._topStackFrameColor?.toString() || "transparent";
    } else if (element?.address === this._disassemblyView.focusedInstructionAddress) {
      instruction.style.background = this._focusedStackFrameColor?.toString() || "transparent";
    } else {
      instruction.style.background = "transparent";
    }
  }
  openSourceCode(instruction) {
    if (instruction) {
      const sourceURI = this.getUriFromSource(instruction);
      const selection = instruction.endLine ? {
        startLineNumber: instruction.line,
        endLineNumber: instruction.endLine,
        startColumn: instruction.column || 1,
        endColumn: instruction.endColumn || 1073741824 /* MAX_SAFE_SMALL_INTEGER */
      } : {
        startLineNumber: instruction.line,
        endLineNumber: instruction.line,
        startColumn: instruction.column || 1,
        endColumn: instruction.endColumn || 1073741824 /* MAX_SAFE_SMALL_INTEGER */
      };
      this.editorService.openEditor({
        resource: sourceURI,
        description: localize(14596, null),
        options: {
          preserveFocus: false,
          selection,
          revealIfOpened: true,
          selectionRevealType: 1 /* CenterIfOutsideViewport */,
          pinned: false
        }
      });
    }
  }
  getUriFromSource(instruction) {
    const path = instruction.location.path;
    if (path && isUriString(path)) {
      return this.uriService.asCanonicalUri(URI.parse(path));
    }
    if (path && isAbsolute(path)) {
      return this.uriService.asCanonicalUri(URI.file(path));
    }
    return getUriFromSource(instruction.location, instruction.location.path, this._disassemblyView.debugSession.getId(), this.uriService, this.logService);
  }
  applyFontInfo(element) {
    applyFontInfo(element, this._disassemblyView.fontInfo);
    element.style.whiteSpace = "pre";
  }
};

InstructionRenderer = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, ITextModelService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, ILogService)
], InstructionRenderer);

var AccessibilityProvider3 = class {
  getWidgetAriaLabel() {
    return localize(14595, null);
  }
  getAriaLabel(element) {
    let label3 = "";
    const instruction = element.instruction;
    if (instruction.address !== "-1") {
      label3 += `${localize(14597, null)}: ${instruction.address}`;
    }
    if (instruction.instructionBytes) {
      label3 += `, ${localize(14598, null)}: ${instruction.instructionBytes}`;
    }
    label3 += `, ${localize(14600, null)}: ${instruction.instruction}`;
    return label3;
  }
};

var DisassemblyViewContribution = class {
  constructor(editorService, debugService, contextKeyService) {
    contextKeyService.bufferChangeEvents(() => {
      this._languageSupportsDisassembleRequest = CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST.bindTo(contextKeyService);
    });
    const onDidActiveEditorChangeListener = () => {
      if (this._onDidChangeModelLanguage) {
        this._onDidChangeModelLanguage.dispose();
        this._onDidChangeModelLanguage = void 0;
      }
      const activeTextEditorControl = editorService.activeTextEditorControl;
      if (isCodeEditor(activeTextEditorControl)) {
        const language2 = activeTextEditorControl.getModel()?.getLanguageId();
        this._languageSupportsDisassembleRequest?.set(!!language2 && debugService.getAdapterManager().someDebuggerInterestedInLanguage(language2));
        this._onDidChangeModelLanguage = activeTextEditorControl.onDidChangeModelLanguage((e) => {
          this._languageSupportsDisassembleRequest?.set(debugService.getAdapterManager().someDebuggerInterestedInLanguage(e.newLanguage));
        });
      } else {
        this._languageSupportsDisassembleRequest?.set(false);
      }
    };
    onDidActiveEditorChangeListener();
    this._onDidActiveEditorChangeListener = editorService.onDidActiveEditorChange(onDidActiveEditorChangeListener);
  }
  dispose() {
    this._onDidActiveEditorChangeListener.dispose();
    this._onDidChangeModelLanguage?.dispose();
  }
};

DisassemblyViewContribution = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IDebugService),
  __decorateParam(2, IContextKeyService)
], DisassemblyViewContribution);

CommandsRegistry.registerCommand({
  metadata: {
    description: COPY_ADDRESS_LABEL
  },
  id: COPY_ADDRESS_ID,
  handler: async (accessor, entry) => {
    if (entry?.instruction?.address) {
      const clipboardService = accessor.get(IClipboardService);
      clipboardService.writeText(entry.instruction.address);
    }
  }
});
export { disassemblyNotAvailable, DisassemblyView, BreakpointRenderer, InstructionRenderer, AccessibilityProvider3, DisassemblyViewContribution };
