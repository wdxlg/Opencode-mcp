// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/monitoring/types.ts



// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/monitoring/types.ts
var OutputMonitorState = /* @__PURE__ */ ((OutputMonitorState2) => {
  OutputMonitorState2["Initial"] = "Initial";
  OutputMonitorState2["Idle"] = "Idle";
  OutputMonitorState2["PollingForIdle"] = "PollingForIdle";
  OutputMonitorState2["Prompting"] = "Prompting";
  OutputMonitorState2["Timeout"] = "Timeout";
  OutputMonitorState2["Active"] = "Active";
  OutputMonitorState2["Cancelled"] = "Cancelled";
  return OutputMonitorState2;
})(OutputMonitorState || {});
export { OutputMonitorState };
