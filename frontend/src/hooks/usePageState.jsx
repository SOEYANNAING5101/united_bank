import { useOutletContext } from "react-router-dom";

export const usePageState = () => {
  const context = useOutletContext() || {};
  const { dashboardData, error, isLoading, profileStatus } = context;
  if (profileStatus === undefined) {
    return {
      state: "LOADING",
      isVerified: false,
      accounts: [],
      dashboardData: null,
      error: null,
    };
  }
  const isVerified = profileStatus?.isVerified === true;
  if (!isVerified) {
    return {
      state: "UNVERIFIED",
      isVerified,
      accounts: [],
      dashboardData: null,
      error: null,
    };
  }
  if (isLoading || (isVerified && !dashboardData && !error)) {
    return {
      state: "LOADING",
      isVerified,
      accounts: [],
      dashboardData: null,
      error: null,
    };
  }
  const accounts = dashboardData?.data?.accounts || [];
  if (accounts.length === 0) {
    return {
      state: "EMPTY",
      isVerified,
      accounts,
      dashboardData,
      error,
    };
  }
  return {
    state: "READY",
    isVerified,
    accounts,
    dashboardData,
  };
};
