(() => {
  const storageKey = "stackanvil-theme";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = null;

  function readPreference(value) {
    return value === "light" || value === "dark" ? value : null;
  }

  try {
    preference = readPreference(localStorage.getItem(storageKey));
  } catch {
    // System preference still works when browser storage is unavailable.
  }

  function applyTheme() {
    const dark = preference === "dark" || (preference === null && systemTheme.matches);
    jtd.setTheme(dark ? "stackanvil-dark" : "default");

    const toggle = document.querySelector(".sa-theme-toggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(dark));
      toggle.hidden = false;
    }
  }

  // Select the stylesheet in the head, before the page content renders.
  applyTheme();

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".sa-theme-toggle");
    if (!toggle) return;

    applyTheme();
    toggle.addEventListener("click", () => {
      preference = toggle.getAttribute("aria-pressed") === "true" ? "light" : "dark";
      try {
        localStorage.setItem(storageKey, preference);
      } catch {
        // The toggle still works for this page without browser storage.
      }
      applyTheme();
    });
  });

  systemTheme.addEventListener("change", () => {
    if (preference === null) applyTheme();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null) {
      preference = readPreference(event.newValue);
      applyTheme();
    }
  });
})();
