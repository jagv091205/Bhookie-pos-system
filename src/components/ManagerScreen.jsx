import React, { useEffect, useState} from "react";
import { collection, getDocs, query, where,doc,deleteDoc,updateDoc,getDoc, } from "firebase/firestore";
import { db } from "../firebase/config"; // Update this to match your firebase setup

export default function ManagerScreen() {
  const [activeTab, setActiveTab] = useState(""); // Default: no tab selected
  const [orders, setOrders] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [selectedItemInfo,setSelectedItemInfo]=useState(null);

  const handleRefund = async (orderId, itemId, refundAmount) => {
    const kotRef = doc(db, "KOT", orderId);
    const kotSnap = await getDoc(kotRef);
    if (!kotSnap.exists()) return;
  
    const data = kotSnap.data();
    const updatedItems = data.items.filter((item) => item.id !== itemId);
    const newAmount = data.amount - refundAmount;
  
    if (updatedItems.length === 0) {
      // No items left, delete order completely
      await deleteDoc(kotRef);
    } else {
      await updateDoc(kotRef, {
        items: updatedItems,
        amount: newAmount,
      });
    }
  
    setSelectedItemInfo(null);
    fetchOrders(); // refresh table
  };
  
  // Void full order
  const handleVoid = async (orderId) => {
    await deleteDoc(doc(db, "KOT", orderId));
    setSelectedItemInfo(null);
    fetchOrders(); // refresh table
  };
  

  useEffect(() => {
    if (activeTab === "Orders") {
      fetchOrders();
    }
  }, [activeTab, filterDate]);

  const fetchOrders = async () => {
    try {
      let kotRef = collection(db, "KOT");

      let q = kotRef;

      if (filterDate) {
        const selectedDate = new Date(filterDate);
        selectedDate.setHours(0, 0, 0, 0);

        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);

        q = query(
          kotRef,
          where("date", ">=", selectedDate),
          where("date", "<", nextDate)
        );
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);
    } catch (err) {
      console.error("Error fetching KoT orders:", err);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Manager Panel</h2>
        <nav className="space-y-2">
          <button
            className={`block w-full text-left px-4 py-2 rounded ${
              activeTab === "Orders" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("Orders")}
          >
            Orders
          </button>
          <button
            className={`block w-full text-left px-4 py-2 rounded ${
              activeTab === "Staff Meal" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("Staff Mail")}
          >
            Staff Mail
          </button>
          <button
            className={`block w-full text-left px-4 py-2 rounded ${
              activeTab === "Cash" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("Cash")}
          >
            Cash
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-white overflow-auto">
        <h1 className="text-3xl font-bold mb-4">Manager Screen</h1>

        {activeTab === "Orders" && (
          <div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Filter by Date:</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <table className="min-w-full border border-gray-200">
  <thead className="bg-gray-100">
    <tr>
      <th className="p-2 border">Date</th>
      <th className="p-2 border">Item Name</th>
      <th className="p-2 border">Price</th>
      <th className="p-2 border">Quantity</th>
      <th className="p-2 border">Customer ID</th>
      <th className="p-2 border">User ID</th>
      <th className="p-2 border">Total Amount</th>
    </tr>
  </thead>
  <tbody>
    {orders.map((order) =>
      order.items?.map((item, index) => {
        const isSelected=
        selectedItemInfo?.orderId === order.id &&
        selectedItemInfo?.item?.id === item.id;
        return(
          <React.Fragment key={`${order.id}-${index}`}>
          <tr
            className={`text-center border-t cursor-pointer ${
              isSelected ? "bg-gray-100" : ""
            }`}
            onClick={() => {
              if (isSelected) {
                setSelectedItemInfo(null); // toggle off
              } else {
                setSelectedItemInfo({ orderId: order.id, item, order });
              }
            }}
          >
            <td className="p-2 border">
              {order.date?.toDate?.().toLocaleString() || "N/A"}
            </td>
            <td className="p-2 border">{item.name}</td>
            <td className="p-2 border">{item.price}</td>
            <td className="p-2 border">{item.quantity}</td>
            <td className="p-2 border">{order.customerID}</td>
            <td className="p-2 border">{order.user_id || "N/A"}</td>
            <td className="p-2 border">{order.amount}</td>
          </tr>

          {/* Action Buttons Row */}
          {isSelected && (
            <tr className="bg-gray-50 text-center">
              <td colSpan={7} className="p-3">
                <button
                  onClick={() =>
                    handleRefund(order.id, item.id, item.price * item.quantity)
                  }
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mr-4"
                >
                  Refund This Item
                </button>
                <button
                  onClick={() => handleVoid(order.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Void Entire Order
                </button>
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    })
  )}
</tbody>
</table>


            {orders.length === 0 && (
              <p className="mt-4 text-gray-600">No orders found.</p>
            )}
          </div>
        )}

        {activeTab === "Staff Mail" && <p>📧 Staff Mail panel coming soon!</p>}
        {activeTab === "Cash" && <p>💰 Cash overview panel coming soon!</p>}
      </main>
    </div>
  );
}
