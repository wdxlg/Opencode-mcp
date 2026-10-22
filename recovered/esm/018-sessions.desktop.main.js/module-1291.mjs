// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/externalUriOpener/common/configuration.ts
import { workbenchConfigurationNodeBase } from "./module-1113.mjs";
import { localize } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/workbench/contrib/externalUriOpener/common/configuration.ts
var defaultExternalUriOpenerId = "default";

var externalUriOpenersSettingId = "workbench.externalUriOpeners";

var externalUriOpenerIdSchemaAddition = {
  type: "string",
  enum: []
};

var exampleUriPatterns = `
- \`https://microsoft.com\`: Matches this specific domain using https
- \`https://microsoft.com:8080\`: Matches this specific domain on this port using https
- \`https://microsoft.com:*\`: Matches this specific domain on any port using https
- \`https://microsoft.com/foo\`: Matches \`https://microsoft.com/foo\` and \`https://microsoft.com/foo/bar\`, but not \`https://microsoft.com/foobar\` or \`https://microsoft.com/bar\`
- \`https://*.microsoft.com\`: Match all domains ending in \`microsoft.com\` using https
- \`microsoft.com\`: Match this specific domain using either http or https
- \`*.microsoft.com\`: Match all domains ending in \`microsoft.com\` using either http or https
- \`http://192.168.0.1\`: Matches this specific IP using http
- \`http://192.168.0.*\`: Matches all IP's with this prefix using http
- \`*\`: Match all domains using either http or https`;

var externalUriOpenersConfigurationNode = {
  ...workbenchConfigurationNodeBase,
  properties: {
    [externalUriOpenersSettingId]: {
      type: "object",
      markdownDescription: localize(15664, null),
      defaultSnippets: [{
        body: {
          "example.com": "$1"
        }
      }],
      additionalProperties: {
        anyOf: [
          {
            type: "string",
            markdownDescription: localize(15666, null, exampleUriPatterns)
          },
          {
            type: "string",
            markdownDescription: localize(15666, null, exampleUriPatterns),
            enum: [defaultExternalUriOpenerId],
            enumDescriptions: [localize(15665, null)]
          },
          externalUriOpenerIdSchemaAddition
        ]
      }
    }
  }
};

function updateContributedOpeners(enumValues, enumDescriptions) {
  externalUriOpenerIdSchemaAddition.enum = enumValues;
  externalUriOpenerIdSchemaAddition.enumDescriptions = enumDescriptions;
  Registry.as(Extensions4.Configuration).notifyConfigurationSchemaUpdated(externalUriOpenersConfigurationNode);
}
export { updateContributedOpeners, defaultExternalUriOpenerId, externalUriOpenersSettingId, externalUriOpenerIdSchemaAddition, exampleUriPatterns, externalUriOpenersConfigurationNode };
