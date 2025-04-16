import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { where } from "firebase/firestore";

import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  orderBy,
  limit,
  Timestamp,
  addDoc,
} from "firebase/firestore";

export default function KOTPanel() {
  const [kotItems, setKotItems] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [quantityInput, setQuantityInput] = useState("");
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [kotId, setKotId] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerPoints, setCustomerPoints] = useState(0);
  const [customerSearch, setCustomerSearch] = useState("");
  const [foundCustomers, setFoundCustomers] = useState([]);

  const userId = "1234"; // Replace with logged-in user ID

  // Dummy items (replace with actual selection logic)
  const availableItems = [
    { id: "item01", name: "Manchurian Wrap", price: 200 },
    { id: "item02", name: "Veg Burger", price: 150 },
    { id: "item03", name: "Paneer Pizza", price: 250 },
  ];

  useEffect(() => {
    updateTotals();
  }, [kotItems]);

  const handleAddItem = (item) => {
    const existingIndex = kotItems.findIndex(
      (i) =>
        i.id === item.id &&
        JSON.stringify(i.sauces || []) === JSON.stringify(item.sauces || [])
    );

    if (existingIndex !== -1) {
      const updated = [...kotItems];
      updated[existingIndex].quantity += 1;
      setKotItems(updated);
    } else {
      setKotItems((prev) => [...prev, { ...item, quantity: 1 }]);
    }
  };

  const updateTotals = (items = kotItems) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setSubTotal(subtotal);
    setDiscount(0);
    setTotal(subtotal);
  };

  const openNumberPad = (index) => {
    setSelectedItemIndex(index);
    setQuantityInput("");
    setShowNumberPad(true);
  };

  const handleNumberPadInput = (num) => {
    setQuantityInput((prev) => prev + num);
  };

  const clearInput = () => setQuantityInput("");

  const applyQuantity = () => {
    const qty = parseInt(quantityInput || "1", 10);
    if (isNaN(qty) || qty <= 0) return;
    const updated = [...kotItems];
    updated[selectedItemIndex].quantity = qty;
    setKotItems(updated);
    setShowNumberPad(false);
    updateTotals(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = kotItems.filter((_, i) => i !== index);
    setKotItems(updated);
    updateTotals(updated);
  };

  const clearItems = () => {
    setKotItems([]);
    updateTotals([]);
    setKotId("");
    setIsPaymentProcessed(false);
    setPaymentMethod("");
    setCustomerId("");
    setCustomerPhone("");
    setCustomerName("");
  };

  const handlePayClick = () => {
    if (kotItems.length === 0) {
      alert("Please add items before payment");
      return;
    }
    setIsCustomerModalOpen(true);
  };

  const generateKOTId = async () => {
    const now = new Date();
    const prefix = `${String(now.getDate()).padStart(2, "0")}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getFullYear()).slice(-2)}`;

    const kotQuery = query(
      collection(db, "KOT"),
      orderBy("kot_id", "desc"),
      limit(1)
    );
    const snapshot = await getDocs(kotQuery);
    let number = 1;
    if (!snapshot.empty) {
      const lastId = snapshot.docs[0].data().kot_id;
      const lastNum = parseInt(lastId.slice(6)) || 0;
      number = lastNum + 1;
    }
    return `${prefix}${number}`;
  };

  const generateCustomerId = async () => {
    const customersQuery = query(
      collection(db, "customers"),
      orderBy("customerID", "desc"),
      limit(1)
    );
    const snapshot = await getDocs(customersQuery);
    let number = 1;
    if (!snapshot.empty) {
      const lastId = snapshot.docs[0].data().customerID;
      const lastNum = parseInt(lastId.replace("cus", "")) || 0;
      number = lastNum + 1;
    }
    return `cus${String(number).padStart(2, "0")}`;
  };

  const searchCustomer = async () => {
    if (!customerSearch) return;
    
    try {
      const customersRef = collection(db, "customers");
      const phoneQuery = query(
        customersRef,
        where("phone", "==", customerSearch)
      );
      const idQuery = query(
        customersRef,
        where("customerID", "==", customerSearch)
      );
      
      const [phoneSnapshot, idSnapshot] = await Promise.all([
        getDocs(phoneQuery),
        getDocs(idQuery)
      ]);
      
      const results = [];
      phoneSnapshot.forEach(doc => results.push(doc.data()));
      idSnapshot.forEach(doc => results.push(doc.data()));
      
      setFoundCustomers(results);
    } catch (error) {
      console.error("Error searching customer:", error);
      alert("Error searching customer");
    }
  };

  const handleSelectCustomer = (customer) => {
    setCustomerId(customer.customerID);
    setCustomerPhone(customer.phone);
    setCustomerName(customer.name);
    setCustomerPoints(customer.points || 0);
    setIsCustomerModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const createNewCustomer = async () => {
    if (!customerPhone || !customerName) {
      alert("Please enter phone number and name");
      return;
    }
    
    try {
      const newCustomerId = await generateCustomerId();
      const customerData = {
        customerID: newCustomerId,
        name: customerName,
        phone: customerPhone,
        points: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await setDoc(doc(db, "customers", customerPhone), customerData);
      
      setCustomerId(newCustomerId);
      setCustomerPhone(customerPhone);
      setCustomerName(customerName);
      setCustomerPoints(0);
      setIsCustomerModalOpen(false);
      setIsPaymentModalOpen(true);
      setIsNewCustomer(false);
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Error creating customer");
    }
  };

  const handleGenerateKOT = async () => {
    if (!isPaymentProcessed) {
      alert("Please process payment before saving KOT.");
      return;
    }

    const newKOTId = await generateKOTId();
    setKotId(newKOTId);

    const earnedPoints = Math.floor(total * 0.1); // 10% of total as points
    
    const data = {
      kot_id: newKOTId,
      date: Timestamp.now(),
      amount: total,
      user_id: userId,
      customerID: customerId || null,
      earnedPoints: customerId ? earnedPoints : 0,
      items: kotItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
    };

    // Save KOT document
    await setDoc(doc(db, "KOT", newKOTId), data);

    // Update customer points if they're in the loyalty program
    if (customerId) {
      try {
        // Update customer document
        const customerDoc = customerPhone 
          ? doc(db, "customers", customerPhone)
          : doc(db, "customers", customerId);
        
        await setDoc(customerDoc, {
          points: customerPoints + earnedPoints,
          updatedAt: Timestamp.now()
        }, { merge: true });

        // Add to loyalty history
        await addDoc(collection(db, "loyaltyHistory"), {
          customerID: customerId,
          type: "earn",
          points: earnedPoints,
          orderID: newKOTId,
          date: Timestamp.now()
        });
      } catch (error) {
        console.error("Error updating customer points:", error);
      }
    }

    // Print KOT
    const printContent = `
      <div style="font-family: Arial, sans-serif; border: 1px solid #000; padding: 10px; width: 200px;">
        <h3 style="text-align: center;">KOT</h3>
        <p><strong>KOT ID:</strong> ${newKOTId}</p>
        ${customerId ? `<p><strong>Customer:</strong> ${customerName} (${customerId})</p>` : ''}
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #000; padding: 5px;">Item</th>
              <th style="border: 1px solid #000; padding: 5px;">Qty</th>
              <th style="border: 1px solid #000; padding: 5px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${kotItems.map(
              (item) => `
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;">
                    ${item.name}
                    ${item.sauces?.length > 0 ? 
                      `<div style="font-size: 10px; color: #555;">${item.sauces.join(", ")}</div>` : ''}
                  </td>
                  <td style="border: 1px solid #000; padding: 5px;">${item.quantity}</td>
                  <td style="border: 1px solid #000; padding: 5px;">₹${item.quantity * item.price}</td>
                </tr>`
            ).join("")}
          </tbody>
        </table>
        <p><strong>Sub Total:</strong> ₹${subTotal}</p>
        <p><strong>Discount:</strong> ₹${discount}</p>
        <p><strong>Total:</strong> ₹${total}</p>
        ${customerId ? `<p><strong>Earned Points:</strong> ${earnedPoints}</p>` : ''}
      </div>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }

    clearItems();
  };

  const handleProcessPayment = () => {
    if (paymentMethod) {
      setIsPaymentProcessed(true);
      setIsPaymentModalOpen(false);
    } else {
      alert("Please select a payment method.");
    }
  };

  return (
    <div className="p-4 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">ORDER</h2>

      {kotId && (
        <div className="mb-4 text-base font-semibold text-indigo-700 border border-indigo-300 rounded p-2 bg-indigo-50">
          KOT ID: <span className="font-mono">{kotId}</span>
        </div>
      )}

      {customerId && (
        <div className="mb-4 text-base font-semibold text-green-700 border border-green-300 rounded p-2 bg-green-50">
          Customer: {customerName} ({customerId}) - Points: {customerPoints}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {availableItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleAddItem(item)}
            className="bg-green-600 text-white px-3 py-2 rounded"
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="border p-4 rounded mb-4 bg-white">
        <table className="w-full text-left mb-4">
          <thead>
            <tr>
              <th>ITEM</th>
              <th>QUANTITY</th>
              <th>PRICE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {kotItems.map((item, index) => (
              <tr key={index}>
                <td>
                  {item.name}
                  {item.sauces?.length > 0 && (
                    <div className="text-sm text-gray-500">
                      {item.sauces.join(", ")}
                    </div>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const updated = [...kotItems];
                        updated[index].quantity = Math.max(
                          updated[index].quantity - 1,
                          1
                        );
                        setKotItems(updated);
                        updateTotals(updated);
                      }}
                      className="bg-gray-300 text-xl w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      -
                    </button>
                    <button
                      onClick={() => openNumberPad(index)}
                      className="bg-gray-100 text-xl w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      {item.quantity}
                    </button>
                    <button
                      onClick={() => {
                        const updated = [...kotItems];
                        updated[index].quantity += 1;
                        setKotItems(updated);
                        updateTotals(updated);
                      }}
                      className="bg-gray-300 text-xl w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>₹{item.quantity * item.price}</td>
                <td>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div>
          <p>Sub Total: ₹{subTotal}</p>
          <p>Discount: ₹{discount}</p>
          <p>Tax: --</p>
          <p className="font-bold text-lg">Total: ₹{total}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => alert(`Total: ₹${total}`)}
          className="bg-green-600 text-white p-2 rounded"
        >
          TOTAL
        </button>
        <button
          onClick={clearItems}
          className="bg-red-600 text-white p-2 rounded"
        >
          CANCEL
        </button>
        <button
          onClick={clearItems}
          className="bg-blue-600 text-white p-2 rounded"
        >
          CLEAR
        </button>
        <button
          onClick={() => setShowNumberPad(true)}
          className="bg-blue-600 text-white p-2 rounded"
        >
          NUMBER PAD
        </button>
        <button
          onClick={handlePayClick}
          className="bg-blue-600 text-white p-2 rounded"
        >
          PAY
        </button>
        <div className="col-span-2">
          <button
            onClick={handleGenerateKOT}
            disabled={!isPaymentProcessed}
            className={`w-full text-white p-2 rounded ${
              isPaymentProcessed ? "bg-green-800" : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            SAVE KOT
          </button>
        </div>
      </div>

      {/* Number Pad Modal */}
      {showNumberPad && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[300px] relative">
            <button
              onClick={() => setShowNumberPad(false)}
              className="absolute top-2 right-2 text-red-600 font-bold text-xl"
            >
              ✕
            </button>

            <div className="text-xl font-semibold mb-2 text-center">
              Enter Quantity
            </div>

            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() =>
                  setQuantityInput((prev) =>
                    String(Math.max(parseInt(prev || "0", 10) - 1, 1))
              )
                }
                className="bg-gray-300 text-xl w-10 h-10 rounded-full"
              >
                -
              </button>

              <div className="text-3xl text-center border p-2 px-6 bg-gray-100 rounded">
                {quantityInput || "0"}
              </div>

              <button
                onClick={() =>
                  setQuantityInput((prev) =>
                    String(parseInt(prev || "0", 10) + 1))
                }
                className="bg-gray-300 text-xl w-10 h-10 rounded-full"
              >
                +
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberPadInput(String(num))}
                  className="bg-gray-200 text-2xl p-4 rounded"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={clearInput}
                className="bg-yellow-400 col-span-1 p-2 rounded"
              >
                Clear
              </button>
              <button
                onClick={applyQuantity}
                className="bg-green-600 text-white col-span-2 p-2 rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px] text-center relative">
            <button
              onClick={() => setIsCustomerModalOpen(false)}
              className="absolute top-2 right-2 text-red-600 font-bold text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">Customer Loyalty Program</h3>
            
            {!isNewCustomer ? (
              <>
                <div className="mb-4">
                  <p className="mb-2">Enter Customer ID or Phone Number:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Customer ID or Phone"
                      className="border p-2 flex-1 rounded"
                    />
                    <button
                      onClick={searchCustomer}
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {foundCustomers.length > 0 && (
                  <div className="mb-4 border-t pt-4">
                    <h4 className="font-semibold mb-2">Found Customers:</h4>
                    <div className="max-h-40 overflow-y-auto">
                      {foundCustomers.map((customer) => (
                       <div
                       key={customer.customerID}
                       className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                       onClick={() => handleSelectCustomer(customer)} // Corrected line
                     >
                       {customer.name} - {customer.phone} (ID: {customer.customerID}, Points: {customer.points || 0})
                     </div>
                     
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setIsNewCustomer(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded mt-4"
                >
                  New Customer
                </button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <p className="mb-1 text-left">Customer Name:</p>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="border p-2 w-full rounded mb-3"
                  />
                  <p className="mb-1 text-left">Phone Number:</p>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="border p-2 w-full rounded"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setIsNewCustomer(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Back
                  </button>
                  <button
                    onClick={createNewCustomer}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Create Customer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[300px] text-center relative">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-2 right-2 text-red-600 font-bold text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">Select Payment Method</h3>
            <div className="flex justify-center gap-4 mb-4">
              <button
                className={`px-4 py-2 rounded ${
                  paymentMethod === "cash"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setPaymentMethod("cash")}
              >
                Cash
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  paymentMethod === "card"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                Card
              </button>
            </div>
            <button
              onClick={handleProcessPayment}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Process
            </button>
          </div>
        </div>
      )}
    </div>
  );
}