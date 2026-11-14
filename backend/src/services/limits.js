const httpError = require('../utils/httpError')
const {dbToCents} =require('../utils/money')
const SG_DAY = `DATE_TRUNC('day',NOW() AT TIME ZONE 'Asia/Singapore') AT TIME ZONE 'Asia/Singapore'`;
const SG_MONTH = `DATE_TRUNC('month',NOW() AT TIME ZONE 'Asia/Singapore') AT TIME ZONE 'Asia/Singapore'`
async function assertWithinLimits(client,account,cents){
    // per transfer limit
    if (cents>dbToCents(account.txn_limit_per_transfer)){
        throw httpError(422,`Over your per-transfer limit of $${account.txn_limit_per_transfer}`)
    }
    const {rows:[spent]} = await client.query(
        `SELECT COALESCE(SUM(-amount) FILTER (WHERE created_at >= ${SG_DAY}),0) AS today,
        COALESCE (SUM(-amount) FILTER (WHERE created_at >= ${SG_MONTH}),0)AS month
        FROM transactions
        WHERE account_id = $1 AND transaction_type IN ('PEER_TRANSFER','EXTERNAL_WITHDRAWAL') AND direction='OUT' AND status IN ('PENDING','COMPLETED')
        `,
        [account.account_id]
    )
    const leftToday = dbToCents(account.daily_transfer_limit)-dbToCents(spent.today)
    if (cents>leftToday){
        throw httpError(422,`Transfer exceeds daily limit. You have $${(Math.max(0,leftToday)/100).toFixed(2)} today.  You can increase the daily spent limit under account details.`)
    }
    const leftMonth = dbToCents(account.monthly_transfer_limit)-dbToCents(spent.month)
    if(cents>leftMonth){
        throw httpError(422,`Transfer exceeds monthly limit. You have $${(Math.max(0,leftMonth)/100).toFixed(2)} this month.You can increase the monthly spent limit under account details.`)
    }

}
module.exports = {assertWithinLimits}