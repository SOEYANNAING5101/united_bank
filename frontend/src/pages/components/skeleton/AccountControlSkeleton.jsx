const AccountControlSkeleton = () => {
  return (
    <div className="relative w-full mt-15 max-w-md md:max-w-6xl mx-auto p-2 pb-20 min-h-screen">
      <div className="w-full max-w-6xl mx-auto p-2 pb-20 pt-20">
        {/* Header */}
        <div className="justify-between flex md:mb-8 mb-4">
          <div className=" p-4">
            <div className="h-6 w-55 bg-gray-200 rounded-md animate-pulse mb-1"></div>
            <div className="h-4 w-60 md:w-105 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="hidden md:flex items-center justify-center animate-pulse">
            <div className="flex items-center w-40 h-15 bg-gray-600 rounded-xl "></div>
          </div>
        </div>
        {/* Total Balance Card for mobile view */}
        <div className="md:hidden w-full bg-gray-700 animate-pulse rounded-xl p-6 flex flex-col mb-4">
          <div className="h-6 w-25 bg-gray-200 rounded-md animate-pulse mb-2"></div>
          <div className="h-10 w-40 bg-gray-200 rounded-md animate-pulse mb-4 "></div>
          <div className="h-6 w-45 bg-gray-200 rounded-md animate-pulse mb-2"></div>
        </div>
        {/* Active Accounts for mobile views*/}
        <div className="md:hidden">
          <div className="h-6 w-45 bg-gray-200 rounded-md animate-pulse mb-2"></div>
          <div className="flex flex-col gap-3 mt-2 mb-8">
            {[1, 2, 3].map((item) => {
              return (
                <div
                  key={item}
                  className="border border-gray-300 rounded-xl flex items-center justify-between w-full p-4 bg-gray-200"
                >
                  <div className="flex gap-2">
                    <div className="h-10 w-10 bg-gray-500 rounded-md animate-pulse"></div>
                    <div className="flex flex-col ml-2 text-gray-700 place-items-start">
                      <div className="h-6 w-45 bg-gray-300 rounded-md animate-pulse mb-2"></div>
                      <div className="h-6 w-15 bg-gray-300 rounded-md animate-pulse mb-2"></div>
                    </div>
                  </div>

                  <div className="h-7 w-20 bg-gray-300 rounded-md animate-pulse mb-2"></div>
                </div>
              );
            })}
          </div>

          <div className="w-full bg-gray-600 rounded-xl shadow-md h-15 animate-pulse"></div>
        </div>

        {/* Account List for desktop view*/}
        <div className="bg-white rounded-lg shadow-md overflow-visible hidden md:block">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 p-4 rounded-t-lg bg-gray-200 bg-gray-100">
            <div className="col-span-5 h-6 w-45 bg-gray-500 rounded-md animate-pulse"></div>
            <div className="col-span-3 h-6 w-45 bg-gray-400 rounded-md animate-pulse"></div>
            <div className="col-span-3 flex justify-end">
              <div className="h-6 w-20 bg-gray-500 rounded-md animate-pulse justify-end"></div>
            </div>
            <div className="col-span-1 h-6 w-18 bg-gray-500 rounded-md animate-pulse text-center"></div>
          </div>
          {/* Account list */}
          {[1, 2, 3].map((item) => {
            return (
              <div
                key={item}
                className="grid grid-cols-12 rounded-b-lg gap-4 p-4 bg-gray-50 text-gray-500  flex justify-center items-center"
              >
                <div className="col-span-5 items-center flex gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-6 w-45 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
                {/* AccountNumberr */}
                <div className="col-span-3">
                  <div className="h-6 w-35 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
                {/* Balance */}
                <div className="col-span-3 flex justify-end">
                  <div className="h-6 w-25 bg-gray-200 rounded-md animate-pulse "></div>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <div className="h-6 w-2 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default AccountControlSkeleton;
