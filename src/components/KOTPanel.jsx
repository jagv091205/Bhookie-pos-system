import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function KOTPanel() {
  const [kotItems, setKotItems] = useState([]);

  const handleAddItem = (item) => {
    setKotItems(prev => [...prev, item]);
  };

  const handleGenerateKOT = async () => {
    await addDoc(collection(db, "OrderHistory_KOT"), {
      items: kotItems,
      timestamp: new Date().toISOString()
    });
    alert("KOT Generated");
    setKotItems([]);
  };

  return (
    <div className="w-1/3 p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">KOT Panel</h2>
      <ul className="mb-4">
        {kotItems.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
      <button
        onClick={handleGenerateKOT}
        className="bg-green-500 text-white px-4 py-2"
      >
        Generate KOT
      </button>
    </div>
  );
}