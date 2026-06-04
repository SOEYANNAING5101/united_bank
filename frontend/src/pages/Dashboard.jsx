import { useNavigate, useOutletContext } from "react-router-dom";
import { useState } from "react";
// Removed Link, Outlet, and ArrowRightLeft because they aren't needed here anymore!

const Dashboard = () => {
  const {dashboardData,error} = useOutletContext();
  console.log(dashboardData)
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

  // LOOK HERE! 👇 We removed the outer divs and <main> tags. 
  // It now immediately returns your grid!
  return (
    <div className="grid grid-cols-4 gap-2 h-[calc(100vh-100px)]">
      
      {/* Left Column */}
      <div className="grid grid-rows-5 gap-2 col-span-2 h-full">
        {/* Balance Card */}
        <div className="row-span-2 rounded-xl shadow-lg bg-white p-4">
          <div className="flex justify-between items-start mb-1">
            <h2 className="text font-bold">Balance</h2>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            ${dashboardData?.data?.totalBalance}
          </h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar flex-grow items-start ">
            {dashboardData?.data?.accounts?.map((account) => {
              const cardType = account.account_type.toLowerCase();
              let bgClass = "bg-gradient-to-br from-gray-400 to-gray-600";

              if (cardType.includes("checking")) {
                bgClass = "bg-gradient-to-br from-blue-400 to-blue-600"; // Checking = Blue
              } else if (cardType.includes("saving")) {
                bgClass =
                  "bg-gradient-to-br from-emerald-400 to-emerald-600"; // Savings = Green
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
        <div className="row-span-2 rounded-xl shadow-lg bg-white"></div>

        {/* Total income & spending */}
        <div className="grid grid-cols-2 row-span-1 gap-2">
          <div className="col-span-1 rounded-xl shadow-lg bg-white"></div>
          <div className="col-span-1 rounded-xl shadow-lg bg-white"></div>
        </div>
      </div>

      {/* Recent transaction */}
      <div className="grid grid-rows-5 gap-2 col-span-1 h-full min-h-0">
        <div className="row-span-3 rounded-xl shadow-lg bg-white flex flex-col min-h-0 p-4">
          <div className="flex justify-between items-start mb-1 shrink-0">
            <h2 className="text font-bold">Recent Transactions</h2>
          </div>
          <div className="flex flex-col overflow-y-auto hide-scrollbar flex-1">
            {dashboardData?.data?.transactions?.map((tx) => {
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
                <div key={tx.transaction_id} className="flex items-center justify-between mt-5">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                    {initial}
                  </div>
                  <div className="flex flex-col mr-30">
                    <p className="font-semibold text-gray-900 text-sm">
                      {tx.counterparty.toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">{formattedDate}</p>
                  </div>
                  <p
                    className={`font-semibold ${isIncome ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {isIncome ? "+" : "-"}$
                    {Math.abs(Number(tx.amount)).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="row-span-2 rounded-xl shadow-lg bg-white"></div>
      </div>
      <div className="col-span-1 bg-white rounded-xl shadow-lg"></div>
    </div>
  );
};

export default Dashboard;