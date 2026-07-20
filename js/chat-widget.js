/**
 * Asistente virtual de Clínica Dental Galana.
 *
 * Widget autocontenido (inyecta su propio HTML y CSS) que conversa con /api/chat.
 * Es provisorio: cuando el agente de molari.ai esté listo, se borra este archivo,
 * se saca el <script> de las dos páginas y se vuelve a poner el snippet de molari.
 *
 * El botón "volver arriba" vive abajo a la izquierda justamente para no chocar
 * con este widget.
 */
(function () {
    'use strict';

    var WHATSAPP = 'https://wa.me/56956789735?text=Hola, me gustaría agendar una hora';

    var SALUDO = '¡Hola! 👋 Soy Anita, la asistente virtual de Clínica Dental Galana. ' +
        'Puedo contarte sobre horarios, ubicación y tratamientos. ¿En qué te ayudo?';

    var SUGERENCIAS = [
        '¿Cuál es el horario?',
        '¿Dónde están ubicados?',
        '¿Qué incluye una limpieza?'
    ];

    // Historial que se manda al servidor. El saludo inicial no va: es decorativo
    // y sumarlo solo gasta contexto.
    var historial = [];
    var esperando = false;

    var estilos = [
        '.ga-chat-toggle{position:fixed;right:24px;bottom:24px;z-index:9998;width:60px;height:60px;border:none;border-radius:50%;',
        'background:#00A0C0;color:#fff;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.22);display:flex;align-items:center;',
        'justify-content:center;transition:transform .2s,box-shadow .2s}',
        '.ga-chat-toggle:hover{transform:scale(1.06);box-shadow:0 8px 26px rgba(0,0,0,.28)}',
        '.ga-chat-toggle svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:2}',
        '.ga-chat-toggle .ga-ico-cerrar{display:none}',
        '.ga-chat-toggle.abierto .ga-ico-abrir{display:none}',
        '.ga-chat-toggle.abierto .ga-ico-cerrar{display:block}',

        '.ga-chat-panel{position:fixed;right:24px;bottom:96px;z-index:9999;width:370px;max-width:calc(100vw - 32px);',
        'height:520px;max-height:calc(100vh - 130px);background:#fff;border-radius:16px;overflow:hidden;',
        'box-shadow:0 12px 40px rgba(0,0,0,.22);display:flex;flex-direction:column;',
        'font-family:Montserrat,system-ui,sans-serif;opacity:0;transform:translateY(12px) scale(.98);',
        'pointer-events:none;transition:opacity .2s,transform .2s}',
        '.ga-chat-panel.abierto{opacity:1;transform:none;pointer-events:auto}',

        '.ga-chat-head{background:#00A0C0;color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0}',
        '.ga-chat-head-avatar{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;',
        'align-items:center;justify-content:center;font-size:19px;flex-shrink:0}',
        '.ga-chat-head strong{display:block;font-size:.95rem;font-weight:700;line-height:1.3}',
        '.ga-chat-head span{display:block;font-size:.76rem;opacity:.9}',

        '.ga-chat-body{flex:1;overflow-y:auto;padding:18px;background:#f7fbfc;display:flex;flex-direction:column;gap:10px}',
        '.ga-msg{max-width:85%;padding:11px 14px;border-radius:14px;font-size:.88rem;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}',
        '.ga-msg-bot{align-self:flex-start;background:#fff;color:#2b3d42;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.08)}',
        '.ga-msg-yo{align-self:flex-end;background:#00809B;color:#fff;border-bottom-right-radius:4px}',
        '.ga-msg-error{align-self:flex-start;background:#fdecea;color:#a02c1e;font-size:.83rem}',
        '.ga-msg-bot a,.ga-msg-error a{color:#00809B;font-weight:600}',

        '.ga-puntos{display:flex;gap:4px;padding:14px}',
        '.ga-puntos span{width:7px;height:7px;border-radius:50%;background:#9fc9d4;animation:ga-latido 1.3s infinite}',
        '.ga-puntos span:nth-child(2){animation-delay:.18s}.ga-puntos span:nth-child(3){animation-delay:.36s}',
        '@keyframes ga-latido{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}',

        '.ga-chips{display:flex;flex-wrap:wrap;gap:7px;padding:0 18px 12px;background:#f7fbfc}',
        '.ga-chip{border:1px solid #CFEEF6;background:#fff;color:#00809B;border-radius:999px;padding:7px 13px;',
        'font-family:inherit;font-size:.78rem;font-weight:600;cursor:pointer;transition:background .15s}',
        '.ga-chip:hover{background:#EAF8FB}',

        '.ga-chat-pie{border-top:1px solid #e8eef0;background:#fff;flex-shrink:0}',
        '.ga-chat-form{display:flex;gap:8px;padding:12px}',
        '.ga-chat-form input{flex:1;min-width:0;border:1px solid #e0e8ea;border-radius:999px;padding:11px 15px;',
        'font-family:inherit;font-size:.87rem;color:#2b3d42}',
        '.ga-chat-form input:focus{outline:2px solid #00A0C0;outline-offset:-1px;border-color:transparent}',
        '.ga-chat-form button{width:42px;height:42px;flex-shrink:0;border:none;border-radius:50%;background:#00A0C0;',
        'color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}',
        '.ga-chat-form button:disabled{background:#b9d9e2;cursor:default}',
        '.ga-chat-form button svg{width:19px;height:19px;fill:currentColor}',
        '.ga-wa{display:flex;align-items:center;justify-content:center;gap:7px;padding:10px;margin:0 12px 12px;',
        'background:#25D366;color:#fff;border-radius:10px;font-size:.83rem;font-weight:600;text-decoration:none}',
        '.ga-wa svg{width:16px;height:16px;fill:currentColor}',
        '.ga-nota{font-size:.68rem;color:#8a9ba1;text-align:center;padding:0 12px 10px;line-height:1.4}',

        '@media (max-width:520px){',
        '.ga-chat-panel{right:12px;left:12px;width:auto;bottom:88px;height:calc(100vh - 120px)}',
        '.ga-chat-toggle{right:16px;bottom:16px;width:54px;height:54px}}',

        '@media (prefers-reduced-motion:reduce){',
        '.ga-chat-toggle,.ga-chat-panel{transition:none}.ga-puntos span{animation:none}}'
    ].join('');

    var ICONO_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.09 3.2 5.07 4.49.71.3 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.34m-5.42 7.4a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26C2.2 6.46 6.64 2.02 12.09 2.02c2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 012.89 6.99c0 5.45-4.43 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.69 1.45c6.55 0 11.89-5.34 11.89-11.9 0-3.17-1.24-6.16-3.48-8.4Z"/></svg>';

    var panel, cuerpo, chips, input, boton, toggle;

    function crear(tag, clase, texto) {
        var el = document.createElement(tag);
        if (clase) el.className = clase;
        if (texto) el.textContent = texto;
        return el;
    }

    function irAbajo() {
        cuerpo.scrollTop = cuerpo.scrollHeight;
    }

    // Convierte los links que escriba el modelo en <a> reales. Se construye nodo a
    // nodo en vez de con innerHTML: así el texto del modelo nunca se interpreta
    // como HTML y no hay riesgo de inyección.
    function pintarTexto(el, texto) {
        el.textContent = '';
        var partes = texto.split(/(https?:\/\/[^\s<>()]+)/g);
        partes.forEach(function (parte) {
            if (/^https?:\/\//.test(parte)) {
                var a = crear('a', null, parte.replace(/^https?:\/\//, ''));
                a.href = parte;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                el.appendChild(a);
            } else if (parte) {
                el.appendChild(document.createTextNode(parte));
            }
        });
    }

    function agregarMensaje(texto, clase) {
        var el = crear('div', 'ga-msg ' + clase);
        pintarTexto(el, texto);
        cuerpo.appendChild(el);
        irAbajo();
        return el;
    }

    function mostrarSugerencias(mostrar) {
        chips.style.display = mostrar ? 'flex' : 'none';
    }

    function bloquear(si) {
        esperando = si;
        boton.disabled = si;
        input.disabled = si;
    }

    async function enviar(texto) {
        if (!texto || esperando) return;

        agregarMensaje(texto, 'ga-msg-yo');
        historial.push({ role: 'user', content: texto });
        input.value = '';
        mostrarSugerencias(false);
        bloquear(true);

        var puntos = crear('div', 'ga-msg ga-msg-bot ga-puntos');
        puntos.innerHTML = '<span></span><span></span><span></span>';
        cuerpo.appendChild(puntos);
        irAbajo();

        try {
            var respuesta = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: historial })
            });

            if (!respuesta.ok) {
                var datos = await respuesta.json().catch(function () { return {}; });
                throw new Error(datos.error || 'No pude responder en este momento.');
            }

            // Los puntos suspensivos se reemplazan por la burbuja recién empieza a
            // llegar texto, para que no quede un globo vacío parpadeando.
            puntos.remove();
            var burbuja = agregarMensaje('', 'ga-msg-bot');

            var lector = respuesta.body.getReader();
            var decoder = new TextDecoder();
            var completo = '';

            while (true) {
                var trozo = await lector.read();
                if (trozo.done) break;
                completo += decoder.decode(trozo.value, { stream: true });
                pintarTexto(burbuja, completo);
                irAbajo();
            }

            if (completo.trim()) {
                historial.push({ role: 'assistant', content: completo });
            } else {
                burbuja.remove();
                throw new Error('No pude responder en este momento.');
            }
        } catch (error) {
            if (puntos.parentNode) puntos.remove();
            var aviso = agregarMensaje(
                (error.message || 'Algo falló.') + ' Escríbenos por WhatsApp al +56 9 5678 9735 y te respondemos al tiro.',
                'ga-msg-error'
            );
            aviso.setAttribute('role', 'alert');
        } finally {
            bloquear(false);
            input.focus();
        }
    }

    function construir() {
        var hoja = crear('style');
        hoja.textContent = estilos;
        document.head.appendChild(hoja);

        toggle = crear('button', 'ga-chat-toggle');
        toggle.type = 'button';
        toggle.setAttribute('aria-label', 'Abrir el chat con Anita, la asistente virtual');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML =
            '<svg class="ga-ico-abrir" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M21 11.5a8.4 8.4 0 01-9 8.4 9 9 0 01-3.9-.9L3 20.5l1.5-4.5A8.4 8.4 0 013.6 11.5a8.4 8.4 0 018.4-8.4h.5a8.4 8.4 0 018.5 8.4z" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '<svg class="ga-ico-cerrar" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>';

        panel = crear('div', 'ga-chat-panel');
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Anita, asistente virtual de Clínica Dental Galana');

        var head = crear('div', 'ga-chat-head');
        var avatar = crear('div', 'ga-chat-head-avatar', '🦷');
        avatar.setAttribute('aria-hidden', 'true');
        var titulo = crear('div');
        titulo.appendChild(crear('strong', null, 'Anita'));
        titulo.appendChild(crear('span', null, 'Asistente virtual · responde al instante'));
        head.appendChild(avatar);
        head.appendChild(titulo);

        cuerpo = crear('div', 'ga-chat-body');
        // El streaming va escribiendo dentro; "polite" evita que el lector de
        // pantalla lea cada fragmento por separado.
        cuerpo.setAttribute('aria-live', 'polite');

        chips = crear('div', 'ga-chips');
        SUGERENCIAS.forEach(function (texto) {
            var chip = crear('button', 'ga-chip', texto);
            chip.type = 'button';
            chip.addEventListener('click', function () { enviar(texto); });
            chips.appendChild(chip);
        });

        var pie = crear('div', 'ga-chat-pie');
        var form = crear('form', 'ga-chat-form');
        input = crear('input');
        input.type = 'text';
        input.placeholder = 'Escribe tu consulta...';
        input.maxLength = 1000;
        input.setAttribute('aria-label', 'Escribe tu consulta');
        input.autocomplete = 'off';

        boton = crear('button');
        boton.type = 'submit';
        boton.setAttribute('aria-label', 'Enviar mensaje');
        boton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>';

        form.appendChild(input);
        form.appendChild(boton);
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            enviar(input.value.trim());
        });

        var wa = crear('a', 'ga-wa');
        wa.href = WHATSAPP;
        wa.target = '_blank';
        wa.rel = 'noopener noreferrer';
        wa.innerHTML = ICONO_WA + '<span>Agendar por WhatsApp</span>';

        var nota = crear('div', 'ga-nota',
            'Asistente automático: entrega información general y no agenda horas ni da precios.');

        pie.appendChild(form);
        pie.appendChild(wa);
        pie.appendChild(nota);

        panel.appendChild(head);
        panel.appendChild(cuerpo);
        panel.appendChild(chips);
        panel.appendChild(pie);

        document.body.appendChild(toggle);
        document.body.appendChild(panel);

        agregarMensaje(SALUDO, 'ga-msg-bot');

        toggle.addEventListener('click', function () {
            var abierto = panel.classList.toggle('abierto');
            toggle.classList.toggle('abierto', abierto);
            toggle.setAttribute('aria-expanded', String(abierto));
            toggle.setAttribute('aria-label', abierto ? 'Cerrar el chat' : 'Abrir el chat con Anita, la asistente virtual');
            if (abierto) { input.focus(); irAbajo(); }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && panel.classList.contains('abierto')) {
                toggle.click();
                toggle.focus();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', construir);
    } else {
        construir();
    }
})();
