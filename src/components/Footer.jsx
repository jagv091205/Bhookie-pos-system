import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleManagerClick = () => {
    navigate("/manager-login");
  };

  const handleReportClick = () =>{
    navigate("/report")
  }
  const handleHelpClick = () =>{
    navigate("/Help")
  }
  const handleRecallClick = () => {
    navigate("/recall-orders");
  };

  return (
      <div className="flex flex-wrap justify-start gap-1">
        <button
          onClick={handleRefresh}
          className="bg-blue-600 text-white font-bold py-2 px-2 rounded shadow text-sm w-[120px]"
        >
          REFRESH<br />SCREEN
        </button>

        <button
        onClick={handleRecallClick}  // Updated handler
        className="bg-blue-600 text-white font-bold py-2 px-2 rounded shadow text-sm w-[120px]"
      >
        RECALL<br />ORDER
      </button>

        <button
          onClick={handleManagerClick}
          className="bg-red-600 text-white font-bold py-2 px-2 rounded shadow text-sm w-[140px]"
        >
          MANAGER<br />SCREEN
        </button>
 
        <button onClick={handleHelpClick}
          className="bg-gray-600 text-white font-bold py-2 px-2 rounded shadow text-sm w-[90px]"
        >
          HELP
        </button>

        <button onClick={handleReportClick}
          className="bg-blue-600 text-white font-bold py-2 px-2 rounded shadow text-sm w-[120px]"
        >
          REPORT
        </button>
      </div>
    
  );
}