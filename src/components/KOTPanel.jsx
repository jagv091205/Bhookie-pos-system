import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  orderBy,
  limit,
  Timestamp,
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

  const userId = "1234"; // Replace with logged-in user ID

  // Dummy items (replace with actual selection logic)
  const availableItems = [
    { id: "item01", name: "Manchurian Wrap", price: 200 },
    { id: "item02", name: "Veg Burger", price: 150 },
    { id: "item03", name: "Paneer Pizza", price: 250 },
    // Add more items as needed
  ];

  const handleAddItem = (item) => {
    const existing = kotItems.find((i) => i.id === item.id);
    if (existing) {
      const updated = kotItems.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
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
    setDiscount(0); // Set discount logic as needed
    setTotal(subtotal); // Adjust total calculation if discount applies
  };

  useEffect(() => {
    updateTotals();
  }, [kotItems]);

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
  };
  
  const handlePayClick = () => {
    setIsPaymentModalOpen(true);
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

  const handleGenerateKOT = async () => {
    if (!isPaymentProcessed) {
      alert("Please process payment before saving KOT.");
      return;
    }
  
    const newKOTId = await generateKOTId();
    setKotId(newKOTId); // Show KOT ID in UI
  
    const data = {
      kot_id: newKOTId,
      date: Timestamp.now(),
      amount: total,
      user_id: userId,
      item_id: kotItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    };
  
    await setDoc(doc(db, "KOT", newKOTId), data);
    alert("KOT saved!");
  
    // Print KOT in a styled format
    if (typeof window !== 'undefined' && window.document) {
      const printContent = `
        <div style="font-family: Arial, sans-serif; border: 1px solid #000; padding: 10px; width: 200px;">
          <h3 style="text-align: center;">KOT</h3>
          <p><strong>KOT ID:</strong> ${newKOTId}</p>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="border: 1px solid #000; padding: 5px;">Item</th>
                <th style="border: 1px solid #000; padding: 5px;">Quantity</th>
                <th style="border: 1px solid #000; padding: 5px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${kotItems
                .map(
                  (item) =>
                    `<tr>
                      <td style="border: 1px solid #000; padding: 5px;">${item.name}</td>
                      <td style="border: 1px solid #000; padding: 5px;">${item.quantity}</td>
                      <td style="border: 1px solid #000; padding: 5px;">₹${
                        item.quantity * item.price
                      }</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
          <p><strong>Sub Total:</strong> ₹${subTotal}</p>
          <p><strong>Discount:</strong> ₹${discount}</p>
          <p><strong>Tax:</strong> --</p>
          <p><strong>Total:</strong> ₹${total}</p>
        </div>
      `;
  
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      } else {
        alert("Print window was blocked by the browser. Please allow popups and try again.");
      }
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
              <td>{item.name}</td>
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
        onClick={() => alert("Total calculated: ₹" + total)}
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
                  String(parseInt(prev || "0", 10) + 1)
                )
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