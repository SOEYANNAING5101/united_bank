export const EVENT_LABEL ={
    CREATED:"Deal created",
    FUNDED:"Payment received",
    SHIPPED:"Marked as shipped",
    DELIVERED:"Marked as delivered",
    RELEASED:"Money released to seller",
    REFUNDED:"Refunded to buyer",
    DISPUTED:"Dispute opened",
    CANCELLED:"Deal cancelled",
    EXPIRED:"Deal expired"
}
export const ACTION_UI = {
  pay:     { label: "Pay",               variant: "primary" },
  ship:    { label: "Mark as shipped",   variant: "primary" },
  deliver: { label: "Mark as delivered", variant: "primary" },
  confirm: {
    label: "Confirm I received it",
    variant: "primary",
    note: (deal) => `Releases $${deal.amount} to the seller. Can't be undone.`,
  },
  dispute: { label: "Something's wrong — dispute", variant: "ghost" },
  "cancel-request": { label: "Ask the seller to cancel", variant: "text" },
  "cancel-accept": {
    label: "Accept cancellation",
    variant: "ghost",
    note: "Accepting refunds the buyer in full.",
  },
  cancel: { label: "Cancel deal", variant: "ghost" },
  refund: {
    label: { SELLER: "Refund the buyer", BUYER: "Cancel and refund me" },
    variant: "ghost",
  },
};
const MOVE_MESSAGE = {
  CREATED: {
    SELLER: "Nobody has paid yet. Share this link with your buyer so they can fund the deal.",
    VIEWER: "Pay into escrow to start this deal. The seller only gets the money once you confirm.",
  },
  FUNDED: {
    SELLER: "The buyer has paid. Ship the item, then mark it shipped so they know it's on the way.",
    BUYER: "Your money is held in escrow. Waiting for the seller to ship.",
  },
  SHIPPED: {
    SELLER: "On its way. Mark it delivered once it reaches the buyer.",
    BUYER: "The seller marked this as shipped. Confirm once it's actually in your hands.",
  },
  DELIVERED: {
    SELLER: "Waiting for the buyer to confirm. It releases to you automatically if they don't confirm in 7 days",
    BUYER: "Confirm you received it to release the money to the seller.",
  },
  DISPUTED: "Our support team is reviewing this deal. Nothing moves until they decide.",
  RELEASED: "This deal is done — the money has been transferred to the seller.",
  REFUNDED: "This deal was refunded — the money has been transferred back to the buyer.",
  CANCELLED: "This deal was cancelled before anyone paid.",
  EXPIRED: "Nobody paid in time, so this deal expired.",
};
export function moveMessage(deal,role){
  if (deal.status==='FUNDED' && deal.delivery_type==='MEETUP'){
    return role === 'SELLER'
    ? "The buyer has transferred the money. Meet up and hand over the item."
    : "Your money is currently held in our system. Meet the seller to collect the item, then confirm."
  }
  const m = MOVE_MESSAGE[deal.status];
  if (!m) return null;
  return typeof m === 'string'? m: m[role]??null;
}

export const labelFor = (action,role)=>{
  const l = ACTION_UI[action]?.label;
  if (!l) return null
  return typeof l === 'string' ? l : l[role] ??action
}
export const noteFor = (action,deal)=>{
  const n = ACTION_UI[action]?.note;
  if (!n) return null
  return typeof n === 'function' ? n(deal) : n;
}

export const ACTION_ORDER = ['confirm','deliver','cancel-accept','refund','cancel']