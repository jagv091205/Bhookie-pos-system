import React, { useState } from 'react';

const PaymentScreen = () => {
  const [amountTendered, setAmountTendered] = useState(0);
  const balanceDue = 399.26;
  const changeDue = amountTendered - balanceDue;

  const handleNumberClick = (number) => {
    setAmountTendered(parseFloat(`${amountTendered}${number}`));
  };

  const handleClearClick = () => {
    setAmountTendered(0);
  };

  const handleQuickCash = (amount) => {
    setAmountTendered(amountTendered + amount);
  };

  return (
    <div className="payment-container">
      <div className="header">
        <span>Pay</span>
        <span className="balance-due">${balanceDue.toFixed(2)}</span>
      </div>

      <div className="amount-section">
        <div className="amount-tendered">
          <span>Amount Tendered</span>
          <span>${amountTendered.toFixed(2)}</span>
        </div>
        <div className="change-due">
          <span>Change Due</span>
          <span>${changeDue.toFixed(2)}</span>
        </div>
      </div>

      <div className="input-grid">
        <button onClick={() => handleNumberClick(1)}>1</button>
        <button onClick={() => handleNumberClick(2)}>2</button>
        <button onClick={() => handleNumberClick(3)}>3</button>
        <button className="fraction">1/2</button>
        <button className="quick-cash" onClick={() => handleQuickCash(5)}>$5</button>
        <button className="quick-cash" onClick={() => handleQuickCash(10)}>$10</button>
        <button onClick={() => handleNumberClick(4)}>4</button>
        <button onClick={() => handleNumberClick(5)}>5</button>
        <button onClick={() => handleNumberClick(6)}>6</button>
        <button className="fraction">1/3</button>
        <button className="quick-cash" onClick={() => handleQuickCash(20)}>$20</button>
        <button className="quick-cash" onClick={() => handleQuickCash(50)}>$50</button>
        <button onClick={() => handleNumberClick(7)}>7</button>
        <button onClick={() => handleNumberClick(8)}>8</button>
        <button onClick={() => handleNumberClick(9)}>9</button>
        <button className="more">More</button>
        <button className="payment-method cash">
          <span role="img" aria-label="cash">💲</span> Cash
        </button>
        <button className="payment-method credit-card">
          <span role="img" aria-label="credit-card">💳</span> Credit Card
        </button>
        <button onClick={() => handleNumberClick(0)}>0</button>
        <button onClick={() => handleNumberClick('00')}>00</button>
        <button onClick={handleClearClick}>C</button>
        <button className="backspace">
          <span role="img" aria-label="backspace">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.7 7.7a1 1 0 0 0-1.4 1.4l3.3 3.3-3.3 3.3a1 1 0 0 0 1.4 1.4l3.3-3.3 3.3 3.3a1 1 0 0 0 1.4-1.4l-3.3-3.3 3.3-3.3a1 1 0 0 0-1.4-1.4l-3.3 3.3-3.3-3.3z"/></svg>
          </span>
        </button>
        <button className="payment-method invoice">
          <span role="img" aria-label="invoice">🧾</span> Invoice
        </button>
      </div>

      {/* You would add more UI elements here for manual credit card entry, card on file, etc. */}
    </div>
  );
};

export default PaymentScreen;