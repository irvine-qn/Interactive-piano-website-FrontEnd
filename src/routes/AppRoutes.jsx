import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LibraryPage from "../pages/LibraryPage";
import WorkspacePage from "../pages/WorkspacePage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/library" element={<LibraryPage />} />
    <Route path="/workspace/:sheetId?" element={<WorkspacePage />} />
  </Routes>
);

export default AppRoutes;
