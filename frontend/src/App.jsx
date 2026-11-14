import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SalaDetalle from './pages/SalaDetalle'; 
import Reserva from './pages/Reserva';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sala/:id" element={<SalaDetalle />} />
        <Route path="/reserva/:id" element={<Reserva />} />
      </Routes>
    </>
  );
}

export default App;