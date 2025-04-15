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
    <div className="bg-gray-800 text-white flex justify-between items-center">
      <h1 className="text-1g font-bold">Bhookie POS</h1>
      <div className="flex gap-6 items-center text-gray-300"> 
      {user && (
        <span className="text-white ">
        Welcome,<span className="font-semibold"> {user.name}</span> ({user.role})
        </span>
      )}
      <div className="text-right">
        <div>{formattedDate}</div>
        <div>{formattedTime}</div>
        
        </div>
        </div>
        </div>
  );
}

