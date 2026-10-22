// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/remoteAgentHostLocationPreferenceDialog.ts
import { localize } from "./module-0001.mjs";
import { MarkdownString, createMarkdownCommandLink } from "./module-0462.mjs";
import { severity_default } from "./module-0266.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/platform/agentHost/common/remoteAgentHostLocationPreferenceDialog.ts
var ChangeRemoteAgentHostLocationPreferenceCommandId = "workbench.action.sessions.changeRemoteAgentHostLocationPreference";

function withCurrentPreferenceMarker(detail2, preference, currentPreference) {
  return preference === currentPreference ? detail2 + localize(2140, null) : detail2;
}

function remoteAgentHostLocationOptions(productName, currentPreference) {
  return [
    {
      preference: "dedicated",
      label: localize(2141, null),
      detail: withCurrentPreferenceMarker(localize(2142, null, productName), "dedicated", currentPreference)
    },
    {
      preference: "editor",
      label: localize(2143, null, productName),
      detail: withCurrentPreferenceMarker(localize(2144, null, productName), "editor", currentPreference)
    }
  ];
}

function orderRemoteAgentHostLocationOptions(productName, currentPreference) {
  const options3 = remoteAgentHostLocationOptions(productName, currentPreference);
  const current = options3.find((option2) => option2.preference === currentPreference);
  if (!current) {
    return options3;
  }
  return [current, ...options3.filter((option2) => option2 !== current)];
}

async function promptRemoteAgentHostLocationPreference(dialogService, hostLabel, productName, currentPreference, token) {
  const options3 = orderRemoteAgentHostLocationOptions(productName, currentPreference);
  const changeCommandLabel = localize(2139, null);
  const changeCommandLink = createMarkdownCommandLink({
    text: changeCommandLabel,
    id: ChangeRemoteAgentHostLocationPreferenceCommandId,
    tooltip: changeCommandLabel
  });
  const { result } = await dialogService.prompt({
    type: severity_default.Info,
    message: localize(2145, null, hostLabel),
    detail: new MarkdownString(
      localize(2146, null, changeCommandLink),
      { isTrusted: { enabledCommands: [ChangeRemoteAgentHostLocationPreferenceCommandId] } }
    ),
    cancelButton: true,
    buttons: options3.map((option2) => ({
      label: option2.label,
      run: () => option2.preference
    })),
    custom: {
      icon: Codicon.remote,
      buttonDetails: options3.map((option2) => option2.detail),
      // Full-width stacked buttons read better for these longer,
      // descriptive two-choice options than the default side-by-side layout.
      alignment: "vertical"
    },
    token
  });
  return result;
}
export { withCurrentPreferenceMarker, remoteAgentHostLocationOptions, orderRemoteAgentHostLocationOptions, promptRemoteAgentHostLocationPreference, ChangeRemoteAgentHostLocationPreferenceCommandId };
