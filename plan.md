# Plan de Recreación — Japan Trip App

Documento de referencia exhaustivo para que un agente de IA pueda recrear este repositorio con exactitud del 100%.

---

## 1. Visión general

SPA (Single Page Application) de planificación de viaje a Japón. Permite explorar lugares de interés, restaurantes, hoteles, transportes, cronología del viaje y galería de fotos. No tiene backend; todos los datos son ficheros JSON estáticos dentro del propio repositorio.

- **Nombre del repositorio:** `japantrip`
- **URL de producción:** `https://<usuario>.github.io/japantrip/`
- **Idioma de la UI:** castellano
- **Despliegue:** GitHub Pages vía GitHub Actions al hacer push a `main`

---

## 2. Tech stack exacto

| Paquete | Versión |
|---|---|
| react | ^18.3.1 |
| react-dom | ^18.3.1 |
| react-router-dom | ^6.27.0 |
| leaflet | ^1.9.4 |
| react-leaflet | ^4.2.1 |
| lucide-react | ^0.400.0 |
| vite | ^5.4.10 |
| @vitejs/plugin-react | ^4.3.3 |
| tailwindcss | ^3.4.14 |
| autoprefixer | ^10.4.20 |
| postcss | ^8.4.47 |

`"type": "module"` en package.json. No hay TypeScript.

---

## 3. Estructura de ficheros

```
/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
├── .github/
│   └── workflows/
│       └── deploy.yml
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── Layout.jsx
    │   └── NavBar.jsx
    ├── data/
    │   ├── lugares.json
    │   ├── hoteles.json
    │   ├── restaurantes.json
    │   ├── transportes.json
    │   └── itinerario.json
    └── pages/
        ├── MapaPage.jsx
        ├── LugaresPage.jsx
        ├── RestaurantesPage.jsx
        ├── HotelesPage.jsx
        ├── TransportesPage.jsx
        ├── CronologiaPage.jsx
        └── GaleriaPage.jsx
```

Las fotos de usuarios se sirven desde `public/fotos/` (carpeta que puede estar vacía). Se referencian como `/japantrip/fotos/<nombre-fichero>`.

---

## 4. Ficheros de configuración

### `index.html`
```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%23BC002D'/></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Japan Trip 🗾</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

El favicon es un círculo rojo (`#BC002D`) inline en SVG.

### `vite.config.js`
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/japantrip/',
})
```

`base: '/japantrip/'` es obligatorio para que funcione en GitHub Pages.

### `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        japan: {
          red: '#BC002D',
          crimson: '#8B0000',
        },
      },
    },
  },
  plugins: [],
}
```

El color personalizado `japan-red` (`#BC002D`) se usa en la NavBar y en acentos de la UI.

### `postcss.config.js`
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### `package.json`
```json
{
  "name": "japantrip",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "leaflet": "^1.9.4",
    "lucide-react": "^0.400.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-leaflet": "^4.2.1",
    "react-router-dom": "^6.27.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "vite": "^5.4.10"
  }
}
```

---

## 5. Estilos globales — `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body,
#root {
  height: 100%;
  margin: 0;
  padding: 0;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}
```

El `height: 100%` en `html/body/#root` es imprescindible para que el mapa ocupe toda la pantalla.

---

## 6. Punto de entrada — `src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`leaflet/dist/leaflet.css` se importa aquí, antes que `index.css`.

---

## 7. Enrutamiento — `src/App.jsx`

Usa `HashRouter` (necesario para GitHub Pages, que no soporta rutas HTML5 sin configuración de servidor).

```jsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import MapaPage from './pages/MapaPage'
import LugaresPage from './pages/LugaresPage'
import RestaurantesPage from './pages/RestaurantesPage'
import HotelesPage from './pages/HotelesPage'
import TransportesPage from './pages/TransportesPage'
import CronologiaPage from './pages/CronologiaPage'
import GaleriaPage from './pages/GaleriaPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/mapa" replace />} />
          <Route path="mapa"         element={<MapaPage />} />
          <Route path="lugares"      element={<LugaresPage />} />
          <Route path="restaurantes" element={<RestaurantesPage />} />
          <Route path="hoteles"      element={<HotelesPage />} />
          <Route path="transportes"  element={<TransportesPage />} />
          <Route path="cronologia"   element={<CronologiaPage />} />
          <Route path="galeria"      element={<GaleriaPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
```

La ruta raíz `/` redirige inmediatamente a `/mapa`.

---

## 8. Componentes compartidos

### `src/components/Layout.jsx`

Envuelve toda la app. Usa `flex flex-col h-screen`. La NavBar no crece (`flex-shrink-0`). El `<main>` ocupa el espacio restante con `flex-1 overflow-y-auto`.

```jsx
import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'

export default function Layout() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

### `src/components/NavBar.jsx`

Barra de navegación horizontal fija en la parte superior. Fondo `japan-red` (`#BC002D`). Altura `h-14` (56px). En mobile solo se muestra el emoji; en `sm:` y superior aparece también el texto.

- El logo `🗾 Japan Trip` es texto no clicable a la izquierda.
- Los 7 ítems usan `NavLink` con clase activa `bg-white/25 text-white` e inactiva `text-white/80 hover:bg-white/15 hover:text-white`.
- La barra de ítems tiene `overflow-x-auto` para scroll horizontal en pantallas estrechas.

```jsx
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/mapa',         label: 'Mapa',         emoji: '🗺️' },
  { to: '/lugares',      label: 'Lugares',       emoji: '⛩️' },
  { to: '/restaurantes', label: 'Restaurantes',  emoji: '🍜' },
  { to: '/hoteles',      label: 'Hoteles',       emoji: '🏨' },
  { to: '/transportes',  label: 'Transportes',   emoji: '🚄' },
  { to: '/cronologia',   label: 'Cronología',    emoji: '📅' },
  { to: '/galeria',      label: 'Galería',       emoji: '📸' },
]

export default function NavBar() {
  return (
    <nav className="bg-japan-red text-white shadow-md flex-shrink-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center h-14">
          <span className="font-bold text-base sm:text-lg mr-4 sm:mr-8 whitespace-nowrap select-none">
            🗾 Japan Trip
          </span>
          <div className="flex overflow-x-auto gap-0.5 flex-1">
            {navItems.map(({ to, label, emoji }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  }`
                }
              >
                <span className="text-base leading-none">{emoji}</span>
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
```

---

## 9. Páginas

### 9.1 `MapaPage` — `/mapa`

Mapa interactivo Leaflet con marcadores de lugares, hoteles y restaurantes.

**Comportamiento:**
- El mapa ocupa exactamente `height: calc(100vh - 56px)` (pantalla menos la NavBar de 56px).
- Centro inicial: `[35.5, 136.5]`, zoom inicial: `6` (Japón completo visible).
- `scrollWheelZoom` activado.
- TileLayer: OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- Panel de filtros en la esquina superior izquierda (`absolute top-3 left-3 z-[1000]`), fondo blanco, borde redondeado, sombra. Contiene 3 checkboxes (Lugares, Hoteles, Restaurantes), cada uno con un punto de color y el conteo total de marcadores visibles.

**Colores de marcadores por categoría de lugar:**
```js
const CATEGORY_COLORS = {
  templo:     '#dc2626',
  santuario:  '#ea580c',
  castillo:   '#7c3aed',
  parque:     '#16a34a',
  naturaleza: '#15803d',
  mercado:    '#d97706',
  barrio:     '#0891b2',
  mirador:    '#0284c7',
  museo:      '#6366f1',
  otro:       '#6b7280',
}
const HOTEL_COLOR = '#2563eb'
const REST_COLOR  = '#f59e0b'
```

**Marcador personalizado:** `L.divIcon` con un círculo de 16×16px, borde blanco de 2.5px, `box-shadow`, sin className CSS extra. `iconAnchor: [8,8]`, `popupAnchor: [0, -12]`.

**Popup de cada marcador** (mínimo 180px, fuente `system-ui`):
- Nombre en negrita 14px
- Ciudad · fecha (para lugares) / ciudad · checkIn – checkOut (para hoteles)
- Descripción en 12px gris oscuro (si existe)
- `tipoComida` con emoji 🍴 (para restaurantes)
- Enlace "Ver en Google Maps →" azul (si `googleMapsUrl` existe)

**Lógica de marcadores:** Se calculan con `useMemo` filtrando por el estado `show`. Solo se incluyen items que tengan `lat` y `lng` definidos. Cada item lleva `_type` y `_color` añadidos. La clave del `<Marker>` es `${item._type}-${item.id}`.

### 9.2 `LugaresPage` — `/lugares`

Grid de tarjetas de lugares con filtros de ciudad y categoría.

**Estado:** `ciudad` (string, default `'Todas'`) y `categoria` (string, default `'Todas'`).

**Filtros:** dos `<select>` con opciones generadas dinámicamente con `useMemo` a partir de los datos. Las ciudades y categorías únicas se extraen en orden de aparición. Contador de resultados alineado a la derecha (`ml-auto`). Los `<select>` tienen `focus:ring-2 focus:ring-japan-red`.

**Grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`.

**Tarjeta de lugar:**
- Si `lugar.fotos[0]` existe: `<img src="/japantrip/fotos/{foto}" />` con `h-44 object-cover`.
- Si no: placeholder con `bg-gradient-to-br from-gray-50 to-gray-200`, `h-44`, emoji grande centrado (del mapa `EMOJI`).
- Nombre truncado (`truncate`), ciudad + fecha, badge de categoría (colores según `CATEGORY_STYLES`).
- Valoración: estrellas con `lucide-react Star` (size 13), amarillas `fill-yellow-400` si `s <= valoracion`, grises si no. Solo se muestra si `valoracion > 0`.
- Descripción con `line-clamp-2`.
- Notas con emoji 💡 en `text-xs text-gray-400 italic`.
- Enlace Google Maps con icono `ExternalLink` (size 12) de lucide-react.

**Mapas de estilos de categorías:**
```js
const CATEGORY_LABELS = {
  templo: 'Templo', santuario: 'Santuario', castillo: 'Castillo',
  parque: 'Parque', naturaleza: 'Naturaleza', mercado: 'Mercado',
  barrio: 'Barrio', mirador: 'Mirador', museo: 'Museo', otro: 'Otro',
}
const CATEGORY_STYLES = {
  templo:     'bg-red-100 text-red-700',
  santuario:  'bg-orange-100 text-orange-700',
  castillo:   'bg-purple-100 text-purple-700',
  parque:     'bg-green-100 text-green-700',
  naturaleza: 'bg-emerald-100 text-emerald-700',
  mercado:    'bg-yellow-100 text-yellow-700',
  barrio:     'bg-cyan-100 text-cyan-700',
  mirador:    'bg-sky-100 text-sky-700',
  museo:      'bg-indigo-100 text-indigo-700',
  otro:       'bg-gray-100 text-gray-700',
}
const EMOJI = {
  templo: '⛩️', santuario: '⛩️', castillo: '🏯',
  parque: '🌸', naturaleza: '🌿', mercado: '🏮',
  barrio: '🏙️', mirador: '🔭', museo: '🏛️', otro: '📍',
}
```

### 9.3 `RestaurantesPage` — `/restaurantes`

Grid de tarjetas de restaurantes con filtros de ciudad y tipo de comida.

**Estado:** `ciudad` y `tipo` (ambos default `'Todas'`/`'Todos'`).

**Grid:** `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`. `max-w-5xl`.

**Tarjeta de restaurante:**
- Si `r.fotos[0]`: imagen `h-36 object-cover rounded-lg mb-3`.
- Si no: placeholder `bg-gradient-to-br from-orange-50 to-amber-100`, `h-36`, emoji 🍴.
- Nombre + barrio/ciudad. Badge `tipoComida` naranja (`bg-orange-50 text-orange-700`). Precio en `text-gray-400` con tooltip `PRECIO_LABEL`.
- Valoración con estrellas (igual que Lugares, solo si `> 0`).
- Fecha con emoji 📅 en `text-xs text-gray-400`.
- Notas en `italic line-clamp-3`.
- Enlace Google Maps.

**Mapa de precios:** `{ '€': 'Económico', '€€': 'Moderado', '€€€': 'Caro', '€€€€': 'Lujo' }`

### 9.4 `HotelesPage` — `/hoteles`

Grid de tarjetas de hoteles. Sin filtros. `max-w-5xl`.

**Función auxiliar:**
```js
function calcNights(checkIn, checkOut) {
  return Math.round(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  )
}
```

**Tarjeta de hotel:**
- Imagen `h-40 object-cover` o placeholder `bg-gradient-to-br from-blue-50 to-indigo-100`, `h-40`, emoji 🏨.
- Nombre + barrio/ciudad. Badge de noches (`{nights} noche/s`) en `bg-blue-50 text-blue-700 rounded-full`.
- Dos filas con icono `Calendar` (size 14, `text-gray-400`) de lucide-react: Check-in y Check-out con fecha en `<strong>`.
- Notas con emoji 💡 en `text-xs text-gray-500 italic`.
- Enlace "Ver en Google Maps" con `ExternalLink`.

### 9.5 `TransportesPage` — `/transportes`

Lista de transportes. Dos vistas: tabla para `md:` en adelante, tarjetas para mobile.

**Mapa de emojis:**
```js
const TIPO_EMOJI = {
  'Avión': '✈️', 'Shinkansen': '🚅', 'Tren': '🚆',
  'Metro': '🚇', 'Bus': '🚌', 'Ferry': '⛴️',
  'Taxi': '🚕', 'Bici': '🚲',
}
// Fallback: '🚗'
```

**Tabla (hidden en mobile, `md:block`):**
- Fondo blanco, `rounded-xl shadow-sm border border-gray-100 overflow-hidden`.
- Cabecera: `bg-gray-50 border-b border-gray-100`. 6 columnas: Tipo, Trayecto, Línea, Fecha, Duración, Notas. Texto `text-xs font-semibold text-gray-500 uppercase tracking-wider`.
- Filas alternadas: pares `bg-white`, impares `bg-gray-50/40`. Columna Trayecto: `{origen} → {destino}` con flecha gris. Columna Duración: badge `bg-blue-50 text-blue-700 rounded-full`.

**Tarjetas mobile (`md:hidden`):**
- `space-y-3`. Cada tarjeta: `bg-white rounded-xl border border-gray-100 shadow-sm p-4`.
- Header: emoji (text-2xl) + tipo a la izquierda, badge de duración a la derecha.
- Trayecto: `{origen} → {destino}`.
- Línea · Fecha en `text-xs text-gray-500`.
- Notas en `text-xs text-gray-400 italic`.

### 9.6 `CronologiaPage` — `/cronologia`

Línea de tiempo vertical del viaje. `max-w-2xl mx-auto`. Organizada por días.

**Lookup cross-data:**
```js
const lookup = {
  lugar:       Object.fromEntries(lugaresList.map(x => [x.id, x])),
  hotel:       Object.fromEntries(hotelesList.map(x => [x.id, x])),
  restaurante: Object.fromEntries(restaurantesList.map(x => [x.id, x])),
  transporte:  Object.fromEntries(transportesList.map(x => [x.id, x])),
}
```

**Estilos por tipo de evento:**
```js
const EVENTO_STYLES = {
  lugar:       { dot: 'bg-red-500',    badge: 'bg-red-50 text-red-600',       emoji: '📍' },
  hotel:       { dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-600',     emoji: '🏨' },
  restaurante: { dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-600', emoji: '🍜' },
  transporte:  { dot: 'bg-gray-400',   badge: 'bg-gray-50 text-gray-600',     emoji: '🚄' },
  libre:       { dot: 'bg-green-400',  badge: 'bg-green-50 text-green-600',   emoji: '⭐' },
}
```

**Estructura por día:**
- Cabecera: bloque rojo japan-red `rounded-xl px-4 py-2` con "Día N" (xs) y fecha MM-DD (sm bold). Al lado: título (text-lg bold) + ciudad (text-sm gray).
- Eventos: contenedor con `ml-4 pl-6 border-l-2 border-gray-100 space-y-2.5` (la línea vertical gris).
- Cada evento: dot `absolute -left-[31px] top-3 w-3.5 h-3.5 rounded-full` + tarjeta blanca con `px-4 py-2.5 shadow-sm`.
- Dentro de la tarjeta: emoji (base, mt-0.5) + columna derecha con hora (font-mono text-xs text-gray-400) + badge de tipo + nombre del item (de `lookup`) o `evento.descripcion`.
- Si el item tiene `googleMapsUrl`: enlace "Google Maps →" azul.
- Si el item existe y tiene nombre diferente a `evento.descripcion`, se muestra la descripción del evento como subtítulo.

### 9.7 `GaleriaPage` — `/galeria`

Galería de fotos recogidas automáticamente de los arrays `fotos` de lugares, restaurantes y hoteles.

**Construcción de fotos (nivel módulo, fuera del componente):**
```js
const allPhotos = [
  ...lugaresList.flatMap(l =>
    (l.fotos || []).map(f => ({ src: f, caption: l.nombre, ciudad: l.ciudad, tipo: 'lugar' }))
  ),
  ...restaurantesList.flatMap(r =>
    (r.fotos || []).map(f => ({ src: f, caption: r.nombre, ciudad: r.ciudad, tipo: 'restaurante' }))
  ),
  ...hotelesList.flatMap(h =>
    (h.fotos || []).map(f => ({ src: f, caption: h.nombre, ciudad: h.ciudad, tipo: 'hotel' }))
  ),
]
```

**Estado vacío** (si `allPhotos.length === 0`): pantalla centrada con emoji 📸 grande, título "Galería" y caja de instrucciones explicando cómo añadir fotos (copiar a `public/fotos/`, añadir nombre al array `fotos` en el JSON).

**Grid de fotos** (si hay fotos): `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3`. Cada celda es `aspect-square overflow-hidden rounded-xl`. Hover: escala 1.05 + overlay negro semitransparente + caption animado desde abajo.

**Lightbox:** Al hacer clic en una foto, se muestra un overlay `fixed inset-0 bg-black/90 z-50`. Botón "×" en `top-4 right-4`. La imagen tiene `max-h-[80vh] max-w-full object-contain rounded-xl`. Caption centrado debajo con nombre y ciudad. Clic en el overlay cierra; clic en la imagen NO cierra (stopPropagation).

---

## 10. Esquemas de datos JSON

### `src/data/lugares.json`

Array de objetos. Cada objeto:
```ts
{
  "id": string,           // slug único, puede contener caracteres unicode y hashes
  "nombre": string,
  "categoria": "templo" | "santuario" | "castillo" | "parque" | "naturaleza" | "mercado" | "barrio" | "mirador" | "museo" | "otro",
  "ciudad": string,
  "fecha": string,        // formato "YYYY-MM-DD"
  "descripcion": string,
  "lat": number,
  "lng": number,
  "googleMapsUrl": string,
  "fotos": string[],      // nombres de fichero en public/fotos/, puede ser []
  "valoracion": number,   // 0–5, 0 = sin valorar
  "notas": string         // puede ser ""
}
```

### `src/data/hoteles.json`

Array de objetos:
```ts
{
  "id": string,
  "nombre": string,
  "ciudad": string,
  "checkIn": string,      // "YYYY-MM-DD"
  "checkOut": string,     // "YYYY-MM-DD"
  "lat": number,
  "lng": number,
  "googleMapsUrl": string,
  "fotos": string[],
  "notas": string
}
```

### `src/data/restaurantes.json`

Array de objetos:
```ts
{
  "id": string,
  "nombre": string,
  "ciudad": string,
  "tipoComida": string,   // texto libre, ej: "Ramen", "Sushi", "Café"
  "precio": "€" | "€€" | "€€€" | "€€€€",
  "fecha": string,        // "YYYY-MM-DD"
  "lat": number,
  "lng": number,
  "googleMapsUrl": string,
  "fotos": string[],
  "valoracion": number,   // 0–5
  "notas": string,
  "barrio"?: string       // opcional
}
```

### `src/data/transportes.json`

Array de objetos:
```ts
{
  "id": string,
  "tipo": "Avión" | "Shinkansen" | "Tren" | "Metro" | "Bus" | "Ferry" | "Taxi" | "Bici" | "Vehículo",
  "linea": string,        // puede ser ""
  "origen": string,
  "destino": string,
  "fecha": string,        // "YYYY-MM-DD"
  "duracion": string,     // ej: "2h 15m"
  "notas": string
}
```

### `src/data/itinerario.json`

Array de objetos (uno por día):
```ts
{
  "fecha": string,        // "YYYY-MM-DD"
  "dia": number,          // número de día del viaje (1-based)
  "ciudad": string,
  "titulo": string,
  "eventos": [
    {
      "hora": string,       // "HH:MM", puede estar ausente
      "tipo": "lugar" | "hotel" | "restaurante" | "transporte" | "libre",
      "ref"?: string,       // id del objeto en el JSON correspondiente (opcional)
      "descripcion": string // texto libre o descripción del evento
    }
  ]
}
```

El campo `ref` en un evento de la cronología apunta al `id` del objeto en `lookup[evento.tipo]`. Si `ref` existe y el objeto se encuentra, se muestra `item.nombre`; de lo contrario se muestra `evento.descripcion`.

---

## 11. CI/CD — `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 12. Detalles de comportamiento a preservar

1. **Altura del mapa:** `height: calc(100vh - 56px)` y `position: relative`. El `<MapContainer>` tiene `height: 100%` y `width: 100%`.
2. **Panel de filtros del mapa:** `z-[1000]` para quedar por encima de los controles de Leaflet.
3. **Marcadores Leaflet:** `L.divIcon` con `className: ''` (sin clase CSS) para evitar el icono por defecto de Leaflet.
4. **HashRouter:** obligatorio para GitHub Pages. Las URLs tienen formato `/#/mapa`, `/#/lugares`, etc.
5. **base en Vite:** `/japantrip/` — todos los assets y rutas de fotos deben incluir este prefijo.
6. **Fotos:** se sirven desde `public/fotos/` con ruta `/japantrip/fotos/<nombre>`. Si el array `fotos` está vacío, se muestra el placeholder con degradado.
7. **Valoración 0:** no muestra estrellas (condición `valoracion > 0`).
8. **Cálculo de noches:** se calcula en tiempo de render con `Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)`. Se pluraliza: "1 noche" / "N noches".
9. **Cronología sin estado:** es completamente estática (sin useState ni useEffect). Se renderiza directamente desde los JSON.
10. **Galería sin estado inicial:** `allPhotos` se construye una sola vez en el módulo, fuera del componente.
11. **Scrollbar personalizado:** global en `* { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }` (solo Firefox; Webkit usa el valor por defecto fino del sistema).
12. **NavBar labels ocultos en mobile:** `<span className="hidden sm:inline">{label}</span>` — solo el emoji es visible por debajo de `sm`.
13. **Navegación por teclado / accesibilidad:** solo lo que da React Router y el HTML semántico nativo. No hay ARIA roles explícitos añadidos salvo `aria-label="Cerrar"` en el botón del lightbox.

---

## 13. Notas de recreación

- No hay fichero `.env` ni variables de entorno.
- No hay tests.
- No hay estado global (Redux, Zustand, Context). Toda la lógica es local a cada página.
- No hay lazy loading de rutas.
- No hay `public/fotos/` vacía en el repositorio; debe crearse si se quieren servir fotos.
- El `.gitignore` excluye `node_modules/` y `dist/`.
- Los IDs en los JSON siguen patrones mixtos: slugs simples (`sensoji`), caracteres Unicode (`釣船茶屋-ざうお-新宿店-3406`) y slugs con hash (`shinjuku-granbell-hotel-4366`). La lógica de lookup funciona con cualquier string como clave.
