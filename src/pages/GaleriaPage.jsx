import { useState } from 'react'
import lugaresList from '../data/lugares.json'
import restaurantesList from '../data/restaurantes.json'
import hotelesList from '../data/hoteles.json'

// Recopilar todas las fotos de todos los datos
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

export default function GaleriaPage() {
  const [selected, setSelected] = useState(null)

  if (allPhotos.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4 select-none">📸</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Galería</h1>
        <p className="text-gray-500 mb-4">
          Añade fotos a los lugares, restaurantes y hoteles en los archivos JSON
          y aparecerán aquí automáticamente.
        </p>
        <div className="bg-gray-50 rounded-xl p-5 text-left inline-block text-sm text-gray-600">
          <p className="font-semibold mb-2">Cómo añadir fotos:</p>
          <ol className="list-decimal list-inside space-y-1.5">
            <li>Copia la foto en <code className="bg-gray-200 px-1 rounded">public/fotos/</code></li>
            <li>En el JSON correspondiente, añade el nombre del archivo al array <code className="bg-gray-200 px-1 rounded">fotos</code></li>
            <li>Ejemplo: <code className="bg-gray-200 px-1 rounded">"fotos": ["sensoji-01.webp"]</code></li>
          </ol>
          <p className="mt-3 text-xs text-gray-400">
            Recomendado: formato WebP, máx. 1200px de ancho, &lt;500 KB.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Galería <span className="text-gray-400 text-lg font-normal">({allPhotos.length} fotos)</span>
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {allPhotos.map((photo, idx) => (
          <div
            key={idx}
            onClick={() => setSelected(photo)}
            className="cursor-pointer group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
          >
            <img
              src={`/japantrip/fotos/${photo.src}`}
              alt={photo.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl">
              <p className="text-white text-xs font-medium truncate">{photo.caption}</p>
              <p className="text-white/70 text-xs">{photo.ciudad}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light leading-none z-10"
            aria-label="Cerrar"
          >
            ×
          </button>
          <div
            className="max-w-4xl max-h-full flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={`/japantrip/fotos/${selected.src}`}
              alt={selected.caption}
              className="max-h-[80vh] max-w-full object-contain rounded-xl"
            />
            <div className="text-center mt-4">
              <p className="text-white font-semibold">{selected.caption}</p>
              <p className="text-white/60 text-sm">{selected.ciudad}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
