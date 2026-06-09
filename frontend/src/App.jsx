import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LogIn from "./pages/LogIn";
import Dashboard from "./pages/Dashboard";
import TransferPage from "./pages/TransferPage";
import DashboardLayout from "./pages/DashboardLayout";
import AccountControl from "./pages/AccountControl";
import OpenAccount from "./pages/OpenNewAccount";
import AccountDetails  from "./pages/AccountDetails";
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
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <SignIn routing="path" path="/sign-in" />
              </div>
            }
          />
          <Route
            path="/sign-up/*"
            element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <SignUp routing="path" path="/sign-up" />
              </div>
            }
          />

          {/* Root Route: Smart Redirect */}
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <Navigate to="/dashboard" />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" />
                </SignedOut>
              </>
            }
          />

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
            <Route path="account-details" element={<AccountDetails />} />
            <Route path="transfer" element={<TransferPage />} />
            <Route path="account-control" element={<AccountControl />} />

            {/* I moved this inside the layout so it keeps your sidebar/navbar! */}
          </Route>
          <Route path="open-account" element={<OpenAccount />} />
          {/* Catch bad urls */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
