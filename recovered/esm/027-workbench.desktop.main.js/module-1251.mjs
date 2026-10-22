// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadQuickOpen.ts
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { URI, isUriComponents } from "./module-0032.mjs";
import { basenameOrAuthority, dirname2, hasTrailingPathSeparator } from "./module-0034.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Lazy } from "./module-0028.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ICustomEditorLabelService } from "./module-0931.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/api/browser/mainThreadQuickOpen.ts
var MainThreadQuickOpen = class {
  constructor(extHostContext, quickInputService, labelService, customEditorLabelService, modelService, languageService) {
    this.labelService = labelService;
    this.customEditorLabelService = customEditorLabelService;
    this.modelService = modelService;
    this.languageService = languageService;
    this._items = {};
    // ---- QuickInput
    this.sessions = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostQuickOpen);
    this._quickInputService = quickInputService;
  }
  dispose() {
    for (const [_id, session] of this.sessions) {
      session.store.dispose();
    }
  }
  $show(instance2, options3, token) {
    const contents = new Promise((resolve3, reject) => {
      this._items[instance2] = { resolve: resolve3, reject };
    });
    options3 = {
      ...options3,
      onDidFocus: (el) => {
        if (el) {
          this._proxy.$onItemSelected(el.handle);
        }
      }
    };
    if (options3.canPickMany) {
      return this._quickInputService.pick(contents, options3, token).then((items) => {
        if (items) {
          return items.map((item) => item.handle);
        }
        return void 0;
      });
    } else {
      return this._quickInputService.pick(contents, options3, token).then((item) => {
        if (item) {
          return item.handle;
        }
        return void 0;
      });
    }
  }
  $setItems(instance2, items) {
    if (this._items[instance2]) {
      items.forEach((item) => this.expandItemProps(item));
      this._items[instance2].resolve(items);
      delete this._items[instance2];
    }
    return Promise.resolve();
  }
  $setError(instance2, error) {
    if (this._items[instance2]) {
      this._items[instance2].reject(error);
      delete this._items[instance2];
    }
    return Promise.resolve();
  }
  // ---- input
  $input(options3, validateInput, token) {
    const inputOptions2 = /* @__PURE__ */ Object.create(null);
    if (options3) {
      inputOptions2.title = options3.title;
      inputOptions2.password = options3.password;
      inputOptions2.placeHolder = options3.placeHolder;
      inputOptions2.valueSelection = options3.valueSelection;
      inputOptions2.prompt = options3.prompt;
      inputOptions2.value = options3.value;
      inputOptions2.ignoreFocusLost = options3.ignoreFocusOut;
    }
    if (validateInput) {
      inputOptions2.validateInput = (value2) => {
        return this._proxy.$validateInput(value2);
      };
    }
    return this._quickInputService.input(inputOptions2, token);
  }
  $createOrUpdate(params) {
    const sessionId = params.id;
    let session = this.sessions.get(sessionId);
    if (!session) {
      const store = new DisposableStore();
      const input2 = params.type === "quickPick" ? this._quickInputService.createQuickPick() : this._quickInputService.createInputBox();
      store.add(input2);
      store.add(input2.onDidAccept(() => {
        this._proxy.$onDidAccept(sessionId);
      }));
      store.add(input2.onDidTriggerButton((button) => {
        this._proxy.$onDidTriggerButton(sessionId, button.handle, button.toggle?.checked);
      }));
      store.add(input2.onDidChangeValue((value2) => {
        this._proxy.$onDidChangeValue(sessionId, value2);
      }));
      store.add(input2.onDidHide(() => {
        this._proxy.$onDidHide(sessionId);
      }));
      if (params.type === "quickPick") {
        const quickPick2 = input2;
        store.add(quickPick2.onDidChangeActive((items) => {
          this._proxy.$onDidChangeActive(sessionId, items.map((item) => item.handle));
        }));
        store.add(quickPick2.onDidChangeSelection((items) => {
          this._proxy.$onDidChangeSelection(sessionId, items.map((item) => item.handle));
        }));
        store.add(quickPick2.onDidTriggerItemButton((e) => {
          const transferButton = e.button;
          this._proxy.$onDidTriggerItemButton(
            sessionId,
            e.item.handle,
            transferButton.handle,
            transferButton.toggle?.checked
          );
        }));
      }
      session = {
        input: input2,
        handlesToItems: /* @__PURE__ */ new Map(),
        store
      };
      this.sessions.set(sessionId, session);
    }
    const { input, handlesToItems } = session;
    const quickPick = input;
    for (const param in params) {
      switch (param) {
        case "id":
        case "type":
          continue;
        case "visible":
          if (params.visible) {
            input.show();
          } else {
            input.hide();
          }
          break;
        case "items": {
          handlesToItems.clear();
          params.items?.forEach((item) => {
            this.expandItemProps(item);
            if (item.type !== "separator") {
              item.buttons?.forEach((button) => this.expandIconPath(button));
              handlesToItems.set(item.handle, item);
            }
          });
          quickPick.items = params.items;
          break;
        }
        case "activeItems":
          quickPick.activeItems = params.activeItems?.map((handle2) => handlesToItems.get(handle2)).filter(Boolean);
          break;
        case "selectedItems":
          quickPick.selectedItems = params.selectedItems?.map((handle2) => handlesToItems.get(handle2)).filter(Boolean);
          break;
        case "buttons": {
          const buttons = [];
          for (const button of params.buttons) {
            if (button.handle === -1) {
              buttons.push(this._quickInputService.backButton);
            } else {
              this.expandIconPath(button);
              buttons.push(button);
            }
          }
          input.buttons = buttons;
          break;
        }
        default:
          input[param] = params[param];
          break;
      }
    }
    return Promise.resolve(void 0);
  }
  $dispose(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.store.dispose();
      this.sessions.delete(sessionId);
    }
    return Promise.resolve(void 0);
  }
  /**
  * Derives icon, label and description for Quick Pick items that represent a resource URI.
  */
  expandItemProps(item) {
    if (item.type === "separator") {
      return;
    }
    if (!item.resourceUri) {
      this.expandIconPath(item);
      return;
    }
    const resourceUri = URI.from(item.resourceUri);
    item.label ??= this.customEditorLabelService.getName(resourceUri) || "";
    if (item.label) {
      item.description ??= this.labelService.getUriLabel(resourceUri, { relative: true });
    } else {
      item.label = basenameOrAuthority(resourceUri);
      item.description ??= this.labelService.getUriLabel(dirname2(resourceUri), { relative: true });
    }
    const icon2 = item.iconPathDto;
    if (ThemeIcon.isThemeIcon(icon2) && (ThemeIcon.isFile(icon2) || ThemeIcon.isFolder(icon2))) {
      const fileKind = ThemeIcon.isFolder(icon2) || hasTrailingPathSeparator(resourceUri) ? 1 /* FOLDER */ : 0 /* FILE */;
      const iconClasses = new Lazy(() => getIconClasses(this.modelService, this.languageService, resourceUri, fileKind));
      Object.defineProperty(item, "iconClasses", { get: () => iconClasses.value });
    } else {
      this.expandIconPath(item);
    }
  }
  /**
  * Converts IconPath DTO into iconPath/iconClass properties.
  */
  expandIconPath(target) {
    const icon2 = target.iconPathDto;
    if (!icon2) {
      return;
    } else if (ThemeIcon.isThemeIcon(icon2)) {
      target.iconClass = ThemeIcon.asClassName(icon2);
    } else if (isUriComponents(icon2)) {
      const uri5 = URI.from(icon2);
      target.iconPath = { dark: uri5, light: uri5 };
    } else {
      const { dark, light } = icon2;
      target.iconPath = { dark: URI.from(dark), light: URI.from(light) };
    }
  }
};

MainThreadQuickOpen = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadQuickOpen),
  __decorateParam(1, IQuickInputService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, ICustomEditorLabelService),
  __decorateParam(4, IModelService),
  __decorateParam(5, ILanguageService)
], MainThreadQuickOpen);
export { MainThreadQuickOpen };
