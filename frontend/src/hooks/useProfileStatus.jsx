import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";


const useProfileStatus = () => {
  const { getToken } = useAuth();

  const fetchProfileStatus = async () => {
    const token = await getToken();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const response = await fetch(`${baseUrl}/api/profile/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  };

  return useQuery({
    queryKey: ["profileStatus"],
    queryFn: fetchProfileStatus,
    retry: 1,
    staleTime : 1000 * 60 * 5
  });
};
export default useProfileStatus;
