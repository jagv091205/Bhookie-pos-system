import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const AttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [empNameFilter, setEmpNameFilter] = useState("");
  const [showReport, setShowReport] = useState(false);  // ← state to toggle report

  const db = getFirestore();

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const logDocRef = doc(db, "AttendanceLogs", selectedDate);
      const logDocSnap = await getDoc(logDocRef, { source: 'server' }); ;

      if (logDocSnap.exists()) {
        const data = logDocSnap.data();
        const logs = data.logs || [];
        setAttendanceData(logs);
      } else {
        setAttendanceData([]);
      }
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
    if (showReport) {
      fetchAttendanceData();
    }
  }, [selectedDate, showReport]);

  const filteredData = attendanceData.filter((log) =>
    log.empName.toLowerCase().includes(empNameFilter.toLowerCase())
  );

  return (
    <div>
      <button
        className="toggle-btn"
        onClick={() => setShowReport(!showReport)}
      >
        {showReport ? "Hide Attendance Report" : "View Attendance Report"}
      </button>

      {showReport && (
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
            <button onClick={fetchAttendanceData}>Refresh Data</button>

            <button onClick={downloadCSV}>Download CSV</button>
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

      <style>{`
        .toggle-btn {
          padding: 10px 18px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 20px;
          font-size: 15px;
        }

        h1 {
          margin-bottom: 20px;
          font-family: Arial, sans-serif;
        }

        .filters {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          align-items: center;
          font-family: Arial, sans-serif;
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

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-family: Arial, sans-serif;
        }

        th,
        td {
          padding: 8px 12px;
          border: 1px solid #ddd;
          text-align: left;
        }

        th {
          background-color: #f4f4f4;
        }

        td {
          background-color: #fafafa;
        }
      `}</style>
    </div>
  );
};

export default AttendanceReport;
