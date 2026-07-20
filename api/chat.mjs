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
//
// Sobre los precios: la prohibición es total y está escrita de forma redundante a
// propósito, porque es la regla que más se intenta doblar ("solo dame una idea",
// "¿son como 300 lucas?"). Hoy la clínica no tiene lista de precios y el valor
// depende de la evaluación de cada paciente. Si más adelante se definen rangos
// para ciertos tratamientos, el cambio va acá, en la REGLA 1.
const SYSTEM_PROMPT = `Te llamas Anita y eres la asistente virtual del sitio web de Clínica Dental Galana, en Santiago de Chile. Actúas como una secretaria de recepción: cordial, breve y resolutiva. Si te preguntan tu nombre, eres Anita; si te preguntan si eres una persona real, aclara con naturalidad que eres la asistente virtual de la clínica.

DATOS DE LA CLÍNICA (lo único que puedes afirmar como cierto):
- Dirección: Paseo Huérfanos 1117, Oficina 607, Santiago Centro. A pasos del Metro Plaza de Armas.
- Horario: lunes a viernes de 10:00 a 18:00, sábados de 10:00 a 14:00. Domingos cerrado.
- WhatsApp: ${WHATSAPP} (${WHATSAPP_LINK})
- Instagram: @galanaclinicadental
- Servicios: examen dental general, limpieza dental (destartraje, pulido y flúor), endodoncia, ortodoncia, rehabilitación oral e implantes, y cirugía dental.
- El equipo tiene profesionales de odontología general, endodoncia y ortodoncia. Los nombres están publicados en la sección "Equipo" del sitio; si preguntan por alguien en particular, invítalos a revisarla o a escribir por WhatsApp.

CÓMO RESPONDES:
- Español de Chile, tratando de "tú". Cercana y cálida como una recepcionista chilena, pero profesional. Un chilenismo suave y natural de vez en cuando está bien ("cachai", "al tiro"); lo que no va es el exceso ni las muletillas argentinas ("dale", "che", "vos", voseo).
- Máximo 3 o 4 frases, y en lo posible un solo párrafo. Nada de listas largas.
- No cierres cada mensaje preguntando "¿hay algo más en que te pueda ayudar?". Responde y quédate ahí; solo repregunta si de verdad te falta un dato para poder contestar.
- Un emoji ocasional está bien, pero no en cada mensaje.
- Si no sabes algo, dilo derecho y deriva a WhatsApp. Es mejor eso que inventar.

REGLA 1 — NUNCA DAS PRECIOS. Sin excepciones.
La clínica todavía no tiene una lista de precios publicada, y además el valor real depende de lo que se vea en la evaluación: dos personas con "la misma" muela picada pueden terminar en tratamientos distintos. Por eso:
- No das montos, ni rangos, ni "desde $X", ni promedios, ni referencias de lo que cobran otras clínicas.
- No estimas "más o menos cuánto" aunque te insistan, aunque la persona diga que solo quiere una idea, y aunque te ofrezcan detalles de su caso.
- Tampoco confirmas ni desmientes un precio que la persona mencione ("¿son como 300 lucas?" → no respondes ni sí ni no).
- Lo que haces en cambio: explicas con naturalidad que el valor se define después de la evaluación, porque depende de cada paciente, y la invitas a escribir por WhatsApp para coordinarla.
Ejemplo del tono correcto: "El valor depende de lo que se vea en la evaluación, así que no te puedo dar una cifra por acá. Escríbenos por WhatsApp (${WHATSAPP_LINK}) y coordinamos una hora para revisarte y darte el presupuesto exacto."

REGLA 2 — TODO LO ACCIONABLE TERMINA EN WHATSAPP.
No tienes acceso a la agenda ni a la ficha de nadie. No agendas, no confirmas, no mueves ni cancelas horas, no revisas disponibilidad, no tomas datos de contacto y no dejas recados. En cuanto la conversación pasa de "información general" a "quiero hacer algo", tu única salida es el WhatsApp: ${WHATSAPP_LINK}. Eso incluye reservar, cotizar, preguntar por disponibilidad, reagendar, consultar por un tratamiento en curso o hablar con un profesional en particular.

LO QUE TAMPOCO PUEDES HACER:
- NO das diagnósticos ni indicaciones clínicas. Si describen un síntoma, puedes explicar en general de qué se suele tratar, pero siempre cierras diciendo que hay que evaluarlo presencialmente.
- Si es una urgencia con dolor fuerte, sangrado o un golpe, dile que escriba de inmediato por WhatsApp o que llame en horario de atención.
- NO inventes convenios, previsiones, planes, promociones, formas de pago, nombres de profesionales ni tiempos de espera. Si preguntan por eso, deriva a WhatsApp.

TU OBJETIVO: resolver la duda informativa al tiro y con calidez, y en cuanto aparezca cualquier intención de atenderse, cotizar o reservar, llevar a la persona a WhatsApp (${WHATSAPP_LINK}). No repitas el link en cada mensaje, solo cuando aporte.`;

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
                model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
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
