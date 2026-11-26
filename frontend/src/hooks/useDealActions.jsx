import {useApi} from './useApi'
import { useMutation,useQueryClient } from '@tanstack/react-query'
export function useDealAction(id){
    const api = useApi();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn:({action,body})=>
            api(`/api/deals/${id}/${action}`,
                {method:"POST",
                    body:body ??{}
                }
            ),
            onSuccess:()=>{
                queryClient.invalidateQueries({queryKey:["deal",id]})
                queryClient.invalidateQueries({queryKey:["deals"]})
                queryClient.invalidateQueries({queryKey:["dashboard"]})
            }
    })
}