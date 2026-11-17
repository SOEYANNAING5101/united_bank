// startDate:  '2025-11-15'
// activePill:  '1Y'
// accountId:  '3be6797c-426a-4c84-96da-b1fba42c7f97'
const {isDate,accountIdOrAll} = require('./helper')
const {z} =require('zod')
const ERROR_DATE = { error: "Date must look like 2026-11-14" }
const daysBetween = (a, b) => (new Date(b) - new Date(a)) / 86400000
const chartQuery = z.object({
    account_id:accountIdOrAll,
    startDate:z.string(ERROR_DATE).refine(isDate,ERROR_DATE),
    endDate:z.string(ERROR_DATE).refine(isDate,ERROR_DATE),
    timeFrame:z.enum(['7D','1M','1Y'],{error:"Time frame must be 7D, 1M or 1Y"}).default('7D')
})
.refine((v)=>v.startDate<=v.endDate,{error:"Start date must be on or before the end date"})
.refine((v)=>daysBetween(v.startDate,v.endDate)<=400,{error:"Date range cannot be longer than 400 days"})

module.exports = {chartQuery}