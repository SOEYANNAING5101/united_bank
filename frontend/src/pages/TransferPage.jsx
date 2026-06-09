import React, { useState, useEffect } from "react";
import {
  Send,
  Search,
  CheckCircle,
  AlertCircle,
  Landmark,
  ShieldCheck,
  PiggyBank,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const TransferPage = () => {
  // 1. Form State
  const context = useOutletContext() || {};
  const dashboardData = context.dashboardData;
  //
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const fromAccount =
    selectedAccountId || dashboardData?.data?.accounts[0].account_id || "";
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const [error, setError] = useState(null);
  const [verifiedName, setVerifiedName] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOpenSenderAccount, setIsOpenSenderAccount] = useState(false);

  const selectedAccount = dashboardData?.data?.accounts?.find(
    (acc) => acc.account_id === fromAccount,
  );

  const currentBalance = selectedAccount ? Number(selectedAccount.balance) : 0;
  const newBalance = currentBalance - amount;
  const { getToken } = useAuth();

  // To verify account number and return Username of the account
  const handleVerify = async (e) => {
    if (e) e.preventDefault();

    if (toAccount.length !== 10) {
      setError("Account not found. Please check the details.");
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(
        `http://localhost:5000/api/accounts/lookup/${toAccount}`,
        {
          method: "Get",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Account not found.");
      }
      setVerifiedName(data.fullName);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setVerifiedName(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    console.log("fromAccount inside handletransfer", fromAccount);
    try {
      const token = await getToken();
      const response = await fetch(
        "http://localhost:5000/api/transactions/transfer",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_account_id: fromAccount,
            receiver_account_number: toAccount,
            amount: amount,
            description: description,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Transfer failed");
      }
      alert("Transfer successful!");
    } catch (err) {
      setError(err.message || "Something went wrong during the transfer.");
    }
  };
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };
  const onTouchEnd = () => {
    if (!touchEnd || !touchStart) return;
    const distance = touchEnd - touchStart;
    const downSwipe = distance > minSwipeDistance;
    if (downSwipe) {
      setIsOpenSenderAccount(false);
    }
  };
  const handleQuickAdd = (valueToAdd) =>{
    const currentAmount = parseFloat(amount) || 0
    setAmount(currentAmount + valueToAdd)
  }
  if (!dashboardData || !dashboardData.data) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8 flex flex-col items-center justify-center h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">
          Loading accounts...
        </p>
      </div>
    );
  }
  return (
    <div className="w-full max-w-6xl mx-auto p-2 pb-20">
      <div className="flex flex-col mb-3">
        <h1 className="text-lg md:text-3xl font-bold text-gray-900 md:mb-2">
          Transfer Money
        </h1>
        <p className="text-gray-500 text-xs md:text-lg">
          Move funds securely between accounts or to external recipients
        </p>
      </div>

      <div className="grid lg:grid-cols-8 md:gird-cols-1 gap-2">
        <div className="lg:col-span-5 rounded-xl md:shadow-lg bg-gray-100 md:bg-white">
          <div className="hidden md:flex items-center md:p-3 justify-center">
            <Landmark size={35} strokeWidth={1.5} />
            <div className="text-lg ml-2 font-semibold">
              Transaction Details
            </div>
          </div>

          <div className="md:p-4">
            {/* From Account */}
            <div className="mb-3 relative">
              <label className="block text-gray-500 text-xs md:text-sm font-semibold mb-2">
                Sender Account
              </label>
              <button
                onClick={() => setIsOpenSenderAccount(!isOpenSenderAccount)}
                className="md:hidden w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
              >
                <div className="flex gap-4 items-center w-full">
                  <div className="w-12 h-12 rounded-full bg-blue-700 flex justify-center items-center">
                    <PiggyBank color="white" size={24} strokeWidth={1.25} />
                  </div>
                  <div className="text-left flex flex-col">
                    <span className="text-sm font-bold">
                      {selectedAccount
                        ? `${selectedAccount.account_type.toUpperCase()} ACCOUNT (...${selectedAccount.account_number.slice(-4)})`
                        : "Select sender account"}
                    </span>
                    <span className="text-xs md:sm text-gray-700">
                      Available: ${selectedAccount.balance}
                    </span>
                  </div>
                  <div className="ml-auto shrink-0 text-gray-400">
                    <ChevronRight size={20} strokeWidth={1.25} />
                  </div>
                </div>
              </button>

              <div
                onClick={() => setIsOpenSenderAccount(false)}
                className={`md:hidden fixed inset-0 z-40 bg-black/60 ${
                  isOpenSenderAccount
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
              ></div>

              <div
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className={`
                md:hidden p-2 fixed bottom-0 right-0 left-0 bg-white w-screen  z-50 rounded-tl-3xl rounded-tr-3xl duration-600
              ${isOpenSenderAccount ? "translate-y-0" : "translate-y-full"}`}
              >
                <div className=" w-12 h-1.5 bg-gray-400 rounded-full mx-auto mb-5 " />

                {/* Menu container */}
                <div className="flex flex-col justify-center p-2 gap-3 mb-5">
                  <label className=" block text-gray-500 text-xs md:text-sm font-semibold mb-2">
                    Sender Account
                  </label>
                  {dashboardData?.data?.accounts?.map((account) => {
                    const isActive = fromAccount === account.account_id;
                    return (
                      <div
                        onClick={() => setSelectedAccountId(account.account_id)}
                        className={`flex gap-4 hover:bg-blue-100 rounded-lg hover:border-blue-500 p-2 items-center transition-colors ${
                          isActive ? "bg-blue-100 border-blue-500" : "bg-white"
                        } `}
                      >
                        {/* LOGO */}
                        <div className="w-8 h-8 rounded-full bg-blue-700 flex justify-center items-center">
                          <PiggyBank
                            color="white"
                            size={18}
                            strokeWidth={1.25}
                          />
                        </div>
                        {/* Account Type & Balance */}
                        <div className="text-left">
                          <p className="text-sm md:text-3xl font-semibold ">
                            {account.account_type.toUpperCase()} ACCOUNT (...${account.account_number.slice(-4)})
                          </p>
                          <span className="text-xs md:sm text-gray-700">
                            Available: ${account.balance}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Confirm button */}
                <div
                  onClick={() => setIsOpenSenderAccount(!isOpenSenderAccount)}
                  className="border flex justify-center items-center p-2 rounded-lg bg-blue-700 text-white"
                >
                  <button>CONFIRM</button>
                </div>
              </div>

              <select
                value={fromAccount}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="hidden md:flex w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
              >
                <option value="" disabled>
                  Select an account
                </option>
                {dashboardData?.data?.accounts?.map((account) => (
                  <option
                    key={account.account_id}
                    value={account.account_id}
                    className="bg-white"
                  >
                    {account.account_type.charAt(0).toUpperCase() +
                      account.account_type.slice(1)}
                    (...
                    {account.account_number.slice(-4)}) - $
                    {Number(account.balance).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* To Account */}
            <form onSubmit={handleVerify} className="mb-3">
              <label className="block text-gray-500 text-xs md:text-sm font-semibold mb-2">
                Recipient Account
              </label>
              <div className="flex gap-3">
                <input
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
                  placeholder="1234567898"
                ></input>
                <button
                  type="submit"
                  disabled={!toAccount || isVerifying || verifiedName}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 rounded-xl font-semibold transition-colors flex items-center gap-2"
                >
                  {isVerifying ? "Checking..." : "Verify"}
                </button>
              </div>
              {verifiedName && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2 mt-1 flex items-center gap-2 text-emerald-700">
                  <CheckCircle size={18} />
                  <p className="text-sm font-medium">
                    Verified: <span className="font-bold">{verifiedName}</span>
                  </p>
                </div>
              )}
            </form>
            {/* Verify recipient account */}
            {verifiedName && (
              <form onSubmit={handleTransfer} id="transfer-form">
                {/* Transfer amount input */}
                <div className="flex flex-col items-center justify-center w-full px-4 py-3 rounded-xl border border-gray-300  bg-gray-50">
                  <label className="text-gray-500 text-xs md:text-sm font-bold">
                    Amount to Transfer
                  </label>
                  <div className="flex justify-center items-center mb-3">
                    <span className="text-gray-500 text-4xl md:5xl mr-1 font-bold">$</span>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-4xl md:6xl text-gray-500 w-full max-w-[200px] bg-transparent text-center placeholder-gray-300 focus:outline-none p-2"
                      placeholder="0.00"
                      required
                    ></input> 
                  </div>
                  <div className="flex justify-center gap-3 md:gap-4 mb-2">
                      {[100,500,1000].map((val)=>(
                        <button
                        key={val}
                        type="button"
                        onClick={()=>{handleQuickAdd(val)}}
                        className="px-3 md:px-5 py-1.5 md:py-3 bg-white border border-gray-300 rounded-full hover:">
                          +${val}
                        </button>
                      ))}
                    </div>
                </div>

                <div className="">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-6 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
                    placeholder="e.g. Rent Payment, Dinner Share"
                  ></input>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 h-full space-y-2 bg-gray-100">
          {/* Balance summary card */}
          <div className="rounded-xl shadow-lg bg-blue-700 text-white p-6">
            <h3 className="text-medium md:text-xl font-semibold mb-5">Balance Summary</h3>
            <div className="">
              <div className="flex justify-between">
                <span className="text-xs">Current Balance</span>
                <span className="font-medium">
                  $
                  {currentBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs">Transfer Balance</span>
                <span className="font-medium">
                  - $
                  {amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between mt-4 text-lg font-bold border-t">
                <span className="text-sm mt-2">New Balance</span>
                <span className="font-medium mt-2">
                  $
                  {newBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
          {/* Transaction details */}
          <div className=" rounded-xl shadow-lg bg-white flex-grow p-6">
            <h3 className="text-medium md:text-xl font-semibold mb-5">Transaction Summary</h3>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">
                From
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                {selectedAccount
                  ? `${selectedAccount.account_type.toUpperCase()} ACCOUNT (...${selectedAccount.account_number.slice(-4)})`
                  : "Not selected"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">
                To
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900 mb-1">{verifiedName}</p>
            </div>
            {description && (
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">
                  Note
                </p>
                <p className="text-gray-800 italic">"{description}"</p>
              </div>
            )}
          </div>
          {/* Confirm transfer button */}
          <div>
            <div className="lg:row-span-1 animate-fade-in">
              <button
                type="submit"
                form="transfer-form" 
                disabled={!amount || Number(amount) <= 0 || newBalance < 0}
                className="w-full  bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2"
              >
                Confirm Transfer <Send size={18} />
              </button>
              {newBalance < 0 && (
                <p className="text-red-500 text-xs font-semibold text-center mt-3">
                  Insufficient funds for this transfer.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferPage;
