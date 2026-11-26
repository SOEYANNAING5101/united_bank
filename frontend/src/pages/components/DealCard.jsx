import {
  dealRef,
  createdDate,
  counterparty,
  needActions,
  pharse,
  timeClause,
} from "../../lib/dealDisplay";
import {Link} from 'react-router-dom'
import {Dot}  from 'lucide-react'
const DealCard = ({ deal }) => {
    const action = needActions(deal.status,deal.myRole);
    const time = timeClause(deal);
    
  return (
    <Link 
    to={`/deals/${deal.deal_id}`}
    className="block border border-gray-300 bg-white rounded-lg px-6 py-5 flex flex-col transition-shadow hover:shadow-md duration-200">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="truncate text-sm font-semibold text-gray-900">
            {deal?.title}
          </h1>
          <div className="flex items-center gap-1 text-gray-500 text-[11px]">
            <span>{dealRef(deal.deal_id)}</span>
            <Dot size={10}/>
            {counterparty(deal)}
            <Dot size={10}/>
            {createdDate(deal.created_at)}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className=" font-semibold text-gray-900">
            ${deal?.amount}
          </p>
          <p className="px-1 rounded-full border border-gray-200 bg-gray-100 text-[11px] font-semibold text-gray-500">
            {deal?.status}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-300 w-full mt-3 mb-2"></div>
      <div className={action ? "text-gray-900 font-bold text-[11px]" : "text-gray-500 text-[11px]"}>
        <span>{pharse(deal.status,deal.myRole)}</span>
        {time && <span> {" . "}{time}</span>}
      </div>
      

    </Link>
  );
};
export default DealCard;
