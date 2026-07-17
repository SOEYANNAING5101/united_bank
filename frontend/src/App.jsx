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
import KycProtectedRoute from "./pages/components/KycProtectedRoute";

import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Clerk Auth Routes */}
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
          <Route path="/" element={<LandingPage />} />

          {/* PROTECTED Dashboard Routes */}
          <Route
            element={
              <>
                <SignedIn>
                  <DashboardLayout />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transfer" element={<TransferPage />} />
            <Route path="account-control" element={<AccountControl />} />
            <Route path="user-profile" element={<UserProfilePage />} />
          </Route>
          {/* KYC-Protected Routes */}
          <Route
            element={
              <>
                <SignedIn>
                  <KycProtectedRoute />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          >
            <Route
              path="account-details/history/:account_id"
              element={<AccountDetails />}
            />
            <Route path="open-account" element={<OpenAccount />} />
          </Route>

          <Route path="transactions-all" element={<GlobalTransactions />} />

          <Route path="onboarding-form" element={<OnboardingForm />} />
          <Route path="user-profile" element={<UserProfilePage />} />

          {/* Catch bad urls */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
