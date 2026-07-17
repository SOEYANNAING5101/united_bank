import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  MapPin,
  User,
  Pencil,
  LoaderCircle,
  Contact,
  ChartCandlestick,
} from "lucide-react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import CustomDropdown2 from "./components/dropdown/CustormDropdown2";
import { useQueryClient } from "@tanstack/react-query";

const OnboardingForm = () => {
  const {
    register,
    handleSubmit,
    trigger,
    control,
    watch,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const [response] = await Promise.all([
        fetch("http://localhost:5000/api/profile/submit", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to submit profile data");
      }
      await queryClient.setQueryData(["profileStatus"],{isVerified : true});
      navigate('/dashboard')
    } catch (error) {
      console.error("Submission error: ", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    let isStepValid = false;
    if (step === 1) {
      isStepValid = await trigger(["firstname", "lastname", "dob"]);
    } else if (step === 2) {
      isStepValid = await trigger([
        "phonenumber",
        "streetaddress",
        "city",
        "stateprovince",
        "postal",
        "country",
      ]);
    } else if (step === 3) {
      isStepValid = await trigger([
        "employmentstatus",
        "sourceofwealth",
        "taxId",
      ]);
    }
    if (isStepValid) {
      setStep(step + 1);
    }
  };
  const handleBack = () => {
    setStep(step - 1);
  };
  const today = new Date();
  const maxValidDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  )
    .toISOString()
    .split("T")[0];

  const [
    firstNameValue,
    lastNameValue,
    dobValue,
    streetAddressValue,
    cityValue,
    stateProvinceValue,
    postalValue,
    countryValue,
    employmentStatusValue,
    sourceOfWealthValue,
    taxIdValue,
  ] = watch([
    "firstname",
    "lastname",
    "dob",
    "streetaddress",
    "city",
    "stateprovince",
    "postal",
    "country",
    "employmentstatus",
    "sourceofwealth",
    "taxId",
  ]);

  const countryOptions = [
    { value: "SG", label: "Singapore" },
    { value: "US", label: "United States" },
    { value: "GB", label: "United Kingdom" },
    { value: "AU", label: "Australia" },
    { value: "CA", label: "Canada" },
    { value: "MY", label: "Malaysia" },
  ];
  const employmentOptions = [
    { value: "full-time", label: "Full-Time Employed" },
    { value: "part-time", label: "Part-Time Employed" },
    { value: "self-employed", label: "Self-Employed" },
    { value: "student", label: "Student" },
    { value: "retired", label: "Retired" },
    { value: "unemployed", label: "Unemployed" },
    { value: "others", label: "Others" },
  ];
  const wealthOptions = [
    { value: "salary", label: "Salary / Wages" },
    { value: "business", label: "Business Income" },
    { value: "investments", label: "Investments / Dividends" },
    { value: "inheritance", label: "Inheritance / Trust" },
    { value: "allowance", label: "Allowance / Stipend" },
    { value: "savings", label: "Personal Savings" },
    { value: "others", label: "Others" },
  ];

  const formData = getValues();
  const displayCountry =
    countryOptions.find((c) => c.value === formData.country)?.label ||
    formData.country;
  const displayEmployment =
    employmentOptions.find((e) => e.value === formData.employmentstatus)
      ?.label || formData.employmentstatus;
  const displayWealth =
    wealthOptions.find((w) => w.value === formData.sourceofwealth)?.label ||
    formData.sourceofwealth;
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col flex-col">
      {/* NavBar */}
      <div className="flex items-center justify-between w-full px-6 py-4 border-b border-gray-300">
        <button
          onClick={()=>navigate(-1)}
          className="bg-transparent hover:text-gray-800 hover:bg-gray-200 w-10 h-10 flex items-center justify-center text-gray-400 rounded-full transition-colors z-10 cursor-pointer"
        >
          <ArrowLeft size={18}></ArrowLeft>
        </button>
        <span className="text-xl md:text-2xl font-bold ml-4 text-blue-700">TrustBank</span>
        <div className="flex items-center justify-center gap-3">
          <span className="text-gray-700 text-xs md:text-sm">STEP {step} OF 4</span>
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-blue-700 transition-all duration-500 ${
                step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"
              }`}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center mt-10 mb-15">
        <div className="bg-white rounded-2xl shadow-md  max-w-[700px]">
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div>
                {/* Headers */}
                <div className="flex flex-col md:p-10 p-8 gap-2 border-b border-gray-200">
                  <span className="text-xl font-bold">
                    Personal Verfication
                  </span>
                  <span className="text-xs max-w-md text-gray-600">
                    Please provide your legal details exactly as they appear on
                    your government-issued identification to establish your
                    identity.
                  </span>
                </div>

                <div className="flex flex-col md:px-10 p-8">
                  {/* Legal First name */}
                  <div className="flex flex-col gap-1 mb-4">
                    <label className="text-xs text-gray-600">
                      Legal First Name
                    </label>
                    <input
                      type="text"
                      {...register("firstname", {
                        required: "Legal First Name is required",
                        onChange: () => clearErrors("firstname"),
                      })}
                      placeholder="e.g. john"
                      className={`p-2 text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 border ${
                        errors.firstname
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-200 focus:ring-blue-500"
                      }
                      ${firstNameValue ? "bg-blue-50" : "bg-transparent"}`}
                    ></input>
                    {errors.firstname && (
                      <span className="text-[10px] text-red-600">
                        {errors.firstname.message}
                      </span>
                    )}
                  </div>
                  {/* Legal Last name */}
                  <div className="flex flex-col gap-1 mb-4">
                    <label className="text-xs text-gray-600">
                      Legal Last Name
                    </label>
                    <input
                      type="text"
                      {...register("lastname", {
                        required: "Legal Last Name is required",
                        onChange: () => clearErrors("lastname"),
                      })}
                      placeholder="e.g. doe"
                      className={`p-2 text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 border ${
                        errors.lastname
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-200 focus:ring-blue-500"
                      }
                      ${lastNameValue ? "bg-blue-50" : "bg-transparent"}`}
                    ></input>
                    {errors.lastname && (
                      <span className="text-[10px] text-red-600">
                        {errors.lastname.message}
                      </span>
                    )}
                  </div>
                  {/* Date of birth */}
                  <div className="flex flex-col gap-1 mb-4">
                    <div className="flex justify-between w-full">
                      <label className="text-xs text-gray-600">
                        Date of birth (MM/DD/YYYY)
                      </label>
                      <span className="text-[10px] text-gray-600">
                        Must be 18+
                      </span>
                    </div>

                    <input
                      type="date"
                      {...register("dob", {
                        required: "Date of birth is required",
                        onChange: () => clearErrors("dob"),
                        validate: (value) => {
                          const birthDate = new Date(value);
                          let age =
                            today.getFullYear() - birthDate.getFullYear();
                          const monthDifference =
                            today.getMonth() - birthDate.getMonth();
                          if (
                            monthDifference < 0 ||
                            (monthDifference === 0) &
                              (today.getDate() < birthDate.getDate())
                          ) {
                            age--;
                          }
                          return (
                            age >= 18 ||
                            "You must be at least 18 years old to open an account."
                          );
                        },
                      })}
                      max={maxValidDate}
                      className={`p-2  text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 border border-gray-200 focus:ring-blue-500 ${
                        errors.dob
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-200 focus:ring-blue-500"
                      }
                      ${dobValue ? "bg-blue-50" : "bg-transparent"}`}
                    ></input>
                    {errors.dob && (
                      <span className="text-[10px] text-red-600">
                        {errors.dob.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                {/* Headers */}
                <div className="flex flex-col md:p-10 p-8 border-b border-gray-200 gap-2 ">
                  <span className="text-xl font-bold">Contact & Residency</span>
                  <span className="text-xs max-w-md text-gray-600">
                    To comply with global financial regulations, we require a
                    verified physical address. This helps us secure your account
                    and prepare your TrustBank Platinum Card for delivery.
                  </span>
                </div>

                <div className="flex flex-col md:px-10 p-8">
                  {/* Mobile Contact Label */}
                  <div className="flex gap-2 mb-4 flex items-center">
                    <Phone className="text-blue-700" size={18} />{" "}
                    <span className="text-base text-blue-700 font-semibold">
                      Mobile Contact
                    </span>
                  </div>
                  {/* Phone Number*/}
                  <div className="flex flex-col gap-1 mb-10">
                    <label className="text-xs text-gray-600">
                      Phone Number
                    </label>
                    <Controller
                      control={control}
                      name="phonenumber"
                      rules={{
                        required: "Phone Number is required",
                        onChange: () => clearErrors("phonenumber"),
                        validate: (value) =>
                          isValidPhoneNumber(value || "") ||
                          "Invalid phone number format",
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
                    <label className="text-xs text-gray-600">
                      Street Address
                    </label>
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
                      <label className="text-xs text-gray-600">
                        State/Province
                      </label>
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
                      <label className="text-xs text-gray-600">
                        Postal/Zip Code
                      </label>
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
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
                {/* Headers */}
                <div className="flex flex-col md:p-10 p-8 gap-2 border-b border-gray-200 ">
                  <span className="text-xl font-bold">Financial Profile</span>
                  <span className="text-xs max-w-md text-gray-600">
                    Tell us abit about your finances. This information is
                    encrypted and never shared.
                  </span>
                </div>

                <div className="flex flex-col md:px-10 p-8">
                  {/* EMPLOYMENT STATUS */}
                  <div className="flex flex-col gap-1 mb-4 w-full ">
                    <label className="text-xs text-gray-600">
                      Employment Status
                    </label>
                    <Controller
                      control={control}
                      name="employmentstatus"
                      rules={{ required: "Employment status is required." }}
                      render={({ field: { onChange, value } }) => (
                        <CustomDropdown2
                          options={employmentOptions}
                          value={value}
                          onChange={(val) => {
                            onChange(val);
                            clearErrors("employmentstatus");
                          }}
                          placeholder="Select employment status"
                          error={errors.employmentstatus}
                        />
                      )}
                    />
                    {errors.employmentstatus && (
                      <span className="text-[10px] text-red-600">
                        {errors.employmentstatus.message}
                      </span>
                    )}
                  </div>
                  {/* Source of wealth */}
                  <div className="flex flex-col gap-1 mb-4 w-full ">
                    <label className="text-xs text-gray-600">
                      Source of Wealth
                    </label>
                    <Controller
                      control={control}
                      name="sourceofwealth"
                      rules={{ required: "Source of wealth is required" }}
                      render={({ field: { onChange, value } }) => (
                        <CustomDropdown2
                          options={wealthOptions}
                          value={value}
                          onChange={(val) => {
                            onChange(val);
                            clearErrors("sourceofwealth");
                          }}
                          placeholder="Select source of wealth"
                          error={errors.sourceofwealth}
                        />
                      )}
                    />
                    {errors.sourceofwealth && (
                      <span className="text-[10px] text-red-600">
                        {errors.sourceofwealth.message}
                      </span>
                    )}
                  </div>

                  {/* Tax ID / SSN */}
                  <div className="flex flex-col gap-1 mb-4">
                    <label className="text-xs text-gray-600">
                      Tax ID / SSN (Last 4)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      {...register("taxId", {
                        required: "Tax ID or SSN is required",
                        pattern: {
                          value: /^\d{4}$/,
                          message: "Please enter exactly 4 digits.",
                        },
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                          clearErrors("taxId");
                        },
                      })}
                      placeholder="e.g. 1234"
                      className={`p-2 text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 border border-gray-200 focus:ring-blue-500 
                        ${taxIdValue ? "bg-blue-50" : "bg-transparent"}
                        ${errors.taxId ? "border-red-300 focus:ring-red-500" : "border-gray-200 focus:ring-blue-500"}`}
                    ></input>
                    {errors.taxId && (
                      <span className="text-[10px] text-red-600">
                        {errors.taxId.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="">
                {/* Headers */}
                <div className="flex flex-col md:px-10 pt-8 py-4 p-8 gap-2 border-b border-gray-200">
                  <span className="text-xl font-bold">Review & Submit</span>
                  <span className="text-xs max-w-md text-gray-600">
                    Please confirm your information before finalizating your
                    account application
                  </span>
                </div>

                <div className="">
                  {/* Personal Details */}
                  <div className="flex flex-col md:px-10 py-4 p-8 ">
                    <div className="flex items-center relative mb-4 ">
                      <User size={20} className="mr-3" />
                      <span className="text-base text-black font-bold">
                        Personal Details
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex gap-1 items-center justify-center text-blue-700 hover:text-blue-900 cursor-pointer right-0 top-0 absolute"
                      >
                        <Pencil size={10} />
                        <span className="text-xs">Edit</span>
                      </button>
                    </div>
                    <div className="flex w-full">
                      <div className="flex flex-col w-full ">
                        {/* Legal First Name */}
                        <div className="flex flex-col mb-4">
                          <label className="text-xs text-gray-600">
                            Legal First Name
                          </label>
                          <span className="text-sm text-gray-900 font-semibold">
                            {formData.firstname}
                          </span>
                        </div>
                        {/* Date of Birth */}
                        <div className="flex flex-col mb-4">
                          <label className="text-xs text-gray-600">
                            Date of birth
                          </label>
                          <span className="text-sm text-gray-900 font-semibold">
                            {formData.dob}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col w-full ">
                        <label className="text-xs text-gray-600">
                          Legal Last Name
                        </label>
                        <span className="text-sm text-gray-900 font-semibold">
                          {formData.lastname}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/*  Contact Information */}
                  <div className="flex flex-col md:px-10 py-4 p-8">
                    <div className="flex items-center relative mb-4">
                      <Contact size={20} className="mr-3" />
                      <span className="text-base text-black font-bold">
                        Contact Information
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex gap-1 items-center justify-center text-blue-700 hover:text-blue-900 cursor-pointer right-0 top-0 absolute"
                      >
                        <Pencil size={10} />
                        <span className="text-xs">Edit</span>
                      </button>
                    </div>
                    <div className="flex  w-full">
                      <div className="flex flex-col w-full">
                        {/* Phone Number */}
                        <div className="flex flex-col mb-4 ">
                          <label className="text-xs text-gray-600">
                            Phone Number
                          </label>
                          <span className="text-sm text-gray-900 font-semibold">
                            {formData.phonenumber}
                          </span>
                        </div>
                      </div>
                      {/* Right column */}
                      <div className="flex flex-col w-full">
                        {/* Street Address*/}
                        <div className="flex flex-col mb-4 tracking-wider">
                          <label className="text-xs text-gray-600">
                            Street Address
                          </label>
                          <span className="text-sm text-gray-900 font-semibold">
                            {formData.streetaddress}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full">
                      <div className="flex flex-col w-full">
                        {/* City */}
                        <div className="flex flex-col mb-4">
                          <label className="text-xs text-gray-600">City</label>
                          <span className="text-sm text-gray-900 font-semibold">
                            {formData.city}
                          </span>
                        </div>
                      </div>
                      {/* Right column */}
                      <div className="flex flex-col w-full">
                        {/* State/Province */}
                        <div className="flex flex-col mb-4">
                          <label className="text-xs text-gray-600">
                            State/Province
                          </label>
                          <span className="text-sm text-gray-900 font-semibold">
                            {formData.stateprovince || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex  w-full">
                      <div className="flex flex-col w-full">
                        {/* Postal Code */}
                        <div className="flex flex-col mb-4">
                          <label className="text-xs text-gray-600">
                            Postal/Zip Code
                          </label>
                          <span className="text-sm text-gray-900 font-semibold">
                            {formData.postal}
                          </span>
                        </div>
                      </div>
                      {/* Right column */}
                      <div className="flex flex-col w-full">
                        {/* Country */}
                        <div className="flex flex-col mb-4">
                          <label className="text-xs text-gray-600">
                            Country
                          </label>
                          <span className="text-sm text-gray-900 font-semibold">
                            {displayCountry}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/*  Financial Profile */}
                  <div className="flex flex-col md:px-10 py-4 p-8">
                    <div className="flex items-center  relative mb-4">
                      <ChartCandlestick size={20} className="mr-3" />
                      <span className="text-base text-black font-bold">
                        Financial Profile
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex gap-1 items-center justify-center text-blue-700 hover:text-blue-900 cursor-pointer right-0 top-0 absolute"
                      >
                        <Pencil size={10} />
                        <span className="text-xs">Edit</span>
                      </button>
                    </div>
                    <div className="flex  w-full">
                      <div className="flex flex-col w-full">
                        {/* Phone Number */}
                        <div className="flex flex-col mb-4">
                          <label className="text-xs text-gray-600">
                            Employment Status
                          </label>
                          <span className="text-sm text-gray-900 font-semibold">
                            {displayEmployment}
                          </span>
                        </div>
                      </div>
                      {/* Right column */}
                      <div className="flex flex-col w-full">
                        {/* Source of wealth*/}
                        <div className="flex flex-col mb-4">
                          <label className="text-xs text-gray-600">
                            Source of wealth
                          </label>
                          <span className="text-sm text-gray-900 font-semibold">
                            {displayWealth}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex  w-full">
                      <div className="flex flex-col w-full">
                        {/* Tax ID / SSN */}
                        <div className="flex flex-col mb4">
                          <label className="text-xs text-gray-600">
                            Tax ID / SSN
                          </label>
                          <span className="text-sm text-gray-900 font-semibold">
                            ****{formData.taxId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between relative md:px-10 px-8 pt-4 pb-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="left-0 px-5 py-3 bg-gray-200 hover:bg-gray-300 gap-2 rounded-xl flex items-center justify-center text-black text-sm cursor-pointer"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}
              {step < 4 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="right-0 px-5 py-3 bg-blue-700 hover:bg-blue-800 gap-2 rounded-xl flex items-center justify-center text-white text-sm cursor-pointer"
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              )}
              {step === 4 && (
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className={`right-0 px-5 py-3 bg-blue-700 gap-2 rounded-xl flex items-center justify-center text-white text-sm transition-all duration-300 active:scale-95 shadow-md  ${
                    isSubmitting
                      ? "cursor-not-allowed scale-100 "
                      : "cursor-pointer hover:bg-blue-800"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex gap-1 justify-center items-center h-5">
                      <LoaderCircle size={20} className="animate-spin" />
                    </div>
                  ) : (
                    "Create account"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default OnboardingForm;
