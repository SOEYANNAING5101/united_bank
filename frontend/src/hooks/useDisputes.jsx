import {useApi} from './useApi'
import { useQuery } from '@tanstack/react-query'

export function useDisputes() {
    const api = useApi();
    return useQuery({
        queryKey:['disputes'],
        queryFn:()=>api('/api/deals/admin/disputes'),
        select:(res)=>res.deals??[]
    })
}