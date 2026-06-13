import React, { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { Loader2, Receipt, AlertCircle, ShoppingBag, Utensils, Zap, ArrowRightLeft, Briefcase } from "lucide-react";

// Helper to generate the last 12 months dynamically
const generateLast12Months = () => {
  const months = [];
  const date = new Date();
  for (let i = 0; i < 12; i++) {
    const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = date.toLocaleString("en-US", { month: "short", year: "numeric" });
    months.push({ value: monthValue, label: monthLabel });
    date.setMonth(date.getMonth() - 1);
  }
  return months;
};

// Helper to pick icons based on category
const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case "dining": return <Utensils size={20} className="text-orange-500" />;
    case "electronics": return <Zap size={20} className="text-yellow-500" />;
    case "shopping": return <ShoppingBag size={20} className="text-purple-500" />;
    case "salary": return <Briefcase size={20} className="text-emerald-500" />;
    case "transfer": return <ArrowRightLeft size={20} className="text-blue-500" />;
    default: return <Receipt size={20} className="text-gray-500" />;
  }
};

const TransactionHistory = ({ accountId = "all" }) => {
  const { getToken } = useAuth();
  const months = useMemo(() => generateLast12Months(), []);
  
  // Default to the current month
  const [activeMonth, setActiveMonth] = useState(months[0].value);

  // TanStack Infinite Query Magic
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ["transactions", accountId, activeMonth],
    queryFn: async ({ pageParam = 1 }) => {
      const token = await getToken();
      const response = await fetch(
        `http://localhost:5000/api/accounts/history/${accountId}?month=${activeMonth}&page=${pageParam}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextPage, // Returns the next page number or null
  });

  // Flatten the array of pages into one single list of transactions
  const transactions = data?.pages.flatMap((page) => page.transactions) || [];
  

  return (
    <div className="w-full flex flex-col mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
      </div>

      {/* 12-Month Horizontal Navigation Bar */}
      <div className="flex overflow-x-auto pb-4 mb-2 gap-2 scrollbar-hide">
        {months.map((month) => (
          <button
            key={month.value}
            onClick={() => setActiveMonth(month.value)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              activeMonth === month.value
                ? "bg-blue-700 text-white shadow-md"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {month.label}
          </button>
        ))}
      </div>

      {/* Loading State for initial fetch */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center gap-2 text-red-500 py-10">
          <AlertCircle size={24} />
          <p>{error.message}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Receipt size={48} className="mb-3 opacity-50" />
          <p>No transactions found for this month.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Map through the transactions */}
          {transactions.map((tx) => (
            <div key={tx.transaction_id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex justify-center items-center">
                  {getCategoryIcon(tx.category)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900">{tx.counterparty}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} 
                    {accountId === "all" && tx.account_type && ` • ${tx.account_type}`}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`font-bold ${Number(tx.amount) > 0 ? "text-emerald-500" : "text-gray-900"}`}>
                  {Number(tx.amount) > 0 ? "+" : ""}${Math.abs(Number(tx.amount)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-gray-400">{tx.status}</span>
              </div>
            </div>
          ))}

          {/* Load More Button - Only shows if hasNextPage is true */}
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mt-4 py-3 w-full border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isFetchingNextPage ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Loading...
                </span>
              ) : (
                "View More Transactions"
              )}
            </button>
          )}

          {/* End of list message */}
          {!hasNextPage && transactions.length > 0 && (
            <p className="text-center text-xs text-gray-400 mt-4">
              End of history for {months.find(m => m.value === activeMonth)?.label}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;