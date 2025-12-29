import { LayoutDashboard, FileText, Trophy, Briefcase, Users, HelpCircle, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

const DashboardSidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }: SidebarProps) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout error:", error.message);
        } else {
            navigate("/");
        }
    };

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "resume-ranker", label: "Resume Ranker", icon: FileText },
        { id: "my-rankings", label: "My Rankings", icon: Trophy },
        { id: "job-listings", label: "Job Listings", icon: Briefcase },
        { id: "sourcing", label: "Sourcing", icon: Users },
        { id: "support", label: "Support", icon: HelpCircle },
        { id: "profile", label: "Profile", icon: User },
    ];

    return (
        <div className={cn(
            "bg-white border-r h-screen flex flex-col fixed left-0 top-0 z-50 transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
        )}>
            {/* Header */}
            <div className={cn(
                "p-6 flex items-center",
                isCollapsed ? "justify-center" : "justify-between"
            )}>
                {!isCollapsed && (
                    <h1 className="text-2xl font-bold text-primary">Applywizz<span className="text-blue-500">.</span></h1>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 border rounded-full shrink-0"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        title={isCollapsed ? item.label : ""}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                            isCollapsed ? "justify-center" : "",
                            activeTab === item.id
                                ? "bg-[#008ba3] text-white"
                                : "text-gray-600 hover:bg-gray-100"
                        )}
                    >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t space-y-4">
                <button
                    onClick={handleLogout}
                    title={isCollapsed ? "Logout" : ""}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default DashboardSidebar;
