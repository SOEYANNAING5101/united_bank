import { NavLink, Link } from "react-router-dom";
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
  User,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  // Profile Icon Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileDropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileModalOpen(false);
      }
    };
    if (isProfileModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileModalOpen]);

  const navLinkStyles = ({ isActive }) =>
    `relative flex items-center justify-center transition-all duration-200 pb-2
    after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-gray-800 after:transition-all after:duration-300 ease-in-out
    ${
      isActive
        ? "text-gray-900 after:w-full font-bold"
        : " text-gray-600 hover:text-gray-900 after:w-0 hover:after:w-full"
    }`;

  // Menu Bar for mobile
  const mobileNavLinkStyles = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-blue-50 text-blue-600 font-bold"
        : "text-gray-600 hover:bg-gray-50 hover:text-blue-100 transition-colors hover:bg-blue-150 "
    }`;
  return (
    <div className="flex px-6 py-4 bg-gray-100 items-center justify-between top-0 left-0 w-full z-50 fixed border-b border-gray-300">
      <div className="flex justify-between items-center gap-10">
        {/* Bank Name */}
        <Link
          to="/dashboard"
          className="text-2xl font-bold ml-4 text-blue-700 cursor-pointer"
        >
          TrustBank
        </Link>

        {/* Tab Buttons */}
        <div className="hidden items-center gap-6 md:flex text-gray-600 ">
          <NavLink to="/dashboard" title="Home" className={navLinkStyles}>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/transfer"
            title="TransferMoney"
            className={navLinkStyles}
          >
            {/* <ArrowRightLeft size={20} strokeWidth={2.5} /> */}
            <span>Transfers</span>
          </NavLink>
          <NavLink
            to="/account-control"
            title="Account Control"
            className={navLinkStyles}
          >
            {/* <Wallet size={20} strokeWidth={2.5} /> */}
            <span>Accounts</span>
          </NavLink>
        </div>
      </div>

      <div className="flex  gap-3 md:gap-6 items-center ">
        <button className="text-gray-600">
          <Bell size={20} />
        </button>
        {/* User profile */}
        <div
          ref={profileDropdownRef}
          className="hidden md:flex col-span-1 justify-center relative"
        >
          <button
            onClick={() => setIsProfileModalOpen(!isProfileModalOpen)}
            className="text-gray-600 cursor-pointer"
          >
            <User size={20} />
          </button>
          {isProfileModalOpen && (
            <div className="bg-white absolute top-10 w-56 right-0 rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in-up">
              <Link
                onClick={() => {
                  isProfileModalOpen(false);
                }}
                to="/user-profile"
                className="flex rounded-tl-xl rounded-tr-xl px-5 py-4  hover:bg-gray-50 flex flex-col cursor-pointer"
              >
                <span className="text-base text-gray-800 font-bold">
                  {user?.username.toUpperCase() || "Loading..."}
                </span>
                <span className="text-xs text-gray-700">
                  {user?.username || "Loading..."}
                </span>
              </Link>
              <div className=" border-b border-t border-gray-200">
                {/* Settings */}
                <Link
                  className={` flex gap-2 items-center px-5 py-4 text-xs text-gray-700 hover:bg-gray-50`}
                >
                  <Settings size={20} strokeWidth={2.5} />
                  <span>Settings</span>
                </Link>
                {/* Document & Statements */}
                <Link
                  className={` flex gap-2 items-center px-5 py-4 text-xs text-gray-700 hover:bg-gray-50`}
                >
                  <FileText size={20} strokeWidth={2.5} />
                  <span>Document & Statements</span>
                </Link>
                {/* Help & Support */}
                <Link
                  className={` flex gap-2 items-center px-5 py-4 text-xs text-gray-700 hover:bg-gray-50`}
                >
                  <HelpCircle size={20} strokeWidth={2.5} />
                  <span>Help & Support</span>
                </Link>
              </div>
              <button
                onClick={() => signOut()}
                className={` flex gap-2 w-full items-center px-5 py-4 text-xs text-red-800 hover:bg-red-50 rounded-bl-xl rounded-br-xl cursor-pointer`}
              >
                <LogOut size={20} strokeWidth={2.5} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

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
        {/* Mobile Menu Slide Bar */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={`md:hidden px-2 flex flex-col h-screen py-3 fixed top-0 right-0 w-[80%] z-50 bg-white rounded-tl-lg rounded-bl-lg transform transition-transform duration-600 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <Link
            onClick={() => {
              setIsOpen(false);
            }}
            to="/user-profile"
            className="p-6 shadow-sm border-transparent mb-5"
          >
            <div className="flex items-center gap-4">
              <img
                src={user?.imageUrl || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-14 h-14 rounded-full border-2 border-blue-100"
              />
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-lg">
                  {user?.username.toUpperCase() || "Loading..."}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Standard Account
                </span>
              </div>
            </div>
          </Link>
          {/* Side Navbar for mobile version */}
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

            <button
              onClick={() => signOut()}
              className={`flex gap-3 w-full items-center p-3 text-red-800 hover:bg-red-50 rounded-bl-xl rounded-br-xl cursor-pointer bottom-5 absolute`}
            >
              <LogOut size={20} strokeWidth={2.5} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
