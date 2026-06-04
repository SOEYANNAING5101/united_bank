import {useEffect, useState} from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Your top navigation bar

import {useQuery} from '@tanstack/react-query'
import {useAuth} from '@clerk/clerk-react'

const DashboardLayout = () => {
    // const [dashboardData,setDashboardData] = useState("");
    // const [error,setError] = useState("");
    // const navigate = useNavigate();
    //   // useEffect(() => {
      //   const fetchDashboardData = async () => {
      //     const token = localStorage.getItem("userToken");
      //     if (!token) {
      //       navigate("/");
      //       return;
      //     }
      //     try {
      //       const response = await fetch("http://localhost:5000/api/dashboard", {
      //         method: "GET",
      //         headers: {
      //           Authorization: `Bearer ${token}`,
      //         },
      //       });
      //       const data = await response.json();
      //       if (!response.ok) {
      //         throw new Error(data.message || "Failed to load the dashboard data");
      //       }
      //       setDashboardData(data);
      //       console.log("DashboardData", data);
      //     } catch (err) {
      //       setError(err);
      //       if (err.message.includes("token") || err.message.includes("Auth")) {
      //         localStorage.removeItem("userItem"); // Note: You might want to change this to "userToken" to match your getItem!
      //         navigate("/");
      //       }
      //     }
      //   };
      //   fetchDashboardData();
      // }, [navigate]);

      const navigate = useNavigate();
      const {getToken} = useAuth();

      const fetchDashboardData = async () =>{
        const token = await getToken();

        const response = await fetch('http://localhost:5000/api/dashboard',{
          method:'GET',
          headers:{
            'Authorization':`Bearer ${token}`
          }
        });
        const data = response.json();
        if(!response.ok){
          throw new Error(data.message)
        }
        return data
      }

      const {data:dashboardData, error} = useQuery({
        queryKey : ['dashboard'],
        queryFn : fetchDashboardData,
        retry : 1,
      });
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* The Navigation Bar stays locked at the top forever */}
            <Navbar />

            {/* The Outlet is where React will inject the Dashboard or Transfer page */}
            <main className="max-w-[1600px]  flex-grow mx-auto w-full p-4">
                <Outlet context={{dashboardData,error}}/>
            </main>
        </div>
    );
};

export default DashboardLayout;