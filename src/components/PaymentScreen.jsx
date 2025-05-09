import React, { useState } from 'react';
import { doc, updateDoc, increment,runTransaction} from "firebase/firestore";
import { db } from "../firebase/config";


const PaymentScreen = ({ amount = 115.00, onComplete = () => {}, onClose, customerID,customerPhone,discount,isEmployee }) => {
  const [tenderedStr, setTenderedStr] = useState('');
  const [remainingAmount, setRemainingAmount] = useState(amount);
  
  const tendered = parseFloat(tenderedStr || '0');
  const changeDue = Math.max(0, tendered - remainingAmount);

  const handleNumberInput = (value) => {
    if (value === 'C') {
      setTenderedStr('');
    } else if (value === '00') {
      setTenderedStr(prev => prev + '00');
    } else {
      setTenderedStr(prev => prev + value);
    }
  };

  const handleClear = () => setTenderedStr('');

  const quickCashValues = [5, 10, 20, 50];
  const handleQuickCash = (value) => {
    setTenderedStr(prev => (parseFloat(prev || '0') + value).toString());
  };

  const processPayment = (method) => {
    // Determine payment amount
    const paymentAmount = tendered > 0 ? Math.min(tendered, remainingAmount) : remainingAmount;
    
    if (paymentAmount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }

    // Calculate new remaining amount
    const newRemaining = remainingAmount - paymentAmount;
    
    if (newRemaining <= 0.01) {
      // Full payment completed
      onComplete({
        method,
        amountTendered: amount,
        changeDue: method === 'Cash' ? changeDue : 0,
      });
      alert('✅ Payment successful!');
      onClose();
    } else {
      // Partial payment
      setRemainingAmount(newRemaining);
      setTenderedStr('');
      alert(`£${paymentAmount.toFixed(2)} paid via ${method}. £${newRemaining.toFixed(2)} remaining.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="text-lg font-bold">
            Pay £{remainingAmount.toFixed(2)}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ✕
          </button>
        </div>

        {/* Amounts Display */}
        <div className="grid grid-cols-3 text-center p-3">
          <div>
            <div className="text-gray-500 text-xs">Tendered</div>
            <div className="text-lg font-semibold">£{tendered.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Remaining</div>
            <div className="text-lg font-semibold text-red-500">
              £{remainingAmount.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Change</div>
            <div className="text-lg font-semibold">£{changeDue.toFixed(2)}</div>
          </div>
        </div>

        {/* Number Pad */}
        <div className="flex">
          <div className="w-2/3 grid grid-cols-3 gap-1 p-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '00', 'C'].map((key) => (
              <button
                key={key}
                onClick={() => handleNumberInput(key.toString())}
                className={`p-2 rounded-md text-xl font-bold ${
                  key === 'C' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Payment Buttons */}
          <div className="w-1/3 p-2 space-y-1">
            {quickCashValues.map((value) => (
              <button
                key={value}
                onClick={() => handleQuickCash(value)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-semibold"
              >
                £{value}
              </button>
            ))}

            <button
              onClick={() => processPayment('Cash')}
              className="w-full p-2 bg-green-500 hover:bg-green-600 rounded-md text-white text-sm font-bold"
            >
              Cash
            </button>
            <button
              onClick={() => processPayment('Card')}
              className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white text-sm font-bold"
            >
              Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;