const { randomUUID } = require("crypto");
const httpError = require("../utils/httpError");
const { dbToCents } = require("../utils/money");
const SG_DAY = `DATE_TRUNC('day', NOW() AT TIME ZONE 'Asia/Singapore') AT TIME ZONE 'Asia/Singapore'`;
const SG_MONTH = `DATE_TRUNC('month', NOW() AT TIME ZONE 'Asia/Singapore') AT TIME ZONE 'Asia/Singapore'`;
async function moveMoney(
  client,
  {
    sender_account_id,
    receiver_account_id,
    cents,
    sender_user_id,
    receiver_user_id,
    checkLimits,
    type,
    outDesc,
    inDesc,
  },
) {
    if (sender_account_id === receiver_account_id){
        throw httpError(422,"Cannot transfer to the same account.")
    }
  const { rows } = await client.query(
    `SELECT account_id,user_id,account_number,balance,status,txn_limit_per_transfer,daily_transfer_limit,monthly_transfer_limit
        FROM accounts
        WHERE account_id=ANY($1::uuid[])
        ORDER BY account_id
        FOR UPDATE
        `,
    [[sender_account_id, receiver_account_id]],
  );
  const sender = rows.find((r) => r.account_id === sender_account_id);
  const receiver = rows.find((r) => r.account_id === receiver_account_id);
  if (!sender || (sender_user_id && sender.user_id !== sender_user_id))
    throw httpError(404, "Sender account not found.");
  if (!receiver || (receiver_user_id && receiver.user_id !== receiver_user_id))
    throw httpError(404, "Receiver account not found.");
  if(sender.status !== 'ACTIVE')
    throw httpError(422,"Your account is not active")
  if(receiver.status !== 'ACTIVE')
    throw httpError(422,"Receiving account is not active")

  if (dbToCents(sender.balance) < cents)
    throw httpError(422, "Insufficient funds for this transfer");
  const amount = (cents / 100).toFixed(2);
  if (checkLimits){
    if (cents >dbToCents(sender.txn_limit_per_transfer)){
        throw httpError(422,`Over your per-transfer limit of $${sender.txn_limit_per_transfer}`)
    }
    const {rows:[spent]}=await client.query(
        `SELECT COALESCE (SUM(-amount) FILTER(WHERE created_at >= ${SG_DAY}),0) AS today,
        COALESCE(SUM(-amount) FILTER(WHERE created_at >=${SG_MONTH}),0)AS month
        FROM transactions
        WHERE account_id =$1 AND direction='OUT' AND transaction_type IN ('PEER_TRANSFER','EXTERNAL_WITHDRAWAL') AND status IN ('COMPLETED','PENDING')`,
        [sender_account_id]
    );
    const leftToday = dbToCents(sender.daily_transfer_limit) - dbToCents(spent.today)
    if (cents>leftToday){
        throw httpError(422,`Transfer exceeds daily limit. You have $${(Math.max(0,leftToday)/100).toFixed(2)} left today.`)
    }
    const leftMonth = dbToCents(sender.monthly_transfer_limit) -dbToCents(spent.month)
    if (cents>leftMonth){
        throw httpError(422,`Transfer exceeds monthly limit. You have $${(Math.max(0,leftMonth)/100).toFixed(2)} left this month.`)
    }
  }
  await client.query(
    `UPDATE accounts SET balance = balance - $1,updated_at = NOW() WHERE account_id = $2`,
    [amount, sender_account_id],
  );
  await client.query(
    `UPDATE accounts SET balance = balance + $1,updated_at = NOW() WHERE account_id = $2`,
    [amount, receiver_account_id],
  );
  const text = (d) => (typeof d === "function" ? d(sender,receiver) : d);
  const transfer_id = randomUUID()
  const {
    rows: [outRow]} = await client.query(
    `INSERT INTO transactions 
    (account_id,amount,counterparty,description,transaction_type,status,transfer_id)
    VALUES ($1,-$2::numeric,$3,$4,$5,'COMPLETED',$6)
    RETURNING *
    `,[sender_account_id,amount,receiver_account_id,text(outDesc),type,transfer_id]
  );
  await client.query(
    `INSERT INTO transactions 
    (account_id,amount,counterparty,description,transaction_type,status,transfer_id)
    VALUES ($1,$2,$3,$4,$5,'COMPLETED',$6)
    `,[receiver_account_id,amount,sender_account_id,text(inDesc),type,transfer_id]
  );
  return {transfer_id,outRow}
  
}
module.exports = moveMoney;
