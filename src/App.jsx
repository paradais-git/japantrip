import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import MapaPage from './pages/MapaPage'
import LugaresPage from './pages/LugaresPage'
import RestaurantesPage from './pages/RestaurantesPage'
import HotelesPage from './pages/HotelesPage'
import TransportesPage from './pages/TransportesPage'
import CronologiaPage from './pages/CronologiaPage'
import GaleriaPage from './pages/GaleriaPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/mapa" replace />} />
          <Route path="mapa" element={<MapaPage />} />
          <Route path="lugares" element={<LugaresPage />} />
          <Route path="restaurantes" element={<RestaurantesPage />} />
          <Route path="hoteles" element={<HotelesPage />} />
          <Route path="transportes" element={<TransportesPage />} />
          <Route path="cronologia" element={<CronologiaPage />} />
          <Route path="galeria" element={<GaleriaPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
