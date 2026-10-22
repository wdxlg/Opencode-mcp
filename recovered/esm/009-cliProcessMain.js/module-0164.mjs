// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/mcp/common/mcpManagementCli.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMcpManagementService } from "./module-0163.mjs";


// src/vs/platform/mcp/common/mcpManagementCli.ts
var McpManagementCli = class {
  constructor(_logger, _mcpManagementService) {
    this._logger = _logger;
    this._mcpManagementService = _mcpManagementService;
  }
  async addMcpDefinitions(definitions) {
    const configs = definitions.map((config) => this.validateConfiguration(config));
    await this.updateMcpInResource(configs);
    this._logger.info(`Added MCP servers: ${configs.map((c) => c.name).join(", ")}`);
  }
  async updateMcpInResource(configs) {
    await Promise.all(configs.map(({ name, config, inputs }) => this._mcpManagementService.install({ name, config, inputs })));
  }
  validateConfiguration(config) {
    let parsed;
    try {
      parsed = JSON.parse(config);
    } catch (e) {
      throw new InvalidMcpOperationError(`Invalid JSON '${config}': ${e}`);
    }
    if (!parsed.name) {
      throw new InvalidMcpOperationError(`Missing name property in ${config}`);
    }
    if (!("command" in parsed) && !("url" in parsed)) {
      throw new InvalidMcpOperationError(`Missing command or URL property in ${config}`);
    }
    const { name, inputs, ...rest } = parsed;
    return { name, inputs, config: rest };
  }
};

McpManagementCli = __decorateClass([
  __decorateParam(1, IMcpManagementService)
], McpManagementCli);

var InvalidMcpOperationError = class extends Error {
  constructor(message) {
    super(message);
    this.stack = message;
  }
};
export { McpManagementCli, InvalidMcpOperationError };
