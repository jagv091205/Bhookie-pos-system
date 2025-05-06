// import { useState, useEffect } from "react";
// import { db } from "../firebase/config";
// import { where, writeBatch } from "firebase/firestore";
// import { useLocation } from "react-router-dom";
// import { v4 as uuidv4 } from 'uuid';
// import PaymentScreen from "./PaymentScreen";
// import {
//   collection,
//   getDocs,
//   getDoc,
//   setDoc,
//   doc,
//   query,
//   orderBy,
//   limit,
//   Timestamp,
//   addDoc,
//   updateDoc,
// } from "firebase/firestore";

// export default function KOTPanel({ kotItems, setKotItems, setShowCashTab }) {
//   const [subTotal, setSubTotal] = useState(0);
//   const [discount, setDiscount] = useState(0);
//   const [total, setTotal] = useState(0);
//   const [showNumberPad, setShowNumberPad] = useState(false);
//   const [quantityInput, setQuantityInput] = useState("");
//   const [selectedItemIndex, setSelectedItemIndex] = useState(null);
//   const [kotId, setKotId] = useState("");
//   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState("");
//   const [showPaymentScreen, setShowPaymentScreen] = useState(false);
//   const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);
//   const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
//   const [customerId, setCustomerId] = useState("");
//   const [customerPhone, setCustomerPhone] = useState("");
//   const [customerName, setCustomerName] = useState("");
//   const [isNewCustomer, setIsNewCustomer] = useState(false);
//   const [customerPoints, setCustomerPoints] = useState(0);
//   const [customerSearch, setCustomerSearch] = useState("");
//   const [foundCustomers, setFoundCustomers] = useState([]);
//   const [showCancelConfirm, setShowCancelConfirm] = useState(false);
//   const [employeeMealCredits, setEmployeeMealCredits] = useState(0);
//   const [creditsUsed, setCreditsUsed] = useState(0);
//   const [cashDue, setCashDue] = useState(0);
//   const [isEmployee, setIsEmployee] = useState(false);
//   const [orderId, setOrderId] = useState("");
//   const [isOrderStored, setIsOrderStored] = useState(false);
//   const location = useLocation();
//   const userId = "1234";

//   useEffect(() => {
//     if (isPaymentProcessed) {
//       handleGenerateKOT();
//     }
//   }, [isPaymentProcessed]);

//   useEffect(() => {
//     if (location.state?.recalledOrder) {
//       const order = location.state.recalledOrder;
//       setKotItems(order.items);
//       setCustomerId(order.customerId);
//       setCustomerName(order.customerName);
//       setCustomerPhone(order.customerPhone);
//       setIsEmployee(order.isEmployee);
//       setCreditsUsed(order.creditsUsed);
//       setCashDue(order.cashDue);
//       window.history.replaceState({}, document.title);
//     }
//   }, [location.state]);

//   useEffect(() => {
//     if (location.state?.selectedEmployee) {
//       const employee = location.state.selectedEmployee;
//       handleAutoProcessEmployee(employee);
//       window.history.replaceState({}, document.title);
//     }
//   }, [location]);

//   useEffect(() => {
//     if (!isEmployee && !customerId) {
//       setIsCustomerModalOpen(false);
//     }
//   }, [isEmployee, customerId]);

//   useEffect(() => {
//     updateTotals();
//   }, [kotItems]);

//   useEffect(() => {
//     const checkExpiredOrders = async () => {
//       const q = query(
//         collection(db, "pendingOrders"),
//         where("expiresAt", "<", Timestamp.now()),
//         where("status", "==", "pending")
//       );
      
//       const snapshot = await getDocs(q);
//       snapshot.forEach(async (doc) => {
//         await updateDoc(doc.ref, { status: "expired" });
//       });
//     };
  
//     const interval = setInterval(checkExpiredOrders, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const updateInventory = async (kotItems) => {
//     try {
//       const batch = writeBatch(db);
      
//       for (const item of kotItems) {
//         const itemRef = doc(db, "inventory", item.id);
//         const itemSnap = await getDoc(itemRef);

//         if (itemSnap.exists()) {
//           const currentData = itemSnap.data();
//           const newStock = currentData.totalStockOnHand - item.quantity;
          
//           if (newStock < 0) {
//             alert(`Insufficient stock for ${item.name}! Current: ${currentData.totalStockOnHand}, Required: ${item.quantity}`);
//             return false;
//           }
          
//           batch.update(itemRef, {
//             totalStockOnHand: newStock,
//             timestamp: Timestamp.now()
//           });
//         } else {
//           alert(`Item ${item.name} not found in inventory!`);
//           return false;
//         }
//       }
      
//       await batch.commit();
//       return true;
//     } catch (error) {
//       console.error("Error updating inventory:", error);
//       throw error;
//     }
//   };

//   const handleAutoProcessEmployee = async (employee) => {
//     if (orderId) {
//       const confirmRestore = window.confirm("You have a stored order. Load it first?");
//       if (confirmRestore) return;
//     }
    
//     if (!employee.isClockedIn) {
//       alert("Employee must be clocked in to use meal credits!");
//       return;
//     }

//     setCustomerId(employee.EmployeeID);
//     setCustomerName(employee.name);
//     setCustomerPhone(employee.phone);
//     setEmployeeMealCredits(employee.mealCredits);
//     setIsEmployee(true);
//     setIsCustomerModalOpen(false);
//   };

//   const updateTotals = (items = kotItems) => {
//     const subtotal = items.reduce(
//       (sum, item) => sum + item.price * item.quantity,
//       0
//     );
//     setSubTotal(subtotal);
//     const newDiscount = (customerId && !isEmployee && customerPoints >= 2) ? subtotal * 0.1 : 0;
//     setDiscount(newDiscount);
//     setTotal(subtotal - newDiscount);
//   };

//   const openNumberPad = (index) => {
//     setSelectedItemIndex(index);
//     setQuantityInput("");
//     setShowNumberPad(true);
//   };

//   const handleNumberPadInput = (num) => {
//     setQuantityInput((prev) => prev + num);
//   };

//   const clearInput = () => setQuantityInput("");

//   const applyQuantity = () => {
//     const qty = parseInt(quantityInput || "1", 10);
//     if (isNaN(qty) || qty <= 0) return;
//     const updated = [...kotItems];
//     updated[selectedItemIndex].quantity = qty;
//     setKotItems(updated);
//     setShowNumberPad(false);
//     updateTotals(updated);
//   };

//   const handleRemoveItem = (index) => {
//     const updated = kotItems.filter((_, i) => i !== index);
//     setKotItems(updated);
//     updateTotals(updated);
//   };

//   const clearItems = () => {
//     setKotItems([]);
//     updateTotals([]);
//     setKotId("");
//     setIsPaymentProcessed(false);
//     setPaymentMethod("");
//     setCustomerId("");
//     setCustomerPhone("");
//     setCustomerName("");
//     setEmployeeMealCredits(0);
//     setCreditsUsed(0);
//     setCashDue(0);
//     setIsEmployee(false);
//     setDiscount(0);
//     setOrderId("");
//     setIsOrderStored(false);
//   };

//   const handlePayClick = () => {
//     if (kotItems.length === 0) {
//       alert("Please add items before payment");
//       return;
//     }
//     if (isEmployee) {
//       setIsPaymentModalOpen(true);
//     } else {
//       setIsCustomerModalOpen(true);
//     }
//   };

//   const generateKOTId = async (dateObj) => {
//     const dbDate = new Date(dateObj);
//     dbDate.setHours(0, 0, 0, 0);
//     const startTimestamp = Timestamp.fromDate(dbDate);

//     const endDate = new Date(dbDate);
//     endDate.setDate(endDate.getDate() + 1);
//     const endTimestamp = Timestamp.fromDate(endDate);

//     const kotQuery = query(
//       collection(db, "KOT"),
//       where("date", ">=", startTimestamp),
//       where("date", "<", endTimestamp)
//     );

//     const snapshot = await getDocs(kotQuery);
//     const number = snapshot.size + 1;

//     const prefix = `${String(dateObj.getDate()).padStart(2, "0")}${String(
//       dateObj.getMonth() + 1
//     ).padStart(2, "0")}${String(dateObj.getFullYear()).slice(-2)}`;

//     return `${prefix}${String(number).padStart(3, "0")}`;
//   };

//   const generateCustomerId = async () => {
//     const customersQuery = query(
//       collection(db, "customers"),
//       orderBy("customerID", "desc"),
//       limit(1)
//     );
//     const snapshot = await getDocs(customersQuery);
//     let number = 1;
//     if (!snapshot.empty) {
//       const lastId = snapshot.docs[0].data().customerID;
//       const lastNum = parseInt(lastId.replace("cus", "")) || 0;
//       number = lastNum + 1;
//     }
//     return `cus${String(number).padStart(2, "0")}`;
//   };

//   const checkEmployeeClockInStatus = async (employeeId) => {
//     try {
//       const today = new Date();
//       const monthDocId = `${today.getFullYear()}-${String(
//         today.getMonth() + 1
//       ).padStart(2, "0")}`;
//       const dayKey = String(today.getDate()).padStart(2, "0");
//       const attendanceRef = doc(
//         db,
//         "Employees",
//         employeeId,
//         "attendance",
//         monthDocId
//       );
//       const attendanceSnap = await getDoc(attendanceRef);

//       return (
//         attendanceSnap.exists() &&
//         attendanceSnap.data().days?.[dayKey]?.isClockedIn === true
//       );
//     } catch (error) {
//       console.error("Error checking clock-in status:", error);
//       return false;
//     }
//   };

//   const handleStoreOrder = async () => {
//     if (kotItems.length === 0) {
//       alert("Please add items before storing order");
//       return;
//     }
  
//     try {
//       const orderId = uuidv4();
//       const orderData = {
//         orderId,
//         items: kotItems,
//         subTotal,
//         discount,
//         total,
//         customerId: isEmployee ? customerId : null,
//         employeeId: isEmployee ? customerId : null,
//         customerName,
//         customerPhone,
//         isEmployee,
//         employeeMealCredits,
//         creditsUsed,
//         cashDue,
//         createdAt: Timestamp.now(),
//         expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)),
//         status: "pending"
//       };
  
//       await setDoc(doc(db, "pendingOrders", orderId), orderData);
//       setOrderId(orderId);
//       setIsOrderStored(true);
//       alert(`Order stored successfully! ID: ${orderId}`);
//     } catch (error) {
//       console.error("Error storing order:", error);
//       alert("Failed to store order");
//     }
//   };

//   const searchCustomer = async () => {
//     if (!customerSearch) return;

//     try {
//       const customersRef = collection(db, "customers");
//       const empRef = collection(db, "Employees");

//       const [customerPhoneSnap, customerIdSnap, empPhoneSnap, empIdSnap] =
//         await Promise.all([
//           getDocs(query(customersRef, where("phone", "==", customerSearch))),
//           getDocs(query(customersRef, where("customerID", "==", customerSearch))),
//           getDocs(query(empRef, where("phone", "==", customerSearch))),
//           getDocs(query(empRef, where("EmployeeID", "==", customerSearch))),
//         ]);

//       const results = [];

//       customerPhoneSnap.forEach((doc) =>
//         results.push({ ...doc.data(), isEmployee: false })
//       );
//       customerIdSnap.forEach((doc) =>
//         results.push({ ...doc.data(), isEmployee: false })
//       );

//       empPhoneSnap.forEach((doc) =>
//         results.push({
//           ...doc.data(),
//           isEmployee: true,
//           EmployeeID: doc.id,
//         })
//       );
//       empIdSnap.forEach((doc) =>
//         results.push({
//           ...doc.data(),
//           isEmployee: true,
//           EmployeeID: doc.id,
//         })
//       );

//       const uniqueResults = Array.from(
//         new Set(results.map((r) => r.phone || r.EmployeeID))
//       ).map((id) => results.find((r) => (r.phone || r.EmployeeID) === id));

//       const finalResults = await Promise.all(
//         uniqueResults.map(async (result) => {
//           if (result.isEmployee) {
//             const isClockedIn = await checkEmployeeClockInStatus(
//               result.EmployeeID
//             );
//             return { ...result, isClockedIn };
//           }
//           return result;
//         })
//       );

//       setFoundCustomers(finalResults);
//     } catch (error) {
//       console.error("Error searching customer:", error);
//       alert("Error searching customer");
//     }
//   };

//   const handleSelectCustomer = async (customer) => {
//     if (customer.isEmployee) {
//       const isClockedIn = await checkEmployeeClockInStatus(customer.EmployeeID);
//       if (isClockedIn) {
//         alert("Clocked-in employees cannot use loyalty program!");
//         return;
//       }

//       try {
//         const mealRef = doc(db, "Employees", customer.EmployeeID, "meal", "1");
//         const mealSnap = await getDoc(mealRef);
//         const mealData = mealSnap.exists()
//           ? mealSnap.data()
//           : { mealCredits: 0 };

//         setEmployeeMealCredits(mealData.mealCredits || 0);
//         setIsEmployee(true);
//       } catch (error) {
//         console.error("Error fetching meal credits:", error);
//         alert("Error loading employee meal credits");
//         return;
//       }
//     } else {
//       setIsEmployee(false);
//     }

//     setCustomerId(customer.customerID || customer.EmployeeID);
//     setCustomerPhone(customer.phone);
//     setCustomerName(customer.name);
//     setCustomerPoints(customer.points || 0);
//     setIsCustomerModalOpen(false);
//     setIsPaymentModalOpen(true);

//     if (customer.points >= 2) {
//       const discountAmount = subTotal * 0.1;
//       setDiscount(discountAmount);
//       setTotal(subTotal - discountAmount);
//     }
//   };

//   const createNewCustomer = async () => {
//     if (!customerPhone || !customerName) {
//       alert("Please enter phone number and name");
//       return;
//     }

//     try {
//       const newCustomerId = await generateCustomerId();
//       const customerData = {
//         customerID: newCustomerId,
//         name: customerName,
//         phone: customerPhone,
//         points: 0,
//         createdAt: Timestamp.now(),
//         updatedAt: Timestamp.now(),
//       };

//       await setDoc(doc(db, "customers", customerPhone), customerData);

//       setCustomerId(newCustomerId);
//       setCustomerPhone(customerPhone);
//       setCustomerName(customerName);
//       setCustomerPoints(0);
//       setIsCustomerModalOpen(false);
//       setIsPaymentModalOpen(true);
//       setIsNewCustomer(false);
//     } catch (error) {
//       console.error("Error creating customer:", error);
//       alert("Error creating customer");
//     }
//   };

//   const handleGenerateKOT = async () => {
//     if (!isPaymentProcessed) {
//       alert("Please process payment before saving KOT.");
//       return;
//     }

//     try {
//       // First update inventory
//       const inventoryUpdated = await updateInventory(kotItems);
//       if (!inventoryUpdated) return;

//       // Generate KOT document
//       const now = new Date();
//       const newKOTId = await generateKOTId(now);
//       setKotId(newKOTId);

//       const earnedPoints = Math.floor(total * 0.1);

//       const data = {
//         kot_id: newKOTId,
//         date: Timestamp.fromDate(now),
//         amount: total,
//         customerID: customerId || null,
//         earnedPoints: isEmployee ? 0 : customerId ? earnedPoints : 0,
//         creditsUsed: isEmployee ? creditsUsed : 0,
//         cashPaid: isEmployee ? cashDue : total,
//         items: kotItems.map((item) => ({
//           id: item.id,
//           name: item.name,
//           quantity: item.quantity,
//           price: item.price,
//         })),
//         inventoryUpdated: true
//       };

//       await setDoc(doc(db, "KOT", newKOTId), data);

//       // Update customer points if applicable
//       if (customerId && !isEmployee) {
//         try {
//           const customerDoc = customerPhone
//             ? doc(db, "customers", customerPhone)
//             : doc(db, "customers", customerId);

//           await setDoc(
//             customerDoc,
//             {
//               points: customerPoints + earnedPoints,
//               updatedAt: Timestamp.now(),
//             },
//             { merge: true }
//           );

//           await addDoc(collection(db, "loyaltyHistory"), {
//             customerID: customerId,
//             type: "earn",
//             points: earnedPoints,
//             orderID: newKOTId,
//             date: Timestamp.now(),
//           });
//         } catch (error) {
//           console.error("Error updating customer points:", error);
//         }
//       }

//       // Print KOT receipt
//       const printContent = `
//         <div style="font-family: Arial, sans-serif; border: 1px solid #000; padding: 10px; width: 200px;">
//           <h3 style="text-align: center;">KOT</h3>
//           <p><strong>KOT ID:</strong> ${newKOTId}</p>
//           ${customerId ? `<p><strong>${isEmployee ? "Employee" : "Customer"}:</strong> ${customerName} (${customerId})</p>` : ""}
//           ${isEmployee ? `<p><strong>Meal Credits Used:</strong> £${creditsUsed}</p>` : ""}
//           ${isEmployee && cashDue > 0 ? `<p><strong>Cash Paid:</strong> £${cashDue}</p>` : ""}
          
//           <table style="width: 100%; border-collapse: collapse;">
//             <thead>
//               <tr>
//                 <th style="border: 1px solid #000; padding: 4px;">Item</th>
//                 <th style="border: 1px solid #000; padding: 4px;">Qty</th>
//                 <th style="border: 1px solid #000; padding: 4px;">Price</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${kotItems.map(item => `
//                 <tr>
//                   <td style="border: 1px solid #000; padding: 5px;">
//                     ${item.name}
//                     ${item.sauces?.length > 0 ? `<div style="font-size: 10px; color: #555;">${item.sauces.join(", ")}</div>` : ""}
//                   </td>
//                   <td style="border: 1px solid #000; padding: 5px;">${item.quantity}</td>
//                   <td style="border: 1px solid #000; padding: 5px;">£${item.quantity * item.price}</td>
//                 </tr>`
//               ).join("")}
//             </tbody>
//           </table>
          
//           <p><strong>Sub Total:</strong> £${subTotal}</p>
//           <p><strong>Discount:</strong> £${discount}</p>
//           <p><strong>Total:</strong> £${total}</p>
//           ${customerPoints >= 2 && !isEmployee ? `<p style="color: green;">10% discount applied (Points: ${customerPoints})</p>` : ""}
//           ${customerId && !isEmployee ? `<p><strong>Earned Points:</strong> ${earnedPoints}</p>` : ""}
//           <p style="font-size: 10px; text-align: center; margin-top: 10px;">${new Date().toLocaleString()}</p>
//         </div>
//       `;

//       const printWindow = window.open("", "_blank");
//       if (printWindow) {
//         printWindow.document.open();
//         printWindow.document.write(printContent);
//         printWindow.document.close();
//         setTimeout(() => {
//           printWindow.print();
//           printWindow.close();
//         }, 200);
//       }

//       clearItems();
//     } catch (error) {
//       console.error("Error in KOT generation:", error);
//       alert("Failed to complete order. Please try again.");
//     }
//   };

//   const handleProcessPayment = async () => {
//     if (!paymentMethod && !isEmployee) {
//       alert("Please select a payment method.");
//       return;
//     }

//     if (isEmployee) {
//       const creditsToUse = Math.min(employeeMealCredits, total);
//       const remainingCash = Math.max(total - creditsToUse, 0);

//       try {
//         const mealRef = doc(db, "Employees", customerId, "meal", "1");
//         await updateDoc(mealRef, {
//           mealCredits: employeeMealCredits - creditsToUse,
//         });

//         setCreditsUsed(creditsToUse);
//         setCashDue(remainingCash);

//         if (remainingCash > 0) {
//           alert(`Employee must pay £${remainingCash.toFixed(2)} in cash`);
//         }
//       } catch (error) {
//         console.error("Error updating meal credits:", error);
//         alert("Error processing meal credits");
//         return;
//       }
//     }

//     if (paymentMethod === "cash" && !isEmployee) {
//       try {
//         const q = query(
//           collection(db, "cashSessions"),
//           where("isClosed", "==", false)
//         );
//         const snapshot = await getDocs(q);

//         if (!snapshot.empty) {
//           const sessionDoc = snapshot.docs[0];
//           const sessionRef = doc(db, "cashSessions", sessionDoc.id);
//           const sessionData = sessionDoc.data();

//           if (sessionData.isPaused) {
//             alert(
//               "Cash session is paused. Please ask the manager to reopen the cashier."
//             );
//             return;
//           }

//           const totalAmount = subTotal - discount;
//           const orderNote = kotId ? `Sale KOT #${kotId}` : "Sale";

//           const newTransaction = {
//             type: "in",
//             amount: totalAmount,
//             by: "John",
//             time: Timestamp.now(),
//             note: orderNote,
//           };

//           const updatedTransactions = [
//             ...(sessionData.transactions || []),
//             newTransaction,
//           ];
//           await updateDoc(sessionRef, { transactions: updatedTransactions });
//           console.log("Cash transaction recorded.");
//         } else {
//           console.warn("No active cash session found.");
//           alert(
//             "No active cash session found. Start session before accepting cash."
//           );
//           return;
//         }
//       } catch (error) {
//         console.error("Failed to log cash transaction:", error);
//       }
//     }

//     setIsPaymentProcessed(true);
//     setIsPaymentModalOpen(false);
//   };

//   return (
//     <div className="p-4 w-full max-w-md mx-auto">
//       <h2 className="text-2xl font-bold mb-4">ORDER</h2>

//       {kotId && (
//         <div className="mb-4 text-base font-semibold text-indigo-700 border border-indigo-300 rounded p-2 bg-indigo-50">
//           KOT ID: <span className="font-mono">{kotId}</span>
//         </div>
//       )}

//       {customerId && (
//         <div className="mb-4 text-base font-semibold text-green-700 border border-green-300 rounded p-2 bg-green-50">
//           {isEmployee ? (
//             <>
//               Employee: {customerName} ({customerId})
//               <p>Meal Credits: £{employeeMealCredits}</p>
//               {creditsUsed > 0 && <p>Credits Used: £{creditsUsed}</p>}
//               {cashDue > 0 && <p>Cash Due: £{cashDue}</p>}
//             </>
//           ) : (
//             <>
//               Customer: {customerName} ({customerId}) - Points: {customerPoints}
//               {customerPoints >= 2 && (
//                 <p className="text-green-600">10% discount applied</p>
//               )}
//             </>
//           )}
//         </div>
//       )}

//       <div className="border p-4 rounded mb-4 bg-white">
//         <table className="w-full text-left mb-4">
//           <thead>
//             <tr>
//               <th>ITEM</th>
//               <th>QUANTITY</th>
//               <th>PRICE</th>
//               <th></th>
//             </tr>
//           </thead>
//           <tbody>
//             {kotItems.map((item, index) => (
//               <tr key={index}>
//                 <td>
//                   {item.name}
//                   {item.sauces?.length > 0 && (
//                     <div className="text-sm text-gray-500">
//                       {item.sauces.join(", ")}
//                     </div>
//                   )}
//                 </td>
//                 <td>
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => {
//                         const updated = [...kotItems];
//                         updated[index].quantity = Math.max(
//                           updated[index].quantity - 1,
//                           1
//                         );
//                         setKotItems(updated);
//                         updateTotals(updated);
//                       }}
//                       className="bg-gray-300 text-xl w-6 h-6 rounded-full flex items-center justify-center"
//                     >
//                       -
//                     </button>
//                     <button
//                       onClick={() => openNumberPad(index)}
//                       className="bg-gray-100 text-xl w-6 h-6 rounded-full flex items-center justify-center"
//                     >
//                       {item.quantity}
//                     </button>
//                     <button
//                       onClick={() => {
//                         const updated = [...kotItems];
//                         updated[index].quantity += 1;
//                         setKotItems(updated);
//                         updateTotals(updated);
//                       }}
//                       className="bg-gray-300 text-xl w-6 h-6 rounded-full flex items-center justify-center"
//                     >
//                       +
//                     </button>
//                   </div>
//                 </td>
//                 <td>£{item.quantity * item.price}</td>
//                 <td>
//                   <button
//                     onClick={() => handleRemoveItem(index)}
//                     className="text-red-600"
//                   >
//                     ❌
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div>
//           <p>Sub Total: £{subTotal}</p>
//           <p>Discount: £{discount}</p>
//           <p className="font-bold text-lg">Total: £{total}</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-2 mb-4">
//         <button
//           onClick={handlePayClick}
//           className="bg-blue-600 text-white p-2 rounded"
//         >
//           PAY
//         </button>

//         <button
//           onClick={() => setShowCancelConfirm(true)}
//           className="bg-red-600 text-white p-2 rounded"
//         >
//           CANCEL
//         </button>

//         <button
//           onClick={handleStoreOrder}
//           className="bg-yellow-600 text-white p-2 rounded"
//           disabled={kotItems.length === 0}
//         >
//           STORE
//         </button>

//         <button
//           onClick={() => setShowCashTab(true)}
//           className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
//         >
//           CASH SESSION
//         </button>
//       </div>

//       {showNumberPad && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded shadow-lg w-[300px] relative">
//             <button
//               onClick={() => setShowNumberPad(false)}
//               className="absolute top-2 right-2 text-red-600 font-bold text-xl"
//             >
//               ✕
//             </button>

//             <div className="text-xl font-semibold mb-2 text-center">
//               Enter Quantity
//             </div>

//             <div className="flex items-center justify-center gap-4 mb-4">
//               <button
//                 onClick={() =>
//                   setQuantityInput((prev) =>
//                     String(Math.max(parseInt(prev || "0", 10) - 1, 1))
//                   )
//                 }
//                 className="bg-gray-300 text-xl w-10 h-10 rounded-full"
//               >
//                 -
//               </button>
//               <div className="text-3xl text-center border p-2 px-6 bg-gray-100 rounded">
//                 {quantityInput || "0"}
//               </div>
//               <button
//                 onClick={() =>
//                   setQuantityInput((prev) =>
//                     String(parseInt(prev || "0", 10) + 1)
//                   )
//                 }
//                 className="bg-gray-300 text-xl w-10 h-10 rounded-full"
//               >
//                 +
//               </button>
//             </div>

//             <div className="grid grid-cols-3 gap-2 mb-4">
//               {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
//                 <button
//                   key={num}
//                   onClick={() => handleNumberPadInput(String(num))}
//                   className="bg-gray-200 text-2xl p-4 rounded"
//                 >
//                   {num}
//                 </button>
//               ))}
//               <button
//                 onClick={clearInput}
//                 className="bg-yellow-400 col-span-1 p-2 rounded"
//               >
//                 Clear
//               </button>
//               <button
//                 onClick={applyQuantity}
//                 className="bg-green-600 text-white col-span-2 p-2 rounded"
//               >
//                 Apply
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showCancelConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded shadow-lg text-center space-y-4">
//             <p className="text-lg font-semibold">
//               Do you really want to cancel the order?
//             </p>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={() => {
//                   clearItems();
//                   setShowCancelConfirm(false);
//                 }}
//                 className="bg-red-600 text-white px-4 py-2 rounded"
//               >
//                 Yes
//               </button>
//               <button
//                 onClick={() => setShowCancelConfirm(false)}
//                 className="bg-gray-300 text-black px-4 py-2 rounded"
//               >
//                 No
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isCustomerModalOpen && !isEmployee && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded shadow-lg w-[400px] text-center relative">
//             <button
//               onClick={() => setIsCustomerModalOpen(false)}
//               className="absolute top-2 right-2 text-red-600 font-bold text-xl"
//             >
//               ✕
//             </button>
//             <h3 className="text-xl font-bold mb-4">Customer Loyalty Program</h3>

//             <div className="mb-4">
//               <p className="mb-2">Enter Customer ID or Phone Number (Optional):</p>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={customerSearch}
//                   onChange={(e) => setCustomerSearch(e.target.value)}
//                   placeholder="Customer ID or Phone"
//                   className="border p-2 flex-1 rounded"
//                 />
//                 <button
//                   onClick={searchCustomer}
//                   className="bg-blue-600 text-white px-4 py-2 rounded"
//                 >
//                   Search
//                 </button>
//               </div>
//             </div>

//             {foundCustomers.map((customer) => {
//               const isEmployee = customer.isEmployee;
//               const identifier = isEmployee
//                 ? customer.EmployeeID
//                 : customer.customerID;
//               const type = isEmployee ? "Employee" : "Customer";

//               return (
//                 <div
//                   key={identifier}
//                   className="p-2 border-b hover:bg-gray-100 cursor-pointer"
//                   onClick={() => handleSelectCustomer(customer)}
//                 >
//                   <div className="font-medium">
//                     {customer.name} ({type})
//                   </div>
//                   {isEmployee && customer.isClockedIn && (
//                     <div className="text-red-600 text-sm">
//                       ⛔ Currently clocked in
//                     </div>
//                   )}
//                   {customer.points >= 2 &&
//                     !(isEmployee && customer.isClockedIn) && (
//                       <div className="text-green-600 text-sm">
//                         ✓ Eligible for 10% discount (Points: {customer.points})
//                       </div>
//                     )}
//                 </div>
//               );
//             })}

//             <div className="flex gap-2 justify-center mt-4">
//               <button
//                 onClick={() => {
//                   setIsCustomerModalOpen(false);
//                   setIsPaymentModalOpen(true);
//                 }}
//                 className="bg-gray-500 text-white px-4 py-2 rounded"
//               >
//                 Skip Loyalty
//               </button>
//               <button
//                 onClick={() => setIsNewCustomer(true)}
//                 className="bg-green-600 text-white px-4 py-2 rounded"
//               >
//                 New Customer
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isPaymentModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded shadow-lg w-[300px] text-center relative">
//             <button
//               onClick={() => setIsPaymentModalOpen(false)}
//               className="absolute top-2 right-2 text-red-600 font-bold text-xl"
//             >
//               ✕
//             </button>
//             <h3 className="text-xl font-bold mb-4">
//               {isEmployee ? "Employee Payment" : "Select Payment Method"}
//             </h3>
//             {isEmployee ? (
//               <div>
//                 <p className="mb-4">Meal Credits: £{employeeMealCredits}</p>
//                 <p className="mb-4">Total: £{total}</p>
//                 <button
//                   onClick={handleProcessPayment}
//                   className="bg-blue-600 text-white px-6 py-2 rounded"
//                 >
//                   Process with Meal Credits
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <div className="flex justify-center gap-4 mb-4">
//                   <button
//                     className={`px-4 py-2 rounded ${
//                       paymentMethod === "cash"
//                         ? "bg-green-600 text-white"
//                         : "bg-gray-200"
//                     }`}
//                     onClick={() => setPaymentMethod("cash")}
//                   >
//                     Cash
//                   </button>
//                   <button
//                     className={`px-4 py-2 rounded ${
//                       paymentMethod === "card"
//                         ? "bg-green-600 text-white"
//                         : "bg-gray-200"
//                     }`}
//                     onClick={() => setPaymentMethod("card")}
//                   >
//                     Card
//                   </button>
//                 </div>
//                 <button
//                   onClick={handleProcessPayment}
//                   className="bg-blue-600 text-white px-6 py-2 rounded"
//                 >
//                   Process
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {showPaymentScreen && (
//         <PaymentScreen 
//           amount={total}
//           onComplete={(success) => {
//             setShowPaymentScreen(false);
//             if (success) {
//               setIsPaymentProcessed(true);
//             }
//           }}
//           onClose={() => setShowPaymentScreen(false)}
//         />
//       )}
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { where, writeBatch } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import PaymentScreen from "./PaymentScreen";
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  query,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  updateDoc,
} from "firebase/firestore";

export default function KOTPanel({ kotItems, setKotItems, setShowCashTab }) {
  const [subTotal, setSubTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [quantityInput, setQuantityInput] = useState("");
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [kotId, setKotId] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [isPaymentProcessed, setIsPaymentProcessed] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerPoints, setCustomerPoints] = useState(0);
  const [customerSearch, setCustomerSearch] = useState("");
  const [foundCustomers, setFoundCustomers] = useState([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [employeeMealCredits, setEmployeeMealCredits] = useState(0);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [cashDue, setCashDue] = useState(0);
  const [isEmployee, setIsEmployee] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isOrderStored, setIsOrderStored] = useState(false);
  const location = useLocation();
  const userId = "1234";

  useEffect(() => {
    if (isPaymentProcessed) {
      handleGenerateKOT();
    }
  }, [isPaymentProcessed]);

  useEffect(() => {
    if (location.state?.recalledOrder) {
      const order = location.state.recalledOrder;
      console.log("Recalled order data:", order);
      setKotItems(order.items);
      setCustomerId(order.customerId);
      setCustomerName(order.customerName);
      setCustomerPhone(order.customerPhone);
      setIsEmployee(order.isEmployee);
      setCreditsUsed(order.creditsUsed);
      setCashDue(order.cashDue);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.selectedEmployee) {
      const employee = location.state.selectedEmployee;
      handleAutoProcessEmployee(employee);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (!isEmployee && !customerId) {
      setIsCustomerModalOpen(false);
    }
  }, [isEmployee, customerId]);

  useEffect(() => {
    updateTotals();
  }, [kotItems]);

  useEffect(() => {
    const checkExpiredOrders = async () => {
      const q = query(
        collection(db, "pendingOrders"),
        where("expiresAt", "<", Timestamp.now()),
        where("status", "==", "pending")
      );

      const snapshot = await getDocs(q);
      snapshot.forEach(async (doc) => {
        console.log(`Marking order ${doc.id} as expired`);
        await updateDoc(doc.ref, { status: "expired" });
      });
    };

    const interval = setInterval(checkExpiredOrders, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateInventory = async (kotItems) => {
    try {
      const batch = writeBatch(db);

      for (const item of kotItems) {
        const itemRef = doc(db, "inventory", item.id);
        const itemSnap = await getDoc(itemRef);

        if (itemSnap.exists()) {
          const currentData = itemSnap.data();
          const newStock = currentData.totalStockOnHand - item.quantity;

          if (newStock < 0) {
            alert(`Insufficient stock for ${item.name}! Current: ${currentData.totalStockOnHand}, Required: ${item.quantity}`);
            return false;
          }

          batch.update(itemRef, {
            totalStockOnHand: newStock,
            timestamp: Timestamp.now()
          });
        } else {
          alert(`Item ${item.name} not found in inventory!`);
          return false;
        }
      }

      await batch.commit();
      return true;
    } catch (error) {
      console.error("Error updating inventory:", error);
      throw error;
    }
  };

  const handleAutoProcessEmployee = async (employee) => {
    if (orderId) {
      const confirmRestore = window.confirm("You have a stored order. Load it first?");
      if (confirmRestore) return;
    }

    if (!employee.isClockedIn) {
      alert("Employee must be clocked in to use meal credits!");
      return;
    }

    setCustomerId(employee.EmployeeID);
    setCustomerName(employee.name);
    setCustomerPhone(employee.phone);
    setEmployeeMealCredits(employee.mealCredits);
    setIsEmployee(true);
    setIsCustomerModalOpen(false);
  };

  const updateTotals = (items = kotItems) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setSubTotal(subtotal);
    const newDiscount = (customerId && !isEmployee && customerPoints >= 2) ? subtotal * 0.1 : 0;
    setDiscount(newDiscount);
    setTotal(subtotal - newDiscount);
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
    setEmployeeMealCredits(0);
    setCreditsUsed(0);
    setCashDue(0);
    setIsEmployee(false);
    setDiscount(0);
    setOrderId("");
    setIsOrderStored(false);
  };

  const handlePayClick = () => {
    if (kotItems.length === 0) {
      alert("Please add items before payment");
      return;
    }
    if (isEmployee) {
      setIsPaymentModalOpen(true);
    } else {
      setIsCustomerModalOpen(true);
    }
  };

  const generateKOTId = async (dateObj) => {
    const dbDate = new Date(dateObj);
    dbDate.setHours(0, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(dbDate);

    const endDate = new Date(dbDate);
    endDate.setDate(endDate.getDate() + 1);
    const endTimestamp = Timestamp.fromDate(endDate);

    const kotQuery = query(
      collection(db, "KOT"),
      where("date", ">=", startTimestamp),
      where("date", "<", endTimestamp)
    );

    const snapshot = await getDocs(kotQuery);
    const number = snapshot.size + 1;

    const prefix = `${String(dateObj.getDate()).padStart(2, "0")}${String(
      dateObj.getMonth() + 1
    ).padStart(2, "0")}${String(dateObj.getFullYear()).slice(-2)}`;

    return `${prefix}${String(number).padStart(3, "0")}`;
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

  const checkEmployeeClockInStatus = async (employeeId) => {
    try {
      const today = new Date();
      const monthDocId = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}`;
      const dayKey = String(today.getDate()).padStart(2, "0");
      const attendanceRef = doc(
        db,
        "Employees",
        employeeId,
        "attendance",
        monthDocId
      );
      const attendanceSnap = await getDoc(attendanceRef);

      return (
        attendanceSnap.exists() &&
        attendanceSnap.data().days?.[dayKey]?.isClockedIn === true
      );
    } catch (error) {
      console.error("Error checking clock-in status:", error);
      return false;
    }
  };

  const handleStoreOrder = async () => {
    if (kotItems.length === 0) {
      alert("Please add items before storing order");
      return;
    }

    try {
      const orderId = uuidv4();
      const orderData = {
        orderId,
        items: kotItems,
        subTotal,
        discount,
        total,
        customerId: isEmployee ? customerId : null,
        employeeId: isEmployee ? customerId : null,
        customerName,
        customerPhone,
        isEmployee,
        employeeMealCredits,
        creditsUsed,
        cashDue,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)),
        status: "pending"
      };

      await setDoc(doc(db, "pendingOrders", orderId), orderData);
      setOrderId(orderId);
      setIsOrderStored(true);
      alert(`Order stored successfully! ID: ${orderId}`);
    } catch (error) {
      console.error("Error storing order:", error);
      alert("Failed to store order");
    }
  };

  const searchCustomer = async () => {
    if (!customerSearch) return;

    try {
      const customersRef = collection(db, "customers");
      const empRef = collection(db, "Employees");

      const [customerPhoneSnap, customerIdSnap, empPhoneSnap, empIdSnap] =
        await Promise.all([
          getDocs(query(customersRef, where("phone", "==", customerSearch))),
          getDocs(query(customersRef, where("customerID", "==", customerSearch))),
          getDocs(query(empRef, where("phone", "==", customerSearch))),
          getDocs(query(empRef, where("EmployeeID", "==", customerSearch))),
        ]);

      const results = [];

      customerPhoneSnap.forEach((doc) =>
        results.push({ ...doc.data(), isEmployee: false })
      );
      customerIdSnap.forEach((doc) =>
        results.push({ ...doc.data(), isEmployee: false })
      );

      empPhoneSnap.forEach((doc) =>
        results.push({
          ...doc.data(),
          isEmployee: true,
          EmployeeID: doc.id,
        })
      );
      empIdSnap.forEach((doc) =>
        results.push({
          ...doc.data(),
          isEmployee: true,
          EmployeeID: doc.id,
        })
      );

      const uniqueResults = Array.from(
        new Set(results.map((r) => r.phone || r.EmployeeID))
      ).map((id) => results.find((r) => (r.phone || r.EmployeeID) === id));

      const finalResults = await Promise.all(
        uniqueResults.map(async (result) => {
          if (result.isEmployee) {
            const isClockedIn = await checkEmployeeClockInStatus(
              result.EmployeeID
            );
            return { ...result, isClockedIn };
          }
          return result;
        })
      );

      setFoundCustomers(finalResults);
    } catch (error) {
      console.error("Error searching customer:", error);
      alert("Error searching customer");
    }
  };

  const handleSelectCustomer = async (customer) => {
    if (customer.isEmployee) {
      const isClockedIn = await checkEmployeeClockInStatus(customer.EmployeeID);
      if (isClockedIn) {
        alert("Clocked-in employees cannot use loyalty program!");
        return;
      }

      try {
        const mealRef = doc(db, "Employees", customer.EmployeeID, "meal", "1");
        const mealSnap = await getDoc(mealRef);
        const mealData = mealSnap.exists()
          ? mealSnap.data()
          : { mealCredits: 0 };

        setEmployeeMealCredits(mealData.mealCredits || 0);
        setIsEmployee(true);
      } catch (error) {
        console.error("Error fetching meal credits:", error);
        alert("Error loading employee meal credits");
        return;
      }
    } else {
      setIsEmployee(false);
    }

    setCustomerId(customer.customerID || customer.EmployeeID);
    setCustomerPhone(customer.phone);
    setCustomerName(customer.name);
    setCustomerPoints(customer.points || 0);
    setIsCustomerModalOpen(false);
    setIsPaymentModalOpen(true);

    if (customer.points >= 2) {
      const discountAmount = subTotal * 0.1;
      setDiscount(discountAmount);
      setTotal(subTotal - discountAmount);
    }
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
        updatedAt: Timestamp.now(),
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

    try {
      // First update inventory
      const inventoryUpdated = await updateInventory(kotItems);
      if (!inventoryUpdated) return;

      // Generate KOT document
      const now = new Date();
      const newKOTId = await generateKOTId(now);
      setKotId(newKOTId);

      const earnedPoints = Math.floor(total * 0.1);

      const data = {
        kot_id: newKOTId,
        date: Timestamp.fromDate(now),
        amount: total,
        customerID: customerId || null,
        earnedPoints: isEmployee ? 0 : customerId ? earnedPoints : 0,
        creditsUsed: isEmployee ? creditsUsed : 0,
        cashPaid: isEmployee ? cashDue : total,
        items: kotItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        inventoryUpdated: true
      };

      await setDoc(doc(db, "KOT", newKOTId), data);

      // Update customer points if applicable
      if (customerId && !isEmployee) {
        try {
          const customerDoc = customerPhone
            ? doc(db, "customers", customerPhone)
            : doc(db, "customers", customerId);

          await setDoc(
            customerDoc,
            {
              points: customerPoints + earnedPoints,
              updatedAt: Timestamp.now(),
            },
            { merge: true }
          );

          await addDoc(collection(db, "loyaltyHistory"), {
            customerID: customerId,
            type: "earn",
            points: earnedPoints,
            orderID: newKOTId,
            date: Timestamp.now(),
          });
        } catch (error) {
          console.error("Error updating customer points:", error);
        }
      }

      // Print KOT receipt
      const printContent = `
        <div style="font-family: Arial, sans-serif; border: 1px solid #000; padding: 10px; width: 200px;">
          <h3 style="text-align: center;">KOT</h3>
          <p><strong>KOT ID:</strong> ${newKOTId}</p>
          ${customerId ? `<p><strong>${isEmployee ? "Employee" : "Customer"}:</strong> ${customerName} (${customerId})</p>` : ""}
          ${isEmployee ? `<p><strong>Meal Credits Used:</strong> £${creditsUsed}</p>` : ""}
          ${isEmployee && cashDue > 0 ? `<p><strong>Cash Paid:</strong> £${cashDue}</p>` : ""}

          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="border: 1px solid #000; padding: 4px;">Item</th>
                <th style="border: 1px solid #000; padding: 4px;">Qty</th>
                <th style="border: 1px solid #000; padding: 4px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${kotItems.map(item => `
                <tr>
                  <td style="border: 1px solid #000; padding: 5px;">
                    ${item.name}
                    ${item.sauces?.length > 0 ? `<div style="font-size: 10px; color: #555;">${item.sauces.join(", ")}</div>` : ""}
                  </td>
                  <td style="border: 1px solid #000; padding: 5px;">${item.quantity}</td>
                  <td style="border: 1px solid #000; padding: 5px;">£${item.quantity * item.price}</td>
                </tr>`
              ).join("")}
            </tbody>
          </table>

          <p><strong>Sub Total:</strong> £${subTotal}</p>
          <p><strong>Discount:</strong> £${discount}</p>
          <p><strong>Total:</strong> £${total}</p>
          ${customerPoints >= 2 && !isEmployee ? `<p style="color: green;">10% discount applied (Points: ${customerPoints})</p>` : ""}
          ${customerId && !isEmployee ? `<p><strong>Earned Points:</strong> ${earnedPoints}</p>` : ""}
          <p style="font-size: 10px; text-align: center; margin-top: 10px;">${new Date().toLocaleString()}</p>
        </div>
      `;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 200);
      }

      clearItems();
    } catch (error) {
      console.error("Error in KOT generation:", error);
      alert("Failed to complete order. Please try again.");
    }
  };

  const handleProcessPayment = async () => {
    if (!paymentMethod && !isEmployee) {
      alert("Please select a payment method.");
      return;
    }

    if (isEmployee) {
      const creditsToUse = Math.min(employeeMealCredits, total);
      const remainingCash = Math.max(total - creditsToUse, 0);

      try {
        const mealRef = doc(db, "Employees", customerId, "meal", "1");
        await updateDoc(mealRef, {
          mealCredits: employeeMealCredits - creditsToUse,
        });

        setCreditsUsed(creditsToUse);
        setCashDue(remainingCash);

        if (remainingCash > 0) {
          alert(`Employee must pay £${remainingCash.toFixed(2)} in cash`);
        }
      } catch (error) {
        console.error("Error updating meal credits:", error);
        alert("Error processing meal credits");
        return;
      }
    }

    if (paymentMethod === "cash" && !isEmployee) {
      try {
        const q = query(
          collection(db, "cashSessions"),
          where("isClosed", "==", false)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const sessionDoc = snapshot.docs[0];
          const sessionRef = doc(db, "cashSessions", sessionDoc.id);
          const sessionData = sessionDoc.data();

          if (sessionData.isPaused) {
            alert(
              "Cash session is paused. Please ask the manager to reopen the cashier."
            );
            return;
          }

          const totalAmount = subTotal - discount;
          const orderNote = kotId ? `Sale KOT #${kotId}` : "Sale";

          const newTransaction = {
            type: "in",
            amount: totalAmount,
            by: "John",
            time: Timestamp.now(),
            note: orderNote,
          };

          const updatedTransactions = [
            ...(sessionData.transactions || []),
            newTransaction,
          ];
          await updateDoc(sessionRef, { transactions: updatedTransactions });
          console.log("Cash transaction recorded.");
        } else {
          console.warn("No active cash session found.");
          alert(
            "No active cash session found. Start session before accepting cash."
          );
          return;
        }
      } catch (error) {
        console.error("Failed to log cash transaction:", error);
      }
    }

    setIsPaymentProcessed(true);
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="p-4 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">ORDER</h2>

      {kotId && (
        <div className="mb-4 text-base font-semibold text-indigo-700 border border-indigo-300 rounded p-2 bg-indigo-50">
          KOT ID: <span className="font-mono">{kotId}</span>
        </div>
      )}

      {customerId && (
        <div className="mb-4 text-base font-semibold text-green-700 border border-green-300 rounded p-2 bg-green-50">
          {isEmployee ? (
            <>
              Employee: {customerName} ({customerId})
              <p>Meal Credits: £{employeeMealCredits}</p>
              {creditsUsed > 0 && <p>Credits Used: £{creditsUsed}</p>}
              {cashDue > 0 && <p>Cash Due: £{cashDue}</p>}
            </>
          ) : (
            <>
              Customer: {customerName} ({customerId}) - Points: {customerPoints}
              {customerPoints >= 2 && (
                <p className="text-green-600">10% discount applied</p>
              )}
            </>
          )}
        </div>
      )}

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
                <td>£{item.quantity * item.price}</td>
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
          <p>Sub Total: £{subTotal}</p>
          <p>Discount: £{discount}</p>
          <p className="font-bold text-lg">Total: £{total}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={handlePayClick}
          className="bg-blue-600 text-white p-2 rounded"
        >
          PAY
        </button>

        <button
          onClick={() => setShowCancelConfirm(true)}
          className="bg-red-600 text-white p-2 rounded"
        >
          CANCEL
        </button>

        <button
          onClick={handleStoreOrder}
          className="bg-yellow-600 text-white p-2 rounded"
          disabled={kotItems.length === 0}
        >
          STORE
        </button>

        <button
          onClick={() => setShowCashTab(true)}
          className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
        >
          CASH SESSION
        </button>
      </div>

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

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center space-y-4">
            <p className="text-lg font-semibold">
              Do you really want to cancel the order?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  clearItems();
                  setShowCancelConfirm(false);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {isCustomerModalOpen && !isEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px] text-center relative">
            <button
              onClick={() => setIsCustomerModalOpen(false)}
              className="absolute top-2 right-2 text-red-600 font-bold text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">Customer Loyalty Program</h3>

            <div className="mb-4">
              <p className="mb-2">Enter Customer ID or Phone Number (Optional):</p>
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

            {foundCustomers.map((customer) => {
              const isEmployee = customer.isEmployee;
              const identifier = isEmployee
                ? customer.EmployeeID
                : customer.customerID;
              const type = isEmployee ? "Employee" : "Customer";

              return (
                <div
                  key={identifier}
                  className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div className="font-medium">
                    {customer.name} ({type})
                  </div>
                  {isEmployee && customer.isClockedIn && (
                    <div className="text-red-600 text-sm">
                      ⛔ Currently clocked in
                    </div>
                  )}
                  {customer.points >= 2 &&
                    !(isEmployee && customer.isClockedIn) && (
                      <div className="text-green-600 text-sm">
                        ✓ Eligible for 10% discount (Points: {customer.points})
                      </div>
                    )}
                </div>
              );
            })}

            <div className="flex gap-2 justify-center mt-4">
              <button
                onClick={() => {
                  setIsCustomerModalOpen(false);
                  setIsPaymentModalOpen(true);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Skip Loyalty
              </button>
              <button
                onClick={() => setIsNewCustomer(true)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                New Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[300px] text-center relative">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-2 right-2 text-red-600 font-bold text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">
              {isEmployee ? "Employee Payment" : "Select Payment Method"}
            </h3>
            {isEmployee ? (
              <div>
                <p className="mb-4">Meal Credits: £{employeeMealCredits}</p>
                <p className="mb-4">Total: £{total}</p>
                <button
                  onClick={handleProcessPayment}
                  className="bg-blue-600 text-white px-6 py-2 rounded"
                >
                  Process with Meal Credits
                </button>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      {showPaymentScreen && (
        <PaymentScreen
          amount={total}
          onComplete={(success) => {
            setShowPaymentScreen(false);
            if (success) {
              setIsPaymentProcessed(true);
            }
          }}
          onClose={() => setShowPaymentScreen(false)}
        />
      )}
    </div>
  );
}
