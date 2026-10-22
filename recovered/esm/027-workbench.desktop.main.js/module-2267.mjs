// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatCodeCitationContentPart.ts
import { Disposable } from "./module-0012.mjs";
import { getCodeCitationsMessage } from "./module-1193.mjs";
import { h } from "./module-0075.mjs";
import { Button } from "./module-0546.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatCodeCitationContentPart.ts
var ChatCodeCitationContentPart = class extends Disposable {
  constructor(citations, context2, editorService, telemetryService) {
    super();
    this.editorService = editorService;
    this.telemetryService = telemetryService;
    const label3 = getCodeCitationsMessage(citations.citations);
    const elements = h(".chat-code-citation-message@root", [
      h("span.chat-code-citation-label@label"),
      h(".chat-code-citation-button-container@button")
    ]);
    elements.label.textContent = label3 + " - ";
    const button = this._register(new Button(elements.button, {
      buttonBackground: void 0,
      buttonBorder: void 0,
      buttonForeground: void 0,
      buttonHoverBackground: void 0,
      buttonSecondaryBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryHoverBackground: void 0,
      buttonSeparator: void 0
    }));
    button.label = localize(11892, null);
    this._register(button.onDidClick(() => {
      const citationText = `# Code Citations

` + citations.citations.map((c) => `## License: ${c.license}
${c.value.toString()}

\`\`\`
${c.snippet}
\`\`\`

`).join("\n");
      this.editorService.openEditor({ resource: void 0, contents: citationText, languageId: "markdown" });
      this.telemetryService.publicLog2("openedChatCodeCitations");
    }));
    this.domNode = elements.root;
  }
  hasSameContent(other, followingContent, element) {
    return other.kind === "codeCitations";
  }
};

ChatCodeCitationContentPart = __decorateClass([
  __decorateParam(2, IEditorService),
  __decorateParam(3, ITelemetryService)
], ChatCodeCitationContentPart);
export { ChatCodeCitationContentPart };
