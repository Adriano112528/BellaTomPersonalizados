import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import ProdutosPublicos from "../pages/ProdutosPublicos";
import Galeria from "../pages/Galeria/Galeria";
import Contato from "../pages/Contato/Contato";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/produtos" element={<ProdutosPublicos />} />

        <Route path="/galeria" element={<Galeria />} />

        <Route path="/contato" element={<Contato />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;