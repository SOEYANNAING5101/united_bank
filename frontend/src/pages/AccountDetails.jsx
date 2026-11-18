import { useParams } from "react-router-dom";
import DesktopAccoutDetails from "./DesktopAccountDetails";
import MobileAccountDetails from "./MobileAccountDetails";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import {useApi} from '../hooks/useApi'

const AccountDetails = () => {
  const { account_id } = useParams();
  const api = useApi();
  const { data: account, isLoading,error} = useQuery({
    queryKey : ["account" , account_id],
    queryFn : ()=>api(`/api/accounts/${account_id}`),
    retry : false
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
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Account Not Found</h2>
        <p className="text-gray-500 mt-2">There was a problem loading these account details.</p>
      </div>
    );
  }


  return (
    <div className="w-full bg-gray-100  mx-auto min-h-screen">
      <Toaster position="top-right" reverseOrder={false} className="rounded-xl p-2"/>
      <div className="hidden md:block">
        <DesktopAccoutDetails account={account.data}/>
      </div>
      <div className="md:hidden">
        <MobileAccountDetails account={account.data}/>
      </div>
    </div>
  );
};
export default AccountDetails;
