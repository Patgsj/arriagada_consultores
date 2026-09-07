// ==========================================
// MEDICIÓN DE CAPTACIÓN DE LEADS
// ==========================================
// Único lugar donde viven los identificadores de analítica y los eventos de
// contacto del sitio. Los enlaces se detectan por delegación en `document`, así
// que no hay que tocar cada <a> ni acordarse de instrumentar los nuevos: sirve
// también para el navbar y el footer, que se inyectan por fetch después.
(function () {
  'use strict';

  const SITIO = 'arriagada';

  // Propiedad "Arriagada Consultores" en la cuenta de Analytics de hombremilagro@,
  // la misma donde vive el Search Console de este dominio.
  const GA4 = 'G-S4P63QX97K';
  const ADS = 'AW-741110742';

  // ------------------------------------------
  // gtag
  // ------------------------------------------
  const medidores = [GA4, ADS].filter(Boolean);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  if (medidores.length) {
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + medidores[0];
    document.head.appendChild(tag);

    gtag('js', new Date());
    medidores.forEach((id) => gtag('config', id));
  }

  // ------------------------------------------
  // Registro de eventos
  // ------------------------------------------
  function registrar(evento, datos) {
    gtag('event', evento, Object.assign(
      { sitio: SITIO, pagina: location.pathname },
      datos || {}
    ));
  }

  // Para los handlers de formulario de main.js.
  window.registrarLead = registrar;

  function seccionDe(elemento) {
    // Primero los bloques con nombre propio (header, footer, nav), después la
    // sección con id. Así el dato queda legible en el informe de GA4.
    const marco = elemento.closest('header, footer, nav, aside');
    if (marco) return marco.id || marco.tagName.toLowerCase();

    const seccion = elemento.closest('section[id], div[id]');
    if (seccion && seccion.id) return seccion.id;

    return 'sin-seccion';
  }

  function etiquetaDe(elemento) {
    const texto = (elemento.getAttribute('aria-label') || elemento.textContent || '')
      .replace(/\s+/g, ' ')
      .trim();
    return texto ? texto.slice(0, 60) : 'sin-texto';
  }

  // ------------------------------------------
  // Clics de contacto (WhatsApp, teléfono, correo)
  // ------------------------------------------
  const CANALES = [
    ['contacto_whatsapp', /wa\.me|api\.whatsapp\.com/i],
    ['contacto_telefono', /^tel:/i],
    ['contacto_email', /^mailto:/i]
  ];

  document.addEventListener('click', (e) => {
    const enlace = e.target.closest && e.target.closest('a[href]');
    if (!enlace) return;

    const destino = enlace.getAttribute('href') || '';
    const canal = CANALES.find((c) => c[1].test(destino));
    if (!canal) return;

    registrar(canal[0], { seccion: seccionDe(enlace), cta: etiquetaDe(enlace) });
  }, true);

  // ------------------------------------------
  // Lead captado por el asistente
  // ------------------------------------------
  // El chat vive en un iframe de otro origen: el widget reemite el aviso como
  // evento del DOM cuando el worker ya mandó los correos del lead.
  document.addEventListener('chatbot:lead', (e) => {
    const tipo = (e.detail && e.detail.lead) || 'consulta';
    registrar('chatbot_lead', { seccion: 'asistente', cta: tipo });
  });
}());
