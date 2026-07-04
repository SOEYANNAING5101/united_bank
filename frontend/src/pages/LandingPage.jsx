import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import {
  ShieldCheck,
  ArrowRight,
  ShieldCogCorner,
  CreditCard,
  BadgeDollarSign,
  Zap,
} from "lucide-react";
import bank1stpic from "../assets/bank1stpic.png";
import dashboardPreview from "../assets/dashboard preview.png";
import secondpagePic from "../assets/secondpagePic.png";

const LandingPage = () => {
  return (
    <div className="">
      {/* Navbar */}
      <div className="px-8 py-4 border-b border-gray-200 ">
        <span className="text-blue-700">TrustBank</span>
      </div>
      {/* First Page */}
      <div className="  flex flex-col items-center justify-center border-b border-gray-200 ">
        <div className="w-full md:px-30 py-5 max-w-[2000px] ">
          <div className="grid gird-cols-1 lg:grid-cols-2 md:p-5 gap-6 ">
            <div className="col-span-1  rounded-xl p-8 flex flex-col gap-2 ">
              <div className="bg-blue-200/60 text-blue-700 px-5 py-1 flex items-start justify-center gap-2 rounded-full max-w-[400px]">
                <ShieldCheck size={18} />
                <span>Trusted by 2M+ users worldwide</span>
              </div>

              <div className="flex flex-col gap-3 mt-10 mb-10">
                <span className="text-4xl lg:text-7xl tracking-tight">
                  Banking
                </span>
                <span className="text-4xl lg:text-7xl tracking-tight text-blue-700">
                  Reimagined
                </span>
                <span className="text-4xl lg:text-7xl tracking-tight">
                  for Your Future
                </span>
              </div>

              <div className="mb-10 flex items-start">
                <p className="max-w-md">
                  Take absolute control of your financial destiny with
                  AI-powered insights, zero hidden fees, and high-yield
                  potential built into every transaction.
                </p>
              </div>
              {/* Buttons */}
              <div className="flex gap-4">
                <Link className="p-5 bg-blue-700 hover:bg-blue-800 gap-2 rounded-xl flex items-center justify-center text-white text-sm">
                  <span>Get Started Free</span>
                  <ArrowRight size={18} />
                </Link>

                <Link className="p-5 bg-gray-200 hover:bg-gray-300 gap-2 rounded-xl flex items-center justify-center text-black text-sm">
                  <span>Watch Demo</span>
                </Link>
              </div>
            </div>

            <div className="col-span-1 flex items-center justify-center w-full ">
              <div className="relative w-full max-w-md md:max-w-xl flex flex-col justify-center items-center p-6 transition-transform duration-500 ease-out hover:rotate-3">
                {/* Bounching div */}
                <div className="absolute -top-2 right-4 z-10 flex flex-col items-end animate-bounce">
                  <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs">RECEIVED</span>
                      <span className="font-bold">+$2,450.00</span>
                    </div>
                  </div>
                </div>

                {/* Picture */}
                <div className="p-4 flex items-center justify-center w-full">
                  <img
                    src={bank1stpic}
                    alt="United Bank Mobile App Preview"
                    className="object-contain shadow-2xl border-none drop-shadow-2xl rounded-2xl w-full"
                  />
                </div>

                {/* Secure vault */}
                <div className="absolute -bottom-2 left-4 z-10 flex">
                  <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-center gap-2 duration-200">
                    <ShieldCogCorner size={18} />
                    <div className="flex flex-col">
                      <span className="text-gray-800 text-sm tracking-wide font-bold">
                        Secure Vault
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Page */}
      <div className="  flex flex-col items-center justify-center border-b border-gray-200  ">
        <div className="md:px-30 py-5 md:py-5 max-w-[2000px] ">
          <div className=" flex flex-col items-center justify-center p-5">
            <span className="text-lg md:text-2xl font-semibold">
              Smart Banking, Smarter Features
            </span>
            <span className="text-center">
              Everything you need to manage your money in one place
            </span>
          </div>

          <div className="grid grid-cols-1  lg:grid-cols-3  p-5 gap-6 ">
            {/* Dashboard Preview */}
            <div className="lg:col-span-2 bg-blue-50 rounded-xl p-8 flex flex-col gap-2">
              <span className="text-lg md:text-2xl font-semibold">
                Spending Intelligence
              </span>
              <span className="text-sm text-black/80 max-w-md">
                Automatically categorize every penny you spend and get
                predictive alerts before you reach your limits.
              </span>
              {/* Picture */}
              <div className="relative w-full mt-auto pt-6 flex justify-center items-end transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105">
                <img
                  src={dashboardPreview}
                  alt="United Bank Mobile App Preview"
                  className="object-contain shadow-2xl border-none rounded-2xl"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#eef1f4] to-transparent pointer-events-none"></div>
              </div>
            </div>
            {/* Global Transfers & Virtual Cards */}
            <div className="lg:col-span-1 grid grid-rows-1 lg:grid-rows-2 gap-6 w-full">
              <div className="row-span-1 rounded-xl p-8 bg-blue-700 flex flex-col justify-between min-h-[250px] w-full">
                <div>
                  <BadgeDollarSign className="text-white" size={30} />
                </div>

                <div className="flex flex-col">
                  <span className="text-white text-lg font-semibold">
                    Global Transfers
                  </span>
                  <span className="text-sm text-white/80">
                    Send money across borders in seconds with zero fees and
                    real-time rates.
                  </span>
                </div>
              </div>
              <div className="row-span-1 rounded-xl p-8 bg-blue-50 flex flex-col justify-between min-h-[250px] w-full">
                <div>
                  <CreditCard className="text-blue-700" size={30} />
                </div>

                <div className="flex flex-col">
                  <span className="text-black text-lg font-semibold">
                    Virtual Cards
                  </span>
                  <span className="text-sm text-black/80">
                    Generate instant burners for safer online shopping and
                    subscription control.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Page */}
      <div className="  flex flex-col items-center justify-center border-b border-gray-200  ">
        <div className=" md:px-30 md:py-5 max-w-[2000px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 p-5 gap-6 ">
            <div className="col-span-1  rounded-xl p-8 flex flex-col gap-2 justify-center">
              <span className="text-lg md:text-2xl font-semibold">
                Stay in Control with Dynamic Limits
              </span>
              <span className="text-xs md:text-sm text-black/80 max-w-md">
                Adjust your spending power in real-time. Whether it's a daily
                cap or a specific category freeze, you're the boss.
              </span>

              <div className=" w-full mt-10 flex flex-col justify-center">
                {/* Daily Spending Limit */}
                <div className="bg-blue-50 rounded-xl p-6 md:p-8 mt-4 mb-4">
                  <div className="flex justify-between">
                    <span className="md:text-base text-sm">
                      Daily Spending Limit
                    </span>
                    <span className="text-blue-700 md:text-base text-sm">
                      $4,500.00
                    </span>
                  </div>
                  <div className="w-full h-2 bg-blue-700 rounded-full mt-2 mb-2"></div>
                  <div className="flex justify-between text-xs">
                    <span>Used: $3,375.00</span>
                    <span className="">75%</span>
                  </div>
                </div>
                {/* Instant Overlimit Alerts */}
                <div className="bg-blue-50 rounded-xl p-6 flex gap-2 mt-5 flex items-center justify-center">
                  <div className="w-10 h-10 p-2 bg-blue-200/60 flex items-center justify-center rounded-full">
                    <Zap size={18} className="text-blue-800" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-black text-sm font-semibold">
                      Instant Overlimit Alerts
                    </span>
                    <span className="text-xs text-black/80">
                      Get notified instantly when you're at 90% of your
                      threshold.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 flex items-center justify-center w-full ">
              <div className=" w-full flex items-center justify-center">
                <img
                  src={secondpagePic}
                  alt="United Bank Mobile App Preview"
                  className="object-contain shadow-2xl border-none drop-shadow-2xl rounded-2xl border"
                />
              </div>
            </div>
          </div>

          {/* Future banking */}
          <div className="p-5">
            <div className="w-full rounded-xl flex flex-col items-center justify-center bg-gray-800 p-8 p-5 mt-5 mb-5 md:mt-10 md:mb-10">
              <span className="text-white md:text-4xl font-semibold p-4">
                The future of banking is here.
              </span>
              <span className="text-center max-w-md text-xs md:text-sm text-white/80">
                Join thousands of users who have already upgraded their
                financial life. Opening an account takes less thn 3 minutes.
              </span>

              <div className="flex gap-4 mt-3">
                <Link className="p-3 md:p-5 bg-blue-700 hover:bg-blue-800 gap-2 rounded-xl flex items-center justify-center text-white text-xs md:text-sm">
                  <span >Get Started Free</span>
                  <ArrowRight size={18} />
                </Link>
                <Link className="p-3 md:p-5 border-2 border-gray-200 hover:bg-gray-900 gap-2 rounded-xl flex items-center justify-center text-white text-xs md:text-sm">
                  <span>Compare Plans</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="flex flex-col items-center justify-center border-b border-gray-200 ">
        <div className="px-5 md:px-15 py-5">
          <div className="grid grid-cols-5 gap-4 border-b border-gray-200 md:p-4">
            <div className="col-span-2 flex flex-col ">
              <span className="text-blue-700 mb-4">TrustBank</span>
              <span className="text-xs md:text-sm text-black/80 max-w-md  mb-4">
                Redefining financial freedom through innovative technology and
                transparent banking for the modern generation.
              </span>
            </div>
            <div className="col-span-1 flex flex-col">
              <span className="mb-4 text-sm md:text-base">Product</span>
              <span className="text-xs md:text-sm text-black/80 mb-1">Cards</span>
              <span className="text-xs md:text-sm text-black/80 mb-1">Savings</span>
              <span className="text-xs md:text-sm text-black/80 mb-1">Business</span>
            </div>
            <div className="col-span-1 flex flex-col ">
              <span className="mb-4 text-sm md:text-base">Company</span>
              <span className="text-xs md:text-sm text-black/80 mb-1">About Us</span>
              <span className="text-xs md:text-sm text-black/80 mb-1">Careers</span>
              <span className="text-xs md:text-sm text-black/80 mb-1">Press</span>
            </div>
            <div className="col-span-1 flex flex-col">
              <span className="mb-4 text-sm md:text-base">Support</span>
              <span className="text-xs md:text-sm text-black/80 mb-1">Help Center</span>
              <span className="text-xs md:text-sm text-black/80 mb-1">Security</span>
              <span className="text-xs md:text-sm text-black/80 mb-1">Contact</span>
            </div>
          </div>
          <div className="flex flex-col md:flex justify-between py-4 text-sm text-black/80 mb-1">
            <span className="text-sm md:text-base text-center">
              © 2024 TrustBank Executive Wealth Management. Member FDIC. Equal Housing Lender.
            </span>
            <div className="flex p-2 gap-2 items-center justify-center text-gray-500">
              <span className="text-xs md:text-sm text-center">Privacy Policy</span>
              <span className="text-xs md:text-sm text-center">Terms of Service</span>
              <span className="text-xs md:text-sm text-center">Security</span>
              <span className="text-xs md:text-sm text-center">Cookie Settings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LandingPage;
