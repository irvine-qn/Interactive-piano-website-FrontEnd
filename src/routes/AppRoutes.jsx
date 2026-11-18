import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "./RouteGuards";
import { ROUTES } from "../config/routes";

// Tach moi trang thanh chunk rieng de trang dau khong phai tai Tone.js, VexFlow...
const HomePage = lazy(() => import("../pages/HomePage"));
const LibraryPage = lazy(() => import("../pages/LibraryPage"));
const WorkspacePage = lazy(() => import("../pages/WorkspacePage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));
const UserProfilePage = lazy(() => import("../pages/profile/UserProfilePage"));
const UploadPage = lazy(() => import("../pages/UploadPage"));
const EditProfilePage = lazy(() => import("../pages/profile/EditProfilePage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

const AppRoutes = () => (
  <Suspense fallback={<div className="flex-1" />}>
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
        <Route path={ROUTES.UPLOAD} element={<UploadPage />} />
        <Route path={ROUTES.PROFILE_EDIT} element={<EditProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
