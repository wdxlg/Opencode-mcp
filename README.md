# OpenCode MCP - recovered JavaScript source

Version: `1.0.0-recovered.24`. This repository contains the maintained JavaScript recovery sources, shared MCP/Bridge code, static assets, build scripts and necessary manifests. It is **not** a complete original TypeScript repository.

## Windows portable runtime
Download the ZIP from this repository's Releases, extract it, and run `OpenCode/OpenCode.exe`. An empty `data/` directory enables portable mode. No account, chat history, MCP credential, personal configuration or Skill library is included. Configure your own model/MCP credentials and Skills. The program may use its normal shared rule storage on the recipient's machine; no publisher's storage is included.

## Source/build prerequisites
Node.js 22+, Python 3 and the pinned esbuild dependency are required. Installed dependencies, native Electron/Code-OSS binaries, vendor baselines and generated application folders are intentionally not committed.

1. Download this version's runtime ZIP.
2. Run `python scripts/prepare-runtime-base.py PATH_TO_RUNTIME_ZIP` in a fresh source checkout. This creates ignored `baseline/` and restores the pinned REA dependency snapshot into ignored `defaults/rea/node_modules/`, without using any personal runtime data.
3. Run `npm ci --prefix toolchain` when you explicitly want to install build dependencies (esbuild 0.25.10).
4. Run `npm run build`. The existing build creates `generated/source-build/` and publishes managed files to `opencode/`; these are ignored outputs, not repository contents. Never update a running target or delete a user's profile.

The supplied runtime was exported from the current, statically verified build, with Skill packages and private content removed. Default manifests and delivery hashes reflect those exclusions. This export did not run GUI, functional or regression tests. Existing historical test results are not proof of this release's behavior.

## Scope and licensing
Original TypeScript types and full upstream build history are not restored. Native components are prebuilt dependencies, not rebuilt here. Preserve the upstream license and third-party notices under `licenses/` and inside the runtime; do not assume a new blanket license for the recovery work. The source export has fresh Git history and does not contain the original local Git database.
