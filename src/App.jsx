import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/common/navbar";
import AppRoutes from "./routes/AppRoutes";

const App = () => (
  <BrowserRouter>
    <div className="flex min-h-screen flex-col bg-[var(--color-surface-page)] text-[var(--color-ink)]">
      <Navbar />
      <AppRoutes />
    </div>
  </BrowserRouter>
);

export default App;
