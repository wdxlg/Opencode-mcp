// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/typeAhead/common/terminalTypeAheadConfiguration.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminalContrib/typeAhead/common/terminalTypeAheadConfiguration.ts
var DEFAULT_LOCAL_ECHO_EXCLUDE = ["vim", "vi", "nano", "tmux"];

var terminalTypeAheadConfiguration = {
  ["terminal.integrated.localEchoLatencyThreshold" /* LocalEchoLatencyThreshold */]: {
    description: localize(20970, null),
    type: "integer",
    minimum: -1,
    default: 30,
    tags: ["preview"]
  },
  ["terminal.integrated.localEchoEnabled" /* LocalEchoEnabled */]: {
    markdownDescription: localize(20965, null, "`#terminal.integrated.localEchoLatencyThreshold#`"),
    type: "string",
    enum: ["on", "off", "auto"],
    enumDescriptions: [
      localize(20968, null),
      localize(20967, null),
      localize(20966, null)
    ],
    default: "off",
    tags: ["preview"]
  },
  ["terminal.integrated.localEchoExcludePrograms" /* LocalEchoExcludePrograms */]: {
    description: localize(20969, null),
    type: "array",
    items: {
      type: "string",
      uniqueItems: true
    },
    default: DEFAULT_LOCAL_ECHO_EXCLUDE,
    tags: ["preview"]
  },
  ["terminal.integrated.localEchoStyle" /* LocalEchoStyle */]: {
    description: localize(20971, null),
    default: "dim",
    anyOf: [
      {
        enum: ["bold", "dim", "italic", "underlined", "inverted", "#ff0000"]
      },
      {
        type: "string",
        format: "color-hex"
      }
    ],
    tags: ["preview"]
  }
};
export { DEFAULT_LOCAL_ECHO_EXCLUDE, terminalTypeAheadConfiguration };
