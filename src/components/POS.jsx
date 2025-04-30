import Header from './Header';
import MenuGrid from './MenuGrid';
import KOTPanel from './KOTPanel';
import Footer from './Footer';
import { useState } from 'react';


export default function POS() {
  const [kotItems, setKotItems] = useState([]);
  
  return (
    <div>
      <Header />
      <div className="flex">
        <MenuGrid onAddItem={(item) => {
          setKotItems(prevItems => {
            const existingIndex = prevItems.findIndex(
              i => i.id === item.id && 
              JSON.stringify(i.sauces || []) === JSON.stringify(item.sauces || [])
            );
            
            if (existingIndex !== -1) {
              const updated = [...prevItems];
              updated[existingIndex].quantity += 1;
              return updated;
            }
            return [...prevItems, item];
          });
        }} />
        <KOTPanel kotItems={kotItems} setKotItems={setKotItems} />
        </div>
        <Footer/>
      
    </div>
  );
}
