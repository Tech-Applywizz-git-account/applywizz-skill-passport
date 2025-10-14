import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SetPassword() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Ensure the user has a session (came from magic link)
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        // No session -> send to login
        navigate("/login");
        return;
      }
      setUserEmail(data.user.email ?? null);
    };
    load();
  }, [navigate]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirm) {
      toast({
        title: "Passwords don’t match",
        description: "Please re-enter your password.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });

    setSaving(false);

    if (error) {
      toast({
        title: "Couldn’t set password",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password set!",
      description: "You’re all set. Logging you in...",
    });

    // You can keep them logged in and go to /jobs,
    // or force a re-login with email+password.
    // Option A: keep session and go to jobs
    navigate("/jobs");

    // Option B: Sign out then navigate to login (uncomment if you prefer)
    // await supabase.auth.signOut();
    // navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Set your password</h1>
          <p className="text-muted-foreground text-sm">
            {userEmail ? `for ${userEmail}` : "Securing your account"}
          </p>
        </div>

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={saving}>
            {saving ? "Saving..." : "Save password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
