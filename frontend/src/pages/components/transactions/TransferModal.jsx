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
import StripeDepositForm from "../modal/StripeDepositForm";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
} from "@stripe/react-connect-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const TransferModal = ({ isOpen, onClose, defaultAction, accountList }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  // 1. Core State
  const [activeTab, setActiveTab] = useState("EXTERNAL");

  const [step, setStep] = useState(1); // 1=Form 2=Review 3=Complete
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  // let amountError = false;
  const [error, setError] = useState(false);
  const [transferError, setTransferError] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [idempotencyKey, setIndempotencyKey] = useState(uuidv4());

  // STRIPE
  const [clientSecret, setClientSecret] = useState("");
  const [isFetchingIntent, setIsFetchingIntent] = useState(false);
  const [connectInstance, setConnectInstance] = useState(null);
  const [isOnboarding, setIsOnboarding] = useState(false);

  // 2. Account Selection & Data
  // What user clicked (ID & Names)
  const [sourceId, setSourceId] = useState("");
  const [destinationId, setDestinationId] = useState("");
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
    balance: acc.balance,
    value: acc.account_id,
  }));

  // 3.Menu Toggle
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);
  const [isDestinationMenuOpen, setIsDestinationMenuOpen] = useState(false);

  const sourceMenuRef = useRef(null);
  const destinationMenuRef = useRef(null);

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
        setActiveTab("WITHDRAW");
      } else {
        setActiveTab("DEPOSIT");
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
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      
      // const baseUrl = "http://localhost:5000";
      if (activeTab === "WITHDRAW") {
        endpoint = `${baseUrl}/api/transactions/withdraw`;
        payload = {
          account_id: sourceId,
          amount: transferAmount,
          counterparty: "Linked External Bank",
        };
      } else if (activeTab === "INTERNAL") {
        if (!destinationId) {
          setError("Please select a destination account.");
          setIsTransferring(false);
          return;
        }
        endpoint = `${baseUrl}/api/transactions/internal-transfer`;
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
        if (
          data.message === "Please link your account before withdrawing funds"
        ) {
          const connectRes = await fetch(
            `${baseUrl}/api/transactions/connect-bank`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );
          const connectData = await connectRes.json();
   

          if (connectRes.ok) {
            const instance = loadConnectAndInitialize({
              publishableKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
              fetchClientSecret: async () => connectData.client_secret,
            });
            setConnectInstance(instance);
            setIsOnboarding(true);
            setIsTransferring(false);
            return;
          }
        }

        const retryAfter = response.headers.get("Retry-After");
        if (retryAfter) {
          throw new Error(
            `Transfer limit exceeded. Please wait ${retryAfter} seconds before trying again.`,
          );
        }
        throw new Error(data.message || data.error || "Transfer failed");
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
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setStep(3);
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

    setSourceId("");
    setDestinationId("");

    if (defaultAction === "transfer") {
      setActiveTab("INTERNAL");
    } else if (defaultAction === "withdraw") {
      setActiveTab("EXTERNAL");
    } else {
      setActiveTab("EXTERNAL");
    }
  };
  // Dynamic Sender/Recipient Routing for review page
  let dynamicSender = null;
  let dynamicRecipientName = "";
  let dynamicRecipientId = "";
  if (activeTab == "INTERNAL") {
    dynamicSender = sourceAccount;
    dynamicRecipientName = destinationAccount
      ? `${destinationAccount?.account_type.charAt(0).toUpperCase()}${destinationAccount?.account_type.slice(1)} Account `
      : "Not Selected";
    dynamicRecipientId = destinationAccount?.account_number || "";
  } else if (activeTab === "WITHDRAW") {
    dynamicSender = sourceAccount;
    dynamicRecipientName = "LInked External Bank";
    dynamicRecipientId = "****";
  } else if (activeTab === "DEPOSIT") {
    dynamicSender = {
      account_type: "Credit/Debit Card",
      account_number: "****",
    };
    dynamicRecipientName = destinationAccount
      ? `${destinationAccount?.account_type.charAt(0).toUpperCase()}${destinationAccount?.account_type.slice(1)} Account `
      : "Not Selected";
    dynamicRecipientId = destinationAccount?.account_number || "";
  }
  // Amount validate
  useEffect(() => {
    const idOutBound = activeTab === "INTERNAL" || activeTab === "WITHDRAW";
    const currentBalance = sourceAccount ? Number(sourceAccount.balance) : 0;
    const newBalance = currentBalance - Number(amount);

    if (amount !== "" && Number(amount) <= 0) {
      setAmountError("Amount must be greater than $0.00");
    } else if (idOutBound && amount !== "") {
      if (newBalance < 0) {
        setAmountError("Insufficient funds in sender account");
      } else if (
        sourceAccount?.txn_limit_per_transfer &&
        Number(amount) > sourceAccount?.txn_limit_per_transfer
      ) {
        setAmountError(
          `Transfer limit is ${sourceAccount?.txn_limit_per_transfer}`,
        );
      } else {
        setAmountError("");
      }
    } else {
      setAmountError("");
    }
  }, [amount, activeTab, sourceAccount]);

  // Form validation
  const isAmountValid = amount && parseFloat(amount) > 0;
  let isRoutingValid = false;

  if (activeTab === "INTERNAL") {
    isRoutingValid = Boolean(
      sourceId && destinationId && sourceId != destinationId,
    );
  } else if (activeTab === "WITHDRAW") {
    isRoutingValid = Boolean(sourceId);
  } else if (activeTab === "DEPOSIT") {
    isRoutingValid = Boolean(destinationId);
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
  if (step == 2) {
    if (isOnboarding && connectInstance) {
      return (
        <div className="p-4 md:p-0 z-60 bg-black/40 fixed inset-0 flex items-center justify-center border">hi
          <div className="bg-white w-full max-w-[700px] h-[80vh] rounded-xl shadow-sm relative overflow-hidden flex flex-col">
            <button
              className="mt-2 absolute p-3 right-3 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
              onClick={() => {
                setIsOnboarding(false);
                setStep(1);
              }}
            >
              <X size={18} />
            </button>

            <div className=" flex-1 overflow-y-auto p-6 md:p-8">
              <ConnectComponentsProvider connectInstance={connectInstance}>
                <ConnectAccountOnboarding
                  onExit={() => {
                    setIsOnboarding(false);
                    setStep(1);
                  }}
                />
              </ConnectComponentsProvider>
            </div>
          </div>
        </div>
      );
    }

    const isStripeDeposit = activeTab === "DEPOSIT";
    return (
      <div className="p-4 md:p-0 z-60 bg-black/40 fixed inset-0 flex items-center justify-center border">
        <div className="bg-white w-full max-w-[500px] rounded-xl shadow-sm relative overflow-hidden">
          <button
            className="mt-2 absolute p-3 right-3 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>

          {isStripeDeposit ? (
            clientSecret ? (
              <div className="animate-fade-in w-full max-w-[500px] max-h-[1000px] mt-10 md:mt-0 mx-auto flex flex-col overflow-hidden p-4">
                <h3 className="text-xl font-bold mb-6 text-gray-800">
                  Secure Deposit
                </h3>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripeDepositForm
                    amount={amount}
                    onCancel={() => setStep(1)}
                    onSuccess={(paymentIntent) => {
                      // 1. Save the Stripe ID for the receipt
                      setTransactionId(paymentIntent.id.slice(-8));

                      const formattedDate = new Date().toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        timeZoneName: "short",
                      });
                      setTransactionDate(formattedDate);
                      setStep(3);
                      queryClient.invalidateQueries({
                        queryKey: ["dashboard"],
                      });
                    }}
                  />
                </Elements>
              </div>
            ) : (
              <div className="p-12 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )
          ) : (
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
          )}
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
              queryClient.invalidateQueries({ queryKey: ["dashboard"] });
              onClose();
              navigate("/dashboard");
            }}
          />
        </div>
      </div>
    );
  }
  //Next step
  const handleNextstep = async () => {
    setTransferError(null);
    if (activeTab == "DEPOSIT") {
      try {
        setIsFetchingIntent(true);
        const token = await getToken();
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        const response = await fetch(
          `${baseUrl}/api/transactions/create-deposit-intent`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              amount: parseFloat(amount),
              account_id: destinationId,
            }),
          },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to initialize deposit");
        }
        setClientSecret(data.clientSecret);
        setStep(2);
      } catch (error) {
        setAmountError(error.message);
        console.error("error");
      } finally {
        setIsFetchingIntent(false);
      }
    } else {
      setStep(2);
    }
  };
  return (
    <div className="md:p-0 p-4 z-60 bg-black/40 fixed inset-0 flex items-center justify-center overflow-y-scroll">
      <div className="bg-white w-full max-w-[500px] rounded-xl shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
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
            className="absolute bottom-0 left-0 h-[3px] bg-blue-600 w-1/3 transition-transform duration-300 ease-out"
            style={{
              transform:
                activeTab === "DEPOSIT"
                  ? "translateX(0%)"
                  : activeTab === "WITHDRAW"
                    ? "translateX(100%)"
                    : "translateX(200%)",
            }}
          />
          <button
            onClick={() => setActiveTab("DEPOSIT")}
            className={`p-3 w-full relative z-10 text-sm font-semibold transition-colors tracking-wider duration-300 cursor-pointer ${
              activeTab === "DEPOSIT"
                ? " text-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            DEPOSIT
          </button>
          <button
            onClick={() => setActiveTab("WITHDRAW")}
            className={`p-3 w-full relative z-10 text-sm font-semibold transition-colors tracking-wider duration-300 cursor-pointer ${
              activeTab === "WITHDRAW"
                ? " text-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            WITHDRAW
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
          {activeTab === "DEPOSIT" && (
            <div className="p-6">
              <div className="mb-4">
                <AccountDropDown
                  label="TO ACCOUNT"
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
                  balanceLabel="Current Balance"
                  balance={destinationAccount?.balance || "$0.0"}
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
                        className="px-2.5 text-xs transition-colors cursor-pointer py-1 bg-white border border-gray-300 rounded-full hover:bg-gray-100 hover:borer-gray-400"
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
            </div>
          )}
          {activeTab === "WITHDRAW" && (
            <div className="p-6">
              <div className="mb-4">
                <AccountDropDown
                  label="FROM ACCOUNT"
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
                  balance={sourceAccount?.balance || "$0.0"}
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
                        className="px-2.5 text-xs transition-colors cursor-pointer py-1 bg-white border border-gray-300 rounded-full hover:bg-gray-100 hover:borer-gray-400"
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
            </div>
          )}
          {activeTab === "INTERNAL" && (
            <div className="p-6">
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
              <div className="mt-4">
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
                    balance:acc.balance,
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
                        className="px-2.5 text-xs transition-colors cursor-pointer py-1 bg-white border border-gray-300 rounded-full hover:bg-gray-100 hover:borer-gray-400"
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
        <div className="border-t border-gray-200 flex gap-2 p-6">
          <button
            onClick={onClose}
            className="border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-100 hover:border-gay-400 rounded-xl px-4 py-3 w-full cursor-pointer"
          >
            CANCEL
          </button>
          <button
            disabled={!proceed || !amount || Number(amount) <= 0 || amountError}
            onClick={handleNextstep}
            className={` font-semibold text-sm rounded-xl py-2 w-full  ${
              proceed
                ? "border border-gray-200 text-white bg-blue-700 hover:bg-blue-800 cursor-pointer"
                : "text-gray-500 bg-gray-200  cursor-not-allowed"
            }`}
          >
            {isFetchingIntent ? "LOADING" : "NEXT"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default TransferModal;
