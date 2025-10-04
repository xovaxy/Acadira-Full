import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import AdminLogin from "./pages/AdminLogin";
import Student from "./pages/Student";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Curriculum from "./pages/admin/Curriculum";
import Students from "./pages/admin/Students";
import Conversations from "./pages/admin/Conversations";
import Questions from "./pages/admin/Questions";
import Institution from "./pages/admin/Institution";
import SuperAdminLayout from "./components/superadmin/SuperAdminLayout";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import SuperAdminInstitutions from "./pages/superadmin/Institutions";
import SuperAdminUsers from "./pages/superadmin/Users";
import SuperAdminSubscriptions from "./pages/superadmin/Subscriptions";
import SuperAdminSettings from "./pages/superadmin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/student" element={<Student />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="curriculum" element={<Curriculum />} />
            <Route path="students" element={<Students />} />
            <Route path="conversations" element={<Conversations />} />
            <Route path="questions" element={<Questions />} />
            <Route path="institution" element={<Institution />} />
          </Route>
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="institutions" element={<SuperAdminInstitutions />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
