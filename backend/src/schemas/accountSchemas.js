const {z} = require("zod")
const {uuid,money,isDigit,isMonth,accountIdOrAll} = require('./helper')


const ERROR_PAGE = {error:"Page must be a number from 1 to 1000"}


const accountIdParams = z.object({account_id:uuid})

const createAccountBody = z.object({
    account_type:z.enum(['checking','saving'],{error:"Account type must be checking or saving"})
});
const limitBody = z.object({
    txn_limit_per_transfer:money,
    daily_transfer_limit:money,
    monthly_transfer_limit:money
})
.refine((v)=>v.txn_limit_per_transfer<=v.daily_transfer_limit,{error:"Per-transfer limit cannot exceed the daily limit"})
.refine((v)=>v.daily_transfer_limit<=v.monthly_transfer_limit,{error:"Daily limit cannot exceed the monthly limit"})

const lookupParams = z.object({
    account_number:z.string({error:"Invalid input"}).length(10,{error:"Account number must be 10 digits"}).refine(isDigit,{error:"Account number must contain only digits"})
})

const historyParams = z.object({
    account_id:accountIdOrAll
})

const historyQuery  = z.object({
    month:z.string({error:"Month must look like 2026-11"}).refine(isMonth,{error:"Month must look like 2026-11"}),
    page:z.coerce.number(ERROR_PAGE).int(ERROR_PAGE).min(1,ERROR_PAGE).max(1000,ERROR_PAGE).default(1),
    filter:z.enum(['all','money_in','money_out'],{error:"Filter must be all, money_in or money_out"}).default("all")
})
module.exports = {accountIdParams,createAccountBody,limitBody,lookupParams,historyParams,historyQuery}