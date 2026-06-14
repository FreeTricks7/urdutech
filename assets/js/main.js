/* =========================================================
   UrduTech portfolio — interactions
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar scroll state ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const closeMenu = () => {
    if (!links) return;
    links.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  }

  /* ---------- Reveal (static elements) ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("in"));
    } else {
      const ro = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add("in"); ro.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach((el) => ro.observe(el));
    }
  }

  /* ---------- Hero entrance ---------- */
  const heroEls = document.querySelectorAll("[data-hero]");
  heroEls.forEach((el, i) => {
    if (reduceMotion) { el.style.opacity = 1; return; }
    el.style.opacity = 0;
    el.style.transform = "translateY(22px)";
    el.style.transition = "opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1)";
    setTimeout(() => { el.style.opacity = 1; el.style.transform = "none"; }, 120 + i * 130);
  });

  /* ---------- Active nav link (scroll-position based) ---------- */
  const sections = ["apps", "clients", "about", "contact"].map((id) => document.getElementById(id)).filter(Boolean);
  const navAnchors = links ? Array.from(links.querySelectorAll('a[href^="#"]')) : [];
  if (sections.length && navAnchors.length) {
    const setActive = () => {
      const line = window.innerHeight * 0.35; // detection line near top of viewport
      let currentId = null;
      sections.forEach((s) => {
        if (s.getBoundingClientRect().top <= line) currentId = s.id;
      });
      navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + currentId));
    };
    setActive();
    window.addEventListener("scroll", setActive, { passive: true });
    window.addEventListener("resize", setActive);
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.getAttribute("data-count")) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length && "IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { runCounter(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Render app / client cards ---------- */
  const grid = document.getElementById("appsGrid");
  const clientsGrid = document.getElementById("clientsGrid");
  const playSvg = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M4 3l11.5 9L4 21V3z"/></svg>';
  const extSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M7 17 17 7M9 7h8v8"/></svg>';

  const cardTemplate = (app, isClient) => {
    const playBtn = app.playUrl
      ? `<a class="app-play" href="${app.playUrl}" target="_blank" rel="noopener" aria-label="Get ${app.name} on Google Play">${playSvg} Google Play</a>`
      : `<span class="app-play disabled" aria-disabled="true">${playSvg} Coming soon</span>`;

    let footer;
    if (isClient) {
      footer = `<a class="client-pub" href="${app.publisherUrl}" target="_blank" rel="noopener">Published by&nbsp;<b>${app.publisher}</b>${extSvg}</a>`;
    } else {
      footer = app.privacyUrl ? `<a class="app-privacy" href="${app.privacyUrl}">Privacy</a>` : "";
    }

    return `
      <article class="app-card${app.featured ? " featured" : ""}${isClient ? " client-card" : ""}" style="--card-accent:${app.accent}" data-reveal="scale">
        <div class="app-top">
          <img class="app-icon" src="${app.icon}" alt="${app.name} icon" width="64" height="64" loading="lazy" onerror="this.src='logo.png'" />
          <div>
            <div class="app-name">${app.name}</div>
            <div class="app-sub">${app.subtitle}</div>
          </div>
        </div>
        <div class="app-tags">
          <span class="tag">${app.category}</span>
          ${isClient ? '<span class="tag built">Built by me</span>' : ""}
        </div>
        <p class="app-desc">${app.tagline}</p>
        <div class="app-actions">${playBtn}</div>
        ${isClient ? footer : `<div class="app-actions" style="margin-top:14px">${footer}</div>`}
      </article>`;
  };

  const attachTilt = (root) => {
    if (reduceMotion) return;
    root.querySelectorAll(".app-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  };

  /* Staggered reveal observer for dynamically inserted cards */
  const observeNewReveals = (root, step) => {
    const items = root.querySelectorAll("[data-reveal]");
    items.forEach((el, i) => el.style.setProperty("--reveal-delay", Math.min(i * (step || 70), 480) + "ms"));
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); ro.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    items.forEach((el) => ro.observe(el));
  };

  const renderFail = (el) =>
    (el.innerHTML = '<p style="color:var(--text-dim)">Loading from Google Play — <a href="https://play.google.com/store/apps/developer?id=UrduTech" target="_blank" rel="noopener" style="color:var(--accent-2)">view the developer page</a>.</p>');

  if (grid || clientsGrid) {
    fetch("assets/data/apps.json")
      .then((r) => r.json())
      .then((data) => {
        if (grid) {
          const apps = (data.apps || []).slice().sort((a, b) => (b.featured === true) - (a.featured === true));
          grid.innerHTML = apps.map((a) => cardTemplate(a, false)).join("");
          attachTilt(grid);
          observeNewReveals(grid, 80);
        }
        if (clientsGrid) {
          const clients = data.clients || [];
          clientsGrid.innerHTML = clients.map((a) => cardTemplate(a, true)).join("");
          attachTilt(clientsGrid);
          observeNewReveals(clientsGrid, 80);
        }
      })
      .catch(() => { if (grid) renderFail(grid); if (clientsGrid) renderFail(clientsGrid); });
  }
})();
