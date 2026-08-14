import { Link } from "react-router-dom";
import { ShieldAlert, LockKeyholeOpen, ShieldBan } from "lucide-react";

const VerificationGate = ({ children }) => {
  return (
    <div className="relative w-full pb-20">
      <div className="fixed border border-gray-200 md:max-w-[400px] w-3/4 absolute top-1/3 md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 p-5 md:p-10 text-gray-900 flex flex-col justify-center items-center bg-white rounded-xl shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-5">
          <ShieldAlert size={28} className="text-blue-600" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-lg md:text-2xl font-bold text-gray-900 mb-3 tracking-tight text-center">
            Account Verification required
          </span>
          <span className="text-xs md:text-sm text-gray-500 mb-8 leading-relaxed text-center max-w-md">
            To unlock full banking features including transfers, deposits, and account creation, please complete your identity check.
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
            <span className="text-[10px] md:text-xs tracking-wider">SECURE 256-BIT</span>
          </div>
          <div className="text-gray-400 flex gap-1 items-center justify-center">
            <ShieldBan size={18} />
            <span className="text-[10px] text-xs tracking-wider">GDPR COMPLIANT</span>
          </div>
        </div>
      </div>

      <div className="opacity-40 blur-[3px] pointer-events-none select-none overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default VerificationGate;