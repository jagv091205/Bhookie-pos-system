import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy, where, limit, startAfter } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { CSVLink } from "react-csv";
import { useReactToPrint } from "react-to-print";

const roleMap = {
  cash01: "cashier",
  manage01: "manager"
};

const ReportPage = () => {
  // Authentication states
  const [code, setCode] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Report states
  const [attendanceData, setAttendanceData] = useState([]);
  const [kotHistory, setKotHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [empNameFilter, setEmpNameFilter] = useState("");
  const [currentView, setCurrentView] = useState("home");
  const db = getFirestore();
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedKOT, setSelectedKOT] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("");
  const reportRef = React.useRef();
  const navigate = useNavigate();

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  // Manager authentication handler
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
        const isActive = userData["active/inactive"] === true || userData.active === true;

        if (!isActive) {
          alert("User is inactive.");
        } else {
          const roleRef = userData.roleId;
          const roleId = roleRef && typeof roleRef === "object" ? roleRef.id : roleRef;

          if (roleId === "manage01") {
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

  const fetchKOTHistory = async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
        setLastVisible(null);
        setHasMore(true);
      } else {
        if (!hasMore) return;
      }

      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      let baseQuery = query(
        collection(db, "KOT"),
        where("date", ">=", startDate),
        where("date", "<=", endDate),
        orderBy("date", "desc")
      );

      if (paymentFilter !== "all") {
        baseQuery = query(baseQuery, where("paymentMethod", "==", paymentFilter));
      }

      if (customerFilter) {
        baseQuery = query(baseQuery, where("customerId", "==", `customers/${customerFilter}`));
      }

      let paginatedQuery = query(baseQuery, limit(50));
      if (loadMore && lastVisible) {
        paginatedQuery = query(baseQuery, startAfter(lastVisible), limit(50));
      }

      const querySnapshot = await getDocs(paginatedQuery);
      const newHistory = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        newHistory.push({
          id: doc.id,
          kot_id: data.kot_id,
          date: data.date.toDate(),
          amount: data.amount,
          customerId: data.customerId || null,
          earnedPoints: data.earnedPoints || 0,
          userId: data.user_id,
          itemsCount: Array.isArray(data.items) ? data.items.length : 0,
          paymentMethod: data.paymentMethod || "unknown"
        });
      });

      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      setHasMore(querySnapshot.docs.length === 50);

      if (loadMore) {
        setKotHistory(prev => [...prev, ...newHistory]);
      } else {
        setKotHistory(newHistory);
      }
    } catch (error) {
      console.error("Error fetching KOT history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (kotId) => {
    try {
      const kotRef = doc(db, "KOT", kotId);
      const kotSnap = await getDoc(kotRef);

      if (kotSnap.exists()) {
        const kotData = kotSnap.data();
        setSelectedKOT({
          id: kotSnap.id,
          ...kotData,
          date: kotData.date.toDate(),
          items: Array.isArray(kotData.items) ? kotData.items.map(item => ({
            ...item,
            price: item.price || 0 // Ensure price exists, default to 0 if not
          })) : []
        });
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching KOT details:", error);
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

  const formatKOTCSVData = () => {
    return kotHistory.map(kot => ({
      "KOT ID": kot.kot_id,
      "Date": kot.date.toLocaleDateString(),
      "Time": kot.date.toLocaleTimeString(),
      "Customer ID": kot.customerId ? kot.customerId.split('/')[1] : "Walk-in",
      "Amount": `£${kot.amount.toFixed(2)}`,
      "Payment Method": kot.paymentMethod,
      "Earned Points": kot.earnedPoints,
      "Items Count": kot.itemsCount,
      "User ID": kot.userId
    }));
  };

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    pageStyle: `
      @page { size: auto; margin: 5mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f3f4f6 !important; }
        tr:nth-child(even) { background-color: #f9fafb !important; }
      }
    `,
    documentTitle: `KOT_Report_${selectedDate}`
  });

  const formatCustomerId = (customerId) => {
    if (!customerId) return "Walk-in";
    return customerId.split('/')[1];
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (currentView === "attendance") {
        fetchAttendanceData();
      } else if (currentView === "kot") {
        fetchKOTHistory();
      }
    }
  }, [selectedDate, currentView, paymentFilter, customerFilter, isAuthenticated]);

  const filteredData = attendanceData.filter((log) =>
    log.empName.toLowerCase().includes(empNameFilter.toLowerCase())
  );

  const handleClose = () => {
    navigate('/');
  };

  // Show login screen if not authenticated
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

  // Show reports if authenticated
  return (
    <div className="container">
      {currentView === "home" && (
        <div className="cards-view">
          <button className="close-btn" onClick={handleClose}>×</button>

          <div className="cards">
            <div className="card" onClick={() => setCurrentView("attendance")}>
              Attendance Report
            </div>
            <div className="card" onClick={() => setCurrentView("kot")}>
              KOT Report
            </div>
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

      {currentView === "kot" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1>KOT Report for {selectedDate}</h1>
            <button onClick={() => setCurrentView("home")}>Back</button>
          </div>

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
              Payment Method:
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">All Payments</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="credit">Credit</option>
              </select>
            </label>

            <label>
              Customer ID:
              <input
                type="text"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                placeholder="e.g., cus01"
              />
            </label>

            <CSVLink
              data={formatKOTCSVData()}
              filename={`KOT_Report_${selectedDate}.csv`}
              className="btn"
            >
              Download CSV
            </CSVLink>

            <button onClick={handlePrint} className="btn">
              Print Report
            </button>
          </div>

          <div ref={reportRef}>
            {loading ? (
              <div>Loading KOT data...</div>
            ) : kotHistory.length === 0 ? (
              <div>No KOTs found for selected date</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>KOT ID</th>
                    <th>Date/Time</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Points</th>
                    <th>Items</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kotHistory.map((kot) => (
                    <tr key={kot.id}>
                      <td>{kot.kot_id}</td>
                      <td>
                        {kot.date.toLocaleDateString()} {kot.date.toLocaleTimeString()}
                      </td>
                      <td>{formatCustomerId(kot.customerId)}</td>
                      <td>£{Number(kot.amount).toFixed(2)}</td>
                      <td>{kot.paymentMethod}</td>
                      <td>{kot.earnedPoints}</td>
                      <td>{kot.itemsCount}</td>
                      <td>
                        <button
                          onClick={() => handleViewDetails(kot.id)}
                          className="view-btn"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {hasMore && !loading && (
            <button onClick={() => fetchKOTHistory(true)} className="btn">
              Load More
            </button>
          )}
        </div>
      )}

      {isDetailModalOpen && selectedKOT && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>KOT Details - {selectedKOT.kot_id}</h3>
              <button onClick={() => setIsDetailModalOpen(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-semibold">Date:</p>
                  <p>{selectedKOT.date.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-semibold">Customer:</p>
                  <p>{formatCustomerId(selectedKOT.customerId)}</p>
                </div>
                <div>
                  <p className="font-semibold">Payment Method:</p>
                  <p>{selectedKOT.paymentMethod || "unknown"}</p>
                </div>
                <div>
                  <p className="font-semibold">User ID:</p>
                  <p>{selectedKOT.user_id}</p>
                </div>
                <div>
                  <p className="font-semibold">Earned Points:</p>
                  <p>{selectedKOT.earnedPoints || 0}</p>
                </div>
                <div>
                  <p className="font-semibold">Total Amount:</p>
                  <p>£{Number(selectedKOT.amount).toFixed(2)}</p>
                </div>
              </div>

              <h4 className="font-bold">Items:</h4>
              {selectedKOT.items.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Item ID</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedKOT.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.id}</td>
                        <td>{item.quantity}</td>
                        <td>£{Number(item.price).toFixed(2)}</td>
                        <td>
                          £{(item.quantity * Number(item.price)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No items found for this KOT</p>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          padding: 20px;
          font-family: Arial, sans-serif;
          position: relative;
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
        input[type="text"],
        select {
          padding: 6px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .btn {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn:hover {
          background-color: #0056b3;
        }

        .view-btn {
          padding: 6px 12px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .view-btn:hover {
          background-color: #218838;
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

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }

        .grid {
          display: grid;
        }

        .grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .gap-4 {
          gap: 1rem;
        }

        .mb-4 {
          margin-bottom: 1rem;
        }

        .font-semibold {
          font-weight: 600;
        }

        .font-bold {
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default ReportPage;
