import { useForm, Controller } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { MapPin } from "lucide-react";
import CustomDropdown2 from "../dropdown/CustormDropdown2";
import { useAuth } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";

const ContactForm = ({ profileData, onClose }) => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const {
    register,
    control,
    handleSubmit,
    watch,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      phonenumber: profileData?.phone_number || "",
      streetaddress: profileData?.street_address || "",
      city: profileData?.city || "",
      stateprovince: profileData?.state_province || "",
      postal: profileData?.postal_code || "",
      country: profileData?.country || "",
    },
  });
  const [streetAddressValue, cityValue, stateProvinceValue, postalValue] =
    watch(["streetaddress", "city", "stateprovince", "postal", "country"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const [response] = await Promise.all([
        fetch(`${baseUrl}/api/profile/contact`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            phone_number: data.phonenumber,
            street_address: data.streetaddress,
            city: data.city,
            state_province: data.stateprovince,
            postal_code: data.postal,
            country: data.country,
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);
      if (!response.ok) {
        throw new Error("Failed to update contact information");
      }
      toast.success("Contact information updated successfully!");
      onClose();
      await queryClient.invalidateQueries({
        queryKey: ["userProfile"],
      });
    } catch (error) {
      console.error("Error updating contact information", error.message);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const countryOptions = [
    { value: "SG", label: "Singapore" },
    { value: "US", label: "United States" },
    { value: "GB", label: "United Kingdom" },
    { value: "AU", label: "Australia" },
    { value: "CA", label: "Canada" },
    { value: "MY", label: "Malaysia" },
  ];
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Phone Number*/}
      <div className="flex flex-col gap-1 mb-10">
        <label className="text-xs text-gray-600">Phone Number</label>
        <Controller
          control={control}
          name="phonenumber"
          rules={{
            required: "Phone Number is required",
            onChange: () => clearErrors("phonenumber"),
            validate: (value) =>
              isValidPhoneNumber(value || "") || "Invalid phone number format",
          }}
          render={({ field: { onChange, value } }) => (
            <div
              className={`p-2 rounded-lg transition-colors duration-500 border border-gray-200 focus:ring-blue-500
                          [&_input]:focus:outline-none [&_input]:bg-transparent
                           ${
                             errors.phonenumber
                               ? "border-red-300 focus-within:ring-1 focus-within:ring-red-500"
                               : "border-gray-200 focus-within:ring-1 focus-within:ring-blue-500"
                           }
                          ${value ? "bg-blue-50" : "bg-transparent"}`}
            >
              <PhoneInput
                international
                defaultCountry="SG"
                placeholder="Enter phone number"
                value={value}
                onChange={onChange}
                className="text-xs text-gray-600 focus:outline-none focus:ring-none w-full gap-2"
              />
            </div>
          )}
        />
        {errors.phonenumber && (
          <span className="text-[10px] text-red-600">
            {errors.phonenumber.message}
          </span>
        )}
      </div>

      {/* Residential Address Label */}
      <div className="flex gap-2 mb-4 flex items-center">
        <MapPin className="text-blue-700" size={18} />{" "}
        <span className="text-base text-blue-700 font-semibold">
          Residential Address
        </span>
      </div>

      {/* Street Address */}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs text-gray-600">Street Address</label>
        <input
          type="text"
          {...register("streetaddress", {
            required: "Street Adress is required",
            maxLength: {
              value: 100,
              message: "Address cannot exceed 100 characters",
            },
            minLength: {
              value: 5,
              message: "Address is too short to be valid",
            },
            onChange: () => clearErrors("streetaddress"),
          })}
          placeholder="e.g. 123 Financial District Way"
          className={`p-2 text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 border border-gray-200 focus:ring-blue-500 
                        ${
                          errors.streetaddress
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-200 focus:ring-blue-500"
                        } 
                        ${streetAddressValue ? "bg-blue-50 " : "bg-transparent"}`}
        ></input>
        {errors.streetaddress && (
          <span className="text-[10px] text-red-600">
            {errors.streetaddress.message}
          </span>
        )}
      </div>
      {/* City & State/province */}
      <div className="flex w-full gap-4">
        {/* City */}
        <div className="flex flex-col gap-1 mb-4 w-full">
          <label className="text-xs text-gray-600">City</label>
          <input
            type="text"
            {...register("city", {
              required: "City is required",
              maxLength: {
                value: 50,
                message: "City name cannot exceed 100 characters",
              },
              minLength: {
                value: 2,
                message: "City name is too short to be valid",
              },
              pattern: {
                // Only allows letters, spaces, hyphens, apostrophes, and periods
                value: /^[a-zA-Z\s\-'.]+$/,
                message: "Invalid characters in city name",
              },
              onChange: () => clearErrors("city"),
            })}
            placeholder="e.g. New York"
            className={`w-full p-2 text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 border border-gray-200 focus:ring-blue-500 
                          ${
                            errors.city
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-200 focus:ring-blue-500"
                          } 
                        ${cityValue ? "bg-blue-50" : "bg-transparent"}`}
          ></input>
          {errors.city && (
            <span className="text-[10px] text-red-600">
              {errors.city.message}
            </span>
          )}
        </div>
        {/* State/Province */}
        <div className="flex flex-col gap-1 mb-4 w-full">
          <label className="text-xs text-gray-600">State/Province</label>
          <input
            type="text"
            {...register("stateprovince", {
              maxLength: {
                value: 50,
                message: "State name cannot exceed 100 characters",
              },
              minLength: {
                value: 2,
                message: "State name is too short to be valid",
              },
              pattern: {
                // Only allows letters, spaces, hyphens, apostrophes, and periods
                value: /^[a-zA-Z\s\-'.]+$/,
                message: "Invalid characters in state name",
              },
              onChange: () => clearErrors("stateprovince"),
            })}
            placeholder="e.g. NY"
            className={`w-full p-2 text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 border border-gray-200 focus:ring-blue-500 
                             ${stateProvinceValue ? "bg-blue-50" : "bg-transparent"}
                             ${
                               errors.stateprovince
                                 ? "border-red-300 focus:ring-red-500"
                                 : "border-gray-200 focus:ring-blue-500"
                             }`}
          ></input>
          {errors.stateprovince && (
            <span className="text-[10px] text-red-600">
              {errors.stateprovince.message}
            </span>
          )}
        </div>
      </div>
      {/* Postal & Country */}
      <div className="flex w-full gap-4">
        {/* Postal/Zip Code */}
        <div className="flex flex-col gap-1 w-full ">
          <label className="text-xs text-gray-600">Postal/Zip Code</label>
          <input
            type="text"
            maxLength={6}
            {...register("postal", {
              required: "Postal/Zip code is required",
              pattern: {
                value: /^\d{6}$/,
                message: "Please enter a valid 6-digit postal code",
              },
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
                clearErrors("postal");
              },
            })}
            placeholder="e.g. 10001"
            className={` p-2 text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 border border-gray-200 focus:ring-blue-500 
                          ${postalValue ? "bg-blue-50" : "bg-transparent"}
                          ${
                            errors.postal
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-200 focus:ring-blue-500"
                          }`}
          ></input>
          {errors.postal && (
            <span className="text-[10px] text-red-600">
              {errors.postal.message}
            </span>
          )}
        </div>
        {/* Country */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-xs text-gray-600">Country</label>
          <Controller
            control={control}
            name="country"
            rules={{ required: "Country is required." }}
            render={({ field: { onChange, value } }) => (
              <CustomDropdown2
                options={countryOptions}
                value={value}
                onChange={(val) => {
                  onChange(val);
                  clearErrors("country");
                }}
                placeholder="Select your country"
                error={errors.country}
              />
            )}
          />
          {errors.country && (
            <span className="text-[10px] text-red-600">
              {errors.country.message}
            </span>
          )}
        </div>
      </div>
      {/* button */}
      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-100 hover:border-gay-400 rounded-xl px-4 py-3  cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className={`border border-gray-200 text-white font-semibold text-sm  rounded-xl px-4 py-3  ${
            isSubmitting || !isDirty
              ? "bg-blue-400 opacity-80 cursor-not-allowed "
              : "bg-blue-700 hover:bg-blue-800  cursor-pointer"
          }`}
        >
          {isSubmitting ? (
            <div className="flex gap-1 justify-center items-center h-5">
              <div
                className="bg-white w-2 h-2 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="bg-white w-2 h-2 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="bg-white w-2 h-2 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
};
export default ContactForm;
