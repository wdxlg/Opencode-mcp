// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpAddContextContribution.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { derived } from "./module-0054.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { McpResourcePickHelper } from "./module-2988.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatContextPickService } from "./module-1453.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IMcpService } from "./module-1206.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpAddContextContribution.ts
var McpAddContextContribution = class extends Disposable {
  constructor(_chatContextPickService, _instantiationService, mcpService) {
    super();
    this._chatContextPickService = _chatContextPickService;
    this._instantiationService = _instantiationService;
    this._addContextMenu = this._register(new MutableDisposable());
    const hasServersWithResources = derived((reader) => {
      let enabled = false;
      for (const server of mcpService.servers.read(reader)) {
        const cap = server.capabilities.read(void 0);
        if (cap === void 0) {
          enabled = true;
        } else if (cap & 16 /* Resources */) {
          enabled = true;
          break;
        }
      }
      return enabled;
    });
    this._register(autorun((reader) => {
      const enabled = hasServersWithResources.read(reader);
      if (enabled && !this._addContextMenu.value) {
        this._registerAddContextMenu();
      } else {
        this._addContextMenu.clear();
      }
    }));
  }
  _registerAddContextMenu() {
    this._addContextMenu.value = this._chatContextPickService.registerChatContextItem({
      type: "pickerPick",
      label: localize(16767, null),
      icon: Codicon.mcp,
      isEnabled(widget) {
        return !!widget.attachmentCapabilities.supportsMCPAttachments;
      },
      asPicker: () => {
        const helper = this._instantiationService.createInstance(McpResourcePickHelper);
        return {
          placeholder: localize(16768, null),
          picks: (_query, token) => this._getResourcePicks(token, helper),
          goBack: () => {
            return helper.navigateBack();
          },
          dispose: () => {
            helper.dispose();
          }
        };
      }
    });
  }
  _getResourcePicks(token, helper) {
    const picksObservable = helper.getPicks(token);
    return derived(this, (reader) => {
      const pickItems = picksObservable.read(reader);
      const picks = [];
      for (const [server, resources] of pickItems.picks) {
        if (resources.length === 0) {
          continue;
        }
        picks.push(McpResourcePickHelper.sep(server));
        for (const resource of resources) {
          picks.push({
            ...McpResourcePickHelper.item(resource),
            asAttachment: () => helper.toAttachment(resource, server)
          });
        }
      }
      return { picks, busy: pickItems.isBusy };
    });
  }
};

McpAddContextContribution = __decorateClass([
  __decorateParam(0, IChatContextPickService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IMcpService)
], McpAddContextContribution);
export { McpAddContextContribution };
