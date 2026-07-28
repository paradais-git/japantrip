import { ExternalLink, Calendar } from 'lucide-react'
import hoteles from '../data/hoteles.json'

function calcNights(checkIn, checkOut) {
  return Math.round(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  )
}

export default function HotelesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Hoteles</h1>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {hoteles.map(hotel => {
          const nights = calcNights(hotel.checkIn, hotel.checkOut)
          return (
            <div
              key={hotel.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {hotel.fotos?.[0] ? (
                <img
                  src={`/japantrip/fotos/${hotel.fotos[0]}`}
                  alt={hotel.nombre}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-5xl select-none">
                  🏨
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800">{hotel.nombre}</h3>
                    <p className="text-sm text-gray-500">
                      {hotel.barrio ? `${hotel.barrio}, ` : ''}{hotel.ciudad}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                    {nights} {nights === 1 ? 'noche' : 'noches'}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                    <span>Check-in: <strong>{hotel.checkIn}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                    <span>Check-out: <strong>{hotel.checkOut}</strong></span>
                  </div>
                </div>

                {hotel.notas && (
                  <p className="text-xs text-gray-500 italic mb-3">💡 {hotel.notas}</p>
                )}

                {hotel.googleMapsUrl && (
                  <a
                    href={hotel.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <ExternalLink size={12} />
                    Ver en Google Maps
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
