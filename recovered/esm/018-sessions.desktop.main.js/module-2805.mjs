// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchMessage.ts
import { $, append } from "./module-0075.mjs";
import { parseLinkedText } from "./module-1328.mjs";
import { SeverityIcon } from "./module-0699.mjs";
import { severity_default } from "./module-0266.mjs";
import { Link } from "./module-0550.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/search/browser/searchMessage.ts
var renderSearchMessage = (message, instantiationService, notificationService, openerService, commandService, disposableStore, triggerSearch) => {
  const div = $("div.providerMessage");
  const linkedText = parseLinkedText(message.text);
  append(
    div,
    $("." + SeverityIcon.className(
      message.type === 1 /* Information */ ? severity_default.Info : severity_default.Warning
    ).split(" ").join("."))
  );
  for (const node of linkedText.nodes) {
    if (typeof node === "string") {
      append(div, document.createTextNode(node));
    } else {
      const link2 = instantiationService.createInstance(Link, div, node, {
        opener: async (href) => {
          if (!message.trusted) {
            return;
          }
          const parsed = URI.parse(href, true);
          if (parsed.scheme === Schemas.command && message.trusted) {
            const result = await commandService.executeCommand(parsed.path);
            if (result?.triggerSearch) {
              triggerSearch();
            }
          } else if (parsed.scheme === Schemas.https) {
            openerService.open(parsed);
          } else {
            if (parsed.scheme === Schemas.command && !message.trusted) {
              notificationService.error(localize(19170, null, href));
            } else {
              notificationService.error(localize(19169, null, href));
            }
          }
        }
      });
      disposableStore.add(link2);
    }
  }
  return div;
};
export { renderSearchMessage };
