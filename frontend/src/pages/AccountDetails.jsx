import { ArrowLeft, ArrowLeftRight, Shield,CreditCard,FileText,Settings } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import DestopAccoutDetails from "./DesktopAccountDetails";
import MobileAccountDetails from "./MobileAccountDetails"

const AccountDetails = () => {
  const location = useLocation();
  const account = location.state?.accountData
  return (
    <div className="w-full  mx-auto min-h-screen">
      <div className="hidden md:block">
        <DestopAccoutDetails account={account}/>
      </div>
      <div className="md:hidden">
        <MobileAccountDetails account={account}/>
      </div>
    </div>
  );
};
export default AccountDetails;
