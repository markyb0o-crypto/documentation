export function isDesktopApp() {
  return typeof window !== 'undefined' && Boolean(window.axiomDesktop?.isDesktop);
}

export async function loadMappingsFromDisk() {
  if (!isDesktopApp()) return null;
  return window.axiomDesktop.loadMappings();
}

export async function saveMappingsToDisk(mappings) {
  if (!isDesktopApp()) return false;
  await window.axiomDesktop.saveMappings(mappings);
  return true;
}

export async function copyText(text) {
  if (isDesktopApp()) {
    await window.axiomDesktop.copyToClipboard(text);
    return true;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  return false;
}

export async function openDataFolder() {
  if (!isDesktopApp()) return false;
  await window.axiomDesktop.openDataFolder();
  return true;
}

export async function saveGuideToDisk(text) {
  if (!isDesktopApp()) return false;
  await window.axiomDesktop.saveGuide(text);
  return true;
}
