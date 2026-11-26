const { z } = require("zod");
const { uuid, money } = require("./helper");
const text = (label, min, max) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, {
      error:
        min === 1
          ? `${label} is required`
          : `${label} must be at least ${min} characters`,
    })
    .max(max, { error: `${label} must be at most ${max} characters` });

const createDealBody = z.object({
  seller_account_id: uuid,
  title: text("Title", 1, 100),
  amount: money,
  delivery_type: z.enum(["POST", "MEETUP"], {
    error: "Delivery must be POST or MEETUP",
  }),
});

const dealActionParams = z.object({
  id:uuid,
  action:z.enum(["pay","cancel","refund","ship","deliver","confirm","dispute","cancel-request","cancel-accept"], { error: "Unknown deal action" })
})
const dealActionBody = z.object({
  buyer_account_id: uuid.optional(),
  tracking_number: z
    .string({ error: "Tracking number must be text" })
    .trim()
    .max(100, { error: "Tracking number must be at most 100 characters" })
    .optional(),
  dispute_reason: z
    .string({ error: "Reason must be text" })
    .trim()
    .max(30, { error: "Reason must be at most 30 characters" })
    .optional(),
});
const dealIdParams = z.object({id:uuid})
const adminActionParams = z.object({
  id: uuid,
  action: z.enum(["refund", "release"], { error: "Resolve must be refund or release" }),
});

const dealListQuery = z.object({
  role:z.enum(['all','buying','selling'],{error:"Invalid role filter"}).default("all"),
  status:z.enum(["all", "active", "completed",
        "created", "funded", "shipped", "delivered",
        "disputed", "released", "refunded", "expired", "cancelled",],{error:"Invalid status filter"}),
  search:z.string().trim().max(60,{error:"Search is too long"}).optional(),
  sort:z.enum(['recent','deadline','amount'],{error:"Invalid sort"}),
  page:z.coerce.number().min(1).default(1)
  
})
module.exports = { createDealBody,dealActionParams,dealActionBody,dealIdParams,adminActionParams,dealListQuery};
