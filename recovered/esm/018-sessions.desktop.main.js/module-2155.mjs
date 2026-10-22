// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/agentHost/browser/codexAccountService.ts
import { createDecorator } from "./module-0077.mjs";
import { ChatAIDisabledSettingId } from "./module-0951.mjs";
import { AgentHostCodexAgentEnabledSettingId, CodexPreferAgentHostEditorSettingId, IAgentHostService } from "./module-1108.mjs";
import { Action, SubmenuAction, toAction } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { CODEX_ACCOUNT_SIGN_IN_REQUEST_KEY, CODEX_ACCOUNT_SIGN_OUT_REQUEST_KEY, MAX_CODEX_PROFILE_IMAGE_BYTES, readCodexAccountInfo } from "./module-2154.mjs";
import { Disposable } from "./module-0012.mjs";
import { CODEX_AGENT_PROVIDER_ID } from "./module-1107.mjs";
import { Emitter } from "./module-0017.mjs";
import { generateUuid } from "./module-0190.mjs";
import { ROOT_STATE_URI } from "./module-1008.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/agentHost/browser/codexAccountService.ts
var ICodexAccountService = createDecorator("codexAccountService");

function hasSignedInCodexChatGPTAccount(account, visible = true) {
  return visible && account.status === "signedIn";
}

function shouldShowCodexAccount(configurationService, isSessionsWindow) {
  return configurationService.getValue(ChatAIDisabledSettingId) !== true && configurationService.getValue(AgentHostCodexAgentEnabledSettingId) === true && (isSessionsWindow || configurationService.getValue(CodexPreferAgentHostEditorSettingId) === true);
}

function createCodexAccountMenuActions(service, visible = true) {
  if (!visible) {
    return [];
  }
  const account = service.account;
  if (account.status === "signedIn") {
    const signOut = toAction({
      id: "codex.signOutOfChatGPT",
      label: localize(22720, null),
      run: () => service.signOut()
    });
    const accountLabel = account.email ? localize(22717, null, account.email) : localize(22716, null);
    return [new SubmenuAction("codex.chatgptAccount", accountLabel, [signOut])];
  }
  if (account.status === "downloading") {
    return [new Action("codex.downloadingAgent", localize(22718, null), void 0, false)];
  }
  if (account.status === "unknown" || account.status === "signedOut" || account.status === "error") {
    return [new Action("codex.signInToChatGPT", localize(22719, null), void 0, true, () => service.signIn())];
  }
  return [];
}

function openCodexAuthUrl(openerService, authUrl) {
  return openerService.open(authUrl, { openExternal: true, skipValidation: true });
}

async function readCodexProfileImageDataUri(connection, reference) {
  try {
    const result = await connection.resourceRead(URI.parse(reference.uri), "base64" /* Base64 */);
    if (result.encoding !== "base64" /* Base64 */ || !isMatchingProfileImageContentType(result.contentType, reference.contentType) || result.data.length > Math.ceil(MAX_CODEX_PROFILE_IMAGE_BYTES * 4 / 3) + 4 || !isBase64(result.data) || getBase64DecodedSize(result.data) !== reference.sizeHint) {
      return void 0;
    }
    return `data:${reference.contentType};base64,${result.data}`;
  } catch {
    return void 0;
  }
}

var CodexAccountService = class extends Disposable {
  constructor(_agentHostService, _openerService) {
    super();
    this._agentHostService = _agentHostService;
    this._openerService = _openerService;
    this.agent = CODEX_AGENT_PROVIDER_ID;
    this._onDidChangeAccount = this._register(new Emitter());
    this.onDidChangeAccount = this._onDidChangeAccount.event;
    this._pendingSignInRequests = /* @__PURE__ */ new Set();
    this._profileImageRequest = 0;
    const initialState = this._agentHostService.rootState.value;
    this._rootAccount = readCodexAccountInfo(initialState instanceof Error ? void 0 : initialState);
    this._account = this._rootAccount;
    this._updateProfileImage(this._rootAccount.profileImage);
    this._register(this._agentHostService.rootState.onDidChange((state) => this._updateAccount(readCodexAccountInfo(state))));
  }
  get account() {
    return this._account;
  }
  signIn() {
    const request2 = generateUuid();
    this._pendingSignInRequests.add(request2);
    this._agentHostService.dispatch(ROOT_STATE_URI, {
      type: "root/configChanged" /* RootConfigChanged */,
      config: { [CODEX_ACCOUNT_SIGN_IN_REQUEST_KEY]: request2 }
    });
  }
  signOut() {
    this._agentHostService.dispatch(ROOT_STATE_URI, {
      type: "root/configChanged" /* RootConfigChanged */,
      config: { [CODEX_ACCOUNT_SIGN_OUT_REQUEST_KEY]: generateUuid() }
    });
  }
  _updateAccount(account) {
    this._rootAccount = account;
    const profileImageKey = getProfileImageKey(account.profileImage);
    this._account = profileImageKey === this._profileImageKey ? { ...account, profileImageDataUri: this._account.profileImageDataUri } : account;
    this._onDidChangeAccount.fire(this._account);
    this._updateProfileImage(account.profileImage);
    if (account.authUrlNonce && this._pendingSignInRequests.delete(account.authUrlNonce) && account.authUrl) {
      void openCodexAuthUrl(this._openerService, account.authUrl);
    }
  }
  _updateProfileImage(reference) {
    const profileImageKey = getProfileImageKey(reference);
    if (profileImageKey === this._profileImageKey) {
      return;
    }
    this._profileImageKey = profileImageKey;
    const request2 = ++this._profileImageRequest;
    if (!reference) {
      return;
    }
    void readCodexProfileImageDataUri(this._agentHostService, reference).then((profileImageDataUri) => {
      if (request2 !== this._profileImageRequest || profileImageKey !== this._profileImageKey) {
        return;
      }
      if (!profileImageDataUri) {
        this._profileImageKey = void 0;
        return;
      }
      this._account = { ...this._rootAccount, profileImageDataUri };
      this._onDidChangeAccount.fire(this._account);
    });
  }
};

CodexAccountService = __decorateClass([
  __decorateParam(0, IAgentHostService),
  __decorateParam(1, IOpenerService)
], CodexAccountService);

function isMatchingProfileImageContentType(actual, expected) {
  return actual === expected || actual === "image/jpg" && expected === "image/jpeg";
}

function getProfileImageKey(reference) {
  return reference ? `${reference.uri}\0${reference.contentType}\0${reference.sizeHint}\0${reference.nonce}` : void 0;
}

function isBase64(value2) {
  return value2.length > 0 && value2.length % 4 === 0 && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value2);
}

function getBase64DecodedSize(value2) {
  return value2.length * 3 / 4 - (value2.endsWith("==") ? 2 : value2.endsWith("=") ? 1 : 0);
}

registerSingleton(ICodexAccountService, CodexAccountService, 1 /* Delayed */);
export { hasSignedInCodexChatGPTAccount, shouldShowCodexAccount, createCodexAccountMenuActions, openCodexAuthUrl, readCodexProfileImageDataUri, isMatchingProfileImageContentType, getProfileImageKey, isBase64, getBase64DecodedSize, ICodexAccountService, CodexAccountService };
