import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthProvider from "./contexts/AuthProvider";
import Signup from "./pages/Signup";
import SignIn from "./pages/SignIn";
import MainPage from "./pages/MainPage";
import FoundPassword from "./pages/FoundPassword";
import Calendar from "./pages/Calendar";
import StarArchive from "./pages/StarArchive";
import NotFound from "./pages/NotFound";
import StarSky from "./pages/StarSky";


const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="bg-cover min-h-screen bg-[url('/src/assets/background.png')] overflow-hidden">
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/foundpassword" element={<FoundPassword />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/archive" element={<StarArchive />} />
            <Route path="/starsky" element={<StarSky />} />
            <Route path="/" element={<MainPage />} />
            <Route path="*" element={<NotFound />} />

          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
