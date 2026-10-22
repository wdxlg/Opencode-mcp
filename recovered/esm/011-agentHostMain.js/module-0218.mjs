// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/sandbox/common/terminalSandboxReadAllowList.ts
import { matchesTerminalSandboxCommandRule } from "./module-0217.mjs";


// src/vs/platform/sandbox/common/terminalSandboxReadAllowList.ts
var terminalSandboxReadAllowListKeywordMap = /* @__PURE__ */ new Map([
  ["git", "git" /* Git */],
  ["gh", "git" /* Git */],
  ["gpg", "gnupg" /* GnuPG */],
  ["node", "node" /* Node */],
  ["npm", "node" /* Node */],
  ["npx", "node" /* Node */],
  ["pnpm", "node" /* Node */],
  ["yarn", "node" /* Node */],
  ["corepack", "node" /* Node */],
  ["bun", "node" /* Node */],
  ["deno", "node" /* Node */],
  ["nvm", "node" /* Node */],
  ["volta", "node" /* Node */],
  ["fnm", "node" /* Node */],
  ["asdf", "node" /* Node */],
  ["mise", "node" /* Node */],
  ["cargo", "rust" /* Rust */],
  ["rustc", "rust" /* Rust */],
  ["rustup", "rust" /* Rust */],
  ["go", "go" /* Go */],
  ["gofmt", "go" /* Go */],
  ["python", "python" /* Python */],
  ["python3", "python" /* Python */],
  ["pip", "python" /* Python */],
  ["pip3", "python" /* Python */],
  ["poetry", "python" /* Python */],
  ["uv", "python" /* Python */],
  ["pipx", "python" /* Python */],
  ["pyenv", "python" /* Python */],
  ["java", "java" /* Java */],
  ["javac", "java" /* Java */],
  ["jar", "java" /* Java */],
  ["mvn", "java" /* Java */],
  ["mvnw", "java" /* Java */],
  ["gradle", "java" /* Java */],
  ["gradlew", "java" /* Java */],
  ["sdk", "java" /* Java */],
  ["dotnet", "dotnet" /* Dotnet */],
  ["nuget", "nuget" /* Nuget */],
  ["msbuild", "msbuild" /* Msbuild */],
  ["ruby", "ruby" /* Ruby */],
  ["gem", "ruby" /* Ruby */],
  ["bundle", "ruby" /* Ruby */],
  ["bundler", "ruby" /* Ruby */],
  ["rake", "ruby" /* Ruby */],
  ["rbenv", "ruby" /* Ruby */],
  ["rvm", "ruby" /* Ruby */],
  ["ccache", "nativeBuild" /* NativeBuild */],
  ["sccache", "nativeBuild" /* NativeBuild */],
  ["cmake", "nativeBuild" /* NativeBuild */],
  ["conan", "conan" /* Conan */]
]);

function getTerminalSandboxReadAllowListForOperation(operation, os10) {
  if (os10 === 1 /* Windows */) {
    return [];
  }
  switch (operation) {
    case "git" /* Git */:
      switch (os10) {
        case 2 /* Macintosh */:
        case 3 /* Linux */:
        default:
          return [
            "~/.gitconfig",
            "~/.config/gh/config.yml",
            "~/.config/git/config",
            "~/.gitignore",
            "~/.gitignore_global",
            "~/.config/git/ignore",
            "~/.config/git/attributes"
          ];
      }
    case "node" /* Node */:
      switch (os10) {
        case 2 /* Macintosh */:
          return [
            "~/.npm",
            "~/Library/Caches/node",
            "~/Library/Caches/electron",
            "~/Library/Caches/ms-playwright",
            "~/Library/Caches/Yarn",
            "~/Library/Caches/deno",
            "~/Library/pnpm",
            "~/.electron-gyp",
            "~/.node-gyp",
            "~/.yarn/berry",
            "~/.local/share/pnpm",
            "~/.pnpm-store",
            "~/.bun/install/cache",
            "~/.bun/bin",
            "~/.deno",
            "~/.nvm/versions",
            "~/.nvm/alias",
            "~/.volta/bin",
            "~/.volta/tools",
            "~/.fnm",
            "~/.asdf/installs/nodejs",
            "~/.asdf/shims",
            "~/.local/share/mise/installs/node",
            "~/.local/share/mise/shims"
          ];
        case 3 /* Linux */:
        default:
          return [
            "~/.npm",
            "~/.cache/node",
            "~/.cache/node/corepack",
            "~/.cache/electron",
            "~/.cache/ms-playwright",
            "~/.cache/yarn",
            "~/.electron-gyp",
            "~/.node-gyp",
            "~/.yarn/berry",
            "~/.local/share/pnpm",
            "~/.pnpm-store",
            "~/.bun/install/cache",
            "~/.bun/bin",
            "~/.deno",
            "~/.cache/deno",
            "~/.nvm/versions",
            "~/.nvm/alias",
            "~/.volta/bin",
            "~/.volta/tools",
            "~/.fnm",
            "~/.asdf/installs/nodejs",
            "~/.asdf/shims",
            "~/.local/share/mise/installs/node",
            "~/.local/share/mise/shims"
          ];
      }
    case "rust" /* Rust */:
      switch (os10) {
        case 2 /* Macintosh */:
        case 3 /* Linux */:
        default:
          return [
            "~/.cargo/bin",
            "~/.cargo/registry",
            "~/.cargo/git",
            "~/.rustup/toolchains"
          ];
      }
    case "go" /* Go */:
      switch (os10) {
        case 2 /* Macintosh */:
          return [
            "~/go/pkg/mod",
            "~/go/bin",
            "~/Library/Caches/go-build"
          ];
        case 3 /* Linux */:
        default:
          return [
            "~/go/pkg/mod",
            "~/go/bin",
            "~/.cache/go-build"
          ];
      }
    case "python" /* Python */:
      switch (os10) {
        case 2 /* Macintosh */:
          return [
            "~/Library/Caches/pip",
            "~/Library/Caches/pypoetry",
            "~/Library/Caches/uv",
            "~/.local/bin",
            "~/.local/share/virtualenv",
            "~/.local/share/pipx",
            "~/.pyenv/versions",
            "~/.pyenv/shims"
          ];
        case 3 /* Linux */:
        default:
          return [
            "~/.cache/pip",
            "~/.cache/pypoetry",
            "~/.cache/uv",
            "~/.local/bin",
            "~/.local/share/virtualenv",
            "~/.local/share/pipx",
            "~/.pyenv/versions",
            "~/.pyenv/shims"
          ];
      }
    case "java" /* Java */:
      switch (os10) {
        case 2 /* Macintosh */:
        case 3 /* Linux */:
        default:
          return [
            "~/.m2/repository",
            "~/.gradle/caches",
            "~/.gradle/wrapper/dists",
            "~/.sdkman/candidates"
          ];
      }
    case "dotnet" /* Dotnet */:
      switch (os10) {
        case 2 /* Macintosh */:
        case 3 /* Linux */:
        default:
          return [
            "~/.dotnet"
          ];
      }
    case "nuget" /* Nuget */:
      switch (os10) {
        case 2 /* Macintosh */:
          return [
            "~/.nuget/packages",
            "~/Library/Caches/NuGet/v3-cache"
          ];
        case 3 /* Linux */:
        default:
          return [
            "~/.nuget/packages",
            "~/.local/share/NuGet/v3-cache"
          ];
      }
    case "msbuild" /* Msbuild */:
      switch (os10) {
        case 2 /* Macintosh */:
        case 3 /* Linux */:
        default:
          return [];
      }
    case "ruby" /* Ruby */:
      switch (os10) {
        case 2 /* Macintosh */:
          return [
            "~/.gem",
            "~/.rbenv/versions",
            "~/.rbenv/shims",
            "~/.rvm/rubies"
          ];
        case 3 /* Linux */:
        default:
          return [
            "~/.gem",
            "~/.rbenv/versions",
            "~/.rbenv/shims",
            "~/.rvm/rubies"
          ];
      }
    case "nativeBuild" /* NativeBuild */:
      switch (os10) {
        case 2 /* Macintosh */:
          return [
            "~/Library/Caches/ccache",
            "~/Library/Caches/sccache"
          ];
        case 3 /* Linux */:
        default:
          return [
            "~/.cache/ccache",
            "~/.cache/sccache"
          ];
      }
    case "conan" /* Conan */:
      switch (os10) {
        case 2 /* Macintosh */:
        case 3 /* Linux */:
        default:
          return [
            "~/.conan2/p",
            "~/.conan2/b"
          ];
      }
    case "gnupg" /* GnuPG */:
      switch (os10) {
        case 2 /* Macintosh */:
        case 3 /* Linux */:
        default:
          return [
            "~/.gnupg"
          ];
      }
    case "ssh" /* Ssh */:
      switch (os10) {
        case 2 /* Macintosh */:
        case 3 /* Linux */:
        default:
          return [
            "~/.ssh"
          ];
      }
  }
}

function getTerminalSandboxReadAllowListForCommandDetails(os10, commandDetails) {
  const operations = /* @__PURE__ */ new Set();
  for (const command of commandDetails) {
    for (const rule of terminalSandboxReadAllowListCommandDetailRules) {
      if (matchesTerminalSandboxCommandRule(command, rule, { os: os10 })) {
        operations.add(rule.value);
      }
    }
  }
  const paths = [...operations].flatMap((operation) => getTerminalSandboxReadAllowListForOperation(operation, os10));
  return [...new Set(paths)];
}

var terminalSandboxReadAllowListCommandDetailRules = [
  {
    keywords: ["gpg", "gpg2"],
    value: "gnupg" /* GnuPG */
  },
  {
    keywords: ["git"],
    value: "gnupg" /* GnuPG */
  },
  {
    keywords: ["git", "ssh", "scp", "sftp", "rsync"],
    value: "ssh" /* Ssh */
  }
];

function getTerminalSandboxReadAllowListForCommands(os10, commandKeywords, commandDetails = []) {
  if (commandKeywords.length === 0) {
    return getTerminalSandboxReadAllowListForCommandDetails(os10, commandDetails);
  }
  const operations = /* @__PURE__ */ new Set();
  for (const keyword of commandKeywords) {
    const operation = terminalSandboxReadAllowListKeywordMap.get(keyword.toLowerCase());
    if (operation) {
      operations.add(operation);
    }
  }
  const paths = [...operations].flatMap((operation) => getTerminalSandboxReadAllowListForOperation(operation, os10));
  return [.../* @__PURE__ */ new Set([...paths, ...getTerminalSandboxReadAllowListForCommandDetails(os10, commandDetails)])];
}
export { getTerminalSandboxReadAllowListForOperation, getTerminalSandboxReadAllowListForCommandDetails, getTerminalSandboxReadAllowListForCommands, terminalSandboxReadAllowListKeywordMap, terminalSandboxReadAllowListCommandDetailRules };
