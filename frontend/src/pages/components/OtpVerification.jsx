import { useState, useRef } from "react";
import {
  ShieldCheck,
  Shield,
  CircleCheck,
  LoaderCircle,
  Lock,
} from "lucide-react";

const OtpVerification = ({
  email,
  onVerify,
  onResend,
  isSubmitting,
  error,
  onEdit,
}) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);
  const startCooldown = () => {
    setResendTimer(60);
    const id = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return;
    onVerify(code);
  };
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    onEdit?.();
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value != "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };
  const handleKeyDown = (element, index) => {
    if (element.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await onResend();
      startCooldown();
    } catch {
      error;
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!digits) return;
    onEdit?.();
    const newOtp = new Array(6).fill("");
    for (let i = 0; i < digits.length; i++) newOtp[i] = digits[i];
    setOtp(newOtp);
    const next = Math.min(digits.length, 5);
    inputRefs.current[next].focus();
  };

  return (
    <div className="animate-fade-in bg-white rounded-2xl md:p-10 shadow-md p-8 flex flex-col items-center justify-center">
      <div className="w-16 h-16  rounded-full bg-blue-50 flex items-center justify-center mb-5">
        <ShieldCheck size={28} className="text-blue-600" />
      </div>
      <span className="text-2xl font-bold mb-4">Verify Your Identity</span>
      <span className="text-gray-500 text-sm">
        We've sent a 6-digit verification code to
      </span>
      <span className="text-gray-700 font-semibold mt-0 mb-6">
        {email ? email : "soeyannaing629x@gmail.com"}
      </span>

      <form
        onSubmit={handleSubmit}
        className={`w-full flex flex-col items-center justify-center ${isSubmitting ? "opacity-50" : "opacity-100"}`}
      >
        <div className="flex w-full gap-3 justify-center mb-2">
          {otp.map((data, index) => {
            return (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={data}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`h-15 w-13 rounded-lg text-center font-bold text-gray-900 focus:outline-none focus:ring-2 focus:bg-blue-50 transition-all 
              ${
                error
                  ? "border border-red-300 focus:ring-red-500 "
                  : "border border-gray-200 focus:ring-blue-500"
              }`}
              ></input>
            );
          })}
        </div>
        {error && (
          <span className="text-[10px] text-red-600  mb-6">{error}</span>
        )}

        <span className="text-gray-700 text-sm">Didn't receive the code?</span>
        <button
          onClick={handleResend}
          type="button"
          disabled={resendTimer > 0}
          className={` font-semibold   mb-6 ${
            resendTimer > 0
              ? "text-gray-200 cursor-not-allowed"
              : "text-blue-700 hover:text-blue-900  cursor-pointer"
          }`}
        >
          {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-blue-700  w-full p-4 text-white rounded-lg mb-6 transition-all duration-300 active:scale-95 shadow-md ${
            isSubmitting
              ? "cursor-not-allowed scale-100"
              : "cursor-pointer hover:bg-blue-800"
          }`}
        >
          {isSubmitting ? (
            <div className="flex gap-1 justify-center items-center h-5">
              <LoaderCircle size={20} className="animate-spin" />
            </div>
          ) : (
            "Verify & Continue"
          )}
        </button>
      </form>

      <div className="flex items-center justify-center w-full mb-6">
        <div className="border-t border-gray-200 flex-grow"></div>
        <span className="px-4 text-[10px] text-gray-600 tracking-widest">
          SECURITY STATUS
        </span>
        <div className="border-t border-gray-200 flex-grow"></div>
      </div>
      <div className="flex gap-4 grid grid-cols-3 ">
        <div className="flex flex-col col-spans-1 items-center justify-center gap-1 ">
          <Shield className=" text-gray-600" size={15} />
          <span className="text-[10px] text-gray-600 text-center max-w-md">
            ESCROW PROTECTED
          </span>
        </div>
        <div className="flex flex-col col-spans-1 items-center justify-center gap-1 ">
          <CircleCheck className=" text-gray-600" size={15} />
          <span className="text-[10px] text-gray-600 text-center max-w-md">
            VERIFIED SIGN-IN
          </span>
        </div>
        <div className="flex flex-col col-spans-1 items-center justify-center gap-1 ">
          <Lock className=" text-gray-600" size={15} />
          <span className="text-[10px] text-gray-600 text-center max-w-md">
            ENCRYPTED
          </span>
        </div>
      </div>
    </div>
  );
};
export default OtpVerification;
