import {
  ArrowLeft,
  ArrowLeftRight,
  Shield,
  CreditCard,
  FileText,
  Settings,
} from "lucide-react";
import { useNavigate, Link, useLocation, useParams } from "react-router-dom";
import DestopAccoutDetails from "./DesktopAccountDetails";
import MobileAccountDetails from "./MobileAccountDetails";
import { useAuth } from "@clerk/clerk-react";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";

const AccountDetails = () => {
  const { account_id } = useParams();
  const { getToken } = useAuth();

  const fetchAccoutDetails = async () => {
    const token = await getToken();
    if (!account_id) return;
    const response = await fetch(
      `http://localhost:5000/api/accounts/${account_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await response.json();
    if (!response.ok) throw new Error (data.message  || "Failed to fetch the account details")
    return data.data
  };
  const { data: account, isLoading, error} = useQuery({
    queryKey : ["account" , account_id],
    queryFn : fetchAccoutDetails,
    retry : 1
  })
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  if (error || !account) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 font-bold">
        Error loading account details.
      </div>
    );
  }

  return (
    <div className="w-full  mx-auto min-h-screen">
      <div className="hidden md:block">
        <DestopAccoutDetails account={account}/>
      </div>
      <div className="md:hidden">
        <MobileAccountDetails account={account}/>
      </div>
    </div>
  );
};
export default AccountDetails;
