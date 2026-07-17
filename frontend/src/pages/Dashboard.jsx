import { useOutletContext, Link } from "react-router-dom";
import { useState } from "react";
import {
  Plus,
  History,
  Wallet,
  ShieldAlert,
  LockKeyholeOpen,
  ShieldBan,
} from "lucide-react";
import MonthlyOverviewChart from "./MonthlyOverviewChart";
import DesktopTransferModal from "./components/transactions/DesktopTransferModal";
import { useUser } from "@clerk/clerk-react";

const Dashboard = () => {
  const { dashboardData, profileStatus, error } = useOutletContext() || {};

  const today = new Date();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("deposit");

  const { user } = useUser();
  // Dynamic first name
  const username = user?.username || "there";
  // Calculate the time of the day
  const currentHour = today.getHours();
  let timeGreeting = "Good Evening";
  if (currentHour < 12) {
    timeGreeting = "Good Morning";
  } else if (currentHour < 18) {
    timeGreeting = "Good Afternoon";
  }

  const isVerified = profileStatus?.isVerified === true;

  const handleModal = (action) => {
    if (!isVerified) return;
    setIsModalOpen(true);
    setModalAction(action);
  };
  // isVerified || !dashboardData || !error
  if (profileStatus === undefined || (isVerified && !dashboardData && !error)) {
    return (
      <div className="p-4 max-w-[1800px] gap-3 w-full mx-auto flex flex-col lg:grid lg:grid-cols-4 pb-24 lg:pb-0 pt-15">
        {/* Left Column */}
        <div className="flex flex-col gap-3 lg:col-span-3 w-full ">
          <div className="mb-2">
            <p className="h-5 bg-gray-200 rounded-md w-40 mb-2 animate-pulse"></p>
            <p className="h-7 bg-gray-200 rounded-md w-64  animate-pulse"></p>
          </div>
          <div className="flex flex-nowrap gap-4 overflow-x-auto scrollbar-none items-start w-full">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`flex flex-col bg-gray-200 animate-pulse rounded-2xl min-w-[200px] w-full max-w-[400px] h-35 justify-between relative overflow-hidden p-3 text-white `}
              ></div>
            ))}
          </div>
          <div className="min-h-[300px] lg:min-h-[380px] rounded-xl bg-white shadow-sm border border-gray-100 flex flex-col p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="flex-1 bg-gray-100 rounded-lg w-full"></div>
          </div>
        </div>
        {/* Right Column Skeleton */}
        <div className="flex flex-col gap-3 lg:col-span-1 w-full">
          {/* Recent Transactions Skeleton */}
          <div className="rounded-xl shadow-sm bg-white p-4 flex flex-col min-h-[320px]">
            <div className="flex justify-between items-center mb-1">
              <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </div>

            <div className="flex flex-col flex-1 ">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className=" flex justify-between items-center w-full mt-5"
                >
                  <div className="flex w-full gap-2 items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0"></div>
                    <div className="flex flex-col gap-2 ">
                      <p className="h-3 bg-gray-200 w-24 rounded-lg animate-pulse"></p>
                      <p className="h-3 bg-gray-200 w-16 rounded-lg  animate-pulse"></p>
                    </div>
                  </div>
                  <div className="  flex jusitfy-center items-center">
                    <p className="h-4 bg-gray-200 w-16 rounded-xl  animate-pulse"></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="rounded-xl shadow-lg bg-gray-500 p-4">
            <div className="h-5 bg-gray-400/20 rounded w-1/3 mb-4"></div>
            <div className="flex flex-col gap-3 animate-pulse">
              <button className="h-10 gap-2 bg-white/10  border border-white/10 transition-all rounded-lg w-full"></button>
              <button className="h-10 gap-2 bg-white/10  border border-white/10 transition-all rounded-lg w-full"></button>
              <button className="h-10 gap-2 bg-white/10 border border-white/10 transition-all rounded-lg w-full"></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    const mockAccounts = [
      { account_id: "mock-1", account_type: "checking", balance: 12840.5 },
      { account_id: "mock-2", account_type: "saving", balance: 42500.0 },
    ];
    return (
      <div className="p-4 max-w-[1800px] gap-3 w-full mx-auto flex flex-col lg:grid lg:grid-cols-4 pb-24 lg:pb-0 pt-18 md:pt-15 relative">
        {/* Left Column */}
        <div className="flex flex-col gap-3 lg:col-span-3 w-full ">
          <div className="flex w-full">
            <div>
              <p className="text-gray-500">
                {timeGreeting}, {username.toUpperCase()}
              </p>
              <p className="text-lg  font-semibold text-blue-700">
                Manage your wealth
              </p>
            </div>
          </div>

          {/* Verification Button */}
          <div className="fixed border border-gray-200 md:max-w-[400px] w-3/4 absolute top-1/3 md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 p-5 md:p-10 text-gray-900 flex flex-col justify-center items-center bg-white rounded-xl">
            <div className="w-16 h-16  rounded-full bg-blue-50 flex items-center justify-center mb-5">
              <ShieldAlert size={28} className="text-blue-600" />
            </div>
            <div className="flex flex-col gap-2 ">
              <span className="text-lg md:text-2xl font-bold text-gray-900 mb-3 tracking-tight text-center">
                Account Verification required
              </span>
              <span className="text-xs md:text-sm text-gray-500 mb-8 leading-relaxed text-center max-w-md">
                To unlock full banking features including transfers, deposits,
                and account creation, please complete your identity check.
              </span>
            </div>
            <Link
              to="/onboarding-form"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm py-2 px-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
            >
              Complete Verification
            </Link>
            <div className="flex w-full items-center justify-between mt-10">
              <div className="text-gray-400 flex gap-1 items-center justify-center">
                <LockKeyholeOpen size={18} />
                <span className="text-[10px] md:text-xs tracking-wider">
                  SECURE 256-BIT
                </span>
              </div>
              <div className="text-gray-400 flex gap-1 items-center justify-center">
                <ShieldBan size={18} />
                <span className="text-[10px] text-xs tracking-wider">
                  GDPR COMPLIANT
                </span>
              </div>
            </div>
          </div>

          {/* Left top Column */}
          <div className="flex gap-2 w-full ">
            <div className="flex flex-nowrap gap-4 overflow-x-auto scrollbar-none items-start w-full  relative">
              {mockAccounts?.map((account) => {
                const cardType = account.account_type.toLowerCase();
                let bgClass = "bg-gradient-to-br from-gray-400 to-gray-600";

                if (cardType.includes("checking")) {
                  bgClass = "bg-gradient-to-br from-blue-600 to-blue-700";
                } else if (cardType.includes("saving")) {
                  bgClass = "bg-gradient-to-br from-emerald-600 to-emerald-700";
                } else if (cardType.includes("credit")) {
                  bgClass = "bg-gradient-to-br from-purple-600 to-purple-700";
                }

                return (
                  <div
                    key={account.account_id}
                    className={`flex flex-col opacity-40 blur-[2px] rounded-2xl min-w-[200px] w-full max-w-[400px] h-35 justify-between relative overflow-hidden p-4 ${bgClass}`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                    <span className="text-white font-semibold text-lg md:text-2xl relative z-10 tracking-wide">
                      $
                      {Number(account.balance).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <div className="relative z-10">
                      <p className="md:text-lg text-white/90 tracking-wider mb-0.5">
                        {`${account.account_type.charAt(0).toUpperCase()}${account.account_type.slice(1)}`}{" "}
                        Account
                      </p>
                      <p className="text text-white/90 font-mono tracking-widest">
                        **** {account.account_id.slice(-4)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {(mockAccounts?.length || 0) < 3 && (
                <Link className="pointer-events-none flex flex-col  opacity-40 blur-[2px] rounded-2xl min-w-[200px] w-full max-w-[400px] h-35 items-center justify-center overflow-hidden p-3 border-2 border-dashed border-gray-300 cursor-pointer">
                  <div className="p-2 rounded-full flex flex-col items-center justify-center text-gray-500">
                    <Plus className="" size={24} />
                    <span>Add Account</span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Transaction in last month */}
          <div className="min-h-[300px] lg:min-h-0 rounded-xl shadow-lg bg-white flex flex-col overflow-hidden opacity-40 blur-[2px] pointer-events-none">
            <MonthlyOverviewChart accountList={mockAccounts} isMock={true} />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-3 lg:col-span-1 w-full">
          <div className="rounded-xl shadow-lg bg-white flex flex-col min-h-0 h-full p-4 overflow-hidden opacity-40 blur-[2px] pointer-events-none">
            <div className="flex justify-between items-center mb-1 ">
              <h2 className="text-gray-700 text-lg font-semibold">
                Recent Transactions
              </h2>
              <p className="text-xs md:text-sm font-semibold text-gray-600">
                View All
              </p>
            </div>
            <div className="flex flex-col items-center justify-center w-full h-full min-h-[300px]">
              <History size={25} className="md:mb-4" />
              <span className="text-gray-800 font-semibold">
                No activity found
              </span>
              <span className="text-sm  text-gray-500 text-center">
                Make your first deposit to see transactions.
              </span>
            </div>
          </div>

          {/* Quick Transfer */}
          <div className="rounded-xl shadow-lg bg-blue-700 opacity-40 blur-[2px] pointer-events-none relative">
            <p className="text-white text-lg font-semibold px-4 py-2">
              Quick Actions
            </p>
            <div className="flex flex-col gap-3 px-4 mb-4">
              <button
                className={`flex items-center gap-2 text-white font-semibold bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-sm rounded-lg p-2 w-full`}
                onClick={() => handleModal("deposit")}
              >
                Deposit
              </button>
              <button
                className="flex items-center  gap-2 text-white font-semibold bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-sm rounded-lg p-2 w-full cursor-pointer"
                onClick={() => handleModal("transfer")}
              >
                Transfer
              </button>
              <button
                className="flex items-center  gap-2 text-white font-semibold bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-sm rounded-lg p-2 w-full cursor-pointer"
                onClick={() => handleModal("withdraw")}
              >
                Cash Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasAccounts = dashboardData?.data?.accounts?.length > 0;

  return (
    <div className="p-4 max-w-[1800px] gap-3 w-full mx-auto flex flex-col lg:grid lg:grid-cols-4 pb-24 lg:pb-0 pt-20 md:pt-15">
      {/* Left Column */}
      <div className="flex flex-col gap-3 lg:col-span-3 w-full ">
        <div className="flex w-full">
          <div>
            <p className="text-gray-500">
              {timeGreeting}, {username}
            </p>
            <p className="text-lg  font-semibold text-blue-700">
              Manage your wealth
            </p>
          </div>
        </div>

        {/* Left top Column */}
        <div className="flex gap-2 w-full ">
          {dashboardData?.data?.accounts?.length === 0 ? (
            <div className="flex w-full bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-6 items-center justify-between">
              <div className="flex gap-8 items-center justify-center">
                {/* Icon */}
                <div className="w-20 h-20 md:flex items-center justify-center p-4 bg-white/20 rounded-lg hidden">
                  <Wallet size={45} color="white" />
                </div>
                {/* Text */}
                <div className="flex flex-col">
                  <span className="text-white text-sm md:text-lg  font-semibold">
                    Welcome to United Bank
                  </span>
                  <span className="text-gray-300 text-sm md:text-base hidden md:block max-w-md leading-relaxed">
                    Your financial journey starts here. Open your first account
                    to securely manage your wealth, track expenses, and easily
                    transfer funds.
                  </span>
                </div>
              </div>
              <Link
                to="/open-account"
                className="text-blue-800 gap-2 shrink-0 bg-white flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Plus size={20} />
                <span className="font-semibold md:text-base text-xs">
                  Open First Account
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-nowrap gap-4 overflow-x-auto scrollbar-none items-start w-full">
              {dashboardData?.data?.accounts?.map((account) => {
                const cardType = account.account_type.toLowerCase();
                let bgClass = "bg-gradient-to-br from-gray-400 to-gray-600";

                if (cardType.includes("checking")) {
                  bgClass = "bg-gradient-to-br from-blue-600 to-blue-700";
                } else if (cardType.includes("saving")) {
                  bgClass = "bg-gradient-to-br from-emerald-600 to-emerald-700";
                } else if (cardType.includes("credit")) {
                  bgClass = "bg-gradient-to-br from-purple-600 to-purple-700";
                }

                return (
                  <div
                    key={account.account_id}
                    className={`flex flex-col rounded-2xl min-w-[200px] w-full max-w-[400px] h-35 justify-between relative overflow-hidden p-4 ${bgClass}`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                    <span className="text-white font-semibold text-lg md:text-2xl relative z-10 tracking-wide">
                      $
                      {Number(account.balance).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <div className="relative z-10">
                      <p className="md:text-lg text-white/90 tracking-wider mb-0.5">
                        {`${account.account_type.charAt(0).toUpperCase()}${account.account_type.slice(1)}`}{" "}
                        Account
                      </p>
                      <p className="text text-white/90 font-mono tracking-widest">
                        **** {account.account_id.slice(-4)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {(dashboardData?.data?.accounts?.length || 0) < 3 && (
                <Link
                  to="/open-account"
                  className=" flex flex-col rounded-2xl min-w-[200px] w-full max-w-[400px] h-35 items-center justify-center overflow-hidden p-3 border-2 border-dashed border-gray-300 cursor-pointer"
                >
                  <div className="p-2 rounded-full flex flex-col items-center justify-center text-gray-500">
                    <Plus className="" size={24} />
                    <span>Add Account</span>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Chart data */}
        <div className="md:min-h-[400px] min-h-[300px]  rounded-xl shadow-lg bg-white flex flex-col overflow-hidden">
          <MonthlyOverviewChart
            accountList={dashboardData?.data?.accounts || []}
          />
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-3 lg:col-span-1 w-full">
        {dashboardData?.data?.transactions?.length === 0 ? (
          <div className="rounded-xl shadow-lg bg-white flex flex-col min-h-0 h-full p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-1 ">
              <h2 className="text-gray-700 text-lg font-semibold">
                Recent Transactions
              </h2>
              <p className="text-xs md:text-sm font-semibold text-gray-600">
                View All
              </p>
            </div>
            <div className="flex flex-col items-center justify-center w-full min-h-[300px]">
              <div className="flex items-center justify-center mb-4">
                <History size={25} className="text-gray-700" />
              </div>

              <span className="text-gray-800 font-semibold">
                No activity found
              </span>
              <span className="text-xs md:text-sm text-gray-500 text-center">
                Make your first deposit to see transactions.
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl shadow-lg bg-white flex flex-col min-h-0  p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-1 ">
              <h2 className="text-gray-700 text-lg font-semibold">
                Recent Transactions
              </h2>
              <Link
                to="/transactions-all"
                className="text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                state={{ accountsData: dashboardData?.data?.accounts }}
              >
                View All
              </Link>
            </div>
            <div className="min-h-[360px] flex flex-col overflow-y-auto hide-scrollbar flex-1 max-h-[360px]">
              {dashboardData?.data?.transactions?.slice(0, 5).map((tx) => {
                const initial = tx.counterparty
                  ? tx.counterparty.charAt(0).toUpperCase()
                  : "?";
                const formattedDate = new Date(
                  tx.created_at,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const isIncome = Number(tx.amount) > 0;
                return (
                  <div
                    key={tx.transaction_id}
                    className=" flex justify-between items-center w-full mt-7 "
                  >
                    <div className="flex w-full gap-2 items-center ">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                        {initial}
                      </div>
                      <div className="flex flex-col">
                        <p className=" text-gray-900 text-xs md:text-sm">
                          {tx.counterparty.charAt(0).toUpperCase()}
                          {tx.counterparty.slice(1)}
                        </p>
                        <p className="text-xs md;:text-xs text-gray-400">
                          {formattedDate}
                        </p>
                      </div>
                    </div>
                    <div className="  flex jusitfy-center items-center">
                      <p
                        className={`font-semibold text-sm ${isIncome ? "text-emerald-500" : "text-red-500"}`}
                      >
                        {isIncome ? "+" : "-"}$
                        {Math.abs(Number(tx.amount)).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Transfer */}
        <div className={`rounded-xl shadow-lg bg-blue-700 relative `}>
          {!hasAccounts && (
            <div className="absolute inset-0 z-10 bg-blue-900/20 backdrop-blur-[2px] flex items-center justify-center rounded-xl pointer-events-none">
              <Link
                to="/open-account"
                className="text-blue-800 gap-2 bg-white flex items-center justify-center px-4 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-all active:scale-95 font-bold"
              >
                <Plus size={18} />
                <span className="text-sm">Open First Account</span>
              </Link>
            </div>
          )}

          <p className="text-white text-lg font-semibold px-4 py-2">
            Quick Actions
          </p>
          <div className="flex flex-col gap-3 px-4 mb-4">
            <button
              disabled = {!hasAccounts}
              className={`flex items-center gap-2 text-white font-semibold bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-sm rounded-lg p-2 w-full cursor-pointer`}
              onClick={() => handleModal("deposit")}
            >
              Deposit
            </button>
            <button
            disabled ={!hasAccounts}
              className="flex items-center  gap-2 text-white font-semibold bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-sm rounded-lg p-2 w-full cursor-pointer"
              onClick={() => handleModal("transfer")}
            >
              Transfer
            </button>
            <button
            disabled ={!hasAccounts}
              className="flex items-center  gap-2 text-white font-semibold bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-sm rounded-lg p-2 w-full cursor-pointer"
              onClick={() => handleModal("withdraw")}
            >
              Cash Out
            </button>
          </div>
        </div>
      </div>
      {/* Quick Transfer */}
      {isModalOpen && (
        <DesktopTransferModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultAction={modalAction}
          accountList={dashboardData?.data?.accounts || []}
        />
      )}
    </div>
  );
};

export default Dashboard;
