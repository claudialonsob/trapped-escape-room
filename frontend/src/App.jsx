import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SalaDetalle from './pages/SalaDetalle'; 
import Reserva from './pages/Reserva';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';

function App() {
  const location = useLocation();
  const esRutaAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!esRutaAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sala/:id" element={<SalaDetalle />} />
        <Route path="/reserva/:id" element={<Reserva />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </>
  );
}

export default App;