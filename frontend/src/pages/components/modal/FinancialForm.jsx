import { useForm, Controller } from "react-hook-form";
import CustomDropdown2 from "../dropdown/CustormDropdown2";
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
const FinancialForm = ({ profileData, onClose }) => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const {
    register,
    control,
    handleSubmit,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      employmentstatus: profileData?.employment_status || "",
      sourceofwealth: profileData?.source_of_wealth || "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const [response] = await Promise.all([
        fetch(`${baseUrl}/api/profile/financial`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            employment_status: data.employmentstatus,
            source_of_wealth: data.sourceofwealth,
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);
      if (!response.ok) {
        throw new Error("Failed to update financial details");
      }
      toast.success("Financial Details updated successfully!");
      onClose();
      await queryClient.invalidateQueries({
        queryKey: ["userProfile"],
      });
    } catch (error) {
      console.error("Error updating financial details", error.message);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Employment Status */}
      <div className="flex flex-col gap-1 mb-4 w-full ">
        <label className="text-xs text-gray-600">Employment Status</label>
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
        <label className="text-xs text-gray-600">Source of Wealth</label>
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
export default FinancialForm;
