import Header from './Header';
import MenuGrid from './MenuGrid';
import EmployeeCashTab from "./EmployeeCashTab";
import KOTPanel from './KOTPanel';
import PaymentScreen from './PaymentScreen';
import Footer from './Footer';
import { useState } from 'react';
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";


export default function POS() {
  const [kotItems, setKotItems] = useState([]);
  const [showCashTab, setShowCashTab] = useState(false);
  const cashierId = "1234";

  const checkCashierStatusBeforeOpening = async () => {
    try {
      const q = query(
        collection(db, "cashierAttendance"),
        where("cashierId", "==", cashierId),
        where("isSignedIn", "==", true)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Cashier is not signed in. Cannot start session.");
        return false;
      }

      const cashierData = snapshot.docs[0].data();
      if (!cashierData.isOpen) {
        alert("Cashier is closed. Cannot start session.");
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      alert("Error checking cashier status.");
      return false;
    }
  };

  const handleOpenCashTab = async () => {
    const allowed = await checkCashierStatusBeforeOpening();
    if (allowed) {
      setShowCashTab(true);
    }
  };

  
  return (
    <div>
      <Header />
      <div className="flex" flex-col h-screen>
        <MenuGrid onAddItem={(item) => {
          setKotItems(prevItems => {
            const existingIndex = prevItems.findIndex(
              i => i.id === item.id && 
              JSON.stringify(i.sauces || []) === JSON.stringify(item.sauces || [])
            );
            
            if (existingIndex !== -1) {
              const updated = [...prevItems];
              updated[existingIndex].quantity += 1;
              return updated;
            }
            return [...prevItems, item];
          });
        }} />
        <div className="w-[50%] overflow-y-auto">
        <KOTPanel kotItems={kotItems} setKotItems={setKotItems} setShowCashTab={handleOpenCashTab} />
        </div>
        </div>
        <Footer/>

        {showCashTab && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Cash Session</h2>
            <EmployeeCashTab onClose={() => setShowCashTab(false)} />
            <button
              onClick={() => setShowCashTab(false)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}