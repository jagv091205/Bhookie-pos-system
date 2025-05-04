import { useAuth } from '../contexts/AutoContext';
import {useEffect,useState} from "react";

export default function Header() {
  const { user } = useAuth();
  const [dateTime,setDateTime]=useState(new Date());

  useEffect(()=>{
    const interval =setInterval(()=>{
      setDateTime(new Date());
    },1000);
    return ()=>clearInterval(interval);
  },[]);
  
  const formattedDate = dateTime.toLocaleDateString();
  const formattedTime = dateTime.toLocaleTimeString();

  return (
    <div className="bg-gray-800 text-white flex justify-between items-center h-[60px] px-4">
      <h2 className="text-1xl sm:text21xl md:text-2xl font-bold">Bhookie POS</h2>
  
      <div className="flex gap-4 sm:gap-6 md:gap-9 items-center text-gray-300 text-sm sm:text-base">
        {user && (
          <span className="text-white">
            Welcome, <span className="font-semibold">{user.name}</span> ({user.role})
          </span>
        )}
  
        <div className="text-right leading-tight">
          <div>{formattedDate}</div>
          <div>{formattedTime}</div>
        </div>
      </div>
    </div>
  );
}  
