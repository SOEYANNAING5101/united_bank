import {useApi} from './useApi';
import {useMutation,useQueryClient} from '@tanstack/react-query'
export function useCreateDeal(){
    const api = useApi();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn:(body)=>api('/api/deals',
            {method:'POST',body}
        ),
        onSuccess:()=>queryClient.invalidateQueries({queryKey:['deals']})
    })
}