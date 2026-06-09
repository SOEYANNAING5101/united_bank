import React, { useState } from "react";
import {
  Landmark,
  PiggyBank,
  CreditCard,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useOutletContext, Link, useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import {useAuth} from '@clerk/clerk-react'

const OpenAccount = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {getToken} = useAuth();
 
  const { data: dashboardData, isLoading: isFetchingStatus } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch("http://localhost:5000/api/dashboard", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  });

  const ownedTypes = dashboardData?.data?.accounts?.map(
    (account) => account.account_type.toLowerCase(),
  ) || [];
  // Definition of account options to loop
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!selectedType) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:5000/api/accounts/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        body: JSON.stringify({ account_type: selectedType }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create account");
      }
      navigate("/account-control");
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  const accountOptions = [
    {
      id: "checking",
      title: "Checking Account",
      desc: "For your daily expenses and fast transfers.",
      icon: <Landmark size={24} />,
      color: "blue",
      activeClass: "ring-2 ring-blue-500 border-blue-500 bg-blue-50",
    },
    {
      id: "saving",
      title: "Savings Account",
      desc: "Grow your wealth securely with competitive interest.",
      icon: <PiggyBank size={24} />,
      color: "emerald",
      activeClass: "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50",
    },
    {
      id: "credit",
      title: "Credit Card",
      desc: "Flexible spending power and exclusive rewards.",
      icon: <CreditCard size={24} />,
      color: "purple",
      activeClass: "ring-2 ring-purple-500 border-purple-500 bg-purple-50",
    },
  ];
  return (
    //Need to change bg to bg-gray-50
    <div className=" min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <h1 className="font-bold text-blue-600 text-3xl mb-3">UNITED BANK</h1>
      <div className=" w-full max-w-5xl flex-col bg-white rounded-lg shadow-md p-2">
        <Link 
        to='/account-control'
        className="p-2 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium mb-4 self-start group">
          <ArrowLeft size={18} />
          Back to account
        </Link>

        <div className="flex flex-col justify-center items-center p-8 pt-2 pb-4">
          <div className="justify-center items-center text-center mb-5">
            <h1 className="font-bold text-3xl mb-3">Open a New Account</h1>
            <span className="text-gray-500 font-medium">
              Select the type of account you want to open today.
            </span>
          </div>

          <form onSubmit={handleCreateAccount} className="w-full shrink-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              {accountOptions.map((acc) => {
                const isOwned = ownedTypes.includes(acc.id);
                const isActive = selectedType === acc.id;

                return (
                  <div
                    className={`relative border-2 rounded-2xl flex items-center justify-center text-center p-10 flex-col
                    ${
                      isOwned
                        ? "opacity-60 bg-gray-50 border-gray-100 cursor-not-allowed"
                        : isActive
                          ? acc.activeClass
                          : "border-gray-100 hover:border-gray-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
                    }`}
                    key={acc.id}
                    onClick={() => {
                      if (!isOwned) setSelectedType(acc.id);
                      18;
                    }}
                  >
                    {/* Icon */}
                    <div
                      className={`w-26 h-26 rounded-full flex items-center justify-center mb-5 transition-colors
                      ${
                        isOwned
                          ? "bg-gray-200 text-gray-400"
                          : isActive
                            ? `bg-${acc.color}-100 text-${acc.color}`
                            : "bg-gray-100 text-gray-500"
                      }
                      `}
                    >
                      {acc.icon}
                    </div>

                    {/* Account type */}
                    <h3
                      className={`text-xl font-bold mb-2
                      ${
                        isOwned
                          ? "text-gray-400"
                          : isActive
                            ? `text-${acc.color}-600`
                            : "text-gray-800"
                      }`}
                    >
                      {acc.title}
                    </h3>
                    <p
                      className={`leading-relaxed text-sm
                      ${
                        isOwned
                          ? "text-gray-400"
                          : isActive
                            ? `text-${acc.color}-600`
                            : "text-gray-500"
                      }`}
                    >
                      {acc.desc}
                    </p>
                  </div>
                );
              })}
            </div>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center">
                {error}
              </div>
            )}

            {ownedTypes.length >= 3 && !isFetchingStatus && (
              <div className="mb-6 p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm font-medium text-center flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                You have successfully opened all available account types!
              </div>
            )}
            {/* Create account button */}
            <div className="max-w-md mx-auto">
              <button
                type="submit"
                disabled = {!selectedType || isLoading || isFetchingStatus || ownedTypes?.length >= 3}
                className=" w-full flex items-center justify-center px-5 py-2.5 cursor-pointer  bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OpenAccount;
