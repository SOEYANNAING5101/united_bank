import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import BottomNav from "./BottomNavBar";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../hooks/useApi";

import useProfileStatus from "../hooks/useProfileStatus";

const DashboardLayout = () => {
  // const { getToken } = useAuth();

  const { data: profileStatus } = useProfileStatus();
  const api = useApi();
  const {
    data: dashboardData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api("/api/dashboard"),
    retry: 1,
    enabled: profileStatus?.isVerified === true,
  });

  return (
    <div className="min-h-screen md:min-w-[500px] bg-gray-100 flex flex-col md:p-3">
      <Navbar />
      <main className="max-w-[1600px] mx-auto flex-grow w-full">
        <Outlet context={{ dashboardData, profileStatus, error, isLoading }} />
      </main>

      {/* BottomNav */}
      <BottomNav />
    </div>
  );
};

export default DashboardLayout;
