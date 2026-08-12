// Pre-inyectar navbar desde caché antes de DOMContentLoaded.
// main.js se ejecuta con defer (DOM ya parseado), así que el placeholder ya existe.
(function () {
  var cached = sessionStorage.getItem('__comp_navbar.html');
  if (cached) {
    var el = document.getElementById('navbar-placeholder');
    if (el) el.innerHTML = cached;
  }
}());

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 0. ANTI-SPAM: MARCA DE TIEMPO EN FORMULARIOS
  // ==========================================
  document.querySelectorAll('form[action="enviar.php"] input[name="form_ts"]').forEach((input) => {
    input.value = Date.now();
  });

  // ==========================================
  // 1. CARGA DE COMPONENTES (Navbar y Footer)
  // ==========================================
  function loadComponent(url, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const cacheKey = '__comp_' + url;
    const cached = sessionStorage.getItem(cacheKey);

    function inject(html, force) {
      // No re-inyectar si el IIFE ya lo hizo (evita parpadeo y doble animación),
      // salvo que forcemos la actualización porque el HTML cambió respecto al caché.
      if (force || !element.innerHTML.trim()) element.innerHTML = html;
      if (elementId === 'navbar-placeholder') {
        initMobileMenu();
        initScrollNav();
        initHashScroll();
        updateNavHeightVar();
        window.addEventListener('resize', updateNavHeightVar, { passive: true });
        setTimeout(initActiveLinks, 500);
      }
    }

    if (cached) inject(cached);

    fetch(url, { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error('Error al cargar ' + url); return r.text(); })
      .then(data => {
        const changed = data !== cached;
        sessionStorage.setItem(cacheKey, data);
        // Si no había caché, ya se inyectó abajo con force=true.
        // Si había caché pero el contenido cambió (el archivo se actualizó), reemplazamos.
        if (!cached || changed) inject(data, true);
      })
      .catch(err => console.error('Error cargando componente:', err));
  }

  loadComponent('navbar.html', 'navbar-placeholder');
  loadComponent('footer.html', 'footer-placeholder');


  // ==========================================
  // 2. SCRIPTS DEL NAVBAR
  // ==========================================
  function initMobileMenu() {
    const btn = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      if (menu.classList.contains('max-h-0')) {
        menu.classList.remove('max-h-0'); menu.classList.add('max-h-[500px]');
      } else {
        menu.classList.add('max-h-0'); menu.classList.remove('max-h-[500px]');
      }
    });

    document.querySelectorAll('#mobile-menu a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('max-h-0'); menu.classList.remove('max-h-[500px]');
      });
    });
  }

  function initScrollNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    // Optimización: Solo cambia la clase si es necesario
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        if(!nav.classList.contains('bg-black/90')) nav.classList.add('bg-black/90', 'backdrop-blur-md', 'shadow-lg');
      } else {
        if(nav.classList.contains('bg-black/90')) nav.classList.remove('bg-black/90', 'backdrop-blur-md', 'shadow-lg');
      }
    }, { passive: true }); // 'passive: true' mejora el rendimiento en móviles
  }

  // ==========================================
  // 2b. SCROLL A SECCIÓN DESCONTANDO EL NAV FIJO
  // ==========================================
  // Los enlaces del nav/footer apuntan a index.html#seccion (para que
  // funcionen igual desde cualquier página interior). Esto corrige el
  // aterrizaje: sin esto, el salto nativo del navegador deja la sección
  // tapada bajo el nav fijo, o no calza exacto si el layout aún se está
  // acomodando (imágenes/fuentes cargando).
  function updateNavHeightVar() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    // Medimos solo la fila persistente (logo + links + botón hamburguesa),
    // nunca el nav completo: si el menú mobile está abierto, su alto se
    // suma al de #main-nav y el aterrizaje deja de calzar bajo la barra.
    const row = document.getElementById('nav-bar-row');
    const mobileMenu = document.getElementById('mobile-menu');
    if (row) {
      const navStyles = getComputedStyle(nav);
      const paddingY = (parseFloat(navStyles.paddingTop) || 0) + (parseFloat(navStyles.paddingBottom) || 0);
      // El margen superior del menú mobile ocupa espacio incluso colapsado
      // (max-height:0 no recorta márgenes), así que también cuenta.
      const menuMarginTop = mobileMenu ? (parseFloat(getComputedStyle(mobileMenu).marginTop) || 0) : 0;
      document.documentElement.style.setProperty('--nav-h', (row.offsetHeight + paddingY + menuMarginTop) + 'px');
    } else {
      document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
    }
  }

  function scrollToHash(hash, smooth) {
    const id = (hash || '').replace('#', '');
    const target = id && document.getElementById(id);
    if (!target) return false;

    updateNavHeightVar();
    target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    return true;
  }

  function initHashScroll() {
    document.querySelectorAll('#main-nav a[href*="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href') || '';
        const hashIndex = href.indexOf('#');
        if (hashIndex === -1) return;
        const hash = href.slice(hashIndex);

        // Si la sección no existe en esta página (estamos en una página
        // interior), dejamos que el navegador navegue a index.html normal.
        if (!document.getElementById(hash.slice(1))) return;

        e.preventDefault();
        history.pushState(null, '', hash);
        scrollToHash(hash, true);
      });
    });
  }

  // Al cargar la página con un hash en la URL (ej. llegando desde una
  // página interior a index.html#propiedades), corregimos el aterrizaje
  // una vez que la carga (imágenes/fuentes) se asienta.
  window.addEventListener('load', () => {
    if (!location.hash) return;
    scrollToHash(location.hash, false);
    setTimeout(() => scrollToHash(location.hash, false), 350);
  });

  // ==========================================
  // 3. SCROLL SPY OPTIMIZADO (Solución al "Golpe")
  // ==========================================
  function initActiveLinks() {
    if (!document.getElementById('inicio')) return;

    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('#main-nav a');
    let ticking = false; // Variable de control para el rendimiento

    window.addEventListener('scroll', () => {
      // Si ya hay una actualización pendiente, no hacemos nada
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveLinks(sections, navLinks);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Función separada para limpiar la lógica
  function updateActiveLinks(sections, navLinks) {
    let current = '';

    // A. Detectar sección actual
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      // Ajuste: detectamos si el usuario está viendo el tercio superior de la sección
      if (window.scrollY >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });

    // B. Si estamos arriba del todo
    if (window.scrollY < 100) current = 'inicio';

    // C. Pintar enlaces
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const linkId = href.includes('#') ? href.split('#')[1] : '';
      if (!linkId) return;

      const isButton = link.classList.contains('bg-orange-600') || link.classList.contains('bg-white');

      if (current === linkId) {
          if (isButton) {
              // Solo cambiamos si no tiene ya la clase (evita parpadeo)
              if(!link.classList.contains('bg-white')) {
                  link.classList.remove('bg-orange-600', 'text-white', 'hover:bg-orange-700');
                  link.classList.add('bg-white', 'text-orange-600', 'hover:bg-gray-100');
              }
          } else {
              // Enlace de texto (desktop o mobile): color naranja = "estás aquí".
              link.classList.add('text-orange-400', 'font-bold');
              link.classList.remove('text-white');
              if (link.classList.contains('border-b-2')) {
                  // Solo el nav desktop usa el subrayado inferior.
                  link.classList.add('border-orange-400');
                  link.classList.remove('border-transparent');
              }
          }
      } else {
          if (isButton) {
              if(!link.classList.contains('bg-orange-600')) {
                  link.classList.add('bg-orange-600', 'text-white', 'hover:bg-orange-700');
                  link.classList.remove('bg-white', 'text-orange-600', 'hover:bg-gray-100');
              }
          } else {
              link.classList.add('text-white');
              link.classList.remove('text-orange-400', 'font-bold');
              if (link.classList.contains('border-b-2')) {
                  link.classList.add('border-transparent');
                  link.classList.remove('border-orange-400');
              }
          }
      }
    });
  }


  // ==========================================
  // 4. LÓGICA CARRUSELES (Swiper)
  // ==========================================
  // Se mantiene igual, son librerías optimizadas
  if (document.querySelector('.mySwiper')) {
    var heroGsapReady = typeof gsap !== 'undefined';

    function animateHeroSlide(swiper) {
      const slide = swiper.slides[swiper.activeIndex];
      if (!slide) return;

      if (heroGsapReady) {
        const items = slide.querySelectorAll('.relative.z-10 .coord-tag, .relative.z-10 h2, .relative.z-10 p, .relative.z-10 a');
        if (!items.length) return;
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        gsap.fromTo(items,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: reduceMotion ? 0 : 0.8, ease: 'power2.out', stagger: reduceMotion ? 0 : 0.15 }
        );
        return;
      }

      const content = slide.querySelector('.relative.z-10');
      if (!content) return;
      content.classList.remove('hero-slide-anim');
      void content.offsetWidth; // forzar reflow para reiniciar animación
      content.classList.add('hero-slide-anim');
    }

    var heroSwiper = new Swiper(".mySwiper", {
      effect: "fade", loop: true, speed: 1000,
      fadeEffect: { crossFade: true },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
      autoplay: { delay: 6000, disableOnInteraction: false },
      on: {
        init: function() { animateHeroSlide(this); },
        slideChangeTransitionStart: function() { animateHeroSlide(this); }
      }
    });
  }

  if (document.querySelector('.propertiesSwiper')) {
     new Swiper(".propertiesSwiper", {
      slidesPerView: 1, spaceBetween: 30, loop: true, speed: 700,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
      breakpoints: {
        640: { slidesPerView: 1, spaceBetween: 20 },
        768: { slidesPerView: 2, spaceBetween: 30 },
        1024: { slidesPerView: 3, spaceBetween: 30 },
      },
      on: { touchEnd: function (swiper) { swiper.autoplay.start(); } }
    });
  }

  if (document.querySelector('.pricingSwiper')) {
    new Swiper(".pricingSwiper", {
      slidesPerView: 1, spaceBetween: 30, loop: true, speed: 700,
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
      breakpoints: {
        640: { slidesPerView: 1, spaceBetween: 20 },
        768: { slidesPerView: 2, spaceBetween: 30 },
        1024: { slidesPerView: 3, spaceBetween: 30 },
      },
    });
  }

  if (document.querySelector('.gallerySwiper')) {
     new Swiper(".gallerySwiper", {
       slidesPerView: 1, spaceBetween: 0, rewind: true, effect: "fade", speed: 800,
       fadeEffect: { crossFade: true },
       autoplay: { delay: 4000, disableOnInteraction: false },
       pagination: { el: ".swiper-pagination", clickable: true },
       navigation: { nextEl: ".custom-next", prevEl: ".custom-prev" },
     });
  }


  // ==========================================
  // 5. LÓGICA FILTRO BLOG
  // ==========================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const blogItems = document.querySelectorAll('.blog-item');

  if (filterBtns.length > 0) {
    const activeClass = "filter-btn px-6 py-2 rounded-lg font-semibold transition-all cursor-pointer shadow-sm bg-orange-600 text-white border border-orange-600";
    const inactiveClass = "filter-btn px-6 py-2 rounded-lg font-semibold transition-all cursor-pointer shadow-sm bg-white text-gray-600 border border-gray-200 hover:border-orange-600 hover:text-orange-600";

    filterBtns.forEach((btn, index) => {
        if (index === 0) btn.className = activeClass;
        else btn.className = inactiveClass;
    });

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('bg-orange-600')) return;

        filterBtns.forEach(b => b.className = inactiveClass);
        btn.className = activeClass;

        blogItems.forEach(item => {
          item.classList.remove('opacity-100');
          item.classList.add('opacity-0'); 
        });

        setTimeout(() => {
          const filterValue = btn.getAttribute('data-filter');
          blogItems.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filterValue === 'all' || category === filterValue) {
              item.classList.remove('hidden');
              item.classList.add('flex');
              setTimeout(() => {
                item.classList.remove('opacity-0');
                item.classList.add('opacity-100');
              }, 50);
            } else {
              item.classList.add('hidden');
              item.classList.remove('flex');
            }
          });
        }, 300);
      });
    });
  }

  // ==========================================
  // 6. FORMULARIO DE CONTACTO PRINCIPAL
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  const successModal = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (contactForm && successModal) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault(); 
      const formData = new FormData(contactForm);

      fetch('enviar.php', { method: 'POST', body: formData })
      .then(response => response.json()) 
      .then(data => {
        if (data.status === 'success') {
          successModal.classList.remove('hidden');
          setTimeout(() => {
            successModal.classList.remove('opacity-0');
            successModal.querySelector('div').classList.remove('scale-95');
            successModal.querySelector('div').classList.add('scale-100');
          }, 10);
          contactForm.reset();
          setTimeout(() => hideModal(), 4000);
        } else {
          alert('Hubo un error al enviar el mensaje. Por favor intenta nuevamente.');
        }
      })
      .catch(error => { console.error('Error:', error); alert('Error de conexión.'); });
    });

    function hideModal() {
      successModal.classList.add('opacity-0');
      successModal.querySelector('div').classList.add('scale-95');
      successModal.querySelector('div').classList.remove('scale-100');
      setTimeout(() => successModal.classList.add('hidden'), 300); 
    }

    if(closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
  }

  // ==========================================
  // 7. FORMULARIO SIDEBAR (PROPIEDADES)
  // ==========================================
  const sidebarForm = document.getElementById('sidebarForm');
  const sidebarSuccessModal = document.getElementById('sidebarSuccessModal');
  const closeSidebarModalBtn = document.getElementById('closeSidebarModalBtn');

  if (sidebarForm && sidebarSuccessModal) {
    sidebarForm.addEventListener('submit', function(e) {
      e.preventDefault(); 
      const formData = new FormData(sidebarForm);

      fetch('enviar.php', { method: 'POST', body: formData })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          sidebarSuccessModal.classList.remove('hidden');
          setTimeout(() => {
            sidebarSuccessModal.classList.remove('opacity-0');
            sidebarSuccessModal.querySelector('div').classList.remove('scale-95');
            sidebarSuccessModal.querySelector('div').classList.add('scale-100');
          }, 10);
          sidebarForm.reset();
          setTimeout(() => hideSidebarModal(), 4000);
        } else {
          alert('Hubo un error. Intenta nuevamente.');
        }
      })
      .catch(error => { console.error('Error:', error); alert('Error de conexión.'); });
    });

    function hideSidebarModal() {
      sidebarSuccessModal.classList.add('opacity-0');
      sidebarSuccessModal.querySelector('div').classList.add('scale-95');
      sidebarSuccessModal.querySelector('div').classList.remove('scale-100');
      setTimeout(() => sidebarSuccessModal.classList.add('hidden'), 300);
    }

    if(closeSidebarModalBtn) closeSidebarModalBtn.addEventListener('click', hideSidebarModal);
  }

  // --- Widget WhatsApp (index y páginas que incluyan el bloque) ---
  const waButton = document.getElementById('whatsapp-button');
  const waChat = document.getElementById('chat-window');
  const waOpenLink = document.getElementById('whatsapp-widget-open-link');
  if (waButton && waChat) {
    const setChatOpen = (open) => {
      waChat.style.display = open ? 'block' : 'none';
    };
    waButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = waChat.style.display === 'block';
      setChatOpen(!isOpen);
    });
    waButton.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      waButton.click();
    });
    document.addEventListener('click', (event) => {
      if (waChat.style.display !== 'block') return;
      if (!waChat.contains(event.target) && !waButton.contains(event.target)) {
        setChatOpen(false);
      }
    });
    if (waOpenLink) {
      waOpenLink.addEventListener('click', () => setChatOpen(false));
    }
  }

  // ==========================================
  // 8. ANIMACIONES DE SCROLL (Reveal)
  // ==========================================
  // Misma lógica de selección de siempre (encabezados, grillas, cards,
  // titulares sueltos); el motor de animación usa GSAP + ScrollTrigger.batch()
  // cuando están cargados (index.html) para un stagger que responde al ritmo
  // real del scroll, y cae de vuelta al IntersectionObserver + CSS anterior
  // en las páginas que todavía no incluyen esos scripts.
  function collectRevealTargets() {
    const seen = new WeakSet();
    const targets = [];

    function tag(el) {
      if (!el || seen.has(el) || el.closest('.swiper-wrapper, .swiper-slide')) return;
      seen.add(el);
      targets.push(el);
    }

    document.querySelectorAll('section .text-center').forEach(el => {
      if (!el.closest('.swiper')) tag(el);
    });

    document.querySelectorAll('section .grid').forEach(grid => {
      if (!grid.closest('.swiper'))
        [...grid.children].forEach(c => tag(c));
    });

    document.querySelectorAll('section article').forEach(el => {
      if (!el.closest('.swiper, .grid')) tag(el);
    });

    document.querySelectorAll('section h2, section h3').forEach(el => {
      if (!el.closest('.text-center, article, .swiper')) tag(el);
    });

    return targets;
  }

  function initScrollRevealGSAP() {
    gsap.registerPlugin(ScrollTrigger);
    const targets = collectRevealTargets();
    if (!targets.length) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(targets, { autoAlpha: 0, y: 28 });
      ScrollTrigger.batch(targets, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) => gsap.to(batch, {
          autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out',
          stagger: { each: 0.12, from: 'start' }
        })
      });
    });
  }

  function initScrollRevealFallback() {
    if (!('IntersectionObserver' in window)) return;

    const targets = collectRevealTargets();
    const perParentIndex = new Map();
    targets.forEach(el => {
      el.classList.add('sr');
      const parent = el.parentElement;
      const i = perParentIndex.get(parent) || 0;
      perParentIndex.set(parent, i + 1);
      if (i) el.style.transitionDelay = (i * 110) + 'ms';
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('sr-show');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.sr').forEach(el => io.observe(el));
  }

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    initScrollRevealGSAP();
  } else {
    initScrollRevealFallback();
  }

});