//src/pages/HRLogin.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";


const HRLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const COMPLETED_STATUS = "submitted"; // or "completed" based on your DB design

  const routeByRole = (role?: string | null, profileStatus?: string | null) => {
    if (role === "client") {
      // If no row yet, or not completed, send to wizard
      if (!profileStatus || profileStatus !== COMPLETED_STATUS) {
        navigate("/wizard");
        return;
      }
      // completed → home
      navigate("/home");
      return;
    }

    // default: HR/staff → jobs
    navigate("/jobs");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setLoading(false);
      const msg = error.message?.includes("Email not confirmed")
        ? "Email not confirmed. Please check your inbox/spam for the verification email."
        : error.message || "Invalid email or password.";
      toast({ title: "Login failed", description: msg, variant: "destructive" });
      return;
    }

    // Get the authed user id
    const userId = signInData.user?.id;
    if (!userId) {
      setLoading(false);
      toast({
        title: "Login issue",
        description: "Could not determine session user. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Fetch role from public.users for this user
    const { data: profile, error: profileErr } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr) {
      // If we can’t read the profile, still log in but go to default route
      console.error("Failed to load user profile:", profileErr);
    }

    let profileStatus: string | null = null;
    if (profile?.role === "client") {
      const { data: cp, error: cpErr } = await supabase
        .from("client_profiles")
        .select("profile_status")
        .eq("client_id", userId)
        .maybeSingle();

      if (cpErr) {
        console.error("Failed to load client profile_status:", cpErr);
      } else {
        profileStatus = cp?.profile_status ?? null;

        // Optional: if your DB uses "approved" as the terminal state, map it to "completed"
        // if (profileStatus === "approved") profileStatus = "completed";
      }
    }

    toast({ title: "Welcome back!", description: "Logging you in..." });
    setLoading(false);

    // Pass both role and profileStatus to router helper
    routeByRole(profile?.role ?? null, profileStatus);
  };

  //   toast({ title: "Welcome back!", description: "Logging you in..." });

  //   setLoading(false);
  //   routeByRole(profile?.role ?? null);
  // };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 to-primary/10 items-center justify-center p-12">
        <div className="max-w-md text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Wallet className="w-16 h-16 text-primary" strokeWidth={1.5} />
              <Sparkles className="w-6 h-6 text-primary absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Skill Wallet</h1>
          <p className="text-lg text-muted-foreground">
            HR Portal - Find the perfect match for your team
          </p>
          <div className="pt-8 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-semibold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI-Powered Matching</h3>
                <p className="text-sm text-muted-foreground">
                  Find candidates that truly fit your requirements
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-semibold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Verified Profiles</h3>
                <p className="text-sm text-muted-foreground">
                  All credentials verified and authenticated
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-semibold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Smart Pipeline</h3>
                <p className="text-sm text-muted-foreground">
                  Manage candidates seamlessly from screen to hire
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wallet className="w-8 h-8 text-primary" />
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">Skill Wallet</h2>
            <p className="text-muted-foreground">HR Portal</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Private access. All actions are logged.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hr@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">{/* remember me (optional) */}</div>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm"
                  onClick={() => navigate("/reset-password")}
                >
                  Forgot password?
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HRLogin;
