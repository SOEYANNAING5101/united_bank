import { useApi } from './useApi';
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export function useDeals(filters) {
    const api = useApi();
    const {page=1,role='all',status='all',search="",sort="recent"}=filters;

    const query = useQuery({
        queryKey:["deals",page,status,search,sort,role],
        queryFn: ()=>{
            const qs = new URLSearchParams({role,status,sort,page:String(page)});
             if(search) qs.set("search",search);
             return api(`/api/deals?${qs}`)
        },
        placeholderData:keepPreviousData
    });
    return {
        deals:query.data?.deals ?? [],
        page:query.data?.page ?? page,
        totalPages:query.data?.totalPages ?? 0,
        total:query.data?.total ?? 0,
        isLoading:query.isLoading,
        isError:query.isError
    };
}
