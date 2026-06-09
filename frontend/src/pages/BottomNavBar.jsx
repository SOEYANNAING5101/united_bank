import { NavLink } from "react-router-dom";
import { LayoutDashboard, ArrowRightLeft, Wallet,Receipt } from "lucide-react";
const BottomNav = () => {
  const navLinkStyles = ({ isActive }) => 
    `flex items-center justify-center w-full h-full p-2  transition-colors 
    ${isActive ? "border-blue-600 text-blue-600"
        :"border-gray-600 text-gray-600"}`
    ;
  return (
    <div className="md:hidden flex justify-between items-center w-full fixed bottom-0 bg-white rounded-lg px-6 py-3 gap-2 border-t border-gray-200 z-30">
      <NavLink to='/dashboard' className={navLinkStyles}>
        <LayoutDashboard size={24}/>
      </NavLink>
      <NavLink to="/transfer" className={navLinkStyles}>
        <ArrowRightLeft size={24}/>
      </NavLink>
      <NavLink to="/account-control" className={navLinkStyles}>
        <Wallet size={24}/>
      </NavLink>
      <NavLink to="/dashboard" className={navLinkStyles}>
        <Receipt size={24}/>
      </NavLink>
    </div>
  );
};

export default BottomNav
