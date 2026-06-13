import { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import MobileAccountControl from "./MobileAccountControl";
import DesktopAccountControl from "./DesktopAccountControl";

const AccountControl = () => {
  const { dashboardData} = useOutletContext();
  const accounts = dashboardData?.data?.accounts || [];
  const totalBalance = dashboardData?.data?.totalBalance
  console.log(dashboardData)
  
  return (
    <div className="w-full max-w-md md:max-w-6xl mx-auto p-2 pb-20 min-h-screen">
      {/* Mobile Container */}
      <div className="md:hidden">
        <MobileAccountControl 
        balance = {totalBalance}
        accounts = {accounts} />
      </div>

      {/* Desktop Container */}
      <div className="hidden md:block">
        <DesktopAccountControl
        accounts = {accounts} />
      </div>
    </div>
  );
};
export default AccountControl;