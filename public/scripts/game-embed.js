// Game embed frame functionality
export function initGameEmbedFrame(frameShellId) {
  const shell = document.getElementById(frameShellId);
  const frame = shell?.querySelector("iframe");
  const loading = shell?.querySelector("[data-frame-loading]");

  if (frame && loading) {
    const slowLoadTimer = window.setTimeout(() => {
      loading.textContent = "Still loading... If nothing appears, use the source link below.";
    }, 5000);

    frame.addEventListener(
      "load",
      () => {
        window.clearTimeout(slowLoadTimer);
        shell?.classList.add("is-loaded");
      },
      { once: true }
    );
  }
}

// Fullscreen functionality
export function initFullscreenHandler() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-frame-fullscreen]");
    if (!trigger) return;

    const targetId = trigger.getAttribute("data-frame-fullscreen");
    const shell = document.getElementById(targetId);

    if (shell && shell.requestFullscreen) {
      shell.requestFullscreen();
    }
  });
}
