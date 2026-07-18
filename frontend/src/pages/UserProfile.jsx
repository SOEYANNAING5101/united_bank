import {
  User,
  Pencil,
  Contact,
  ChartCandlestick,
  ShieldAlert,
  LockKeyholeOpen,
  ShieldBan,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useState, useRef } from "react";
import UserBaseModal from "./components/modal/UserBaseModal";
import ContactForm from "./components/modal/ContactForm";
import FinancialForm from "./components/modal/FinancialForm";
import { Toaster } from "react-hot-toast";
import { useOutletContext, Link } from "react-router-dom";

const UserProfilePage = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const { profileStatus } = useOutletContext() || {};
  const isVerified = profileStatus?.isVerified === true;
  const isUnVerified = profileStatus?.isVerified === false;

  //   Profile Pic
  const fileInputRef = useRef(null);
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);

  // modal open/close
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploadingProfilePic(true);
      await user.setProfileImage({ file });
    } catch (error) {
      console.error("Failed to upload profile pic", error);
    } finally {
      setIsUploadingProfilePic(false);
    }
  };
  // Fetch Profile Details from database
  const {
    data: profileData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await fetch(`${baseUrl}/api/profile/`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }
      return response.json();
    },
    enabled: isVerified,
  });
  if (isLoading) {
    return (
      <div className="mt-20 flex items-center justify-center">
        Profile details loading
      </div>
    );
  }
  if (isError) {
    return (
      <div className="mt-20 flex items-center justify-center">
        Error in fetching profile details.
      </div>
    );
  }

  return (
    <div className="mt-10 mb-20 md:mb-10 px-2 flex items-center justify-center">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: "text-sm rounded-xl p-2 whitespace-nowrap min-w-max",
        }}
      />
      {/* Verification Button */}
      <div
        className={`fixed border border-gray-200 md:max-w-[400px] w-3/4 absolute top-1/3 md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 p-5 md:p-10 text-gray-900 flex flex-col justify-center items-center bg-white rounded-xl 
          ${isUnVerified ? "opacity-100 z-50 visible" : "opacity-0 -z-10 invisible"}`}
      >
        <div className="w-16 h-16  rounded-full bg-blue-50 flex items-center justify-center mb-5">
          <ShieldAlert size={28} className="text-blue-600" />
        </div>
        <div className="flex flex-col gap-2 ">
          <span className="text-lg md:text-2xl font-bold text-gray-900 mb-3 tracking-tight text-center">
            Account Verification required
          </span>
          <span className="text-xs md:text-sm text-gray-500 mb-8 leading-relaxed text-center max-w-md">
            To unlock full banking features including transfers, deposits, and
            account creation, please complete your identity check.
          </span>
        </div>
        <Link
          to="/onboarding-form"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm py-2 px-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
        >
          Complete Verification
        </Link>
        <div className="flex w-full items-center justify-between mt-10">
          <div className="text-gray-400 flex gap-1 items-center justify-center">
            <LockKeyholeOpen size={18} />
            <span className="text-[10px] md:text-xs tracking-wider">
              SECURE 256-BIT
            </span>
          </div>
          <div className="text-gray-400 flex gap-1 items-center justify-center">
            <ShieldBan size={18} />
            <span className="text-[10px] text-xs tracking-wider">
              GDPR COMPLIANT
            </span>
          </div>
        </div>
      </div>
      <div
        className={`flex flex-col w-full md:max-w-4/5 ${isVerified ? " " : "pointer-events-none opacity-40 blur-[2px]"}`}
      >
        {/* Headers */}
        <div className="flex flex-col md:px-10 pt-8 py-4 px-4 border-b border-gray-200">
          <span className="text-xl md:text-2xl font-bold text-blue-700">
            Executive Hub
          </span>
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-sm max-w-md text-gray-600">
              Manage your personal information.
            </span>
            <div className="flex gap-2">
              <div className="px-2 py-1 rounded-full bg-blue-200 shrink-0">
                <span className="text-xs text-gray-800">Premier Status</span>
              </div>
              <div
                className={`px-2 py-1 rounded-full ${isUnVerified ? "bg-red-700" : "bg-blue-700"}`}
              >
                <span className="text-xs text-white">
                  {isVerified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Email and Username */}
        <div className=" flex items-center gap-5 md:px-10 md:pt-8 py-4 px-4">
          {/* Profile Pic */}
          <div className="shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            {/* Profile Pic */}
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={isUploadingProfilePic}
              className="relative group w-25 h-25 rounded-full border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer flex items-center justify-center overflow-hidden "
            >
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                ></img>
              ) : (
                <User size={35} />
              )}
              <div className="absolute bg-black/40 inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pencil size={24} className="text-white" />
              </div>

              {isUploadingProfilePic && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </div>
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-bold">
              {user?.username.toUpperCase() ||
                profileData?.first_name ||
                "User"}
            </span>
            <span className="text-gray-700 text-sm">
              {user?.emailAddresses[0].emailAddress ||
                profileData?.first_name ||
                "User"}
            </span>
            {/* <span className="text-gray-500 text-xs mt-2">Member Since Jan 2018</span> */}
          </div>
        </div>

        {/* Personal Details */}
        <div className="flex flex-col md:px-10  py-4 px-4">
          <div className="flex items-center relative mb-4 ">
            <User size={20} className="mr-3" />
            <span className="text-base text-black font-bold">
              Personal Details
            </span>
          </div>
          <div className="flex grid grid-cols-3 w-full items-center justify-between">
            {/* Legal First Name */}
            <div className="flex flex-col col-span-1 mb-4">
              <label className="text-xs text-gray-600">Legal First Name</label>
              <span className="text-xs md:text-sm text-gray-900 font-semibold">
                {profileData?.first_name ? `${profileData.first_name}` : ""}
              </span>
            </div>
            {/* Date of Birth */}
            <div className="flex flex-col col-span-1 mb-4">
              <label className="text-xs text-gray-600">Legal Last Name</label>
              <span className="text-xs md:text-sm text-gray-900 font-semibold">
                {profileData?.last_name ? `${profileData.last_name}` : ""}
              </span>
            </div>
            <div className="flex flex-col col-span-1 mb-4">
              <label className="text-xs text-gray-600">Date of birth</label>
              <span className="text-xs md:text-sm text-gray-900 font-semibold">
                {profileData?.dob
                  ? new Date(profileData.dob).toLocaleDateString("en-US", {
                      timeZone:
                        "UTC" /* Forces it to ignore local browser time offsets so the day doesn't jump backwards */,
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : ""}
              </span>
            </div>
          </div>
        </div>
        {/*  Contact Information */}
        <div className="flex flex-col md:px-10 py-4 px-4">
          <div className="flex items-center relative mb-4">
            <Contact size={20} className="mr-3" />
            <span className="text-base text-black font-bold">
              Contact Information
            </span>
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="flex gap-1 items-center justify-center text-blue-700 hover:text-blue-900 cursor-pointer right-0 top-0 absolute"
            >
              <Pencil size={10} />
              <span className="text-xs">Edit</span>
            </button>
          </div>
          {/* Phone Number & Postal code */}
          <div className="flex w-full grid grid-cols-3 mb-4 ">
            {/* Phone Number */}
            <div className="flex flex-col ">
              <label className="text-xs text-gray-600">Phone Number</label>
              <span className="text-xs md:text-sm text-gray-900 font-semibold">
                {profileData?.phone_number ? `${profileData.phone_number}` : ""}
              </span>
            </div>
            {/* Postal Code */}
            <div className="flex flex-col ">
              <label className="text-xs text-gray-600">Postal/Zip Code</label>
              <span className="text-xs md:text-sm text-gray-900 font-semibold">
                {profileData?.postal_code ? `${profileData.postal_code}` : ""}
              </span>
            </div>
          </div>

          {/* Street Address*/}
          <div className="w-full flex flex-col mb-4 tracking-wider">
            <label className="text-xs text-gray-600">Street Address</label>
            <span className="text-xs md:text-sm  text-gray-900 font-semibold">
              {profileData?.street_adress ? `${profileData.street_adress}` : ""}
            </span>
          </div>
          {/* City, Country, State/Province */}
          <div className="flex grid grid-cols-3 mb-4 w-full items-center justify-between">
            <div className="flex flex-col ">
              <label className="text-xs text-gray-600">City</label>
              <span className="text-xs md:text-sm text-gray-900 font-semibold">
                {profileData?.city ? `${profileData.city}` : ""}
              </span>
            </div>

            {/* Country */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-600">Country</label>
              <span className="text-xs md:text-sm text-gray-900 font-semibold">
                {profileData?.country ? `${profileData.country}` : ""}
              </span>
            </div>

            {/* State/Province */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-600">State/Province</label>
              <span className="text-xs md:text-sm text-gray-900 font-semibold">
                {profileData?.state_province
                  ? `${profileData.state_province}`
                  : ""}
              </span>
            </div>
          </div>
        </div>
        {/* Financial Profile */}
        <div className="flex flex-col md:px-10 py-4 px-4">
          <div className="flex items-center relative mb-4 ">
            <ChartCandlestick size={20} className="mr-3" />
            <span className="text-base text-black font-bold">
              Financial Profile
            </span>
            <button
              type="button"
              onClick={() => setIsFinancialModalOpen(true)}
              className="flex gap-1 items-center justify-center text-blue-700 hover:text-blue-900 cursor-pointer right-0 top-0 absolute"
            >
              <Pencil size={10} />
              <span className="text-xs">Edit</span>
            </button>
          </div>
          <div className="flex grid grid-cols-3 mb-4 w-full items-center">
            {/* Employment Status */}
            <div className="flex flex-col text-left">
              <label className="text-xs text-gray-600">Employment Status</label>
              <span className="text-xs md:text-sm text-gray-900 font-semibold">
                {profileData?.employment_status
                  ? `${profileData.employment_status.charAt(0).toUpperCase()}${profileData.employment_status.slice(1)}`
                  : ""}
              </span>
            </div>
            {/* Source of wealth */}
            <div className="flex flex-col text-left">
              <label className="text-xs text-gray-600">Source of wealth</label>
              <span className="text-xs md:text-sm text-gray-900 font-semibold">
                {profileData?.source_of_wealth
                  ? `${profileData.source_of_wealth.charAt(0).toUpperCase()}${profileData.employment_status.slice(1)}`
                  : ""}
              </span>
            </div>
            {/* Tax ID / SSN */}
            <div className="flex flex-col text-left">
              <label className="text-xs text-gray-600">Tax ID / SSN</label>
              <span className="text-xs md:text-sm  text-gray-900 font-semibold">
                {profileData?.tax_id ? `****${profileData.tax_id}` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
      <UserBaseModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title={"Update Contact Information"}
      >
        <ContactForm
          profileData={profileData}
          onClose={() => setIsContactModalOpen(false)}
        />
      </UserBaseModal>
      <UserBaseModal
        isOpen={isFinancialModalOpen}
        onClose={() => setIsFinancialModalOpen(false)}
        title={"Update Financial Profile"}
      >
        <FinancialForm
          profileData={profileData}
          onClose={() => setIsFinancialModalOpen(false)}
        />
      </UserBaseModal>
    </div>
  );
};
export default UserProfilePage;
