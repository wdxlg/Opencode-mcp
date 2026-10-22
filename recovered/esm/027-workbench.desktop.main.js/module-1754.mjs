// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/authentication/browser/authenticationQueryService.ts
import { ExtensionIdentifier } from "./module-0688.mjs";
import { IAuthenticationExtensionsService, IAuthenticationService, INTERNAL_AUTH_PROVIDER_PREFIX } from "./module-0951.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAuthenticationUsageService } from "./module-1416.mjs";
import { IAuthenticationMcpUsageService } from "./module-1450.mjs";
import { IAuthenticationAccessService } from "./module-0968.mjs";
import { IAuthenticationMcpAccessService } from "./module-1448.mjs";
import { IAuthenticationMcpService } from "./module-1451.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IAuthenticationQueryService } from "./module-1753.mjs";


// src/vs/workbench/services/authentication/browser/authenticationQueryService.ts
var BaseQuery = class {
  constructor(providerId, queryService) {
    this.providerId = providerId;
    this.queryService = queryService;
  }
};

var AccountExtensionQuery = class extends BaseQuery {
  constructor(providerId, accountName, extensionId, queryService) {
    super(providerId, queryService);
    this.accountName = accountName;
    this.extensionId = extensionId;
  }
  isAccessAllowed() {
    return this.queryService.authenticationAccessService.isAccessAllowed(this.providerId, this.accountName, this.extensionId);
  }
  setAccessAllowed(allowed, extensionName) {
    this.queryService.authenticationAccessService.updateAllowedExtensions(
      this.providerId,
      this.accountName,
      [{ id: this.extensionId, name: extensionName || this.extensionId, allowed }]
    );
  }
  addUsage(scopes, extensionName) {
    this.queryService.authenticationUsageService.addAccountUsage(
      this.providerId,
      this.accountName,
      scopes,
      this.extensionId,
      extensionName
    );
  }
  getUsage() {
    const allUsages = this.queryService.authenticationUsageService.readAccountUsages(this.providerId, this.accountName);
    return allUsages.filter((usage) => usage.extensionId === ExtensionIdentifier.toKey(this.extensionId)).map((usage) => ({
      extensionId: usage.extensionId,
      extensionName: usage.extensionName,
      scopes: usage.scopes || [],
      lastUsed: usage.lastUsed
    }));
  }
  removeUsage() {
    const allUsages = this.queryService.authenticationUsageService.readAccountUsages(this.providerId, this.accountName);
    const filteredUsages = allUsages.filter((usage) => usage.extensionId !== this.extensionId);
    this.queryService.authenticationUsageService.removeAccountUsage(this.providerId, this.accountName);
    for (const usage of filteredUsages) {
      this.queryService.authenticationUsageService.addAccountUsage(
        this.providerId,
        this.accountName,
        usage.scopes || [],
        usage.extensionId,
        usage.extensionName
      );
    }
  }
  setAsPreferred() {
    this.queryService.authenticationExtensionsService.updateAccountPreference(
      this.extensionId,
      this.providerId,
      { label: this.accountName, id: this.accountName }
    );
  }
  isPreferred() {
    const preferredAccount = this.queryService.authenticationExtensionsService.getAccountPreference(this.extensionId, this.providerId);
    return preferredAccount === this.accountName;
  }
  isTrusted() {
    const allowedExtensions = this.queryService.authenticationAccessService.readAllowedExtensions(this.providerId, this.accountName);
    const extension = allowedExtensions.find((ext) => ext.id === this.extensionId);
    return extension?.trusted === true;
  }
};

var AccountMcpServerQuery = class extends BaseQuery {
  constructor(providerId, accountName, mcpServerId, queryService) {
    super(providerId, queryService);
    this.accountName = accountName;
    this.mcpServerId = mcpServerId;
  }
  isAccessAllowed() {
    return this.queryService.authenticationMcpAccessService.isAccessAllowed(this.providerId, this.accountName, this.mcpServerId);
  }
  setAccessAllowed(allowed, mcpServerName) {
    this.queryService.authenticationMcpAccessService.updateAllowedMcpServers(
      this.providerId,
      this.accountName,
      [{ id: this.mcpServerId, name: mcpServerName || this.mcpServerId, allowed }]
    );
  }
  addUsage(scopes, mcpServerName) {
    this.queryService.authenticationMcpUsageService.addAccountUsage(
      this.providerId,
      this.accountName,
      scopes,
      this.mcpServerId,
      mcpServerName
    );
  }
  getUsage() {
    const allUsages = this.queryService.authenticationMcpUsageService.readAccountUsages(this.providerId, this.accountName);
    return allUsages.filter((usage) => usage.mcpServerId === this.mcpServerId).map((usage) => ({
      mcpServerId: usage.mcpServerId,
      mcpServerName: usage.mcpServerName,
      scopes: usage.scopes || [],
      lastUsed: usage.lastUsed
    }));
  }
  removeUsage() {
    const allUsages = this.queryService.authenticationMcpUsageService.readAccountUsages(this.providerId, this.accountName);
    const filteredUsages = allUsages.filter((usage) => usage.mcpServerId !== this.mcpServerId);
    this.queryService.authenticationMcpUsageService.removeAccountUsage(this.providerId, this.accountName);
    for (const usage of filteredUsages) {
      this.queryService.authenticationMcpUsageService.addAccountUsage(
        this.providerId,
        this.accountName,
        usage.scopes || [],
        usage.mcpServerId,
        usage.mcpServerName
      );
    }
  }
  setAsPreferred() {
    this.queryService.authenticationMcpService.updateAccountPreference(
      this.mcpServerId,
      this.providerId,
      { label: this.accountName, id: this.accountName }
    );
  }
  isPreferred() {
    const preferredAccount = this.queryService.authenticationMcpService.getAccountPreference(this.mcpServerId, this.providerId);
    return preferredAccount === this.accountName;
  }
  isTrusted() {
    const allowedMcpServers = this.queryService.authenticationMcpAccessService.readAllowedMcpServers(this.providerId, this.accountName);
    const mcpServer = allowedMcpServers.find((server) => server.id === this.mcpServerId);
    return mcpServer?.trusted === true;
  }
};

var AccountExtensionsQuery = class extends BaseQuery {
  constructor(providerId, accountName, queryService) {
    super(providerId, queryService);
    this.accountName = accountName;
  }
  getAllowedExtensions() {
    const allowedExtensions = this.queryService.authenticationAccessService.readAllowedExtensions(this.providerId, this.accountName);
    const usages = this.queryService.authenticationUsageService.readAccountUsages(this.providerId, this.accountName);
    return allowedExtensions.filter((ext) => ext.allowed !== false).map((ext) => {
      const extensionUsages = usages.filter((usage) => usage.extensionId === ext.id);
      const lastUsed = extensionUsages.length > 0 ? Math.max(...extensionUsages.map((u) => u.lastUsed)) : void 0;
      const extensionQuery = new AccountExtensionQuery(this.providerId, this.accountName, ext.id, this.queryService);
      const trusted = extensionQuery.isTrusted();
      return {
        id: ext.id,
        name: ext.name,
        allowed: ext.allowed,
        lastUsed,
        trusted
      };
    });
  }
  allowAccess(extensionIds) {
    const extensionsToAllow = extensionIds.map((id2) => ({ id: id2, name: id2, allowed: true }));
    this.queryService.authenticationAccessService.updateAllowedExtensions(this.providerId, this.accountName, extensionsToAllow);
  }
  removeAccess(extensionIds) {
    const extensionsToRemove = extensionIds.map((id2) => ({ id: id2, name: id2, allowed: false }));
    this.queryService.authenticationAccessService.updateAllowedExtensions(this.providerId, this.accountName, extensionsToRemove);
  }
  forEach(callback) {
    const usages = this.queryService.authenticationUsageService.readAccountUsages(this.providerId, this.accountName);
    const allowedExtensions = this.queryService.authenticationAccessService.readAllowedExtensions(this.providerId, this.accountName);
    const extensionIds = /* @__PURE__ */ new Set();
    usages.forEach((usage) => extensionIds.add(usage.extensionId));
    allowedExtensions.forEach((ext) => extensionIds.add(ext.id));
    for (const extensionId of extensionIds) {
      const extensionQuery = new AccountExtensionQuery(this.providerId, this.accountName, extensionId, this.queryService);
      callback(extensionQuery);
    }
  }
};

var AccountMcpServersQuery = class extends BaseQuery {
  constructor(providerId, accountName, queryService) {
    super(providerId, queryService);
    this.accountName = accountName;
  }
  getAllowedMcpServers() {
    return this.queryService.authenticationMcpAccessService.readAllowedMcpServers(this.providerId, this.accountName).filter((server) => server.allowed !== false);
  }
  allowAccess(mcpServerIds) {
    const mcpServersToAllow = mcpServerIds.map((id2) => ({ id: id2, name: id2, allowed: true }));
    this.queryService.authenticationMcpAccessService.updateAllowedMcpServers(this.providerId, this.accountName, mcpServersToAllow);
  }
  removeAccess(mcpServerIds) {
    const mcpServersToRemove = mcpServerIds.map((id2) => ({ id: id2, name: id2, allowed: false }));
    this.queryService.authenticationMcpAccessService.updateAllowedMcpServers(this.providerId, this.accountName, mcpServersToRemove);
  }
  forEach(callback) {
    const usages = this.queryService.authenticationMcpUsageService.readAccountUsages(this.providerId, this.accountName);
    const allowedMcpServers = this.queryService.authenticationMcpAccessService.readAllowedMcpServers(this.providerId, this.accountName);
    const mcpServerIds = /* @__PURE__ */ new Set();
    usages.forEach((usage) => mcpServerIds.add(usage.mcpServerId));
    allowedMcpServers.forEach((server) => mcpServerIds.add(server.id));
    for (const mcpServerId of mcpServerIds) {
      const mcpServerQuery = new AccountMcpServerQuery(this.providerId, this.accountName, mcpServerId, this.queryService);
      callback(mcpServerQuery);
    }
  }
};

var AccountEntitiesQuery = class extends BaseQuery {
  constructor(providerId, accountName, queryService) {
    super(providerId, queryService);
    this.accountName = accountName;
  }
  hasAnyUsage() {
    const extensionUsages = this.queryService.authenticationUsageService.readAccountUsages(this.providerId, this.accountName);
    if (extensionUsages.length > 0) {
      return true;
    }
    const mcpUsages = this.queryService.authenticationMcpUsageService.readAccountUsages(this.providerId, this.accountName);
    if (mcpUsages.length > 0) {
      return true;
    }
    const allowedExtensions = this.queryService.authenticationAccessService.readAllowedExtensions(this.providerId, this.accountName);
    if (allowedExtensions.some((ext) => ext.allowed !== false)) {
      return true;
    }
    const allowedMcpServers = this.queryService.authenticationMcpAccessService.readAllowedMcpServers(this.providerId, this.accountName);
    if (allowedMcpServers.some((server) => server.allowed !== false)) {
      return true;
    }
    return false;
  }
  getEntityCount() {
    const extensionUsages = this.queryService.authenticationUsageService.readAccountUsages(this.providerId, this.accountName);
    const allowedExtensions = this.queryService.authenticationAccessService.readAllowedExtensions(this.providerId, this.accountName).filter((ext) => ext.allowed);
    const extensionIds = /* @__PURE__ */ new Set();
    extensionUsages.forEach((usage) => extensionIds.add(usage.extensionId));
    allowedExtensions.forEach((ext) => extensionIds.add(ext.id));
    const mcpUsages = this.queryService.authenticationMcpUsageService.readAccountUsages(this.providerId, this.accountName);
    const allowedMcpServers = this.queryService.authenticationMcpAccessService.readAllowedMcpServers(this.providerId, this.accountName).filter((server) => server.allowed);
    const mcpServerIds = /* @__PURE__ */ new Set();
    mcpUsages.forEach((usage) => mcpServerIds.add(usage.mcpServerId));
    allowedMcpServers.forEach((server) => mcpServerIds.add(server.id));
    const extensionCount = extensionIds.size;
    const mcpServerCount = mcpServerIds.size;
    return {
      extensions: extensionCount,
      mcpServers: mcpServerCount,
      total: extensionCount + mcpServerCount
    };
  }
  removeAllAccess() {
    const extensionsQuery = new AccountExtensionsQuery(this.providerId, this.accountName, this.queryService);
    const extensions = extensionsQuery.getAllowedExtensions();
    const extensionIds = extensions.map((ext) => ext.id);
    if (extensionIds.length > 0) {
      extensionsQuery.removeAccess(extensionIds);
    }
    const mcpServersQuery = new AccountMcpServersQuery(this.providerId, this.accountName, this.queryService);
    const mcpServers = mcpServersQuery.getAllowedMcpServers();
    const mcpServerIds = mcpServers.map((server) => server.id);
    if (mcpServerIds.length > 0) {
      mcpServersQuery.removeAccess(mcpServerIds);
    }
  }
  forEach(callback) {
    const extensionsQuery = new AccountExtensionsQuery(this.providerId, this.accountName, this.queryService);
    extensionsQuery.forEach((extensionQuery) => {
      callback(extensionQuery.extensionId, "extension");
    });
    const mcpServersQuery = new AccountMcpServersQuery(this.providerId, this.accountName, this.queryService);
    mcpServersQuery.forEach((mcpServerQuery) => {
      callback(mcpServerQuery.mcpServerId, "mcpServer");
    });
  }
};

var AccountQuery = class extends BaseQuery {
  constructor(providerId, accountName, queryService) {
    super(providerId, queryService);
    this.accountName = accountName;
  }
  extension(extensionId) {
    return new AccountExtensionQuery(this.providerId, this.accountName, extensionId, this.queryService);
  }
  mcpServer(mcpServerId) {
    return new AccountMcpServerQuery(this.providerId, this.accountName, mcpServerId, this.queryService);
  }
  extensions() {
    return new AccountExtensionsQuery(this.providerId, this.accountName, this.queryService);
  }
  mcpServers() {
    return new AccountMcpServersQuery(this.providerId, this.accountName, this.queryService);
  }
  entities() {
    return new AccountEntitiesQuery(this.providerId, this.accountName, this.queryService);
  }
  remove() {
    this.queryService.authenticationAccessService.removeAllowedExtensions(this.providerId, this.accountName);
    this.queryService.authenticationUsageService.removeAccountUsage(this.providerId, this.accountName);
    this.queryService.authenticationMcpAccessService.removeAllowedMcpServers(this.providerId, this.accountName);
    this.queryService.authenticationMcpUsageService.removeAccountUsage(this.providerId, this.accountName);
  }
};

var ProviderExtensionQuery = class extends BaseQuery {
  constructor(providerId, extensionId, queryService) {
    super(providerId, queryService);
    this.extensionId = extensionId;
  }
  getPreferredAccount() {
    return this.queryService.authenticationExtensionsService.getAccountPreference(this.extensionId, this.providerId);
  }
  setPreferredAccount(account) {
    this.queryService.authenticationExtensionsService.updateAccountPreference(this.extensionId, this.providerId, account);
  }
  removeAccountPreference() {
    this.queryService.authenticationExtensionsService.removeAccountPreference(this.extensionId, this.providerId);
  }
};

var ProviderMcpServerQuery = class extends BaseQuery {
  constructor(providerId, mcpServerId, queryService) {
    super(providerId, queryService);
    this.mcpServerId = mcpServerId;
  }
  async getLastUsedAccount() {
    try {
      const accounts = await this.queryService.authenticationService.getAccounts(this.providerId);
      let lastUsedAccount;
      let lastUsedTime = 0;
      for (const account of accounts) {
        const usages = this.queryService.authenticationMcpUsageService.readAccountUsages(this.providerId, account.label);
        const mcpServerUsages = usages.filter((usage) => usage.mcpServerId === this.mcpServerId);
        for (const usage of mcpServerUsages) {
          if (usage.lastUsed > lastUsedTime) {
            lastUsedTime = usage.lastUsed;
            lastUsedAccount = account.label;
          }
        }
      }
      return lastUsedAccount;
    } catch {
      return void 0;
    }
  }
  getPreferredAccount() {
    return this.queryService.authenticationMcpService.getAccountPreference(this.mcpServerId, this.providerId);
  }
  setPreferredAccount(account) {
    this.queryService.authenticationMcpService.updateAccountPreference(this.mcpServerId, this.providerId, account);
  }
  removeAccountPreference() {
    this.queryService.authenticationMcpService.removeAccountPreference(this.mcpServerId, this.providerId);
  }
  async getUsedAccounts() {
    try {
      const accounts = await this.queryService.authenticationService.getAccounts(this.providerId);
      const usedAccounts = [];
      for (const account of accounts) {
        const usages = this.queryService.authenticationMcpUsageService.readAccountUsages(this.providerId, account.label);
        if (usages.some((usage) => usage.mcpServerId === this.mcpServerId)) {
          usedAccounts.push(account.label);
        }
      }
      return usedAccounts;
    } catch {
      return [];
    }
  }
};

var ProviderQuery = class extends BaseQuery {
  constructor(providerId, queryService) {
    super(providerId, queryService);
  }
  account(accountName) {
    return new AccountQuery(this.providerId, accountName, this.queryService);
  }
  extension(extensionId) {
    return new ProviderExtensionQuery(this.providerId, extensionId, this.queryService);
  }
  mcpServer(mcpServerId) {
    return new ProviderMcpServerQuery(this.providerId, mcpServerId, this.queryService);
  }
  async getActiveEntities() {
    const extensions = [];
    const mcpServers = [];
    try {
      const accounts = await this.queryService.authenticationService.getAccounts(this.providerId);
      for (const account of accounts) {
        const extensionUsages = this.queryService.authenticationUsageService.readAccountUsages(this.providerId, account.label);
        for (const usage of extensionUsages) {
          if (!extensions.includes(usage.extensionId)) {
            extensions.push(usage.extensionId);
          }
        }
        const mcpUsages = this.queryService.authenticationMcpUsageService.readAccountUsages(this.providerId, account.label);
        for (const usage of mcpUsages) {
          if (!mcpServers.includes(usage.mcpServerId)) {
            mcpServers.push(usage.mcpServerId);
          }
        }
      }
    } catch {
    }
    return { extensions, mcpServers };
  }
  async getAccountNames() {
    try {
      const accounts = await this.queryService.authenticationService.getAccounts(this.providerId);
      return accounts.map((account) => account.label);
    } catch {
      return [];
    }
  }
  async getUsageStats() {
    const recentActivity = [];
    let totalSessions = 0;
    let totalAccounts = 0;
    try {
      const accounts = await this.queryService.authenticationService.getAccounts(this.providerId);
      totalAccounts = accounts.length;
      for (const account of accounts) {
        const extensionUsages = this.queryService.authenticationUsageService.readAccountUsages(this.providerId, account.label);
        const mcpUsages = this.queryService.authenticationMcpUsageService.readAccountUsages(this.providerId, account.label);
        const allUsages = [...extensionUsages, ...mcpUsages];
        const usageCount = allUsages.length;
        const lastUsed = Math.max(...allUsages.map((u) => u.lastUsed), 0);
        if (usageCount > 0) {
          recentActivity.push({ accountName: account.label, lastUsed, usageCount });
        }
      }
      recentActivity.sort((a, b) => b.lastUsed - a.lastUsed);
      totalSessions = recentActivity.reduce((sum2, activity) => sum2 + activity.usageCount, 0);
    } catch {
    }
    return { totalSessions, totalAccounts, recentActivity };
  }
  async forEachAccount(callback) {
    try {
      const accounts = await this.queryService.authenticationService.getAccounts(this.providerId);
      for (const account of accounts) {
        const accountQuery = new AccountQuery(this.providerId, account.label, this.queryService);
        callback(accountQuery);
      }
    } catch {
    }
  }
};

var ExtensionQuery = class {
  constructor(extensionId, queryService) {
    this.extensionId = extensionId;
    this.queryService = queryService;
  }
  async getProvidersWithAccess(includeInternal) {
    const providersWithAccess = [];
    const providerIds = this.queryService.authenticationService.getProviderIds();
    for (const providerId of providerIds) {
      if (!includeInternal && providerId.startsWith(INTERNAL_AUTH_PROVIDER_PREFIX)) {
        continue;
      }
      try {
        const accounts = await this.queryService.authenticationService.getAccounts(providerId);
        const hasAccess = accounts.some((account) => {
          const accessAllowed = this.queryService.authenticationAccessService.isAccessAllowed(providerId, account.label, this.extensionId);
          return accessAllowed === true;
        });
        if (hasAccess) {
          providersWithAccess.push(providerId);
        }
      } catch {
      }
    }
    return providersWithAccess;
  }
  getAllAccountPreferences(includeInternal) {
    const preferences = /* @__PURE__ */ new Map();
    const providerIds = this.queryService.authenticationService.getProviderIds();
    for (const providerId of providerIds) {
      if (!includeInternal && providerId.startsWith(INTERNAL_AUTH_PROVIDER_PREFIX)) {
        continue;
      }
      const preferredAccount = this.queryService.authenticationExtensionsService.getAccountPreference(this.extensionId, providerId);
      if (preferredAccount) {
        preferences.set(providerId, preferredAccount);
      }
    }
    return preferences;
  }
  provider(providerId) {
    return new ProviderExtensionQuery(providerId, this.extensionId, this.queryService);
  }
};

var McpServerQuery = class {
  constructor(mcpServerId, queryService) {
    this.mcpServerId = mcpServerId;
    this.queryService = queryService;
  }
  async getProvidersWithAccess(includeInternal) {
    const providersWithAccess = [];
    const providerIds = this.queryService.authenticationService.getProviderIds();
    for (const providerId of providerIds) {
      if (!includeInternal && providerId.startsWith(INTERNAL_AUTH_PROVIDER_PREFIX)) {
        continue;
      }
      try {
        const accounts = await this.queryService.authenticationService.getAccounts(providerId);
        const hasAccess = accounts.some((account) => {
          const accessAllowed = this.queryService.authenticationMcpAccessService.isAccessAllowed(providerId, account.label, this.mcpServerId);
          return accessAllowed === true;
        });
        if (hasAccess) {
          providersWithAccess.push(providerId);
        }
      } catch {
      }
    }
    return providersWithAccess;
  }
  getAllAccountPreferences(includeInternal) {
    const preferences = /* @__PURE__ */ new Map();
    const providerIds = this.queryService.authenticationService.getProviderIds();
    for (const providerId of providerIds) {
      if (!includeInternal && providerId.startsWith(INTERNAL_AUTH_PROVIDER_PREFIX)) {
        continue;
      }
      const preferredAccount = this.queryService.authenticationMcpService.getAccountPreference(this.mcpServerId, providerId);
      if (preferredAccount) {
        preferences.set(providerId, preferredAccount);
      }
    }
    return preferences;
  }
  provider(providerId) {
    return new ProviderMcpServerQuery(providerId, this.mcpServerId, this.queryService);
  }
};

var AuthenticationQueryService = class extends Disposable {
  constructor(authenticationService, authenticationUsageService, authenticationMcpUsageService, authenticationAccessService, authenticationMcpAccessService, authenticationExtensionsService, authenticationMcpService, logService) {
    super();
    this.authenticationService = authenticationService;
    this.authenticationUsageService = authenticationUsageService;
    this.authenticationMcpUsageService = authenticationMcpUsageService;
    this.authenticationAccessService = authenticationAccessService;
    this.authenticationMcpAccessService = authenticationMcpAccessService;
    this.authenticationExtensionsService = authenticationExtensionsService;
    this.authenticationMcpService = authenticationMcpService;
    this.logService = logService;
    this._onDidChangePreferences = this._register(new Emitter());
    this.onDidChangePreferences = this._onDidChangePreferences.event;
    this._onDidChangeAccess = this._register(new Emitter());
    this.onDidChangeAccess = this._onDidChangeAccess.event;
    this._register(this.authenticationExtensionsService.onDidChangeAccountPreference((e) => {
      this._onDidChangePreferences.fire({
        providerId: e.providerId,
        entityType: "extension",
        entityIds: e.extensionIds
      });
    }));
    this._register(this.authenticationMcpService.onDidChangeAccountPreference((e) => {
      this._onDidChangePreferences.fire({
        providerId: e.providerId,
        entityType: "mcpServer",
        entityIds: e.mcpServerIds
      });
    }));
    this._register(this.authenticationAccessService.onDidChangeExtensionSessionAccess((e) => {
      this._onDidChangeAccess.fire({
        providerId: e.providerId,
        accountName: e.accountName
      });
    }));
    this._register(this.authenticationMcpAccessService.onDidChangeMcpSessionAccess((e) => {
      this._onDidChangeAccess.fire({
        providerId: e.providerId,
        accountName: e.accountName
      });
    }));
  }
  provider(providerId) {
    return new ProviderQuery(providerId, this);
  }
  extension(extensionId) {
    return new ExtensionQuery(extensionId, this);
  }
  mcpServer(mcpServerId) {
    return new McpServerQuery(mcpServerId, this);
  }
  getProviderIds(includeInternal) {
    return this.authenticationService.getProviderIds().filter((providerId) => {
      return includeInternal || !providerId.startsWith(INTERNAL_AUTH_PROVIDER_PREFIX);
    });
  }
  async clearAllData(confirmation, includeInternal = true) {
    if (confirmation !== "CLEAR_ALL_AUTH_DATA") {
      throw new Error("Must provide confirmation string to clear all authentication data");
    }
    const providerIds = this.getProviderIds(includeInternal);
    for (const providerId of providerIds) {
      try {
        const accounts = await this.authenticationService.getAccounts(providerId);
        for (const account of accounts) {
          this.authenticationAccessService.removeAllowedExtensions(providerId, account.label);
          this.authenticationUsageService.removeAccountUsage(providerId, account.label);
          this.authenticationMcpAccessService.removeAllowedMcpServers(providerId, account.label);
          this.authenticationMcpUsageService.removeAccountUsage(providerId, account.label);
        }
      } catch (error) {
        this.logService.error(`Error clearing data for provider ${providerId}:`, error);
      }
    }
    this.logService.info("All authentication data cleared");
  }
};

AuthenticationQueryService = __decorateClass([
  __decorateParam(0, IAuthenticationService),
  __decorateParam(1, IAuthenticationUsageService),
  __decorateParam(2, IAuthenticationMcpUsageService),
  __decorateParam(3, IAuthenticationAccessService),
  __decorateParam(4, IAuthenticationMcpAccessService),
  __decorateParam(5, IAuthenticationExtensionsService),
  __decorateParam(6, IAuthenticationMcpService),
  __decorateParam(7, ILogService)
], AuthenticationQueryService);

registerSingleton(IAuthenticationQueryService, AuthenticationQueryService, 1 /* Delayed */);
export { BaseQuery, AccountExtensionQuery, AccountMcpServerQuery, AccountExtensionsQuery, AccountMcpServersQuery, AccountEntitiesQuery, AccountQuery, ProviderExtensionQuery, ProviderMcpServerQuery, ProviderQuery, ExtensionQuery, McpServerQuery, AuthenticationQueryService };
