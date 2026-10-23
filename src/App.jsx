import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

const App = () => (
  <BrowserRouter>
    <div className="flex min-h-screen flex-col bg-[var(--color-surface-page)] text-[var(--color-ink)]">
      <AppRoutes />
    </div>
  </BrowserRouter>
);

export default App;
