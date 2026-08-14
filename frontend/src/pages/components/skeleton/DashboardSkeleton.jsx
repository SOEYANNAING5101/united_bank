const DashboardSkeleton = () => {
  return (
        <div className="p-4 max-w-[1800px] gap-3 w-full mx-auto flex flex-col lg:grid lg:grid-cols-4 pb-24 lg:pb-0 pt-15">
        {/* Left Column */}
        <div className="flex flex-col gap-3 lg:col-span-3 w-full ">
          <div className="mb-2">
            <p className="h-5 bg-gray-200 rounded-md w-40 mb-2 animate-pulse"></p>
            <p className="h-7 bg-gray-200 rounded-md w-64  animate-pulse"></p>
          </div>
          <div className="flex flex-nowrap gap-4 overflow-x-auto scrollbar-none items-start w-full">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`flex flex-col bg-gray-200 animate-pulse rounded-2xl min-w-[200px] w-full max-w-[400px] h-35 justify-between relative overflow-hidden p-3 text-white `}
              ></div>
            ))}
          </div>
          <div className="min-h-[300px] lg:min-h-[380px] rounded-xl bg-white shadow-sm border border-gray-100 flex flex-col p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="flex-1 bg-gray-100 rounded-lg w-full"></div>
          </div>
        </div>
        {/* Right Column Skeleton */}
        <div className="flex flex-col gap-3 lg:col-span-1 w-full">
          {/* Recent Transactions Skeleton */}
          <div className="rounded-xl shadow-sm bg-white p-4 flex flex-col min-h-[320px]">
            <div className="flex justify-between items-center mb-1">
              <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </div>

            <div className="flex flex-col flex-1 ">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className=" flex justify-between items-center w-full mt-5"
                >
                  <div className="flex w-full gap-2 items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0"></div>
                    <div className="flex flex-col gap-2 ">
                      <p className="h-3 bg-gray-200 w-24 rounded-lg animate-pulse"></p>
                      <p className="h-3 bg-gray-200 w-16 rounded-lg  animate-pulse"></p>
                    </div>
                  </div>
                  <div className="  flex jusitfy-center items-center">
                    <p className="h-4 bg-gray-200 w-16 rounded-xl  animate-pulse"></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="rounded-xl shadow-lg bg-gray-500 p-4">
            <div className="h-5 bg-gray-400/20 rounded w-1/3 mb-4"></div>
            <div className="flex flex-col gap-3 animate-pulse">
              <button className="h-10 gap-2 bg-white/10  border border-white/10 transition-all rounded-lg w-full"></button>
              <button className="h-10 gap-2 bg-white/10  border border-white/10 transition-all rounded-lg w-full"></button>
              <button className="h-10 gap-2 bg-white/10 border border-white/10 transition-all rounded-lg w-full"></button>
            </div>
          </div>
        </div>
      </div>

  )
}
export default DashboardSkeleton;