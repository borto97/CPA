(function () {
  const TOC_PIN_KEY = "cpa20_toc_pinned";
  const HEADER_COLLAPSED_KEY = "cpa20_header_collapsed_mobile";
  const MOBILE_BREAKPOINT = 860;

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function slugify(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function uniqueId(base, used) {
    let id = base || "secao";
    let i = 2;
    while (used.has(id) || document.getElementById(id)) {
      id = `${base}-${i++}`;
    }
    used.add(id);
    return id;
  }

  function injectUIStyles() {
    if (document.getElementById("cpa-ui-runtime-styles")) return;

    const style = document.createElement("style");
    style.id = "cpa-ui-runtime-styles";
    style.textContent = `
      html.has-cpa-mobile-header header{
        transition:
          padding .22s ease,
          min-height .22s ease,
          box-shadow .22s ease,
          background .22s ease;
      }

      html.has-cpa-mobile-header .cpa-mobile-toggle{
        display: none;
      }

      /* ===== HEADER MOBILE COMPACTO ===== */
      @media (max-width: 860px){
        html.has-cpa-mobile-header header{
          position: fixed;
          inset: 0 0 auto 0;
          top: 0 !important;
          left: 0;
          right: 0;
          z-index: 1200;
          margin: 0 !important;
          transform: none !important;
          backdrop-filter: blur(12px);
        }

        html.has-cpa-mobile-header header .wrap{
          padding: 8px 12px !important;
        }

        html.has-cpa-mobile-header header .nav{
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 10px !important;
          width: 100%;
          min-height: 0 !important;
        }

        html.has-cpa-mobile-header header .brand{
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          margin: 0 !important;
          flex: 1 1 auto;
          min-width: 0;
        }

        html.has-cpa-mobile-header header .brand a{
          white-space: nowrap;
        }

        html.has-cpa-mobile-header header .badge{
          white-space: nowrap;
        }

        html.has-cpa-mobile-header header .actions{
          display: flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 8px !important;
          margin: 0 !important;
          align-self: center !important;
          flex: 0 0 auto;
        }

        html.has-cpa-mobile-header .cpa-mobile-toggle{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          padding: 0;
          border-radius: 999px;
          border: 1px solid var(--line, rgba(255,255,255,.14));
          background: color-mix(in srgb, var(--panel) 92%, transparent);
          color: var(--text, #fff);
          font: inherit;
          font-size: 18px;
          font-weight: 900;
          line-height: 1;
          cursor: pointer;
          flex: 0 0 auto;
          box-shadow: 0 8px 24px rgba(0,0,0,.18);
        }

        html.has-cpa-mobile-header .cpa-mobile-toggle:hover{
          text-decoration: none;
        }

        html.has-cpa-mobile-header header .links{
          width: 100%;
          order: 3;
          margin-top: 8px;
        }

        html.has-cpa-mobile-header header.is-mobile-collapsed .nav{
          min-height: 42px !important;
          flex-wrap: nowrap !important;
        }

        html.has-cpa-mobile-header header.is-mobile-collapsed .links{
          display: none !important;
        }

        html.has-cpa-mobile-header header.is-mobile-collapsed .pill-feedback{
          display: none !important;
        }

        html.has-cpa-mobile-header header.is-mobile-collapsed .actions{
          margin-left: auto !important;
        }

        html.has-cpa-mobile-header header:not(.is-mobile-collapsed) .nav{
          flex-wrap: wrap !important;
          align-items: center !important;
        }

        html.has-cpa-mobile-header header:not(.is-mobile-collapsed) .links{
          display: flex !important;
          flex-wrap: wrap !important;
          justify-content: flex-start !important;
          gap: 8px !important;
          overflow: visible !important;
        }

        html.has-cpa-mobile-header header:not(.is-mobile-collapsed) .pill{
          height: 36px;
          padding: 0 12px;
        }

        html.has-cpa-mobile-header body,
        html.has-cpa-mobile-header .layout,
        html.has-cpa-mobile-header main{
          scroll-padding-top: calc(var(--header-h, 72px) + 14px);
        }
      }

      /* ===== TOC / SUMÁRIO ===== */
      #toc{
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      #toc .toc__header{
        position: relative;
        z-index: 2;
        flex: 0 0 auto;
      }

      #toc .toc__list{
        min-height: 0;
        flex: 1 1 auto;
      }

      #toc.is-open,
      #toc.is-pinned{
        overflow: auto;
        overscroll-behavior: contain;
      }

      #toc.is-open .toc__header,
      #toc.is-pinned .toc__header{
        position: sticky;
        top: 0;
        z-index: 5;
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--panel) 92%, var(--accent) 8%),
          color-mix(in srgb, var(--panel2) 92%, var(--accent) 6%)
        );
        border-bottom: 1px solid rgba(255,255,255,.10);
        box-shadow: 0 10px 20px rgba(0,0,0,.14);
      }

      @media (max-width: 860px){
        #toc.is-open,
        #toc.is-pinned{
          max-height: min(72vh, calc(100vh - var(--header-h, 64px) - 14px));
        }
      }
    `;

    document.head.appendChild(style);
  }

  function syncHeaderHeightVar() {
    const header = qs("header");
    const h = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty("--header-h", `${h}px`);
  }

  function ensureHeaderCompactControl() {
    const header = qs("header");
    if (!header) return;

    document.documentElement.classList.add("has-cpa-mobile-header");

    const nav = qs(".nav", header);
    const actions = qs(".actions", header);

    if (!nav || !actions) {
      syncHeaderHeightVar();
      return;
    }

    if (header.dataset.mobileCompactReady === "1") {
      syncHeaderHeightVar();
      return;
    }

    header.dataset.mobileCompactReady = "1";

    header.style.marginTop = "0";
    header.style.top = "0";
    header.style.left = "0";
    header.style.right = "0";

    let toggleBtn = qs(".cpa-mobile-toggle", header);

    if (!toggleBtn) {
      toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "cpa-mobile-toggle";
      toggleBtn.setAttribute("aria-label", "Expandir ou recolher cabeçalho");
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.innerHTML = "☰";
      toggleBtn.style.order = "99";
      actions.appendChild(toggleBtn);
    }

    function isMobile() {
      return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    function setCollapsed(collapsed) {
      header.classList.toggle("is-mobile-collapsed", !!collapsed);
      toggleBtn.innerHTML = collapsed ? "☰" : "✕";
      toggleBtn.setAttribute("aria-expanded", String(!collapsed));
      localStorage.setItem(HEADER_COLLAPSED_KEY, collapsed ? "true" : "false");

      requestAnimationFrame(syncHeaderHeightVar);
      setTimeout(syncHeaderHeightVar, 120);
      setTimeout(syncHeaderHeightVar, 240);
    }

    function applyResponsiveState() {
      if (isMobile()) {
        const saved = localStorage.getItem(HEADER_COLLAPSED_KEY);
        const collapsed = saved === null ? true : saved === "true";
        setCollapsed(collapsed);
      } else {
        header.classList.remove("is-mobile-collapsed");
        toggleBtn.innerHTML = "☰";
        toggleBtn.setAttribute("aria-expanded", "true");
        requestAnimationFrame(syncHeaderHeightVar);
      }
    }

    toggleBtn.addEventListener("click", () => {
      const currentlyCollapsed = header.classList.contains(
        "is-mobile-collapsed",
      );
      setCollapsed(!currentlyCollapsed);
    });

    applyResponsiveState();
    window.addEventListener("resize", applyResponsiveState);
    window.addEventListener("orientationchange", applyResponsiveState);
    window.addEventListener("resize", syncHeaderHeightVar);
  }

  function cleanupIfNoTOC() {
    document.body.classList.remove("toc-open", "toc-pinned");
  }

  function keepActiveInView(tocEl, linkEl) {
    if (
      !tocEl.classList.contains("is-open") &&
      !tocEl.classList.contains("is-pinned")
    ) {
      return;
    }

    const pad = 14;
    const cTop = tocEl.scrollTop;
    const cBottom = cTop + tocEl.clientHeight;
    const elTop = linkEl.offsetTop;
    const elBottom = elTop + linkEl.offsetHeight;

    if (elTop - pad < cTop) {
      tocEl.scrollTo({
        top: Math.max(0, elTop - pad),
        behavior: "smooth",
      });
      return;
    }

    if (elBottom + pad > cBottom) {
      tocEl.scrollTo({
        top: elBottom - tocEl.clientHeight + pad,
        behavior: "smooth",
      });
    }
  }

  function buildTOC(tocEl) {
    const scopeSel = tocEl.dataset.tocScope || "main";
    const levels = (tocEl.dataset.tocLevels || "2,3")
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => n >= 1 && n <= 6);

    const scope = qs(scopeSel);
    if (!scope) return;

    const selector = levels.map((l) => `h${l}`).join(",");
    const headings = qsa(selector, scope).filter(
      (h) => h.textContent.trim().length,
    );

    const list = qs(".toc__list", tocEl);
    if (!list) return;
    list.innerHTML = "";

    const used = new Set();

    headings.forEach((h) => {
      if (!h.id) {
        h.id = uniqueId(slugify(h.textContent.trim()) || "secao", used);
      }

      const level = parseInt(h.tagName.slice(1), 10);

      const li = document.createElement("li");
      li.className = "toc__item";
      li.dataset.level = String(level);

      const a = document.createElement("a");
      a.className = "toc__link";
      a.href = `#${h.id}`;
      a.textContent = h.textContent.trim();

      a.addEventListener("click", () => {
        if (!tocEl.classList.contains("is-pinned")) {
          tocEl.classList.remove("is-open");
          document.body.classList.remove("toc-open");
        }
      });

      li.appendChild(a);
      list.appendChild(li);
    });

    const links = qsa(".toc__link", tocEl);
    const map = new Map();

    links.forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (el) map.set(el, a);
    });

    if ("IntersectionObserver" in window && map.size) {
      let last = null;

      const io = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

          if (!visible.length) return;

          const activeLink = map.get(visible[0].target);
          if (!activeLink) return;

          if (last) last.classList.remove("is-active");
          activeLink.classList.add("is-active");
          last = activeLink;

          keepActiveInView(tocEl, activeLink);
        },
        {
          rootMargin: "-20% 0px -70% 0px",
          threshold: [0.1, 0.25, 0.5],
        },
      );

      map.forEach((_, el) => io.observe(el));
    }
  }

  function setupTOC() {
    const toc = qs("#toc");
    if (!toc) {
      cleanupIfNoTOC();
      return;
    }

    const pinBtn = qs("#toc-pin", toc);

    function syncExpandedState() {
      const expanded =
        toc.classList.contains("is-open") ||
        toc.classList.contains("is-pinned");

      toc.classList.toggle("is-expanded", expanded);
      requestAnimationFrame(syncHeaderHeightVar);
    }

    function openTOC() {
      if (toc.classList.contains("is-pinned")) return;
      toc.classList.add("is-open");
      document.body.classList.add("toc-open");
      syncExpandedState();
    }

    function closeTOC() {
      if (toc.classList.contains("is-pinned")) return;
      toc.classList.remove("is-open");
      document.body.classList.remove("toc-open");
      syncExpandedState();
    }

    function applyPinned(isPinned) {
      toc.classList.toggle("is-pinned", isPinned);
      if (pinBtn) pinBtn.classList.toggle("is-active", isPinned);

      document.body.classList.toggle("toc-pinned", isPinned);

      if (isPinned) {
        toc.classList.add("is-open");
        document.body.classList.add("toc-open");
      } else {
        toc.classList.remove("is-open");
        document.body.classList.remove("toc-open");
      }

      localStorage.setItem(TOC_PIN_KEY, String(isPinned));
      syncExpandedState();
    }

    const pinned = localStorage.getItem(TOC_PIN_KEY) === "true";
    applyPinned(pinned);

    if (pinBtn && !pinBtn.dataset.bound) {
      pinBtn.dataset.bound = "1";
      pinBtn.addEventListener("click", () => {
        applyPinned(!toc.classList.contains("is-pinned"));
      });
    }

    const edgePx = 22;

    document.addEventListener("mousemove", (e) => {
      if (toc.classList.contains("is-pinned")) return;

      if (e.clientX <= edgePx) openTOC();

      const tocWidth = toc.getBoundingClientRect().width;
      if (e.clientX > tocWidth + 30) closeTOC();
    });

    toc.addEventListener("mouseleave", () => {
      closeTOC();
    });

    const classObs = new MutationObserver(syncExpandedState);
    classObs.observe(toc, {
      attributes: true,
      attributeFilter: ["class"],
    });

    buildTOC(toc);
    syncExpandedState();
  }

  function boot() {
    injectUIStyles();
    ensureHeaderCompactControl();
    setupTOC();
    syncHeaderHeightVar();

    requestAnimationFrame(syncHeaderHeightVar);
    setTimeout(syncHeaderHeightVar, 120);
    setTimeout(syncHeaderHeightVar, 300);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  const obs = new MutationObserver(() => {
    ensureHeaderCompactControl();
    syncHeaderHeightVar();
  });

  obs.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.addEventListener("resize", syncHeaderHeightVar);
  window.addEventListener("orientationchange", syncHeaderHeightVar);
})();
