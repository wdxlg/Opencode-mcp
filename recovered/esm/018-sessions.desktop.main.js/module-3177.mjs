// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentChatSurfaceMeta.ts



// src/vs/platform/agentHost/common/meta/agentChatSurfaceMeta.ts
var VSCODE_CHAT_SURFACE_META_KEY = "vscode.chat.surface";

function withChatSurfaceMeta(meta, surface) {
  if (!surface) {
    return meta;
  }
  const serializedSurface = surface.surface === "terminal" ? {
    surface: surface.surface,
    ...surface.shellType !== void 0 ? { shellType: surface.shellType } : {},
    osName: surface.osName
  } : {
    surface: "editorInline",
    ...surface.languageId !== void 0 ? { languageId: surface.languageId } : {},
    ...surface.targetUri !== void 0 ? { targetUri: surface.targetUri } : {}
  };
  return {
    ...meta ?? {},
    [VSCODE_CHAT_SURFACE_META_KEY]: serializedSurface
  };
}
export { withChatSurfaceMeta, VSCODE_CHAT_SURFACE_META_KEY };
