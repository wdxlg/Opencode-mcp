// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { LinkedList } from "./module-0013.mjs";
import { defaultExternalUriOpenerId, externalUriOpenersSettingId } from "./module-1292.mjs";
import { URI } from "./module-0032.mjs";
import { Iterable } from "./module-0011.mjs";
import { testUrlMatchesGlob } from "./module-1238.mjs";
import { isWeb } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService.ts
var IExternalUriOpenerService = createDecorator("externalUriOpenerService");

var ExternalUriOpenerService = class extends Disposable {
  constructor(openerService, configurationService, logService, preferencesService, quickInputService) {
    super();
    this.configurationService = configurationService;
    this.logService = logService;
    this.preferencesService = preferencesService;
    this.quickInputService = quickInputService;
    this._providers = new LinkedList();
    this._register(openerService.registerExternalOpener(this));
  }
  registerExternalOpenerProvider(provider) {
    const remove2 = this._providers.push(provider);
    return { dispose: remove2 };
  }
  async getOpeners(targetUri, allowOptional, ctx, token) {
    const allOpeners = await this.getAllOpenersForUri(targetUri);
    if (allOpeners.size === 0) {
      return [];
    }
    if (ctx.preferredOpenerId) {
      if (ctx.preferredOpenerId === defaultExternalUriOpenerId) {
        return [];
      }
      const preferredOpener = allOpeners.get(ctx.preferredOpenerId);
      if (preferredOpener) {
        return [preferredOpener];
      }
    }
    const configuredOpener = this.getConfiguredOpenerForUri(allOpeners, targetUri);
    if (configuredOpener) {
      return configuredOpener === defaultExternalUriOpenerId ? [] : [configuredOpener];
    }
    const validOpeners = [];
    await Promise.all(Array.from(allOpeners.values()).map(async (opener) => {
      let priority;
      try {
        priority = await opener.canOpen(ctx.sourceUri, token);
      } catch (e) {
        this.logService.error(e);
        return;
      }
      switch (priority) {
        case 1 /* Option */:
        case 2 /* Default */:
        case 3 /* Preferred */:
          validOpeners.push({ opener, priority });
          break;
      }
    }));
    if (validOpeners.length === 0) {
      return [];
    }
    const preferred = validOpeners.filter((x) => x.priority === 3 /* Preferred */).at(0);
    if (preferred) {
      return [preferred.opener];
    }
    if (!allowOptional && validOpeners.every((x) => x.priority === 1 /* Option */)) {
      return [];
    }
    return validOpeners.map((value2) => value2.opener);
  }
  async openExternal(href, ctx, token) {
    const targetUri = typeof href === "string" ? URI.parse(href) : href;
    const allOpeners = await this.getOpeners(targetUri, false, ctx, token);
    if (allOpeners.length === 0) {
      return false;
    } else if (allOpeners.length === 1) {
      return allOpeners[0].openExternalUri(targetUri, ctx, token);
    }
    return this.showOpenerPrompt(allOpeners, targetUri, ctx, token);
  }
  async getOpener(targetUri, ctx, token) {
    const allOpeners = await this.getOpeners(targetUri, true, ctx, token);
    if (allOpeners.length >= 1) {
      return allOpeners[0];
    }
    return void 0;
  }
  async getAllOpenersForUri(targetUri) {
    const allOpeners = /* @__PURE__ */ new Map();
    await Promise.all(Iterable.map(this._providers, async (provider) => {
      for await (const opener of provider.getOpeners(targetUri)) {
        allOpeners.set(opener.id, opener);
      }
    }));
    return allOpeners;
  }
  getConfiguredOpenerForUri(openers, targetUri) {
    const config = this.configurationService.getValue(externalUriOpenersSettingId) || {};
    for (const [uriGlob, id2] of Object.entries(config)) {
      if (testUrlMatchesGlob(targetUri, uriGlob)) {
        if (id2 === defaultExternalUriOpenerId) {
          return "default";
        }
        const entry = openers.get(id2);
        if (entry) {
          return entry;
        }
      }
    }
    return void 0;
  }
  async showOpenerPrompt(openers, targetUri, ctx, token) {
    const items = openers.map((opener) => {
      return {
        label: opener.label,
        opener
      };
    });
    items.push(
      {
        label: isWeb ? localize(15669, null) : localize(15668, null),
        opener: void 0
      },
      { type: "separator" },
      {
        label: localize(15667, null),
        opener: "configureDefault"
      }
    );
    const picked = await this.quickInputService.pick(items, {
      placeHolder: localize(15670, null, targetUri.toString())
    });
    if (!picked) {
      return true;
    }
    if (typeof picked.opener === "undefined") {
      return false;
    } else if (picked.opener === "configureDefault") {
      await this.preferencesService.openUserSettings({
        jsonEditor: true,
        revealSetting: { key: externalUriOpenersSettingId, edit: true }
      });
      return true;
    } else {
      return picked.opener.openExternalUri(targetUri, ctx, token);
    }
  }
};

ExternalUriOpenerService = __decorateClass([
  __decorateParam(0, IOpenerService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IPreferencesService),
  __decorateParam(4, IQuickInputService)
], ExternalUriOpenerService);
export { IExternalUriOpenerService, ExternalUriOpenerService };
