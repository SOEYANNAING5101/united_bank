import { useEffect, useState } from "react";
import { useAccounts } from "../../../hooks/useAccounts";
import { useCreateDeal } from "../../../hooks/useCreateDeals";
import {
  X,
  ShieldCheck,
  Check,
  Copy,
  ArrowRight,
  Wallet,
  Plus,
} from "lucide-react";
import CustomDropdown2 from "../dropdown/CustomDropdown2";
import { Link } from "react-router-dom";
import { dealRef } from "../../../lib/dealDisplay";
const CreateDealModal = ({ isOpen, onClose }) => {
  const { data: accounts = [], isPending } = useAccounts();
  const createDeal = useCreateDeal();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [delivery, setDelivery] = useState("POST");
  const [accountId, setAccountId] = useState("");
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!accountId && accounts.length > 0) setAccountId(accounts[0].account_id);
  }, [accounts, accountId]);
  const accountOptions = accounts.map((a) => ({
    value: a.account_id,
    label: `${a.account_type.charAt(0).toUpperCase()}${a.account_type.slice(1)} Account (...${a.account_number.slice(-4)}) `,
  }));

  const close = () => {
    setTitle("");
    setAmount("");
    setDelivery("POST");
    setAccountId("");
    onClose();
    setError("");
    setCreated(null);
    setCopied(false);
  };
  const submit = async () => {
    setError("");
    const t = title.trim();
    if (!t) return setError("Give the deal a title");
    if (!/^\d+(\.\d{1,2})?$/.test(amount))
      return setError("Enter a price like 25 or 25.50");
    const dollars = Number(amount);
    if (dollars <= 0) return setError("Price must be greater than $0");
    if (dollars > 2000) return setError("A deal can be at most $2,000.");
    if (!accountId) return setError("Choose an account to receive the money.");
    try {
      const result = await createDeal.mutateAsync({
        seller_account_id: accountId,
        title: t,
        amount: dollars,
        delivery_type: delivery,
      });
      setCreated(result.deal);
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    // compensate for the scrollbar disappearing so the page doesn't jump
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
    };
  }, [isOpen]);
  if (!isOpen) return null;

  const link = created
    ? `${window.location.origin}/deals/${created.deal_id}`
    : "";
  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="p-4 md:p-0 z-60 fixed bg-black/40 inset-0 flex items-center justify-center">
      <div className="bg-white w-full max-w-[600px] rounded-lg shadow-sm">
        {created ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col gap-1">
                <div className="rounded-md bg-blue-100 p-2 w-10 h-10 flex items-center justify-center">
                  <Check className=" text-blue-700" />
                </div>

                <span className="text-gray-800 md:text-lg font-bold">
                  Deal created
                </span>
                <span className="text-gray-400 text-xs">
                  It's live. Share the link below to get paid.
                </span>
              </div>
              <button
                className="mt-2 p-3 right-3 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
                onClick={close}
              >
                <X size={18} />
              </button>
            </div>
            {/* body */}
            <div className="p-6 border-b border-t border-gray-200">
              {/* Deal details */}
              <div className="flex items-center justify-between gap-1 border border-gray-300 w-full bg-gray-100 rounded-md p-3">
                <div>
                  <h1 className="text-sm">{created?.title || "Deal Title"}</h1>
                  <div className="text-gray-500 text-[11px]">
                    <span>{dealRef(created.deal_id) || "Deal Id"}</span>
                    {" . "}
                    {created.delivery_type === "POST" ? "Shipping" : "Meet-up"}
                  </div>
                </div>
                <p className="font-semibold">${created.amount}</p>
              </div>
              {/* Link */}
              <div className="flex flex-col gap-1 mt-4">
                <label className="text-gray-500 text-xs tracking-wide font-semibold">
                  Shareable link
                </label>
                <div className="flex gap-2">
                  <div className="border border-gray-300 w-full bg-white text-gray-500 rounded-md text-[11px] p-2">
                    {link}
                  </div>
                  <button
                    type="button"
                    onClick={copy}
                    className="flex shrink-0 items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 px-3 py-2 text-xs md:text-sm font-semibold text-white rounded-md cursor-pointer transition-all duration-200"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}

                    <span>{copied ? "Copied" : "Copy link"}</span>
                  </button>
                </div>
                <p className="text-gray-400 text-[11px]">
                  Share this link with your buyer.
                </p>
              </div>
            </div>
            {/* Footer */}
            <div className="p-6 flex items-center justify-between">
              <Link
                to={`/deals/${created.deal_id}`}
                onClick={close}
                className="flex items-center justify-center gap-1 text-sm cursor-pointer text-blue-700 hover:text-blue-800 transition-all duration-200"
              >
                View Deal
                <ArrowRight size={18} />
              </Link>
              <button
                onClick={close}
                className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-500 rounded-md text-xs p-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex flex-col gap-1">
                <span className="text-gray-800 md:text-lg font-bold">
                  Create a deal
                </span>
                <span className="text-gray-400 text-xs">
                  Set it up once, then share the link with your buyer.
                </span>
              </div>
              <button
                className="mt-2 p-3 right-3 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
                onClick={close}
              >
                <X size={18} />
              </button>
            </div>
            {/* Body */}
            <div className="p-4 border-b border-t border-gray-200">
              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-xs tracking-wide font-semibold">
                  What are you selling?
                </label>
                <input
                  type="text"
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="iPhone 13 Pro - 256 GB"
                  className="border border-gray-300 w-full bg-white text-gray-500 rounded-md text-xs p-2 focus:outline-none focus:ring-1 focus:ring-gray-500"
                ></input>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1 mt-4">
                <label className="text-gray-500 text-xs tracking-wide font-semibold">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">
                    $
                  </span>
                  <input
                    type="text"
                    value={amount}
                    inputMode="decimal"
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="border border-gray-300 pl-6 w-full bg-white text-gray-500 rounded-md text-xs p-2 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  ></input>
                </div>
                <p className="text-gray-400 text-[11px]">
                  The buyer pays this to fund the deal. It's fixed once created.
                </p>
              </div>

              {/* Delivery method */}
              <div className="flex flex-col gap-1 mt-4">
                <label className="text-gray-500 text-xs tracking-wide font-semibold">
                  How will they get the item?
                </label>
                <div className="flex gap-1 border border-gray-300 w-full bg-gray-200 rounded-md p-1">
                  {[
                    ["POST", "Shipping"],
                    ["MEETUP", "Meet-up"],
                  ].map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setDelivery(value)}
                      className={`w-full text-xs py-1 rounded-sm cursor-pointer transition-colors duration-200 ${
                        delivery === value
                          ? "bg-white text-gray-900 font-semibold"
                          : "bg-transparent text-gray-500 font-medium"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account selection */}
              <div className="flex flex-col gap-1 mt-4">
                <label className="text-gray-500 text-xs tracking-wide font-semibold">
                  Money goes to
                </label>
                {accounts.length === 0 ? (
                  <div className="p-5 flex flex-col items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-md">
                    <h1 className="text-sm font-semibold mb-1">
                      No account yet
                    </h1>
                    <span className="text-gray-500 text-[11px] leading-relaxed max-w-xs text-center">
                      You need a active Vouch account to receive your payout
                      when a deal completes.
                    </span>
                    <Link
                      to="/open-account"
                      onClick={close}
                      className="flex items-center justify-center mt-3 gap-2 bg-blue-700 hover:bg-blue-800 px-3 py-2 text-xs font-semibold text-white rounded-md cursor-pointer transition-all duration-200"
                    >
                      <Plus size={15} />
                      <span>Open an account</span>
                    </Link>
                  </div>
                ) : (
                  <CustomDropdown2
                    options={accountOptions}
                    onChange={setAccountId}
                    value={accountId}
                    placeholder="Choose an account"
                  />
                )}

                <p className="text-gray-400 text-[11px]">
                  Released here when the buyer confirms they've received the
                  item.
                </p>
              </div>

              {/* Security note */}
              <div className="flex items-center gap-2 mt-4 border border-gray-300 w-full bg-gray-50 rounded-md px-3.5 py-3">
                <ShieldCheck size={25} className="text-blue-700" />
                <span className="text-gray-500 text-xs leading-relaxed ">
                  The buyer's payment is held in escrow account and only
                  released to you once they confrim the item arrived.
                </span>
              </div>
              {error && (
                <div className="text-xs text-red-600 mt-2 p-2 border border-red-200 bg-red-100 rounded-md">
                  {error}
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="flex gap-2 p-4">
              <button
                onClick={close}
                className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-500 rounded-md text-xs p-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={createDeal.isPending || accounts.length === 0}
                onClick={submit}
                className="flex-1 items-center justify-center bg-blue-700 hover:bg-blue-800 px-3 py-2 text-xs md:text-sm font-semibold text-white rounded-md cursor-pointer transition-all duration-200
                disabled:pointer-events-none disabled:bg-gray-400"
              >
                {createDeal.isPending ? "Creating... " : "Create Deal"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default CreateDealModal;
