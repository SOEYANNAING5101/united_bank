import { NavLink } from "react-router-dom";
import {
  ArrowRightLeft,
  Home,
  Bell,
  Search,
  Wallet,
  Menu,
  Settings,
  FileText,
  LogOut,
  HelpCircle,
} from "lucide-react";
import {  useUser, useClerk } from "@clerk/clerk-react";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const { user } = useUser();
  const { signOut } = useClerk();
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchEnd || !touchStart) return;
    const distance = touchStart - touchEnd;
    const rightSwipe = distance < -minSwipeDistance;

    if (rightSwipe) {
      setIsOpen(false);
    }
  };

  const navLinkStyles = ({ isActive }) =>
    `flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm transition-all duration-200 border ${
      isActive
        ? "border-blue-600 text-blue-600"
        : " text-gray-600 hover:text-blue-600  hover:border-blue-600 "
    }`;

  // Menu Bar for mobile
  const mobileNavLinkStyles = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-blue-50 text-blue-600 font-bold"
        : "text-gray-600 hover:bg-gray-50 hover:text-blue-100 transition-colors hover:bg-blue-150 "
    }`;
  return (
    <div className="flex p-2 items-center justify-between relative z-50">
      {/* Bank Name */}
      <div className="text-2xl font-bold ml-4 text-blue-700">United Bank</div>

      {/* Tab Buttons */}
      <div className="hidden items-center gap-4 md:flex text-gray-600">
        <NavLink to="/dashboard" title="Home" className={navLinkStyles}>
          <Home size={20} strokeWidth={2.5} />
        </NavLink>
        <NavLink to="/transfer" title="TransferMoney" className={navLinkStyles}>
          <ArrowRightLeft size={20} strokeWidth={2.5} />
        </NavLink>
        <NavLink
          to="/account-control"
          title="Account Control"
          className={navLinkStyles}
        >
          <Wallet size={20} strokeWidth={2.5} />
        </NavLink>
      </div>

      <div className="flex  gap-3 md:gap-6 items-center mr-2 md:mr-4">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search
            className="md:absolute left-3 top-2.5 text-gray-600"
            size={20}
          />
          <input
            placeholder="Search"
            className="hidden md:flex h-10 pl-10 pr-3  items-center justify-center bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Notification */}
        <button className="text-gray-600">
          <Bell size={20} />
        </button>

        {/* Menu button for mobile version */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden text-gray-600 hover:text-blue-600 hover:border"
        >
          <Menu size={20} />
        </button>
        {/* Dark Overlay */}
        <div
          onClick={() => setIsOpen(false)}
          className={`md:hidden fixed inset-0 z-40 bg-black/60 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        ></div>

        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={`md:hidden mt-3px-2 flex flex-col h-screen py-3 fixed top-0 right-0 h-full w-[80%] z-50 bg-white rounded-tl-lg rounded-bl-lg transform transition-transform duration-600 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-100"}`}
        >
          <div className="p-6 shadow-sm border-transparent mb-5">
            <div className="flex items-center gap-4">
              <img
                src={user?.imageUrl || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-14 h-14 rounded-full border-2 border-blue-100"
              />
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-lg">
                  {user?.username || "Loading..."}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Premium Wealth Account
                </span>
              </div>
            </div>
          </div>
          {/* body */}
          <div className="p-2 flex flex-col justify-center items-left gap-3 overflow-y-auto">
            <NavLink
              to="document"
              onClick={() => {
                setIsOpen(false);
              }}
              className={mobileNavLinkStyles}
            >
              <FileText />
              <span>Documents & Statements</span>
            </NavLink>
            <NavLink
              to="/settings"
              onClick={() => {
                setIsOpen(false);
              }}
              className={mobileNavLinkStyles}
            >
              <Settings />
              <span>App Settings</span>
            </NavLink>

            <NavLink
              to="/support"
              onClick={() => {
                setIsOpen(false);
              }}
              className={mobileNavLinkStyles}
            >
              <HelpCircle />
              <span>Help & Support</span>
            </NavLink>
          </div>
          {/* Logout button */}
          <div className=" mt-auto p-3 border-t border-gray-400">
            <button
              onClick={() => signOut()}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-red-100 text-red-400 font-semibold hover:text-red-600 hover:bg-red-150"
            >
              <div className="flex gap-3">
                <LogOut size={20} />
                <span>Logout</span>
              </div>
              <p>V2.4.0</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
