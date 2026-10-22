// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostToolUtils.ts



// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostToolUtils.ts
function toolDataToDefinition(tool) {
  const definition = {
    name: tool.toolReferenceName ?? tool.id,
    title: tool.displayName,
    description: tool.modelDescription
  };
  if (tool.inputSchema?.type === "object") {
    definition.inputSchema = tool.inputSchema;
  }
  return definition;
}
export { toolDataToDefinition };
