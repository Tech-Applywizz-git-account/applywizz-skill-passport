//src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Wizard from "./pages/Wizard";
import Review from "./pages/Review";
import NotFound from "./pages/NotFound";
import HRLogin from "./pages/HRLogin";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import SignUp from "./pages/SignUp";
import SetPassword from "./pages/SetPassword";
import { AuthProvider } from '@/context/AuthContext';
import HomeLayout from "@/pages/home/HomeLayout";
import Dashboard from "@/pages/home/Dashboard";
import MyDetails from "@/pages/home/MyDetails";
import SkillPassport from "@/pages/home/SkillPassport";
import CandidateOverview from "@/pages/CandidateOverview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<HRLogin />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/set-password" element={<SetPassword />} />
            <Route path="/wizard" element={<Wizard />} />
          <Route path="/review" element={<Review />} />
          <Route path="/home" element={<HomeLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="details" element={<MyDetails />} />
          {/* <Route path="passport" element={<SkillPassport />} /> */}
          <Route path="passport" element={<CandidateOverview />} />
        </Route>
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<JobDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
