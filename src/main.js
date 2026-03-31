document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. CARGA DE COMPONENTES (Navbar y Footer)
  // ==========================================
  function loadComponent(url, elementId) {
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Error al cargar ' + url);
        return response.text();
      })
      .then(data => {
        const element = document.getElementById(elementId);
        if (element) {
          element.innerHTML = data;
          if (elementId === 'navbar-placeholder') {
            initMobileMenu();
            initScrollNav();
            // Esperamos un poco para iniciar el ScrollSpy para asegurar que todo cargó
            setTimeout(initActiveLinks, 500); 
          }
        }
      })
      .catch(error => console.error('Error cargando componente:', error));
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
              link.classList.remove('text-white');
              link.classList.add('text-orange-400', 'font-bold');
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
          }
      }
    });
  }


  // ==========================================
  // 4. LÓGICA CARRUSELES (Swiper)
  // ==========================================
  // Se mantiene igual, son librerías optimizadas
  if (document.querySelector('.mySwiper')) {
    var heroSwiper = new Swiper(".mySwiper", {
      effect: "fade", loop: true,
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
      autoplay: { delay: 6000, disableOnInteraction: false },
    });
  }

  if (document.querySelector('.propertiesSwiper')) {
     new Swiper(".propertiesSwiper", {
      slidesPerView: 1, spaceBetween: 30, loop: true,
      autoplay: { delay: 3000, disableOnInteraction: false },
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
      slidesPerView: 1, spaceBetween: 30, loop: true,
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
       slidesPerView: 1, spaceBetween: 0, loop: true, effect: "fade",
       autoplay: { delay: 4000, disableOnInteraction: true },
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
    const activeClass = "filter-btn px-6 py-2 rounded-full font-semibold transition-all cursor-pointer shadow-md bg-orange-600 text-white border border-orange-600";
    const inactiveClass = "filter-btn px-6 py-2 rounded-full font-semibold transition-all cursor-pointer shadow-sm bg-white text-gray-600 border border-gray-200 hover:border-orange-600 hover:text-orange-600";

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

});