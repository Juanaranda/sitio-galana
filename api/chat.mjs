// Proxy hacia OpenRouter para el asistente del sitio.
//
// Vive en el servidor por una sola razón: la API key no puede viajar al navegador.
// El navegador manda el historial de la conversación, esta función le agrega el
// system prompt y la key, y devuelve la respuesta en streaming.
//
// Variables de entorno necesarias: ver .env.example

const WHATSAPP = '+56 9 5678 9735';
const WHATSAPP_LINK = 'https://wa.me/56956789735';

// El asistente es deliberadamente "solo informativo": no agenda, no cotiza y no
// diagnostica. Todo lo que requiera una acción real termina derivado a WhatsApp,
// que es donde la clínica sí puede responder.
const SYSTEM_PROMPT = `Eres la asistente virtual del sitio web de Clínica Dental Galana, en Santiago de Chile. Actúas como una secretaria de recepción: cordial, breve y resolutiva.

DATOS DE LA CLÍNICA (lo único que puedes afirmar como cierto):
- Dirección: Paseo Huérfanos 1117, Oficina 607, Santiago Centro. A pasos del Metro Plaza de Armas.
- Horario: lunes a viernes de 10:00 a 18:00, sábados de 10:00 a 14:00. Domingos cerrado.
- WhatsApp: ${WHATSAPP} (${WHATSAPP_LINK})
- Instagram: @galanaclinicadental
- Servicios: examen dental general, limpieza dental (destartraje, pulido y flúor), endodoncia, ortodoncia, rehabilitación oral e implantes, y cirugía dental.
- El equipo tiene profesionales de odontología general, endodoncia y ortodoncia. Los nombres están publicados en la sección "Equipo" del sitio; si preguntan por alguien en particular, invítalos a revisarla o a escribir por WhatsApp.

CÓMO RESPONDES:
- Español de Chile, tratando de "tú". Cercana pero profesional. Nunca uses voseo argentino.
- Máximo 3 o 4 frases. Nada de listas largas ni de texto de relleno.
- Si no sabes algo, dilo derecho y deriva a WhatsApp. Es mejor eso que inventar.

LO QUE NO PUEDES HACER (importante):
- NO das precios ni estimaciones de precio. Los valores dependen de cada caso: deriva a WhatsApp.
- NO agendas, confirmas, mueves ni cancelas horas. No tienes acceso a la agenda. Cuando alguien quiera reservar, dale el link de WhatsApp.
- NO das diagnósticos ni indicaciones clínicas. Si describen un síntoma, puedes explicar en general de qué se suele tratar, pero siempre cierras diciendo que hay que evaluarlo presencialmente.
- Si es una urgencia con dolor fuerte, sangrado o un golpe, dile que escriba de inmediato por WhatsApp o que llame en horario de atención.
- NO inventes convenios, previsiones, promociones, nombres de profesionales ni tiempos de espera.

TU OBJETIVO: resolver la duda simple al tiro, y cuando la persona muestre intención de atenderse, invitarla naturalmente a seguir por WhatsApp (${WHATSAPP_LINK}). No repitas el link en cada mensaje, solo cuando aporte.`;

const MAX_MENSAJE = 1000;      // caracteres por mensaje del usuario
const MAX_HISTORIAL = 12;      // mensajes de contexto que se reenvían
const LIMITE_POR_IP = 25;      // mensajes...
const VENTANA_MS = 10 * 60_000; // ...cada 10 minutos

// Contador en memoria. Con Fluid Compute las instancias se reutilizan, así que
// frena el abuso casual. No pretende ser un rate limit serio.
const visitas = new Map();

function pasaRateLimit(ip) {
    const ahora = Date.now();
    const registro = visitas.get(ip);
    if (!registro || ahora > registro.reinicioEn) {
        visitas.set(ip, { conteo: 1, reinicioEn: ahora + VENTANA_MS });
        return true;
    }
    registro.conteo += 1;
    return registro.conteo <= LIMITE_POR_IP;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('[chat] Falta OPENROUTER_API_KEY en las variables de entorno');
        return res.status(500).json({ error: 'El asistente no está configurado.' });
    }

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconocida';
    if (!pasaRateLimit(ip)) {
        return res.status(429).json({ error: 'Muchos mensajes seguidos. Espera un momento e intenta de nuevo.' });
    }

    const mensajesEntrantes = Array.isArray(req.body?.messages) ? req.body.messages : null;
    if (!mensajesEntrantes || mensajesEntrantes.length === 0) {
        return res.status(400).json({ error: 'Falta el historial de la conversación.' });
    }

    // Solo se aceptan roles user/assistant: el system prompt lo pone el servidor,
    // para que nadie pueda reescribir las reglas desde el navegador.
    const historial = mensajesEntrantes
        .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-MAX_HISTORIAL)
        .map(m => ({ role: m.role, content: m.content.slice(0, MAX_MENSAJE) }));

    if (historial.length === 0) {
        return res.status(400).json({ error: 'El historial no tiene mensajes válidos.' });
    }

    try {
        const respuesta = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://galana.cl',
                'X-Title': 'Clínica Dental Galana'
            },
            body: JSON.stringify({
                model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-haiku',
                messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...historial],
                max_tokens: 400,
                temperature: 0.4,
                stream: true
            })
        });

        if (!respuesta.ok) {
            const detalle = await respuesta.text();
            // El caso típico es un ID de modelo que OpenRouter renombró o retiró.
            console.error(`[chat] OpenRouter respondió ${respuesta.status}: ${detalle}`);
            return res.status(502).json({ error: 'No pude conectarme al asistente en este momento.' });
        }

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');

        // OpenRouter manda SSE; acá se desarma y se reenvía solo el texto plano,
        // que es lo único que el widget necesita.
        const lector = respuesta.body.getReader();
        const decoder = new TextDecoder();
        let pendiente = '';

        while (true) {
            const { done, value } = await lector.read();
            if (done) break;

            pendiente += decoder.decode(value, { stream: true });
            const lineas = pendiente.split('\n');
            pendiente = lineas.pop() ?? '';

            for (const linea of lineas) {
                if (!linea.startsWith('data: ')) continue;
                const datos = linea.slice(6).trim();
                if (datos === '[DONE]') { res.end(); return; }
                try {
                    const trozo = JSON.parse(datos)?.choices?.[0]?.delta?.content;
                    if (trozo) res.write(trozo);
                } catch {
                    // Los comentarios de keep-alive de SSE no son JSON. Se ignoran.
                }
            }
        }

        res.end();
    } catch (error) {
        console.error('[chat] Error inesperado:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'No pude conectarme al asistente en este momento.' });
        } else {
            res.end();
        }
    }
}
