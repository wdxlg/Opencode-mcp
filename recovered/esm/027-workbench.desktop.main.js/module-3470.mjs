// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/common/taskTemplates.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/tasks/common/taskTemplates.ts
var dotnetBuild = {
  id: "dotnetCore",
  label: ".NET Core",
  sort: "NET Core",
  autoDetect: false,
  description: localize(19897, null),
  content: [
    "{",
    "	// See https://go.microsoft.com/fwlink/?LinkId=733558",
    "	// for the documentation about the tasks.json format",
    '	"version": "2.0.0",',
    '	"tasks": [',
    "		{",
    '			"label": "build",',
    '			"command": "dotnet",',
    '			"type": "shell",',
    '			"args": [',
    '				"build",',
    "				// Ask dotnet build to generate full paths for file names.",
    '				"/property:GenerateFullPaths=true",',
    "				// Do not generate summary otherwise it leads to duplicate errors in Problems panel",
    '				"/consoleloggerparameters:NoSummary"',
    "			],",
    '			"group": "build",',
    '			"presentation": {',
    '				"reveal": "silent"',
    "			},",
    '			"problemMatcher": "$msCompile"',
    "		}",
    "	]",
    "}"
  ].join("\n")
};

var msbuild = {
  id: "msbuild",
  label: "MSBuild",
  autoDetect: false,
  description: localize(19900, null),
  content: [
    "{",
    "	// See https://go.microsoft.com/fwlink/?LinkId=733558",
    "	// for the documentation about the tasks.json format",
    '	"version": "2.0.0",',
    '	"tasks": [',
    "		{",
    '			"label": "build",',
    '			"type": "shell",',
    '			"command": "msbuild",',
    '			"args": [',
    "				// Ask msbuild to generate full paths for file names.",
    '				"/property:GenerateFullPaths=true",',
    '				"/t:build",',
    "				// Do not generate summary otherwise it leads to duplicate errors in Problems panel",
    '				"/consoleloggerparameters:NoSummary"',
    "			],",
    '			"group": "build",',
    '			"presentation": {',
    "				// Reveal the output only if unrecognized errors occur.",
    '				"reveal": "silent"',
    "			},",
    "			// Use the standard MS compiler pattern to detect errors, warnings and infos",
    '			"problemMatcher": "$msCompile"',
    "		}",
    "	]",
    "}"
  ].join("\n")
};

var command3 = {
  id: "externalCommand",
  label: "Others",
  autoDetect: false,
  description: localize(19898, null),
  content: [
    "{",
    "	// See https://go.microsoft.com/fwlink/?LinkId=733558",
    "	// for the documentation about the tasks.json format",
    '	"version": "2.0.0",',
    '	"tasks": [',
    "		{",
    '			"label": "echo",',
    '			"type": "shell",',
    '			"command": "echo Hello"',
    "		}",
    "	]",
    "}"
  ].join("\n")
};

var maven = {
  id: "maven",
  label: "maven",
  sort: "MVN",
  autoDetect: false,
  description: localize(19899, null),
  content: [
    "{",
    "	// See https://go.microsoft.com/fwlink/?LinkId=733558",
    "	// for the documentation about the tasks.json format",
    '	"version": "2.0.0",',
    '	"tasks": [',
    "		{",
    '			"label": "verify",',
    '			"type": "shell",',
    '			"command": "mvn -B verify",',
    '			"group": "build"',
    "		},",
    "		{",
    '			"label": "test",',
    '			"type": "shell",',
    '			"command": "mvn -B test",',
    '			"group": "test"',
    "		}",
    "	]",
    "}"
  ].join("\n")
};

var _templates = null;

function getTemplates() {
  if (!_templates) {
    _templates = [dotnetBuild, msbuild, maven].sort((a, b) => {
      return (a.sort || a.label).localeCompare(b.sort || b.label);
    });
    _templates.push(command3);
  }
  return _templates;
}
export { getTemplates, dotnetBuild, msbuild, command3, maven, _templates };
