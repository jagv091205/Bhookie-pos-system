import React, { useState } from 'react';
import { doc, updateDoc, increment,runTransaction} from "firebase/firestore";
import { db } from "../firebase/config";


const PaymentScreen = ({ amount = 115.00, onComplete = () => {}, onClose, customerID,customerPhone,discount,isEmployee }) => {
  const [tenderedStr, setTenderedStr] = useState('');
  const [showSplit, setShowSplit] = useState(false);
  const [splitCashAmount, setSplitCashAmount] = useState('');
  const [isSplitConfirmed, setIsSplitConfirmed] = useState(false);
  const tendered = parseFloat(tenderedStr || '0');
  const amountInPounds = amount; // Already in GBP
  const tenderedInPounds = tendered; // Directly use as GBP
  const balanceDueInPounds = amountInPounds - tenderedInPounds;
  const changeDueInPounds = Math.max(0, tenderedInPounds - amountInPounds);

  const handleNumberInput = (value) => {
    if (value === 'C') {
      setTenderedStr('');
    } else if (value === '00') {
      setTenderedStr((prev) => prev + '00');
    } else {
      setTenderedStr((prev) => prev + value);
    }
  };

  const handleClear = () => {
    setTenderedStr('');
  };


  const quickCashValuesInPounds = [5, 10, 20, 50];
  const handleQuickCash = (value) => {
    setTenderedStr((prev) => (parseFloat(prev || '0') + value).toString());
  };

  const processPayment = (method) => {
    if (method === 'Cash' && tenderedInPounds < amountInPounds) {
      if (window.confirm(`Amount tendered is less than balance due. Proceed with payment?`)) {
        onComplete({
          method,
          amountTendered: tenderedInPounds,
          changeDue: 0,
        });
      }
      return;
    }

    if (method !== 'Cash' || tenderedInPounds >= amountInPounds) {
      onComplete({
        method,
        amountTendered: method === 'Cash' ? tenderedInPounds : amountInPounds,
        changeDue: method === 'Cash' ? changeDueInPounds : 0,
      });
    }
  };

  const handleCardFile = async () => {
    alert('✅ Payment successful');
    onComplete({
      method: 'Card File',
      amountTendered: amountInPounds,
      changeDue: 0,
    });
  };
    
  const handleSplitConfirm = () => {
    const cashAmount = parseFloat(splitCashAmount);
    if (isNaN(cashAmount) || cashAmount <= 0 || cashAmount >= amountInPounds) {
      alert('Please enter a valid cash amount less than the total amount.');
      return;
    }
    setIsSplitConfirmed(true);
  };

  const remainingAmount = amountInPounds - parseFloat(splitCashAmount || '0');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="text-lg font-bold">
            Pay £
            {isSplitConfirmed
              ? remainingAmount.toFixed(2)
              : amountInPounds.toFixed(2)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Amounts Display */}
        {!isSplitConfirmed && (
          <div className="grid grid-cols-3 text-center p-3">
            <div>
              <div className="text-gray-500 text-xs">Tendered</div>
              <div className="text-lg font-semibold">
                £{tenderedInPounds.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Balance</div>
              <div className="text-lg font-semibold text-red-500">
                £{balanceDueInPounds.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Change</div>
              <div className="text-lg font-semibold">
                £{changeDueInPounds.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Main Section */}
        <div className="flex">
          {/* Left: Number Pad */}
          <div className="w-2/3 grid grid-cols-3 gap-1 p-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '00', 'C'].map((key) => (
              <button
                key={key}
                onClick={() => handleNumberInput(key.toString())}
                className={`p-2 rounded-md text-xl font-bold ${
                  key === 'C'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {key}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-semibold col-span-3"
            >
              &#x2715;
            </button>
          </div>

          {/* Right: Quick Cash + Payment Methods */}
          <div className="w-1/3 p-2 space-y-1">
            {!showSplit &&
              !isSplitConfirmed &&
              quickCashValuesInPounds.map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuickCash(value)}
                  className="w-full p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-semibold"
                >
                  £{value}
                </button>
              ))}

            {!showSplit && !isSplitConfirmed && (
              <>
                <button
                  onClick={handleCardFile}
                  className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white text-sm font-bold flex items-center justify-center"
                >
                  <span className="mr-1">📁</span>
                  Card
                </button>
                <button
                  onClick={() => setShowSplit(true)}
                  className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white text-sm font-bold flex items-center justify-center"
                >
                  <span className="mr-1">📁</span>
                  Split
                </button>
              </>
            )}

            {showSplit && !isSplitConfirmed && (
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Cash Amount"
                  value={splitCashAmount}
                  onChange={(e) => setSplitCashAmount(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
                <button
                  onClick={handleSplitConfirm}
                  className="w-full p-2 bg-green-500 hover:bg-green-600 rounded-md text-white text-sm font-bold"
                >
                  Confirm Split
                </button>
              </div>
            )}

            {isSplitConfirmed && (
              <div className="space-y-2">
                <div className="text-sm text-gray-700">
                  Cash: £{parseFloat(splitCashAmount).toFixed(2)}
                </div>
                <div className="text-sm text-gray-700">
                  Card: £{remainingAmount.toFixed(2)}
                </div>
                <button
                 onClick={async () => {
                  try {
                    // Deduct loyalty points first if applicable
                    if (customerID && !isEmployee && discount > 0) {
                      const customerRef = doc(db, "customers", customerID); // Use customerId consistently
                      await updateDoc(customerRef, {
                        points: increment(-discount),
                      });
                      console.log(`Deducted ${discount} points from ${customerID}`);
                    }
              
                    // Only show success after all operations complete
                    alert('✅ Payment successful');
                    
                    onComplete({
                      method: 'Split Payment',
                      amountTendered: amountInPounds,
                      changeDue: 0,
                    });
                  } catch (error) {
                    console.error("Payment processing failed:", error);
                    alert('⚠️ Payment processed but failed to update loyalty points');
                  }
                }}
                  className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white text-sm font-bold"
                >
                  Pay
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Manual Card and Card on File */}
        {!showSplit && !isSplitConfirmed && (
          <div className="flex border-t">
            <button className="flex-1 p-2 border-r text-center text-sm font-bold flex items-center justify-center">
              <span className="mr-1">📝</span>
              Manual Card
            </button>
            <button
              onClick={handleCardFile}
              className="flex-1 p-2 text-center text-sm font-bold flex items-center justify-center"
            >
              <span className="mr-1">✅</span>
              Cash
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentScreen;