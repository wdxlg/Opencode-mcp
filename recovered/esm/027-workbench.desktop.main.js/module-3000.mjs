// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpServerEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0928.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { join } from "./module-0026.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpServerEditorInput.ts
var MCPServerEditorIcon = registerIcon("mcp-server-editor-icon", Codicon.mcp, localize(17069, null));

var McpServerEditorInput = class _McpServerEditorInput extends EditorInput {
  constructor(_mcpServer) {
    super();
    this._mcpServer = _mcpServer;
  }
  static {
    this.ID = "workbench.mcpServer.input2";
  }
  get typeId() {
    return _McpServerEditorInput.ID;
  }
  get capabilities() {
    return 2 /* Readonly */ | 8 /* Singleton */;
  }
  get resource() {
    return URI.from({
      scheme: Schemas.extension,
      path: join(this.mcpServer.id, "mcpServer")
    });
  }
  get mcpServer() {
    return this._mcpServer;
  }
  getName() {
    return localize(17068, null, this._mcpServer.label);
  }
  getIcon() {
    return MCPServerEditorIcon;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return other instanceof _McpServerEditorInput && this._mcpServer.id === other._mcpServer.id;
  }
};
export { MCPServerEditorIcon, McpServerEditorInput };
