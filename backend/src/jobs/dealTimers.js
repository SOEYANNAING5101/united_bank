const pool = require('../db/db')
const { transitionDeal } = require("../services/dealService");

const TIMER_RULES = [
  { column: "pay_by",          status: "CREATED",   action: "expire" },
  { column: "ship_by",         status: "FUNDED",    action: "autoRefund" },
  { column: "deliver_by",      status: "SHIPPED",   action: "dispute" },
  { column: "auto_release_at", status: "DELIVERED", action: "autoRelease" },
];
async function runDealTimers(){
  const actor = {kind:"SYSTEM"};
  for (const {column,status,action} of TIMER_RULES){
    const {rows}=await pool.query(
      `SELECT deal_id FROM deals
      WHERE status=$1 AND ${column} IS NOT NULL AND ${column}<NOW()`,
      [status]
    );
    for (const{deal_id} of rows){
      try{
        await transitionDeal(deal_id,action,actor,{note:`Auto:${action}`})
      }catch(err){
        console.error(`[timers] ${action} on ${deal_id} failed:`, err.message);
      }
    }
  }
}

let running = false
function startDealTimers(intervalMinutes =1){
  setInterval(async()=>{
    if(running)return;
    running= true
    try{
      await runDealTimers()
    }catch(err){
      console.error("timers run failed",err.message)
    }finally{
      running =false
    }
  },intervalMinutes*60*1000);
  console.log(`[timers] deal timers running every ${intervalMinutes} min`);
}
module.exports={startDealTimers,runDealTimers}