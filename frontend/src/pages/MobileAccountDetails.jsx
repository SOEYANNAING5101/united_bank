import {
  TrendingUp,
  ArrowLeft,
  ArrowRightLeft,
  Receipt,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import TransactionHistory from "./TransactionHistory";
const MobileAccountDetails = ({ account }) => {
  return (
    <div className="bg-gray-100">
      {/* Navbar */}
      <div className="fixed w-full relative flex p-2 bg-white items-center relative z-50">
        <Link
          to="/account-control"
          className=" max-w-[100px] flex items-center gap-2 p-2 text-gray-500 font-medium  hover:text-gray-900 group"
        >
          <ArrowLeft size={20}></ArrowLeft>
        </Link>
        <p className="text-gray-700 text-lg font-semibold absolute left-1/2 -translate-x-1/2 ">
          Account Details
        </p>
      </div>
      {/* Body */}
      <div className="bg-gray-100 p-4 w-full">
        <div className="w-full bg-blue-700 rounded-xl p-4 flex flex-col text-white shadow-slate-900/20 mb-4">
          <span className="text-white/60">
            {account.account_type.toUpperCase()} ACCOUNT
          </span>
          <span className="text-4xl font-bold ">
            ${" "}
            {account.balance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
          <div className="mt-3 flex items-center gap-1.5 text-emerald-400 text-sm font-semibold w-max px-2.5 py-1 rounded-full">
            <TrendingUp size={16} strokeWidth={2.5} />
            <span>+2.4%</span>
            <span className="text-slate-400 font-normal ml-1 text-xs">
              vs last month
            </span>
          </div>
        </div>

        {/*  Quick Access */}
        <div className="gap-2 flex">
          <button className="w-full border border-gray-300 rounded-xl gap-2 bg-gray-200 flex flex-col items-center justify-center px-4 py-4 text-blue-800">
            <ArrowRightLeft size={20} />
            <span className="text-sm text-gray-700">Transfer</span>
          </button>
          <button className="w-full border border-gray-300 rounded-xl gap-2  bg-gray-200 flex flex-col items-center justify-center px-4 py-3 text-blue-800">
            <Receipt size={20} />
            <span className="text-sm text-gray-700">Pay Bill</span>
          </button>
          <button className="w-full border border-gray-300 rounded-xl gap-2 bg-gray-200 flex flex-col items-center justify-center px-4 py-3 text-blue-800">
            <FileText size={20} />
            <span className="text-sm text-gray-700">Statements</span>
          </button>
        </div>

        {/* Transactions */}
        <div>
          <TransactionHistory account_id={account.account_id} />
        </div>
      </div>
    </div>
  );
};
export default MobileAccountDetails;
