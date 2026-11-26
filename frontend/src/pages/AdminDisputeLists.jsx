import { useState } from "react";
import { Link } from "react-router-dom";
import { dealRef, daysSince } from "../lib/dealDisplay";
import { useDisputes } from "../hooks/useDisputes";
import { Copy, Dot, MoveRight, ArrowRight } from "lucide-react";
const AdminDisputeLists = () => {
  const { data: disputes, isLoading, isError } = useDisputes();
  const [copiedId, setCopiedId] = useState(null);
  const copy = async (dealId) => {
    await navigator.clipboard.writeText(dealId);
    setCopiedId(dealId);
    setTimeout(() => setCopiedId(null), 2000);
  };
  return (
    <div className="w-full max-w-6xl mx-auto p-4 pb-20 mt-10 md:mt-15">
      {/* Headers */}
      <div className="mt-8 mb-4 md:mt-0 flex items-center justify-between">
        <div>
          <p className="md:text-2xl text-xl font-semibold">Disputes</p>
          <p className="text-gray-500 text-xs md:text-sm ">
            Escrow-protected deals you're buying or selling.
          </p>
        </div>
      </div>
      {/* Dispute lists */}
      {isError ? (
        <p>Failed to load disputes</p>
      ) : isLoading ? (
        <p>Failed to load disputes</p>
      ) : disputes.length === 0 ? (
        <div>no deals</div>
      ) : (
        <div className="flex flex-col gap-2 py-4">
          {disputes.map((d) => {
            const days = daysSince(d.updated_at);
            const waited =
              days >= 1 ? `${days} day${days === 1 ? "" : "s"} ago` : "today";
            const important = days >= 3;
            return (
              <div className="block border border-gray-300 bg-white rounded-lg px-6 py-5 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 min-w-0">
                    <h1 className="truncate text-sm font-semibold text-gray-900">
                      {d?.title}
                    </h1>
                    <div className="text-gray-500 text-[11px] flex items-center justify-center gap-1">
                      <button
                        onClick={() => copy(d.deal_id)}
                        aria-label="Copy deal id"
                        className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-600"
                      >
                        <span>{dealRef(d.deal_id)}</span>
                        <Copy size={10} />
                      </button>
                      <Dot size={10} />
                      <span className="flex items-center gap-1">
                        {d.seller_username}
                        <MoveRight size={10} />
                        {d.buyer_username}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col text-right shrink-0">
                    <span className=" font-semibold text-gray-900">
                      ${d?.amount}
                    </span>
                    <div
                      className={`text-[11px]   ${
                        important
                          ? "text-gray-900 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {`Disputed ${waited}`}
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-300 w-full mt-3 mb-2"></div>
                <div className="flex items-center justify-between">
                  <p className={
                    d.dispute_reason ? "text-gray-900 font-bold text-[11px]" : "text-gray-500 text-[11px]"
                  }>
                    {d.dispute_reason
                    ?`${d.dispute_reason}`
                :"Opened automatically. Nobody acted before the delivery deadline."}
                  </p>
                  <Link
                    to={`/deals/${d.deal_id}`}
                    className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 rounded-md text-xs p-2 flex items-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-500"
                  >
                    Review
                    <ArrowRight size={10} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default AdminDisputeLists;
