import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MenuPage from "../pages/MenuPage/MenuPage";
/* Importera era sidor här som jag gjort med MenuPage */

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* ta bort raden under denna text som navigerar till /menu 
        kan även behövas ta bort navigate i importen högst upp eller 
        bara ändra raden under till LandingPage när den är skapad*/}
        
        <Route path="/" element={<Navigate to="/menu" replace />} />
        
        {/* lägg till er sida under här tex
        <Route path="/Landing" element={<LandingPage />} />  */}

        <Route path="/menu" element={<MenuPage />} />
      </Routes>
    </BrowserRouter>
  );
}