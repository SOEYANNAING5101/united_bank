const UserProfileSkeleton = () => {
  return (
    <div className="mt-10 px-2 flex items-center justify-center mb-15">
      <div className={`flex flex-col w-full md:max-w-4/5`}>
        {/* Headers */}
        <div className="flex flex-col md:px-10 pt-8 py-4 px-4 border-b border-gray-200">
          <span className="h-8 w-45 bg-blue-200 rounded-md animate-pulse mb-3"></span>
          <div className="flex items-center justify-between">
            <span className="h-5 w-75 bg-gray-200 rounded-md animate-pulse"></span>
            <div
              className={`px-2 py-1 h-6 w-18 rounded-full bg-gray-200 animate-pulse`}
            ></div>
          </div>
        </div>
        {/* Email and Username */}
        <div className=" flex items-center gap-5 md:px-10 md:pt-8 py-4 px-4">
          {/* Profile Pic */}
          <div className="shrink-0 ">
            <div className="bg-blue-200 w-25 h-25 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="h-7 w-24 bg-gray-400 rounded-md animate-pulse mb-1"></span>
            <span className="h-5 w-38 bg-gray-200 rounded-md animate-pulse"></span>
          </div>
        </div>

        {/* Personal Details */}
        <div className="flex flex-col md:px-10  py-4 px-4">
          <div className="flex items-center relative mb-4">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse mr-2"></div>
            <div className="h-5 w-34 bg-gray-400 rounded-md animate-pulse mb-1"></div>
          </div>
          <div className="flex grid grid-cols-3 w-full items-center justify-between">
            {/* Legal First Name */}
            <div className="flex flex-col col-span-1 mb-4">
              <div className="h-3 md:h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 md:h-5 w-25 bg-gray-400 rounded-md animate-pulse"></div>
            </div>
            {/* Date of Birth */}
            <div className="flex flex-col col-span-1 mb-4">
              <div className="h-3 md:h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 md:h-5 w-25 bg-gray-400 rounded-md animate-pulse"></div>
            </div>
            <div className="flex flex-col col-span-1 mb-4">
              <div className="h-3 md:h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 md:h-5 w-25 bg-gray-400 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
        {/*  Contact Information */}
        <div className="flex flex-col md:px-10 py-4 px-4">
          <div className="flex items-center relative mb-4">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse mr-2"></div>
            <div className="h-5 w-40 bg-gray-400 rounded-md animate-pulse mb-1"></div>
            <div className=" right-0 top-0 absolute h-5 w-10 bg-blue-200 rounded-md animate-pulse mb-1"></div>
          </div>
          {/* Phone Number & Postal code */}
          <div className="flex w-full grid grid-cols-3 mb-4 ">
            {/* Phone Number */}
            <div className="flex flex-col ">
              <div className="h-3 md:h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 md:h-5 w-25 bg-gray-400 rounded-md animate-pulse"></div>
            </div>
            {/* Postal Code */}
            <div className="flex flex-col ">
              <div className="h-3 md:h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 md:h-5 w-25 bg-gray-400 rounded-md animate-pulse"></div>
            </div>
          </div>

          {/* Street Address*/}
          <div className="w-full flex flex-col mb-4 tracking-wider">
            <div className="h-3 md:h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 md:h-5 w-45 bg-gray-400 rounded-md animate-pulse"></div>
          </div>
          {/* City, Country, State/Province */}
          <div className="flex grid grid-cols-3 mb-4 w-full items-center justify-between">
            <div className="flex flex-col ">
              <div className="h-3 md:h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 md:h-5 w-25 bg-gray-400 rounded-md animate-pulse"></div>
            </div>

            {/* Country */}
            <div className="flex flex-col">
              <div className="h-3 md:h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 md:h-5 w-25 bg-gray-400 rounded-md animate-pulse"></div>
            </div>

            {/* State/Province */}
            <div className="flex flex-col">
              <div className="h-3 md:h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 md:h-5 w-25 bg-gray-400 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
        {/* Financial Profile */}
        <div className="flex flex-col md:px-10 py-4 px-4">
          <div className="flex items-center relative mb-4 ">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse mr-2"></div>
            <div className="h-5 w-34 bg-gray-400 rounded-md animate-pulse mb-1"></div>
            <div className=" right-0 top-0 absolute h-5 w-10 bg-blue-200 rounded-md animate-pulse mb-1"></div>
          </div>
          <div className="flex grid grid-cols-3 mb-4 w-full items-center">
            {/* Employment Status */}
            <div className="flex flex-col text-left">
              <div className="h-3 md:h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 md:h-5 w-25 bg-gray-400 rounded-md animate-pulse"></div>
            </div>
            {/* Source of wealth */}
            <div className="flex flex-col text-left">
              <div className="h-3 md:h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 md:h-5 w-25 bg-gray-400 rounded-md animate-pulse"></div>
            </div>
            {/* Tax ID / SSN */}
            <div className="flex flex-col text-left">
              <div className="h-3 md:h-4 w-15 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 md:h-5 w-25 bg-gray-400 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSkeleton;
