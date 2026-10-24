import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import WorkspacePage from "../pages/sheet/WorkspacePage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/workspace/:sheetId?" element={<WorkspacePage />} />
  </Routes>
);

export default AppRoutes;
