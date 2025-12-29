import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import JobListings from "@/components/JobListings";
import DashboardHome from "@/components/DashboardHome";
import ResumeRanker from "@/components/ResumeRanker";
import MyRankings from "@/components/MyRankings";
import Sourcing from "@/components/Sourcing";
import Support from "@/components/Support";
import Profile from "@/components/Profile";
import { cn } from "@/lib/utils";

const Jobs = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome />;
      case "resume-ranker":
        return <ResumeRanker />;
      case "my-rankings":
        return <MyRankings setActiveTab={setActiveTab} />;
      case "job-listings":
        return <JobListings />;
      case "sourcing":
        return <Sourcing />;
      case "support":
        return <Support />;
      case "profile":
        return <Profile />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-300",
        isCollapsed ? "pl-16" : "pl-64"
      )}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Jobs;
