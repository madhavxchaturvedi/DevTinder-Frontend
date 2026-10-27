export function migrateBrandKeys() {
  if (typeof window === "undefined" || !window.localStorage) return;
  const migrations = [
    ["devtinder_auth_hint", "octopair_auth_hint"],
    ["devtinder_auth", "octopair_auth"],
    ["devtinder_conversations", "octopair_conversations"],
  ];
  migrations.forEach(([oldKey, newKey]) => {
    try {
      const val = localStorage.getItem(oldKey);
      if (val !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, val);
      }
      localStorage.removeItem(oldKey);
    } catch {
      // Ignore storage access errors
    }
  });
}
