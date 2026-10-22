// Shared source for builtin-extension uninstall records. Does not execute targets.
const recordQueues = new Map();

async function readUninstalledIds(fileService, location, isMissingFile) {
  try {
    const content = await fileService.readFile(location);
    const parsed = JSON.parse(content.value.toString());
    return Array.isArray(parsed) ? [...new Set(parsed.filter((id) => typeof id === "string").map((id) => id.toLowerCase()))] : [];
  } catch (error) {
    if (isMissingFile(error)) return [];
    throw error;
  }
}

export async function filterRecordedBuiltinExtensions(extensions, fileService, location, isMissingFile) {
  if (!extensions.length) return extensions;
  const ids = new Set(await readUninstalledIds(fileService, location, isMissingFile));
  return extensions.filter((extension) => !ids.has(extension.identifier.id.toLowerCase()));
}

// Serialize the complete read-modify-write for one record within this process.
// This is not a cross-process filesystem lock.
export function recordBuiltinExtensionUninstall(id, fileService, location, isMissingFile, encodeRecord) {
  const key = location.toString();
  const previous = recordQueues.get(key) ?? Promise.resolve();
  const operation = previous.catch(() => {}).then(async () => {
    const ids = await readUninstalledIds(fileService, location, isMissingFile);
    const normalized = id.toLowerCase();
    if (!ids.includes(normalized)) ids.push(normalized);
    await fileService.writeFile(location, encodeRecord(JSON.stringify(ids)));
  });
  recordQueues.set(key, operation);
  return operation.finally(() => {
    if (recordQueues.get(key) === operation) recordQueues.delete(key);
  });
}
