import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/piano" element={<HomePage />} />
    <Route path="/metronome" element={<HomePage />} />
  </Routes>
);

export default AppRoutes;
