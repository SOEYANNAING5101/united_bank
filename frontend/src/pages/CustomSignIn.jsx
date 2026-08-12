import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignIn, useAuth } from "@clerk/clerk-react";
import {
  ShieldCheck,
  Shield,
  CircleCheck,
  FingerprintPattern,
  Landmark,
  CircleAlert,
  LoaderCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const CustomSignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const isCompletingFlow = useRef(false);

  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, getToken } = useAuth();
  useEffect(() => {
    if (isSignedIn && !isCompletingFlow.current) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoaded) return;
    setAuthError("");
    if (!email || !password) {
      setAuthError("Please enter both your email and password");
      return;
    }
    setIsSubmitting(true);
    try {
      const [authResult] = await Promise.allSettled([
        signIn.create({
          identifier: email,
          password: password,
        }),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
      if (authResult.status === "rejected") {
        throw authResult.reason;
      }
      const result = authResult.value;
      if (result.status === "complete") {
        isCompletingFlow.current = true;
        await setActive({ session: result.createdSessionId });
        try {
          const token = await getToken();
          // const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
          const baseUrl =  'http://localhost:5000'
          const response = await fetch(
            `${baseUrl}/api/profile/status`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message);
          }
          if (data.isVerified){
            navigate('/dashboard')
          } else {
            navigate('/onboarding-form')
          }
        } catch (fetchError) {
          console.error("Failed to fetch profile status:", fetchError);
          setAuthError("Profile verification pending")
          navigate('/onboarding-form')
        }
      }
    } catch (err) {
      console.error(err);
      setAuthError("Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="p-2 flex flex-col items-center justify-center ">
      <div className="flex flex-col items-center justify-center mb-4 md:mb-6">
        <div className="bg-blue-700 p-2 rounded-xl">
          <Landmark className="text-white" size={20} />
        </div>

        <span className="text-gray-800 font-bold text-lg">TrustBank</span>
        <span className="text-gray-600 text-xs tracking-widest uppercase">
          INSTITUTIONAL BANKING PORTAL
        </span>
      </div>
      <div className="bg-white rounded-2xl md:p-10 shadow-md p-8">
        <div className="flex flex-col items-center justify-center mb-4 md:mb-6">
          <span className="text-base font-semibold">Secure Sign In</span>
          <span className="text-xs text-gray-600">
            Access your corporate executive dashboard
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`${isSubmitting ? "opacity-50" : "opacity-100"}`}
        >
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              authError ? "max-h-20 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
            }`}
          >
            <div className="text-xs text-red-500 bg-red-200 border border-red-300 p-3 rounded-lg mb-4 flex items-center gap-4">
              <CircleAlert size={18} />
              <span> {authError}</span>
            </div>
          </div>

          {/* Email Address  */}
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-xs text-gray-600">EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setAuthError("");
              }}
              placeholder="e.g. unitedbank@gmail.com"
              className={`p-2 text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 
                ${
                  authError
                    ? "border border-red-300 focus:ring-red-500 "
                    : "border border-gray-200 focus:ring-blue-500"
                }
              ${email ? "bg-blue-50" : "bg-transparent"}`}
            ></input>
          </div>
          {/* Password*/}
          <div className="flex flex-col gap-1 mb-4 md:mb-6">
            <label className="text-xs text-gray-600">PASSWORD</label>
            <div className="w-full relative flex items-center justify-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError("");
                }}
                maxLength={25}
                className={`p-2 w-full text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 ${
                  authError
                    ? "border border-red-300 focus:ring-red-500"
                    : "border border-gray-200 focus:ring-blue-500"
                }
              ${password ? "bg-blue-50 " : "bg-transparent"}`}
              ></input>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 text-xs text-gray-400 ml-4 mr-4 cursor-pointer hover:text-gray-900 focus:outline-none transition-colors duration-300 "
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {/* MFA Required */}
          <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-center gap-4 mb-4 md:mb-6">
            <div className="p-2 2 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="text-blue-700" size={18} />
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-bold">MFA Required</span>
              <span className="text-[10px] text-gray-600">
                Authentication code will be requested next.
              </span>
            </div>
          </div>
          <button
            disabled={isSubmitting}
            className={`bg-blue-700  w-full p-2 text-sm text-white rounded-lg mb-4 transition-all duration-300 active:scale-95 shadow-md ${
              isSubmitting
                ? "cursor-not-allowed scale-100"
                : "cursor-pointer hover:bg-blue-800"
            }`}
            type="submit"
          >
            {isSubmitting ? (
              <div className="flex gap-1 justify-center items-center h-5">
                <LoaderCircle size={20} className="animate-spin" />
              </div>
            ) : (
              "Continue"
            )}
          </button>
        </form>
        <div className="flex items-center justify-center w-full mb-4">
          <div className="border-t border-gray-200 flex-grow"></div>
          <span className="px-4 text-[10px] text-gray-600 tracking-widest">
            SECURITY STATUS
          </span>
          <div className="border-t border-gray-200 flex-grow"></div>
        </div>
        <div className="flex gap-4 grid grid-cols-3 mb-4 md:mb-6">
          <div className="flex flex-col col-spans-1 items-center justify-center gap-1 ">
            <Shield className=" text-gray-600" size={15} />
            <span className="text-[10px] text-gray-600 text-center max-w-md">
              SSL SECURE
            </span>
          </div>
          <div className="flex flex-col col-spans-1 items-center justify-center gap-1 ">
            <CircleCheck className=" text-gray-600" size={15} />
            <span className="text-[10px] text-gray-600 text-center max-w-md">
              FDIC INSURED
            </span>
          </div>
          <div className="flex flex-col col-spans-1 items-center justify-center gap-1 ">
            <FingerprintPattern className=" text-gray-600" size={15} />
            <span className="text-[10px] text-gray-600 text-center max-w-md">
              BIOMETRIC READY
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-gray-600">New to TrustBank?</span>
          <Link
            to="/sign-up"
            className="text-xs text-blue-700 hover:text-blue-800 cursor-pointer"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomSignIn;
