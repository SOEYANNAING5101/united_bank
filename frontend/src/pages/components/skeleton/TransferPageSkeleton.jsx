import { ChevronRight } from 'lucide-react'

const TransferPageSkeleton = () => {

    return (
      <div className="w-full max-w-6xl mx-auto p-4 pb-20 pt-10 md:pt-15 relative">
        <div className="md:p-4 mt-8 md:mt-0">
          <div className="h-6 w-55 bg-gray-200 rounded-md animate-pulse mb-1"></div>
          <div className="h-4 w-60 md:w-105 bg-gray-200 rounded-md animate-pulse"></div>
        </div>

        <div className=" pointer-events-none grid lg:grid-cols-8 md:gird-cols-1 gap-2">
          <div className="lg:col-span-5 rounded-xl md:shadow-lg bg-gray-100 md:bg-white animate-pulse">
            <div className="md:p-4">
              {/* From Account */}
              <div className="mt-3 mb-3 relative">
                <div className="h-5 w-25 bg-gray-200 rounded-md animate-pulse  md:hidden block text-gray-500 text-xs md:text-sm font-semibold mb-2"></div>
                {/* Mobile */}
                <button className="animate-pulse pointer-events-none md:hidden w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50">
                  <div className="flex gap-4 items-center w-full">
                    <div className="w-12 h-12 rounded-full bg-gray-500 flex justify-center items-center"></div>
                    <div className="text-left flex flex-col gap-1">
                      <span className="h-5 w-45 bg-gray-200 rounded-md animate-pulse"></span>
                      <span className="h-5 w-25 bg-gray-200 rounded-md animate-pulse"></span>
                    </div>
                    <div className="ml-auto shrink-0 text-gray-400">
                      <ChevronRight size={20} strokeWidth={1.25} />
                    </div>
                  </div>
                </button>

                <div className="w-full hidden md:block">
                  <div className="h-5 w-25 bg-gray-200 rounded-md animate-pulses md:text-base font-semibold ml-3 mb-2"></div>
                  <div className="relative">
                    <div className="animate-pulse flex justify-between items-center text-gray-700 font-semibold w-full p-3 rounded-lg text-sm border border-gray-300 bg-gray-50 hover:bg-gray-100">
                      <div className="h-5 w-55 bg-gray-200 rounded-md animate-pulses"></div>
                      <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulses"></div>
                    </div>
                  </div>
                  <div className="flex justify-between p-1">
                    <div className="h-3 w-25 bg-gray-200 rounded-md animate-pulses ml-3 "></div>
                    <div className="h-3 w-20 bg-gray-200 rounded-md animate-pulses"></div>
                  </div>
                </div>
              </div>

              {/* To Account */}
              <div className="mb-3">
                <div className="h-5 w-25 bg-gray-200 rounded-md animate-pulses ml-3 mb-2"></div>
                <div className="flex gap-3">
                  <div className="relative w-full">
                    <div className="animate-pulse flex justify-between items-center text-gray-700 font-semibold w-full p-3 rounded-lg text-sm border border-gray-300 bg-gray-50 hover:bg-gray-100">
                      <div className="h-5 w-35 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                  </div>
                  <div className="border border-gray-300 animate-pulse bg-gray-50 px-6 rounded-lg flex items-center ">
                    <div className="h-5 w-15 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 mt-2 h-full space-y-2 bg-gray-100">
            {/* Balance summary card */}
            <div className="animate-pulse rounded-xl shadow-lg bg-blue-700 text-white p-6">
              <div className="h-6 w-45 bg-gray-200 rounded-md animate-pulses mb-4"></div>

              <div className="flex justify-between mb-2">
                <div className="h-4 w-45 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-4 w-15 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-45 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-4 w-15 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              <div className="flex justify-between mt-4 text-lg font-bold border-t">
                <div className="h-4 w-35 bg-gray-200 rounded-md animate-pulse mt-2"></div>
                <div className="h-4 w-15 bg-gray-200 rounded-md animate-pulse mt-2"></div>
              </div>
            </div>
            {/* Transaction summary */}
            <div className=" rounded-xl shadow-lg bg-white flex-grow p-6">
              <div className="h-6 w-65 bg-gray-200 rounded-md animate-pulses mb-4"></div>
              <div>
                <div className="h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-1"></div>
                <div className="h-4 w-45 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              <div className="mt-4">
                <div className="h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-1"></div>
                <div className="h-4 w-45 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              <div className="mt-4">
                <div className="h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-1"></div>
                <div className="h-4 w-45 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
            {/* Confirm transfer button */}
            <div className="lg:row-span-1 animate-fade-in">
              <div className="animate-pulse w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white disabled:bg-gray-400 disabled:cursor-not-allowed font-bold py-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
                <div className="h-4 w-25 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

};

export default TransferPageSkeleton;
