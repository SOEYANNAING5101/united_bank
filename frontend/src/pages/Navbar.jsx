import { NavLink } from "react-router-dom";
import { ArrowRightLeft, Home, Bell, User, Search,Wallet } from "lucide-react";
import {UserButton} from '@clerk/clerk-react' 

const Navbar = () => {
  // This magic function automatically applies the blue styles if the URL matches the link!
  const navLinkStyles = ({ isActive }) =>
    `flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm transition-all duration-200 border ${
      isActive
        ? "border-blue-600 text-blue-600" // ACTIVE STATE (Blue)
        : "border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-600" 
    }`;

  return (
    <div className="flex p-2 items-center justify-between">
      {/* Bank Name */}
      <div className="text-xl font-bold ml-4 text-blue-700">United Bank</div>

      {/* Tab Buttons */}
      <div className="items-center gap-4 md:flex text-gray-700">
        <NavLink to="/dashboard" title='Home'className={navLinkStyles}>
          <Home size={20} strokeWidth={2.5} />
        </NavLink>
        <NavLink to="/transfer" title='TransferMoney' className={navLinkStyles}>
          <ArrowRightLeft size={20} strokeWidth={2.5} />
        </NavLink>
        <NavLink to="/account-control" title='Account Control' className={navLinkStyles}>
          <Wallet size={20} strokeWidth={2.5} />
        </NavLink>
        {/* You can add more NavLinks here later for other pages! */}
      </div>

      <div className="flex gap-6">
        {/* Search Bar */}
        <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
                placeholder="Search"
                className="h-10 pl-10 pr-3 flex items-center justify-center bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        {/* Notification */}
        <div>
          <button className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-md text-gray-500 hover:text-blue-600 transition-colors">
            <Bell size={20} />
          </button>
        </div>

        <UserButton afterSignOutUrl="/" />
        {/* Account */}
        <div>
          <button className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-md text-gray-500 hover:text-blue-600 transition-colors">
            <User size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;