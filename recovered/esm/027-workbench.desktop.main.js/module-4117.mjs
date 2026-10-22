// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/chatUrlFetchingConfirmation.ts
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { extractUrlPatterns, getPatternLabel, isUrlApproved } from "./module-4116.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IPreferencesService } from "./module-1294.mjs";


// src/vs/workbench/contrib/chat/common/tools/builtinTools/chatUrlFetchingConfirmation.ts
var trashButton = {
  iconClass: ThemeIcon.asClassName(Codicon.trash),
  tooltip: localize(13415, null)
};

var ChatUrlFetchingConfirmationContribution = class {
  constructor(_getURLS, _configurationService, _quickInputService, _preferencesService) {
    this._getURLS = _getURLS;
    this._configurationService = _configurationService;
    this._quickInputService = _quickInputService;
    this._preferencesService = _preferencesService;
    this.canUseDefaultApprovals = false;
  }
  getPreConfirmAction(ref) {
    return this._checkApproval(ref, true);
  }
  getPostConfirmAction(ref) {
    return this._checkApproval(ref, false);
  }
  _checkApproval(ref, checkRequest) {
    const urls = this._getURLS(ref.parameters);
    if (!urls || urls.length === 0) {
      return void 0;
    }
    const approvedUrls = this._getApprovedUrls();
    const allApproved = urls.every((url) => {
      try {
        const uri5 = URI.parse(url);
        return isUrlApproved(uri5, approvedUrls, checkRequest);
      } catch {
        return false;
      }
    });
    if (allApproved) {
      return {
        type: 2 /* Setting */,
        id: "chat.tools.urls.autoApprove" /* AutoApprovedUrls */
      };
    }
    return void 0;
  }
  getPreConfirmActions(ref) {
    return this._getConfirmActions(ref, true);
  }
  getPostConfirmActions(ref) {
    return this._getConfirmActions(ref, false);
  }
  _getConfirmActions(ref, forRequest) {
    const urls = this._getURLS(ref.parameters);
    if (!urls || urls.length === 0) {
      return [];
    }
    const urlsWithoutQuery = urls.map((u) => u.split("?")[0]);
    const actions = [];
    const uniqueUrls = Array.from(new Set(urlsWithoutQuery)).map((u) => URI.parse(u));
    const urlPatterns = new ResourceMap(uniqueUrls.map((u) => [u, extractUrlPatterns(u)]));
    if (urlPatterns.size === 1) {
      const uri5 = uniqueUrls[0];
      const patterns = urlPatterns.get(uri5);
      const topPatterns = patterns.slice(0, 2);
      for (const pattern of topPatterns) {
        const patternLabel = getPatternLabel(uri5, pattern);
        actions.push({
          label: forRequest ? localize(13412, null, patternLabel) : localize(13413, null, patternLabel),
          select: async () => {
            await this._approvePattern(pattern, forRequest, !forRequest);
            return true;
          }
        });
      }
      actions.push({
        label: localize(13417, null),
        select: async () => {
          const result = await this._showMoreOptions(ref, [{ uri: uri5, patterns }], forRequest);
          return result;
        }
      });
    } else {
      actions.push({
        label: localize(13419, null),
        select: async () => {
          await this._showMoreOptions(ref, [...urlPatterns].map(([uri5, patterns]) => ({ uri: uri5, patterns })), forRequest);
          return true;
        }
      });
    }
    return actions;
  }
  async _showMoreOptions(ref, urls, forRequest) {
    return new Promise((resolve3) => {
      const disposables = new DisposableStore();
      const quickTree = disposables.add(this._quickInputService.createQuickTree());
      quickTree.ignoreFocusOut = true;
      quickTree.sortByLabel = false;
      quickTree.placeholder = localize(13424, null);
      const treeItems = [];
      const approvedUrls = this._getApprovedUrls();
      const dedupedPatterns = /* @__PURE__ */ new Set();
      for (const { uri: uri5, patterns } of urls) {
        for (const pattern of patterns.slice().sort((a, b) => b.length - a.length)) {
          if (dedupedPatterns.has(pattern)) {
            continue;
          }
          dedupedPatterns.add(pattern);
          const settings = approvedUrls[pattern];
          const requestChecked = typeof settings === "boolean" ? settings : settings?.approveRequest ?? false;
          const responseChecked = typeof settings === "boolean" ? settings : settings?.approveResponse ?? false;
          treeItems.push({
            label: getPatternLabel(uri5, pattern),
            pattern,
            checked: requestChecked && responseChecked ? true : !requestChecked && !responseChecked ? false : "mixed",
            collapsed: true,
            children: [
              {
                label: localize(13409, null),
                pattern,
                approvalType: "request",
                checked: requestChecked
              },
              {
                label: localize(13410, null),
                pattern,
                approvalType: "response",
                checked: responseChecked
              }
            ]
          });
        }
      }
      quickTree.setItemTree(treeItems);
      const updateApprovals = () => {
        const current = { ...this._getApprovedUrls() };
        for (const item of quickTree.itemTree) {
          const allowPre = item.children?.find((c) => c.approvalType === "request")?.checked;
          const allowPost = item.children?.find((c) => c.approvalType === "response")?.checked;
          if (allowPost && allowPre) {
            current[item.pattern] = true;
          } else if (!allowPost && !allowPre) {
            delete current[item.pattern];
          } else {
            current[item.pattern] = {
              approveRequest: !!allowPre || void 0,
              approveResponse: !!allowPost || void 0
            };
          }
        }
        return this._configurationService.updateValue("chat.tools.urls.autoApprove" /* AutoApprovedUrls */, current);
      };
      disposables.add(quickTree.onDidAccept(async () => {
        quickTree.busy = true;
        await updateApprovals();
        resolve3(!!this._checkApproval(ref, forRequest));
        quickTree.hide();
      }));
      disposables.add(quickTree.onDidHide(() => {
        updateApprovals();
        disposables.dispose();
        resolve3(false);
      }));
      quickTree.show();
    });
  }
  async _approvePattern(pattern, approveRequest, approveResponse) {
    const approvedUrls = { ...this._getApprovedUrls() };
    const existingSettings = approvedUrls[pattern];
    let existingRequest = false;
    let existingResponse = false;
    if (typeof existingSettings === "boolean") {
      existingRequest = existingSettings;
      existingResponse = existingSettings;
    } else if (existingSettings) {
      existingRequest = existingSettings.approveRequest ?? false;
      existingResponse = existingSettings.approveResponse ?? false;
    }
    const mergedRequest = approveRequest || existingRequest;
    const mergedResponse = approveResponse || existingResponse;
    let value2;
    if (mergedRequest === mergedResponse) {
      value2 = mergedRequest;
    } else {
      value2 = { approveRequest: mergedRequest, approveResponse: mergedResponse };
    }
    approvedUrls[pattern] = value2;
    await this._configurationService.updateValue(
      "chat.tools.urls.autoApprove" /* AutoApprovedUrls */,
      approvedUrls
    );
  }
  getManageActions() {
    const approvedUrls = { ...this._getApprovedUrls() };
    const items = [];
    for (const [pattern, settings] of Object.entries(approvedUrls)) {
      const label3 = pattern;
      let description;
      if (typeof settings === "boolean") {
        description = settings ? localize(13411, null) : localize(13416, null);
      } else {
        const parts = [];
        if (settings.approveRequest) {
          parts.push(localize(13422, null));
        }
        if (settings.approveResponse) {
          parts.push(localize(13423, null));
        }
        description = parts.length > 0 ? localize(13414, null, parts.join(", ")) : localize(13420, null);
      }
      const item = {
        label: label3,
        description,
        buttons: [trashButton],
        checked: true,
        onDidChangeChecked: (checked) => {
          if (checked) {
            approvedUrls[pattern] = settings;
          } else {
            delete approvedUrls[pattern];
          }
          this._configurationService.updateValue("chat.tools.urls.autoApprove" /* AutoApprovedUrls */, approvedUrls);
        }
      };
      items.push(item);
    }
    items.push({
      pickable: false,
      label: localize(13418, null),
      description: localize(13421, null),
      onDidOpen: () => {
        this._preferencesService.openUserSettings({ query: "chat.tools.urls.autoApprove" /* AutoApprovedUrls */ });
      }
    });
    return items;
  }
  async reset() {
    await this._configurationService.updateValue(
      "chat.tools.urls.autoApprove" /* AutoApprovedUrls */,
      {}
    );
  }
  _getApprovedUrls() {
    return this._configurationService.getValue(
      "chat.tools.urls.autoApprove" /* AutoApprovedUrls */
    ) || {};
  }
};

ChatUrlFetchingConfirmationContribution = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, IPreferencesService)
], ChatUrlFetchingConfirmationContribution);
export { trashButton, ChatUrlFetchingConfirmationContribution };
