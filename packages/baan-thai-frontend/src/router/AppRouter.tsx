import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import LandingPage from "../pages/landingPage/landingPage";
import MenuPage from "../pages/MenuPage/MenuPage";
import ThaiMenuPage from "../pages/ThaiMenuPage/ThaiMenuPage";
import { AboutUsPage } from "../pages/aboutUsPage/aboutUsPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
/* Importera era sidor här som jag gjort med MenuPage */

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/thai" element={<ThaiMenuPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}