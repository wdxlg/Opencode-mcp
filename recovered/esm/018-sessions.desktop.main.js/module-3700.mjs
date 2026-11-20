// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostSessionConfigPicker.ts
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IsPhoneLayoutContext, IsQuickChatSessionContext, SessionProviderIdContext } from "./module-1770.mjs";
import { LOCAL_AGENT_HOST_PROVIDER_ID, REMOTE_AGENT_HOST_PROVIDER_RE, isAgentHostProvider } from "./module-1764.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode, getActiveDocument, getActiveElement, isHTMLElement } from "./module-0075.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { isPhoneLayout } from "./module-3445.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { MobileAgentHostModePicker } from "./module-3696.mjs";
import { AgentHostModePicker } from "./module-3694.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { Action2, MenuId, MenuItemAction, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Menus } from "./module-3437.mjs";
import { Codicon } from "./module-0085.mjs";
import { toAction } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { isChatPermissionLevel } from "./module-0965.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Checkbox } from "./module-0549.mjs";
import { defaultCheckboxStyles } from "./module-0513.mjs";
import { markOnboardingTarget } from "./module-3542.mjs";
import { Delayer } from "./module-0036.mjs";
import { autorun } from "./module-0052.mjs";
import { isWellKnownAutoApproveSchema2, isWellKnownClaudePermissionModeSchema, isWellKnownCodexApprovalsSchema, isWellKnownModeSchema } from "./module-3693.mjs";
import { renderIcon } from "./module-0467.mjs";
import { reportNewChatPickerClosed } from "./module-3541.mjs";
import { CHANGES_VIEW_ID } from "./module-3620.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ISessionChangesService } from "./module-3646.mjs";
import { IViewsService } from "./module-1246.mjs";
import { showMobilePickerSheet } from "./module-3565.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { ISessionContext } from "./module-3499.mjs";
import { AgentHostClaudePermissionModePicker } from "./module-3698.mjs";
import { AgentHostCodexApprovalsPicker } from "./module-3699.mjs";
import { observableValue } from "./module-0048.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { ChatContextKeyExprs, ChatContextKeys } from "./module-0966.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostSessionConfigPicker.ts
var IsActiveSessionRemoteAgentHost = ContextKeyExpr.regex(SessionProviderIdContext.key, REMOTE_AGENT_HOST_PROVIDER_RE);

var IsActiveSessionLocalAgentHost = ContextKeyExpr.equals(SessionProviderIdContext.key, LOCAL_AGENT_HOST_PROVIDER_ID);

function showActiveSessionModePicker(accessor) {
  const activeElement = getActiveElement();
  const anchor = isHTMLElement(activeElement) ? activeElement : getActiveDocument().body;
  const picker = accessor.get(IInstantiationService).createInstance(
    isPhoneLayout(accessor.get(IWorkbenchLayoutService)) ? MobileAgentHostModePicker : AgentHostModePicker,
    accessor.get(ISessionsService).activeSession
  );
  if (!picker.showPicker(anchor, () => picker.dispose())) {
    picker.dispose();
  }
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "sessions.agentHost.sessionConfigPicker",
      title: localize2(4958, "Session Configuration"),
      f1: false,
      menu: [{
        id: Menus.NewSessionRepositoryConfig,
        group: "navigation",
        order: 3,
        when: ContextKeyExpr.and(
          ContextKeyExpr.or(IsActiveSessionLocalAgentHost, IsActiveSessionRemoteAgentHost),
          IsQuickChatSessionContext.negate()
        )
      }]
    });
  }
  async run() {
  }
});

function getConfigIcon2(property, value2, hasUncommittedChanges = false) {
  if (property === "isolation" /* Isolation */) {
    if (value2 === "folder") {
      return Codicon.folder;
    }
    if (value2 === "worktree") {
      return Codicon.worktree;
    }
  }
  if (property === "branch" /* Branch */) {
    return hasUncommittedChanges ? Codicon.gitBranchChanges : Codicon.gitBranch;
  }
  if (property === "autoApprove" /* AutoApprove */) {
    if (value2 === "autopilot") {
      return Codicon.rocket;
    }
    if (value2 === "autoApprove") {
      return Codicon.warning;
    }
    if (value2 === "assisted") {
      return Codicon.sparkle;
    }
    return Codicon.shield;
  }
  return void 0;
}

function formatUncommittedChanges(count2) {
  return count2 === 1 ? localize(4948, null) : localize(4947, null, count2);
}

function getBranchUncommittedChanges(branchName, repositoryBranchName, repositoryUncommittedChanges) {
  return branchName === repositoryBranchName && (repositoryUncommittedChanges ?? 0) > 0 ? repositoryUncommittedChanges : void 0;
}

function toActionItems2(property, items, currentValue, policyRestricted, repositoryBranchName, repositoryUncommittedChanges, onShowChanges) {
  const actionItems = items.map((item) => {
    const disabled = false;
    const checked = isSelectedValue2(currentValue, item.value);
    const uncommittedChanges = property === "branch" /* Branch */ ? getBranchUncommittedChanges(item.value, repositoryBranchName, repositoryUncommittedChanges) : void 0;
    const uncommittedChangesDescription = uncommittedChanges !== void 0 ? formatUncommittedChanges(uncommittedChanges) : void 0;
    return {
      kind: "action" /* Action */,
      label: item.label,
      detail: disabled ? localize(4953, null) : uncommittedChangesDescription ?? item.description,
      group: { title: "", icon: getConfigIcon2(property, item.value, uncommittedChanges !== void 0) },
      ariaDescription: uncommittedChangesDescription,
      disabled,
      item: { ...item, checked },
      toolbarActions: uncommittedChanges !== void 0 && onShowChanges ? [toAction({
        id: "sessions.agentHost.showBranchChanges",
        label: localize(4946, null),
        class: ThemeIcon.asClassName(Codicon.diffMultiple),
        run: onShowChanges
      })] : void 0
    };
  });
  if (property === "branch" /* Branch */) {
    const currentIndex = actionItems.findIndex((item) => item.item?.checked);
    if (currentIndex >= 0) {
      const [current] = actionItems.splice(currentIndex, 1);
      actionItems.unshift(current);
      if (actionItems.length > 1) {
        actionItems.splice(1, 0, { kind: "separator" /* Separator */, label: "" });
      }
    }
  }
  return actionItems;
}

function isSelectedValue2(currentValue, itemValue) {
  if (typeof currentValue === "boolean") {
    return currentValue === (itemValue === "true");
  }
  return itemValue === currentValue;
}

function renderPickerTrigger2(slot, disabled, disposables, onOpen) {
  const trigger = append(slot, disabled ? $("span.action-label") : $("a.action-label"));
  if (disabled) {
    trigger.setAttribute("aria-readonly", "true");
  } else {
    trigger.role = "button";
    trigger.tabIndex = 0;
    trigger.setAttribute("aria-haspopup", "listbox");
    disposables.add(Gesture.addTarget(trigger));
    for (const eventType of [EventType.CLICK, EventType2.Tap]) {
      disposables.add(addDisposableListener(trigger, eventType, (e4) => {
        EventHelper.stop(e4, true);
        onOpen();
      }));
    }
    disposables.add(addDisposableListener(trigger, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        EventHelper.stop(e4, true);
        onOpen();
      }
    }));
  }
  slot.classList.toggle("disabled", disabled);
  return trigger;
}

function applyAutoApproveFiltering(items, property, configurationService) {
  return { items, policyRestricted: false };
}

async function confirmAutoApproveLevel(value2, label3, dialogService, storageService) {
  return true;
}

function triggerAriaLabel(title, label3, isReadOnly2, hasUncommittedChanges) {
  if (hasUncommittedChanges) {
    return isReadOnly2 ? localize(4956, null, title, label3) : localize(4957, null, title, label3);
  }
  return isReadOnly2 ? localize(4955, null, title, label3) : localize(4954, null, title, label3);
}

var ConfigCheckboxControl = class extends Disposable {
  constructor(sessionId, label3, className2, _hoverService, onToggle, onboardingTarget) {
    super();
    this.sessionId = sessionId;
    this._hoverService = _hoverService;
    this._hover = this._register(new MutableDisposable());
    this._enabled = true;
    this.slot = $(".sessions-chat-picker-slot.sessions-chat-config-checkbox");
    this.slot.classList.add(className2);
    this._row = append(this.slot, $(".action-label"));
    this.checkbox = this._register(new Checkbox(label3, false, { ...defaultCheckboxStyles, size: 14 }));
    append(this._row, this.checkbox.domNode);
    const labelSpan = append(this._row, $("span.sessions-chat-dropdown-label"));
    labelSpan.textContent = label3;
    if (onboardingTarget) {
      this._register(markOnboardingTarget(this.slot, onboardingTarget));
    }
    this._register(this.checkbox.onChange(() => onToggle(this.checkbox.checked)));
    this._register(Gesture.addTarget(this._row));
    for (const eventType of [EventType.CLICK, EventType2.Tap]) {
      this._register(addDisposableListener(this._row, eventType, (e4) => {
        EventHelper.stop(e4, true);
        if (!this._enabled) {
          return;
        }
        this.checkbox.checked = !this.checkbox.checked;
        onToggle(this.checkbox.checked);
      }));
    }
  }
  update(checked, readOnly, resolving, tooltip) {
    this._enabled = !readOnly && !resolving;
    this.checkbox.checked = checked;
    if (readOnly) {
      this.checkbox.disable();
    } else {
      this.checkbox.enable();
      this.checkbox.domNode.setAttribute("aria-disabled", resolving ? "true" : "false");
    }
    this.slot.classList.toggle("disabled", readOnly);
    this.slot.classList.toggle("resolving", !readOnly && resolving);
    if (this._tooltip !== tooltip) {
      this._tooltip = tooltip;
      this._hover.value = tooltip ? this._hoverService.setupDelayedHover(this._row, { content: tooltip }) : void 0;
    }
  }
  dispose() {
    this.slot.remove();
    super.dispose();
  }
};

var AgentHostSessionConfigPicker = class extends Disposable {
  constructor(_session, _actionWidgetService, _configurationService, _contextKeyService, _dialogService, _hoverService, _sessionsProvidersService, _telemetryService, _layoutService, _storageService, _sessionChangesService, _viewsService) {
    super();
    this._session = _session;
    this._actionWidgetService = _actionWidgetService;
    this._configurationService = _configurationService;
    this._contextKeyService = _contextKeyService;
    this._dialogService = _dialogService;
    this._hoverService = _hoverService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._telemetryService = _telemetryService;
    this._layoutService = _layoutService;
    this._storageService = _storageService;
    this._sessionChangesService = _sessionChangesService;
    this._viewsService = _viewsService;
    this._renderDisposables = this._register(new DisposableStore());
    this._providerListeners = this._register(new DisposableMap());
    this._devContainerCheckbox = this._register(new MutableDisposable());
    this._isolationCheckbox = this._register(new MutableDisposable());
    this._filterDelayer = this._register(new Delayer(200));
    /**
     * Session/property-scoped value→label cache for `enumDynamic`
     * properties (e.g. branch), populated whenever `_getItems` fetches
     * completions. `enumDynamic` completions are transient protocol
     * data — only `value` is persisted via `setSessionConfigValue`/
     * `resolveSessionConfig` — so this is the only place a completion's
     * `label` for a previously-picked value can be recovered once the
     * dropdown/sheet closes. Static `enum` properties don't need this:
     * their label is always derivable from `schema.enum`/`enumLabels`.
     *
     * Keyed by session so entries don't leak across sessions: this picker
     * is only ever created for the new-session composer (`Menus.NewSession-
     * RepositoryConfig`), and that composer's `_session` tracks the
     * globally active session — so the *same* picker instance can observe
     * a sequence of different (not-yet-created) draft sessions as the user
     * switches between them. `_renderConfigPickers` evicts entries for any
     * session other than the current one on every render, so the map never
     * grows beyond the properties of the currently active session.
     */
    this._dynamicValueLabels = /* @__PURE__ */ new Map();
    this._register(autorun((reader) => {
      this._session.read(reader);
      this._renderConfigPickers();
    }));
    this._register(this._sessionsProvidersService.onDidChangeProviders((e4) => {
      for (const provider of e4.removed) {
        this._providerListeners.deleteAndDispose(provider.id);
      }
      this._watchProviders(e4.added);
      this._renderConfigPickers();
    }));
    this._watchProviders(this._sessionsProvidersService.getProviders());
    this._register(this._contextKeyService.onDidChangeContext((e4) => {
      if (e4.affectsSome(/* @__PURE__ */ new Set([IsPhoneLayoutContext.key]))) {
        this._renderConfigPickers();
      }
    }));
  }
  _watchProviders(providers2) {
    for (const provider of providers2) {
      if (!isAgentHostProvider(provider) || this._providerListeners.has(provider.id)) {
        continue;
      }
      this._providerListeners.set(provider.id, provider.onDidChangeSessionConfig(() => this._renderConfigPickers()));
    }
  }
  render(container2) {
    this._devContainerCheckbox.clear();
    this._isolationCheckbox.clear();
    this._container = append(container2, $(".sessions-chat-agent-host-config"));
    this._renderConfigPickers();
  }
  _renderConfigPickers() {
    if (!this._container) {
      return;
    }
    this._renderDisposables.clear();
    const checkboxSlots = /* @__PURE__ */ new Set([
      this._devContainerCheckbox.value?.slot,
      this._isolationCheckbox.value?.slot
    ]);
    for (const child of Array.from(this._container.children)) {
      if (!checkboxSlots.has(child)) {
        child.remove();
      }
    }
    const session = this._session.get();
    this._evictDynamicValueLabelsForOtherSessions(session?.sessionId);
    const provider = session ? this._getProvider(session.providerId) : void 0;
    const resolvedConfig = session && provider?.getSessionConfig(session.sessionId);
    if (!session || !provider || !resolvedConfig) {
      this._devContainerCheckbox.clear();
      this._isolationCheckbox.clear();
      return;
    }
    const isNewSession2 = provider.getCreateSessionConfig(session.sessionId) !== void 0;
    const isLoading = provider.isSessionConfigResolving(session.sessionId).get();
    const properties = this._orderProperties(Object.entries(resolvedConfig.schema.properties));
    let renderedIsolationCheckbox = false;
    for (const [property, schema10] of properties) {
      if (!this._isPickable(schema10)) {
        continue;
      }
      if (property === "worktreeBranchTrack" /* WorktreeBranchTrack */ || property === "worktreeCreateNewBranch" /* WorktreeCreateNewBranch */) {
        continue;
      }
      if (property === "isolation" /* Isolation */ && !schema10.enum?.includes("worktree")) {
        continue;
      }
      if (!this._shouldRenderProperty(property, schema10, isNewSession2)) {
        continue;
      }
      if (property === "autoApprove" /* AutoApprove */ && isWellKnownAutoApproveSchema2(schema10)) {
        continue;
      }
      if (property === "mode" /* Mode */ && isWellKnownModeSchema(schema10)) {
        continue;
      }
      if (property === "permissionMode" /* PermissionMode */ && isWellKnownClaudePermissionModeSchema(schema10)) {
        continue;
      }
      if (property === "codex.permissionsPreset" /* PermissionsPreset */ && isWellKnownCodexApprovalsSchema(schema10)) {
        continue;
      }
      const value2 = resolvedConfig.values[property] ?? schema10.default;
      const isReadOnly2 = this._isReadOnlyChip(property, schema10, isNewSession2);
      if (property === "isolation" /* Isolation */ && this._shouldRenderIsolationAsCheckbox(schema10)) {
        this._renderIsolationCheckbox(session.sessionId, schema10, value2, isReadOnly2, !isReadOnly2 && isLoading);
        renderedIsolationCheckbox = true;
        continue;
      }
      const slot = append(this._container, $(".sessions-chat-picker-slot"));
      if (property === "isolation" /* Isolation */) {
        this._renderDisposables.add(markOnboardingTarget(slot, "sessions.newSession.isolation"));
      }
      const trigger = renderPickerTrigger2(slot, isReadOnly2, this._renderDisposables, () => this._showPicker(provider, session.sessionId, property, schema10, trigger));
      const tooltip = property !== "branch" /* Branch */ ? schema10.description ?? schema10.title : void 0;
      if (tooltip) {
        this._renderDisposables.add(this._hoverService.setupDelayedHover(trigger, { content: tooltip }));
      }
      if (!isReadOnly2 && isLoading) {
        slot.classList.add("resolving");
        trigger.setAttribute("aria-disabled", "true");
      }
      this._renderTrigger(trigger, session.sessionId, property, schema10, value2, isReadOnly2);
    }
    if (!renderedIsolationCheckbox) {
      this._isolationCheckbox.clear();
    }
    if (isPhoneLayout(this._layoutService)) {
      this._devContainerCheckbox.clear();
    } else if (provider.isDevContainerAvailable?.(session.sessionId) && provider.isDevContainerEnabled && provider.setDevContainerEnabled) {
      this._renderDevContainerCheckbox(provider, session.sessionId);
    } else {
      this._devContainerCheckbox.clear();
    }
  }
  _isPickable(schema10) {
    if (schema10.type === "boolean") {
      return true;
    }
    if (schema10.type !== "string") {
      return false;
    }
    return !!schema10.enumDynamic || Array.isArray(schema10.enum) && schema10.enum.length > 0;
  }
  /**
   * Order the schema properties for rendering. The base implementation
   * enforces a stable visual sequence for well-known properties:
   * Isolation (worktree/folder) first, then Branch. Any other properties
   * keep their original schema order after these two. Subclasses can
   * override to impose a different deterministic visual sequence
   * (e.g. the mobile chip row groups Approvals | Branch | Worktree).
   */
  _orderProperties(properties) {
    const order = /* @__PURE__ */ new Map([
      ["isolation" /* Isolation */, 0],
      ["branch" /* Branch */, 1]
    ]);
    return properties.map(([key3, schema10], index2) => ({ key: key3, schema: schema10, index: index2 })).sort((a, b) => {
      const aRank = order.get(a.key) ?? Number.MAX_SAFE_INTEGER;
      const bRank = order.get(b.key) ?? Number.MAX_SAFE_INTEGER;
      return aRank - bRank || a.index - b.index;
    }).map(({ key: key3, schema: schema10 }) => [key3, schema10]);
  }
  /**
   * Decide whether a property's chip should be rendered for the current
   * session. The base implementation hides non-mutable properties in
   * running sessions (they would render as dead pills). Subclasses can
   * override to keep specific properties visible as readonly chips —
   * see {@link _isReadOnlyChip}.
   */
  _shouldRenderProperty(property, schema10, isNewSession2) {
    return isNewSession2 || !!schema10.sessionMutable;
  }
  /**
   * Decide whether a property's trigger should render as readonly
   * (no chevron, no popup). The base implementation defers to the
   * schema's `readOnly` flag. Subclasses that opt in to rendering
   * non-mutable chips via {@link _shouldRenderProperty} should
   * override this to also mark them readonly at runtime.
   */
  _isReadOnlyChip(property, schema10, isNewSession2) {
    return !!schema10.readOnly;
  }
  _renderTrigger(trigger, sessionId, property, schema10, value2, isReadOnly2) {
    clearNode(trigger);
    const icon2 = getConfigIcon2(property, value2);
    const iconElement = icon2 ? append(trigger, renderIcon(icon2)) : void 0;
    const labelSpan = append(trigger, $("span.sessions-chat-dropdown-label"));
    const label3 = this._getLabel(sessionId, property, schema10, value2);
    labelSpan.textContent = label3;
    trigger.setAttribute("aria-label", triggerAriaLabel(schema10.title, label3, isReadOnly2, false));
    if (property === "branch" /* Branch */ && icon2 && iconElement) {
      this._trackBranchRepositoryState(trigger, iconElement, icon2, schema10, label3, value2, isReadOnly2);
    } else if (property === "autoApprove" /* AutoApprove */) {
      trigger.classList.toggle("warning", value2 === "autopilot" || value2 === "assisted");
      trigger.classList.toggle("info", value2 === "autoApprove");
    }
  }
  /**
   * Keeps the Branch chip's glyph, aria label, and hover in sync with the
   * checked-out branch and uncommitted-changes count reported by the agent host.
   *
   * The chip only adopts the dirty state when its selected base branch matches
   * the repository's checked-out branch. Picker rows apply the same rule.
   *
   * The state is patched onto the existing nodes rather than routed through
   * `_renderConfigPickers`, which tears the whole chip row down: the host
   * re-probes git whenever it observes a file change, so a flip while the
   * user has the branch dropdown open would otherwise destroy its anchor.
   */
  _trackBranchRepositoryState(trigger, iconElement, icon2, schema10, label3, value2, isReadOnly2) {
    let appliedHoverContent;
    const hover = this._renderDisposables.add(new MutableDisposable());
    this._renderDisposables.add(autorun((reader) => {
      const session = this._session.read(reader);
      const repository = session?.workspace.read(reader)?.folders[0]?.gitRepository;
      const uncommittedChanges = typeof value2 === "string" ? getBranchUncommittedChanges(value2, repository?.branchName, repository?.uncommittedChanges) : void 0;
      const hasUncommittedChanges = uncommittedChanges !== void 0;
      iconElement.className = "";
      iconElement.classList.add(...ThemeIcon.asClassNameArray(hasUncommittedChanges ? Codicon.gitBranchChanges : icon2));
      trigger.setAttribute("aria-label", triggerAriaLabel(schema10.title, label3, isReadOnly2, hasUncommittedChanges));
      const branchName = schema10.description ?? schema10.title;
      const content = !hasUncommittedChanges ? branchName : uncommittedChanges === 1 ? localize(4945, null, branchName, uncommittedChanges) : localize(4944, null, branchName, uncommittedChanges);
      if (appliedHoverContent !== content) {
        appliedHoverContent = content;
        hover.clear();
        hover.value = content ? this._hoverService.setupDelayedHover(trigger, { content }) : void 0;
      }
    }));
  }
  /**
   * Whether the isolation property should render as a checkbox
   * (Worktree on/off) rather than a dropdown. Only on non-phone
   * layouts and only when the schema offers both folder and worktree.
   */
  _shouldRenderIsolationAsCheckbox(schema10) {
    return !isPhoneLayout(this._layoutService) && Array.isArray(schema10.enum) && schema10.enum.includes("worktree") && schema10.enum.includes("folder");
  }
  _renderIsolationCheckbox(sessionId, schema10, value2, isReadOnly2, isLoading) {
    const label3 = localize(4951, null);
    const worktreeIndex = schema10.enum?.indexOf("worktree") ?? -1;
    const tooltip = (worktreeIndex >= 0 ? schema10.enumDescriptions?.[worktreeIndex] : void 0) ?? schema10.description ?? schema10.title;
    let control = this._isolationCheckbox.value;
    if (!control || control.sessionId !== sessionId) {
      control = new ConfigCheckboxControl(
        sessionId,
        label3,
        "sessions-chat-isolation-checkbox",
        this._hoverService,
        (checked) => this._applyIsolationValue(sessionId, checked),
        "sessions.newSession.isolation"
      );
      this._isolationCheckbox.value = control;
      this._container?.prepend(control.slot);
    }
    control.update(value2 === "worktree", isReadOnly2, isLoading, tooltip);
  }
  _renderDevContainerCheckbox(provider, sessionId) {
    const label3 = localize(4949, null);
    let control = this._devContainerCheckbox.value;
    if (!control || control.sessionId !== sessionId) {
      control = new ConfigCheckboxControl(
        sessionId,
        label3,
        "sessions-chat-dev-container-checkbox",
        this._hoverService,
        (enabled) => provider.setDevContainerEnabled?.(sessionId, enabled)
      );
      this._devContainerCheckbox.value = control;
    }
    const isolationSlot = this._isolationCheckbox.value?.slot;
    if (this._container && isolationSlot?.parentElement === this._container) {
      this._container.insertBefore(control.slot, isolationSlot);
    } else {
      this._container?.prepend(control.slot);
    }
    control.update(provider.isDevContainerEnabled?.(sessionId) === true, false, false, void 0);
  }
  _applyIsolationValue(sessionId, checked) {
    const session = this._session.get();
    if (!session || session.sessionId !== sessionId) {
      return;
    }
    const provider = this._getProvider(session.providerId);
    const resolvedConfig = provider?.getSessionConfig(sessionId);
    const schema10 = resolvedConfig?.schema.properties["isolation" /* Isolation */];
    if (!provider || !schema10) {
      return;
    }
    const before = resolvedConfig.values["isolation" /* Isolation */] ?? schema10.default;
    const nextValue = checked ? "worktree" : "folder";
    reportNewChatPickerClosed(this._telemetryService, {
      id: "NewChatAgentHostSessionConfigPicker",
      name: `NewChatAgentHostSessionConfigPicker.${"isolation" /* Isolation */}`,
      optionIdBefore: typeof before === "string" ? before : void 0,
      optionIdAfter: nextValue,
      optionLabelBefore: typeof before === "string" ? this._getLabel(sessionId, "isolation" /* Isolation */, schema10, before) : void 0,
      optionLabelAfter: this._getLabel(sessionId, "isolation" /* Isolation */, schema10, nextValue),
      isPII: false
    });
    provider.setSessionConfigValue(sessionId, "isolation" /* Isolation */, nextValue).catch(() => {
    });
  }
  async _showPicker(provider, sessionId, property, schema10, trigger) {
    if (schema10.readOnly || this._actionWidgetService.isVisible) {
      return;
    }
    if (provider.isSessionConfigResolving(sessionId).get()) {
      return;
    }
    const rawItems = await this._getItems(provider, sessionId, property, schema10);
    const { items, policyRestricted } = applyAutoApproveFiltering(rawItems, property, this._configurationService);
    if (items.length === 0) {
      return;
    }
    const isAutoApproveProperty = property === "autoApprove" /* AutoApprove */;
    const currentValue = provider.getSessionConfig(sessionId)?.values[property] ?? schema10.default;
    const currentItem = items.find((i2) => isSelectedValue2(currentValue, i2.value));
    const repositoryState = property === "branch" /* Branch */ ? this._getRepositoryBranchState(sessionId) : void 0;
    const onShowChanges = property === "branch" /* Branch */ ? () => this._showChanges() : void 0;
    const actionItems = toActionItems2(property, items, currentValue, policyRestricted, repositoryState?.branchName, repositoryState?.uncommittedChanges, onShowChanges);
    const delegate = {
      onSelect: async (item) => {
        this._actionWidgetService.hide();
        reportNewChatPickerClosed(this._telemetryService, {
          id: "NewChatAgentHostSessionConfigPicker",
          name: `NewChatAgentHostSessionConfigPicker.${property}`,
          optionIdBefore: typeof currentValue === "string" ? currentValue : void 0,
          optionIdAfter: item.value,
          optionLabelBefore: currentItem?.label,
          optionLabelAfter: item.label,
          isPII: !!schema10.enumDynamic
        });
        if (isAutoApproveProperty && item.value !== "default") {
          const confirmed = await confirmAutoApproveLevel(item.value, item.label, this._dialogService, this._storageService);
          if (!confirmed) {
            return;
          }
        }
        const nextValue = schema10.type === "boolean" ? item.value === "true" : item.value;
        provider.setSessionConfigValue(sessionId, property, nextValue).catch(() => {
        });
      },
      onFilter: schema10.enumDynamic ? (query) => this._filterDelayer.trigger(async () => {
        const filteredRawItems = await this._getItems(provider, sessionId, property, schema10, query);
        const { items: filteredItems, policyRestricted: filteredPolicyRestricted } = applyAutoApproveFiltering(filteredRawItems, property, this._configurationService);
        const filteredRepositoryState = this._getRepositoryBranchState(sessionId);
        return toActionItems2(property, filteredItems, provider.getSessionConfig(sessionId)?.values[property] ?? schema10.default, filteredPolicyRestricted, filteredRepositoryState.branchName, filteredRepositoryState.uncommittedChanges, onShowChanges);
      }) : void 0,
      onHide: () => trigger.focus()
    };
    this._actionWidgetService.show(
      `agentHostSessionConfig.${property}`,
      false,
      actionItems,
      delegate,
      trigger,
      void 0,
      [],
      {
        getAriaLabel: (item) => item.ariaDescription ? localize(4952, null, item.label ?? "", item.ariaDescription) : item.label ?? "",
        getWidgetAriaLabel: () => localize(4939, null, schema10.title)
      },
      items.length > 10 ? { showFilter: true, filterPlaceholder: localize(4950, null), minWidth: 255 } : { minWidth: 255 }
    );
  }
  async _showChanges() {
    this._actionWidgetService.hide();
    const session = this._session.get();
    if (this._layoutService.isSinglePaneLayoutEnabled && session) {
      const suppression = this._layoutService.suppressEditorPartAutoVisibility();
      try {
        await this._sessionChangesService.openChangesEditor(session.resource);
      } finally {
        suppression.dispose();
      }
    }
    await this._viewsService.openView(CHANGES_VIEW_ID, true);
  }
  _getRepositoryBranchState(sessionId) {
    const session = this._session.get();
    const repository = session?.sessionId === sessionId ? session.workspace.get()?.folders[0]?.gitRepository : void 0;
    return {
      branchName: repository?.branchName,
      uncommittedChanges: repository?.uncommittedChanges
    };
  }
  async _getItems(provider, sessionId, property, schema10, query) {
    if (schema10.type === "boolean") {
      return [
        { value: "true", label: localize(4943, null) },
        { value: "false", label: localize(4940, null) }
      ];
    }
    const dynamicItems = schema10.enumDynamic ? await provider.getSessionConfigCompletions(sessionId, property, query) : void 0;
    if (dynamicItems?.length) {
      const items = dynamicItems.map((item) => this._fromCompletionItem(item));
      this._cacheDynamicValueLabels(sessionId, property, items);
      return items;
    }
    return (schema10.enum ?? []).map((value2, index2) => ({
      value: String(value2),
      label: schema10.enumLabels?.[index2] ?? String(value2),
      description: schema10.enumDescriptions?.[index2]
    }));
  }
  _fromCompletionItem(item) {
    return {
      value: item.value,
      label: item.label,
      description: item.description
    };
  }
  _dynamicValueLabelsKey(sessionId, property) {
    return `${sessionId}\0${property}`;
  }
  _cacheDynamicValueLabels(sessionId, property, items) {
    const key3 = this._dynamicValueLabelsKey(sessionId, property);
    let labels = this._dynamicValueLabels.get(key3);
    if (!labels) {
      labels = /* @__PURE__ */ new Map();
      this._dynamicValueLabels.set(key3, labels);
    }
    for (const item of items) {
      labels.set(item.value, item.label);
    }
  }
  /**
   * Drops cached labels for any session other than `sessionId`. Called on
   * every render so the cache tracks whichever session the picker is
   * currently bound to, instead of accumulating entries for every draft
   * session this (potentially long-lived) picker instance has ever shown.
   */
  _evictDynamicValueLabelsForOtherSessions(sessionId) {
    if (!sessionId) {
      return;
    }
    const prefix = `${sessionId}\0`;
    for (const key3 of this._dynamicValueLabels.keys()) {
      if (!key3.startsWith(prefix)) {
        this._dynamicValueLabels.delete(key3);
      }
    }
  }
  _getLabel(sessionId, property, schema10, value2) {
    if (schema10.type === "boolean") {
      return value2 === true ? localize(4942, null) : localize(4941, null);
    }
    if (typeof value2 === "string") {
      if (schema10.enumDynamic) {
        const key3 = this._dynamicValueLabelsKey(sessionId, property);
        const dynamicLabel = this._dynamicValueLabels.get(key3)?.get(value2);
        if (dynamicLabel) {
          return dynamicLabel;
        }
      }
      const index2 = schema10.enum?.indexOf(value2) ?? -1;
      return index2 >= 0 ? schema10.enumLabels?.[index2] ?? value2 : value2;
    }
    return schema10.title;
  }
  _getProvider(providerId) {
    const provider = this._sessionsProvidersService.getProvider(providerId);
    return provider && isAgentHostProvider(provider) ? provider : void 0;
  }
};

AgentHostSessionConfigPicker = __decorateClass([
  __decorateParam(1, IActionWidgetService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, ISessionsProvidersService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IAgentWorkbenchLayoutService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, ISessionChangesService),
  __decorateParam(11, IViewsService)
], AgentHostSessionConfigPicker);

var MobileAgentHostSessionConfigPicker = class extends AgentHostSessionConfigPicker {
  /**
   * On phone the chip lane has a fixed visual sequence — Default
   * Approvals (rendered by a separate left-side picker), then Branch,
   * then Worktree. Sort the known repo-config properties to that
   * order; unknown properties fall through to schema-declared order
   * after the known ones.
   *
   * On desktop viewports this subclass is also instantiated (see the
   * factory in `AgentHostSessionConfigPickersContribution` — it always
   * picks the mobile-aware subclass so `_showPicker` can route to the
   * bottom sheet on phones), so we must defer to the base ordering
   * (Isolation first, Branch second) when not on a phone layout.
   */
  _orderProperties(properties) {
    if (!isPhoneLayout(this._layoutService)) {
      return super._orderProperties(properties);
    }
    const order = /* @__PURE__ */ new Map([
      ["branch" /* Branch */, 0],
      ["isolation" /* Isolation */, 1]
    ]);
    return properties.slice().sort(([aKey], [bKey]) => {
      const a = order.get(aKey) ?? Number.MAX_SAFE_INTEGER;
      const b = order.get(bKey) ?? Number.MAX_SAFE_INTEGER;
      return a - b;
    });
  }
  /**
   * Keep Branch and Isolation visible in running sessions even when
   * the schema marks them non-mutable. Their value is informational
   * — the user wants to see what the running session is using —
   * and the chip renders as readonly via {@link _isReadOnlyChip}.
   * All other properties defer to the base behavior (hide if
   * non-mutable in a running session).
   */
  _shouldRenderProperty(property, schema10, isNewSession2) {
    const isUnifiedRepoProperty = property === "isolation" /* Isolation */ || property === "branch" /* Branch */;
    return isUnifiedRepoProperty || super._shouldRenderProperty(property, schema10, isNewSession2);
  }
  /**
   * Mark non-mutable properties as readonly chips in running sessions
   * so taps don't try to open a picker (which would no-op at the
   * provider boundary). The schema's own `readOnly` flag still wins.
   */
  _isReadOnlyChip(property, schema10, isNewSession2) {
    return super._isReadOnlyChip(property, schema10, isNewSession2) || !isNewSession2 && !schema10.sessionMutable;
  }
  async _showPicker(provider, sessionId, property, schema10, trigger) {
    if (!isPhoneLayout(this._layoutService)) {
      return super._showPicker(provider, sessionId, property, schema10, trigger);
    }
    if (provider.isSessionConfigResolving(sessionId).get()) {
      return;
    }
    if (property === "isolation" /* Isolation */ || property === "branch" /* Branch */) {
      await this._showUnifiedRepoSheet(provider, sessionId, trigger);
      return;
    }
    return super._showPicker(provider, sessionId, property, schema10, trigger);
  }
  async _showUnifiedRepoSheet(provider, sessionId, trigger) {
    const config = provider.getSessionConfig(sessionId);
    if (!config) {
      return;
    }
    const isolationSchema = config.schema.properties["isolation" /* Isolation */];
    const branchSchema = config.schema.properties["branch" /* Branch */];
    const [isolationItems, branchItems] = await Promise.all([
      isolationSchema && !isolationSchema.readOnly ? this._getItems(provider, sessionId, "isolation" /* Isolation */, isolationSchema) : Promise.resolve([]),
      branchSchema && !branchSchema.readOnly ? this._getItems(provider, sessionId, "branch" /* Branch */, branchSchema) : Promise.resolve([])
    ]);
    const isolationValue = config.values["isolation" /* Isolation */];
    const branchValue = config.values["branch" /* Branch */];
    const repositoryState = this._getRepositoryBranchState(sessionId);
    const sheetItems = [];
    const idToConfig = /* @__PURE__ */ new Map();
    const registerId = (property, value2, label3, isPII) => {
      const id2 = `repo-row-${idToConfig.size}`;
      idToConfig.set(id2, { property, value: value2, label: label3, isPII });
      return id2;
    };
    isolationItems.forEach((item, index2) => {
      sheetItems.push({
        id: registerId("isolation" /* Isolation */, item.value, item.label, !!isolationSchema?.enumDynamic),
        label: item.label,
        description: item.description,
        icon: getConfigIcon2("isolation" /* Isolation */, item.value),
        checked: item.value === isolationValue,
        sectionTitle: index2 === 0 ? isolationSchema?.title ?? localize(4963, null) : void 0
      });
    });
    const branchSectionTitle = branchSchema?.title ?? localize(4962, null);
    if (!branchSchema?.enumDynamic) {
      branchItems.forEach((item, index2) => {
        const uncommittedChanges = getBranchUncommittedChanges(item.value, repositoryState.branchName, repositoryState.uncommittedChanges);
        sheetItems.push({
          id: registerId("branch" /* Branch */, item.value, item.label, !!branchSchema?.enumDynamic),
          label: item.label,
          description: uncommittedChanges !== void 0 ? formatUncommittedChanges(uncommittedChanges) : item.description,
          icon: getConfigIcon2("branch" /* Branch */, item.value, uncommittedChanges !== void 0),
          checked: item.value === branchValue,
          sectionTitle: index2 === 0 ? branchSectionTitle : void 0
        });
      });
    }
    if (sheetItems.length === 0 && !branchSchema?.enumDynamic) {
      return;
    }
    let search2;
    if (branchSchema?.enumDynamic && !branchSchema.readOnly) {
      search2 = {
        placeholder: localize(4961, null),
        ariaLabel: localize(4959, null),
        resultsSectionTitle: branchSectionTitle,
        emptyMessage: localize(4960, null),
        loadItems: async (query, token) => {
          const items = query ? await this._getItems(provider, sessionId, "branch" /* Branch */, branchSchema, query) : branchItems;
          if (token.isCancellationRequested) {
            return [];
          }
          return items.map((item) => {
            const uncommittedChanges = getBranchUncommittedChanges(item.value, repositoryState.branchName, repositoryState.uncommittedChanges);
            return {
              id: registerId("branch" /* Branch */, item.value, item.label, !!branchSchema.enumDynamic),
              label: item.label,
              description: uncommittedChanges !== void 0 ? formatUncommittedChanges(uncommittedChanges) : item.description,
              icon: getConfigIcon2("branch" /* Branch */, item.value, uncommittedChanges !== void 0),
              checked: item.value === branchValue
            };
          });
        }
      };
    }
    trigger.setAttribute("aria-expanded", "true");
    await showMobilePickerSheet(
      this._layoutService.mainContainer,
      localize(4964, null),
      sheetItems,
      {
        search: search2,
        // Keep the sheet open on row taps so the user can adjust
        // both isolation mode and branch without reopening. Each
        // tap writes through immediately; Done just dismisses.
        stayOpenOnSelect: true,
        onDidSelect: (id2) => {
          const selection = idToConfig.get(id2);
          if (selection) {
            const beforeValue = provider.getSessionConfig(sessionId)?.values[selection.property];
            reportNewChatPickerClosed(this._telemetryService, {
              id: "NewChatAgentHostSessionConfigPicker",
              name: `NewChatAgentHostSessionConfigPicker.${selection.property}`,
              optionIdBefore: typeof beforeValue === "string" ? beforeValue : void 0,
              optionIdAfter: selection.value,
              optionLabelBefore: void 0,
              optionLabelAfter: selection.label,
              isPII: selection.isPII
            });
            provider.setSessionConfigValue(sessionId, selection.property, selection.value).catch(() => {
            });
          }
        }
      }
    );
    trigger.setAttribute("aria-expanded", "false");
    trigger.focus();
  }
};

var PickerActionViewItem = class extends BaseActionViewItem {
  constructor(_picker, disposable) {
    super(void 0, { id: "", label: "", enabled: true, class: void 0, tooltip: "", run: () => {
    } });
    this._picker = _picker;
    this._compact = false;
    if (disposable) {
      this._register(disposable);
    }
  }
  render(container2) {
    this.element = container2;
    this._picker.render(container2);
    container2.classList.toggle("compact-picker", this._compact);
  }
  isCompact() {
    return this._compact;
  }
  setCompact(compact2) {
    this._compact = compact2;
    this.element?.classList.toggle("compact-picker", compact2);
  }
  show(anchor) {
    const target = anchor ?? this.element;
    if (target) {
      this._picker.showPicker?.(target);
    }
  }
  dispose() {
    this._picker.dispose();
    super.dispose();
  }
};

var AgentHostSessionConfigPickerContribution = class extends Disposable {
  constructor(actionViewItemService, _layoutService) {
    super();
    this._layoutService = _layoutService;
    this._register(actionViewItemService.register(
      Menus.NewSessionRepositoryConfig,
      "sessions.agentHost.sessionConfigPicker",
      (_action, _options, scopedInstantiationService) => {
        const { session } = scopedInstantiationService.invokeFunction((accessor) => accessor.get(ISessionContext));
        return new PickerActionViewItem(scopedInstantiationService.createInstance(MobileAgentHostSessionConfigPicker, session));
      }
    ));
    this._register(actionViewItemService.register(
      Menus.NewSessionControl,
      NEW_SESSION_MODE_PICKER_ID,
      (_action, _options, scopedInstantiationService) => {
        const { session } = scopedInstantiationService.invokeFunction((accessor) => accessor.get(ISessionContext));
        return new PickerActionViewItem(scopedInstantiationService.createInstance(
          isPhoneLayout(this._layoutService) ? MobileAgentHostModePicker : AgentHostModePicker,
          session
        ));
      }
    ));
    this._register(actionViewItemService.register(
      MenuId.ChatInputSecondary,
      RUNNING_SESSION_MODE_PICKER_ID,
      (_action, _options, scopedInstantiationService) => {
        const { session } = scopedInstantiationService.invokeFunction((accessor) => accessor.get(ISessionContext));
        return new PickerActionViewItem(scopedInstantiationService.createInstance(
          isPhoneLayout(this._layoutService) ? MobileAgentHostModePicker : AgentHostModePicker,
          session
        ));
      }
    ));
    this._register(actionViewItemService.register(
      Menus.NewSessionControl,
      NEW_SESSION_PERMISSION_MODE_PICKER_ID,
      (_action, _options, scopedInstantiationService) => {
        const { session } = scopedInstantiationService.invokeFunction((accessor) => accessor.get(ISessionContext));
        return new PickerActionViewItem(scopedInstantiationService.createInstance(AgentHostClaudePermissionModePicker, session));
      }
    ));
    this._register(actionViewItemService.register(
      Menus.NewSessionControl,
      NEW_SESSION_CODEX_APPROVALS_PICKER_ID,
      (_action, _options, scopedInstantiationService) => {
        const { session } = scopedInstantiationService.invokeFunction((accessor) => accessor.get(ISessionContext));
        return new PickerActionViewItem(scopedInstantiationService.createInstance(AgentHostCodexApprovalsPicker, session));
      }
    ));
    this._register(actionViewItemService.register(
      MenuId.ChatInputSecondary,
      RUNNING_SESSION_PERMISSION_MODE_PICKER_ID,
      (_action, _options, scopedInstantiationService) => {
        const { session } = scopedInstantiationService.invokeFunction((accessor) => accessor.get(ISessionContext));
        return new PickerActionViewItem(scopedInstantiationService.createInstance(AgentHostClaudePermissionModePicker, session));
      }
    ));
    this._register(actionViewItemService.register(
      MenuId.ChatInputSecondary,
      RUNNING_SESSION_CODEX_APPROVALS_PICKER_ID,
      (_action, _options, scopedInstantiationService) => {
        const { session } = scopedInstantiationService.invokeFunction((accessor) => accessor.get(ISessionContext));
        return new PickerActionViewItem(scopedInstantiationService.createInstance(AgentHostCodexApprovalsPicker, session));
      }
    ));
  }
  static {
    this.ID = "sessions.contrib.agentHostSessionConfigPicker";
  }
};

AgentHostSessionConfigPickerContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IWorkbenchLayoutService)
], AgentHostSessionConfigPickerContribution);

var NEW_SESSION_APPROVE_PICKER_ID = "sessions.agentHost.newSessionApprovePicker";

var NEW_SESSION_PERMISSION_MODE_PICKER_ID = "sessions.agentHost.newSessionPermissionModePicker";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: NEW_SESSION_PERMISSION_MODE_PICKER_ID,
      title: localize2(4934, "Approvals"),
      f1: false,
      menu: [{
        id: Menus.NewSessionControl,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.or(IsActiveSessionLocalAgentHost, IsActiveSessionRemoteAgentHost)
      }]
    });
  }
  async run() {
  }
});

var NEW_SESSION_CODEX_APPROVALS_PICKER_ID = "sessions.agentHost.newSessionCodexApprovalsPicker";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: NEW_SESSION_CODEX_APPROVALS_PICKER_ID,
      title: localize2(4932, "Approvals"),
      f1: false,
      menu: [{
        id: Menus.NewSessionControl,
        group: "navigation",
        order: 3,
        when: ContextKeyExpr.or(IsActiveSessionLocalAgentHost, IsActiveSessionRemoteAgentHost)
      }]
    });
  }
  async run() {
  }
});

var NEW_SESSION_MODE_PICKER_ID = "sessions.agentHost.newSessionModePicker";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: NEW_SESSION_MODE_PICKER_ID,
      title: localize2(4933, "Agent Mode"),
      f1: false,
      menu: [{
        id: Menus.NewSessionControl,
        group: "navigation",
        order: 0,
        // On phone the {@link MobileChatInputConfigPicker} replaces
        // this picker with a unified mode + model bottom sheet, so
        // gate this desktop-only Action out of phone layouts.
        when: ContextKeyExpr.and(
          ContextKeyExpr.or(IsActiveSessionLocalAgentHost, IsActiveSessionRemoteAgentHost),
          IsPhoneLayoutContext.negate()
        )
      }]
    });
  }
  async run() {
  }
});

var RUNNING_SESSION_CONFIG_PICKER_ID = "sessions.agentHost.runningSessionConfigPicker";

var RUNNING_SESSION_PERMISSION_MODE_PICKER_ID = "sessions.agentHost.runningSessionPermissionModePicker";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RUNNING_SESSION_PERMISSION_MODE_PICKER_ID,
      title: localize2(4938, "Approvals"),
      f1: false,
      menu: [{
        id: MenuId.ChatInputSecondary,
        group: "navigation",
        order: 11,
        when: ChatContextKeyExprs.isAgentHostSession
      }]
    });
  }
  async run() {
  }
});

var RUNNING_SESSION_CODEX_APPROVALS_PICKER_ID = "sessions.agentHost.runningSessionCodexApprovalsPicker";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RUNNING_SESSION_CODEX_APPROVALS_PICKER_ID,
      title: localize2(4935, "Approvals"),
      f1: false,
      menu: [{
        id: MenuId.ChatInputSecondary,
        group: "navigation",
        order: 12,
        when: ChatContextKeyExprs.isAgentHostSession
      }]
    });
  }
  async run() {
  }
});

var RUNNING_SESSION_MODE_PICKER_ID = "sessions.agentHost.runningSessionModePicker";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RUNNING_SESSION_MODE_PICKER_ID,
      title: localize2(4937, "Agent Mode"),
      f1: false,
      menu: [{
        id: MenuId.ChatInputSecondary,
        group: "navigation",
        order: 9,
        // Hide the agent mode picker while a delegation (continue in) target is pending.
        when: ContextKeyExpr.and(ChatContextKeyExprs.isAgentHostSession, ChatContextKeys.hasPendingDelegationTarget.negate())
      }]
    });
  }
  async run(accessor) {
    showActiveSessionModePicker(accessor);
  }
});

registerWorkbenchContribution2(AgentHostSessionConfigPickerContribution.ID, AgentHostSessionConfigPickerContribution, WorkbenchPhase.AfterRestored);
export { showActiveSessionModePicker, getConfigIcon2, formatUncommittedChanges, getBranchUncommittedChanges, toActionItems2, isSelectedValue2, renderPickerTrigger2, applyAutoApproveFiltering, confirmAutoApproveLevel, triggerAriaLabel, IsActiveSessionRemoteAgentHost, IsActiveSessionLocalAgentHost, ConfigCheckboxControl, AgentHostSessionConfigPicker, MobileAgentHostSessionConfigPicker, PickerActionViewItem, AgentHostSessionConfigPickerContribution, NEW_SESSION_APPROVE_PICKER_ID, NEW_SESSION_PERMISSION_MODE_PICKER_ID, NEW_SESSION_CODEX_APPROVALS_PICKER_ID, NEW_SESSION_MODE_PICKER_ID, RUNNING_SESSION_CONFIG_PICKER_ID, RUNNING_SESSION_PERMISSION_MODE_PICKER_ID, RUNNING_SESSION_CODEX_APPROVALS_PICKER_ID, RUNNING_SESSION_MODE_PICKER_ID };
