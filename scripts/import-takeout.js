/**
 * Convierte un archivo exportado de Google Takeout al formato JSON de esta app.
 *
 * USO:
 *   node scripts/import-takeout.js <archivo.json> <tipo> [--from YYYY-MM-DD] [--to YYYY-MM-DD]
 *
 * TIPOS disponibles:
 *   lugares       → src/data/lugares.json
 *   restaurantes  → src/data/restaurantes.json
 *   hoteles       → src/data/hoteles.json
 *
 * OPCIONES:
 *   --from  Fecha mínima (inclusive). Filtra por el campo Updated/Published del Takeout.
 *   --to    Fecha máxima (inclusive).
 *   --list  Muestra un resumen de fechas encontradas en el archivo (útil para saber el rango).
 *
 * EJEMPLOS:
 *   # Ver qué rango de fechas tiene el archivo antes de importar:
 *   node scripts/import-takeout.js "Saved Places.json" lugares --list
 *
 *   # Importar solo lugares guardados durante el viaje a Japón:
 *   node scripts/import-takeout.js "Saved Places.json" lugares --from 2024-03-01 --to 2024-03-31
 *
 *   # Importar todos (sin filtro de fecha):
 *   node scripts/import-takeout.js "Saved Places.json" lugares
 *
 * NOTA IMPORTANTE sobre fechas en el Takeout:
 *   El campo "Updated" es cuando GUARDASTE la estrella en Google Maps,
 *   NO necesariamente cuando visitaste el lugar. Si guardaste los sitios
 *   durante el viaje (en tiempo real), el filtro por fecha funciona perfecto.
 *   Si los guardaste después al recordarlos, las fechas serán la fecha de guardado.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { createHash } from 'crypto'
import path from 'path'

const TIPO_SALIDA = {
  lugares:      'src/data/lugares.json',
  restaurantes: 'src/data/restaurantes.json',
  hoteles:      'src/data/hoteles.json',
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)
}

function toId(nombre) {
  const slug = slugify(nombre)
  const hash = createHash('md5').update(nombre).digest('hex').slice(0, 4)
  return `${slug}-${hash}`
}

function parseDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

function inferCiudad(address) {
  if (!address) return ''
  const parts = address.split(',').map(s => s.trim())
  if (parts.length >= 3) return parts[parts.length - 2]
  if (parts.length === 2) return parts[0]
  return ''
}

/**
 * Normaliza una feature independientemente del idioma del Takeout.
 * Soporta tanto el formato inglés (Title, Google Maps URL, Location.Address)
 * como el formato español (location.name, google_maps_url, date).
 */
function normalizeFeature(feature) {
  const props = feature.properties || {}
  const geo   = feature.geometry?.coordinates || []

  // Nombre
  const nombre =
    props.Title ||
    props.location?.name ||
    props['Business Name'] ||
    'Sin nombre'

  // Fecha
  const fecha = parseDate(
    props.Updated || props.Published || props.date || ''
  )

  // Coordenadas (GeoJSON: [lng, lat])
  const geoCoords = props.Location?.['Geo Coordinates'] || {}
  const lat = parseFloat(geoCoords.Latitude  ?? geo[1] ?? 0)
  const lng = parseFloat(geoCoords.Longitude ?? geo[0] ?? 0)

  // Dirección
  const address =
    props.location?.address ||
    props.Location?.Address ||
    ''

  // URL de Google Maps
  const googleMapsUrl =
    props['Google Maps URL'] ||
    props.google_maps_url    ||
    (lat && lng ? `https://maps.google.com/maps?q=${lat},${lng}` : '')

  // Valoración
  const valoracion = props['Star Rating'] || 0

  return { nombre, fecha, lat, lng, address, googleMapsUrl, valoracion }
}

function convertirLugar(feature) {
  const { nombre, fecha, lat, lng, address, googleMapsUrl, valoracion } = normalizeFeature(feature)
  return {
    id:           toId(nombre),
    nombre,
    categoria:    'otro',
    ciudad:       inferCiudad(address),
    fecha,
    descripcion:  '',
    lat,
    lng,
    googleMapsUrl,
    fotos:        [],
    valoracion,
    notas:        '',
  }
}

function convertirRestaurante(feature) {
  const { nombre, fecha, lat, lng, address, googleMapsUrl, valoracion } = normalizeFeature(feature)
  return {
    id:           toId(nombre),
    nombre,
    tipoComida:   'Otro',
    ciudad:       inferCiudad(address),
    barrio:       '',
    fecha,
    lat,
    lng,
    googleMapsUrl,
    fotos:        [],
    valoracion,
    precio:       '',
    notas:        '',
  }
}

function convertirHotel(feature) {
  const { nombre, fecha, lat, lng, address, googleMapsUrl } = normalizeFeature(feature)
  return {
    id:           toId(nombre),
    nombre,
    ciudad:       inferCiudad(address),
    barrio:       '',
    checkIn:      fecha,
    checkOut:     '',
    lat,
    lng,
    googleMapsUrl,
    fotos:        [],
    notas:        '',
  }
}

// ─── Parseo de argumentos ─────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { inputFile: null, tipo: null, from: null, to: null, list: false }
  const positional = []
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--from')       { args.from = argv[++i] }
    else if (argv[i] === '--to')    { args.to   = argv[++i] }
    else if (argv[i] === '--list')  { args.list = true }
    else                            { positional.push(argv[i]) }
  }
  args.inputFile = positional[0] || null
  args.tipo      = positional[1] || null
  return args
}

function inRango(feature, from, to) {
  if (!from && !to) return true
  const props   = feature.properties || {}
  const rawDate = props.Updated || props.Published || props.date || ''
  if (!rawDate) return true
  const fecha = new Date(rawDate)
  if (from && fecha < new Date(from))                  return false
  if (to   && fecha > new Date(to + 'T23:59:59Z'))     return false
  return true
}

function mostrarResumenFechas(features) {
  const fechas = features
    .map(f => f.properties?.Updated || f.properties?.Published || f.properties?.date || '')
    .filter(Boolean)
    .map(d => d.slice(0, 10))
    .sort()

  if (fechas.length === 0) {
    console.log('\n⚠️  No se encontraron fechas en el archivo (campo Updated/Published ausente).')
    console.log('   Los lugares pueden filtrarse por país o por nombre manualmente.\n')
    return
  }

  const conteo = {}
  for (const f of fechas) {
    const mes = f.slice(0, 7)
    conteo[mes] = (conteo[mes] || 0) + 1
  }

  console.log(`\n📅  Rango de fechas en el archivo:`)
  console.log(`    Más antigua : ${fechas.at(0)}`)
  console.log(`    Más reciente: ${fechas.at(-1)}`)
  console.log(`    Total       : ${fechas.length} entradas con fecha\n`)
  console.log('   Entradas por mes:')
  for (const [mes, n] of Object.entries(conteo)) {
    const bar = '█'.repeat(Math.min(n, 40))
    console.log(`   ${mes}  ${bar} ${n}`)
  }
  console.log()
}

// ─── Main ────────────────────────────────────────────────────────────────────

const args = parseArgs(process.argv)
const { inputFile, tipo, from, to } = args

if (!inputFile || !tipo) {
  console.error('Uso: node scripts/import-takeout.js <archivo.json> <tipo> [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--list]')
  console.error('Tipos: lugares | restaurantes | hoteles')
  process.exit(1)
}

if (!TIPO_SALIDA[tipo]) {
  console.error(`Tipo no válido: "${tipo}". Usa: lugares, restaurantes, hoteles`)
  process.exit(1)
}

if (!existsSync(inputFile)) {
  console.error(`Archivo no encontrado: ${inputFile}`)
  process.exit(1)
}

const raw      = JSON.parse(readFileSync(inputFile, 'utf-8'))
const features = raw.features || raw

// Modo --list: solo muestra resumen de fechas y sale
if (args.list) {
  console.log(`\nArchivo: ${inputFile}  (${features.length} entradas totales)`)
  mostrarResumenFechas(features)
  process.exit(0)
}

const filtrados = features.filter(f => inRango(f, from, to))

if (from || to) {
  console.log(`\n🔍  Filtro de fechas: ${from || '(sin límite)'} → ${to || '(sin límite)'}`)
  console.log(`    ${features.length} entradas totales → ${filtrados.length} dentro del rango`)
}

const convertir = tipo === 'restaurantes' ? convertirRestaurante
                : tipo === 'hoteles'      ? convertirHotel
                : convertirLugar

const convertidos = filtrados.map(convertir)

// Si ya existe el JSON destino, muestra instrucciones de merge en lugar de sobrescribir
const destino = TIPO_SALIDA[tipo]
if (existsSync(destino)) {
  const preview = JSON.stringify(convertidos, null, 2)
  const previewFile = `scripts/preview-${tipo}.json`
  writeFileSync(previewFile, preview, 'utf-8')
  console.log(`\n✅  ${convertidos.length} entradas convertidas`)
  console.log(`📄  Preview guardado en: ${previewFile}`)
  console.log(`⚠️   El destino ${destino} ya existe → revisa el preview y fusiona manualmente.\n`)
} else {
  writeFileSync(destino, JSON.stringify(convertidos, null, 2), 'utf-8')
  console.log(`\n✅  ${convertidos.length} entradas escritas en ${destino}\n`)
}

console.log('Recuerda revisar y completar manualmente:')
console.log('  - categoria (templo / castillo / parque / restaurante…)')
console.log('  - ciudad (si no se detectó correctamente)')
console.log('  - checkOut en hoteles')
console.log('  - tipoComida en restaurantes')
