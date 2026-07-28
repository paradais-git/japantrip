import itinerario from '../data/itinerario.json'
import lugaresList from '../data/lugares.json'
import hotelesList from '../data/hoteles.json'
import restaurantesList from '../data/restaurantes.json'
import transportesList from '../data/transportes.json'

// Mapas id → objeto para cada tipo
const lookup = {
  lugar:       Object.fromEntries(lugaresList.map(x => [x.id, x])),
  hotel:       Object.fromEntries(hotelesList.map(x => [x.id, x])),
  restaurante: Object.fromEntries(restaurantesList.map(x => [x.id, x])),
  transporte:  Object.fromEntries(transportesList.map(x => [x.id, x])),
}

const EVENTO_STYLES = {
  lugar:       { dot: 'bg-red-500',    badge: 'bg-red-50 text-red-600',    emoji: '📍' },
  hotel:       { dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-600',  emoji: '🏨' },
  restaurante: { dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-600', emoji: '🍜' },
  transporte:  { dot: 'bg-gray-400',   badge: 'bg-gray-50 text-gray-600',  emoji: '🚄' },
  libre:       { dot: 'bg-green-400',  badge: 'bg-green-50 text-green-600', emoji: '⭐' },
}

export default function CronologiaPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Cronología del viaje</h1>

      <div className="space-y-10">
        {itinerario.map(dia => (
          <div key={dia.fecha}>
            {/* Cabecera del día */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 bg-japan-red text-white rounded-xl px-4 py-2 text-center min-w-[68px] shadow-sm">
                <div className="text-xs font-medium opacity-75">Día {dia.dia}</div>
                <div className="text-sm font-bold">{dia.fecha.slice(5)}</div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{dia.titulo}</h2>
                <p className="text-sm text-gray-500">{dia.ciudad}</p>
              </div>
            </div>

            {/* Eventos del día */}
            <div className="ml-4 pl-6 border-l-2 border-gray-100 space-y-2.5">
              {dia.eventos.map((evento, idx) => {
                const style = EVENTO_STYLES[evento.tipo] || EVENTO_STYLES.libre
                const item  = evento.ref ? lookup[evento.tipo]?.[evento.ref] : null
                return (
                  <div key={idx} className="relative">
                    {/* Punto en la línea */}
                    <div className={`absolute -left-[31px] top-3 w-3.5 h-3.5 rounded-full ${style.dot} border-2 border-white shadow-sm`} />

                    <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 shadow-sm">
                      <div className="flex items-start gap-2.5">
                        <span className="text-base leading-none mt-0.5 flex-shrink-0">{style.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {evento.hora && (
                              <span className="text-xs font-mono text-gray-400 flex-shrink-0">
                                {evento.hora}
                              </span>
                            )}
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${style.badge}`}>
                              {evento.tipo}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 mt-0.5">
                            {item?.nombre || evento.descripcion}
                          </p>
                          {item && item.nombre !== evento.descripcion && evento.descripcion && (
                            <p className="text-xs text-gray-500">{evento.descripcion}</p>
                          )}
                          {item?.googleMapsUrl && (
                            <a
                              href={item.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-0.5 inline-block"
                            >
                              Google Maps →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
