import { X, Pencil, CircleAlert, TriangleAlert } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
const TransferLimitModal = ({
  isOpen,
  onClose,
  account_id,
  perTransfer,
  dailyLimit,
  monthlyLimit,
  total_today,
  total_this_month,
}) => {
  const queryClient = useQueryClient();
  const perTransferInputRef = useRef(null);
  const dailyInputRef = useRef(null);
  const monthlyInputRef = useRef(null);

  const { getToken } = useAuth();
  const [editPerTransfer, setEditPerTransfer] = useState(perTransfer);
  const [editDailyLimit, setEditDailyLimit] = useState(dailyLimit);
  const [editMonthlyLimit, setEditMonthlyLimit] = useState(monthlyLimit);

  const [error, setError] = useState(null);

  // Submitting Animation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSaveChanges = async () => {
    setError(null);
    const perTxn = Number(editPerTransfer);
    const daily = Number(editDailyLimit);
    const monthly = Number(editMonthlyLimit);

    const hasChanges =
      Number(editPerTransfer) != Number(perTransfer) ||
      Number(editDailyLimit) != Number(dailyLimit) ||
      Number(editMonthlyLimit) != Number(monthlyLimit);

    if (perTxn <= 0 || daily <= 0 || monthly <= 0) {
      setError("INVALID_AMOUNT");
      return;
    }
    if (perTxn > daily) {
      setError("PER_TRANSFER_EXCEEDS_DAILY");
      return;
    }
    if (daily > monthly) {
      setError("DAILY_EXCEEDS_MONTHLY");
      return;
    }
    if (!hasChanges) {
      onClose();
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const [response] = await Promise.all([
        fetch(`http://localhost:5000/api/accounts/${account_id}/limit`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            txn_limit_per_transfer: Number(editPerTransfer),
            dailyLimit: Number(editDailyLimit),
            monthlyLimit: Number(editMonthlyLimit),
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);

      if (!response.ok) {
        throw new Error("Failed to update limits");
      }
      toast.success("Transfer Limits updated successfully!");
      onClose();
      await queryClient.invalidateQueries({
        queryKey: ["account", account_id],
      });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (error) {
      console.error("Error updaing transfer limits.", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Error message text
  const getErrorMessage = () => {
    if (error === "INVALID_AMOUNT")
      return "All limits must be greater than $0.00.";
    if (error === "PER_TRANSFER_EXCEEDS_DAILY")
      return "Per-Transfer limit cannot be higher than the Daily limit.";
    if (error === "DAILY_EXCEEDS_MONTHLY")
      return "Daily limit cannot exceed the Monthly limit.";
    if (error === "BACKEND_ERROR" || error === "SERVER_ERROR")
      return "Something went wrong on our end. Please try again.";

    return "An unexpected error occurred."; // Fallback just in case
  };

  return (
    <div className="md:p-0 p-4 z-60 bg-black/40 fixed inset-0 flex items-center justify-center overflow-y-scroll">
      <div className="bg-white w-full max-w-[500px] rounded-xl shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-0">
            <span className="text-gray-800 md:text-xl font-bold">
              Adjust Transfer Limits
            </span>
          </div>
          <button
            className="mt-2 p-3 right-3 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="p-4 border-b border-t border-gray-200">
          {/* Per Transfer */}
          <div className="mb-6">
            <label className="text-gray-500 text-sm ml-2 tracking-wide font-semibold">
              PER TRANSFER LIMIT
            </label>
            <div
              onClick={() => perTransferInputRef.current?.focus()}
              className={` flex justify-between items-center p-3 rounded-lg mt-2 focus-within:border-blue-700 cursor-text transition-colors duration-200 ${
                error === "INVALID_AMOUNT" ||
                error === "PER_TRANSFER_EXCEEDS_DAILY"
                  ? "border border-red-300"
                  : "border border-gray-300"
              }`}
            >
              <span
                onClick={() => perTransferInputRef.current?.focus()}
                className="text-gray-500 mr-1 font-semibold"
              >
                $
              </span>
              <input
                type="number"
                className="outline-none focus:outline-none focus:ring-0 w-full bg-transparent text-gray-800 font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                ref={perTransferInputRef}
                onChange={(e) => {
                  setEditPerTransfer(e.target.value);
                  setError(null);
                }}
                value={editPerTransfer}
              ></input>

              <Pencil size={18} className="text-gray-500" />
            </div>
            <span className="text-gray-500 text-sm ml-2 tracking-wide">
              Must be less than Daily Limit
            </span>
          </div>
          {/* Daily Limit */}
          <div className="mb-6">
            <label className="text-gray-500 text-sm ml-2 tracking-wide font-semibold">
              Daily Limit
            </label>
            <div
              onClick={() => dailyInputRef.current?.focus()}
              className={` flex justify-between items-center p-3 rounded-lg mt-2 focus-within:border-blue-700 cursor-text transition-colors duration-200 ${
                error === "INVALID_AMOUNT" ||
                error === "PER_TRANSFER_EXCEEDS_DAILY" ||
                error === "DAILY_EXCEEDS_MONTHLY"
                  ? "border border-red-300"
                  : "border border-gray-300"
              }`}
            >
              <span className="text-gray-500 mr-1 font-semibold">$</span>
              <input
                type="number"
                ref={dailyInputRef}
                className="outline-none focus:outline-none focus:ring-0 w-full bg-transparent text-gray-800 font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onChange={(e) => {
                  setEditDailyLimit(e.target.value);
                  setError(null);
                }}
                value={editDailyLimit}
              ></input>
              <Pencil size={18} className="text-gray-500 shrink-0" />
            </div>
            <span className="text-gray-500 text-sm ml-2 tracking-wide">
              Currently spent today:{" "}
            </span>
            <span className="text-gray-800 text-sm tracking-wide">
              ${total_today}/${dailyLimit}
            </span>
          </div>
          {/* Monthly Limit */}
          <div className="mb-6">
            <label className="text-gray-500 text-sm ml-2 tracking-wide font-semibold">
              Monthly Limit
            </label>
            <div
              onClick={() => monthlyInputRef.current?.focus()}
              className={` flex justify-between items-center p-3 rounded-lg mt-2 focus-within:border-blue-700 cursor-text transition-colors duration-200 ${
                error === "INVALID_AMOUNT" || error === "DAILY_EXCEEDS_MONTHLY"
                  ? "border border-red-300"
                  : "border border-gray-300"
              }`}
            >
              <span className="text-gray-500 mr-1 font-semibold">$</span>
              <input
                ref={monthlyInputRef}
                type="number"
                className="outline-none focus:outline-none focus:ring-0 w-full bg-transparent text-gray-800 font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onChange={(e) => {
                  setEditMonthlyLimit(e.target.value);
                  setError(null);
                }}
                value={editMonthlyLimit}
              ></input>
              <Pencil size={18} className="text-gray-500" />
            </div>
            <span className="text-gray-500 text-sm ml-2 tracking-wide">
              Currently spent this month:{" "}
            </span>
            <span className="text-gray-800 text-sm tracking-wide">
              ${total_this_month}/${monthlyLimit}
            </span>
          </div>
          {/* Text */}
          <div className="p-2 border border-blue-200 text-blue-500 text-sm font-semibold flex gap-2 rounded-lg ">
            <CircleAlert />
            <span className="tracking-wide text-xs md:text-base">
              Changes take effect immediately. Increases above $10,000 require
              multi-factor authentication (2FA) for security purposes.
            </span>
          </div>
          {error && (
            <div className="flex mt-2 text-red-500 gap-2 text-sm font-semibold items-center bg-red-100 p-2 rounded-lg">
              <TriangleAlert size={18} />
              <span>{getErrorMessage()}</span>
            </div>
          )}
        </div>

        {/* button */}
        <div className="p-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-100 hover:border-gay-400 rounded-xl px-4 py-3  cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={isSubmitting}
            className={`border border-gray-200 text-white font-semibold text-sm bg-blue-700 rounded-xl px-4 py-3  ${
              isSubmitting
                ? "opacity-80 cursor-not-allowed "
                : "hover:bg-blue-800  cursor-pointer"
            }`}
          >
            {isSubmitting ? (
              <div className="flex gap-1 justify-center items-center h-5">
                <div
                  className="bg-white w-2 h-2 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="bg-white w-2 h-2 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="bg-white w-2 h-2 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default TransferLimitModal;
