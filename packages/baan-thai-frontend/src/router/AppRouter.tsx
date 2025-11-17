import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MenuPage from "../pages/MenuPage/MenuPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<MenuPage />} />
      </Routes>
    </BrowserRouter>
  );
}