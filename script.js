(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slug = (s) => s.toLowerCase().replace(/&/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Footer year
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Sticky nav background
  const nav = $("#nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile menu
  const burger = $("#burger");
  const menu = $("#menu");
  if (burger && menu) {
    const setMenu = (open) => {
      menu.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  }

  // Reveal on scroll, staggered within each parent
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => {
    const siblings = $$(":scope > .reveal", el.parentElement);
    el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 8) * 0.06}s`);
    revealObserver.observe(el);
  });

  // Count-up stats: the HTML already holds the final value, so this only animates up to it
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      countObserver.unobserve(el);
      if (reduceMotion || !Number.isFinite(end)) return;
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  $$("[data-count]").forEach((el) => countObserver.observe(el));

  // Card tilt + spotlight (pointer devices only)
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
        card.style.transform = `perspective(800px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  // Doctor photos: a doctor's data-photo path adds the photo; initials stay if it's missing or fails to load
  $$(".doc[data-photo]").forEach((doc) => {
    const avatar = $(".avatar", doc);
    const path = doc.dataset.photo.trim();
    if (!avatar) return;
    let img = $("img", avatar);
    if (!img && path) {
      img = document.createElement("img");
      Object.assign(img, { src: path, alt: $("h3", doc)?.textContent || "", loading: "lazy", decoding: "async", width: 180, height: 180 });
      avatar.append(img);
      avatar.classList.add("has-photo");
    }
    if (img) img.addEventListener("error", () => { img.remove(); avatar.classList.remove("has-photo"); });
  });

  // Doctor filters
  const filters = $$(".filter");
  filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      filters.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", String(on));
      });
      const f = btn.dataset.filter;
      $$(".doc").forEach((d) => d.classList.toggle("hidden", f !== "all" && d.dataset.cat !== f));
    })
  );

  // Open / closed badge (Addis Ababa time, UTC+3)
  const badge = $("#openBadge");
  if (badge) {
    const now = new Date(Date.now() + (new Date().getTimezoneOffset() + 180) * 60000);
    const day = now.getDay();
    const mins = now.getHours() * 60 + now.getMinutes();
    const open = (day >= 1 && day <= 5 && mins >= 480 && mins < 1020) || (day === 6 && mins >= 480 && mins < 780);
    badge.textContent = open ? "Open now" : "Clinic closed · ER open";
    badge.className = "open-badge " + (open ? "open" : "closed");
  }

  // Appointment form: pre-select ?package=… and open the user's email app with the request
  const form = $("#apptForm");
  if (form) {
    const note = $("#formNote");
    const select = form.elements.dept;
    const wanted = new URLSearchParams(location.search).get("package");
    if (wanted) {
      const match = [...select.options].find((o) => o.dataset.slug === wanted || slug(o.textContent) === slug(wanted));
      if (match) select.value = match.value;
    }
    form.elements.date.min = new Date().toISOString().slice(0, 10);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      ["name", "phone", "dept", "date"].forEach((n) => {
        const field = form.elements[n];
        const bad = !field.value.trim();
        field.classList.toggle("invalid", bad);
        if (bad) valid = false;
      });
      if (!valid) {
        note.textContent = "Please fill in the highlighted fields.";
        note.className = "form-note err";
        return;
      }
      const d = Object.fromEntries(new FormData(form));
      const body = `Name: ${d.name}\nPhone: ${d.phone}\nSpecialty / package: ${d.dept}\nPreferred date: ${d.date}\n\n${d.msg || ""}`;
      window.location.href =
        "mailto:info@lubuspecializedcenter.com" +
        `?subject=${encodeURIComponent("Appointment request: " + d.dept)}` +
        `&body=${encodeURIComponent(body)}`;
      note.textContent = "Your email app should open with the request ready to send. We'll confirm by phone.";
      note.className = "form-note ok";
    });
    $$("input, select", form).forEach((f) => f.addEventListener("input", () => f.classList.remove("invalid")));
  }

  // Gallery lightbox
  const lb = $("#lightbox");
  const items = $$(".gal-item");
  if (lb && items.length && typeof lb.showModal === "function") {
    const img = $("#lbImg");
    const cap = $("#lbCap");
    const count = $("#lbCount");
    let index = 0;
    const show = (i) => {
      index = (i + items.length) % items.length;
      const item = items[index];
      img.src = item.getAttribute("href");
      img.alt = $("img", item).alt;
      cap.textContent = item.dataset.caption || "";
      count.textContent = `${index + 1} / ${items.length}`;
    };
    items.forEach((item, i) =>
      item.addEventListener("click", (e) => {
        e.preventDefault();
        show(i);
        lb.showModal();
      })
    );
    lb.addEventListener("click", (e) => {
      const action = e.target.closest("[data-lb]")?.dataset.lb;
      if (action === "close" || e.target === lb) lb.close();
      else if (action === "prev") show(index - 1);
      else if (action === "next") show(index + 1);
    });
    lb.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
    lb.addEventListener("close", () => items[index].focus());
  }
})();
