import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./virtual-piano/home";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  </BrowserRouter>
);

export default App;
