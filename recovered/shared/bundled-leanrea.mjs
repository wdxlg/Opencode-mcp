// LeanREA is a bundled instruction file, not an executable tool or MCP server.
import fs from 'node:fs';
import path from 'node:path';

const READ_TOOLS = new Set(['read_files', 'read_image', 'find_files', 'search_files', 'list_directory']);

export function bundledLeanreaDirectory(extensionPath) {
  if (typeof extensionPath !== 'string' || !path.isAbsolute(extensionPath)) return undefined;
  const base = path.resolve(extensionPath);
  const directory = path.join(base, 'defaults', 'skills', 'leanrea');
  const document = path.join(directory, 'SKILL.md');
  try {
    // Refuse substituted links at or below the extension root.
    for (let cursor = directory;; cursor = path.dirname(cursor)) {
      const stat = fs.lstatSync(cursor);
      if (stat.isSymbolicLink() || !stat.isDirectory()) return undefined;
      if (cursor === base) break;
      if (path.dirname(cursor) === cursor) return undefined;
    }
    const stat = fs.lstatSync(document);
    if (stat.isSymbolicLink() || !stat.isFile()) return undefined;
    return directory;
  } catch {
    return undefined;
  }
}

export function bundledLeanreaReadRoot(extensionPath, toolName) {
  return READ_TOOLS.has(toolName) ? bundledLeanreaDirectory(extensionPath) : undefined;
}

export function appendBundledLeanrea(listing, extensionPath) {
  const directory = bundledLeanreaDirectory(extensionPath);
  if (!directory || !listing || !Array.isArray(listing.skills)) return listing;
  // An existing user Skill, even a disabled one, takes precedence.
  if (listing.skills.some(skill => String(skill.name || '').toLowerCase() === 'leanrea')) return listing;
  return {
    ...listing,
    skills: [...listing.skills, {
      name: 'leanrea',
      title: 'LeanREA (bundled)',
      description: 'Reverse-engineering guidance using available local CLI tools; not an MCP server or a permission grant.',
      scope: 'bundled',
      directory,
      skillFile: path.join(directory, 'SKILL.md'),
      loaded: true,
      enabled: listing.enabled === true,
    }],
  };
}
