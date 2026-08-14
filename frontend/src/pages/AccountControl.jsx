import { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import MobileAccountControl from "./MobileAccountControl";
import DesktopAccountControl from "./DesktopAccountControl";
import AccountControlSkeleton from "./components/skeleton/AccountControlSkeleton";
import { ShieldAlert, LockKeyholeOpen, ShieldBan } from "lucide-react";
import { usePageState } from "../hooks/usePageState";
import VerificationGate from "./components/VerificationGate";

const AccountControl = () => {
  // const { dashboardData, profileStatus, isLoading } = useOutletContext() || {};

  const { state, dashboardData, accounts } = usePageState();

  if (state === "LOADING") {
    return <AccountControlSkeleton />;
  }

  if (state === "UNVERIFIED") {
    const mockAccounts = [
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

    return (
      <VerificationGate>
        <AccountControlLayout accounts={mockAccounts} totalBalance={568525.5} />
      </VerificationGate>
    );
  }
  return (
    <AccountControlLayout 
    accounts={accounts}
    totalBalance={dashboardData?.data?.totalBalance}/>
  )

};
export default AccountControl;

const AccountControlLayout = ({ accounts, totalBalance }) => {
  return (
    <div className="relative w-full mt-15 max-w-md md:max-w-6xl mx-auto p-2 pb-20 min-h-screen">
      {/* Mobile Container */}
      <div className="md:hidden">
        <MobileAccountControl balance={totalBalance} accounts={accounts} />
      </div>
      {/* Desktop Container */}
      <div className="hidden md:block">
        <DesktopAccountControl accounts={accounts} />
      </div>
    </div>
  );
};
