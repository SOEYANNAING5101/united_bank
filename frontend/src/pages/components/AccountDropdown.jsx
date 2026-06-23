import React from "react";
import { ChevronDown } from "lucide-react";

const AccountDropDown = ({
  label,
  menuRef,
  displayValue,
  isOpen,
  toggleOpen,
  options,
  onSelect,
  balanceLabel,
  balance,
}) => {
  return (
    <div className="w-full" ref={menuRef}>
      <label className="block text-gray-500 text-xs md:text-base font-semibold ml-2">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={toggleOpen}
          className="flex justify-between items-center text-gray-700 font-semibold w-full p-3 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
        >
          <span>{displayValue}</span>
          <ChevronDown size={18} />
        </button>
        {isOpen && (
          <div className="mt-2 absolute top-full left-0 w-full bg-white rounded-lg  border border-gray-300 shadow-lg z-50 max-h-60 overflow-y-auto">
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelect(opt.value);
                }}
                className="w-full text-left p-3 hover:bg-gray-50 text-gray-700 font-semibold text-sm "
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-between p-1">
        <span className="text-gray-500 text-xs font-semibold">
          {balanceLabel}
        </span>
        <span className="text-gray-700 text-xs font-semibold">
          $
          {balance}
        </span>
      </div>
    </div>
  );
};
export default AccountDropDown;
