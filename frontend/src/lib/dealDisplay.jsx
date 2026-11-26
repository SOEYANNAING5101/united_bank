export function dealRef(deal_id) {
  return "#" + String(deal_id).slice(-7);
}

// created_at date
export function createdDate(created_at) {
  return new Date(created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function counterparty(deal) {
  if (deal.myRole === "SELLER") {
    return deal.buyer_username
      ? `Buyer: ${deal.buyer_username}`
      : "No buyer yet";
  }
  return `Seller: ${deal.seller_username}`;
}

export function needActions(status, role) {
  if (status === "FUNDED" && role === "SELLER") {
    return true;
  } else if (status === "DELIVERED" && role === "BUYER") {
    return true;
  }
  return false;
}

const ACTIONS = {
  CREATED: "Waiting for a buyer to pay",
  FUNDED: { SELLER: "You need to ship", BUYER: "Wating for seller to ship" },
  SHIPPED: {SELLER: "Shipped - awaiting delivery",BUYER: "Waiting for delivery",},
  DELIVERED: {SELLER: "Waiting buyer to confirm",BUYER: "Confirm you received it",},
  DISPUTED: "Under review by support",
  RELEASED: "Released to seller",
  REFUNDED: "Refunded to buyer",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

export function pharse(status, role) {
    const action = ACTIONS[status];
    if (!action) return null;
    return typeof action == 'string' ? action: action[role]
}

const DEADLINE = { CREATED: "pay_by", FUNDED: "ship_by", SHIPPED: "deliver_by", DELIVERED: "auto_release_at" };
export function timeClause(deal){
  const deadlineField = DEADLINE[deal.status];
  if (!deadlineField || !deal[deadlineField]) return null;
  const ms = new Date(deal[deadlineField]).getTime()-Date.now()
  const days = Math.ceil(ms/86400000);
  if (days<0) return "overdue";
  if (days===0) return "Due today";
  return `${days} days left`
}

export function daysSince(timeStamp) {
  return Math.floor((Date.now()-new Date(timeStamp).getTime())/86400000)
}
