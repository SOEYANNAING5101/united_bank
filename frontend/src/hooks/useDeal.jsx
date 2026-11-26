import {useApi} from './useApi'
import { useQuery } from '@tanstack/react-query'
export function useDeal(id){
    const api = useApi();
    return useQuery({
        queryKey:["deal",id],
        queryFn:()=>api(`/api/deals/${id}`),
        enabled:!!id
    })
}