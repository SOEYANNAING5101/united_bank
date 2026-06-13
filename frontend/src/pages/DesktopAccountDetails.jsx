import {
  ArrowLeft,
  ArrowLeftRight,
  Shield,
  CreditCard,
  FileText,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import TransactionHistory from "./TransactionHistory";

const DestopAccoutDetails = ({ account }) => {
  return (
    <div className="min-h-screen w-full mx-auto p-6 bg-gray-100">
      <Link
        to="/account-control"
        className="mb-5 max-w-[200px] flex items-center gap-2 p-2 text-gray-500 font-medium self-start hover:text-gray-900 group"
      >
        <ArrowLeft size={18}></ArrowLeft>
        Back to account
      </Link>
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-2xl font-semibold">{account.account_type.toUpperCase()} ACCOUNT</span>
          <span className="text-gray-500">Account No: ****{account.account_number.slice(-4)}</span>
        </div>

        <div className="flex flex-col items-end">        
          <span className=" text-sm text-gray-500">AVAILABLE BALANCE</span>
          <span className="text-4xl font-semibold text-blue-700">${" "}
            {account.balance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}</span>

        </div>

      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-2 mb-6 md:grid-cols-4 gap-4">
        <button className="flex flex-col justify-center items-center border border-gray-300 rounded-xl bg-gray-200 hover:shadow-md transition-shadow rounded-2xl shadow-sm p-4">
          <div className="flex flex-col justify-center items-center rounded-full w-12 h-12 bg-blue-50 mb-3">
            <ArrowLeftRight size={24} className="text-blue-600" />
          </div>
          <span>Transfer</span>
        </button>

        <button className="flex flex-col justify-center items-center border border-gray-300 rounded-xl bg-gray-200 hover:shadow-md transition-shadow rounded-2xl shadow-sm p-4">
          <div className="flex flex-col justify-center items-center rounded-full w-12 h-12 bg-blue-50 mb-3">
            <CreditCard size={24} className="text-blue-600" />
          </div>
          <span>Pay Bill</span>
        </button>

        <button className="flex flex-col justify-center items-center border border-gray-300 rounded-xl bg-gray-200 hover:shadow-md transition-shadow rounded-2xl shadow-sm p-4">
          <div className="flex flex-col justify-center items-center rounded-full w-12 h-12 bg-blue-50 mb-3">
            <FileText size={24} className="text-blue-600" />
          </div>
          <span>Statements</span>
        </button>

        <button className="flex flex-col justify-center items-center border border-gray-300 rounded-xl bg-gray-200 hover:shadow-md transition-shadow rounded-2xl shadow-sm p-4">
          <div className="flex flex-col justify-center items-center rounded-full w-12 h-12 bg-blue-50 mb-3">
            <Settings size={24} className="text-blue-600" />
          </div>
          <span>Settings</span>
        </button>
      </div>

      {/* Main Body */}

      <div className="flex flex-col justify-center items-center bg-gray-100 transition-shadow ">
        <TransactionHistory account_id={account.account_id} />
      </div>
    </div>
  );
};
export default DestopAccoutDetails;
