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
    queryKey: ["transactions", account_id, activeMonth],
    queryFn: async ({ pageParam = 1 }) => {
      const token = await getToken();
      const response = await fetch(
        `http://localhost:5000/api/accounts/history/${account_id}?month=${activeMonth}&page=${pageParam}`,
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
    <div className="w-full mt-4 mb-4">
      {/* Header */}
      <div>
        <p className="text-gray-700 font-semibold">Transaction History</p>
      </div>
      {/* Month Nav Bar */}
      <div className="flex overflow-x-auto scrollbar-hide pb-4 mt-2 gap-2">
        {months.map((month) => (
          <button
            key={month.value}
            onClick={() => setActiveMonth(month.value)}
            className={`w-full flex flex-col whitespace-nowrap px-5 py-2 rounded-full text-sm text-gray-700 items-center justify-center  ${
              activeMonth === month.value
                ? "bg-blue-700 text-white font-semibold"
                : "border border-gray-100 bg-gray-200 hover:bg-blue-700 hover:text-white font-semibold"
            }`}
          >
            {month.label}
          </button>
        ))}
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
          {transactions.map((tx) => (
            <div className="w-full flex items-center justify-between border border-gray-100 shadow-sm p-4 bg-white rounded-xl">
              <div className="flex gap-4">
                {/* Icon Div */}
                <div className="w-10 h-10 bg-gray-200 text-sm text-gray-700 rounded-xl flex items-center justify-center">
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
                <span className="text-sm text-gray-700 font-semibold">
                  ${Math.abs(Number(tx.amount))}
                </span>
                <span className=" text-gray-500 text-xs">
                  {tx.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}

          {/* Load more button */}
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mt-4 py-3 w-full border border-gray-300 rounded-xl bg-gray-200 text-sm text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
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
