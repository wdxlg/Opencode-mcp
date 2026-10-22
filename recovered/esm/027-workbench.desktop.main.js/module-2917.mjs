// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/common/extensionQuery.ts
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0877.mjs";
import { EXTENSION_CATEGORIES } from "./module-0688.mjs";


// src/vs/workbench/contrib/extensions/common/extensionQuery.ts
var Query3 = class _Query {
  constructor(value2, sortBy) {
    this.value = value2;
    this.sortBy = sortBy;
    this.value = value2.trim();
  }
  static suggestions(query, galleryManifest) {
    const commands = ["installed", "updates", "enabled", "disabled", "builtin", "contribute"];
    if (galleryManifest?.capabilities.extensionQuery?.filtering?.some((c) => c.name === "Featured" /* Featured */)) {
      commands.push("featured");
    }
    commands.push(...["mcp", "agentPlugins", "popular", "recommended", "recentlyPublished", "workspaceUnsupported", "deprecated", "sort"]);
    const isCategoriesEnabled = galleryManifest?.capabilities.extensionQuery?.filtering?.some((c) => c.name === "Category" /* Category */);
    if (isCategoriesEnabled) {
      commands.push("category");
    }
    commands.push(...["tag", "ext", "id", "outdated", "recentlyUpdated", "restartRequired"]);
    const sortCommands = [];
    if (galleryManifest?.capabilities.extensionQuery?.sorting?.some((c) => c.name === "InstallCount" /* InstallCount */)) {
      sortCommands.push("installs");
    }
    if (galleryManifest?.capabilities.extensionQuery?.sorting?.some((c) => c.name === "WeightedRating" /* WeightedRating */)) {
      sortCommands.push("rating");
    }
    sortCommands.push("name", "publishedDate", "updateDate");
    const contributeCommands = [];
    for (const feature of Registry.as(Extensions11.ExtensionFeaturesRegistry).getExtensionFeatures()) {
      contributeCommands.push(feature.id);
    }
    const subcommands = {
      "sort": sortCommands,
      "category": isCategoriesEnabled ? EXTENSION_CATEGORIES.map((c) => `"${c.toLowerCase()}"`) : [],
      "tag": [""],
      "ext": [""],
      "id": [""],
      "contribute": contributeCommands
    };
    const queryContains = (substr) => query.indexOf(substr) > -1;
    const hasSort = subcommands.sort.some((subcommand) => queryContains(`@sort:${subcommand}`));
    const hasCategory = subcommands.category.some((subcommand) => queryContains(`@category:${subcommand}`));
    return commands.flatMap((command4) => {
      if (hasSort && command4 === "sort" || hasCategory && command4 === "category") {
        return [];
      }
      if (command4 in subcommands) {
        return subcommands[command4].map((subcommand) => `@${command4}:${subcommand}${subcommand === "" ? "" : " "}`);
      } else {
        return queryContains(`@${command4}`) ? [] : [`@${command4} `];
      }
    });
  }
  static parse(value2) {
    let sortBy = "";
    value2 = value2.replace(/@sort:(\w+)(-\w*)?/g, (match2, by, order) => {
      sortBy = by;
      return "";
    });
    return new _Query(value2, sortBy);
  }
  toString() {
    let result = this.value;
    if (this.sortBy) {
      result = `${result}${result ? " " : ""}@sort:${this.sortBy}`;
    }
    return result;
  }
  isValid() {
    return !/@outdated/.test(this.value);
  }
  equals(other) {
    return this.value === other.value && this.sortBy === other.sortBy;
  }
};
export { Query3 };
