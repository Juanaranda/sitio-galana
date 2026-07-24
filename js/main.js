// ============================================
// CLÍNICA DENTAL GALANA - JAVASCRIPT
// ============================================

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // NAVEGACIÓN MÓVIL
    // ============================================
    const navToggle = document.getElementById('navToggle');
    const nav = document.getElementById('nav');
    const navList = nav.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Toggle menú móvil
    if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navList.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', navList.classList.contains('active'));
        });
        
        // Cerrar menú al hacer click en un enlace
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navList.classList.remove('active');
            });
        });
        
        // Cerrar menú al hacer click fuera
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.classList.remove('active');
                navList.classList.remove('active');
            }
        });
    }
    
    // ============================================
    // HEADER SCROLL
    // ============================================
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Añadir clase cuando hay scroll
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // ============================================
    // SMOOTH SCROLL PARA ANCLAS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignorar enlaces con solo #
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ============================================
    // ACTIVE LINK EN NAVEGACIÓN
    // ============================================
    function setActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // ============================================
    // SCROLL REVEAL ANIMATIONS (IntersectionObserver + stagger)
    // ============================================
    const revealElements = document.querySelectorAll('.scroll-reveal');
    let revealObserver = null;

    if ('IntersectionObserver' in window) {
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    // Stagger: retraso según posición entre los hermanos que se revelan juntos
                    const siblings = Array.from(el.parentElement.querySelectorAll(':scope > .scroll-reveal'));
                    el.style.transitionDelay = (siblings.indexOf(el) * 0.1) + 's';
                    el.classList.add('active');
                    revealObserver.unobserve(el);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    }

    if (revealObserver) {
        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('active'));
    }

    // ============================================
    // EQUIPO: se carga desde data/equipo.json
    // (editar con equipo-editor.html, sin tocar código)
    // ============================================
    const teamGrid = document.getElementById('teamGrid');

    function ocultarEquipo() {
        const teamSection = document.getElementById('equipo');
        if (teamSection) teamSection.hidden = true;
        // Ocultar también el link del menú para no apuntar a una sección invisible
        const navEquipo = document.querySelector('.nav-list a[href="#equipo"]');
        if (navEquipo && navEquipo.parentElement) navEquipo.parentElement.hidden = true;
    }

    if (teamGrid) {
        fetch('data/equipo.json')
            .then(res => res.json())
            .then(data => {
                const equipo = (data && data.equipo) || [];

                if (equipo.length === 0) {
                    ocultarEquipo();
                    return;
                }

                equipo.forEach(persona => {
                    const card = document.createElement('div');
                    card.className = 'team-card scroll-reveal';

                    const avatar = document.createElement('div');
                    avatar.className = 'team-avatar';
                    if (persona.foto) {
                        const img = document.createElement('img');
                        img.src = 'images/equipo/' + persona.foto;
                        img.alt = persona.nombre;
                        img.loading = 'lazy';
                        avatar.appendChild(img);
                    } else {
                        // Iniciales a partir del nombre, ignorando "Dr."/"Dra."
                        const palabras = (persona.nombre || '')
                            .split(/\s+/)
                            .filter(p => p && !/^dra?\.?$/i.test(p));
                        avatar.textContent = palabras.slice(0, 2).map(p => p[0].toUpperCase()).join('');
                    }
                    card.appendChild(avatar);

                    const nombre = document.createElement('h3');
                    nombre.textContent = persona.nombre;
                    card.appendChild(nombre);

                    if (persona.especialidad) {
                        const esp = document.createElement('p');
                        esp.className = 'team-specialty';
                        esp.textContent = persona.especialidad;
                        card.appendChild(esp);
                    }

                    if (persona.dias) {
                        const dias = document.createElement('p');
                        dias.className = 'team-days';
                        dias.textContent = persona.dias;
                        card.appendChild(dias);
                    }

                    teamGrid.appendChild(card);
                    if (revealObserver) {
                        revealObserver.observe(card);
                    } else {
                        card.classList.add('active');
                    }
                });
            })
            .catch(ocultarEquipo);
    }
    
    // ============================================
    // ANIMACIÓN DE TARJETAS DE SERVICIO
    // ============================================
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
    
    // ============================================
    // ESTADO ABIERTO/CERRADO SEGÚN HORARIO (hora de Santiago)
    // ============================================
    const openStatus = document.getElementById('openStatus');

    if (openStatus) {
        // Horario: Lun-Vie 10:00-18:00, Sáb 10:00-14:00, Dom cerrado
        const schedule = { 1: [10, 18], 2: [10, 18], 3: [10, 18], 4: [10, 18], 5: [10, 18], 6: [10, 14] };

        try {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Santiago',
                hour12: false,
                weekday: 'short',
                hour: 'numeric',
                minute: 'numeric'
            }).formatToParts(new Date());

            const get = type => parts.find(p => p.type === type).value;
            const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
            const hour = (parseInt(get('hour'), 10) % 24) + parseInt(get('minute'), 10) / 60;

            const range = schedule[dayIndex];
            const isOpen = !!range && hour >= range[0] && hour < range[1];

            openStatus.textContent = isOpen ? 'Abierto ahora' : 'Cerrado ahora';
            openStatus.classList.add(isOpen ? 'open' : 'closed');
            openStatus.hidden = false;

            // Punto de estado en la tarjeta del hero
            const heroDot = document.getElementById('heroStatusDot');
            if (heroDot) {
                heroDot.classList.add(isOpen ? 'open' : 'closed');
                heroDot.title = isOpen ? 'Abierto ahora' : 'Cerrado ahora';
            }
        } catch (e) {
            // Si el navegador no soporta timeZone, no se muestra el estado
        }
    }

    // ============================================
    // FORMULARIO DE CONTACTO (si existe)
    // ============================================
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener valores del formulario
            const formData = new FormData(contactForm);
            const nombre = formData.get('nombre');
            const telefono = formData.get('telefono');
            const mensaje = formData.get('mensaje');
            
            // Crear mensaje de WhatsApp
            const whatsappMessage = `Hola, mi nombre es ${nombre}. ${mensaje}`;
            const whatsappUrl = `https://wa.me/56956789735?text=${encodeURIComponent(whatsappMessage)}`;
            
            // Abrir WhatsApp
            window.open(whatsappUrl, '_blank');
            
            // Limpiar formulario
            contactForm.reset();
        });
    }
    
    // ============================================
    // BOTÓN VOLVER ARRIBA
    // ============================================
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.setAttribute('aria-label', 'Volver arriba');
    document.body.appendChild(scrollTopBtn);
    
    // Estilo del botón
    const style = document.createElement('style');
    style.textContent = `
        .scroll-top-btn {
            position: fixed;
            /* A la izquierda para no tapar el widget de chat (abajo a la derecha) */
            bottom: 30px;
            left: 30px;
            width: 50px;
            height: 50px;
            background: var(--accent-color);
            color: var(--white);
            border: none;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 999;
        }
        
        .scroll-top-btn.show {
            opacity: 1;
            visibility: visible;
        }
        
        .scroll-top-btn:hover {
            background: var(--accent-hover);
            transform: translateY(-3px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        @media (max-width: 640px) {
            .scroll-top-btn {
                bottom: 20px;
                left: 20px;
                width: 45px;
                height: 45px;
                font-size: 1.25rem;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Mostrar/ocultar botón
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });
    
    // Click en botón
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // ============================================
    // PREVENIR ENLACES ROTOS
    // ============================================
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Si el enlace está vacío o es solo #, prevenir
            if (!href || href === '#' || href === 'javascript:void(0)') {
                e.preventDefault();
            }
        });
    });
    
    // ============================================
    // PERFORMANCE: DEBOUNCE PARA EVENTOS DE SCROLL
    // ============================================
    function debounce(func, wait = 10, immediate = true) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    // Aplicar debounce a funciones de scroll
    window.addEventListener('scroll', debounce(function() {
        setActiveLink();
    }, 15));
    
    // ============================================
    // PRELOADER (opcional)
    // ============================================
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
    
    // ============================================
    // CONSOLA: MENSAJE DE BIENVENIDA
    // ============================================
    console.log('%c🦷 Clínica Dental GALANA ', 'background: #2a4a6e; color: #fff; padding: 10px 20px; font-size: 16px; font-weight: bold;');
    console.log('%cSitio web desarrollado con ❤️', 'color: #c6a962; font-size: 12px;');
    
});

// ============================================
// FORMULARIO "SOLICITAR HORA"
// ============================================
// No reserva de verdad: arma un mensaje ordenado y abre WhatsApp, que es donde
// la clínica confirma. Por eso toda la validación es en el cliente y no hay que
// mandar nada a un servidor.
(function () {
    var form = document.getElementById('bookingForm');
    if (!form) return;

    var WHATSAPP = '56956789735';
    var diaInput = document.getElementById('bkDia');
    var errorBox = document.getElementById('bkError');

    // La agenda vive en Chile; el mínimo del calendario es "hoy" en esa zona,
    // para que alguien en otro huso no pueda elegir un día que allá ya pasó.
    function hoyEnChile() {
        var partes = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(new Date());
        return partes; // yyyy-mm-dd
    }
    diaInput.min = hoyEnChile();

    function mostrarError(msg) {
        errorBox.textContent = msg;
        errorBox.hidden = false;
    }

    // Marca en rojo un campo puntual. El .has-error se limpia solo cuando el
    // usuario lo corrige, para que el rojo no se quede pegado.
    function marcar(input) {
        var campo = input.closest('.booking-field');
        if (!campo) return;
        campo.classList.add('has-error');
        input.addEventListener('input', function quitar() {
            campo.classList.remove('has-error');
            input.removeEventListener('input', quitar);
        });
    }

    // yyyy-mm-dd -> "martes 29 de julio" (se construye local para no correr un día
    // por el desfase de zona horaria que trae el parseo ISO).
    function formatearDia(valor) {
        var p = valor.split('-');
        var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
        var texto = d.toLocaleDateString('es-CL', {
            weekday: 'long', day: 'numeric', month: 'long'
        });
        return { texto: texto, esDomingo: d.getDay() === 0 };
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        errorBox.hidden = true;

        var nombre = form.nombre.value.trim();
        var servicio = form.servicio.value;
        var dia = form.dia.value;
        var horario = form.horario.value;
        var comentario = form.comentario.value.trim();

        if (!nombre || !servicio || !dia || !horario) {
            if (!nombre) marcar(form.nombre);
            if (!servicio) marcar(form.servicio);
            if (!dia) marcar(form.dia);
            if (!horario) marcar(form.horario);
            mostrarError('Completa tu nombre, el servicio, el día y el horario para enviar la solicitud.');
            return;
        }

        var fecha = formatearDia(dia);
        if (fecha.esDomingo) {
            marcar(form.dia);
            mostrarError('Los domingos no atendemos. Elige un día de lunes a sábado.');
            return;
        }

        var lineas = [
            'Hola, quiero solicitar una hora 🦷',
            '',
            '• Nombre: ' + nombre,
            '• Servicio: ' + servicio,
            '• Día preferido: ' + fecha.texto,
            '• Horario: ' + horario
        ];
        if (comentario) lineas.push('• Comentario: ' + comentario);

        var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lineas.join('\n'));
        window.open(url, '_blank', 'noopener');
    });
})();

// ============================================
// DETECTAR DISPOSITIVO TÁCTIL
// ============================================
function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

if (isTouchDevice()) {
    document.body.classList.add('touch-device');
}

// ============================================
// ANALYTICS (Google Analytics - Placeholder)
// ============================================
// window.dataLayer = window.dataLayer || [];
// function gtag(){dataLayer.push(arguments);}
// gtag('js', new Date());
// gtag('config', 'UA-XXXXXXXXX-X');
