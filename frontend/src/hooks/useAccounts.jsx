import { useQuery } from "@tanstack/react-query";
import {useApi} from './useApi'
import useProfileStatus from './useProfileStatus'
export function useAccounts(){
    const api = useApi();
    const { data: profileStatus } = useProfileStatus();
    return useQuery({
        queryKey:['dashboard'],
        queryFn:()=>api("/api/dashboard"),
        enabled: profileStatus?.isVerified === true,
        select:(res)=>(res?.data?.accounts ?? []).filter((a)=>a.status ==='ACTIVE')
    })
}