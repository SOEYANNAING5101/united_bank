import { useAuth } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import useProfileStatus from "../../hooks/useProfileStatus";

const Spinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
  </div>
);

const ProtectedRoute=({children,requireProfile=false,requireAdmin=false})=>{
    const { isLoaded,isSignedIn} = useAuth();
    const {data:profileStatus,isLoading:profileLoading} = useProfileStatus();
    const location = useLocation();


    if (!isLoaded)return <Spinner />
    if(!isSignedIn){
        return <Navigate to="/sign-in" state={{from:location}} replace/>

    };

    if (requireProfile || requireAdmin){
        if (profileLoading || profileStatus === undefined) return <Spinner />
        if (!profileStatus.isVerified){
            return <Navigate to="/onboarding-form" state={{location}} replace />
        }
        if (requireAdmin && profileStatus.role!='ADMIN'){
            return <Navigate to="/dashboard" replace />
        }
    };
    return children
};
export default ProtectedRoute