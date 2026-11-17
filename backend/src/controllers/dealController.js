const { createDeal,transitionDeal,requestCancel } = require("../services/dealService");
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
  try {
    const deal = await createDeal(req.user.id, req.valid.body);
    return res.status(201).json({ message: "Deal created", deal });
  } catch (error) {
    next(error);
  }
};

const postDealAction = async(req, res, next)=>{
  const {id,action} = req.valid.params;
  const deal =
    action === 'cancel-request'
    ?await requestCancel(id,req.user.id)
    :await transitionDeal(id,ACTIONS[action],{kind:'USER',userId:req.user.id},req.valid.body)
    return res.status(200).json({message:"Deal updated",deal})
}

module.exports = { postDeal,postDealAction };
