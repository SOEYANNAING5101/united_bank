import React, { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { Loader2, AlertCircle, ArrowRightLeft, Receipt } from "lucide-react";

const generateLast12Months = () => {
  const months = [];
  const date = new Date();
  for (let i = 0; i < 12; i++) {
    const monthLabel = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
    const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, 0)}`;
    months.push({ value: monthValue, label: monthLabel });
    date.setMonth(date.getMonth() - 1);
  }
  return months;
};

const TransactionHistory = ({ account_id = "all" }) => {
  const { getToken } = useAuth();
  const months = useMemo(() => generateLast12Months(), []);
  const [activeMonth, setActiveMonth] = useState(months[0].value);
  const testing = true;
   const [filterType, setFilterType] = useState("all");
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError,
    isFetching,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["transactions", account_id, activeMonth,filterType],
    queryFn: async ({ pageParam = 1 }) => {
      const token = await getToken();
      const response = await fetch(
        `http://localhost:5000/api/accounts/history/${account_id}?month=${activeMonth}&page=${pageParam}&filter=${filterType}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
  const transactions = data?.pages.flatMap((page) => page.transactions) || []; 
  return (
    <div className="w-full mb-4">
      {/* Month Nav Bar */}
      <div className="flex overflow-x-auto scrollbar-hide pb-4 mt-2 gap-2">
        {months.map((month) => (
          <button
            key={month.value}
            onClick={() => setActiveMonth(month.value)}
            className={`w-full flex flex-col whitespace-nowrap px-5 py-2 rounded-full text-xs md:text-sm text-gray-500 items-center justify-center cursor-pointer  ${
              activeMonth === month.value
                ? "bg-blue-700 text-white font-semibold"
                : "border border-gray-100 bg-gray-200 hover:bg-blue-700 hover:text-white font-semibold"
            }`}
          >
            {month.label}
          </button>
        ))}
      </div>
      <div className="w-full flex justify-between items-center gap-2 mt-2">
        <input
          className="border border-gray-300 px-2 py-1 w-full max-w-[150px] text-xs md:text-base md:max-w-[700px] rounded-md focus-ring focus-gray-200"
          placeholder="Search Transactions"
        ></input>
        <div className="flex gap-2">
          {["All", "Money In", "Money Out"].map((type) => {
            const stateValue = type.toLowerCase().replace(" ", "_");
            const isActive = filterType === stateValue;
            return (
              <button
                onClick={() => setFilterType(stateValue)}
                className={`text-xs md:text-sm items-center justify-center px-2 py-1 md:px-4 md:py-1 rounded-md cursor-pointer  ${
                  isActive 
                  ? "bg-blue-700 text-white font-semibold"
                  : "text-gray-500 border border-gray-300 hover:text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div> 
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="mt-2 flex items-center gap-3 justify-center text-sm text-blue-700 py-10">
          <Loader2 className="animate-spin" size={35} /> <span>Loading</span>
        </div>
      ) : isError ? (
        <div className="mt-2 flex items-center gap-3 justify-center text-sm text-blue-700 py-10">
          <AlertCircle className="" size={35} /> <span>err</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="mt-2 flex items-center gap-3 justify-center text-sm text-gray-700 py-10">
          <Receipt className="" size={35} />{" "}
          <span>No transactions found for this month</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-2">
          {transactions.map((tx) => {
            const isIncome = Number(tx.amount) > 0;

            return (
              <div className="w-full flex items-center justify-between border border-gray-100 shadow-sm p-4 bg-white rounded-xl">
                <div className="flex gap-4">
                  {/* Icon Div */}
                  <div className="w-10 h-10 bg-gray-100 text-sm text-gray-700 rounded-lg flex items-center justify-center">
                    <ArrowRightLeft size={18} />
                  </div>
                  {/* Name & Date */}
                  <div className="flex flex-col ml-3">
                    <span className="text-sm text-gray-700 font-semibold">
                      {tx.counterparty}
                    </span>
                    <span className=" text-gray-500 text-xs">
                      {new Date(tx.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Amount & Status */}
                <div className="flex flex-col ml-3 items-end">
                  <span
                    className={`font-semibold text-sm ${isIncome ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {isIncome ? "+" : "-"}$
                    {Math.abs(Number(tx.amount)).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span className=" text-gray-500 text-xs">
                    {tx.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Load more button */}
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mt-4 py-3 w-full border border-gray-300 rounded-xl bg-gray-200 text-sm text-gray-700 font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isFetchingNextPage ? (
                <div className="mt-2 flex items-center gap-3 justify-center text-sm text-blue-700 py-10">
                  <Loader2 className="animate-spin" size={35} />{" "}
                  <span>Loading</span>
                </div>
              ) : (
                "View More"
              )}
            </button>
          )}

          {/* End of list message */}
          {!hasNextPage && transactions.length > 0 && (
            <p className="text-center text-xs text-gray-400 mt-4">
              End of history for{" "}
              {months.find((m) => m.value === activeMonth)?.label}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
