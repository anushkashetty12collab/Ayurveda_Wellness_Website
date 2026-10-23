import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Recommend from "./pages/Recommend";
import Dosha from "./pages/Dosha";
import Diet from "./pages/Diet";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/dosha" element={<Dosha />} />
        <Route path="/diet" element={<Diet />} />
      </Routes>
    </Router>
  );
}