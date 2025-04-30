import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";

const EmployeeCashTab = ({ onClose }) => {
  const [cashSession, setCashSession] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const q = query(
        collection(db, "cashSessions"),
        where("isClosed", "==", false)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const session = snapshot.docs[0];
        setCashSession({ id: session.id, ...session.data() });
      }
    };
    fetchSession();
  }, []);

  const handleStart = async () => {
    const newSession = {
      startedBy: "John", // Replace with actual user if needed
      startedAt: Timestamp.now(),
      openingBalance: 1000, // Default for now. Can fetch previous day's closing later.
      isClosed: false,
      transactions: [],
    };
    const docRef = await addDoc(collection(db, "cashSessions"), newSession);
    setCashSession({ id: docRef.id, ...newSession });
  };

  const handleCloseSession = async () => {
    const sessionRef = doc(db, "cashSessions", cashSession.id);
    await updateDoc(sessionRef, {
      isClosed: true,
      closedAt: Timestamp.now(),
      closedBy: "John",
    });
    setCashSession(null);
    alert("Session closed.");
    onClose();
  };

  const calculateTotals = () => {
    const ins = cashSession?.transactions?.filter(t => t.type === "in").reduce((sum, t) => sum + t.amount, 0) || 0;
    const outs = cashSession?.transactions?.filter(t => t.type === "out").reduce((sum, t) => sum + t.amount, 0) || 0;
    const expectedCash = (cashSession?.openingBalance || 0) + ins - outs;
    return { ins, outs, expectedCash };
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Cash Session</h2>

      {cashSession ? (
        <>
          <p><strong>Started By:</strong> {cashSession.startedBy}</p>
          <p><strong>Opening Balance:</strong> £{cashSession.openingBalance}</p>
          <p><strong>Started At:</strong> {cashSession.startedAt.toDate().toLocaleString()}</p>


          {/* Remove later  to hide transaction start*/}
          {/* Show Transactions Button */}
          <button
            onClick={() => setShowTransactions(prev => !prev)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showTransactions ? "Hide Transactions" : "Show Transactions"}
          </button>

          
          {showTransactions && cashSession.transactions && cashSession.transactions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Transactions</h3>
              
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {cashSession.transactions.map((txn, idx) => (
                  <li key={idx} className="border p-2 rounded shadow-sm bg-gray-50">
                    <p><strong>Type:</strong> {txn.type}</p>
                    <p><strong>Amount:</strong> £{txn.amount}</p>
                    <p><strong>By:</strong> {txn.by}</p>
                    <p><strong>Time:</strong> {txn.time?.toDate().toLocaleString()}</p>
                    <p><strong>Note:</strong> {txn.note || '—'}</p>
                  </li>
                ))}
              </ul>
              

              {/* Totals */}
              <div className="mt-4 p-2 bg-green-50 rounded">
                {(() => {
                  const { ins, outs, expectedCash } = calculateTotals();
                  return (
                    <>
                      <p><strong>Total Cash In:</strong> £{ins}</p>
                      <p><strong>Total Cash Out:</strong> £{outs}</p>
                      <p><strong>Expected Cash in Drawer:</strong> £{expectedCash}</p>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
          {/* Remove later  to hide transaction end*/}

          <button onClick={handleCloseSession} className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Close Session
          </button>
        </>
      ) : (
        <>
          <button onClick={handleStart} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Start Session
          </button>
        </>
      )}

    </div>
  );
};

export default EmployeeCashTab;
