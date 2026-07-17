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
    // SCROLL REVEAL ANIMATIONS
    // ============================================
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    function revealOnScroll() {
        const windowHeight = window.innerHeight;
        const revealPoint = 100;
        
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    }
    
    if (revealElements.length > 0) {
        revealOnScroll(); // Ejecutar al cargar
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
        revealOnScroll();
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
