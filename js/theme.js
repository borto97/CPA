/* ./js/theme.js
   Tema único (data-theme no <html>) + persistência
   Funciona mesmo com layout injetado via partial (header carregado depois).
*/
(function () {
  const KEY = "cpa_theme_v1";
  const DEFAULT_THEME = "dark";

  function getTheme() {
    return localStorage.getItem(KEY) || DEFAULT_THEME;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
  }

  function syncRadios(theme) {
    document.querySelectorAll('input[name="theme"]').forEach((r) => {
      r.checked = (r.value === theme);
    });
  }

  function openModal() {
    const modal = document.getElementById("settingsModal");
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("modal-open");
  }

  function closeModal() {
    const modal = document.getElementById("settingsModal");
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("modal-open");
  }

  function ensureModal() {
    let modal = document.getElementById("settingsModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "settingsModal";
    modal.className = "settings-modal";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="settings-backdrop" data-close="1"></div>

      <div class="settings-card" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
        <div class="settings-head">
          <div>
            <div class="settings-title" id="settingsTitle">Tema</div>
            <div class="settings-sub">Escolha um tema completo (fica salvo no seu navegador).</div>
          </div>
          <button class="settings-x" type="button" aria-label="Fechar" data-close="1">✕</button>
        </div>

        <div class="settings-body">
          <div class="settings-group">
            <div class="settings-label">Selecionar</div>

            <div class="settings-options">
              <label class="opt"><input type="radio" name="theme" value="dark"> <span>Dark</span></label>
              <label class="opt"><input type="radio" name="theme" value="midnight"> <span>Midnight</span></label>
              <label class="opt"><input type="radio" name="theme" value="forest"> <span>Forest</span></label>
              <label class="opt"><input type="radio" name="theme" value="sand"> <span>Sand</span></label>
              <label class="opt"><input type="radio" name="theme" value="light"> <span>Light</span></label>
              <label class="opt"><input type="radio" name="theme" value="banrisul"> <span>Banrisul</span></label>
              <label class="opt"><input type="radio" name="theme" value="bb"> <span>Banco do Brasil</span></label>
              <label class="opt"><input type="radio" name="theme" value="santander"> <span>Santander</span></label>
              <label class="opt"><input type="radio" name="theme" value="itau"> <span>Itaú</span></label>
            </div>
          </div>

          <div class="settings-row">
            <button class="btn-ghost" type="button" id="settingsReset">Restaurar padrão</button>
            <button class="btn-solid" type="button" data-close="1">Concluir</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // ✅ BIND DOS EVENTOS AQUI (na criação), então SEMPRE funciona
    modal.addEventListener("click", (e) => {
      // fechar (backdrop, X, concluir)
      if (e.target.closest('[data-close="1"]')) {
        closeModal();
        return;
      }

      // trocar tema (clicando no input OU no label)
      const radio = e.target.closest('input[type="radio"][name="theme"]');
      if (radio) {
        applyTheme(radio.value);     // prévia imediata
        syncRadios(radio.value);
        return;
      }
    });

    // reset (botão específico)
    const resetBtn = modal.querySelector("#settingsReset");
    resetBtn.addEventListener("click", () => {
      applyTheme(DEFAULT_THEME);
      syncRadios(DEFAULT_THEME);
    });

    // ESC fecha
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") closeModal();
    });

    return modal;
  }

  // ✅ botão do header pode aparecer depois (layout injetado), então observa
  function bindSettingsButton() {
    const btn = document.getElementById("openSettings");
    if (!btn || btn.dataset.bound) return;

    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const theme = getTheme();
      const modal = ensureModal();
      syncRadios(theme);
      openModal();
    });
  }

  // Observa DOM pra pegar o header quando o layout.js injetar
  function observeHeaderButton() {
    bindSettingsButton();

    const obs = new MutationObserver(() => bindSettingsButton());
    obs.observe(document.documentElement, { childList: true, subtree: true });
    // não desconecto pra evitar corrida com Live Server / swaps
  }

  // API pública usada pelo layout.js
  window.CPATheme = {
    init() {
      applyTheme(getTheme());
    },
    initSettingsUI() {
      observeHeaderButton();
    }
  };
})();
