import { Link } from "react-router-dom";

export default function Help() {
  return (
    <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-800 mb-4">
          POS System Help Guide
        </h1>
        <div className="flex justify-center gap-4 mb-8">
          <a href="#system-overview" className="text-blue-600 hover:underline">
            System Overview
          </a>
          <a href="#cashier-ops" className="text-blue-600 hover:underline">
            Cashier Guide
          </a>
          <a href="#manager-ops" className="text-blue-600 hover:underline">
            Manager Guide
          </a>
        </div>
      </div>

      {/* System Overview */}
      <section id="system-overview" className="mb-12">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">System Overview</h2>
        <div className="space-y-4">
          <p>The POS system consists of three main components:</p>
          <ul className="list-disc pl-6">
            <li><strong>Menu Grid</strong> - Item selection interface</li>
            <li><strong>KOT Panel</strong> - Order management and payment processing</li>
            <li><strong>Manager Screen</strong> - System oversight and reporting</li>
          </ul>
          <img 
            src="https://via.placeholder.com/800x300.png?text=POS+System+Interface+Layout" 
            alt="System layout"
            className="border rounded-lg mt-4"
          />
        </div>
      </section>

      {/* Cashier Operations */}
      <section id="cashier-ops" className="mb-12">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Cashier Operations</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Taking Orders</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Select category from left panel</li>
              <li>Click items to add to order</li>
              <li>Select sauces when prompted</li>
              <li>Modify quantities using number pad</li>
            </ol>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Payment Processing</h3>
            <pre className="bg-gray-100 p-4 rounded-lg">
              {`1. Click "PAY" in KOT Panel\n2. Select payment method\n3. Process payment\n4. Print receipt`}
            </pre>
          </div>
        </div>
      </section>

      {/* Manager Functions */}
      <section id="manager-ops" className="mb-12">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Manager Functions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Orders Management</h3>
            <ul className="list-disc pl-4 space-y-2">
              <li>View daily transactions</li>
              <li>Filter by date/time</li>
              <li>Void orders</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Staff Management</h3>
            <ul className="list-disc pl-4 space-y-2">
              <li>Clock in/out staff</li>
              <li>Monitor meal credits</li>
              <li>Generate reports</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Troubleshooting</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-purple-100">
              <tr>
                <th className="p-3 text-left border">Issue</th>
                <th className="p-3 text-left border">Solution</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">Payment processing failed</td>
                <td className="p-3">Restart cash session</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Item not appearing</td>
                <td className="p-3">Refresh Menu Grid</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Support */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Support</h2>
        <div className="space-y-2">
          <p>Technical Support: 
            <a href="mailto:support@possystem.com" className="text-blue-600 ml-2">
              support@possystem.com
            </a>
          </p>
          <p>Emergency Hotline: 
            <a href="tel:+18001234567" className="text-blue-600 ml-2">
              +1 (800) 123-4567
            </a>
          </p>
        </div>
      </section>

      <div className="text-center mt-8">
        <Link to="/" className="text-purple-700 hover:underline">
          ← Back to POS System
        </Link>
      </div>
    </div>
  );
}