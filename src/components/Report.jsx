import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AutoContext";

const roleMap = {
  cash01: "cashier",
  manage01: "manager"
};

const ReportPage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [empNameFilter, setEmpNameFilter] = useState("");
  const [currentView, setCurrentView] = useState("home");
  const [code, setCode] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setUser, logout } = useAuth();
  const navigate = useNavigate();
  const db = getFirestore();

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  const handleManagerLogin = async () => {
    const trimmedCode = code.trim();

    if (!trimmedCode || trimmedCode.length !== 8) {
      alert("Please enter a valid 8-digit code.");
      return;
    }

    setAuthLoading(true);

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
          const roleId = roleRef && typeof roleRef === "object" ? roleRef.id : roleRef;

          if (!roleId) {
            alert("Role ID is missing from user data.");
            return;
          }

          const role = roleMap[roleId];

          if (role === "manager") {
            setUser({ id: trimmedCode, ...userData, role });
            setIsAuthenticated(true);
          } else {
            alert("Only managers can access this page.");
          }
        }
      } else {
        alert("Invalid login code.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong during login.");
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const logsRef = collection(db, "AttendanceLogs", selectedDate, "logs");
      const querySnapshot = await getDocs(logsRef);
      const logsData = querySnapshot.docs.map((doc) => doc.data());
      setAttendanceData(logsData);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const rows = [
      ["Employee Name", "Employee ID", "Check-In", "Check-Out", "Worked For"],
      ...attendanceData.map((log) => [
        log.empName,
        log.empId,
        log.checkIn,
        log.checkOut,
        log.worked,
      ]),
    ];
    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Attendance_Report_${selectedDate}.csv`;
    link.click();
  };

  useEffect(() => {
    if (currentView === "attendance") {
      fetchAttendanceData();
    }
  }, [selectedDate, currentView]);

  const filteredData = attendanceData.filter((log) =>
    log.empName.toLowerCase().includes(empNameFilter.toLowerCase())
  );

  const handleClose = () => {
    navigate('/'); // Navigate back to POS screen
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setCode("");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
        <div className="bg-white shadow-md p-6 rounded w-full max-w-sm">
          <h2 className="text-2xl font-semibold mb-4 text-center">Manager Login</h2>
          <input
            type="text"
            placeholder="Enter 8-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={8}
            className="p-2 border border-gray-300 rounded w-full mb-4 text-center"
          />
          <button
            onClick={handleManagerLogin}
            disabled={authLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            {authLoading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {currentView === "home" && (
        <div className="cards-view">
          <button className="close-btn" onClick={handleClose}>×</button>
          

          <div className="cards">
            <div className="card" onClick={() => setCurrentView("attendance")}>
              Attendance Report
            </div>
            <div className="card">KOT Report</div>
            <div className="card">Sales Report</div>
          </div>
        </div>
      )}

      {currentView === "attendance" && (
        <div>
          <h1>Attendance Report for {selectedDate}</h1>

          <div className="filters">
            <label>
              Select Date:
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </label>

            <label>
              Employee Name:
              <input
                type="text"
                value={empNameFilter}
                placeholder="Search by name"
                onChange={(e) => setEmpNameFilter(e.target.value)}
              />
            </label>

            <button onClick={downloadCSV}>Download CSV</button>
            <button onClick={() => fetchAttendanceData()}>Refresh</button>
            <button onClick={() => setCurrentView("home")}>Back</button>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Employee ID</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Worked For</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="5">No attendance logs found.</td>
                  </tr>
                ) : (
                  filteredData.map((log, index) => (
                    <tr key={index}>
                      <td>{log.empName}</td>
                      <td>{log.empId}</td>
                      <td>{log.checkIn}</td>
                      <td>{log.checkOut}</td>
                      <td>{log.worked}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      <style jsx>{`
        .container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .cards-view {
          position: relative;
        }

        .cards {
          display: flex;
          gap: 20px;
          justify-content: center;
          align-items: center;
          margin-top: 200px;
          flex-wrap: wrap;
        }

        .card {
          background-color: #007bff;
          color: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          width: 200px;
          height: 150px;
          cursor: pointer;
          font-size: 18px;
          transition: 0.3s;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
          word-wrap: break-word;
        }

        .card:hover {
          background-color: #0056b3;
        }

        .close-btn {
          position: fixed;
          top: 20px;
          right: 30px;
          background: #ff4d4f;
          color: white;
          border: none;
          font-size: 24px;
          padding: 1px 10px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 999;
        }

        .logout-btn {
          position: fixed;
          top: 20px;
          right: 80px;
          background: #f5222d;
          color: white;
          border: none;
          font-size: 16px;
          padding: 5px 15px;
          border-radius: 4px;
          cursor: pointer;
          z-index: 999;
        }

        .close-btn:hover {
          background: #cc0000;
        }

        .logout-btn:hover {
          background: #cf1322;
        }

        h1 {
          margin-bottom: 20px;
        }

        .filters {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        input[type="date"],
        input[type="text"] {
          padding: 6px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button:hover {
          background-color: #0056b3;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th,
        td {
          padding: 8px 12px;
          border: 1px solid #ddd;
          text-align: left;
        }

        th {
          background-color: rgb(114, 113, 113);
          color: white;
        }

        td {
          background-color: #fafafa;
        }
      `}</style>
    </div>
  );
};

export default ReportPage;