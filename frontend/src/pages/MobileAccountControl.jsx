import {
  Plus,
  Landmark,
  PiggyBank,
  CreditCard,
  LineChart,
  TrendingUp,
} from "lucide-react";
import { Link,NavLink } from "react-router-dom";

const MobileAccountControl = ({ balance, accounts }) => {
  const safeBalance = Number(balance) || 0;
  return (
    
    <div className="p-2">
      <div className="mb-3 ">
        <p className="text-lg md:text-3xl font-bold text-gray-900 md:mb-2">
          Account Control
        </p>
        <p className="text-gray-500 text-xs md:text-lg">Manager your wealth</p>
      </div>
  {/* Total Balance Card */}
      <div className="w-full bg-blue-700 rounded-xl p-6 flex flex-col text-white shadow-slate-900/20 mb-4">
        <span className="text-white/60">Total Balance</span>
        <span className="text-4xl font-bold ">
          $ {safeBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>

        <div className="mt-3 flex items-center gap-1.5 text-emerald-400 text-sm font-semibold w-max px-2.5 py-1 rounded-full">
          <TrendingUp size={16} strokeWidth={2.5} />
          <span>+2.4%</span>
          <span className="text-slate-400 font-normal ml-1 text-xs">
            vs last month
          </span>
        </div>
      </div>

      {/* Active Accounts */}
      <div>
        <span className="text-gray-500 font-semibold">Active Portfolios</span>
        <div className="flex flex-col gap-3 mt-2 mb-8">
          {accounts.length === 0 ? (
            <div className="text-gray-500 font-semibold">No accounts found. Open one to get started!</div>
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
                <Link
                key={account.account_id}
                to={`/account-details/history/${account.account_id}`}
                state = {{accountData : account}}
                className="border border-gray-300 rounded-xl flex items-center justify-between w-full p-4 bg-gray-200">
                  <div className="flex gap-2">
                    <div
                      className={`w-10 h-10 ${themeBg} rounded-xl ${themeColor} flex items-center justify-center`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="flex flex-col ml-2 text-gray-700 place-items-start">
                      <span className="text ">
                        {account.account_type.toUpperCase()} ACCOUNT
                      </span>
                      <span className="text-sm">
                        (...${account.account_number.slice(-4)})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center order">
                    <span className=" text text-gray-700 font-semibold">
                      $ {account.balance}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <Link to="/open-account" className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed font-bold py-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
        <Plus size={22}/>
        Open New Account
      </Link>
    </div>
  );
};
export default MobileAccountControl;
