// src/pages/home/HomeLayout.tsx

import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, UserCircle2, BadgeCheck, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const SidebarLink = ({
  to, icon: Icon, children,
}: { to: string; icon: any; children: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )
    }
    end
  >
    <Icon className="w-4 h-4" />
    <span>{children}</span>
  </NavLink>
);

const HomeLayout = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      alert("Failed to logout, please try again.");
    } else {
      navigate("/"); // redirect to login
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen((o) => !o)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Skill Wallet</h1>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
          {/* Sidebar */}
          <aside
            className={cn(
              "border rounded-2xl p-3 h-fit md:h-[calc(100vh-7rem)] md:sticky md:top-8 bg-card",
              open ? "block" : "hidden md:block"
            )}
          >
            <nav className="flex flex-col justify-between h-full">
              <div className="flex flex-col gap-1">
                <SidebarLink to="/home" icon={LayoutDashboard}>
                  My Dashboard
                </SidebarLink>
                <SidebarLink to="/home/details" icon={UserCircle2}>
                  My Details
                </SidebarLink>
                <SidebarLink to="/home/passport" icon={BadgeCheck}>
                  Skill Passport
                </SidebarLink>
              </div>

              <Button
                variant="ghost"
                className="mt-6 text-muted-foreground hover:text-destructive justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </nav>
          </aside>

          {/* Main content */}
          <main className="min-h-[60vh]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;