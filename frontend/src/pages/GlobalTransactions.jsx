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
  console.log("accounts", accounts);
  console.log("selectedAccountId", selectedAccountId);
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
        <div className="flex flex-col items-start justify-center md:gap-2">
          <p className="text-sm md:text-lg font-semibold">Transaction History</p>
          <p className="text-xs md:text-base text-gray-500">
            Manage and review your recent financial activity
          </p>
        </div>
        {/* Account Selection*/}
        {/* <div className="flex flex-col items-center justify-center gap-2">
          <label>Select Account</label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="p-3 rounded-full text-sm text-gray-700 items-center justify-center max-w-[200px] border border-gray-100 bg-gray-200 font-semibold"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option value={acc.account_id}>
                {acc.account_type.toUpperCase()} (***
                {acc.account_number.slice(-4)})
              </option>
            ))}
          </select>
        </div> */}
        <div className="flex flex-col items-center justify-center gap-2">
          <CustomDropdown
            selectedValue={selectedAccountId}
            displayValue={
              selectedAccountId === "all"
                ? "All Accounts"
                : accounts
                    .find((a) => a.account_id === selectedAccountId)
                    ?.account_type.toUpperCase()
            }
            options={[
              { label: "All Accounts", value: "all" },
              ...accounts.map((acc) => ({
                label: `${acc.account_type.charAt(0).toUpperCase()}${acc.account_type.slice(1)} Account`,
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
