import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useApi } from './useApi'


const useProfileStatus = () => {
  const api = useApi();
  const {isLoaded,isSignedIn} = useAuth()

  return useQuery({
    queryKey: ["profileStatus"],
    queryFn: ()=>api("/api/profile/status"),
    enabled:isLoaded && isSignedIn,
    retry: 1,
    staleTime : 1000 * 60 * 5
  });
};
export default useProfileStatus;
