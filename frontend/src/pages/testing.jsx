import { 
  ArrowLeft, Search, Filter, ArrowRightLeft, 
  FileText, Settings, Shield, Smartphone, 
  CreditCard, Coffee, ShoppingBag, ArrowDownLeft, ArrowUpRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccountDetails = () => {
  const navigate = useNavigate();

  // Dummy Data for the UI
  const transactions = [
    { id: 1, merchant: "Apple Store Soho", category: "Electronics", date: "Today", amount: -1299.00, icon: Smartphone, color: "text-gray-600", bg: "bg-gray-100" },
    { id: 2, merchant: "Stripe Payout", category: "Income", date: "Oct 24", amount: 3450.00, icon: ArrowDownLeft, color: "text-emerald-600", bg: "bg-emerald-100" },
    { id: 3, merchant: "Blue Hill Restaurant", category: "Dining", date: "Oct 23", amount: -412.50, icon: Coffee, color: "text-orange-600", bg: "bg-orange-100" },
    { id: 4, merchant: "Whole Foods Market", category: "Groceries", date: "Oct 22", amount: -215.30, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 lg:p-8">
      
      {/* 1. HERO HEADER */}
      <div className="mb-8">
        {/* Breadcrumbs */}
        <button 
          onClick={() => navigate('/accounts')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Accounts
        </button>
        
        {/* Title & Balance */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Premium Checking</h1>
            <p className="text-gray-500 font-mono text-sm">Account No: **** 4829 • Routing: 021000021</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Available Balance</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-blue-600">$42,850.12</h2>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-gray-700 hover:text-blue-600 group">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
            <ArrowRightLeft size={24} className="text-blue-600" />
          </div>
          <span className="font-semibold text-sm">Transfer</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-gray-700 hover:text-blue-600 group">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
            <CreditCard size={24} className="text-blue-600" />
          </div>
          <span className="font-semibold text-sm">Pay Bill</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-gray-700 hover:text-blue-600 group">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
            <FileText size={24} className="text-blue-600" />
          </div>
          <span className="font-semibold text-sm">Statements</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-gray-700 hover:text-blue-600 group">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
            <Settings size={24} className="text-blue-600" />
          </div>
          <span className="font-semibold text-sm">Settings</span>
        </button>
      </div>

      {/* 3. MAIN BODY (Split Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Ledger (60%) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex-grow">
            
            {/* Ledger Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search merchant..." 
                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
                  <Filter size={16} />
                  Filters
                </button>
              </div>
            </div>

            {/* Transaction List */}
            <div className="flex flex-col gap-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.bg} ${tx.color}`}>
                      <tx.icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{tx.merchant}</p>
                      <p className="text-xs text-gray-500">{tx.date} • {tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.amount > 0 ? "text-emerald-600" : "text-gray-900"}`}>
                      {tx.amount > 0 ? "+" : "-"}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400">Completed</p>
                  </div>
                </div>
              ))}
              
              <button className="w-full mt-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                Load More Transactions
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Control Center (40%) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          
          {/* Visual Bank Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden h-56 flex flex-col justify-between">
            {/* Decorative background circle */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <h3 className="text-xl font-bold tracking-widest italic opacity-90">UNITED BANK</h3>
              <Shield size={24} className="opacity-75" />
            </div>
            
            <div className="relative z-10">
              <p className="text-sm opacity-75 mb-1 tracking-widest uppercase">Card Number</p>
              <p className="text-2xl font-mono tracking-[0.2em] mb-4">**** **** **** 4829</p>
              
              <div className="flex justify-between items-end uppercase tracking-wider">
                <div>
                  <p className="text-[10px] opacity-75 mb-0.5">Card Holder</p>
                  <p className="text-sm font-semibold">JOHN DOE</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-75 mb-0.5">Expires</p>
                  <p className="text-sm font-semibold">12/28</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Limits */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Security & Limits</h3>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Online Payments</p>
                  <p className="text-xs text-gray-500">Allow transactions on the internet</p>
                </div>
                {/* Custom Tailwind Toggle (Active) */}
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer transition-colors">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">International Usage</p>
                  <p className="text-xs text-gray-500">Allow transactions outside home country</p>
                </div>
                {/* Custom Tailwind Toggle (Inactive) */}
                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer transition-colors">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm border border-gray-200"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-red-600">Freeze Card</p>
                  <p className="text-xs text-gray-500">Temporarily disable all transactions</p>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer transition-colors">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm border border-gray-200"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Insight */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">October Activity</h3>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500 font-semibold">Money In</span>
              <span className="text-sm font-bold text-emerald-600">+$12,500.00</span>
            </div>
            {/* Progress Bar Visual */}
            <div className="w-full h-2 bg-emerald-100 rounded-full mb-6 overflow-hidden">
              <div className="w-[80%] h-full bg-emerald-500 rounded-full"></div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500 font-semibold">Money Out</span>
              <span className="text-sm font-bold text-gray-900">-$4,210.50</span>
            </div>
            {/* Progress Bar Visual */}
            <div className="w-full h-2 bg-gray-100 rounded-full mb-2 overflow-hidden">
              <div className="w-[35%] h-full bg-gray-800 rounded-full"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AccountDetails;