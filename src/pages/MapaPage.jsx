import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import lugares from '../data/lugares.json'
import hoteles from '../data/hoteles.json'
import restaurantes from '../data/restaurantes.json'

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
const HOTEL_COLOR      = '#2563eb'
const REST_COLOR       = '#f59e0b'

function markerIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:16px;height:16px;
      background:${color};
      border-radius:50%;
      border:2.5px solid white;
      box-shadow:0 1px 5px rgba(0,0,0,0.55)
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  })
}

export default function MapaPage() {
  const [show, setShow] = useState({ lugares: true, hoteles: true, restaurantes: true })
  const toggle = (key) => setShow(s => ({ ...s, [key]: !s[key] }))

  const markers = useMemo(() => [
    ...(show.lugares
      ? lugares.filter(l => l.lat && l.lng).map(l => ({
          ...l, _type: 'lugar',
          _color: CATEGORY_COLORS[l.categoria] || CATEGORY_COLORS.otro,
        }))
      : []),
    ...(show.hoteles
      ? hoteles.filter(h => h.lat && h.lng).map(h => ({
          ...h, _type: 'hotel', _color: HOTEL_COLOR,
        }))
      : []),
    ...(show.restaurantes
      ? restaurantes.filter(r => r.lat && r.lng).map(r => ({
          ...r, _type: 'restaurante', _color: REST_COLOR,
        }))
      : []),
  ], [show])

  return (
    <div style={{ height: 'calc(100vh - 56px)', position: 'relative' }}>
      {/* Panel de filtros */}
      <div className="absolute top-3 left-3 z-[1000] bg-white rounded-xl shadow-lg p-3 space-y-2 min-w-[150px]">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mostrar</p>
        {[
          { key: 'lugares',      label: 'Lugares',      color: CATEGORY_COLORS.templo },
          { key: 'hoteles',      label: 'Hoteles',      color: HOTEL_COLOR },
          { key: 'restaurantes', label: 'Restaurantes', color: REST_COLOR },
        ].map(({ key, label, color }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={show[key]}
              onChange={() => toggle(key)}
              className="rounded"
            />
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
        <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">
          {markers.length} puntos
        </p>
      </div>

      <MapContainer
        center={[35.5, 136.5]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(item => (
          <Marker
            key={`${item._type}-${item.id}`}
            position={[item.lat, item.lng]}
            icon={markerIcon(item._color)}
          >
            <Popup>
              <div style={{ minWidth: '180px', fontFamily: 'system-ui, sans-serif' }}>
                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }}>
                  {item.nombre}
                </strong>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {item.ciudad}
                  {item.fecha ? ` · ${item.fecha}` : ''}
                  {item.checkIn ? ` · ${item.checkIn} – ${item.checkOut}` : ''}
                </span>
                {item.descripcion && (
                  <p style={{ fontSize: '12px', marginTop: '6px', color: '#374151' }}>
                    {item.descripcion}
                  </p>
                )}
                {item.tipoComida && (
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    🍴 {item.tipoComida}
                  </p>
                )}
                {item.googleMapsUrl && (
                  <a
                    href={item.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: '#2563eb', display: 'block', marginTop: '8px' }}
                  >
                    Ver en Google Maps →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
