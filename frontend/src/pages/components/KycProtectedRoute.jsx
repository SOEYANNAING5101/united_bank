import useProfileStatus from "../../hooks/useProfileStatus";
import { Navigate, Outlet } from "react-router-dom";

const KycProtectedRoute = () => {
  const { data: profileStatus, isLoading, error } = useProfileStatus();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  if (error || !profileStatus?.isVerified) {
    return <Navigate to="/onboarding-form"  replace />;
  }

  return <Outlet />;
};
export default KycProtectedRoute;
