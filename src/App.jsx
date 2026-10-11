import React, { Suspense } from "react";
import "./App.css";

const Home = React.lazy(() => import("./virtual-piano/home"));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Home />
  </Suspense>
);

export default App;
