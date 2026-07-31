import { useState, useEffect } from "react";
import {
  Landmark,
  PiggyBank,
  LockKeyhole,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
const TransactionReview = ({
  amount,
  senderAccount,
  recipientName,
  recipientAccountId,
  onEdit,
  onConfirm,
  isProcessing,
  activeTab,
  error,
}) => {
  return (
    <div className="animate-fade-in w-full max-w-[600px] max-h-[1000px] mt-10 md:mt-0 mx-auto flex flex-col overflow-hidden p-6">
      {/* Header */}
      <div className="p-4 flex flex-col items-center justify-center w-full ">
        <span className="text-gray-500 text-sm mb-3 tracking-wider font-semibold">
          {activeTab
            ? `${activeTab.toUpperCase()} TRANSFER `
            : "TRANSACTION PREIVEW"}
        </span>
        <div className="mt-4 mb-2">
          <p className="text-4xl font-bold">
            $
            {amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }) || "1,200.0"}
          </p>
        </div>
        <div className="flex items-center justify-center text-emerald-400 font-semibold bg-gray-200 px-2 py-1 gap-2 border border-gray-300 rounded-full">
          <LockKeyhole size={10} />
          <span className=" text-xs">SECURE END-TO-END ENCRYPTION</span>
        </div>
      </div>
      {/* Body */}
      <div className="p-0 py-4 md:px-4 md:py-6 flex flex-col w-full gap-5 border-b border-gray-400">
        {/* From Account */}
        <div className="flex gap-4 items-center">
          {/* Icon */}
          <div
            className={`w-15 h-15 bg-blue-100 rounded-xl text-blue-600 flex items-center justify-center`}
          >
            <PiggyBank size={25} />
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-gray-500 text-xs mb-1">
              FROM ACCOUNT
            </span>
            <span className="text-gray-700 text-sm tracking-wider font-semibold">
              {senderAccount
                ? `${senderAccount.account_type.charAt(0).toUpperCase()}${senderAccount.account_type.slice(1)} Account `
                : "Not selected"}
            </span>
            <span className="text-gray-500 text-[10px] tracking-wider font-semibold">
              {" "}
              {senderAccount
                ? `...${senderAccount.account_number.slice(-4)}`
                : ""}
            </span>
          </div>
        </div>
        {/* Recipient */}
        <div className="flex gap-4 items-center">
          {/* Icon */}
          <div
            className={`w-15 h-15 bg-blue-100 rounded-xl text-blue-600 flex items-center justify-center`}
          >
            <Landmark size={25} />
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs mb-1">
              RECIPIENT
            </span>
            <span className="text-gray-700 text-sm tracking-wider font-semibold">
              {recipientAccountId ? recipientName : "Not selected"}
            </span>
            <span className="text-gray-500 text-[10px] tracking-wider font-semibold">
              {recipientAccountId
                ? `...${recipientAccountId.slice(-4)}`
                : "Not selected"}
            </span>
          </div>
        </div>
      </div>
      {/* Transfer Details */}
      <div className="p-0 py-4 mb-2 md:px-4 md:py-6 ">
        <h2 className="text-gray-500 text-xs mb-3 tracking-wider font-semibold">
          TRANSFER DETAILS
        </h2>
        <div className="flex md:grid md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-4 w-full col-span-1">
            <div className="flex flex-col">
              <span className="text-gray-500 text-[10px] tracking-wider font-semibold">
                Transfer Speed
              </span>
              <span className="text-gray-700 text-[10px] md:text-xs tracking-wider font-bold">
                Standard (1-3 Business Days)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full col-span-1">
            <div className="flex flex-col">
              <span className="text-gray-500 text-[10px] tracking-wider font-semibold">
                Estimated Arrival
              </span>
              <span className="text-gray-700 text-[10px] md:text-xs tracking-wider font-bold">
                October 24, 2023
              </span>
            </div>
          </div>
        </div>
        <div className="flex md:grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4 w-full col-span-1">
            <div className="flex flex-col">
              <span className="text-gray-500 text-[10px] tracking-wider font-semibold">
                Transaction Fee
              </span>
              <span className="text-emerald-400 text-[10px] md:text-xs tracking-wider font-bold">
                No processing fee
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full col-span-1">
            <div className="flex flex-col">
              <span className="text-gray-500 text-[10px] tracking-wider font-semibold">
                Frequency
              </span>
              <span className="text-gray-700 text-[10px] md:text-xs tracking-wider font-bold">
                One-time payment
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* 3. Backend Error Banner */}
      {error && (
        <div className="px-6 pb-2 w-full animate-fade-in">
          <div className="flex items-center justify-center p-2 bg-red-50 border border-red-200 rounded-xl gap-3 text-red-700 shadow-sm">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-xs  font-semibold">{error}</p>
          </div>
        </div>
      )}
      {/* Button */}
      <div className="flex w-full gap-3 p-0 py-4 mb-2 md:px-8 md:py-6 ">
        <button
          onClick={onEdit}
          className="border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-100 hover:border-gay-400 rounded-xl px-4 py-3 w-full cursor-pointer"
        >
          Edit Details
        </button>
        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className={`flex items-center justify-center gap-2 text-white font-semibold bg-blue-700 hover:bg-blue-800 text-sm rounded-lg py-2 w-full cursor-pointer ${
            isProcessing ? "" : ""
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 />
              Processing
            </>
          ) : (
            <>
              Confirm & Send
              
            </>
          )}
        </button>
      </div>
    </div>
  );
};
export default TransactionReview;
