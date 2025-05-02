import { Link } from "react-router-dom";

export default function Help() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-white min-h-screen">
      {/* Header with decorative elements */}
      <div className="mb-12 text-center relative">
        <div className="absolute -top-4 -left-4 w-16 h-16 bg-purple-200 rounded-full opacity-30"></div>
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-yellow-200 rounded-full opacity-30"></div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4 relative z-10">
          POS System Help Center
        </h1>
        
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
          Comprehensive guide to mastering our Point of Sale system. Learn how to process orders, manage inventory, generate reports, and troubleshoot common issues.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <a href="#getting-started" className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition">
            Getting Started
          </a>
          <a href="#cashier-guide" className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition">
            Cashier Guide
          </a>
          <a href="#manager-guide" className="px-4 py-2 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition">
            Manager Guide
          </a>
          <a href="#troubleshooting" className="px-4 py-2 bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition">
            Troubleshooting
          </a>
        </div>
      </div>

      {/* Getting Started Section */}
      <section id="getting-started" className="mb-16 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h2 className="text-3xl font-bold text-purple-700 mb-6 flex items-center">
          <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3">1</span>
          Getting Started with the POS System
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">System Components</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="bg-purple-100 text-purple-800 p-1 rounded mr-3">✓</span>
                <span><strong>Touchscreen Interface</strong> - Responsive display for all operations</span>
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 text-purple-800 p-1 rounded mr-3">✓</span>
                <span><strong>Barcode Scanner</strong> - For quick product lookup</span>
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 text-purple-800 p-1 rounded mr-3">✓</span>
                <span><strong>Receipt Printer</strong> - Thermal printer for customer receipts</span>
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 text-purple-800 p-1 rounded mr-3">✓</span>
                <span><strong>Cash Drawer</strong> - Secure money storage with automatic opening</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">First-Time Setup</h3>
            <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Power on all hardware components</li>
                <li>Log in with your provided credentials</li>
                <li>Configure printer settings in System Preferences</li>
                <li>Perform test transaction to verify all components</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 p-5 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-800 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            Pro Tip
          </h4>
          <p className="text-blue-700">Always perform an end-of-day reconciliation to ensure your cash drawer balances with the system records.</p>
        </div>
      </section>

      {/* Cashier Guide Section */}
      <section id="cashier-guide" className="mb-16">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 flex items-center">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">2</span>
          Cashier Operations Guide
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Processing */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">Order Processing</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Adding Items</h4>
                <p className="text-gray-600 text-sm">Tap items on the menu grid to add them to the current order. Use the category tabs to navigate different menu sections.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Modifiers & Options</h4>
                <p className="text-gray-600 text-sm">After selecting an item, modifier options will appear if available (e.g., "No onions", "Extra cheese").</p>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Important
                </h4>
                <p className="text-yellow-700 text-sm">Always confirm the order with the customer before processing payment.</p>
              </div>
            </div>
          </div>
          
          {/* Payment Processing */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">Payment Processing</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Payment Methods</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span><strong>Cash:</strong> Enter amount tendered, system calculates change</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span><strong>Credit/Debit:</strong> Swipe, insert, or tap the card</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    <span><strong>Mobile Pay:</strong> Scan customer's QR code</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Step-by-Step</h4>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700">
                  <div className="mb-1">1. Click <span className="bg-blue-100 px-2 py-0.5 rounded">PAY</span> button</div>
                  <div className="mb-1">2. Select payment method</div>
                  <div className="mb-1">3. Enter amount (if cash)</div>
                  <div className="mb-1">4. Process transaction</div>
                  <div>5. Print receipt (optional)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Advanced Cashier Functions */}
        <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">Advanced Functions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Split Checks</h4>
              <p className="text-gray-600 text-sm">Divide an order among multiple payment methods.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Discounts</h4>
              <p className="text-gray-600 text-sm">Apply % or fixed amount discounts with manager approval.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Returns</h4>
              <p className="text-gray-600 text-sm">Process returns with original receipt for refunds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Manager Guide Section */}
      <section id="manager-guide" className="mb-16">
        <h2 className="text-3xl font-bold text-green-700 mb-6 flex items-center">
          <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mr-3">3</span>
          Manager Functions Guide
        </h2>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
          <h3 className="text-xl font-semibold mb-4 text-green-800 border-b pb-2">Daily Operations</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Opening Procedures</h4>
              <ul className="text-gray-600 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 p-1 rounded mr-2 text-xs">1</span>
                  <span>Count starting cash float</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 p-1 rounded mr-2 text-xs">2</span>
                  <span>Verify all hardware is operational</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 p-1 rounded mr-2 text-xs">3</span>
                  <span>Check for system updates</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 p-1 rounded mr-2 text-xs">4</span>
                  <span>Review staff schedule</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Closing Procedures</h4>
              <ul className="text-gray-600 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 p-1 rounded mr-2 text-xs">1</span>
                  <span>Run end-of-day reports</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 p-1 rounded mr-2 text-xs">2</span>
                  <span>Reconcile cash drawer</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 p-1 rounded mr-2 text-xs">3</span>
                  <span>Backup system data</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 p-1 rounded mr-2 text-xs">4</span>
                  <span>Secure cash deposits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Reports & Analytics */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
          <h3 className="text-xl font-semibold mb-4 text-green-800 border-b pb-2">Reports & Analytics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Sales Summary</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Total sales by category, payment type</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Daily</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Inventory Usage</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Product movement and stock levels</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Weekly</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Employee Productivity</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Transactions per employee, speed metrics</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Monthly</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Staff Management */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-green-800 border-b pb-2">Staff Management</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Clock In/Out</h4>
              <p className="text-gray-600 text-sm">Monitor staff attendance and hours worked.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Permissions</h4>
              <p className="text-gray-600 text-sm">Set access levels for different staff roles.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Training</h4>
              <p className="text-gray-600 text-sm">Access training materials and track progress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting Section */}
      <section id="troubleshooting" className="mb-16">
        <h2 className="text-3xl font-bold text-red-700 mb-6 flex items-center">
          <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center mr-3">4</span>
          Troubleshooting Guide
        </h2>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-red-800 border-b pb-2">Common Issues</h3>
              <div className="space-y-4">
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <h4 className="font-medium text-red-800 mb-1">Printer Not Responding</h4>
                  <p className="text-red-700 text-sm">Check connections, restart printer, verify paper levels</p>
                </div>
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <h4 className="font-medium text-red-800 mb-1">Touchscreen Not Accurate</h4>
                  <p className="text-red-700 text-sm">Recalibrate touchscreen in system settings</p>
                </div>
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <h4 className="font-medium text-red-800 mb-1">Slow Performance</h4>
                  <p className="text-red-700 text-sm">Close unused applications, restart system</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-red-800 border-b pb-2">Emergency Procedures</h3>
              <div className="space-y-4">
                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-1">Power Outage</h4>
                  <p className="text-yellow-700 text-sm">Use battery backup to complete current transaction</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-1">System Crash</h4>
                  <p className="text-yellow-700 text-sm">Restart system, transactions are auto-saved</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-1">Network Failure</h4>
                  <p className="text-yellow-700 text-sm">System switches to offline mode automatically</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-blue-50 p-5 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              Support Contact
            </h4>
            <p className="text-blue-700">For issues not resolved by troubleshooting, contact our 24/7 support line at <strong>1-800-POS-HELP</strong> or email <strong>support@possystem.com</strong></p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-purple-700 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <button className="flex justify-between items-center w-full text-left font-medium text-gray-800">
              <span>How do I process a return without a receipt?</span>
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="mt-2 text-gray-600 text-sm">
              Manager approval is required for returns without receipts. Navigate to Manager Mode Returns  Manual Return. You'll need to verify the customer's ID and the reason for return.
            </div>
          </div>
          
          <div className="border-b border-gray-200 pb-4">
            <button className="flex justify-between items-center w-full text-left font-medium text-gray-800">
              <span>What should I do if the system freezes during a transaction?</span>
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="mt-2 text-gray-600 text-sm">
              First, wait 30 seconds to see if the system recovers. If not, restart the POS terminal - the current transaction will be saved and can be retrieved after reboot. If the issue persists, contact technical support.
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-6 border-t border-gray-200">
        <Link to="/" className="mb-4 md:mb-0 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to POS System
        </Link>
        
        <div className="text-sm text-gray-500">
          POS System v4.2 • Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}