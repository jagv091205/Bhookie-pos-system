import { useState } from "react";
import { useAuth } from "../contexts/AutoContext";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const roleMap = {
  cash01: "cashier",

};

export default function Login() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async () => {
    const trimmedCode = code.trim();

    if (!trimmedCode || trimmedCode.length !== 4) {
      alert("Please enter a valid 4-digit code.");
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, "users", trimmedCode);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const isActive =
          userData["active/inactive"] === true || userData.active === true;

        if (!isActive) {
          alert("User is inactive.");
        } else {
          const roleRef = userData.roleId;
          const roleId =
            typeof roleRef === "object" && roleRef.id ? roleRef.id : roleRef;
          const role = roleMap[roleId];

          if (role) {
            setUser({ id: trimmedCode, ...userData, role });

            if (role === "cashier") {
              navigate("/POS");
            } else {
              alert(`Logged in as ${role}`);
            }
          } else {
            alert("User role not recognized.");
          }
        }
      } else {
        alert("Invalid login code.");
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
          placeholder="Enter 4-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={4}
          className="p-2 border border-gray-300 rounded w-full mb-4 text-center"
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
