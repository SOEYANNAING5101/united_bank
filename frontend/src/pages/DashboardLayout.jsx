import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import BottomNav from "./BottomNavBar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

import useProfileStatus from "../hooks/useProfileStatus";

const DashboardLayout = () => {
  const { getToken } = useAuth();

  const {data:profileStatus,isLoading:isStatusLoading} = useProfileStatus()


  const fetchDashboardData = async () => {
    const token = await getToken();
    const response = await fetch("http://localhost:5000/api/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  };
  // Fetch the dashboard data once profile status is true
  const {
    data: dashboardData,
    error,
    isLoading: isDashboardLoading,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    retry: 1,
    enabled: profileStatus?.isVerified === true,
  });


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:p-3">
      <Navbar />

      <main className="max-w-[1600px] mx-auto flex-grow w-full">
        <Outlet context={{ dashboardData, profileStatus, error }} />
      </main>

      {/* BottomNav */}
      <BottomNav />
    </div>
  );
};

export default DashboardLayout;
