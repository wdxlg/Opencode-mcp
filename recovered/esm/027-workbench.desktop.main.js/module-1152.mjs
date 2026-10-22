// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/autoReplies/common/terminalAutoRepliesConfiguration.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminalContrib/autoReplies/common/terminalAutoRepliesConfiguration.ts
var terminalAutoRepliesConfiguration = {
  ["terminal.integrated.autoReplies" /* AutoReplies */]: {
    markdownDescription: localize(20401, null, '`"Terminate batch job (Y/N)": "Y\\r"`', '`"\\r"`'),
    type: "object",
    additionalProperties: {
      oneOf: [
        {
          type: "string",
          description: localize(20402, null)
        },
        { type: "null" }
      ]
    },
    restricted: true,
    default: {}
  }
};
export { terminalAutoRepliesConfiguration };
