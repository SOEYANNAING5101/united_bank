import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import BottomNav from "./BottomNavBar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

import useProfileStatus from "../hooks/useProfileStatus";

const DashboardLayout = () => {
  const { getToken } = useAuth();

  const {data:profileStatus} = useProfileStatus()
  const fetchDashboardData = async () => {
    const token = await getToken();
    await new Promise(resolve => setTimeout(resolve, 3000));
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/dashboard`, {
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
  const {
    data: dashboardData,
    error,
    isFetching
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    retry: 1,
    enabled: profileStatus?.isVerified === true,
  });


  return (
    <div className="min-h-screen md:min-w-[500px] bg-gray-100 flex flex-col md:p-3">
      <Navbar />

      <main className="max-w-[1600px] mx-auto flex-grow w-full">
        <Outlet context={{ dashboardData, profileStatus, error, isLoading: isFetching}} />
      </main>

      {/* BottomNav */}
      <BottomNav />
    </div>
  );
};

export default DashboardLayout;
