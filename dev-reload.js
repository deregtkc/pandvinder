(() => {
  let busy = false;
  async function check() {
    if (busy || document.visibilityState !== "visible") return;
    const el = document.activeElement;
    if (el && el.matches("input, textarea, select, [contenteditable]")) return;
    busy = true;
    try {
      const res = await fetch("/dev-stamp.txt", { cache: "no-store" });
      if (res.ok && (await res.text()).trim() !== window.DEV_STAMP) location.reload();
    } catch (e) {} finally { busy = false; }
  }
  setInterval(check, 5000);
  document.addEventListener("visibilitychange", check);
})();
