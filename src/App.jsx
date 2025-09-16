import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import StarSky from "./pages/StarSky";

const App = () => {
  return (
    <BrowserRouter>
      <div className="bg-cover min-h-screen bg-[url('/src/assets/background.png')]">
        <Routes>
          <Route path="/" element={<StarSky />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
