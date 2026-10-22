// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/promptCodingAgentActionOverlay.ts
import { Disposable } from "./module-0012.mjs";
import { $ } from "./module-0075.mjs";
import { Button } from "./module-0546.mjs";
import { localize } from "./module-0001.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { PROMPT_LANGUAGE_ID } from "./module-0985.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IRemoteCodingAgentsService } from "./module-2804.mjs";
import { IPromptsService } from "./module-0986.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/promptCodingAgentActionOverlay.ts
var PromptCodingAgentActionOverlayWidget = class extends Disposable {
  constructor(_editor, _commandService, _contextKeyService, _remoteCodingAgentService, _promptsService) {
    super();
    this._editor = _editor;
    this._commandService = _commandService;
    this._contextKeyService = _contextKeyService;
    this._remoteCodingAgentService = _remoteCodingAgentService;
    this._promptsService = _promptsService;
    this._isVisible = false;
    this._domNode = $(".prompt-coding-agent-action-overlay");
    this._button = this._register(new Button(this._domNode, {
      supportIcons: true,
      title: localize(11542, null)
    }));
    this._button.element.style.background = "var(--vscode-button-background)";
    this._button.element.style.color = "var(--vscode-button-foreground)";
    this._button.label = localize(11543, null, "$(cloud-upload)");
    this._register(this._button.onDidClick(async () => {
      await this._execute();
    }));
    this._register(this._contextKeyService.onDidChangeContext(() => {
      this._updateVisibility();
    }));
    this._register(this._editor.onDidChangeModel(() => {
      this._updateVisibility();
    }));
    this._register(this._editor.onDidLayoutChange(() => {
      if (this._isVisible) {
        this._editor.layoutOverlayWidget(this);
      }
    }));
    this._updateVisibility();
  }
  static {
    this.ID = "promptCodingAgentActionOverlay";
  }
  getId() {
    return PromptCodingAgentActionOverlayWidget.ID;
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    if (!this._isVisible) {
      return null;
    }
    return {
      preference: 1 /* BOTTOM_RIGHT_CORNER */
    };
  }
  _updateVisibility() {
    const enableRemoteCodingAgentPromptFileOverlay = ChatContextKeys.enableRemoteCodingAgentPromptFileOverlay.getValue(this._contextKeyService);
    const hasRemoteCodingAgent = ChatContextKeys.hasRemoteCodingAgent.getValue(this._contextKeyService);
    const model = this._editor.getModel();
    const isPromptFile = model?.getLanguageId() === PROMPT_LANGUAGE_ID;
    const shouldBeVisible = !!(isPromptFile && enableRemoteCodingAgentPromptFileOverlay && hasRemoteCodingAgent);
    if (shouldBeVisible !== this._isVisible) {
      this._isVisible = shouldBeVisible;
      if (this._isVisible) {
        this._editor.addOverlayWidget(this);
      } else {
        this._editor.removeOverlayWidget(this);
      }
    }
  }
  async _execute() {
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    this._button.enabled = false;
    try {
      const promptContent = model.getValue();
      const promptName = await this._promptsService.getPromptSlashCommandName(model.uri, CancellationToken.None);
      const agents = this._remoteCodingAgentService.getAvailableAgents();
      const agent = agents[0];
      if (!agent) {
        return;
      }
      await this._commandService.executeCommand(agent.command, {
        userPrompt: promptName,
        summary: promptContent,
        source: "prompt"
      });
    } finally {
      this._button.enabled = true;
    }
  }
  dispose() {
    if (this._isVisible) {
      this._editor.removeOverlayWidget(this);
    }
    super.dispose();
  }
};

PromptCodingAgentActionOverlayWidget = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IRemoteCodingAgentsService),
  __decorateParam(4, IPromptsService)
], PromptCodingAgentActionOverlayWidget);
export { PromptCodingAgentActionOverlayWidget };
