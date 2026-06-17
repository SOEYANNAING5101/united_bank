import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // Your top navigation bar
import BottomNav from "./BottomNavBar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const fetchDashboardData = async () => {
    const token = await getToken();

    const response = await fetch("http://localhost:5000/api/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  };

  const { data: dashboardData, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    retry: 1,
  });
  return (
    // bg-gray-100
    <div className="min-h-screen bg-gray-100 flex flex-col">

      <Navbar />

      <main className="flex-grow w-full">
        <Outlet context={{ dashboardData, error }} />
      </main>

      {/* BottomNav */}
      <BottomNav />
    </div>
  );
};

export default DashboardLayout;
