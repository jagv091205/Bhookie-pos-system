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

  const handleRecallClick = ()=> {
    navigate("/Recall")
  }

  return (
    <div className="flex flex-wrap justify-start gap-1 sm:gap-4 md:gap-2">
      <button
        onClick={handleRefresh}
        className="bg-blue-600 text-white font-bold py-1 px-2 rounded shadow text-xs sm:text-sm w-[80px] sm:w-[100px] md:w-[120px] h-[80px]"
      >
        REFRESH<br />SCREEN
      </button>
  
      <button onClick={handleRecallClick}
        className="bg-blue-600 text-white font-bold py-1 px-2 rounded shadow text-xs sm:text-sm w-[80px] sm:w-[100px] md:w-[120px] h-[80px]"
      >
        RECALL<br />ORDER
      </button>
  
      <button
        onClick={handleManagerClick}
        className="bg-red-600 text-white font-bold py-1 px-2 rounded shadow text-xs sm:text-sm w-[90px] sm:w-[110px] md:w-[140px] h-[80px]"
      >
        MANAGER<br />SCREEN
      </button>
  
      <button
        onClick={handleHelpClick}
        className="bg-gray-600 text-white font-bold py-1 px-2 rounded shadow text-xs sm:text-sm w-[60px] sm:w-[70px] md:w-[90px] h-[80px]"
      >
        HELP
      </button>
  
      <button
        onClick={handleReportClick}
        className="bg-blue-600 text-white font-bold py-1 px-2 rounded shadow text-xs sm:text-sm w-[80px] sm:w-[100px] md:w-[120px] h-[80px]"
      >
        REPORT
      </button>
    </div>
  );
}  