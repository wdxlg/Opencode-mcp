// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedExtensionPoint.ts
import { localize } from "./module-0001.mjs";
import { ExtensionsRegistry } from "./module-0878.mjs";


// src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedExtensionPoint.ts
var titleTranslated = localize(21956, null);

var walkthroughsExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "walkthroughs",
  jsonSchema: {
    description: localize(21957, null),
    type: "array",
    items: {
      type: "object",
      required: ["id", "title", "description", "steps"],
      defaultSnippets: [{ body: { "id": "$1", "title": "$2", "description": "$3", "steps": [] } }],
      properties: {
        id: {
          type: "string",
          description: localize(21961, null)
        },
        title: {
          type: "string",
          description: localize(21988, null)
        },
        icon: {
          type: "string",
          description: localize(21960, null)
        },
        description: {
          type: "string",
          description: localize(21958, null)
        },
        featuredFor: {
          type: "array",
          description: localize(21959, null),
          items: {
            type: "string"
          }
        },
        when: {
          type: "string",
          description: localize(21989, null)
        },
        steps: {
          type: "array",
          description: localize(21962, null),
          items: {
            type: "object",
            required: ["id", "title", "media"],
            defaultSnippets: [{
              body: {
                "id": "$1",
                "title": "$2",
                "description": "$3",
                "completionEvents": ["$5"],
                "media": {}
              }
            }],
            properties: {
              id: {
                type: "string",
                description: localize(21975, null)
              },
              title: {
                type: "string",
                description: localize(21986, null)
              },
              description: {
                type: "string",
                description: localize(21972, null, `[${titleTranslated}](command:myext.command)`, `[${titleTranslated}](command:toSide:myext.command)`, `[${titleTranslated}](https://aka.ms)`)
              },
              button: {
                deprecationMessage: localize(21963, null, `[${titleTranslated}](command:myext.command)`, `[${titleTranslated}](command:toSide:myext.command)`, `[${titleTranslated}](https://aka.ms)`)
              },
              media: {
                type: "object",
                description: localize(21976, null),
                oneOf: [
                  {
                    required: ["image", "altText"],
                    additionalProperties: false,
                    properties: {
                      path: {
                        deprecationMessage: localize(21955, null)
                      },
                      image: {
                        description: localize(21982, null),
                        oneOf: [
                          {
                            type: "string"
                          },
                          {
                            type: "object",
                            required: ["dark", "light", "hc", "hcLight"],
                            properties: {
                              dark: {
                                description: localize(21978, null),
                                type: "string"
                              },
                              light: {
                                description: localize(21981, null),
                                type: "string"
                              },
                              hc: {
                                description: localize(21979, null),
                                type: "string"
                              },
                              hcLight: {
                                description: localize(21980, null),
                                type: "string"
                              }
                            }
                          }
                        ]
                      },
                      altText: {
                        type: "string",
                        description: localize(21977, null)
                      }
                    }
                  },
                  {
                    required: ["svg", "altText"],
                    additionalProperties: false,
                    properties: {
                      svg: {
                        description: localize(21983, null),
                        type: "string"
                      },
                      altText: {
                        type: "string",
                        description: localize(21977, null)
                      }
                    }
                  },
                  {
                    required: ["markdown"],
                    additionalProperties: false,
                    properties: {
                      path: {
                        deprecationMessage: localize(21955, null)
                      },
                      markdown: {
                        description: localize(21984, null),
                        type: "string"
                      }
                    }
                  }
                ]
              },
              completionEvents: {
                description: localize(21964, null),
                type: "array",
                items: {
                  type: "string",
                  defaultSnippets: [
                    {
                      label: "onCommand",
                      description: localize(21966, null),
                      body: "onCommand:${1:commandId}"
                    },
                    {
                      label: "onLink",
                      description: localize(21968, null),
                      body: "onLink:${2:linkId}"
                    },
                    {
                      label: "onView",
                      description: localize(21970, null),
                      body: "onView:${2:viewId}"
                    },
                    {
                      label: "onSettingChanged",
                      description: localize(21969, null),
                      body: "onSettingChanged:${2:settingName}"
                    },
                    {
                      label: "onContext",
                      description: localize(21967, null),
                      body: "onContext:${2:key}"
                    },
                    {
                      label: "onExtensionInstalled",
                      description: localize(21965, null),
                      body: "onExtensionInstalled:${3:extensionId}"
                    },
                    {
                      label: "onStepSelected",
                      description: localize(21971, null),
                      body: "onStepSelected"
                    }
                  ]
                }
              },
              doneOn: {
                description: localize(21973, null),
                deprecationMessage: localize(21974, null),
                type: "object",
                required: ["command"],
                defaultSnippets: [{ "body": { command: "$1" } }],
                properties: {
                  "command": {
                    description: localize(21985, null),
                    type: "string"
                  }
                }
              },
              when: {
                type: "string",
                description: localize(21987, null)
              }
            }
          }
        }
      }
    }
  },
  activationEventsGenerator: function* (walkthroughContributions) {
    for (const walkthroughContribution of walkthroughContributions) {
      if (walkthroughContribution.id) {
        yield `onWalkthrough:${walkthroughContribution.id}`;
      }
    }
  }
});
export { titleTranslated, walkthroughsExtensionPoint };
