import React, { useState, useEffect } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

const TransactionProcessing = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  // Rotate through reassuring messages while they wait
  const messages = [
    "Initiating secure transfer...",
    "Encrypting transaction details...",
    "Connecting to bank network...",
    "Finalizing transfer...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[600px] mt-20 md:mt-10 mx-auto flex flex-col items-center justify-center animate-fade-in min-h-[400px]">
      {/* Spinning Secure Shield Animation */}

      <div className="relative mb-8">
        <div className=" bg-blue-200 rounded-full absolute inset-0 animate-ping" />
        <div className="relative bg-white rounded-full p-6 border border-blue-50 shadow-xl ">
          <div className="flex items-center justify-center text-blue-600">
            <Loader2
              size={64}
              strokeWidth={1.5}
              className="absolute text-blue-200 animate-spin"
            />
            <ShieldCheck size={32} className="z-10 relative animate-pulse" />
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
        Processing
      </h2>

      {/* Reassuring shifting text */}
      <div className="h-6">
        <p className="text-gray-500 font-medium animate-fade-in text-sm">
          {messages[messageIndex]}
        </p>
      </div>
    </div>
  );
};

export default TransactionProcessing;
