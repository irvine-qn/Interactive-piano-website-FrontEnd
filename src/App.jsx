import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./features/home/home";
import Piano from "./features/piano/piano";
import Metronome from "./features/metronome/metronome";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/piano" element={<Piano />} />
      <Route path="/metronome" element={<Metronome />} />
    </Routes>
  </BrowserRouter>
);

export default App;
