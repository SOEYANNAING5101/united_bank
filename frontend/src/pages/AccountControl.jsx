import {
  Plus,
  Landmark,
  PiggyBank,
  CreditCard,
  EllipsisVertical,
  Eye,
  ArrowRightLeft,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
const AccountControl = () => {
  const { dashboardData, error } = useOutletContext();
  const accounts = dashboardData?.data?.accounts || [];
  console.log("dashboarddata",dashboardData)
  const [dropDownId, setDropDownId] = useState("");

  const toggleDropDown = (account_id) => {
    if (dropDownId === account_id) {
      setDropDownId(null);
    } else {
      setDropDownId(account_id);
    }
  };
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="justify-between flex mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Accounts Ledger
          </h1>
          <p className="text-gray-500">
            Manage your active accounts and settings.
          </p>
        </div>

        <Link
          to="/open-account"
          className="flex items-center px-5 py-2.5 cursor-pointer gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors gap-2"
        >
          <Plus size={20} />
          Open Account
        </Link>
      </div>
      {/* Account List */}
      <div className="bg-white rounded-lg shadow-md overflow-visible">
        {/* Header Row */}
        <div className=" grid grid-cols-12 gap-4 p-4 rounded-t-lg bg-gray-200 text-gray-500 font-semibold bg-gray-100">
          <div className="col-span-5">ACCOUNT NAME</div>
          <div className="col-span-3">ACCOUNT NUMBER</div>
          <div className="col-span-3 text-right">BALANCE</div>
          <div className="col-span-1 text-center">ACTION</div>
        </div>

        {/* Account list */}
        {accounts.length === 0 && !error ? (
          <div>No accounts found. Open one to get started!</div>
        ) : (
          accounts.map((account) => {
            const type = account.account_type.toLowerCase();
            let Icon = Landmark;
            let themeColor = "text-blue-600";
            let themeBg = "bg-blue-100";
            if (type.includes("saving")) {
              Icon = PiggyBank;
              themeColor = "text-emerald-600";
              themeBg = "bg-emerald-100";
            } else if (type.includes("credit")) {
              Icon = CreditCard;
              themeColor = "text-purple-600";
              themeBg = "bg-purple-100";
            }
            return (
              <div className="grid grid-cols-12 rounded-b-lg gap-4 p-4 bg-gray-50 text-gray-500 font-semibold flex justify-center items-center">
                <div className="col-span-5 items-center flex gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${themeColor} ${themeBg} flex items-center justify-center`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {account.account_type} Account
                    </p>
                    <p className="text-xs text-gray-500">
                      {account.account_type}
                    </p>
                  </div>
                </div>

                <div className="col-span-3 text-gray-500 font-mono">
                  {account.account_number}
                </div>
                <div className="font-bold text-black col-span-3 text-right">
                  $
                  {Number(account.balance).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className="col-span-1 flex justify-center relative group">
                  <button
                    onClick={() => toggleDropDown(account.account_id)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <EllipsisVertical size={18} />
                  </button>
                  {dropDownId === account.account_id && (
                    // Dropdown box
                    <div className="absolute  top-10 w-50 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in-up ">
                      <Link className="flex border gap-2 items-center px-5 py-4 text-sm text-gray-700 hover:bg-gray-50">
                        <Eye size={20} strokeWidth={2.5} /> View Details
                      </Link>
                      <Link className="flex gap-2 items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <ArrowRightLeft size={20} strokeWidth={2.5} /> Transfer
                        Money
                      </Link>

                      <Link className="flex gap-2 items-center px-4 py-2 text-sm text-red-700 bg-red-30 hover:bg-red-50">
                        <Trash2 size={20} strokeWidth={2.5} />
                        Remove account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default AccountControl;
