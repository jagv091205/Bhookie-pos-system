import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AutoContext";
import Login from "./components/Login";
import POS from "./components/POS";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} /> 
          <Route path="/pos" element={<POS />} />
         
        </Routes>
      </AuthProvider>
    </Router>
  );
}
