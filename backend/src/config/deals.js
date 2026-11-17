const fromEnv = (name)=>Number(process.env[name])  || null;
module.exports = {
    PAY_BY_MIN:fromEnv('DEAL_PAY_BY_MIN')?? 7*24*60,
    SHIP_BY_MIN:fromEnv('DEAL_SHIP_BY_MIN')?? 7*24*60,
    DELIVER_MIN:fromEnv('DEAL_DELIVER_MIN')?? 14*24*60,
    CONFIRM_MIN:fromEnv('DEAL_CONFIRM_MIN')?? 3*24*60,
    MAX_AMOUNT_CENTS:200000,
}