import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LogIn from "./pages/LogIn";
import Dashboard from "./pages/Dashboard";
import TransferPage from "./pages/TransferPage";
import DashboardLayout from "./pages/DashboardLayout";
import AccountControl from "./pages/AccountControl";
import OpenAccount from "./pages/OpenNewAccount";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* LogIn Page Route */}
          <Route path="/" element={<LogIn />} />
          {/* Dashboard Route */}
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transfer" element={<TransferPage />} />
            <Route path="account-control" element={<AccountControl />} />
          </Route>
          {/* Catch bad urls */}
          <Route path="open-account" element={<OpenAccount />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
