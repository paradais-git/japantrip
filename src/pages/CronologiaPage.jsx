import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import L from 'leaflet'
import itinerario from '../data/itinerario.json'
import lugaresList from '../data/lugares.json'
import hotelesList from '../data/hoteles.json'
import restaurantesList from '../data/restaurantes.json'
import transportesList from '../data/transportes.json'

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

// Coordinates for each day's main route points
const DAY_COORDS = {
  1: [
    [35.5483, 139.7780], // Haneda
    [35.6896, 139.7006], // Shinjuku Station
    [35.6896, 139.6968], // Granbell Hotel
    [35.6902, 139.6968], // Ramen Nagi
  ],
  2: [
    [35.6896, 139.6968], // Granbell
    [35.6882, 139.7001], // Southern Terrace
    [35.6595, 139.7004], // Shibuya
    [35.6882, 139.6985], // Gyukatsu Motomura
  ],
  3: [
    [35.6896, 139.6968], // Granbell
    [35.3168, 139.5350], // Kamakura
    [35.3167, 139.5369], // Kotoku-in
    [35.3206, 139.5502], // Akatsuki
    [35.4537, 139.6380], // Yokohama Cosmo World
    [35.6908, 139.6967], // Zauo
  ],
  4: [
    [35.6896, 139.6968], // Granbell
    [35.6594, 139.7393], // Azabudai Hills
    [35.6586, 139.7454], // Tokyo Tower
    [35.6441, 139.6988], // Nakameguro
    [35.7295, 139.7185], // Sunshine 60
    [35.7295, 139.7109], // Kanda Tamagoken
  ],
  5: [
    [35.6896, 139.6968], // Granbell
    [35.7130, 139.7770], // Ueno
    [35.7101, 139.8107], // Skytree
  ],
  6: [
    [35.6896, 139.6968], // Granbell
    [35.6913, 139.6988], // Taste the World
    [35.6983, 139.7714], // Akihabara
    [35.6810, 139.7703], // Pokemon Center DX
    [35.6717, 139.7649], // Ginza
    [35.6250, 139.7756], // Unicorn Gundam
  ],
  7: [
    [35.6896, 139.6968], // Granbell
    [35.5098, 138.7585], // Kawaguchiko
    [35.5086, 138.7571], // Lake boat
  ],
  8: [
    [35.5098, 138.7585], // Kasuitei Ooya
    [35.4815, 138.7979], // Chureito Pagoda
    [35.1157, 138.9128], // Mishima
    [34.9857, 135.7590], // Kyoto Station
    [35.0038, 135.7637], // Agora Kyoto
  ],
  9: [
    [35.0038, 135.7637], // Agora
    [35.0050, 135.7678], // Iolite
    [35.0094, 135.6669], // Arashiyama
    [35.0218, 135.6641], // Adashino Nenbutsuji
    [35.0079, 135.7687], // mina Kyoto
    [35.0076, 135.7688], // Wagyu Sukiyaki
  ],
  10: [
    [35.0038, 135.7637], // Agora
    [35.0394, 135.7294], // Kinkaku-ji
    [35.0270, 135.7982], // Ginkaku-ji
    [35.0160, 135.7825], // Heian Jingu
    [35.0055, 135.7659], // Toyo Sushi
    [35.0036, 135.7786], // Yasaka
  ],
  11: [
    [35.0038, 135.7637], // Agora
    [34.8891, 135.8078], // Uji
    [34.9340, 135.7374], // Nintendo Museum
    [35.0079, 135.7687], // mina Kyoto
  ],
  12: [
    [35.0038, 135.7637], // Agora
    [34.6822, 135.8349], // Nara Park
    [34.9671, 135.7727], // Fushimi Inari
  ],
  13: [
    [35.0038, 135.7637], // Agora
    [34.6873, 135.5260], // Shin-Osaka
    [34.3985, 132.4752], // Hiroshima
    [34.3915, 132.4527], // Peace Museum
  ],
  14: [
    [34.3985, 132.4752], // Hiroshima
    [34.2960, 132.3196], // Miyajima
    [34.7019, 135.4959], // Osaka
    [34.6687, 135.5013], // Dotonbori
  ],
  15: [
    [34.7019, 135.4959], // Hotel Granvia Osaka
    [34.6655, 135.4323], // Universal Studios
  ],
  16: [
    [34.7019, 135.4959], // Hotel Granvia Osaka
    [34.6874, 135.5260], // Osaka Castle
    [34.6687, 135.5013], // Souemon-cho
    [34.4349, 135.2441], // Kansai Airport
  ],
}

function dayMarkerIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:10px;height:10px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  })
}

function DayMap({ dia }) {
  const coords = DAY_COORDS[dia.dia]
  if (!coords || coords.length < 2) return null

  const bounds = L.latLngBounds(coords)

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 mb-4 shadow-sm">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [30, 30] }}
        style={{ height: '200px', width: '100%' }}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <Polyline positions={coords} color="#dc2626" weight={3} opacity={0.7} dashArray="6,8" />
        {coords.map((pos, i) => (
          <Marker key={i} position={pos} icon={dayMarkerIcon(i === 0 ? '#2563eb' : i === coords.length - 1 ? '#dc2626' : '#f59e0b')} />
        ))}
      </MapContainer>
    </div>
  )
}

export default function CronologiaPage() {
  const [selectedDay, setSelectedDay] = useState(null)

  const filteredDays = useMemo(() => {
    if (selectedDay === null) return itinerario
    return itinerario.filter(d => d.dia === selectedDay)
  }, [selectedDay])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Cronología del viaje</h1>

      {/* Day filter */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-1.5 pb-2 min-w-max">
          <button
            onClick={() => setSelectedDay(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedDay === null
                ? 'bg-japan-red text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {itinerario.map(dia => (
            <button
              key={dia.dia}
              onClick={() => setSelectedDay(dia.dia)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedDay === dia.dia
                  ? 'bg-japan-red text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              D{dia.dia}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-10">
        {filteredDays.map(dia => (
          <div key={dia.fecha}>
            {/* Day header */}
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

            {/* Day map */}
            <DayMap dia={dia} />

            {/* Day events */}
            <div className="ml-4 pl-6 border-l-2 border-gray-100 space-y-2.5">
              {dia.eventos.map((evento, idx) => {
                const style = EVENTO_STYLES[evento.tipo] || EVENTO_STYLES.libre
                const item  = evento.ref ? lookup[evento.tipo]?.[evento.ref] : null
                return (
                  <div key={idx} className="relative">
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
