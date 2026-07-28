import { useState, useMemo } from 'react'
import { ExternalLink, Star } from 'lucide-react'
import restaurantes from '../data/restaurantes.json'

const PRECIO_LABEL = { '€': 'Económico', '€€': 'Moderado', '€€€': 'Caro', '€€€€': 'Lujo' }

export default function RestaurantesPage() {
  const [ciudad, setCiudad] = useState('Todas')
  const [tipo, setTipo] = useState('Todos')

  const ciudades = useMemo(() => ['Todas', ...new Set(restaurantes.map(r => r.ciudad))], [])
  const tipos    = useMemo(() => ['Todos', ...new Set(restaurantes.map(r => r.tipoComida))], [])

  const filtered = useMemo(() =>
    restaurantes.filter(r =>
      (ciudad === 'Todas' || r.ciudad === ciudad) &&
      (tipo === 'Todos' || r.tipoComida === tipo)
    ), [ciudad, tipo])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Restaurantes</h1>

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
          <label className="text-sm font-medium text-gray-600">Tipo</label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-japan-red"
          >
            {tipos.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <span className="text-sm text-gray-400 ml-auto">{filtered.length} restaurantes</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(r => (
          <div
            key={r.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            {r.fotos?.[0] ? (
              <img
                src={`/japantrip/fotos/${r.fotos[0]}`}
                alt={r.nombre}
                className="w-full h-36 object-cover rounded-lg mb-3"
              />
            ) : (
              <div className="w-full h-36 bg-gradient-to-br from-orange-50 to-amber-100 rounded-lg mb-3 flex items-center justify-center text-4xl select-none">
                🍴
              </div>
            )}

            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{r.nombre}</h3>
                <p className="text-sm text-gray-500">
                  {r.barrio ? `${r.barrio}, ` : ''}{r.ciudad}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                  {r.tipoComida}
                </span>
                {r.precio && (
                  <span className="text-xs text-gray-400" title={PRECIO_LABEL[r.precio]}>
                    {r.precio}
                  </span>
                )}
              </div>
            </div>

            {r.valoracion > 0 && (
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    size={13}
                    className={s <= r.valoracion ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                  />
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mb-2">📅 {r.fecha}</p>

            {r.notas && (
              <p className="text-sm text-gray-600 italic mb-3 line-clamp-3">{r.notas}</p>
            )}

            {r.googleMapsUrl && (
              <a
                href={r.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <ExternalLink size={12} />
                Google Maps
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
