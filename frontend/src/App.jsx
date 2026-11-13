import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
// Por ahora vamos a crear un componente genérico para las salas
import SalaDetalle from './pages/SalaDetalle'; 

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Ruta principal: Muestra la portada */}
        <Route path="/" element={<Home />} />
        
        {/* Rutas dinámicas para cada sala */}
        <Route path="/sala/:id" element={<SalaDetalle />} />
      </Routes>
    </>
  );
}

export default App;