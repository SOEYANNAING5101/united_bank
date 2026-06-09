import { ArrowLeft, ArrowLeftRight, Shield,CreditCard,FileText,Settings } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const AccountDetails = () => {
  return (
    <div className=" max-w-[1400px] w-full mx-auto p-4 lg:p-8">
      <Link
        to="/account-control"
        className="mb-5 flex items-center gap-2 p-2 text-gray-500 font-medium self-start hover:text-gray-900 group"
      >
        <ArrowLeft size={18}></ArrowLeft>
        Back to account
      </Link>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end mb-6 gap-4 justify-between items-start">
        <div className="">
          <h2 className="text-4xl font-bold text-gray-800">Premium Checking</h2>
          <span className="text-md text-gray-500">Account No: ****4829</span>
        </div>

        <div className="">
          <p className="text-md text-gray-500">AVAILABLE BALANCE</p>
          <p className="text-4xl font-bold text-blue-600">$42,850.12</p>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-2 mb-6 md:grid-cols-4 gap-2">
        <button className="flex flex-col justify-center items-center hover:shadow-md transition-shadow rounded-2xl bg-white shadow-sm p-4">
          <div className="flex flex-col justify-center items-center rounded-full w-12 h-12 bg-blue-50 mb-3">
            <ArrowLeftRight size={24} className="text-blue-600" />
          </div>
          <span>Transfer</span>
        </button>

        <button className="flex flex-col justify-center items-center hover:shadow-md transition-shadow rounded-2xl bg-white shadow-sm p-4">
          <div className="flex flex-col justify-center items-center rounded-full w-12 h-12 bg-blue-50 mb-3">
            <CreditCard size={24} className="text-blue-600" />
          </div>
          <span>Pay Bill</span>
        </button>

        <button className="flex flex-col justify-center items-center hover:shadow-md transition-shadow rounded-2xl bg-white shadow-sm p-4">
          <div className="flex flex-col justify-center items-center rounded-full w-12 h-12 bg-blue-50 mb-3">
            <FileText size={24} className="text-blue-600" />
          </div>
          <span>Statements</span>
        </button>

        <button className="flex flex-col justify-center items-center hover:shadow-md transition-shadow rounded-2xl bg-white shadow-sm p-4">
          <div className="flex flex-col justify-center items-center rounded-full w-12 h-12 bg-blue-50 mb-3">
            <Settings size={24} className="text-blue-600" />
          </div>
          <span>Settings</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="flex flex-col col-span-7 rounded-2xl shadow-sm bg-white">
          left column
        </div>

        {/* Right column */}
        <div className="col-span-5 flex flex-col gap-4">
          {/* Bank Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl flex flex-col p-6 justify-between h-56">
            <div className="flex items-start justify-between mb-5">
              <h3 className=" tracking-widest italic font-bold text-xl">
                UNITED BANK
              </h3>
              <Shield size={18} />
            </div>

            <div className="">
              <p className="text-sm opacity-75 mb-1">Card Number</p>
              <p className="text-2xl mb-4 font-semibold font-mono">
                **** **** **** 1204
              </p>

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] opacity-75 mb-1">Card holder</p>
                  <p className="text-sm font-semibold">JOHN DOE</p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] opacity-75 mb-1">Expires</p>
                  <p className="text-sm font-semibold">23/28</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl flex flex-col p-6">
            <h1 className="text-lg font-bold text-gray-900 mb-6">October Activity</h1>

            <div>
              <div className="flex justify-between">
                <span className=" text-sm  text-gray-500">Money In</span>
                <span className="text-right font-semibold text-sm mb-4">
                  + $12,500.00
                </span>
              </div>
              <div className="w-full h-2 bg-emerald-100 rounded-full mb-6 overflow-hidden">
                <div className="w-[80%] h-full bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between">
                <span className=" text-sm  text-gray-500">Money In</span>
                <span className="text-right font-semibold text-sm mb-4">
                  + $12,500.00
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
                <div className="w-[40%] h-full bg-gray-800 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AccountDetails;
