/**
 * Importa lugares visitados y trayectos desde el historial de ubicaciones
 * de Google Maps (Timeline / Location History).
 *
 * Este archivo captura TODOS los sitios donde estuviste físicamente,
 * aunque no los hayas guardado con estrella en Google Maps.
 *
 * ─── CÓMO OBTENER EL ARCHIVO ────────────────────────────────────────────────
 *
 *  1. Ve a takeout.google.com
 *  2. Deseleccionar todo → activar solo "Historial de ubicaciones (Timeline)"
 *  3. Exportar → descomprime el ZIP
 *
 *  Busca UNO de estos formatos (depende de cuándo activaste Timeline):
 *
 *  Formato A — Archivos mensuales (el más común hasta 2024):
 *    Takeout/Location History (Timeline)/Semantic Location History/2024/2024_MARCH.json
 *
 *  Formato B — Archivo único (usuarios con el nuevo sistema):
 *    Takeout/Location History (Timeline)/Timeline.json
 *
 * ─── USO ────────────────────────────────────────────────────────────────────
 *
 *  Listar resumen de lo que hay en el archivo:
 *    node scripts/import-timeline.js "2024_MARCH.json" --list
 *
 *  Importar lugares visitados:
 *    node scripts/import-timeline.js "2024_MARCH.json" lugares
 *    node scripts/import-timeline.js "2024_MARCH.json" lugares --from 2024-03-08 --to 2024-03-20
 *
 *  Importar trayectos de transporte:
 *    node scripts/import-timeline.js "2024_MARCH.json" transportes
 *
 *  Pasar varios archivos mensuales a la vez:
 *    node scripts/import-timeline.js "2024_MARCH.json" "2024_APRIL.json" lugares --from 2024-03-08 --to 2024-03-20
 *
 * ─── NOTA SOBRE PRIVACIDAD ──────────────────────────────────────────────────
 *  NO copies el archivo de Takeout al repositorio — contiene todo tu historial
 *  de movimientos. Úsalo solo localmente para generar los JSON de la app.
 *  El archivo Timeline.json puede pesar varios GB.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { createHash } from 'crypto'

const TIPO_SALIDA = {
  lugares:      'src/data/lugares.json',
  restaurantes: 'src/data/restaurantes.json',
  transportes:  'src/data/transportes.json',
}

// Tipos de actividad de Google → tipo legible + emoji
const ACTIVITY_MAP = {
  IN_PASSENGER_VEHICLE: { tipo: 'Coche',       emoji: '🚗' },
  IN_TRAIN:             { tipo: 'Tren',         emoji: '🚆' },
  IN_BUS:               { tipo: 'Bus',          emoji: '🚌' },
  FLYING:               { tipo: 'Avión',        emoji: '✈️' },
  ON_FOOT:              { tipo: 'A pie',        emoji: '🚶' },
  WALKING:              { tipo: 'A pie',        emoji: '🚶' },
  CYCLING:              { tipo: 'Bici',         emoji: '🚲' },
  IN_SUBWAY:            { tipo: 'Metro',        emoji: '🚇' },
  IN_FERRY:             { tipo: 'Ferry',        emoji: '⛴️' },
  IN_TRAM:              { tipo: 'Tranvía',      emoji: '🚋' },
  IN_VEHICLE:           { tipo: 'Vehículo',     emoji: '🚗' },
}

// Transportes que no interesan para el JSON (movimientos triviales)
const SKIP_ACTIVITIES = new Set(['ON_FOOT', 'WALKING', 'CYCLING', 'UNKNOWN_ACTIVITY_TYPE', 'STILL'])

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)
}

function toId(str) {
  const slug = slugify(str)
  const hash = createHash('md5').update(str).digest('hex').slice(0, 4)
  return `${slug}-${hash}`
}

function e7ToDeg(e7) {
  return typeof e7 === 'number' ? e7 / 1e7 : parseFloat(e7)
}

function toDate(ts) {
  if (!ts) return ''
  try { return new Date(ts).toISOString().slice(0, 10) } catch { return '' }
}

function toTime(ts) {
  if (!ts) return ''
  try { return new Date(ts).toISOString().slice(11, 16) } catch { return '' }
}

function durationStr(startTs, endTs) {
  if (!startTs || !endTs) return ''
  const ms = new Date(endTs) - new Date(startTs)
  if (ms <= 0) return ''
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// ─── Parsers por formato ─────────────────────────────────────────────────────

/**
 * Formato A: Semantic Location History mensual
 * { timelineObjects: [ { placeVisit: {...} }, { activitySegment: {...} } ] }
 */
function parseFormatoA(raw) {
  return raw.timelineObjects || []
}

/**
 * Formato B: Timeline.json nuevo (array plano de objetos con semanticSegments)
 * { semanticSegments: [...] }  o  array de segmentos directamente
 */
function parseFormatoB(raw) {
  if (Array.isArray(raw)) return raw
  if (raw.semanticSegments) return raw.semanticSegments
  return []
}

function detectarFormato(raw) {
  if (raw.timelineObjects) return 'A'
  if (raw.semanticSegments || Array.isArray(raw)) return 'B'
  return 'A' // fallback
}

function extraerObjetos(raw) {
  const fmt = detectarFormato(raw)
  return fmt === 'B' ? parseFormatoB(raw) : parseFormatoA(raw)
}

// ─── Extracción de visitas a lugares ─────────────────────────────────────────

function extraerPlaceVisits(objetos) {
  return objetos
    .filter(o => o.placeVisit)
    .map(o => o.placeVisit)
}

function convertirPlaceVisit(pv) {
  const loc  = pv.location || {}
  const dur  = pv.duration || {}
  const lat  = e7ToDeg(loc.latitudeE7  ?? loc.latitude)
  const lng  = e7ToDeg(loc.longitudeE7 ?? loc.longitude)
  const nombre = loc.name || loc.address || 'Sin nombre'
  const fecha  = toDate(dur.startTimestamp || dur.startTimeMs)
  const hora   = toTime(dur.startTimestamp || dur.startTimeMs)
  const mins   = dur.startTimestamp && dur.endTimestamp
    ? Math.round((new Date(dur.endTimestamp) - new Date(dur.startTimestamp)) / 60000)
    : 0

  return {
    id:           toId(`${nombre}-${fecha}`),
    nombre,
    categoria:    'otro',         // ← editar manualmente
    ciudad:       '',             // ← editar manualmente o inferir por lat/lng
    fecha,
    hora,                         // campo extra para ayudar a colocarlo en itinerario.json
    duracion_min: mins || undefined,
    descripcion:  '',
    lat:          parseFloat(lat.toFixed(6)),
    lng:          parseFloat(lng.toFixed(6)),
    googleMapsUrl: loc.placeId
      ? `https://www.google.com/maps/place/?q=place_id:${loc.placeId}`
      : `https://maps.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`,
    fotos:        [],
    valoracion:   0,
    notas:        '',
    _confianza:   pv.visitConfidence ?? pv.topCandidate?.probability ?? null,
  }
}

// ─── Extracción de trayectos ──────────────────────────────────────────────────

function extraerActivities(objetos) {
  return objetos
    .filter(o => o.activitySegment)
    .map(o => o.activitySegment)
    .filter(a => {
      const tipo = a.activityType || a.topCandidate?.type || ''
      return !SKIP_ACTIVITIES.has(tipo)
    })
}

function convertirActivity(a) {
  const dur     = a.duration || {}
  const startLoc = a.startLocation || {}
  const endLoc   = a.endLocation   || {}
  const tipo     = a.activityType || a.topCandidate?.type || 'IN_VEHICLE'
  const info     = ACTIVITY_MAP[tipo] || { tipo: 'Vehículo', emoji: '🚗' }
  const fecha    = toDate(dur.startTimestamp || dur.startTimeMs)
  const durStr   = durationStr(
    dur.startTimestamp || dur.startTimeMs,
    dur.endTimestamp   || dur.endTimeMs
  )
  const distKm = a.distance ? (a.distance / 1000).toFixed(1) : ''

  return {
    id:      toId(`${tipo}-${fecha}-${dur.startTimestamp || ''}`),
    tipo:    info.tipo,
    linea:   '',                  // ← rellenar manualmente (ej: "Tokaido Shinkansen")
    origen:  '',                  // ← rellenar manualmente
    destino: '',                  // ← rellenar manualmente
    fecha,
    duracion: durStr,
    notas:   distKm ? `${distKm} km` : '',
    // Campos extra para ayudar a identificar el trayecto:
    _lat_inicio: startLoc.latitudeE7  ? e7ToDeg(startLoc.latitudeE7).toFixed(5)  : '',
    _lng_inicio: startLoc.longitudeE7 ? e7ToDeg(startLoc.longitudeE7).toFixed(5) : '',
    _lat_fin:    endLoc.latitudeE7    ? e7ToDeg(endLoc.latitudeE7).toFixed(5)    : '',
    _lng_fin:    endLoc.longitudeE7   ? e7ToDeg(endLoc.longitudeE7).toFixed(5)   : '',
  }
}

// ─── Filtro de fecha ──────────────────────────────────────────────────────────

function getFecha(obj) {
  // Funciona para placeVisit y activitySegment
  const dur = obj.duration || {}
  return toDate(dur.startTimestamp || dur.startTimeMs || '')
}

function inRango(obj, from, to) {
  if (!from && !to) return true
  const fecha = getFecha(obj)
  if (!fecha) return true
  if (from && fecha < from) return false
  if (to   && fecha > to)   return false
  return true
}

// ─── Resumen ──────────────────────────────────────────────────────────────────

function mostrarResumen(objetos) {
  const visitas    = objetos.filter(o => o.placeVisit)
  const activities = objetos.filter(o => o.activitySegment)

  const fechas = [...visitas, ...activities]
    .map(o => getFecha(o.placeVisit || o.activitySegment || o))
    .filter(Boolean)
    .sort()

  console.log(`\n📊  Contenido del archivo:`)
  console.log(`    Visitas a lugares : ${visitas.length}`)
  console.log(`    Trayectos         : ${activities.length}`)

  if (fechas.length) {
    console.log(`\n📅  Rango de fechas:`)
    console.log(`    Más antigua : ${fechas.at(0)}`)
    console.log(`    Más reciente: ${fechas.at(-1)}`)

    const conteo = {}
    for (const f of fechas) {
      const mes = f.slice(0, 7)
      conteo[mes] = (conteo[mes] || 0) + 1
    }
    console.log(`\n   Actividad por mes:`)
    for (const [mes, n] of Object.entries(conteo)) {
      const bar = '█'.repeat(Math.min(Math.round(n / 2), 40))
      console.log(`   ${mes}  ${bar} ${n}`)
    }
  }
  console.log()
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { files: [], tipo: null, from: null, to: null, list: false, minConfianza: 50 }
  const positional = []
  for (let i = 2; i < argv.length; i++) {
    if      (argv[i] === '--from')          { args.from          = argv[++i] }
    else if (argv[i] === '--to')            { args.to            = argv[++i] }
    else if (argv[i] === '--list')          { args.list          = true }
    else if (argv[i] === '--min-confianza') { args.minConfianza  = parseInt(argv[++i]) }
    else if (argv[i].endsWith('.json'))     { args.files.push(argv[i]) }
    else                                   { positional.push(argv[i]) }
  }
  args.tipo = positional[0] || null
  return args
}

const args = parseArgs(process.argv)

if (args.files.length === 0) {
  console.error('Uso: node scripts/import-timeline.js <archivo.json> [más archivos...] <tipo> [opciones]')
  console.error('Tipos: lugares | restaurantes | transportes')
  console.error('Opciones: --from YYYY-MM-DD  --to YYYY-MM-DD  --list  --min-confianza N (0-100, defecto 50)')
  process.exit(1)
}

// Cargar y combinar todos los archivos
let todosObjetos = []
for (const file of args.files) {
  if (!existsSync(file)) { console.error(`No encontrado: ${file}`); process.exit(1) }
  const raw = JSON.parse(readFileSync(file, 'utf-8'))
  todosObjetos = todosObjetos.concat(extraerObjetos(raw))
}

// Modo --list
if (args.list) {
  console.log(`\nArchivos: ${args.files.join(', ')}  (${todosObjetos.length} objetos totales)`)
  // Desempaquetar para mostrar resumen unificado
  const desempaquetados = todosObjetos.map(o => o.placeVisit ? { placeVisit: o.placeVisit || o } : o)
  mostrarResumen(todosObjetos)
  process.exit(0)
}

if (!args.tipo || !TIPO_SALIDA[args.tipo]) {
  console.error(`Tipo no válido: "${args.tipo}". Usa: lugares, restaurantes, transportes`)
  process.exit(1)
}

const { from, to, tipo, minConfianza } = args

let convertidos

if (tipo === 'transportes') {
  const activities = extraerActivities(todosObjetos)
    .filter(a => inRango(a, from, to))
  convertidos = activities.map(convertirActivity)
  console.log(`\n🚄  ${activities.length} trayectos extraídos`)
  console.log('    Los campos origen/destino/linea debes rellenarlos manualmente.\n')
} else {
  const visitas = extraerPlaceVisits(todosObjetos)
    .filter(pv => inRango(pv, from, to))
    .filter(pv => {
      const conf = pv.visitConfidence ?? pv.topCandidate?.probability ?? 100
      return conf >= minConfianza
    })
  convertidos = visitas.map(convertirPlaceVisit)
  const sinConfianza = extraerPlaceVisits(todosObjetos)
    .filter(pv => inRango(pv, from, to))
    .filter(pv => {
      const conf = pv.visitConfidence ?? pv.topCandidate?.probability ?? 100
      return conf < minConfianza
    }).length
  console.log(`\n📍  ${convertidos.length} visitas extraídas (confianza ≥ ${minConfianza}%)`)
  if (sinConfianza > 0)
    console.log(`    ${sinConfianza} visitas descartadas por baja confianza (usa --min-confianza 0 para incluirlas)`)
}

// Guardar resultado
const destino = TIPO_SALIDA[tipo]
const previewFile = `scripts/preview-timeline-${tipo}.json`
writeFileSync(previewFile, JSON.stringify(convertidos, null, 2), 'utf-8')

if (existsSync(destino)) {
  console.log(`📄  Preview guardado en: ${previewFile}`)
  console.log(`⚠️   ${destino} ya existe → revisa el preview y fusiona manualmente.\n`)
} else {
  writeFileSync(destino, JSON.stringify(convertidos, null, 2), 'utf-8')
  console.log(`✅  Escrito en: ${destino}\n`)
}

console.log('Recuerda revisar manualmente:')
if (tipo === 'transportes') {
  console.log('  - origen / destino / linea (usa _lat_inicio/_lng_inicio como referencia)')
  console.log('  - tipo (puede que Google lo clasifique como IN_VEHICLE sin especificar)')
  console.log('  - Elimina las filas con _lat_ cuando acabes de usarlas')
} else {
  console.log('  - categoria  (templo / castillo / restaurante / parque…)')
  console.log('  - ciudad     (Google no siempre la incluye)')
  console.log('  - Elimina visitas irrelevantes (hotel, supermercado, aeropuerto de escala…)')
  console.log('  - El campo _confianza indica cuán seguro estaba Google del lugar (0-100)')
  console.log('  - El campo hora ayuda a ordenarlos en itinerario.json')
}
