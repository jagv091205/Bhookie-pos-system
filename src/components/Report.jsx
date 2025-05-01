import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const AttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [empNameFilter, setEmpNameFilter] = useState("");
  const [currentView, setCurrentView] = useState("home");

  const db = getFirestore();

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

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

  const navigate = useNavigate();

  const handleClose = () => {
    navigate('./KOTPanel.jsx');  
  };

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

.close-btn:hover {
  background: #cc0000;
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

export default AttendanceReport;
