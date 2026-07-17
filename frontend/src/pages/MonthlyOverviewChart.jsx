import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Legend,
  Line,
} from "recharts";
import {Loader2,BarChart3} from 'lucide-react'
import { useQuery } from "@tanstack/react-query";
import CustomDropdown from "./components/dropdown/CustomDropdown";

const MonthlyOverviewChart = ({ accountList,isMock = false }) => {
  const { getToken } = useAuth();
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const [accountId, setAccountId] = useState("all");
  const [startDate, setStartDate] = useState(formatDate(sevenDaysAgo));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [activePill, setActivePill] = useState("7D");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const {
    data: chartData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["accoutBalance", accountId, startDate, endDate, activePill],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(
        `http://localhost:5000/api/dashboard/chart?account_id=${accountId}&startDate=${startDate}&endDate=${endDate}&timeFrame=${activePill}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        },
      );
      const json = await response.json();
      return json.data;
    },
    enabled: !isMock
  });
  const mockChartData = [
    { date: "2026-07-05", balance: 42000 },
    { date: "2026-07-06", balance: 41500 },
    { date: "2026-07-07", balance: 43200 },
    { date: "2026-07-08", balance: 46000 },
    { date: "2026-07-09", balance: 45800 },
    { date: "2026-07-10", balance: 52000 },
    { date: "2026-07-11", balance: 55340.50 },
  ];


  
  const ranges = ["7D", "1M", "1Y"];
  const activeIndex = ranges.indexOf(activePill);
  // Chart Pills selection
  const handlePillClick = (range) => {
    setIsTransitioning(true);
    const end = new Date(); // Always ends on today
    const start = new Date();

    if (range === "7D") {
      start.setDate(end.getDate() - 6); 
    } else if (range === "1M") {
      start.setMonth(end.getMonth() - 1);
      start.setDate(start.getDate() + 1); 
    } else if (range === "1Y") {
      start.setMonth(end.getMonth() - 12);
      start.setDate(start.getDate() + 1);
    }

    // Batch update state variables to trigger a single combined cache query key update
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
    setActivePill(range);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 550);
  };
  const finalChartData = isMock ? mockChartData : chartData
  const showLoader =(!isMock && isLoading) || isTransitioning || !finalChartData;

  // For Modal
  if (!isMock && isError)
    return (
      <div className="h-72 flex items-center justify-center text-red-500">
        Failed to load chart data.
      </div>
    );
  // The Empty State (No Accounts)
  if (!isMock && accountList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[250px]">
        <div className="w-15 h-15 p-2 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="text-gray-700"/>
        </div>
        <p className="text-gray-800 font-semibold">No chart data available</p>
        <p className="text-xs md:text-sm text-gray-500 max-w-sm text-center">Open your first account to start tracking your balance and spending trends over time.</p>

      </div>
    );
  }

  return (
    <div className="p-2 w-full mx-auto my-auto">
      <div className="flex justify-between items-center">
        <p className="text-gray-700 text-lg font-semibold">Balance Overview</p>
        <div className="  flex items-center justify-between">
          <CustomDropdown  
            selectedValue={accountId}
            displayValue={
              accountId === "all"
                ? "All "
                : accountList
                    .find((a) => a.account_id === accountId)
                    ?.account_type.toUpperCase()
            }
            options={[
              { label: "All", value: "all" },
              ...accountList.map((acc) => ({
                label: `${acc.account_type.charAt(0).toUpperCase()}${acc.account_type.slice(1)}`,
                value: acc.account_id,
              })),
            ]}
            onSelect={(val) => setAccountId(val)}
          />
          <div className="relative flex bg-gray-50 p-1 rounded-xl border border-slate-100 w-[180px]">
            <div
              className="absolute top-1 bottom-1 left-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-out"
              style={{
                width: "calc(33.333% - 2.66px)",
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />
            {ranges.map((range) => (
              <button
                key={range}
                onClick={() => handlePillClick(range)}
                className={` relative z-10 w-full py-1 text-xs rounded-lg transition-colors duration-300 cursor-pointer ${
                  activePill === range
                    ? "text-blue-600"
                    : "text-gray-300 hover:text-blue-600"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>
      {showLoader ? (
        <div className="flex items-center justify-center w-full text-gray-500 min-h-[250px] mt-4">
          <Loader2 className="animate-spin" size={35} />{" "}
          <span>Loading Chart Data</span>
        </div>
      ) : (
        <div className=" flex-1 w-full relative h-[350px] mt-4 ">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              key={activePill}
              data={finalChartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={10}
                minTickGap={20}
                tickFormatter={(dataString) => {
                  const dateParts = dataString.split("-");
                  const months = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ];
                  const monthName = months[parseInt(dateParts[1], 10) - 1];

                  if (activePill === "1Y") {
                    return `${monthName} ${dateParts[0]}`;
                  } else {
                    const day = parseInt(dateParts[2], 10);
                    return `${monthName} ${day}`;
                  }
                }}
              />

              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dx={-10}
                domain={["auto", "auto"]}
              />

              <Tooltip contentStyle={{ borderRadius: "8px" }} />

              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 2 }}
                activeDot={{ r: 4, stroke: "#1d4ed8", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
    
  );
};

export default MonthlyOverviewChart;
