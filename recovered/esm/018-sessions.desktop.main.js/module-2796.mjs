// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentHostCompletionAction.ts


// src/vs/workbench/contrib/chat/browser/agentHostCompletionAction.ts
// OpenCode: 旧「默认审批」体系（autoApprove / autopilot 级别与提权确认框）已删除。
// agent-host 补全项若会把会话提升到自动批准或 Autopilot（如 /yolo、/allow-all、/autopilot），工作台不再提供也不再应用。
function isElevatedApprovalConfig(config) {
  if (!config) {
    return false;
  }
  const autoApprove = config["autoApprove" /* AutoApprove */];
  return autoApprove !== void 0 && autoApprove !== "default" || config["mode" /* Mode */] === "autopilot";
}

async function applyAgentHostCompletionAction(action, apply2) {
  const config = action.applyConfig;
  if (!config || Object.keys(config).length === 0) {
    return true;
  }
  if (isElevatedApprovalConfig(config)) {
    return false;
  }
  await apply2(config);
  return true;
}

function isBlockedCompletionAction(action) {
  return isElevatedApprovalConfig(action.applyConfig);
}

export { applyAgentHostCompletionAction, isElevatedApprovalConfig, isBlockedCompletionAction };
