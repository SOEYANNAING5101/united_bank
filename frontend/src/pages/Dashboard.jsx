import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { useState } from "react";
import { TrendingUp, TrendingDown, Plus, History, Wallet } from "lucide-react";
import MonthlyOverviewChart from "./MonthlyOverviewChart";
import DesktopTransferModal from "./components/transactions/DesktopTransferModal";

const Dashboard = () => {
  const { dashboardData, error } = useOutletContext();
  const today = new Date();
  const currentMonthYear = today.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("deposit");
  if (!dashboardData && !error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <p className="text-gray-500 font-medium animate-pulse">
          Unlocking vault...
        </p>
      </div>
    );
  }
  const handleModal = (action) => {
    setIsModalOpen(true);
    setModalAction(action);
  };

  return (
    <div className="p-4 max-w-[1800px] gap-3 w-full mx-auto flex flex-col lg:grid lg:grid-cols-4 pb-24 lg:pb-0 pt-15">
      {/* Left Column */}
      <div className="flex flex-col gap-3 lg:col-span-3 w-full ">
        <div className="flex w-full">
          <div>
            <p className="md:text-lg text-gray-500">Good Morning, Yan</p>
            <p className="text-lg md:text-2xl font-semibold text-blue-700">Manager your wealth</p>
          </div>
          {/* Total income & spending */}
          {/* <div className="flex flex:col gap-2 w-full max-w-[900px] ">
            <div className=" flex items-end justify-between w-full p-4 rounded-xl shadow-lg bg-white">
              <div>
                <div className="mb-2 ">
                  <h2 className="text-gray-800 md:text-xl font-bold">Income</h2>

                  <span className="text-xs text-gray-400">
                    {currentMonthYear}
                  </span>
                </div>

                <p className="text-blue-800 md:text-lg font-semibold">
                  $
                  {Number(dashboardData?.data?.totalIncome || 0).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                    },
                  )}
                </p>
              </div>
              <div
                className={`flex items-center rounded-full text-xs font-semibold px-2 py-1 gap-1 
              ${
                dashboardData?.data?.incomeTrend >= 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
              >
                {dashboardData?.data?.incomeTrend >= 0 ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                <span>
                  {dashboardData?.data?.incomeTrend > 0 ? "+" : "-"}
                  {dashboardData?.data?.incomeTrend} %
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between w-full p-4 lg:col-span-1 rounded-xl shadow-lg bg-white">
              <div>
                <div className="mb-2">
                  <h2 className="text-gray-800 md:text-xl font-bold">
                    Spending
                  </h2>
                  <span className="text-xs text-gray-400">
                    {currentMonthYear}
                  </span>
                </div>

                <p>
                  $
                  {Number(dashboardData?.data?.totalSpending).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                    },
                  )}
                </p>
              </div>

              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  dashboardData?.data?.spendingTrend <= 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {dashboardData?.data?.spendingTrend <= 0 ? (
                  <TrendingDown size={14} />
                ) : (
                  <TrendingUp size={14} />
                )}
                <span>
                  {dashboardData?.data?.spendingTrend > 0 ? "+" : ""}
                  {dashboardData?.data?.spendingTrend}%
                </span>
              </div>
            </div>
          </div> */}
        </div>

        {/* Left top Column */}
        <div className="flex gap-2 w-full ">
          {dashboardData?.data?.accounts?.length === 0 ? (
            <div className="flex w-full bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-4 items-center justify-between">
              <div className="flex gap-6 items-center justify-center">
                {/* Icon */}
                <div className="w-10 h-10 p-2 bg-white/20 rounded-lg hidden md:block">
                  <Wallet color="white" />
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
                className="text-blue-800 shrink-0 bg-white flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
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
                    className={`flex flex-col rounded-2xl min-w-[200px] w-full max-w-[400px] h-35 justify-between relative overflow-hidden p-3 text-white ${bgClass}`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                    <span className="font-semibold text-lg md:text-2xl relative z-10 tracking-wide">
                      $
                      {Number(account.balance).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <div className="relative z-10">
                      <p className="md:text-lg opacity-90 tracking-wider mb-0.5">
                        {`${account.account_type.charAt(0).toUpperCase()}${account.account_type.slice(1)}`}{" "}
                        Account
                      </p>
                      <p className="text-lg font-mono tracking-widest">
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

        {/* Transaction in last month */}
        <div className="min-h-[300px] lg:min-h-0 rounded-xl shadow-lg bg-white flex flex-col overflow-hidden">
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
              <p
                className="text-xs md:text-sm font-semibold text-gray-600" 
              >
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
        ) : (
          <div className="rounded-xl shadow-lg bg-white flex flex-col min-h-0 h-full p-4 overflow-hidden">
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
            <div className="flex flex-col overflow-y-auto hide-scrollbar flex-1">
              {dashboardData?.data?.transactions?.slice(0, 6).map((tx) => {
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
                    className=" flex justify-between items-center w-full mt-5 "
                  >
                    <div className="flex w-full gap-2 items-center ">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                        {initial}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-900 text-xs md:text-sm">
                          {tx.counterparty.charAt(0).toUpperCase()}{tx.counterparty.slice(1)}
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
              {/* {(dashboardData?.data?.transactions?.length === 0) < 3 && (
              <div className="flex flex-col items-center justify-center w-full">
                <History size={25} className="mb-4" />
                <span className="text-gray-800 font-semibold">No activity found</span>
                <span className="text-sm  text-gray-500 text-center">
                  Make your first deposit to see transactions.
                </span>
              </div>
            )} */}
            </div>
          </div>
        )}

        {/* Quick Transfer */}
        <div className="rounded-xl shadow-lg bg-blue-700  ">
          <p className="text-white text-lg font-semibold px-4 py-2">
            Quick Actions
          </p>
          <div className="flex flex-col gap-3 px-4 mb-4">
            <button
              className="flex items-center  gap-2 text-white font-semibold bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-sm rounded-lg p-2 w-full cursor-pointer"
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
