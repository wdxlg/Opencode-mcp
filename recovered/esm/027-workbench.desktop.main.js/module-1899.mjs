// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatSessionService.ts
import { createDecorator } from "./module-0077.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IChatService } from "./module-0972.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChatSessionService.ts
var IInlineChatSessionService = createDecorator("IInlineChatSessionService");

async function askInPanelChat(accessor, request2, state, fileContext) {
  const widgetService = accessor.get(IChatWidgetService);
  const chatService = accessor.get(IChatService);
  if (!request2) {
    return;
  }
  const newModelRef = chatService.startNewLocalSession("panel" /* Chat */);
  const newModel = newModelRef.object;
  newModel.inputModel.setState({
    ...state,
    mode: { id: "agent", kind: "agent" /* Agent */ }
  });
  const widget = await widgetService.openSession(newModelRef.object.sessionResource);
  newModelRef.dispose();
  if (widget && fileContext && !fileContext.selection.isEmpty()) {
    await widget.attachmentModel.addFile(fileContext.uri, fileContext.selection);
  }
  widget?.acceptInput(request2.message.text);
}

async function continueInPanelChat(accessor, session) {
  const request2 = session.chatModel.getRequests().at(-1);
  if (!request2) {
    return;
  }
  await askInPanelChat(accessor, request2, session.chatModel.inputModel.state.get(), { uri: session.uri, selection: session.initialSelection });
  session.dispose();
}

function rephraseInlineChat(accessor, session) {
  const request2 = session.chatModel.getRequests().at(-1);
  if (!request2) {
    return void 0;
  }
  accessor.get(IChatService).removeRequest(session.chatModel.sessionResource, request2.id);
  session.chatModel.inputModel.setState({ inputText: request2.message.text });
  session.setTerminationState(void 0);
  return request2.message.text;
}
export { askInPanelChat, continueInPanelChat, rephraseInlineChat, IInlineChatSessionService };
