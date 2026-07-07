// This is the page to show the transaction lists for all the accounts.
import { useOutletContext, useLocation, Link } from "react-router-dom";
import TransactionHistory from "./TransactionHistory";
import { Filter, PiggyBank, ChevronRight, ArrowLeft } from "lucide-react";
import CustomDropdown from "./components/dropdown/CustomDropdown";
import { useState } from "react";
const GlobalTransactions = () => {
  //   const context = useOutletContext() || [];
  //   const dashboardData = context.dashboardData;;
  //   const accounts = dashboardData?.data?.accounts || [];
  const location = useLocation();
  const accounts = location.state?.accountsData || [];
  const [selectedAccountId, setSelectedAccountId] = useState("all");

  return (
    <div className="md:p-6 p-4 bg-gray-100 h-screen">
      <Link
        to="/dashboard"
        className="mb-5 max-w-[200px] flex items-center gap-2 p-2 text-gray-500 font-medium self-start hover:text-gray-900 group"
      >
        <ArrowLeft size={18}></ArrowLeft>
        Back to dashboard
      </Link>
      <div className="flex justify-between items-center">
        {/* Title */}
        <div className="flex flex-col items-start justify-center">
          <p className="text-sm md:text-lg font-semibold">Transaction History</p>
          <p className="text-xs md:text-base text-gray-500">
            Manage and review your recent financial activity
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <CustomDropdown
            selectedValue={selectedAccountId}
            displayValue={
              selectedAccountId === "all"
                ? "All"
                : accounts
                    .find((a) => a.account_id === selectedAccountId)
                    ?.account_type
            }
            options={[
              { label: "All", value: "all" },
              ...accounts.map((acc) => ({
                label: `${acc.account_type.charAt(0).toUpperCase()}${acc.account_type.slice(1)}`,
                value: acc.account_id,
              })),
            ]}
            onSelect={(val) => setSelectedAccountId(val)}
          />
        </div>
      </div>

      <TransactionHistory account_id={selectedAccountId} />
    </div>
  );
};
export default GlobalTransactions;
