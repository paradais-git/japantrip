import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/mapa',         label: 'Mapa',         emoji: '🗺️' },
  { to: '/lugares',      label: 'Lugares',       emoji: '⛩️' },
  { to: '/restaurantes', label: 'Restaurantes',  emoji: '🍜' },
  { to: '/hoteles',      label: 'Hoteles',       emoji: '🏨' },
  { to: '/transportes',  label: 'Transportes',   emoji: '🚄' },
  { to: '/cronologia',   label: 'Cronología',    emoji: '📅' },
  { to: '/galeria',      label: 'Galería',       emoji: '📸' },
]

export default function NavBar() {
  return (
    <nav className="bg-japan-red text-white shadow-md flex-shrink-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center h-14">
          <span className="font-bold text-base sm:text-lg mr-4 sm:mr-8 whitespace-nowrap select-none">
            🗾 Japan Trip
          </span>
          <div className="flex overflow-x-auto gap-0.5 flex-1">
            {navItems.map(({ to, label, emoji }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  }`
                }
              >
                <span className="text-base leading-none">{emoji}</span>
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
