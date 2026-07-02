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
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
const DesktopAccountControl = ({ accounts }) => {
  const [dropDownId, setDropDownId] = useState("");

  const toggleDropDown = (account_id) => {
    if (dropDownId === account_id) {
      setDropDownId(null);
    } else {
      setDropDownId(account_id);
    }
  };
  const menuItems = [
    {
      label: "View Details",
      icon: Eye,
      path: (id) => `/account-details/history/${id}`,
      color: "text-gray-700 hover:bg-gray-50",
    },
    {
      label: "Transfer Money",
      icon: ArrowRightLeft,
      path: () => "/transfer",
      color: "text-gray-700 hover:bg-gray-50",
    },
    {
      label: "Remove Account",
      icon: Trash2,
      path: () => "#",
      color: "text-red-700 hover:bg-red-50",
    },
  ];

  // To close the dropdown if user click outside of the div
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".action-dropdown-container")) {
        setDropDownId("");
      }
    };
    if (dropDownId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropDownId]);
  console.log("dropdownid", dropDownId);

  return (
    <div className="w-full max-w-6xl mx-auto p-2 pb-20 pt-20">
      {/* Header */}
      <div className="justify-between flex mb-8">
        <div className=" p-4">
          <p className="text-lg font-semibold">Account Ledger</p>
          <p className="text-gray-500">Manager your wealth</p>
        </div>
        <div className="flex items-center justify-center ">
          <Link
            to="/open-account"
            className="flex items-center px-4 py-3.5 cursor-pointer gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            <Plus size={20} />
            Open Account
          </Link>
        </div>
      </div>
      {/* Account List */}
      <div className="bg-white rounded-lg shadow-md overflow-visible">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-4 p-4 rounded-t-lg bg-gray-200 text-gray-500 font-semibold bg-gray-100">
          <div className="col-span-5">ACCOUNT NAME</div>
          <div className="col-span-3">ACCOUNT NUMBER</div>
          <div className="col-span-3 text-right">BALANCE</div>
          <div className="col-span-1 text-center">ACTION</div>
        </div>

        {/* Account list */}
        {accounts.length === 0 ? (
          <div className="text-gray-500 font-semibold p-10 flex items-center text-center justify-center">
            No accounts found. Open one to get started!
          </div>
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
                      {`${account.account_type.charAt(0).toUpperCase()}${account.account_type.slice(1)}`}{" "}
                      Account
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
                <div
                  className="col-span-1 flex justify-center relative action-dropdown-container"  
                  
                >
                  <button
                    onClick={() => toggleDropDown(account.account_id)}
                    className="p-2 cursor-pointer text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <EllipsisVertical size={18} />
                  </button>
                  {dropDownId === account.account_id && (
                    // Dropdown box
                    <div className="absolute top-10 w-50 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in-up ">
                      {menuItems.map((item) => (
                        <Link
                          key={item.path(account.account_id)}
                          to={item.path(account.account_id)}
                          className={` flex gap-2 items-center px-5 py-4 text-sm ${item.color}`}
                        >
                          <item.icon size={20} strokeWidth={2.5} /> {item.label}
                        </Link>
                      ))}
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
export default DesktopAccountControl;
