import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import WorkspacePage from "../pages/sheet/WorkspacePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import UserProfilePage from "../pages/profile/UserProfilePage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/workspace/:sheetId?" element={<WorkspacePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/profile" element={<UserProfilePage />} />
  </Routes>
);

export default AppRoutes;
