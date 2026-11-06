import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LibraryPage from "../pages/LibraryPage";
import WorkspacePage from "../pages/WorkspacePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import UserProfilePage from "../pages/profile/UserProfilePage";
import EditProfilePage from "../pages/profile/EditProfilePage";
import NotFoundPage from "../pages/NotFoundPage";
import { GuestRoute, ProtectedRoute } from "./RouteGuards";
import { ROUTES } from "../config/routes";

const AppRoutes = () => (
  <Routes>
    <Route path={ROUTES.HOME} element={<HomePage />} />
    <Route path={ROUTES.LIBRARY} element={<LibraryPage />} />
    <Route path={ROUTES.WORKSPACE} element={<Navigate to={ROUTES.LIBRARY} replace />} />
    <Route path={`${ROUTES.WORKSPACE}/:sheetId`} element={<WorkspacePage />} />
    <Route element={<GuestRoute />}>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route path={ROUTES.PROFILE} element={<UserProfilePage />} />
      <Route path={ROUTES.PROFILE_EDIT} element={<EditProfilePage />} />
      <Route path={ROUTES.UPLOAD} element={<NotFoundPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
