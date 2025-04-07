import Header from './Header';
import MenuGrid from './MenuGrid';
import KOTPanel from './KOTPanel';

export default function POS() {
  return (
    <div>
      <Header />
      <div className="flex">
        <MenuGrid />
        <KOTPanel />
      </div>
    </div>
  );
}
