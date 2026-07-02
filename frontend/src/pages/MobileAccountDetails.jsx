import {
  TrendingUp,
  ArrowLeft,
  ArrowLeftRight,
  CreditCard,
  FileText,
  Settings,
  LockKeyhole,
  Calendar1,
  CalendarDays,
  ReceiptText,
} from "lucide-react";
import { Link } from "react-router-dom";
import TransactionHistory from "./TransactionHistory";
import { useState } from "react";
import TransferLimitModal from "./components/modal/TransferLimitModal";
const MobileAccountDetails = ({ account }) => {
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const handleModal = () => {
    setIsLimitModalOpen(true);
  };
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <div className="fixed w-full top-0 left-0 bg-gray-100 flex p-2 items-center z-50">
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
      <div className="mt-13 p-4 w-full">
        <div className="w-full bg-blue-700 rounded-xl p-4 flex flex-col text-white shadow-slate-900/20 mb-2">
          <span className="text-gray-300">
            {account.account_type.toUpperCase()} ACCOUNT
          </span>
          <span className="text-3xl font-bold ">
            ${" "}
            {account.balance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
          <div className="border border-gray-100 mt-2 mb-2"></div>
          <div className=" flex items-center gap-1.5 text-gray-300 text-sm font-semibold">
            <span>ACCOUNT NUMBER: </span>
            <span>...${account.account_number.slice(-4)}</span>
          </div>
        </div>

        {/*  Quick Access */}
        <div className="gap-2 flex w-full ">
          <button className="flex flex-col w-full justify-center items-center text-gray-500  border border-gray-300 rounded-xl hover:bg-gray-200 hover:text-gray-700  cursor-pointer hover:shadow-md transition-shadow py-2">
            <div className="flex flex-col justify-center items-center rounded-full w-8 h-8 bg-blue-100 mb-2">
              <ArrowLeftRight size={20} className="text-blue-800 p-1" />
            </div>
            <span className="text-xs">Transfer</span>
          </button>
          <button className="flex flex-col w-full justify-center items-center text-gray-500  border border-gray-300 rounded-xl hover:bg-gray-200 hover:text-gray-700 cursor-pointer hover:shadow-md transition-shadow  py-2">
            <div className="flex flex-col justify-center items-center rounded-full w-8 h-8 bg-blue-100 mb-2">
              <ReceiptText size={20} className="text-blue-600 p-1" />
            </div>
            <span className="text-xs">Pay Bill</span>
          </button>
          <button className="flex flex-col w-full justify-center items-center text-gray-500  border border-gray-300 rounded-xl hover:bg-gray-200 hover:text-gray-700  cursor-pointer hover:shadow-md transition-shadow  py-2">
            <div className="flex flex-col justify-center items-center rounded-full w-8 h-8 bg-blue-100 mb-2">
              <FileText size={20} className="text-blue-600 p-1" />
            </div>
            <span className="text-xs">Statements</span>
          </button>
          <button className="flex flex-col w-full justify-center items-center text-gray-500  border border-gray-300 rounded-xl hover:bg-gray-200 hover:text-gray-700  cursor-pointer hover:shadow-md transition-shadow  py-2">
            <div className="flex flex-col justify-center items-center rounded-full w-8 h-8 bg-blue-100 mb-2">
              <Settings size={20} className="text-blue-600 p-1" />
            </div>
            <span className="text-xs">Settings</span>
          </button>
        </div>
        {/* Transfer Limit */}
        <div className="flex flex-col mt-4">
          <span className="text-base font-semibold">Transfer Limits</span>
          <span className="text-gray-500 text-xs">
            Daily and monthly transaction management
          </span>
          <div className="flex flex-col mt-2 md:mt-4 gap-2 w-full">
            {/* Per Transfer Limit */}
            <div className="border border-gray-300 p-4 rounded-lg bg-white w-full">
              <div className="flex gap-8 items-center justify-between">
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-blue-100 w-10 h-10 flex items-center justify-center rounded-md">
                    <LockKeyhole className="text-blue-600 " size={15} />
                  </div>
                  <div className="flex flex-col items-start justify-center ml-3">
                    <span className="text-gray-500 text-xs">PER TRANSFER</span>
                    <span className="text-gray-700 text-sm font-semibold ">
                      $
                      {Number(account.txn_limit_per_transfer).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                        },
                      )}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleModal}
                  className="text-sm text-blue-700 cursor-pointer hover:text-blue-800 flex gap-1"
                >
                  Manage
                </button>
              </div>
            </div>
            {/* Daily Limit */}
            <div className="border border-gray-300 p-4 rounded-lg bg-white w-full">
              <div className="flex gap-8 items-center justify-between">
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-blue-100 w-10 h-10 flex items-center justify-center rounded-md">
                    <Calendar1 className="text-blue-600" size={15} />
                  </div>
                  <div className="flex flex-col items-start justify-center ml-3">
                    <span className="text-gray-500 text-xs">DAILY LIMIT</span>
                    <span className="text-gray-700 text-sm font-semibold ">
                      $
                      {Number(account.daily_transfer_limit).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                        },
                      )}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleModal}
                  className="text-sm text-blue-700 cursor-pointer hover:text-blue-800 flex gap-1"
                >
                  Manage
                </button>
              </div>
            </div>
            {/* Monthly Limit */}
            <div className="border border-gray-300 p-4 rounded-lg bg-white w-full">
              <div className="flex gap-8 items-center justify-between">
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-blue-100 w-10 h-10 flex items-center justify-center rounded-md">
                    <CalendarDays className="text-blue-600" size={15} />
                  </div>
                  <div className="flex flex-col items-start justify-center ml-3">
                    <span className="text-gray-500 text-xs">MONTHLY LIMIT</span>
                    <span className="text-gray-700 text-sm font-semibold ">
                      $
                      {Number(account.monthly_transfer_limit).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                        },
                      )}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleModal}
                  className="text-sm text-blue-700 cursor-pointer hover:text-blue-800 flex gap-1"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="mt-4">
          <span className="text-base font-semibold">Recent Transactions</span>
          <TransactionHistory account_id={account.account_id} />
        </div>
      </div>
      {isLimitModalOpen && (
        <TransferLimitModal
          isOpen={isLimitModalOpen}
          onClose={() => setIsLimitModalOpen(false)}
          account_id={account.account_id}
          perTransfer={account.txn_limit_per_transfer}
          dailyLimit={account.daily_transfer_limit}
          monthlyLimit={account.monthly_transfer_limit}
          total_today={account.spent_today}
          total_this_month={account.spent_this_month}
        />
      )}
    </div>
  );
};
export default MobileAccountDetails;
