import { useOutletContext } from "react-router-dom";

export const usePageState = () => {
  const context = useOutletContext() || {};
  const { dashboardData, error, isLoading, profileStatus } = context;
  const isVerified = profileStatus?.isVerified === true;
  const accounts = dashboardData?.data?.accounts || [];
  let state = "READY";
  if (profileStatus === undefined || isLoading || (isVerified && !dashboardData && !error)) {
    state = "LOADING";
  } else if (!isVerified) {
    state = "UNVERIFIED";
  } else if (accounts.length === 0) {
    state = "EMPTY";
  }
  return {
    state,
    isVerified,
    accounts,
    dashboardData,
    error
  }
};
