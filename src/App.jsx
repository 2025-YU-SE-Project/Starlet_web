import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Mycons from "./pages/Mycons";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="constellation" element={<Mycons />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
