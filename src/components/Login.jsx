import { useState } from "react";
import { useAuth } from "../contexts/AutoContext";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const roleMap = {
  role01: "cashier",
  rol02: "manager",
  rol03: "chef",
};

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async () => {
    const trimmedMobile = mobile.trim();
  
    if (!trimmedMobile) {
      alert("Please enter a mobile number.");
      return;
    }
  
    setLoading(true);
  
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      let matchedUser = null;
  
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const mobileStr = String(data.mobile);
        const isActive = data["active/inactive"] === true || data.active === true;
  
        if (mobileStr === trimmedMobile && isActive) {
          matchedUser = { id: doc.id, ...data };
        }
      });
  
      if (matchedUser) {
        const roleRef = matchedUser.roleId;
        const roleId = typeof roleRef === "object" && roleRef.id ? roleRef.id : null;
        const role = roleMap[roleId];
  
        if (role) {
          setUser({ ...matchedUser, role });
  
          if (role === "cashier") {
            navigate("/pos");
          } else {
            alert(`Logged in as ${role}`);
          }
        } else {
          alert("User role not recognized.");
        }
      } else {
        alert("User not found or inactive.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong during login.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-md p-6 rounded w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
        <input
          type="text"
          placeholder="Enter mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full mb-4"
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}