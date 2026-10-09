(() => {
  const GUARD_KEY = "pv-dev-reload-at";
  const HOLD_MS = 30000;
  const CONFIRM_MS = 4000;
  let busy = false;
  let pending = null;

  const fetchFresh = url => fetch(url, { cache: "no-store", headers: { "X-Dev-Reload": "1" } });

  function recentlyReloaded() {
    try { return Date.now() - Number(sessionStorage.getItem(GUARD_KEY) || 0) < HOLD_MS; }
    catch (e) { return false; }
  }

  function markReload() {
    try { sessionStorage.setItem(GUARD_KEY, String(Date.now())); } catch (e) {}
  }

  async function check() {
    if (busy || document.visibilityState !== "visible") return;
    const el = document.activeElement;
    if (el && el.matches("input, textarea, select, [contenteditable]")) return;
    busy = true;
    try {
      const res = await fetchFresh("/dev-stamp.txt");
      if (!res.ok) return;
      const stamp = (await res.text()).trim();
      if (stamp === window.DEV_STAMP) { pending = null; return; }
      const now = Date.now();
      if (!pending || pending.stamp !== stamp) { pending = { stamp, at: now }; return; }
      if (now - pending.at < CONFIRM_MS || recentlyReloaded()) return;
      const page = await fetchFresh("/");
      if (!page.ok) return;
      if (!(await page.text()).includes(`window.DEV_STAMP="${stamp}"`)) return;
      const script = await fetchFresh("/dev-reload.js");
      if (!script.ok || !(script.headers.get("content-type") || "").includes("javascript")) return;
      markReload();
      location.reload();
    } catch (e) {} finally { busy = false; }
  }

  setInterval(check, 5000);
  document.addEventListener("visibilitychange", check);
})();
