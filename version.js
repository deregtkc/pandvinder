const APP_VERSION = "V1.2";

document.addEventListener("DOMContentLoaded", () => {
  const el = document.createElement("div");
  el.textContent = APP_VERSION;
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    position: "fixed",
    top: "calc(env(safe-area-inset-top, 0px) + 6px)",
    left: "10px",
    fontSize: "10px",
    color: "var(--muted)",
    pointerEvents: "none",
    zIndex: "40",
  });
  document.body.appendChild(el);
});
