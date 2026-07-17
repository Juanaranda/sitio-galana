# Clínica Dental GALANA - Sitio Web

## 📋 Descripción

Sitio web profesional para la Clínica Dental GALANA, ubicada en Santiago, Chile. Diseño moderno, responsivo y optimizado para conversión de pacientes.

## 🏗️ Estructura del Proyecto

```
galana-dental/
│
├── index.html                 # Página principal
├── servicios.html             # Página de servicios
│
├── css/
│   └── styles.css            # Estilos principales
│
├── js/
│   └── main.js               # JavaScript interactivo
│
├── images/                   # Carpeta para imágenes (vacía - agregar imágenes propias)
│
└── README.md                 # Este archivo
```

## ✨ Características

### Diseño y Estética
- **Diseño Moderno**: Interfaz limpia y profesional con tipografía elegante
- **Paleta de Colores**: Azul oscuro (profesional) con toques dorados (premium)
- **Totalmente Responsivo**: Optimizado para móviles, tablets y desktop
- **Animaciones Suaves**: Micro-interacciones que mejoran la experiencia

### Funcionalidades
- ✅ Navegación fija con efecto scroll
- ✅ Menú hamburguesa en móviles
- ✅ Scroll suave entre secciones
- ✅ Animaciones al hacer scroll
- ✅ Botón de volver arriba
- ✅ Integración con WhatsApp
- ✅ Enlaces a redes sociales
- ✅ Mapa de Google integrado

### Servicios Incluidos
1. **Examen Dental General** - Evaluación completa
2. **Endodoncia** - Tratamiento de conductos
3. **Ortodoncia** - Alineación dental
4. **Rehabilitación e Implantes** - Recuperación dental
5. **Cirugía** - Procedimientos quirúrgicos

## 🚀 Instalación y Uso

### Opción 1: Uso Directo (Local)
1. Descarga todos los archivos
2. Abre `index.html` en tu navegador
3. ¡Listo!

### Opción 2: Servidor Local
```bash
# Con Python
python -m http.server 8000

# Con Node.js (http-server)
npx http-server

# Visita: http://localhost:8000
```

### Opción 3: Hosting Web
Sube los archivos a cualquier servicio de hosting:
- Netlify (recomendado)
- Vercel
- GitHub Pages
- Hostinger
- Otros

## 🎨 Personalización

### Colores
Edita las variables CSS en `css/styles.css`:

```css
:root {
    --primary-color: #2a4a6e;      /* Color principal */
    --accent-color: #c6a962;       /* Color acento */
    --whatsapp: #25d366;           /* WhatsApp */
    /* ... más colores */
}
```

### Contenido
- **Textos**: Edita directamente en los archivos HTML
- **Servicios**: Modifica las secciones en `servicios.html`
- **Información de contacto**: Actualiza números y enlaces

### Imágenes
1. Coloca tus imágenes en la carpeta `images/`
2. Reemplaza las referencias en HTML:
   ```html
   <img src="images/tu-imagen.jpg" alt="Descripción">
   ```

### Logo
Reemplaza el texto "GALANA" en el header con tu logo:
```html
<div class="logo">
    <img src="images/logo.png" alt="Clínica Dental GALANA">
</div>
```

## 📱 Redes Sociales y Contacto

Actualiza los siguientes enlaces en los archivos HTML:

- **WhatsApp**: `https://wa.me/56956789735`
- **Instagram**: `@galanaclinicadental`
- **Facebook**: Enlace a página de Facebook

## 🗺️ Mapa de Google

Para actualizar la ubicación del mapa:
1. Ve a [Google Maps](https://www.google.com/maps)
2. Busca tu dirección
3. Haz clic en "Compartir" → "Insertar un mapa"
4. Copia el código iframe
5. Reemplázalo en `index.html` en la sección `.map-container`

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con variables CSS
- **JavaScript (Vanilla)**: Sin dependencias externas
- **Google Fonts**: Montserrat + Playfair Display
- **Google Maps**: Para ubicación

## 📊 SEO y Performance

### Optimizaciones Incluidas
- Meta tags completos
- Títulos y descripciones optimizados
- Estructura HTML semántica
- Carga rápida (sin frameworks pesados)
- Imágenes con lazy loading

### Mejoras Recomendadas
1. Comprimir y optimizar imágenes (usar WebP)
2. Implementar Google Analytics
3. Agregar Schema.org markup
4. Configurar HTTPS
5. Implementar caché del navegador

## 📞 Información de Contacto de la Clínica

- **Dirección**: Paseo Huérfanos 1117, Oficina 607, Santiago, Chile
- **WhatsApp**: +56 9 5678 9735
- **Instagram**: @galanaclinicadental
- **Horario**: Lunes a Viernes: 10:00 - 18:00

## 🐛 Solución de Problemas

### El menú no se cierra en móvil
- Verifica que `js/main.js` esté correctamente enlazado
- Revisa la consola del navegador por errores

### Las animaciones no funcionan
- Asegúrate de que el CSS esté cargando correctamente
- Verifica que no haya conflictos con otros scripts

### El mapa no se muestra
- Verifica tu conexión a internet
- Comprueba que el iframe tenga la URL correcta

## 📝 Licencia

Este proyecto es de uso libre para la Clínica Dental GALANA. Puedes modificarlo según tus necesidades.

## 🤝 Soporte

Para soporte o preguntas sobre el sitio web:
- Revisa la documentación
- Consulta los comentarios en el código
- Contacta al desarrollador

## 🎯 Próximas Mejoras Sugeridas

- [ ] Sistema de citas online
- [ ] Blog de salud dental
- [ ] Galería de antes/después
- [ ] Testimonios de pacientes
- [ ] Chat en vivo
- [ ] Sistema de pagos online
- [ ] Portal del paciente

---

**Desarrollado con ❤️ para Clínica Dental GALANA**

*Última actualización: Febrero 2024*
