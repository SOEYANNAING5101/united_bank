import { useDeal } from "../hooks/useDeal";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Copy, Dot, Check } from "lucide-react";
import { EVENT_LABEL } from "../lib/dealActions";
import { useAccounts } from "../hooks/useAccounts";
import DealActions from "./components/DealActions";
import AdminActions from "./components/AdminActions";
import { daysSince } from "../lib/dealDisplay";
import { useState } from "react";
import {
  dealRef,
  createdDate,
  needActions,
  pharse,
  timeClause,
} from "../lib/dealDisplay";

const DealDetail = () => {
  const [copiedId, setCopiedId] = useState(null);
  const { id } = useParams();
  const { data, isLoading, isError } = useDeal(id);
  const { data: accounts = [] } = useAccounts();
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  if (isLoading) return <div className="mt-15">Loading…</div>;
  if (isError) return <div className="mt-15">Error</div>;

  const { deal, myRole, deal_events } = data;
  
  const copy = async (dealId) => {
    await navigator.clipboard.writeText(dealId);
    setCopiedId(dealId);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const disputedDays = daysSince(deal.updated_at);
  const waited =
    disputedDays >= 1
      ? `${disputedDays} day ${disputedDays === 1 ? "" : "s"} ago`
      : "today";
  const myAccountId =
    myRole === "SELLER"
      ? deal.seller_account_id
      : myRole === "BUYER"
        ? deal.buyer_account_id
        : null;
  const myAccount = accounts.find((a) => a.account_id === myAccountId);

  const myAccountLabel = myAccount
    ? `${cap(myAccount.account_type)} Account (...${myAccount.account_number.slice(-4)})`
    : null;
  const action = needActions(deal.status, myRole);
  const isAdmin = myRole === "ADMIN";
  const isViewer = myRole === "VIEWER";
  const time =
    isAdmin && deal.status === "DISPUTED"
      ? ` Disputed ${waited}`
      : timeClause(deal);
  const other = isAdmin
    ? `${deal.seller_username} - ${deal.buyer_username}`
    : myRole === "SELLER"
      ? deal.buyer_username
        ? `Buyer: ${deal.buyer_username}`
        : "No buyer yet"
      : `Seller: ${deal.seller_username}`;

  const actorLabel = (actor) => {
    if (actor === myRole) return "by you";
    if (actor === "SYSTEM") return "automatically";
    if (actor === "ADMIN") return "by support";
    if (actor === "SELLER") return `by ${deal.seller_username}`;
    return deal.buyer_username ? `by ${deal.buyer_username}` : "by the buyer";
  };
  const statusLine =
    isAdmin && deal.status === "DISPUTED"
      ? "Waiting for your decision"
      : deal.status === "FUNDED" && deal.delivery_type === "MEETUP"
        ? myRole === "SELLER"
          ? "Arrange the meet-up"
          : "Waiting to meet up"
        : pharse(deal.status, myRole);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 pb-20 mt-15 flex flex-col gap-2">
      <Link
        className="text-gray-500 text-sm font-semibold flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-all duration-200"
        to={isAdmin ? "/dispute-lists" : "/deals"}
      >
        <ChevronLeft size={18} />
        {isAdmin ? "Back to disputes" : "Back to deals"}
      </Link>

      {/* Deal Information */}
      <div className="block border border-gray-300 bg-white rounded-lg px-6 py-5 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="truncate text-sm font-semibold text-gray-900">
              {deal?.title}
            </h1>
            <div className="flex items-center text-gray-500 text-[11px]">
              <button
                onClick={() => copy(deal.deal_id)}
                aria-label="Copy deal id"
                className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-600"
              >
                <span>{dealRef(deal.deal_id)}</span>
                {copiedId ? <Check size={10}/> : <Copy size={10}/>}
                
              </button>

              <Dot size={10} />
              {!isViewer && (
                <>
                  {other}
                  <Dot size={10} />
                </>
              )}

              {createdDate(deal.created_at)}
            </div>
          </div>
          <div className="flex flex-col text-right shrink-0">
            <span className=" font-semibold text-gray-900">${deal.amount}</span>
            <div className="flex items-center justify-center px-1 rounded-full border border-gray-200 bg-gray-100 text-[11px] font-semibold text-gray-500">
              {deal.status}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 w-full mt-4 mb-2"></div>
        <div
          className={
            action
              ? "text-gray-900 font-bold text-[11px]"
              : "text-gray-500 text-[11px]"
          }
        >
          <span>{statusLine}</span>
          {time && (
            <span>
              {" "}
              {" . "}
              {time}
            </span>
          )}
        </div>
      </div>

      {/* Timeline & Your move & Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
        <div className="flex flex-col gap-2 md:col-span-2">
          <div className=" block border border-gray-300 bg-white rounded-lg px-6 py-5">
            <h2 className="text-gray-500 text-xs font-semibold">TIMELINE</h2>
            <div className="">
              {deal_events.map((event, i) => {
                const title =
                  event.to_status === event.from_status
                    ? event.note
                    : (EVENT_LABEL[event.to_status] ?? event.to_status);
                return (
                  <div key={i} className="flex gap-3 mt-3">
                    <div className="flex flex-col items-center">
                      <span className="w-2.5 h-2.5 bg-gray-900 rounded-full mt-1.5 shrink-0"></span>
                      {i < deal_events.length - 1 && (
                        <span className="w-0.5 flex-1 bg-gray-200 mt-1"></span>
                      )}
                    </div>
                    <div className="">
                      <p className="text-gray-900 text-xs font-semibold">
                        {title}
                      </p>
                      <p className="text-gray-500 text-[11px]">
                        {actorLabel(event.actor)}
                        {" . "}
                        {new Date(event.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Details */}
          <div className="w-full block border border-gray-300 bg-white rounded-lg px-6 py-5">
            <h2 className="text-gray-500 text-xs font-semibold">DETAILS</h2>
            <div className="grid grid-cols-2 ">
              {/* Delivery & Tracking number */}
              <div className="">
                <div className="flex flex-col mt-2">
                  <label className="text-gray-500 text-xs">Delivery</label>
                  <span className="text-gray-900 text-xs font-semibold">
                    {deal.delivery_type === "POST" ? "Shipping" : "Meet-up"}
                  </span>
                </div>
                <div className="flex flex-col mt-2">
                  <label className="text-gray-500 text-xs">
                    Tracking number
                  </label>
                  <span className="text-gray-900 text-xs font-semibold">
                    {deal.tracking_number
                      ? deal.tracking_number
                      : "Not added yet"}
                  </span>
                </div>
              </div>
              {/* Buyer  & Buyer id */}
              <div className="">
                <div className="flex flex-col mt-2">
                  <label className="text-gray-500 text-xs">
                    {myRole === "SELLER" ? "Buyer" : "Seller"}
                  </label>
                  <span className="text-gray-900 text-xs font-semibold">
                    {myRole === "SELLER"
                      ? deal.buyer_username || "No buyer yet"
                      : deal.seller_username}
                  </span>
                </div>
                <div className="flex flex-col mt-2">
                  <label className="text-gray-500 text-xs">
                    {isAdmin ? "Buyer" :myRole === "SELLER" ? "Payout goes to" : "Paid from"}
                  </label>
                  <span className="text-gray-900 text-xs font-semibold">
                    {isAdmin
                    ? (deal.buyer_user_name ?? 'No buyer yet')
                  : (myAccountLabel ?? 'Not selected yet')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1 w-full block border border-gray-300 bg-white rounded-lg px-6 py-5">
          {isAdmin ? (
            <AdminActions deal={deal} />
          ) : (
            <DealActions
              deal={deal}
              myRole={myRole}
              allowedActions={data.allowedActions}
              accounts={accounts}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default DealDetail;
