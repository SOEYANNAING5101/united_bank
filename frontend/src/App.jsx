import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TransferPage from "./pages/TransferPage";
import DashboardLayout from "./pages/DashboardLayout";
import AccountControl from "./pages/AccountControl";
import OpenAccount from "./pages/OpenNewAccount";
import AccountDetails from "./pages/AccountDetails";
import GlobalTransactions from "./pages/GlobalTransactions";
import LandingPage from "./pages/LandingPage";
import CustomSignIn from "./pages/CustomSignIn";
import CustomSignUp from "./pages/CustomSignUp";
import OnboardingForm from "./pages/OnboardingForm";
import UserProfilePage from "./pages/UserProfile";
import DealLists from './pages/DealLists'
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import ProtectedRoute from "./pages/components/ProtectedRoute";
import DealDetail from './pages/DealDetail'
import AdminDisputeLists from './pages/AdminDisputeLists'


import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/sign-in/*"
            element={
              <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <CustomSignIn />
              </div>
            }
          />
          <Route
            path="/sign-up/*"
            element={
              <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <CustomSignUp />
              </div>
            }
          />
          {/* Signed-in, no profile required */}
          <Route
            path="onboarding-form"
            element={
              <ProtectedRoute>
                <OnboardingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="transactions-all"
            element={
              <ProtectedRoute requireProfile>
                <GlobalTransactions />
              </ProtectedRoute>
            }
          />

          {/* Signed in + unverified*/}
          <Route
            element={
              <ProtectedRoute requireProfile>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* "/dispute-lists" */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transfer" element={<TransferPage />} />
            <Route path="deals" element={<DealLists />} />
            
            <Route path="deals/:id" element={<DealDetail />} />
            <Route path="account-control" element={<AccountControl />} />
            <Route path="user-profile" element={<UserProfilePage />} />
          </Route>
          <Route
          element={
              <ProtectedRoute requireAdmin>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
<Route path="dispute-lists" element={<AdminDisputeLists />} />
          </Route>

          {/* Sign in  + verified */}
          <Route
            element={
              <ProtectedRoute requireProfile>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="account-details/history/:account_id"
              element={<AccountDetails />}
            />
            <Route path="open-account" element={<OpenAccount />} />
          </Route>
          {/* Catch bad urls */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <SpeedInsights />
      <Analytics />
    </QueryClientProvider>
  );
}

export default App;
