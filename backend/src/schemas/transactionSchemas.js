const { z } = require("zod");
const {
  uuid,
  money,
  isDigit
} = require("./helper");
const description = z
  .string({ error: "Description must be text" })
  .trim()
  .max(50, { error: "Description must be 50 characters or less" })
  .optional();
const account_number = z
  .string({ error: "Invalid input" })
  .length(10, { error: "Account number must be 10 digits" })
  .refine(isDigit, { error: "Account number must contain only digits" });

const withdrawBody = z.object({
  account_id: uuid,
  amount: money,
  description,
});

const transferPeerBody = z.object({
  sender_account_id: uuid,
  receiver_account_number: account_number,
  amount: money,
  description,
});
const internalTransferBody = z.object({
  sender_account_id:uuid,
  receiver_account_id:uuid,
  amount: money,
  description,
})
.refine((v)=>v.sender_account_id!==v.receiver_account_id,{error:"Cannot transfer to the same account"});

const createDepositBody = z.object({
  account_id: uuid,
  amount: money.refine((cents) => cents >= 50, { error: "Minimum deposit is $0.50" }),
});
 
module.exports = { withdrawBody, transferPeerBody, internalTransferBody,createDepositBody };
