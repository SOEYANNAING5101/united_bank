import {CircleCheck} from 'lucide-react'
import {Link}from 'react-router-dom'
const TransactionReceipt = ({
    amount,senderAccount,recipientName,recipientAccountId,transactionDate,transactionId,onReset,onDashboard
}) => {
  return (
    <div className="animate-fade-in w-full max-w-[500px] mt-10 md:mt-0 mx-auto flex flex-col overflow-hidden ">
      {/* Header */}
      <div className=" border-blue-600 flex flex-col items-center justify-center p-8">
        <div className="mb-3 p-3 rounded-full bg-blue-600">
          <CircleCheck fill="white" className="text-blue-600" size={40} />
        </div>
        <div className=" flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-700">
            Transfer Complete
          </span>
          <span className="text-gray-500 text-xs mb-3 tracking-wider font-semibold ">
            Your funds have been successfully dispatched.
          </span>
          <p className="text-4xl font-bold mb-2 text-gray-700 p-3">
            $
            {amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }) || "1,200.00"}
          </p>
        </div>
      </div>
      {/* Body */}
      <div className="flex flex-col gap-8 p-4">
        <div className="  flex items-center justify-between">
          <span className="text-gray-500 text-sm md:text-base tracking-wider font-semibold">
            SENDER
          </span>
          <span className="text-gray-700 text-sm md:text-base tracking-wider font-bold">
            {senderAccount
              ? `${senderAccount.account_type.charAt(0).toUpperCase()}${senderAccount.account_type.slice(1)} Account `
              : "Not selected"}
            (...{senderAccount.account_number.slice(-4)})
          </span>
        </div>
        <div className="  flex items-center justify-between">
          <span className="text-gray-500 text-sm md:text-base tracking-wider font-semibold">
            RECIPIENT
          </span>
          <span className="text-gray-700 text-sm md:text-base tracking-wider font-bold">
            {recipientAccountId ? recipientName : "Not selected"}(
            {recipientAccountId ? `...${recipientAccountId.slice(-4)}` : "Not selected"})
          </span>
        </div>
        <div className="  flex items-center justify-between">
          <span className="text-gray-500 text-sm md:text-base tracking-wider font-semibold">
            DATE & TIME
          </span>
          <span className="text-gray-700 text-sm md:text-base tracking-wider font-bold">
            {transactionDate || "Date"}
          </span>
        </div>
        <div className="  flex items-center justify-between">
          <span className="text-gray-500 text-sm md:text-base tracking-wider font-semibold">
            TRANSACTION ID
          </span>
          <span className="text-gray-700 text-sm md:text-base tracking-wider font-bold">
            {transactionId
              ? `....${transactionId.slice(-10)}`
              : "Transaction Id"}
          </span>
        </div>
      </div>
      {/* Buttons */}
      <div className="p-4 gap-3 flex mt-10">
        <button
          onClick={onReset}
          className = "border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-100 hover:border-gay-400 rounded-xl px-4 py-3 w-full cursor-pointer"
        >
          Make another transfer
        </button>
        <button
          onClick = {onDashboard}
          className = "border border-gray-200 text-white bg-black font-semibold text-sm hover:bg-gray-800 hover:border-gay-400 rounded-xl px-4 py-3 w-full cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};
export default TransactionReceipt;
