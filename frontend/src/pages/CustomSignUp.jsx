import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";
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

const CustomSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { isLoaded, signUp, setActive } = useSignUp();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoaded) return;
    setAuthError("");
    let isValid = true;
    if (!email) {
      setEmailError("Email address is required");
      isValid = false;
    }
    if (!username) {
      setUsernameError("Username is required");
      isValid = false;
    }
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      isValid = false;
    }

    if (!isValid) return;
    setIsSubmitting(true);
    try {
      const [authResult] = await Promise.allSettled([
        signUp.create({
          emailAddress: email,
          password: password,
          username: username,
          firstName: firstname || undefined,
          lastName: lastname || undefined,
        }),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
      if (authResult.status === "rejected") {
        throw authResult.reason;
      }
      const result = authResult.value;

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/dashboard");
      } else {
        console.log("Error logging in.", result.status);
      }
    } catch (err) {
      console.error("Clerk Error details:", err);
      if (err.errors && err.errors.length > 0) {
        err.errors.forEach((clerkError) => {
          const errorMessage = clerkError.longMessage;
          const targetField = clerkError.meta?.paramName;

          if (targetField === "email_address") {
            setEmailError(errorMessage);
          } else if (targetField === "username") {
            setUsernameError(errorMessage);
          } else if (targetField === "password") {
            setPasswordError(errorMessage);
          } else {
            setAuthError(errorMessage);
          }
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="p-2 flex flex-col items-center justify-center ">
      {/* Headers */}
      <div className="flex flex-col items-center justify-center mb-4 md:mb-6">
        <div className="bg-blue-700 p-2 rounded-xl">
          <Landmark className="text-white" size={20} />
        </div>

        <span className="text-gray-800 font-bold text-lg">TrustBank</span>
        <span className="text-gray-600 text-xs tracking-widest uppercase">
          INSTITUTIONAL BANKING PORTAL
        </span>
      </div>
      {/* Body */}
      <div className="bg-white rounded-2xl md:p-10 shadow-md p-8">
        <div className="flex flex-col items-center justify-center mb-4 md:mb-6">
          <span className="text-base font-semibold">Create your account</span>
          <span className="text-xs text-gray-600">
            Welcome! Please fill in the details to get started.
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`${isSubmitting ? "opacity-50" : "opacity-100"}`}
        >
          {/* First Name & Last Name */}
          <div className="flex  gap-4">
            {/* Firstname */}
            <div className="flex flex-col gap-1 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">FIRST NAME</label>
                <span className="text-[10px] text-gray-600 italic ">
                  Optional
                </span>
              </div>

              <input
                type="text"
                value={firstname}
                onChange={(e) => {
                  setAuthError("");
                  const onlyLetters = e.target.value.replace(
                    /[^a-zA-Z\s-]/g,
                    "",
                  );
                  setFirstname(onlyLetters);
                }}
                maxLength={20}
                placeholder="e.g. John"
                className={`p-2 text-xs text-gray-600 rounded-lg max-w-[150px] focus:outline-none focus:ring-1 transition-colors duration-500 border border-gray-200 focus:ring-blue-500
              ${firstname ? "bg-blue-50" : "bg-transparent"}`}
              ></input>
            </div>
            {/* Last name */}
            <div className="flex flex-col gap-1 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">LAST NAME</label>
                <span className="text-[10px] text-gray-600 italic ">
                  Optional
                </span>
              </div>

              <input
                type="text"
                value={lastname}
                onChange={(e) => {
                  setAuthError("");
                  const onlyLetters = e.target.value.replace(
                    /[^a-zA-Z\s-]/g,
                    "",
                  );
                  setLastname(onlyLetters);
                }}
                maxLength={20}
                placeholder="e.g. Doe"
                className={`p-2 text-xs text-gray-600 rounded-lg max-w-[150px] focus:outline-none focus:ring-1 transition-colors duration-500 border border-gray-200 focus:ring-blue-500 
              ${lastname ? "bg-blue-50" : "bg-transparent"}`}
              ></input>
            </div>
          </div>
          {/* Username  */}
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-xs text-gray-600">USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError("");
              }}
              placeholder="e.g. johndoe5101"
              className={`p-2 text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 
                ${
                  usernameError
                    ? "border border-red-300 focus:ring-red-500 "
                    : "border border-gray-200 focus:ring-blue-500"
                }
              ${username ? "bg-blue-50" : "bg-transparent"}`}
            ></input>
            {usernameError && (
              <span className="text-[10px] text-red-600">{usernameError}</span>
            )}
          </div>

          {/* Email Address  */}
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-xs text-gray-600">EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              placeholder="e.g. unitedbank@gmail.com"
              className={`p-2 text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 
                ${
                  emailError
                    ? "border border-red-300 focus:ring-red-500 "
                    : "border border-gray-200 focus:ring-blue-500"
                }
              ${email ? "bg-blue-50" : "bg-transparent"}`}
            ></input>
            {emailError && (
              <span className="text-[10px] text-red-600">{emailError}</span>
            )}
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
                  setPasswordError("");
                }}
                maxLength={15}
                className={`p-2 w-full text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 ${
                  passwordError
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
            {passwordError && (
              <span className="text-[10px] text-red-600">{passwordError}</span>
            )}
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
          <span className="text-xs text-gray-600">
            Already have an account?
          </span>
          <Link
            to="/sign-in"
            className="text-xs text-blue-700 hover:text-blue-800 cursor-pointer"
          >
            SignIn
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomSignUp;
