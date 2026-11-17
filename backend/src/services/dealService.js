const pool = require("../db/db");
const httpError = require("../utils/httpError");
const moveMoney = require("./moveMoney");
const {
  PAY_BY_MIN,
  SHIP_BY_MIN,
  DELIVER_MIN,
  CONFIRM_MIN,
  MAX_AMOUNT_CENTS,
} = require("../config/deals");

let escrowAccountId = null;
async function getEscrowAccountId(client) {
  if (escrowAccountId) return escrowAccountId;
  const {
    rows: [row],
  } = await pool.query(
    `SELECT account_id FROM accounts WHERE account_type='escrow'`,
  );
  if (!row) throw httpError(500, "Escrow account is missing");
  escrowAccountId = row.account_id;
  return escrowAccountId;
}

const inMinutes = (minutes) => new Date(Date.now() + minutes * 60 * 1000);

function nextDeadlines(status) {
  const none = {
    pay_by: null,
    ship_by: null,
    deliver_by: null,
    auto_release_at: null,
  };
  if (status === "CREATED") return { ...none, pay_by: inMinutes(PAY_BY_MIN) };
  if (status === "FUNDED") return { ...none, ship_by: inMinutes(SHIP_BY_MIN) };
  if (status === "SHIPPED")
    return { ...none, deliver_by: inMinutes(DELIVER_MIN) };
  if (status === "DELIVERED")
    return { ...none, auto_release_at: inMinutes(CONFIRM_MIN) };
  return none;
}

const TRANSITIONS = {
  pay: { from: ["CREATED"], by: ["BUYER"], to: "FUNDED", money: "DEAL_HOLD" },
  cancel: {
    from: ["CREATED"],
    by: ["BUYER", "SELLER"],
    to: "CANCELLED",
    money: null,
  },
  refund: {
    from: ["FUNDED"],
    by: ["BUYER", "SELLER"],
    to: "REFUNDED",
    money: "DEAL_REFUND",
  },
  ship: { from: ["FUNDED"], by: ["SELLER"], to: "SHIPPED", money: null },
  deliver: { from: ["SHIPPED"], by: ["SELLER"], to: "DELIVERED", money: null },
  confirm: {
    from: ["FUNDED", "SHIPPED", "DELIVERED"],
    by: ["BUYER"],
    to: "RELEASED",
    money: "DEAL_RELEASE",
  },
  expire: { from: ["CREATED"], by: ["SYSTEM"], to: "EXPIRED", money: null },
  autoRefund: {
    from: ["FUNDED"],
    by: ["SYSTEM"],
    to: "REFUNDED",
    money: "DEAL_REFUND",
  },
  autoRelease: {
    from: ["DELIVERED"],
    by: ["SYSTEM"],
    to: "RELEASED",
    money: "DEAL_RELEASE",
  },
  dispute: {
    from: ["SHIPPED", "DELIVERED"],
    by: ["BUYER", "SYSTEM"],
    to: "DISPUTED",
    money: null,
  },
  adminRefund: {
    from: ["DISPUTED"],
    by: ["ADMIN"],
    to: "REFUNDED",
    money: "DEAL_REFUND",
  },
  adminRelease: {
    from: ["DISPUTED"],
    by: ["ADMIN"],
    to: "RELEASED",
    money: "DEAL_RELEASE",
  },
  cancelAccept: {
    from: ["SHIPPED"],
    by: ["SELLER"],
    to: "REFUNDED",
    money: "DEAL_REFUND",
    needs: "cancel_requested",
  },
};
const USER_ACTIONS = [
  { url: "pay", key: "pay" },
  { url: "cancel", key: "cancel" },
  { url: "refund", key: "refund" },
  { url: "ship", key: "ship" },
  { url: "deliver", key: "deliver" },
  { url: "confirm", key: "confirm" },
  { url: "dispute", key: "dispute" },
  { url: "cancel-accept", key: "cancelAccept" },
];
async function createDeal(
  sellerId,
  { seller_account_id, title, description, amount: cents, delivery_type },
) {
  if (cents > MAX_AMOUNT_CENTS)
    throw httpError(
      422,
      `A deal cannot be more than ${(MAX_AMOUNT_CENTS / 100).toFixed(2)}`,
    );
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const {
      rows: [account],
    } = await client.query(
      `SELECT account_id FROM accounts
            WHERE account_id=$1 AND user_id=$2 AND status='ACTIVE' AND account_type <>'escrow'`,
      [seller_account_id, sellerId],
    );
    if (!account)
      throw httpError(
        404,
        "Choose one of you active accounts to receive the money.",
      );
    const { pay_by } = nextDeadlines("CREATED");
    const {
      rows: [deal],
    } = await client.query(
      `INSERT INTO deals (seller_id,seller_account_id,title,description,amount,delivery_type,pay_by)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *
            `,
      [
        sellerId,
        seller_account_id,
        title,
        description ?? null,
        (cents / 100).toFixed(2),
        delivery_type,
        pay_by,
      ],
    );
    await client.query(
      `INSERT INTO deal_events (deal_id,actor,from_status,to_status,note)
            VALUES ($1,'SELLER',NULL,'CREATED','Deal created')`,
      [deal.deal_id],
    );
    await client.query("COMMIT");
    return deal;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function transitionDeal(deal_id, action, actor, extra = {}) {
  const rule = TRANSITIONS[action];
  if (!rule) throw httpError(400, "Unknow action");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const {
      rows: [deal],
    } = await client.query(`SELECT * from deals WHERE deal_id =$1 FOR UPDATE`, [
      deal_id,
    ]);
    if (!deal) throw httpError(404, "Deal not found.");
    const claiming =
      action === "pay" &&
      !deal.buyer_id &&
      actor.kind === "USER" &&
      actor.userId !== deal.seller_id;
    const role =
      actor.kind === "ADMIN" || actor.kind === "SYSTEM"
        ? actor.kind
        : claiming
          ? "BUYER"
          : actor.userId === deal.seller_id
            ? "SELLER"
            : actor.userId === deal.buyer_id
              ? "BUYER"
              : null;
    if (!role) throw httpError(404, "Deal not found.");
    if (!rule.by.includes(role))
      throw httpError(403, "Not allowed for your side of the deal.");
    if (!rule.from.includes(deal.status))
      throw httpError(409, "The deal has changed. Please refresh", "STALE");
    if (rule.needs && !deal[rule.needs])
      throw httpError(409, "The buyer has not asked to cancel");
    if (
      action === "confirm" &&
      deal.status === "FUNDED" &&
      deal.delivery_type !== "MEETUP"
    )
      throw httpError(409, "Wait until the seller marks the item as shipped");

    const cents = Math.round(Number(deal.amount) * 100);
    const buyerId = deal.buyer_id ?? (claiming ? actor.userId : null);
    const escrowId = await getEscrowAccountId(client);

    if (rule.money === "DEAL_HOLD") {
      if (!extra.buyer_account_id)
        throw httpError(422, "Choose the account to pay from");
      await moveMoney(client, {
        sender_account_id: extra.buyer_account_id,
        receiver_account_id: escrowId,
        cents,
        sender_user_id: buyerId,
        checkLimits: true,
        type: "DEAL_HOLD",
        outDesc: `Paid into deal: ${deal.title}`,
        inDesc: `Hold: ${deal.title}`,
        deal_id: deal_id,
      });
    }

    if (rule.money === "DEAL_RELEASE") {
      await moveMoney(client, {
        sender_account_id: escrowId,
        receiver_account_id: deal.seller_account_id,
        cents,
        checkLimits: false,
        type: "DEAL_RELEASE",
        outDesc: `Release: ${deal.title}`,
        inDesc: `Deal payment: ${deal.title}`,
        deal_id: deal_id,
      });
    }

    if (rule.money === "DEAL_REFUND") {
      if (!deal.buyer_account_id)
        throw httpError(500, "This deal has no buyer account recorded");
      await moveMoney(client, {
        sender_account_id: escrowId,
        receiver_account_id: deal.buyer_account_id,
        cents,
        checkLimits: false,
        type: "DEAL_REFUND",
        outDesc: `Refund: ${deal.title}`,
        inDesc: `Refund: ${deal.title}`,
        deal_id: deal_id,
      });
    }

    const d = nextDeadlines(rule.to);
    const {
      rows: [updated],
    } = await client.query(
      `UPDATE deals SET
        status = $1,
        buyer_id = COALESCE($2,buyer_id),
        buyer_account_id = COALESCE($3,buyer_account_id),
        tracking_number = COALESCE($4,tracking_number),
        dispute_reason = COALESCE($5,dispute_reason),
        pay_by=$6,ship_by=$7,deliver_by=$8,auto_release_at=$9,updated_at=NOW()
        WHERE deal_id = $10
        RETURNING *
        `,
      [
        rule.to,
        claiming ? actor.userId : null,
        extra.buyer_account_id ?? null,
        extra.tracking_number ?? null,
        extra.dispute_reason ?? null,
        d.pay_by,
        d.ship_by,
        d.deliver_by,
        d.auto_release_at,
        deal_id,
      ],
    );
    await client.query(
      `INSERT INTO deal_events (deal_id,actor,from_status,to_status,note)
        VALUES ($1,$2,$3,$4,$5)`,
      [deal_id, role, deal.status, rule.to, extra.note ?? null],
    );
    await client.query("COMMIT");
    return updated;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
async function requestCancel(deal_id, user_id) {
  const {
    rows: [deal],
  } = await pool.query(
    `UPDATE deals SET cancel_requested=true,updated_at=NOW()
        WHERE deal_id = $1 AND status = 'SHIPPED' AND buyer_id = $2
        RETURNING *`,
    [deal_id, user_id],
  );
  if (!deal) throw httpError(409, "You can only ask to cancel a shipped deal");
  return deal;
}
async function listDeals(userId) {
  const {
    rows,
  } = await pool.query(
    `SELECT * FROM deals WHERE buyer_id =$1 OR seller_id =$1 ORDER BY updated_at DESC LIMIT 50`,
    [userId],
  );
  return rows;
}
function allowedActionFor(deal,myRole){
  if (myRole === 'VIEWER'){
    return deal.status==='CREATED'?['pay']:[];
  }
  const allowed = [];
  for (const{url,key} of USER_ACTIONS){
    const rule = TRANSITIONS[key];
    if (!rule.from.includes(deal.status))continue;
    if (!rule.by.includes(myRole))continue;
    if(rule.needs && !deal[rule.needs]) continue;
    if (key==='confirm' && deal.status==='FUNDED' && deal.delivery_type !=='MEETUP')continue;
    allowed.push(url)
  
  }
  if(myRole==='BUYER' && deal.status==='SHIPPED' &&!deal.cancel_requested){
    allowed.push("cancel-request")
  }
  return allowed

}
async function getDeal(dealId,user){
  const {rows:[deal]} = await pool.query(
    `SELECT d.*,su.username AS seller_username, bu.username AS buyer_username
    FROM deals d
    JOIN users su ON su.user_id = d.seller_id
    LEFT JOIN users bu ON bu.user_id = d.buyer_id
    WHERE deal_id=$1
    `,[dealId]
  );
  if (!deal) throw httpError(404,"Deal not found");
  const myRole =
    user.role === 'ADMIN' ? 'ADMIN'
    :deal.seller_id === user.id ? 'SELLER'
    :deal.buyer_id === user.id ? 'BUYER'
    :!deal.buyer_id ? 'VIEWER'
    : null
  if (!myRole) throw httpError(404, "Deal not found");

  const {rows:deal_events} = await pool.query(
    `SELECT actor,from_status,to_status,note,created_at
      FROM deal_events
      WHERE deal_id =$1
      ORDER BY created_at`,
      [dealId]
  )
  return {
    deal,myRole,deal_events,allowedActions:allowedActionFor(deal,myRole)
  }
}
async function listDisputeDeals(){
  const {rows} =await pool.query(
    `SELECT d.*,su.username AS seller_username,bu.username AS buyer_username
    FROM deals d
    JOIN users su ON su.user_id = d.seller_id
    LEFT JOIN users bu ON bu.user_id = d.buyer_id
    WHERE d.status='DISPUTED
    ORDER d.created_at`
  );
  return rows;
}


module.exports = {
  TRANSITIONS,
  nextDeadlines,
  createDeal,
  transitionDeal,
  requestCancel,
  listDeals,
  getDeal,
  listDisputeDeals
};
