import {
  ArrowLeft,
  ArrowLeftRight,
  CreditCard,
  FileText,
  Settings,
  ArrowUpRight,
  LockKeyhole,
  CalendarDays,
  Calendar1,
  Pencil,
} from "lucide-react";
import { Link } from "react-router-dom";
import TransactionHistory from "./TransactionHistory";
import TransferLimitModal from "./components/modal/TransferLimitModal";
import { useState } from "react";
import CircularProgress from "./components/chart/CircularProgess";

const DesktopAccoutDetails = ({ account }) => {
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const handleModal = () => {
    setIsLimitModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className=" w-full top-0 z-20 shrink-0 border-b border-gray-200 flex items-center p-4 gap-4">
          <Link
            to="/account-control"
            className="bg-transparent hover:text-gray-800 hover:bg-gray-200 w-10 h-10 flex items-center justify-center text-gray-400 rounded-full transition-colors z-10 cursor-pointer"
          >
            <ArrowLeft size={18}></ArrowLeft>
          </Link>
          
        
        <h1 className="text-lg font-bold">Account Details</h1>
      </nav>

      <div className="max-w-[1500px] w-full mx-auto pt-8 pb-12 flex flex-col flex-1 px-4 md:px-8">
        <div className="flex gap-6 w-full">
          {/* Bank Card */}
          <div className="bg-blue-700 flex flex-col p-8 rounded-xl w-full max-w-[500px]">
            <span className="text-2xl font-semibold text-white tracking-wide">{`${account.account_type.charAt(0).toUpperCase()}${account.account_type.slice(1)} Account`}</span>
            <span className="text-3xl font-semibold text-white">
              $
              {Number(account.balance).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
            <div className="flex gap-8 mt-8">
              <div className="flex flex-col ">
                <span className="text-gray-200 text-xs tracking-wide">
                  ACCOUNT NUMBER
                </span>
                <span className="text-white text-sm">
                  ****{account.account_number.slice(-4)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-200 text-xs tracking-wide">
                  Status
                </span>
                <span className="text-white text-sm">{`${account.status.charAt(0).toUpperCase()}${account.status.slice(1).toLowerCase()}`}</span>
              </div>
            </div>
          </div>
          {/* Quick Access */}
          <div className="flex gap-4">
            <div className="gap-4 flex flex-col">
              <button className="flex flex-col justify-center items-center text-gray-500  border border-gray-300 rounded-xl hover:bg-gray-200 hover:text-gray-700  cursor-pointer hover:shadow-md transition-shadow  px-6 py-4">
                <div className="flex flex-col justify-center items-center rounded-full w-8 h-8 bg-blue-100 mb-2">
                  <ArrowLeftRight size={20} className="text-blue-800 p-1" />
                </div>
                <span className="text-xs">Transfer</span>
              </button>
              <button className="flex flex-col justify-center items-center text-gray-500  border border-gray-300 rounded-xl hover:bg-gray-200 hover:text-gray-700 cursor-pointer hover:shadow-md transition-shadow  px-6 py-4">
                <div className="flex flex-col justify-center items-center rounded-full w-8 h-8 bg-blue-100 mb-2">
                  <CreditCard size={20} className="text-blue-600 p-1" />
                </div>
                <span className="text-xs">Pay Bill</span>
              </button>
            </div>
            <div className="gap-4 flex flex-col">
              <button className="flex flex-col justify-center items-center text-gray-500  border border-gray-300 rounded-xl hover:bg-gray-200 hover:text-gray-700  cursor-pointer hover:shadow-md transition-shadow  px-auto py-4">
                <div className="flex flex-col justify-center items-center rounded-full w-8 h-8 bg-blue-100 mb-2">
                  <FileText size={20} className="text-blue-600 p-1" />
                </div>
                <span className="text-xs">Statements</span>
              </button>
              <button className="flex flex-col justify-center items-center text-gray-500  border border-gray-300 rounded-xl hover:bg-gray-200 hover:text-gray-700  cursor-pointer hover:shadow-md transition-shadow  px-6 py-4">
                <div className="flex flex-col justify-center items-center rounded-full w-8 h-8 bg-blue-100 mb-2">
                  <Settings size={20} className="text-blue-600 p-1" />
                </div>
                <span className="text-xs">Settings</span>
              </button>
            </div>
          </div>
        </div>
        {/* Transfer Limit */}
        <div className="flex flex-col mt-2 md:mt-6">
          <span className="text-base font-semibold">Transfer Limits</span>
          <span className="text-sm text-gray-500">
            Daily and monthly transaction management
          </span>
          <div className="flex mt-2 gap-8 w-full">
            {/* Per Transfer Limit */}
            <div className="border border-gray-300 px-8 py-4 rounded-lg bg-white w-full">
              <div className="flex justify-between items-center">
                <div className="border rounded-full text-gray-700 ">
                  <ArrowUpRight size={18} />
                </div>
                <button
                  onClick={handleModal}
                  className="text-sm text-blue-700 cursor-pointer hover:text-blue-800 flex gap-1"
                >
                  <Pencil size={18} />
                  Manage Limit
                </button>
              </div>
              <div className="mt-8 flex gap-8">
                <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-md">
                  <LockKeyhole className="text-blue-600" size={18} />
                </div>
                <div className="flex flex-col items-start justify-center">
                  <span className="text-gray-500 text-sm">PER TRANSFER</span>
                  <span className="text-gray-700 text-base font-semibold ">
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
            </div>
            {/* Daily Limit */}
            <div className="border border-gray-300 px-8 py-4 rounded-lg bg-white w-full">
              <div className="flex justify-between items-center ">
                <div className="text-gray-700">
                  <Calendar1 size={18} />
                </div>
                <button
                  onClick={handleModal}
                  className="text-sm text-blue-700 cursor-pointer hover:text-blue-800 flex gap-1"
                >
                  <Pencil size={18} />
                  Manage Limit
                </button>
              </div>
              <div className="mt-8 flex gap-8">
                <CircularProgress
                  spent={account.spent_today}
                  limit={account.daily_transfer_limit}
                />

                <div className="flex flex-col items-start justify-center">
                  <span className="text-gray-500 text-sm">DAILY LIMIT</span>
                  <span className="text-gray-700 text-base font-semibold ">
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
            </div>
            {/* Monthly Limit */}
            <div className="border border-gray-300 px-8 py-4 rounded-lg bg-white w-full">
              <div className="flex justify-between items-center ">
                <div className="text-gray-700">
                  <CalendarDays size={18} />
                </div>
                <button
                  onClick={handleModal}
                  className="text-sm text-blue-700 cursor-pointer hover:text-blue-800 flex gap-1"
                >
                  <Pencil size={18} />
                  Manage Limit
                </button>
              </div>
              <div className="mt-8 flex gap-8">
                <CircularProgress
                  spent={account.spent_today}
                  limit={account.monthly_transfer_limit}
                />
                <div className="flex flex-col items-start justify-center">
                  <span className="text-gray-500 text-sm">MONTHLY LIMIT</span>
                  <span className="text-gray-700 text-base font-semibold ">
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
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-center mt-2 md:mt-6">
          <p className="text font-semibold">Transaction History</p>
          <p className="text-sm text-gray-500">
            Manage and review your recent financial activity
          </p>
        </div>

        <div className="flex flex-col mt-2 justify-center items-center  transition-shadow ">
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
export default DesktopAccoutDetails;
