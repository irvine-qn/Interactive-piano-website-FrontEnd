import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AudioProvider } from "./contexts/AudioContext";
import HomePage from "./pages/index";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AudioProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </AudioProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
