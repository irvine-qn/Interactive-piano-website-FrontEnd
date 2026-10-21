import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/common/navbar";
import Home from "./features/home/home";
import Piano from "./features/piano/piano";
import Metronome from "./features/metronome/metronome";

const App = () => (
  <BrowserRouter>
    <div className="flex min-h-screen flex-col bg-[var(--color-surface-page)] text-[var(--color-ink)]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/piano" element={<Piano />} />
        <Route path="/metronome" element={<Metronome />} />
      </Routes>
    </div>
  </BrowserRouter>
);

export default App;
