import { useAuth } from '../contexts/AutoContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <div className="p-4 bg-gray-800 text-white flex justify-between">
      <h1 className="text-xl font-bold">Bhookie POS</h1>
      {user && <span>Welcome, {user.userName} ({user.role})</span>}
    </div>
  );
}
