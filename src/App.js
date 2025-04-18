import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AutoContext";
import Login from "./components/Login";
import POS from "./components/POS";
import ManagerScreen from "./components/ManagerScreen";


export default function App() {
  return (
    
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} /> 
          <Route path="/pos" element={<POS />} />
          <Route path="/manager" element={<ManagerScreen />} />
         
        </Routes>
      </AuthProvider>
    </Router>
    
  );
}
