import { useState } from "react";
import { daysSince } from "../../lib/dealDisplay";
import { useAdminResolve} from '../../hooks/useAdminResolve'
const AdminActions = ({ deal }) => {
  const resolve =  useAdminResolve(deal.deal_id)
  const days = daysSince(deal.updated_at);
  const [pending,setPending] = useState(null)
  const [error,setError] = useState("")
  if (deal.status !== 'DISPUTED'){
    return (
        <div>
            <h2 className="text-gray-500 text-xs font-semibold">YOUR MOVE</h2>
            <span className="text-gray-500 text-xs leading-relaxed">
        The deal isn't disputed. Nothing for support to decide.
      </span>
        </div>
    )
  }
  const waited =
    days >= 1 ? `${days} day${days === 1 ? "" : "s"} ago` : "today";
  const OPTIONS = {
    refund: {
      label: `Refund $${deal.amount} to ${deal.buyer_username}`,
      confirm: `Yes, refund to ${deal.buyer_username}`,
    },
    release: {
      label: `Release $${deal.amount} to ${deal.seller_username}`,
      confirm: `Yes, release to ${deal.seller_username}`,
    },
  };
  const run = async (action)=>{
    setError("")
    try{
        await resolve.mutateAsync(action)
        setPending(null)
    }catch(error){
        setError(error.message)
    }
  }
  return (
    <div>
      <h2 className="text-gray-500 text-xs font-semibold">YOUR MOVE</h2>
      <span className="text-gray-500 text-xs leading-relaxed">
        Decide who gets the ${deal.amount} held in escrow.
      </span>
      <div className="flex flex-col gap-2 mt-4 border border-gray-300 bg-gray-100 rounded-md  p-3">
        <span className="text-gray-500 text-xs font-semibold">
          Dispute Reason
        </span>
        <span className="text-gray-900 text-xs ">
          {deal.dispute_reason
            ? `"${deal.dispute_reason}"`
            : "Opened automatically — nobody acted before the delivery deadline"}
        </span>
        <span className="text-gray-500 text-[11px] ">Disputed {waited}</span>
      </div>
      {pending ? (
        <div className="mt-4 flex flex-col gap-2">
            <p className="text-gray-900 text-[11px] leading-relaxed">
                {OPTIONS[pending].label}. This closes the deal and moves the money now.
            </p>
            <button 
            type="button"
            disabled={resolve.isPending}
            onClick={()=>run(pending)}
            className="w-full rounded-md text-xs bg-blue-700 hover:bg-blue-800 text-white cursor-pointer px-3 py-2 font-semibold transition-all duration-200">
                {resolve.isPending ? "Working..." : OPTIONS[pending].confirm}
            </button>
            <button
            type="button"
            
            onClick={()=>setPending(null)}
            className="text-xs text-gray-500 hover:text-gray-600 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-500">
                Never Mind
            </button>
        </div>
      ):(
        <div className="mt-4 flex flex-col gap-2">
            <button 
            type="button"
            onClick={()=>setPending("refund")}
            className="w-full rounded-md text-xs cursor-pointer px-3 py-2 font-semibold  border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-all duration-200 ">
                {OPTIONS.refund.label}
            </button>
            <button 
            type="button"
            onClick={()=>setPending("release")}
            className="w-full rounded-md text-xs cursor-pointer px-3 py-2 font-semibold  border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-all duration-200 ">
                {OPTIONS.release.label}
            </button>
            <span className="text-gray-400 text-[11px] leading-relaxed">Whichever you pick closes the deal and moves the money straight away. There's no undo.</span>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 mt-3 p-2 border border-red-200 bg-red-50 rounded-md">
          {error}
        </div>
      )}


    </div>
  );
};
export default AdminActions;
