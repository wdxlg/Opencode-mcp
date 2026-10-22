// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpIcons.ts
import { getMediaMime } from "./module-0136.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/mcp/common/mcpIcons.ts
var mcpAllowableContentTypes = [
  "image/webp",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif"
];

function validateIcon(icon2, launch, logger) {
  const mimeType = icon2.mimeType?.toLowerCase() || getMediaMime(icon2.src);
  if (!mimeType || !mcpAllowableContentTypes.includes(mimeType)) {
    logger.debug(`Ignoring icon with unsupported mime type: ${icon2.src} (${mimeType}), allowed: ${mcpAllowableContentTypes.join(", ")}`);
    return;
  }
  const uri5 = URI.parse(icon2.src);
  if (uri5.scheme === "data") {
    return uri5;
  }
  if (uri5.scheme === "https" || uri5.scheme === "http") {
    if (launch.type !== 2 /* HTTP */) {
      logger.debug(`Ignoring icon with HTTP/HTTPS URL: ${icon2.src} as the MCP server is not launched with HTTP transport.`);
      return;
    }
    const expectedAuthority = launch.uri.authority.toLowerCase();
    if (uri5.authority.toLowerCase() !== expectedAuthority) {
      logger.debug(`Ignoring icon with untrusted authority: ${icon2.src}, expected authority: ${expectedAuthority}`);
      return;
    }
    return uri5;
  }
  if (uri5.scheme === "file") {
    if (launch.type !== 1 /* Stdio */) {
      logger.debug(`Ignoring icon with file URL: ${icon2.src} as the MCP server is not launched as a local process.`);
      return;
    }
    return uri5;
  }
  logger.debug(`Ignoring icon with unsupported scheme: ${icon2.src}. Allowed: data:, http:, https:, file:`);
  return;
}

function parseAndValidateMcpIcon(icons2, launch, logger) {
  const result = [];
  for (const icon2 of icons2.icons || []) {
    const uri5 = validateIcon(icon2, launch, logger);
    if (!uri5) {
      continue;
    }
    const sizesArr = typeof icon2.sizes === "string" ? icon2.sizes.split(" ") : Array.isArray(icon2.sizes) ? icon2.sizes : [];
    result.push({
      src: uri5,
      theme: icon2.theme === "light" ? 0 /* Light */ : icon2.theme === "dark" ? 1 /* Dark */ : 2 /* Any */,
      sizes: sizesArr.map((size3) => {
        const [widthStr, heightStr] = size3.toLowerCase().split("x");
        return { width: Number(widthStr) || 0, height: Number(heightStr) || 0 };
      }).sort((a, b) => a.width - b.width)
    });
  }
  result.sort((a, b) => a.sizes[0]?.width - b.sizes[0]?.width);
  return result;
}

var McpIcons = class _McpIcons {
  constructor(_icons) {
    this._icons = _icons;
  }
  static fromStored(icons2) {
    return _McpIcons.fromParsed(icons2?.map((i2) => ({ src: URI.revive(i2.src), theme: i2.theme, sizes: i2.sizes })));
  }
  static fromParsed(icons2) {
    return new _McpIcons(icons2 || []);
  }
  getUrl(size3) {
    const dark = this.getSizeWithTheme(size3, 1 /* Dark */);
    if (dark?.theme === 2 /* Any */) {
      return { dark: dark.src };
    }
    const light = this.getSizeWithTheme(size3, 0 /* Light */);
    if (!light && !dark) {
      return void 0;
    }
    return { dark: (dark || light).src, light: light?.src };
  }
  getSizeWithTheme(size3, theme) {
    let bestOfAnySize;
    for (const icon2 of this._icons) {
      if (icon2.theme === theme || icon2.theme === 2 /* Any */ || icon2.theme === void 0) {
        bestOfAnySize = icon2;
        const matchingSize = icon2.sizes.find((s) => s.width >= size3);
        if (matchingSize) {
          return { ...icon2, sizes: [matchingSize] };
        }
      }
    }
    return bestOfAnySize;
  }
};
export { validateIcon, parseAndValidateMcpIcon, mcpAllowableContentTypes, McpIcons };
