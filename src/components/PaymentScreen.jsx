import React, { useState } from "react";
import { doc, updateDoc, increment, runTransaction } from "firebase/firestore";
import { db } from "../firebase/config";

const PaymentScreen = ({ amount, isEmployee, onComplete, onClose }) => {
  const [tenderedStr, setTenderedStr] = useState('');
  const remainingAmount = parseFloat(amount.toFixed(2));
  const tendered = parseFloat(tenderedStr || '0');
  const changeDue = Math.max(0, tendered - remainingAmount);
  const quickCashValues = [5, 10, 20, 50];

  // Separate handlers for employees and customers
  const handleNumberInput = (value) => {
    if (value === 'C') {
      setTenderedStr('');
      return;
    }

    if (isEmployee) {
      // Employee-specific decimal handling
      if (value === '.') {
        if (!tenderedStr.includes('.')) {
          setTenderedStr(prev => prev + '.');
        }
      } else if (value === '00') {
        handleDoubleZero();
      } else {
        handleEmployeeDigit(value);
      }
    } else {
      // Original customer handling
      if (value === '00') {
        setTenderedStr(prev => prev + '00');
      } else {
        setTenderedStr(prev => prev + value);
      }
    }
  };

  const handleEmployeeDigit = (value) => {
    const parts = tenderedStr.split('.');
    if (parts.length > 1 && parts[1].length >= 2) return;
    setTenderedStr(prev => prev + value);
  };

  const handleDoubleZero = () => {
    if (tenderedStr.includes('.')) {
      const [whole, decimal] = tenderedStr.split('.');
      if ((decimal?.length || 0) < 2) {
        setTenderedStr(`${whole}.${decimal}00`.slice(0, whole.length + 3));
      }
    } else {
      setTenderedStr(prev => prev + '00');
    }
  };

  const processPayment = (method) => {
    if (isEmployee) {
      const exactAmount = parseFloat(remainingAmount.toFixed(2));
      const enteredAmount = parseFloat(tenderedStr || '0');
      
      if (enteredAmount.toFixed(2) !== exactAmount.toFixed(2)) {
        alert(`Employee must pay exactly £${exactAmount.toFixed(2)}`);
        return;
      }
    }
    
    onComplete(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="text-lg font-bold">
            Pay £{remainingAmount.toFixed(2)}
            {isEmployee && (
              <span className="block text-sm text-gray-500">
                (Exact amount required)
              </span>
            )}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 text-center p-3">
          <div>
            <div className="text-gray-500 text-xs">Tendered</div>
            <div className="text-lg font-semibold">
              £{tendered.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Remaining</div>
            <div className="text-lg font-semibold text-red-500">
              £{remainingAmount.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Change</div>
            <div className="text-lg font-semibold">
              £{changeDue.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="w-2/3 grid grid-cols-3 gap-1 p-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 
              isEmployee ? '.' : 0, 
              isEmployee ? 0 : '00', 
              'C'].map((key) => (
              <button
                key={key}
                onClick={() => handleNumberInput(key.toString())}
                className={`p-2 rounded-md text-xl font-bold ${
                  key === 'C' ? 'bg-red-500 text-white' :
                  key === '.' ? 'bg-gray-300' : 'bg-gray-100'
                } hover:bg-gray-200`}
                disabled={key === '.' && tenderedStr.includes('.')}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="w-1/3 p-2 space-y-1">
            {!isEmployee && quickCashValues.map((value) => (
              <button
                key={value}
                onClick={() => setTenderedStr(prev => String(parseFloat(prev || '0') + value))}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-semibold"
              >
                £{value}
              </button>
            ))}

            <button
              onClick={() => processPayment("Cash")}
              className={`w-full p-2 ${
                isEmployee && tendered.toFixed(2) !== remainingAmount.toFixed(2)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              } rounded-md text-white text-sm font-bold`}
              disabled={isEmployee && tendered.toFixed(2) !== remainingAmount.toFixed(2)}
            >
              {isEmployee ? "Confirm Exact" : "Cash"}
            </button>

            {!isEmployee && (
              <button
                onClick={() => processPayment("Card")}
                className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white text-sm font-bold"
              >
                Card
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;