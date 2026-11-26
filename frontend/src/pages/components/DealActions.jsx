import {
  moveMessage,
  labelFor,
  noteFor,
  ACTION_ORDER,
  ACTION_UI,
} from "../../lib/dealActions";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import CustomDropdown2 from "./dropdown/CustomDropdown2";
import { useDealAction } from "../../hooks/useDealActions";

const base =
  "w-full rounded-md text-xs cursor-pointer px-3 py-2 font-semibold transition-all duration-200";
const STYLES = {
  primary: `${base} bg-blue-700 hover:bg-blue-800 text-white`,
  ghost: `${base} border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 `,
};

const DealActions = ({ deal, myRole, allowedActions, accounts }) => {
  // console.log("deal", deal);
  // console.log("allowedActions", allowedActions);
  // console.log("accounts", accounts);

  const [copied, setCopied] = useState(false);
  const [payAccountId, setPayAccountId] = useState(
    accounts[0]?.account_id ?? "",
  );
  const [error, setError] = useState("");
  const dealAction = useDealAction(deal.deal_id);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showDispute, setShowDispute] = useState(false);
  const [reason, setReason] = useState("");

  const message = moveMessage(deal, myRole);
  const canShare = myRole === "SELLER" && deal.status === "CREATED";
  const link = `${window.location.origin}/deals/${deal.deal_id}`;
  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };
  const has = (a) => allowedActions.includes(a);
  const accountOptions = accounts.map((a) => ({
    value: a.account_id,
    label: `${a.account_type.charAt(0).toUpperCase()}${a.account_type.slice(1)} Account (...${a.account_number.slice(-4)}) `,
  }));

  const run = async (action, body) => {
    setError("");
    try {
      await dealAction.mutateAsync({ action, body });
    } catch (error) {
      setError(error.message);
    }
  };

  const noInputActions = allowedActions
    .filter((a) => !["pay", "ship", "dispute", "cancel-request"].includes(a))
    .sort((a, b) => ACTION_ORDER.indexOf(a) - ACTION_ORDER.indexOf(b));

  return (
    <div>
      <h2 className="text-gray-500 text-xs font-semibold">YOUR MOVE</h2>
      {message && (
        <p className="text-gray-500 text-xs mt-3 leading-relaxed">{message}</p>
      )}
      {/* Link */}
      {canShare && (
        <div className="mt flex flex-col mt-4 gap-2">
          <label className="text-gray-500 text-xs font-bold">
            Shareable link
          </label>
          <input
            value={link}
            className="border border-gray-300 w-full bg-white text-gray-500 rounded-md text-xs p-2"
          ></input>
          <button
            type="button"
            onClick={copy}
            className={`flex shrink-0 items-center justify-center gap-2 ${STYLES.primary}`}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}

            <span>{copied ? "Copied" : "Copy link"}</span>
          </button>
        </div>
      )}
      {/* PAY */}
      {has("pay") && (
        <div className="flex flex-col gap-2 mt-4">
          <label className="text-gray-500 text-xs font-bold">Pay From</label>
          <CustomDropdown2
            options={accountOptions}
            onChange={setPayAccountId}
            value={payAccountId}
            placeholder="Choose an account"
          />
          <button
            type="button"
            disabled={!payAccountId || dealAction.isPending}
            onClick={() => run("pay", { buyer_account_id: payAccountId })}
            className="flex shrink-0 items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 px-3 py-2 text-xs font-semibold text-white rounded-md cursor-pointer transition-all duration-200"
          >
            {dealAction.isPending ? "Paying... " : `Pay $ ${deal.amount}`}
          </button>
        </div>
      )}
      {/* Ship */}
      {has("ship") && (
        <div className="mt flex flex-col mt-4 gap-2">
          <label className="text-gray-500 text-xs font-bold">
            Tracking number (optional)
          </label>
          <input
            value={trackingNumber}
            placeholder="SG123456789"
            maxLength={100}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="border border-gray-300 w-full bg-white text-gray-500 rounded-md text-xs p-2 focus:outline-none focus:ring-1 focus:ring-gray-500"
          ></input>
          <button
            type="button"
            disabled={dealAction.isPending}
            onClick={() =>
              run(
                "ship",
                trackingNumber.trim()
                  ? { tracking_number: trackingNumber.trim() }
                  : {},
              )
            }
            className="flex shrink-0 items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 px-3 py-2 text-xs font-semibold text-white rounded-md cursor-pointer transition-all duration-200"
          >
            {dealAction.isPending ? "Saving... " : `Mark as shipped`}
          </button>
        </div>
      )}
      {noInputActions.map((a) => (
        <div key={a} className="flex flex-col mt-4 gap-2">
          <button
            type="button"
            disabled={dealAction.isPending}
            onClick={() => run(a, {})}
            className={STYLES[ACTION_UI[a]?.variant] ?? STYLES.ghost}
          >
            {labelFor(a, myRole)}
          </button>
          {noteFor(a, deal) && (
            <p className="text-gray-400 text-[11px] leading-relaxed">
              {noteFor(a, deal)}{" "}
            </p>
          )}
        </div>
      ))}

      {/* Dispute */}
      {has("dispute") && (
        <div className="mt-4">
          {!showDispute ? (
            <button
              onClick={() => setShowDispute(true)}
              className={STYLES.ghost}
            >
              {labelFor("dispute", myRole)}
            </button>
          ) : (
            <div className="flex flex-col gap-1">
              <label className="text-gray-500 text-xs font-semibold">
                What's wrong
              </label>
              <input
                type="text"
                value={reason}
                maxLength={30}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Item not as described"
                className="border border-gray-300 w-full bg-white text-gray-500 rounded-md text-xs p-2 focus:outline-none focus:ring-1 focus:ring-gray-500"
              ></input>
              <button
                type="button"
                disabled={dealAction.isPending}
                onClick={() =>
                  run(
                    "dispute",
                    reason.trim() ? { dispute_reason: reason.trim() } : {},
                  )
                }
                className={STYLES.primary}
              >
                {dealAction.isPending ? "Sending... " : `Submit dispute reason`}
              </button>
              <button
                type="button"
                disabled={dealAction.isPending}
                onClick={() => {
                  (setShowDispute(false), setReason(""));
                }}
                className="text-xs text-gray-500 hover:text-gray-600 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                Never mind
              </button>
            </div>
          )}
        </div>
      )}
      {/* cancel-request */}
      {has("cancel-request") && (
        <button
          type="button"
          disabled={dealAction.isPending}
          onClick={() => run("cancel-request", {})}
          className="w-full text-[11px] font-semibold text-gray-500 hover:text-gray-700 py-2 mt-1 cursor-pointer disabled:opacity-50"
        >
          {labelFor("cancel-request", myRole)}
        </button>
      )}
      {allowedActions.length === 0 &&
        !message &&
        !canShare&&(
          <p className="text-xs text-gray-400 text-xs mt-3">
            Nothing to do right now.
          </p>
        )}
      {error && (
        <div className="text-xs text-red-600 mt-3 p-2 border border-red-200 bg-red-50 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};
export default DealActions;
