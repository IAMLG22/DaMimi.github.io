/* =============================================================
   DA MIMÌ — main.js
   Animaciones con Anime.js v3 (lib/anime.min.js, script clásico).
   Patrón IIFE, sin módulos ES. El contenido vive en el HTML;
   este archivo solo lo enriquece.
   ============================================================= */
(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ----------------------------------------------------------
     Split de palabras (preserva <br> y elementos inline)
     ---------------------------------------------------------- */
  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function splitWords(el) {
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    var wrap = function (text) {
      return text.split(/(\s+)/).map(function (w) {
        return /^\s+$/.test(w) ? w : '<span class="split-word" aria-hidden="true">' + escHTML(w) + "</span>";
      }).join("");
    };
    var html = Array.prototype.map.call(el.childNodes, function (node) {
      if (node.nodeType === 3) return wrap(node.textContent);
      if (node.nodeName === "BR") return "<br>";
      if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        return "<" + tag + ">" + wrap(node.textContent) + "</" + tag + ">";
      }
      return "";
    }).join("");
    el.innerHTML = html;
    return $$(".split-word", el);
  }

  /* ----------------------------------------------------------
     Título del hero: entrada palabra a palabra
     ---------------------------------------------------------- */
  function initHeroTitle() {
    var titles = $$(".hero-title[data-split]");
    if (!titles.length || !window.anime) {
      if (titles) titles.forEach(function(t) { t.classList.add("is-split-done"); });
      return;
    }
    
    var allWords = [];
    titles.forEach(function(title) {
      // Remove classes if they exist so it can be re-run safely when translating
      title.classList.remove("is-split-done");
      title.classList.remove("reveal");
      var words = splitWords(title);
      if (words && words.length) allWords = allWords.concat(words);
    });
    
    if (allWords.length > 0) {
      anime({
        targets: allWords,
        translateY: ["0.6em", 0],
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 1100,
        delay: anime.stagger(55, { start: 150 }),
        complete: function () { titles.forEach(function(t) { t.classList.add("is-split-done"); }); }
      });
      // Red de seguridad: pase lo que pase, el título termina visible
      setTimeout(function () { titles.forEach(function(t) { t.classList.add("is-split-done"); }); }, 3000);
    }
  }

  /* ----------------------------------------------------------
     Títulos de sección con data-split (revelado al hacer scroll)
     ---------------------------------------------------------- */
  function initSectionTitles() {
    var titles = $$(".section-title[data-split]");
    if (!titles.length) return;
    if (!window.anime || !("IntersectionObserver" in window)) {
      titles.forEach(function (t) { t.classList.add("is-split-done"); });
      return;
    }
    titles.forEach(function (t) {
      if (t.classList.contains("reveal")) t.classList.remove("reveal");
      var words = splitWords(t);
      var done = false;
      var play = function () {
        if (done) return;
        done = true;
        anime({
          targets: words,
          translateY: ["0.6em", 0],
          opacity: [0, 1],
          easing: "easeOutExpo",
          duration: 900,
          delay: anime.stagger(40),
          complete: function () { t.classList.add("is-split-done"); }
        });
      };
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { play(); io.unobserve(t); }
        });
      }, { threshold: 0.01, rootMargin: "0px 0px -4% 0px" });
      io.observe(t);
    });
    // Seguridad global a los 6 s
    setTimeout(function () {
      titles.forEach(function (t) { t.classList.add("is-split-done"); });
    }, 6000);
  }

  /* ----------------------------------------------------------
     Reveals genéricos al hacer scroll
     ---------------------------------------------------------- */
  function initReveals() {
    var items = $$(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var show = function (el) {
      if (el.classList.contains("is-visible")) return;
      el.classList.add("is-visible");
      if (window.anime && !reduced) {
        anime({
          targets: el,
          translateY: [26, 0],
          opacity: [0, 1],
          easing: "easeOutExpo",
          duration: 950
        });
      }
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    items.forEach(function (el) { io.observe(el); });

    // Red de seguridad obligatoria: a los 6 s se muestra lo que esté en
    // viewport y siga oculto; el resto conserva su animación de scroll.
    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ----------------------------------------------------------
     Contadores animados (48 h, 450 °C, 100 %, 4,6 ★)
     ---------------------------------------------------------- */
  function initCounters() {
    var nums = $$("[data-count-to]");
    if (!nums.length) return;
    var finish = function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var dec = parseInt(el.getAttribute("data-count-decimals") || "0", 10);
      el.textContent = target.toFixed(dec).replace(".", ",");
    };
    if (!window.anime || !("IntersectionObserver" in window)) {
      nums.forEach(finish);
      return;
    }
    var run = function (el) {
      if (el.dataset.counted) return;
      el.dataset.counted = "1";
      var target = parseFloat(el.getAttribute("data-count-to"));
      var dec = parseInt(el.getAttribute("data-count-decimals") || "0", 10);
      var state = { v: 0 };
      anime({
        targets: state,
        v: target,
        round: dec ? Math.pow(10, dec) : 1,
        easing: "easeOutExpo",
        duration: 1600,
        update: function () {
          el.textContent = (dec ? (Math.round(state.v * Math.pow(10, dec)) / Math.pow(10, dec)).toFixed(dec) : Math.round(state.v)).toString().replace(".", ",");
        },
        complete: function () { finish(el); }
      });
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.01 });
    nums.forEach(function (el) { io.observe(el); });
    setTimeout(function () { nums.forEach(finish); }, 6000);
  }

  /* ----------------------------------------------------------
     Tríptico del hero: entrada escalonada + parallax suave
     ---------------------------------------------------------- */
  function initTriptych() {
    var wrap = $("[data-triptych]");
    if (!wrap) return;
    var cards = $$(".tript-card", wrap);
    var entranceDone = !(window.anime && !reduced);

    if (window.anime && !reduced) {
      anime({
        targets: cards,
        translateY: [60, 0],
        opacity: [0, 1],
        scale: [0.96, 1],
        easing: "easeOutExpo",
        duration: 1300,
        delay: anime.stagger(140, { start: 350 }),
        complete: function () { entranceDone = true; }
      });
      // Por si la animación se interrumpe
      setTimeout(function () { entranceDone = true; }, 2600);
    }

    // Parallax sutil (≤ 30 px): intrusividad baja, se desactiva con reduced motion.
    // Espera a que termine la entrada para no pisar sus transforms.
    if (reduced) return;
    var ticking = false;
    var update = function () {
      ticking = false;
      if (!entranceDone) return;
      var rect = wrap.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      if (rect.bottom < 0 || rect.top > vh) return;
      var progress = (vh - rect.top) / (vh + rect.height); // 0 → 1
      cards.forEach(function (card) {
        var depth = parseFloat(card.getAttribute("data-depth") || "0.3");
        var shift = (progress - 0.5) * -60 * depth; // máx ±30px aprox
        card.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0)";
      });
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ----------------------------------------------------------
     Nav: sombra al hacer scroll + menú móvil
     ---------------------------------------------------------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (nav) {
      var onScroll = function () {
        nav.classList.toggle("is-solid", window.scrollY > 8);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    var burger = $("[data-burger]");
    var menu = $("[data-mobile-menu]");
    if (!burger || !menu) return;

    var setOpen = function (open) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      if (open) {
        menu.hidden = false;
        if (window.anime && !reduced) {
          anime({
            targets: $$("a", menu),
            translateY: [-12, 0],
            opacity: [0, 1],
            easing: "easeOutExpo",
            duration: 500,
            delay: anime.stagger(45)
          });
        }
      } else {
        menu.hidden = true;
      }
    };

    burger.addEventListener("click", function () {
      setOpen(burger.getAttribute("aria-expanded") !== "true");
    });
    // Cerrar al pulsar un enlace
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ----------------------------------------------------------
     Anclas con desplazamiento compensado (nav fija)
     ---------------------------------------------------------- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var offset = 64 + (id === "#carta" || /^#(clasicas|gourmet|calzones|sin-gluten|postres|bebidas|extras)$/.test(id) ? 60 : 16);
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ----------------------------------------------------------
     Scrollspy de la carta (píldoras activas)
     ---------------------------------------------------------- */
  function initMenuSpy() {
    var nav = $("[data-menu-nav]");
    if (!nav || !("IntersectionObserver" in window)) return;
    var navTrack = $(".menu-nav-track", nav);
    if (!navTrack) navTrack = nav;
    var links = $$("a[href^='#']:not([data-filter])", navTrack);
    var map = {};
    links.forEach(function (a) { 
      var href = a.getAttribute("href");
      if (href && href.length > 1) {
        map[href.slice(1)] = a; 
      }
    });

    var setActive = function (id) {
      links.forEach(function (a) { a.classList.remove("is-active"); });
      var link = map[id];
      if (link) {
        link.classList.add("is-active");
        // Scroll horizontal suave sin afectar al scroll vertical del documento
        if (navTrack.scrollTo) {
          var offset = link.offsetLeft - navTrack.offsetWidth / 2 + link.offsetWidth / 2;
          navTrack.scrollTo({ left: offset, behavior: reduced ? "auto" : "smooth" });
        }
      }
    };

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0.01 });

    $$(".menu-cat").forEach(function (cat) { io.observe(cat); });
  }

  /* ----------------------------------------------------------
     Ticker: duplicar contenido para bucle continuo
     ---------------------------------------------------------- */
  function initTicker() {
    var track = $("[data-ticker]");
    if (!track || track.dataset.duplicated) return;
    track.dataset.duplicated = "1";
    track.innerHTML += track.innerHTML;
  }

  /* ----------------------------------------------------------
     Microinteracción: lift magnético muy sutil en botones primarios
     ---------------------------------------------------------- */
  function initButtonPop() {
    if (!fineHover || !window.anime) return;
    $$(".btn-primary").forEach(function (btn) {
      if (btn.dataset.popBound) return;
      btn.dataset.popBound = "1";
      btn.addEventListener("mouseover", function (e) {
        if (btn.contains(e.relatedTarget)) return;
        anime.remove(btn);
        anime({ targets: btn, scale: [1, 1.04], duration: 400, easing: "easeOutExpo" });
      });
      btn.addEventListener("mouseout", function (e) {
        if (btn.contains(e.relatedTarget)) return;
        anime.remove(btn);
        anime({ targets: btn, scale: 1, duration: 450, easing: "easeOutExpo" });
      });
    });
  }

  /* ----------------------------------------------------------
     Multi-idioma (ES/EN)
     ---------------------------------------------------------- */
  function initI18n() {
    var langToggle = $("#langToggle");
    if (!langToggle) return;
    
    var dict = {
      "nav-about": { es: "Nosotros", en: "About Us" },
      "nav-menu": { es: "La carta", en: "Menu" },
      "nav-visit": { es: "Visítanos", en: "Visit Us" },
      "hero-title-1": { es: "La verdadera pizza napolitana,", en: "True Neapolitan pizza," },
      "hero-title-2": { es: "a dos pasos de la uni.", en: "steps from campus." },
      "hero-sub": { 
        es: "Masa de 48 horas de fermentación, ingredientes italianos y pasta fresca hecha en casa. Así de simple. Así de serio.", 
        en: "48-hour fermented dough, Italian ingredients, and homemade fresh pasta. That simple. That serious." 
      },
      "hero-btn-1": { es: "Ver la carta", en: "View Menu" },
      "hero-btn-2": { es: "Reservar mesa", en: "Book a Table" },
      "menu-title": { es: "La carta", en: "The Menu" },
      "menu-note": { es: "Todo sale de nuestro horno y de nuestra cocina. También para llevar: ", en: "Everything from our oven and kitchen. Also for takeout: " },
      "cat-desserts": { es: "Postres", en: "Desserts" },
      "cat-drinks": { es: "Bebidas", en: "Drinks" },
      "filter-veg": { es: "Veg", en: "Veg" },
      "filter-spicy": { es: "Picante", en: "Spicy" },
      "filter-gf": { es: "Sin gluten", en: "GF" }
    };

    var currentLang = "es";
    langToggle.addEventListener("click", function () {
      currentLang = currentLang === "es" ? "en" : "es";
      langToggle.textContent = currentLang === "es" ? "EN" : "ES";
      
      $$("[data-i18n]").forEach(function(el) {
        var key = el.getAttribute("data-i18n");
        if (dict[key] && dict[key][currentLang]) {
          el.textContent = dict[key][currentLang];
        }
      });
      // Re-initialize splits if needed
      safe(initHeroTitle, "initHeroTitle");
    });
  }

  /* ----------------------------------------------------------
     Modo oscuro (Theme Toggle)
     ---------------------------------------------------------- */
  function initThemeToggle() {
    var themeToggle = $("#themeToggle");
    if (!themeToggle) return;
    
    var root = document.documentElement;
    var savedTheme = localStorage.getItem("damimi-theme");
    
    if (savedTheme === "dark") {
      root.classList.add("dark-mode");
      themeToggle.textContent = "☀️";
    }
    
    themeToggle.addEventListener("click", function () {
      var isDark = root.classList.toggle("dark-mode");
      themeToggle.textContent = isDark ? "☀️" : "🌙";
      localStorage.setItem("damimi-theme", isDark ? "dark" : "light");
    });
  }

  /* ----------------------------------------------------------
     Filtros Dietéticos
     ---------------------------------------------------------- */
  function initFilters() {
    var filterLinks = $$("[data-filter]");
    if (!filterLinks.length) return;
    
    var dishes = $$(".dish");
    
    filterLinks.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        
        // Update active state
        filterLinks.forEach(function(l) { l.classList.remove("is-active"); l.style.background = "transparent"; l.style.color = "var(--ink-soft)"; });
        btn.classList.add("is-active");
        btn.style.background = "var(--ink)";
        btn.style.color = "#fff";
        
        var filter = btn.getAttribute("data-filter");
        
        dishes.forEach(function (dish) {
          if (filter === "all" || dish.classList.contains(filter)) {
            dish.classList.remove("is-hidden");
            // Optional: fade in
            if (window.anime && !reduced) {
              anime({ targets: dish, opacity: [0, 1], scale: [0.95, 1], duration: 400, easing: "easeOutCubic" });
            }
          } else {
            dish.classList.add("is-hidden");
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------
     Animación de Pizza Secuencial (Caída Libre)
     ---------------------------------------------------------- */
  function initPizzaExplosion() {
    if (reduced) return;
    var pizzaWrap = $("#bg-pizza");
    if (!pizzaWrap || !window.anime) return;
    
    var tomatoes = $$(".ing-tomato-drop", pizzaWrap);
    var finals = $$(".ing-final-drop", pizzaWrap);
    var sauce = $("#pizza-sauce");
    var cheese = $("#pizza-cheese");
    var baseSvg = $(".pizza-base", pizzaWrap);
    var finalDrawing = $(".pizza-final-drawing", pizzaWrap);
    
    // Crear una línea de tiempo (Timeline) para que pase una cosa después de la otra
    var tl = anime.timeline({
      easing: 'easeOutElastic(1, .6)'
    });
    
    // Fase 1: Caen los tomates desde el cielo (fuera de la pantalla)
    tl.add({
      targets: tomatoes,
      translateY: [-1000, 0],
      opacity: [0, 1],
      duration: 1500,
      delay: anime.stagger(150, {start: 500}), // Caen uno a uno
      begin: function() { pizzaWrap.style.opacity = 1; } // Nos aseguramos de que el contenedor es visible
    })
    
    // Fase 2: Los tomates hacen "chof" (desaparecen) y aparece la mancha de salsa
    .add({
      targets: tomatoes,
      scale: [1, 0],
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInBack'
    }, '+=200') // Empieza 200ms después de que hayan caído
    .add({
      targets: sauce,
      scale: [0, 1],
      opacity: [0, 1],
      duration: 800
    }, '-=200') // La salsa aparece un poco antes de que los tomates desaparezcan del todo
    
    // Fase 3: Aparece el queso fundido sobre la salsa
    .add({
      targets: cheese,
      scale: [0, 1],
      opacity: [0, 1],
      duration: 800
    }, '-=400')
    
    // Fase 4: Caen el resto de ingredientes (maíz, albahaca, aceitunas...)
    .add({
      targets: finals,
      translateY: [-1200, 0],
      opacity: [0, 1],
      duration: 1500,
      delay: anime.stagger(100)
    }, '-=200')
    
    // Fase 5: Transición mágica final al dibujo de alta calidad
    .add({
      targets: [baseSvg, finals],
      opacity: [1, 0], // Todo el SVG se desvanece
      duration: 600,
      easing: 'easeInQuad'
    }, '+=800') // Esperamos un poquito a que aterricen
    .add({
      targets: finalDrawing,
      opacity: [0, 1], // El dibujo espectacular aparece
      rotateX: [65, 65],
      rotateZ: [-15, -15],
      scale: [0.95, 1], // Pequeño efecto de "pop"
      duration: 800,
      easing: 'easeOutBack'
    }, '-=600'); // Aparece cruzándose con el desvanecimiento del SVG
  }

  /* ----------------------------------------------------------
     Boot
     ---------------------------------------------------------- */
  function boot() {
    safe(initI18n, "initI18n");
    safe(initThemeToggle, "initThemeToggle");
    safe(initTicker, "initTicker");
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initHeroTitle, "initHeroTitle");
    safe(initSectionTitles, "initSectionTitles");
    safe(initReveals, "initReveals");
    safe(initCounters, "initCounters");
    safe(initTriptych, "initTriptych");
    safe(initMenuSpy, "initMenuSpy");
    safe(initButtonPop, "initButtonPop");
    safe(initFilters, "initFilters");
    safe(initPizzaExplosion, "initPizzaExplosion");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
