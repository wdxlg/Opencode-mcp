// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/confirmationTool.ts
import { ToolDataSource } from "./module-0185.mjs";
import { MarkdownString } from "./module-0072.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/workbench/contrib/chat/common/tools/builtinTools/confirmationTool.ts
var ConfirmationToolId = "vscode_get_confirmation";

var ConfirmationToolWithOptionsId = "vscode_get_confirmation_with_options";

var ModifiedFilesConfirmationToolId = "vscode_get_modified_files_confirmation";

var ConfirmationToolData = {
  id: ConfirmationToolId,
  displayName: "Confirmation Tool",
  modelDescription: "A tool that demonstrates different types of confirmations. Takes a title, message, and confirmation type (basic or terminal).",
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Title for the confirmation dialog"
      },
      message: {
        type: "string",
        description: "Message to show in the confirmation dialog"
      },
      confirmationType: {
        type: "string",
        enum: ["basic", "terminal"],
        description: "Type of confirmation to show - basic for simple confirmation, terminal for terminal command confirmation"
      },
      terminalCommand: {
        type: "string",
        description: 'Terminal command to show (only used when confirmationType is "terminal")'
      }
    },
    required: ["title", "message", "confirmationType"],
    additionalProperties: false
  }
};

var ConfirmationToolWithOptionsData = {
  id: ConfirmationToolWithOptionsId,
  displayName: "Confirmation Tool with Options",
  modelDescription: "A tool that demonstrates different types of confirmations. Takes a title, message, and buttons.",
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Title for the confirmation dialog"
      },
      message: {
        type: "string",
        description: "Message to show in the confirmation dialog"
      },
      buttons: {
        type: "array",
        items: { type: "string" },
        description: "Custom button labels to display."
      }
    },
    required: ["title", "message", "buttons"],
    additionalProperties: false
  }
};

var ModifiedFilesConfirmationToolData = {
  id: ModifiedFilesConfirmationToolId,
  displayName: "Modified Files Confirmation Tool",
  modelDescription: "A tool that shows a modified-files confirmation UI with a split primary button and a hardcoded cancel action.",
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Title for the confirmation dialog"
      },
      message: {
        type: "string",
        description: "Message to show in the confirmation dialog"
      },
      options: {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        description: "Selectable option labels. The first option is used for the primary split button and the remaining options are placed in the dropdown menu."
      },
      modifiedFiles: {
        type: "array",
        items: {
          type: "object",
          properties: {
            uri: {
              type: "string",
              description: "URI of the modified file."
            },
            originalUri: {
              type: "string",
              description: "Optional original URI used when opening a diff."
            },
            insertions: {
              type: "number",
              description: "Optional number of lines added."
            },
            deletions: {
              type: "number",
              description: "Optional number of lines removed."
            },
            title: {
              type: "string",
              description: "Optional title shown in the file tooltip."
            },
            description: {
              type: "string",
              description: "Optional secondary label shown for the file entry."
            }
          },
          required: ["uri"],
          additionalProperties: false
        },
        description: "Modified files to show in the confirmation UI."
      }
    },
    required: ["title", "message", "options", "modifiedFiles"],
    additionalProperties: false
  }
};

var ConfirmationTool = class {
  async prepareToolInvocation(context, token) {
    const parameters = context.parameters;
    if (!parameters.title || !parameters.message) {
      throw new Error("Missing required parameters for ConfirmationTool");
    }
    const confirmationType = parameters.confirmationType ?? "basic";
    let toolSpecificData;
    if (confirmationType === "terminal") {
      toolSpecificData = {
        kind: "terminal",
        commandLine: {
          original: parameters.terminalCommand ?? ""
        },
        language: "bash"
      };
    } else {
      toolSpecificData = void 0;
    }
    return {
      confirmationMessages: {
        title: parameters.title,
        message: new MarkdownString(parameters.message),
        allowAutoConfirm: (parameters.buttons || []).length ? false : true,
        // We cannot auto confirm if there are custom buttons, as we don't know which one to select
        customOptions: parameters.buttons?.map((label, index) => ({
          id: label,
          label,
          kind: index === 0 ? "approve" /* Approve */ : "deny" /* Deny */
        }))
      },
      toolSpecificData,
      presentation: "hiddenAfterComplete" /* HiddenAfterComplete */
    };
  }
  async invoke(invocation, countTokens, progress, token) {
    if (invocation.selectedCustomButton) {
      return {
        content: [{
          kind: "text",
          value: invocation.selectedCustomButton
        }]
      };
    }
    return {
      content: [{
        kind: "text",
        value: "yes"
        // Consumers should check for this label to know whether the tool was confirmed or skipped
      }]
    };
  }
};

var ModifiedFilesConfirmationTool = class {
  async prepareToolInvocation(context, token) {
    const parameters = context.parameters;
    if (!parameters.title || !parameters.message) {
      throw new Error("Missing required parameters for ModifiedFilesConfirmationTool");
    }
    if (!parameters.options?.length) {
      throw new Error("ModifiedFilesConfirmationTool requires at least one option");
    }
    const toolSpecificData = {
      kind: "modifiedFilesConfirmation",
      options: parameters.options,
      modifiedFiles: parameters.modifiedFiles.map((file) => ({
        uri: URI.parse(file.uri).toJSON(),
        originalUri: file.originalUri ? URI.parse(file.originalUri).toJSON() : void 0,
        insertions: file.insertions,
        deletions: file.deletions,
        title: file.title,
        description: file.description
      }))
    };
    return {
      confirmationMessages: {
        title: parameters.title,
        message: new MarkdownString(parameters.message),
        allowAutoConfirm: false
      },
      toolSpecificData,
      presentation: "hiddenAfterComplete" /* HiddenAfterComplete */
    };
  }
  async invoke(invocation, countTokens, progress, token) {
    if (invocation.selectedCustomButton) {
      return {
        content: [{
          kind: "text",
          value: invocation.selectedCustomButton
        }]
      };
    }
    return {
      content: [{
        kind: "text",
        value: "yes"
        // Consumers should check for this label to know whether the tool was confirmed or skipped
      }]
    };
  }
};
export { ConfirmationToolId, ConfirmationToolWithOptionsId, ModifiedFilesConfirmationToolId, ConfirmationToolData, ConfirmationToolWithOptionsData, ModifiedFilesConfirmationToolData, ConfirmationTool, ModifiedFilesConfirmationTool };
