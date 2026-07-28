# Plan de Acción — App Web "Japan Trip"

## Objetivo

Construir una SPA estática con React + Vite que muestre toda la info del viaje a Japón organizada en 7 secciones, con un mapa interactivo (Leaflet + OpenStreetMap, sin coste ni API key), datos en archivos JSON editables manualmente, y deploy automático a GitHub Pages.

---

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| React + Vite | Framework de la app |
| react-router-dom | Navegación entre secciones |
| react-leaflet + Leaflet | Mapa interactivo (sin API key) |
| OpenStreetMap | Tiles del mapa (gratuito) |
| Tailwind CSS | Estilos y diseño responsive |
| JSON estáticos | Base de datos del viaje |
| GitHub Actions + gh-pages | Deploy automático |

---

## Secciones de la app (menú)

| Sección | Contenido |
|---|---|
| **MAPA** | Mapa interactivo con todos los puntos del viaje, marcadores por categoría, filtros, popups con info + link a Google Maps |
| **LUGARES** | Cuadrícula de tarjetas con POIs: templos, castillos, parques, mercados… |
| **RESTAURANTES** | Lista con tipo de cocina, fecha, valoración y notas |
| **HOTELES** | Tarjetas con fechas de estancia, ciudad y link a Maps |
| **TRANSPORTES** | Tabla de trayectos: tipo, origen → destino, fecha, duración |
| **CRONOLOGÍA** | Timeline vertical día a día con todos los eventos del viaje |
| **GALERÍA** | Cuadrícula de fotos con lightbox para ampliar |

---

## Estructura de datos JSON

Archivos en `src/data/`, rellenados manualmente:

```
src/data/
  lugares.json        → POIs (templos, parques, castillos…)
  hoteles.json        → Hoteles con fechas
  restaurantes.json   → Restaurantes visitados
  transportes.json    → Trayectos
  itinerario.json     → Cronología día a día
```

**Esquema común de cada lugar:**

```json
{
  "id": "fushimi-inari",
  "nombre": "Fushimi Inari Taisha",
  "categoria": "templo",
  "ciudad": "Kioto",
  "fecha": "2024-03-15",
  "descripcion": "…",
  "lat": 34.9671,
  "lng": 135.7727,
  "googleMapsUrl": "https://maps.app.goo.gl/…",
  "fotos": ["fushimi-01.webp"],
  "valoracion": 5,
  "notas": "…"
}
```

**Cómo obtener coordenadas y links desde Google Maps:**
- Link: busca el lugar → "Compartir" → copia el link corto (`maps.app.goo.gl/…`)
- Coordenadas: clic derecho sobre el punto en el mapa → aparecen lat/lng

---

## Fotos e iconos

- **Fotos del viaje:** guardar en `public/fotos/` como WebP (optimizadas, máx. 1200px de ancho). Alternativamente, se pueden poner links a álbumes de Google Fotos para no ocupar espacio en el repo.
- **Iconos:** Lucide Icons (SVG, libre, incluido como dependencia npm).
- **Iconos propios:** se pueden añadir en `public/iconos/`.

---

## Qué NO guardar en el repo (ni en repos privados)

- Claves API o tokens → en archivo `.env` (incluido en `.gitignore`)
- Referencias de reservas (vuelos, hoteles) con número de booking
- Número de pasaporte, datos de pago, contraseñas de wifi
- Coordenadas de domicilios particulares

---

## Fases de implementación

### Fase 1 — Scaffolding del proyecto

1. Inicializar proyecto: `npm create vite@latest japantrip -- --template react`
2. Instalar dependencias: `react-router-dom`, `react-leaflet`, `leaflet`, `tailwindcss`, `lucide-react`
3. Configurar `vite.config.js` con `base: '/japantrip/'` (necesario para GitHub Pages)
4. Crear `.gitignore` correcto (`node_modules`, `dist`, `.env`)
5. Crear workflow de GitHub Actions (`.github/workflows/deploy.yml`)

### Fase 2 — Estructura de datos

6. Definir y documentar esquemas JSON de cada sección
7. Crear archivos JSON con datos reales del viaje
8. Validar que coordenadas y links de Google Maps son correctos

### Fase 3 — Componentes

9. `Layout` + `NavBar` con React Router (7 secciones)
10. **MAPA** — react-leaflet, marcadores por categoría, popups con link a GMaps, filtros
11. **LUGARES** — grid de tarjetas, filtro por ciudad/categoría
12. **RESTAURANTES** — lista con tipo de cocina, fecha, valoración
13. **HOTELES** — tarjetas con fechas de estancia
14. **TRANSPORTES** — tabla con tipo, ruta, fecha y duración
15. **CRONOLOGÍA** — timeline vertical día a día
16. **GALERÍA** — cuadrícula de fotos con lightbox

### Fase 4 — Polish y publicación

17. Diseño responsive (mobile-first)
18. Favicon y título de la app
19. Deploy a GitHub Pages → `https://[usuario].github.io/japantrip/`
20. Verificación en navegador y móvil

---

## Criterios de verificación

- `npm run dev` → app carga localmente con las 7 secciones navegables
- El mapa muestra marcadores con popup y link a Google Maps funcional
- `npm run build` → build sin errores
- Tras push a `main`, GitHub Actions despliega automáticamente
- La app es usable en móvil (responsive)

---

## Requisitos originales

> Me gustaría crear una app web donde se puedan ver los recorridos que he hecho en mi viaje a Japón.
> Tengo la info de Google Maps con todos los sitios que he visitado, los hoteles en los que me he quedado, las fechas, los restaurantes a los que he ido, los sitios de interés, los transportes que he cogido y la duración de los trayectos.
