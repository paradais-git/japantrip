import transportes from '../data/transportes.json'

const TIPO_EMOJI = {
  'Avión':      '✈️',
  'Shinkansen': '🚅',
  'Tren':       '🚆',
  'Metro':      '🚇',
  'Bus':        '🚌',
  'Ferry':      '⛴️',
  'Taxi':       '🚕',
  'Bici':       '🚲',
}

export default function TransportesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Transportes</h1>

      {/* Vista de tabla en pantallas grandes */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Tipo', 'Trayecto', 'Línea', 'Fecha', 'Duración', 'Notas'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transportes.map((t, i) => (
              <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{TIPO_EMOJI[t.tipo] || '🚗'}</span>
                    <span className="text-sm font-medium text-gray-700">{t.tipo}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="font-medium text-gray-800">{t.origen}</span>
                  <span className="text-gray-400 mx-2">→</span>
                  <span className="font-medium text-gray-800">{t.destino}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{t.linea}</td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{t.fecha}</td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    {t.duracion}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 max-w-xs">{t.notas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de tarjetas en móvil */}
      <div className="md:hidden space-y-3">
        {transportes.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{TIPO_EMOJI[t.tipo] || '🚗'}</span>
                <span className="font-semibold text-gray-700">{t.tipo}</span>
              </div>
              <span className="text-sm font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                {t.duracion}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-800 mb-1">
              {t.origen}
              <span className="text-gray-400 mx-2">→</span>
              {t.destino}
            </p>
            <p className="text-xs text-gray-500 mb-1">{t.linea} · {t.fecha}</p>
            {t.notas && <p className="text-xs text-gray-400 italic">{t.notas}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
