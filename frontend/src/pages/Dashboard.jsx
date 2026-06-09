import { useNavigate, useOutletContext } from "react-router-dom";
import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const Dashboard = () => {
  const { dashboardData, error } = useOutletContext();
  const today = new Date();
  const currentMonthYear = today.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  if (!dashboardData && !error) {
    return (
      // Cleaned up the loading screen so it fits perfectly inside the layout
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <p className="text-gray-500 font-medium animate-pulse">
          Unlocking vault...
        </p>
      </div>
    );
  }
  console.log("dashboard data:", dashboardData);
  // LOOK HERE! 👇 We removed the outer divs and <main> tags.
  // It now immediately returns your grid!
  return (
    <div className=" max-w-[1600px] w-full mx-auto flex flex-col lg:grid lg:grid-cols-4 lg:h-[calc(100vh-80px)] 2xl:max-h-[650px] overflow-y-auto pb-24 lg:pb-0">
      {/* Left Column */}
      <div className="flex flex-col lg:grid lg:grid-rows-5 gap-2 lg:col-span-2 lg:h-full p-2 min-w-0">
        <div className="md:hidden p-4">
          <p className="text-gray-500">Good Morning, Yan</p>
          <p className="text-lg font-semibold">Manager your wealth</p>
        </div>

        {/* Balance Card */}
        <div className="lg:row-span-2 rounded-xl shadow-lg bg-white p-4 flex flex-col min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-gray-800 md:text-xl font-bold">Balance</h2>
          </div>
          <h2 className="md:text-xl text-lg font-semibold text-gray-900 mb-6">
            ${dashboardData?.data?.totalBalance}
          </h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar flex-grow items-start ">
            {dashboardData?.data?.accounts?.map((account) => {
              const cardType = account.account_type.toLowerCase();
              let bgClass = "bg-gradient-to-br from-gray-400 to-gray-600";

              if (cardType.includes("checking")) {
                bgClass = "bg-gradient-to-br from-blue-400 to-blue-600"; // Checking = Blue
              } else if (cardType.includes("saving")) {
                bgClass = "bg-gradient-to-br from-emerald-400 to-emerald-600"; // Savings = Green
              } else if (cardType.includes("credit")) {
                bgClass = "bg-gradient-to-br from-purple-400 to-purple-600"; // Credit = Purple
              }

              return (
                <div
                  key={account.account_id}
                  className={`flex flex-col rounded-2xl min-w-[200px] h-30 justify-between relative overflow-hidden flex-shrink-0 p-3 shadow-md text-white ${bgClass}`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                  <span className="font-semibold text-xl relative z-10 tracking-wide">
                    $
                    {Number(account.balance).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <div className="relative z-10">
                    <p className="text-[11px] opacity-90 uppercase tracking-wider mb-0.5">
                      {account.account_type}
                    </p>
                    <p className="text-sm font-mono tracking-widest">
                      **** {account.account_id.slice(-4)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction in last month */}
        <div className="min-h-[200px] lg:min-h-0 lg:row-span-2 rounded-xl shadow-lg bg-white">
          <h2 className="text-gray-800 md:text-xl font-bold">
            Monthly Overview
          </h2>
        </div>

        {/* Total income & spending */}
        <div className="flex flex:col lg:grid lg:grid-cols-2 row-span-1 gap-2 ">
          <div className="min-h-[100px] flex items-end justify-between w-full p-4 lg:col-span-1 rounded-xl shadow-lg bg-white">
            <div>
              <div className="mb-2">
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
          <div className="min-h-[100px] flex items-end justify-between w-full p-4 lg:col-span-1 rounded-xl shadow-lg bg-white">
            <div>
              <div className="mb-2">
                <h2 className="text-gray-800 md:text-xl font-bold">Spending</h2>
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
        </div>
      </div>

      {/* Recent transaction */}
      <div className="flex flex-col lg:grid lg:grid-rows-5 gap-2 p-2 lg:col-span-1 min-w-0">
        <div className="lg:row-span-3 rounded-xl shadow-lg bg-white flex flex-col min-h-0 p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-1 shrink-0">
            <h2 className="text-gray-800 md:text-xl font-bold">
              Recent Transactions
            </h2>
            <button className="text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              View All
            </button>
          </div>
          <div className="flex flex-col overflow-y-auto hide-scrollbar flex-1">
            {dashboardData?.data?.transactions?.slice(0, 5).map((tx) => {
              const initial = tx.counterparty
                ? tx.counterparty.charAt(0).toUpperCase()
                : "?";
              const formattedDate = new Date(tx.created_at).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                },
              );
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
                        {tx.counterparty.toUpperCase()}
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
        <div className="lg:row-span-2 rounded-xl shadow-lg bg-white">
          <h1>New div: will be implemented later</h1>
        </div>
      </div>
      <div className="p-2">
        <div className="min-h-[200px] h-full lg:min-h-0 lg:col-span-1 bg-white rounded-xl shadow-lg">
          <h1>Quick Transfer: To be implemented later</h1>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
