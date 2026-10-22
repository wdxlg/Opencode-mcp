// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/keybindingsExport/electron-browser/keybindingsExport.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { join } from "./module-0026.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { KeybindingResolver } from "./module-0582.mjs";
import { KeybindingParser } from "./module-1606.mjs";
import { MenuRegistry } from "./module-0092.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EN_US_WIN_LAYOUT } from "./module-4220.mjs";
import { EN_US_DARWIN_LAYOUT } from "./module-4221.mjs";
import { EN_US_LINUX_LAYOUT } from "./module-4222.mjs";
import { KeymapInfo } from "./module-4218.mjs";
import { WindowsKeyboardMapper } from "./module-1834.mjs";
import { MacLinuxKeyboardMapper } from "./module-3945.mjs";
import { ResolvedKeybindingItem } from "./module-1585.mjs";
import { KeybindingIO, OutputBuilder } from "./module-1609.mjs";
import { getAllUnboundCommands } from "./module-1586.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeEnvironmentService } from "./module-0508.mjs";
import { IFileService } from "./module-0269.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { IProductService } from "./module-0875.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/keybindingsExport/electron-browser/keybindingsExport.contribution.ts
var KeybindingsExportContribution = class extends Disposable {
  constructor(nativeEnvironmentService, fileService, nativeHostService, productService, extensionService, logService) {
    super();
    this.nativeEnvironmentService = nativeEnvironmentService;
    this.fileService = fileService;
    this.nativeHostService = nativeHostService;
    this.productService = productService;
    this.extensionService = extensionService;
    this.logService = logService;
    if (this.productService.quality === "stable") {
      return;
    }
    const outputPath = this.nativeEnvironmentService.exportDefaultKeybindings;
    if (outputPath !== void 0) {
      const defaultPath = join(this.nativeEnvironmentService.appRoot, "doc");
      void this.extensionService.whenInstalledExtensionsRegistered().then(() => {
        return this.exportDefaultKeybindingsAndQuit(outputPath || defaultPath);
      }).catch(async (error) => {
        this.logService.error(`[${KeybindingsExportContribution.ID}] Failed to register installed extensions before exporting default keybindings`, error);
        await this.nativeHostService.closeWindow();
      });
    }
  }
  static {
    this.ID = "workbench.contrib.keybindingsExport";
  }
  async exportDefaultKeybindingsAndQuit(outputPath) {
    try {
      await this.fileService.createFolder(URI.file(outputPath));
      const platforms = [
        { os: 1 /* Windows */, filename: "doc.keybindings.win.json" },
        { os: 2 /* Macintosh */, filename: "doc.keybindings.osx.json" },
        { os: 3 /* Linux */, filename: "doc.keybindings.linux.json" }
      ];
      const extensions = this.extensionService.extensions;
      for (const { os, filename } of platforms) {
        const content = KeybindingsExportContribution._getDefaultKeybindingsContentForOS(os, extensions);
        const filePath = join(outputPath, filename);
        await this.fileService.writeFile(URI.file(filePath), VSBuffer.fromString(content));
        this.logService.info(`[${KeybindingsExportContribution.ID}] Wrote ${filePath}`);
      }
      await this.nativeHostService.closeWindow();
    } catch (error) {
      this.logService.error(`[${KeybindingsExportContribution.ID}] Failed to generate default keybindings`, error);
      await this.nativeHostService.closeWindow();
    }
  }
  static _getDefaultKeybindingsContentForOS(os, extensions) {
    const coreItems = KeybindingsRegistry.getDefaultKeybindingsForOS(os);
    const extensionItems = KeybindingsExportContribution._getExtensionKeybindingsForOS(extensions, os);
    const items = coreItems.concat(extensionItems);
    const mapper = KeybindingsExportContribution._createKeyboardMapperForOS(os);
    const resolved = KeybindingsExportContribution._resolveKeybindingItemsWithMapper(items, mapper);
    const resolver = new KeybindingResolver(resolved, [], () => {
    });
    const defaultKeybindings = resolver.getDefaultKeybindings();
    const boundCommands = resolver.getDefaultBoundCommands();
    return KeybindingsExportContribution._formatDefaultKeybindings(defaultKeybindings) + "\n\n" + KeybindingsExportContribution._formatAllCommandsAsComment(boundCommands);
  }
  static _getExtensionKeybindingsForOS(extensions, os) {
    const result = [];
    for (const ext of extensions) {
      if (!ext.isBuiltin) {
        continue;
      }
      const keybindings = ext.contributes?.keybindings;
      if (!keybindings) {
        continue;
      }
      const bindings = Array.isArray(keybindings) ? keybindings : [keybindings];
      for (let i2 = 0; i2 < bindings.length; i2++) {
        const binding = bindings[i2];
        const keyStr = KeybindingsExportContribution._bindToOS(binding.key, binding.mac, binding.linux, binding.win, os);
        if (!keyStr) {
          continue;
        }
        const keybinding = KeybindingParser.parseKeybinding(keyStr);
        if (!keybinding) {
          continue;
        }
        const commandAction = MenuRegistry.getCommand(binding.command);
        const precondition2 = commandAction?.precondition;
        let when = binding.when ? ContextKeyExpr.deserialize(binding.when) : void 0;
        if (when && precondition2) {
          when = ContextKeyExpr.and(precondition2, when) ?? void 0;
        } else if (precondition2) {
          when = precondition2;
        }
        result.push({
          keybinding,
          command: binding.command,
          commandArgs: void 0,
          when: when ?? null,
          weight1: 300 /* BuiltinExtension */ + i2,
          weight2: 0,
          extensionId: ext.identifier.value,
          isBuiltinExtension: true
        });
      }
    }
    return result;
  }
  static _bindToOS(key3, mac, linux, win, os) {
    if (os === 1 /* Windows */ && win) {
      return win;
    }
    if (os === 2 /* Macintosh */ && mac) {
      return mac;
    }
    if (os === 3 /* Linux */ && linux) {
      return linux;
    }
    return key3;
  }
  static _createKeyboardMapperForOS(os) {
    const layoutMap = {
      [1 /* Windows */]: EN_US_WIN_LAYOUT,
      [2 /* Macintosh */]: EN_US_DARWIN_LAYOUT,
      [3 /* Linux */]: EN_US_LINUX_LAYOUT
    };
    const layout2 = layoutMap[os];
    const keymapInfo = new KeymapInfo(layout2.layout, layout2.secondaryLayouts, layout2.mapping);
    switch (os) {
      case 1 /* Windows */:
        return new WindowsKeyboardMapper(true, keymapInfo.mapping, false);
      case 2 /* Macintosh */:
        return new MacLinuxKeyboardMapper(true, keymapInfo.mapping, false, 2 /* Macintosh */);
      case 3 /* Linux */:
        return new MacLinuxKeyboardMapper(true, keymapInfo.mapping, false, 3 /* Linux */);
    }
  }
  static _resolveKeybindingItemsWithMapper(items, mapper) {
    const result = [];
    for (const item of items) {
      const when = item.when || void 0;
      const keybinding = item.keybinding;
      if (!keybinding) {
        result.push(new ResolvedKeybindingItem(void 0, item.command, item.commandArgs, when, true, item.extensionId, item.isBuiltinExtension));
      } else {
        const resolvedKeybindings = mapper.resolveKeybinding(keybinding);
        for (let i2 = resolvedKeybindings.length - 1; i2 >= 0; i2--) {
          result.push(new ResolvedKeybindingItem(resolvedKeybindings[i2], item.command, item.commandArgs, when, true, item.extensionId, item.isBuiltinExtension));
        }
      }
    }
    return result;
  }
  static _formatDefaultKeybindings(defaultKeybindings) {
    const out = new OutputBuilder();
    out.writeLine("[");
    const lastIndex = defaultKeybindings.length - 1;
    defaultKeybindings.forEach((k, index2) => {
      KeybindingIO.writeKeybindingItem(out, k);
      if (index2 !== lastIndex) {
        out.writeLine(",");
      } else {
        out.writeLine();
      }
    });
    out.writeLine("]");
    return out.toString();
  }
  static _formatAllCommandsAsComment(boundCommands) {
    const unboundCommands = getAllUnboundCommands(boundCommands);
    const pretty2 = unboundCommands.sort().join("\n// - ");
    return "// Here are other available commands: \n// - " + pretty2;
  }
};

KeybindingsExportContribution = __decorateClass([
  __decorateParam(0, INativeEnvironmentService),
  __decorateParam(1, IFileService),
  __decorateParam(2, INativeHostService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IExtensionService),
  __decorateParam(5, ILogService)
], KeybindingsExportContribution);

registerWorkbenchContribution2(
  KeybindingsExportContribution.ID,
  KeybindingsExportContribution,
  WorkbenchPhase.Eventually
);
export { KeybindingsExportContribution };
