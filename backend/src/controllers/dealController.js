const {
  createDeal,
  transitionDeal,
  requestCancel,
  listDeals,
  getDeal,
  listDisputeDeals
} = require("../services/dealService");
const ACTIONS = {
  pay: "pay",
  cancel: "cancel",
  refund: "refund",
  ship: "ship",
  deliver: "deliver",
  confirm: "confirm",
  dispute: "dispute",
  "cancel-accept": "cancelAccept",
};
const postDeal = async (req, res, next) => {
  const deal = await createDeal(req.user.id, req.valid.body);
  try {
    return res.status(201).json({ message: "Deal created", deal });
  } catch (error) {
    next(error);
  }
};

const postDealAction = async (req, res, next) => {
  const { id, action } = req.valid.params;
  const deal =
    action === "cancel-request"
      ? await requestCancel(id, req.user.id)
      : await transitionDeal(
          id,
          ACTIONS[action],
          { kind: "USER", userId: req.user.id },
          req.valid.body,
        );
  return res.status(200).json({ message: "Deal updated", deal });
};

const getMyDeals = async (req, res, next) => {
  try {
    const {rows,total} = await listDeals(req.user.id,req.valid.query);
    const deals = rows.map((d)=>({
      ...d,
      myRole:d.seller_id === req.user.id ? "SELLER":"BUYER",
    }))
    return res.status(200).json({ 
      deals,
      page:req.valid.query.page,
      totalPages : Math.ceil(total/10),
      total
     });
  } catch (error) {
    next(error);
  }
};
const getOneDeal = async (req, res, next) => {
  try {
    const result = await getDeal(req.valid.params.id, req.user);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
const ADMIN_ACTIONS = {refund:'adminRefund',release:"adminRelease"}
const getDisputeDeals=async(req,res,next)=>{
  try{
    const deals = await listDisputeDeals();
    return res.status(200).json({deals})
  }catch(error){
    next(error)
  }
}
const postAdminResolve=async(req,res,next)=>{
  try{
    const {id,action} = req.valid.params
    const deal = await transitionDeal(id,ADMIN_ACTIONS[action],{kind:'ADMIN'},req.valid.body);
    return res.status(200).json({message:"Deal resolved: ",deal})
  }catch(error){
    next(error)
  }
}

module.exports = { postDeal, postDealAction, getMyDeals, getOneDeal,getDisputeDeals,postAdminResolve };
