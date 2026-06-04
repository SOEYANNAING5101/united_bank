import React, { useState } from "react";
import {
  Send,
  Search,
  CheckCircle,
  AlertCircle,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import {useAuth} from '@clerk/clerk-react'

const TransferPage = () => {
  // 1. Form State
  const { dashboardData } = useOutletContext();
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("0.0");
  const [description, setDescription] = useState("");

  const [error, setError] = useState(null);
  const [verifiedName, setVerifiedName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const selectedAccount = dashboardData?.data?.accounts?.find(
    (acc) => acc.account_id === fromAccount,
  );
  const currentBalance = selectedAccount ? Number(selectedAccount.balance) : 0;
  const newBalance = currentBalance - amount;
  const {getToken} = useAuth();
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
  return (
    <div className="h-[calc(100vh-100px)]">
      <div className="mb-5">
        <h1 className="text-xl font-semibold">Transfer Money</h1>
        <p className="text-sm text-gray-700">
          Move funds securely between accounts or to external recipients
        </p>
      </div>
      <div className="grid lg:grid-cols-8 md:gird-cols-1 gap-2">
        <div className="lg:col-span-5 rounded-xl shadow-lg bg-white">
          <div className="flex p-3 justify-center">
            <Landmark size={30} strokeWidth={1.5} />
            <div className="text-lg ml-2 font-bold">Transaction Details</div>
          </div>

          <div className="p-4">
            {/* {error && ( */}
            {/* <p className="text-red-500 text-sm flex items-center gap-1 mb-2 ">
              <AlertCircle size={14} />
              {error}
              Testing for error message
            </p> */}
            {/* )} */}
            {/* From Account */}
            <div className=" mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From Account
              </label>
              <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                To Account
              </label>
              <div className="flex gap-3">
                <input
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
                  placeholder="Enter account number"
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
            {verifiedName && (
              <form onSubmit={handleTransfer} id="transfer-form">
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-medium">
                      $
                    </span>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-semibold text-lg"
                      placeholder="0.0"
                      required
                    ></input>
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
                    placeholder="What is this transfer for"
                  ></input>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 h-full space-y-2 bg-gray-100">
          {/* Balance summary card */}
          <div className="rounded-xl shadow-lg bg-blue-700 text-white p-6">
            <h3 className="text-xl font-bold mb-5">Balance Summary</h3>
            <div>
              <div className="flex justify-between">
                <span>Current Balance</span>
                <span className="font-medium">
                  $
                  {currentBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Transfer Balance</span>
                <span className="font-medium">
                  - $
                  {amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between mt-4 text-lg font-bold border-t">
                <span>New Balance</span>
                <span className="font-medium">
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
            <h3 className="text-xl font-bold mb-5">Transaction Summary</h3>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">
                From
              </p>
              <p className="font-semibold text-gray-900 mb-1">
                {selectedAccount
                  ? `${selectedAccount.account_type} (...${selectedAccount.account_number.slice(-4)})`
                  : "Not selected"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">
                To
              </p>
              <p className="font-semibold text-gray-900 mb-1">{verifiedName}</p>
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
                form="transfer-form" // <-- THIS IS THE MAGIC LINK
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2"
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
