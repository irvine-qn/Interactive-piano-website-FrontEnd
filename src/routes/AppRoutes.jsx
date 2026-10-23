import { Navigate, Route, Routes } from "react-router-dom";
import WorkspacePage from "../pages/WorkspacePage";

const AppRoutes = () => (
  <Routes>
    {/* Tạm thời "/" chuyển sang Workspace, khi gộp với HomePage thì thay bằng <HomePage /> */}
    <Route path="/" element={<Navigate to="/workspace" replace />} />
    <Route path="/workspace/:sheetId?" element={<WorkspacePage />} />
  </Routes>
);

export default AppRoutes;
