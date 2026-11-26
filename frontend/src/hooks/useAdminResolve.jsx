import { useApi  } from "./useApi";
import { useMutation,useQueryClient } from "@tanstack/react-query";
export function useAdminResolve(deal_id){
    const queryCleint = useQueryClient()
    const api = useApi();
    return useMutation({
        mutationFn: (action)=>
            api(`/api/deals/admin/${deal_id}/${action}`,{method:'POST',body:{}}),
        onSuccess: ()=>{
            queryCleint.invalidateQueries({queryKey:["disputes"]})
            queryCleint.invalidateQueries({queryKey:["deals"]})
            queryCleint.invalidateQueries({queryKey:["deal",deal_id]})
        }
    })
}