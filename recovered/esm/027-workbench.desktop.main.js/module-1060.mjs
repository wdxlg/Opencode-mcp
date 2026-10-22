// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugContext.ts
import { CONTEXT_CAN_VIEW_MEMORY, CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT, CONTEXT_DEBUG_TYPE, CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, CONTEXT_VARIABLE_IS_READONLY, CONTEXT_VARIABLE_TYPE } from "./module-1057.mjs";


// src/vs/workbench/contrib/debug/common/debugContext.ts
function getContextForVariable(parentContext, variable, additionalContext = []) {
  const session = variable.getSession();
  const contextKeys = [
    [CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT.key, variable.variableMenuContext || ""],
    [CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT.key, !!variable.evaluateName],
    [CONTEXT_CAN_VIEW_MEMORY.key, !!session?.capabilities.supportsReadMemoryRequest && variable.memoryReference !== void 0],
    [CONTEXT_VARIABLE_IS_READONLY.key, !!variable.presentationHint?.attributes?.includes("readOnly") || variable.presentationHint?.lazy],
    [CONTEXT_VARIABLE_TYPE.key, variable.type],
    [CONTEXT_DEBUG_TYPE.key, session?.configuration.type],
    ...additionalContext
  ];
  return parentContext.createOverlay(contextKeys);
}
export { getContextForVariable };
