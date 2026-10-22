// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/alternativeRecommendation.ts



// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/alternativeRecommendation.ts
var previouslyRecommededInSession = false;

var terminalCommands = [
  {
    commands: [
      new RegExp(/^python3? -m pip install(\b)/),
      new RegExp(/^pip3? install(\b)/)
    ],
    tags: ["python environment"]
  },
  {
    commands: [
      new RegExp(/^python3? -m jupyter(\b)/),
      new RegExp(/^python3? -m pip install\b.*jupyter\b.*/),
      new RegExp(/^pip3? install\b.*jupyter\b.*/),
      new RegExp(/^jupyter(\b)/)
      // jupyter lab, jupyer notebook, jupyter nbconvert, etc.
    ],
    tags: ["python environment", "jupyter environment"]
  }
];

function getRecommendedToolsOverRunInTerminal(commandLine, languageModelToolsService) {
  const tools = languageModelToolsService.getTools(void 0);
  if (!tools || previouslyRecommededInSession) {
    return;
  }
  const recommendedTools = /* @__PURE__ */ new Set();
  const messages = [
    `The terminal command '${commandLine}' was not executed.`,
    `Try using some of the following tools instead of running a Terminal Command (if unable to use one of these tools as an alternative then run the same terminal command again):`
  ];
  for (const terminalCommand of terminalCommands) {
    if (!terminalCommand.commands.some((condition) => condition.test(commandLine))) {
      continue;
    }
    const tagsToSearchFor = terminalCommand.tags;
    Array.from(tools).filter((t2) => tagsToSearchFor.some((tag2) => t2.tags?.includes(tag2))).forEach((tool) => {
      recommendedTools.add(tool.id);
    });
  }
  recommendedTools.forEach((toolName) => {
    messages.push(`- ${toolName}`);
  });
  if (recommendedTools.size) {
    previouslyRecommededInSession = true;
    return messages.join("  \n");
  }
  return void 0;
}
export { getRecommendedToolsOverRunInTerminal, previouslyRecommededInSession, terminalCommands };
