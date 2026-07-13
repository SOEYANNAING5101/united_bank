import { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import MobileAccountControl from "./MobileAccountControl";
import DesktopAccountControl from "./DesktopAccountControl";
import AccountControlSkeleton from './components/skeleton/AccountControlSkeleton'
import { ShieldAlert, LockKeyholeOpen, ShieldBan } from "lucide-react";

const AccountControl = () => {
  const { dashboardData, profileStatus, isLoading } = useOutletContext() || {};
  if (isLoading || !dashboardData || !profileStatus){
    return <AccountControlSkeleton />
  }
  const isVerified = profileStatus?.isVerified === true;
  
  const accounts = isVerified
    ? dashboardData?.data?.accounts || []
    : [
        {
          account_id: "mock-1",
          account_type: "checking",
          account_number: "00004567",
          balance: "12450.00",
        },
        {
          account_id: "mock-2",
          account_type: "saving",
          account_number: "00008912",
          balance: "45000.50",
        },
        {
          account_id: "mock-3",
          account_type: "credit",
          account_number: "00003456",
          balance: "1200.00",
        },
      ];
  const totalBalance = dashboardData?.data?.totalBalance;

  return (
    <div className="relative w-full mt-15 max-w-md md:max-w-6xl mx-auto p-2 pb-20 min-h-screen">
      {/* Verification Button */}
      {!isVerified && (
        <div className="border border-gray-200 md:max-w-[400px] w-3/4 absolute top-1/3 md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 p-5 md:p-10 text-gray-900 flex flex-col justify-center items-center bg-white rounded-xl">
          <div className="w-16 h-16  rounded-full bg-blue-50 flex items-center justify-center mb-5">
            <ShieldAlert size={28} className="text-blue-600" />
          </div>
          <div className="flex flex-col gap-2 ">
            <span className="text-lg md:text-2xl font-bold text-gray-900 mb-3 tracking-tight text-center">
              Account Verification required
            </span>
            <span className="text-xs md:text-sm text-gray-500 mb-8 leading-relaxed text-center max-w-md">
              To unlock full banking features including transfers, deposits, and
              account creation, please complete your identity check.
            </span>
          </div>
          <Link
            to="/onboarding-form"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm py-2 px-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
          >
            Complete Verification
          </Link>
          <div className="flex w-full items-center justify-between mt-10">
            <div className="text-gray-400 flex gap-1 items-center justify-center">
              <LockKeyholeOpen size={18} />
              <span className="text-[10px] md:text-xs tracking-wider">
                SECURE 256-BIT
              </span>
            </div>
            <div className="text-gray-400 flex gap-1 items-center justify-center">
              <ShieldBan size={18} />
              <span className="text-[10px] text-xs tracking-wider">
                GDPR COMPLIANT
              </span>
            </div>
          </div>
        </div>
      )}

      <div
        className={
          !isVerified
            ? "pointer-events-none opacity-40 blur-[2px] select-none overflow-hidden h-[80vh]"
            : " "
        }
      >
        {/* Mobile Container */}
        <div className="md:hidden">
          <MobileAccountControl
            balance={totalBalance}
            accounts={accounts}
            isVerified={isVerified}
          />
        </div>

        {/* Desktop Container */}
        <div className="hidden md:block">
          <DesktopAccountControl accounts={accounts} isVerified={isVerified} />
        </div>
      </div>
    </div>
  );
};
export default AccountControl;
