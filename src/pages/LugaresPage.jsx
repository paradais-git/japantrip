import { useState, useMemo } from 'react'
import { ExternalLink, Star } from 'lucide-react'
import lugares from '../data/lugares.json'

const CATEGORY_LABELS = {
  templo:     'Templo',
  santuario:  'Santuario',
  castillo:   'Castillo',
  parque:     'Parque',
  naturaleza: 'Naturaleza',
  mercado:    'Mercado',
  barrio:     'Barrio',
  mirador:    'Mirador',
  museo:      'Museo',
  otro:       'Otro',
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

export default function LugaresPage() {
  const [ciudad, setCiudad] = useState('Todas')
  const [categoria, setCategoria] = useState('Todas')

  const ciudades = useMemo(() => ['Todas', ...new Set(lugares.map(l => l.ciudad))], [])
  const categorias = useMemo(() => ['Todas', ...new Set(lugares.map(l => l.categoria))], [])

  const filtered = useMemo(() =>
    lugares.filter(l =>
      (ciudad === 'Todas' || l.ciudad === ciudad) &&
      (categoria === 'Todas' || l.categoria === categoria)
    ), [ciudad, categoria])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Lugares de Interés</h1>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Ciudad</label>
          <select
            value={ciudad}
            onChange={e => setCiudad(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-japan-red"
          >
            {ciudades.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Categoría</label>
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-japan-red"
          >
            {categorias.map(c => (
              <option key={c} value={c}>
                {c === 'Todas' ? 'Todas' : (CATEGORY_LABELS[c] || c)}
              </option>
            ))}
          </select>
        </div>
        <span className="text-sm text-gray-400 ml-auto">{filtered.length} lugares</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(lugar => (
          <div
            key={lugar.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Foto o placeholder */}
            {lugar.fotos?.[0] ? (
              <img
                src={`/japantrip/fotos/${lugar.fotos[0]}`}
                alt={lugar.nombre}
                className="w-full h-44 object-cover"
              />
            ) : (
              <div className="w-full h-44 bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center text-5xl select-none">
                {EMOJI[lugar.categoria] || '📍'}
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{lugar.nombre}</h3>
                  <p className="text-sm text-gray-500">{lugar.ciudad} · {lugar.fecha}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${CATEGORY_STYLES[lugar.categoria] || CATEGORY_STYLES.otro}`}>
                  {CATEGORY_LABELS[lugar.categoria] || lugar.categoria}
                </span>
              </div>

              {lugar.valoracion > 0 && (
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={13}
                      className={s <= lugar.valoracion ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                    />
                  ))}
                </div>
              )}

              {lugar.descripcion && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{lugar.descripcion}</p>
              )}

              {lugar.notas && (
                <p className="text-xs text-gray-400 italic mb-3">💡 {lugar.notas}</p>
              )}

              {lugar.googleMapsUrl && (
                <a
                  href={lugar.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ExternalLink size={12} />
                  Google Maps
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
