import { useEffect, useState, useRef } from "react";
import { X, ArrowUpDown, AlertCircle } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TransactionReview from "./TransactionReview";
import TransactionReceipt from "./TransactionReceipt";
import TransactionProcessing from "./TransactionProcessing";
import AccountDropDown from "../AccountDropdown";
import { v4 as uuidv4 } from "uuid";

const DesktopTransferModal = ({
  isOpen,
  onClose,
  defaultAction,
  accountList,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  // 1. Core State
  const [activeTab, setActiveTab] = useState("EXTERNAL");
  const [direction, setDirection] = useState("");
  const [step, setStep] = useState(1); // 1=Form 2=Review 3=Complete
  const [amount, setAmount] = useState("");
  let amountError = false;
  const [error, setError] = useState(false);
  const [transferError, setTransferError] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [idempotencyKey, setIndempotencyKey] = useState(uuidv4());

  // Hardcoded values for the bank list
  const linkedBanks = [
    { id: "ext_1", name: "Chase Checking (...9999)" },
    { id: "ext_2", name: "Bank of America (...1234)" },
    { id: "ext_3", name: "Wells Fargo Savings (...5678)" },
  ];
  // 2. Account Selection & Data
  // What user clicked (ID & Names)
  const [sourceId, setSourceId] = useState(accountList[0]?.account_id || "");
  const [destinationId, setDestinationId] = useState("");
  const [externalBank, setExternalBank] = useState(linkedBanks[0].name);
  const [description, setDescription] = useState("");

  // For Step 3
  const [transactionId, setTransactionId] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  // Derived account objects (Internal account)
  const sourceAccount = accountList.find((acc) => acc.account_id === sourceId);
  const destinationAccount = accountList.find(
    (acc) => acc.account_id === destinationId,
  );
  const availableDestinationAccount = accountList.filter(
    (acc) => acc.account_id != sourceId,
  );

  // For user account (From)
  const displaySource = sourceAccount
    ? `${sourceAccount.account_type.charAt(0).toUpperCase() + sourceAccount.account_type.slice(1)} Account (...${sourceAccount.account_number.slice(-4)})`
    : "Select an account";

  // For user account (To)
  const displayDestination = destinationAccount
    ? `${destinationAccount.account_type.charAt(0).toUpperCase() + destinationAccount.account_type.slice(1)} Account (...${destinationAccount.account_number.slice(-4)})`
    : "Select an account";

  // User's actual accounts
  const internalOptions = accountList.map((acc) => ({
    label: `${acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} Account (...${acc.account_number.slice(-4)})`,
    value: acc.account_id,
  }));

  // External Bank accounts
  const externalOptions = linkedBanks.map((bank) => ({
    label: bank.name,
    value: bank.name,
  }));

  // 3.Menu Toggle
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);
  const [isDestinationMenuOpen, setIsDestinationMenuOpen] = useState(false);
  const [isBankMenuOpen, setIsBankMenuOpen] = useState(false);

  const sourceMenuRef = useRef(null);
  const destinationMenuRef = useRef(null);
  const bankMenuRef = useRef(null);

  // 4. Effects
  // Preventing sending to same account
  useEffect(() => {
    if (activeTab === "INTERNAL" && sourceId === destinationId) {
      setDestinationId("");
    }
  }, [sourceId, destinationId, activeTab]);

  // Handle defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      setIndempotencyKey(uuidv4());
      if (defaultAction === "transfer") {
        setActiveTab("INTERNAL");
      } else if (defaultAction === "withdraw") {
        setDirection("withdraw");
        setActiveTab("EXTERNAL");
      } else {
        setDirection("deposit");
        setActiveTab("EXTERNAL");
      }
    }
  }, [defaultAction, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sourceMenuRef.current &&
        !sourceMenuRef.current.contains(event.target)
      ) {
        setIsSourceMenuOpen(false);
      }
      if (
        destinationMenuRef.current &&
        !destinationMenuRef.current.contains(event.target)
      ) {
        setIsDestinationMenuOpen(false);
      }
      if (bankMenuRef.current && !bankMenuRef.current.contains(event.target)) {
        setIsBankMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 5 / Handles & Routing Logic
  const handleQuickAdd = (valueToAdd) => {
    const currentAmount = parseFloat(amount) || 0;
    setAmount(currentAmount + valueToAdd);
  };
  // Transfer Logic
  const handleTransfer = async (e) => {
    e.preventDefault();
    setError(false);
    if (isTransferring) return;

    const transferAmount = parseFloat(amount);
    if (!transferAmount || transferAmount < 0) {
      setAmountError(true);
      return;
    }
    setIsTransferring(true);
    try {
      const token = await getToken();
      const minimumDelay = new Promise((resolve) => setTimeout(resolve, 2500));
      let endpoint = "";
      let payload = {};
      if (activeTab === "EXTERNAL") {
        endpoint =
          direction === "deposit"
            ? "http://localhost:5000/api/transactions/deposit"
            : "http://localhost:5000/api/transactions/withdraw";
        payload = {
          account_id: direction === "deposit" ? destinationId : sourceId,
          amount: transferAmount,
          counterparty: externalBank,
        };
      } else if (activeTab === "INTERNAL") {
        if (!destinationId) {
          setError("Please select a destination account.");
          setIsTransferring(false);
          return;
        }
        endpoint = "http://localhost:5000/api/transactions/internal-transfer";
        payload = {
          sender_account_id: sourceId,
          receiver_account_id: destinationId,
          amount: transferAmount,
          description: description,
          transaction_type: "TRANSFER",
          category: "TRANSFER",
        };
      }
      const apiRequest = fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Idempotency-key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });
      const [response] = await Promise.all([apiRequest, minimumDelay]);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Transfer failed");
      }
      setTransactionId(data?.transaction?.transaction_id);
      const formattedDate = new Date(
        data?.transaction?.created_at,
      ).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        timeZoneName: "short",
      });
      setTransactionDate(formattedDate);
      setStep(3);
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      // onClose()
      // navigate("/dashboard");
    } catch (err) {
      setTransferError(
        err.message || "Something went wrong during the transfer.",
      );
    } finally {
      setIsTransferring(false);
    }
  };

  // Reset Handler for another transfer
  const handleResetModal = () => {
    setStep(1);
    setAmount("");
    setAmountError("");
    setError(false);
    setTransferError(null);

    setTransactionDate("");
    setTransactionId("");

    setIndempotencyKey(uuidv4());

    setSourceId(accountList[0]?.account_id || "");
    setDestinationId("");
    setExternalBank(linkedBanks[0].name);

    if (defaultAction === "transfer") {
      setActiveTab("INTERNAL");
      setDirection("");
    } else if (defaultAction === "withdraw") {
      setActiveTab("EXTERNAL");
      setDirection("withdraw");
    } else {
      setActiveTab("EXTERNAL");
      setDirection("deposit");
    }
  };
  // Dynamic Sender/Recipient Routing for review page
  let dynamicSender = null;
  let dynamicRecipientName = "";
  let dynamicRecipientId = "";
  const extBankName = externalBank.split(" (")[0];
  const extBankDigits = externalBank.match(/\d+/)?.[0] || "****";
  if (activeTab == "INTERNAL") {
    dynamicSender = sourceAccount;
    dynamicRecipientName = destinationAccount
      ? `${destinationAccount?.account_type.charAt(0).toUpperCase()}${destinationAccount?.account_type.slice(1)} Account `
      : "Not Selected";
    dynamicRecipientId = destinationAccount?.account_number || "";
  } else if (activeTab === "EXTERNAL" && direction === "withdraw") {
    dynamicSender = sourceAccount;
    dynamicRecipientName = extBankName;
    dynamicRecipientId = extBankDigits;
  } else if (activeTab === "EXTERNAL" && direction === "deposit") {
    dynamicSender = {
      account_type: extBankName,
      account_number: extBankDigits,
    };
    dynamicRecipientName = destinationAccount
      ? `${destinationAccount?.account_type.charAt(0).toUpperCase()}${destinationAccount?.account_type.slice(1)} Account `
      : "Not Selected";
    dynamicRecipientId = destinationAccount?.account_number || "";
  }
  // Amount validate
  const idOutBound =
    activeTab === "INTERNAL" ||
    (activeTab === "EXTERNAL" && direction === "withdraw");
  const currentBalance = sourceAccount ? Number(sourceAccount.balance) : 0;
  const newBalance = currentBalance - amount;
  if (amount !== "" && Number(amount) <= 0) {
    amountError = "Amount must be greater than $0.00";
  } else if (idOutBound) {
    if (newBalance < 0) {
      amountError = "Insufficient funds in sender account";
    } else if (
      sourceAccount?.txn_limit_per_transfer &&
      Number(amount) > sourceAccount?.txn_limit_per_transfer
    ) {
      amountError = `Transfer limit is ${sourceAccount?.txn_limit_per_transfer}`;
    }
  }

  // Form validation
  const isAmountValid = amount && parseFloat(amount) > 0;
  let isRoutingValid = false;

  if (activeTab === "INTERNAL") {
    isRoutingValid = Boolean(
      sourceId && destinationId && sourceId != destinationId,
    );
  } else {
    const hasInternalAccount =
      direction === "deposit" ? destinationId : sourceId;
    isRoutingValid = Boolean(hasInternalAccount && externalBank);
  }
  const proceed = isAmountValid && isRoutingValid;
  // Loading Animation after step 2
  if (step === 2 && isTransferring) {
    return (
      <div className="p-4 md:p-0 z-60 bg-black/40 fixed inset-0 flex items-center justify-center border">
        <div className="bg-white w-full max-w-[500px] rounded-xl shadow-sm relative">
          <button
            className="mt-2 absolute p-3 right-3 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>

          <TransactionProcessing />
        </div>
      </div>
    );
  }
  // 6.Render
  if (step == 2) {
    return (
      <div className="p-4 md:p-0 z-60 bg-black/40 fixed inset-0 flex items-center justify-center border">
        <div className="bg-white w-full max-w-[500px] rounded-xl shadow-sm relative">
          <button
            className="mt-2 absolute p-3 right-3 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>

          <TransactionReview
            amount={amount}
            senderAccount={dynamicSender}
            recipientName={dynamicRecipientName}
            recipientAccountId={dynamicRecipientId}
            onEdit={() => {
              setStep(1);
              setTransferError(null);
            }}
            onConfirm={handleTransfer}
            isProcessing={isTransferring}
            activeTab={activeTab}
            error={transferError}
          />
        </div>
      </div>
    );
  }
  if (step === 3) {
    return (
      <div className="p-4 md:p-0 z-60 bg-black/40 fixed inset-0 flex items-center justify-center border">
        <div className="bg-white w-full max-w-[500px] rounded-xl shadow-sm relative">
          <button
            className="mt-2 absolute p-3 right-3 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>
          <TransactionReceipt
            amount={amount}
            senderAccount={dynamicSender}
            recipientName={dynamicRecipientName}
            recipientAccountId={dynamicRecipientId}
            transactionDate={transactionDate}
            transactionId={transactionId}
            onReset={handleResetModal}
            onDashboard={() => {
              onClose();
              navigate("/dashboard");
            }}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="md:p-0 p-4 z-60 bg-black/40 fixed inset-0 flex items-center justify-center overflow-y-scroll">
      <div className="bg-white w-full max-w-[500px] rounded-xl shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-0">
            <span className="text-gray-800 md:text-xl font-bold">
              Move Funds
            </span>
            <span className="text-xs text-gray-500">
              Secure transfer portal
            </span>
          </div>
          <button
            className="mt-2 p-3 right-3 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>
          {/* </div> */}
        </div>
        {/* button */}
        <div className=" flex items-center w-full relative border-b border-t border-gray-200">
          <div
            className="absolute bottom-0 left-0 h-[3px] bg-blue-600 w-1/2 transition-transform duration-300 ease-out"
            style={{
              transform:
                activeTab === "INTERNAL"
                  ? "translateX(100%)"
                  : "translateX(0%)",
            }}
          />
          <button
            onClick={() => setActiveTab("EXTERNAL")}
            className={`p-3 w-full relative z-10 text-sm font-semibold transition-colors tracking-wider duration-300 cursor-pointer ${
              activeTab === "EXTERNAL"
                ? " text-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            EXTERNAL
          </button>
          <button
            onClick={() => setActiveTab("INTERNAL")}
            className={`p-3 w-full relative z-10 text-sm font-semibold transition-colors tracking-wider duration-300 cursor-pointer ${
              activeTab === "INTERNAL"
                ? "text-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            INTERNAL
          </button>
        </div>
        {/* Body Content */}
        <div>
          {activeTab === "EXTERNAL" ? (
            <div className="p-4">
              {/* Source Account */}
              <div>
                {direction == "deposit" ? (
                  <AccountDropDown
                    label="FROM"
                    menuRef={bankMenuRef}
                    displayValue={externalBank}
                    isOpen={isBankMenuOpen}
                    toggleOpen={() => setIsBankMenuOpen(!isBankMenuOpen)}
                    options={externalOptions}
                    onSelect={(val) => {
                      setExternalBank(val);
                      setIsBankMenuOpen(false);
                    }}
                    balanceLabel="Available Balance"
                    balance="20.000.00"
                  />
                ) : (
                  // Cash Out
                  // User owned account
                  <AccountDropDown
                    label="FROM"
                    menuRef={sourceMenuRef}
                    displayValue={displaySource}
                    isOpen={isSourceMenuOpen}
                    toggleOpen={() => setIsSourceMenuOpen(!isSourceMenuOpen)}
                    options={internalOptions}
                    onSelect={(val) => {
                      setSourceId(val);
                      setIsSourceMenuOpen(false);
                    }}
                    balanceLabel="Available Balance"
                    balance={sourceAccount?.balance || "0.00"}
                  />
                )}
              </div>
              {/* Exchange button */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  className="border rounded-full border-gray-300 cursor-pointer p-3 hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setDirection((prev) =>
                      prev === "deposit" ? "withdraw" : "deposit",
                    )
                  }
                >
                  <ArrowUpDown className="text-blue-500" size={18} />
                </button>
              </div>
              {/* Destination Account */}
              <div>
                {direction == "deposit" ? (
                  <AccountDropDown
                    label="TO"
                    menuRef={destinationMenuRef}
                    displayValue={displayDestination}
                    isOpen={isDestinationMenuOpen}
                    toggleOpen={() =>
                      setIsDestinationMenuOpen(!isDestinationMenuOpen)
                    }
                    options={internalOptions}
                    onSelect={(val) => {
                      setDestinationId(val);
                      setIsDestinationMenuOpen(false);
                    }}
                    balanceLabel="Available Balance"
                    balance={destinationAccount?.balance || "0.00"}
                  />
                ) : (
                  <AccountDropDown
                    label="TO"
                    menuRef={bankMenuRef}
                    displayValue={externalBank}
                    isOpen={isBankMenuOpen}
                    toggleOpen={() => setIsBankMenuOpen(!isBankMenuOpen)}
                    options={externalOptions}
                    onSelect={(val) => {
                      setExternalBank(val);
                      setIsBankMenuOpen(false);
                    }}
                    balanceLabel="Available Balance"
                    balance="20.000.00"
                  />
                )}
              </div>

              {/* Amount */}
              <form
                className="mt-4"
                onSubmit={handleTransfer}
                id="transfer-form"
              >
                <div
                  className={`flex flex-col items-center justify-center w-full px-4 py-3 rounded-xl bg-gray-50 ${
                    amountError
                      ? "border border-red-400 focus:ring-red-500"
                      : "border border-gray-300  "
                  }`}
                >
                  <label className="text-gray-500 text-xs md:text-sm font-bold">
                    Amount to Transfer
                  </label>
                  <div className="flex justify-center items-center mb-2">
                    <span className="text-gray-500 text-3xl  mr-1 font-bold">
                      $
                    </span>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-3xl text-gray-500 w-full max-w-[200px] bg-transparent text-center placeholder-gray-300 focus:outline-none p-2"
                      placeholder="0.00"
                      required
                    ></input>
                  </div>
                  <div className="flex justify-center gap-3 ">
                    {[100, 500, 1000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          handleQuickAdd(val);
                        }}
                        className="px-2.5 text-sm  transition-colors cursor-pointer py-1 bg-white border border-gray-300 rounded-full hover:bg-gray-100 hover:borer-gray-400"
                      >
                        +${val}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Error message for amount */}
                {amountError && (
                  <div className="mt-1 text-red-400 flex gap-2 items-center">
                    <AlertCircle size={14} />
                    <span className="text-xs">{amountError}</span>
                  </div>
                )}
              </form>
              {/* Transfer Speed div */}
              <div className="mt-4 flex w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 font-medium justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Transfer Speed</p>
                  <p className="text-xs text-gray-500">Transfer Fee</p>
                </div>
                <div className="text-end">
                  <p className="text-xs text-gray-700 mb-1 font-bold">
                    Standard (1-3 Business Days)
                  </p>
                  <p className="text-xs text-emerald-400">Free</p>
                </div>
              </div>
              <div></div>
            </div>
          ) : (
            // Internal Transfer
            <div className="p-4">
              {/* From Account */}
              <div>
                <AccountDropDown
                  label="FROM"
                  menuRef={sourceMenuRef}
                  displayValue={displaySource}
                  isOpen={isSourceMenuOpen}
                  toggleOpen={() => setIsSourceMenuOpen(!isSourceMenuOpen)}
                  options={internalOptions}
                  onSelect={(val) => {
                    setSourceId(val);
                    setIsSourceMenuOpen(false);
                  }}
                  balanceLabel="Available Balance"
                  balance={sourceAccount?.balance || "0.00"}
                />
              </div>

              {/* To Account */}
              <div>
                <AccountDropDown
                  label="TO"
                  menuRef={destinationMenuRef}
                  displayValue={displayDestination}
                  isOpen={isDestinationMenuOpen}
                  toggleOpen={() =>
                    setIsDestinationMenuOpen(!isDestinationMenuOpen)
                  }
                  options={availableDestinationAccount.map((acc) => ({
                    label: `${acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} Account (...${acc.account_number.slice(-4)})`,
                    value: acc.account_id,
                  }))}
                  onSelect={(val) => {
                    setDestinationId(val);
                    setIsDestinationMenuOpen(false);
                  }}
                  balanceLabel="Current Balance"
                  balance={destinationAccount?.balance || "0.00"}
                />
              </div>

              {/* Amount */}
              <form
                className="mt-4"
                onSubmit={handleTransfer}
                id="transfer-form"
              >
                <div
                  className={`flex flex-col items-center justify-center w-full px-4 py-3 rounded-xl bg-gray-50 ${
                    amountError
                      ? "border border-red-400 focus:ring-red-500"
                      : "border border-gray-300  "
                  }`}
                >
                  <label className="text-gray-500 text-xs md:text-sm font-bold">
                    Amount to Transfer
                  </label>
                  <div className="flex justify-center items-center mb-2">
                    <span className="text-gray-500 text-3xl  mr-1 font-bold">
                      $
                    </span>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-3xl text-gray-500 w-full max-w-[200px] bg-transparent text-center placeholder-gray-300 focus:outline-none p-2"
                      placeholder="0.00"
                      required
                    ></input>
                  </div>
                  <div className="flex justify-center gap-3 ">
                    {[100, 500, 1000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          handleQuickAdd(val);
                        }}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded-full hover:"
                      >
                        +${val}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Error message for amount */}
                {amountError && (
                  <div className="mt-1 text-red-400 flex gap-2 items-center">
                    <AlertCircle size={14} />
                    <span className="text-xs">{amountError}</span>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
        {/* Confirmation button */}
        <div className="border-t border-gray-200 flex gap-2 p-4">
          <button
            onClick={onClose}
            className="border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-100 hover:border-gay-400 rounded-xl px-4 py-3 w-full cursor-pointer"
          >
            CANCEL
          </button>
          <button
            disabled={!proceed || !amount || Number(amount) <= 0 || amountError}
            onClick={() => setStep(2)}
            className={` font-semibold text-sm rounded-xl py-2 w-full  ${
              proceed
                ? "border border-gray-200 text-white bg-blue-700 hover:bg-blue-800 cursor-pointer"
                : "text-gray-500 bg-gray-200  cursor-not-allowed"
            }`}
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
};
export default DesktopTransferModal;
