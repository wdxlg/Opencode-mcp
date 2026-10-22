// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentPluginEditor/agentPluginEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0928.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/workbench/contrib/chat/browser/agentPluginEditor/agentPluginEditorInput.ts
var AgentPluginEditorIcon = registerIcon("agent-plugin-editor-icon", Codicon.extensions, localize(8900, null));

function getPluginId(item) {
  if (item.kind === "installed" /* Installed */) {
    return item.plugin.uri.toString();
  }
  return `${item.marketplaceReference.canonicalId}/${item.source}`;
}

var AgentPluginEditorInput = class _AgentPluginEditorInput extends EditorInput {
  constructor(_item) {
    super();
    this._item = _item;
  }
  static {
    this.ID = "workbench.agentPlugin.input";
  }
  get typeId() {
    return _AgentPluginEditorInput.ID;
  }
  get capabilities() {
    return super.capabilities | 8 /* Singleton */ | 2048 /* RequiresModal */;
  }
  get resource() {
    return URI.from({
      scheme: Schemas.extension,
      path: `/agentPlugin/${encodeURIComponent(getPluginId(this._item))}`
    });
  }
  get item() {
    return this._item;
  }
  getName() {
    return localize(8901, null, this._item.name);
  }
  getIcon() {
    return AgentPluginEditorIcon;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return other instanceof _AgentPluginEditorInput && getPluginId(this._item) === getPluginId(other._item);
  }
};
export { getPluginId, AgentPluginEditorIcon, AgentPluginEditorInput };
