// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/lib/supabase";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useToast } from "@/hooks/use-toast";

// export default function SetPassword() {
//   const [userEmail, setUserEmail] = useState<string | null>(null);
//   const [password, setPassword] = useState("");
//   const [confirm, setConfirm] = useState("");
//   const [saving, setSaving] = useState(false);
//   const { toast } = useToast();
//   const navigate = useNavigate();

//   // Ensure the user has a session (came from magic link)
//   useEffect(() => {
//     const load = async () => {
//       const { data } = await supabase.auth.getUser();
//       if (!data.user) {
//         // No session -> send to login
//         navigate("/login");
//         return;
//       }
//       setUserEmail(data.user.email ?? null);
//     };
//     load();
//   }, [navigate]);

//   const handleSetPassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!password || password !== confirm) {
//       toast({
//         title: "Passwords don’t match",
//         description: "Please re-enter your password.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setSaving(true);
//     const { error } = await supabase.auth.updateUser({ password });

//     setSaving(false);

//     if (error) {
//       toast({
//         title: "Couldn’t set password",
//         description: error.message,
//         variant: "destructive",
//       });
//       return;
//     }

//     toast({
//       title: "Password set!",
//       description: "You’re all set. Logging you in...",
//     });

//     // You can keep them logged in and go to /jobs,
//     // or force a re-login with email+password.
//     // Option A: keep session and go to jobs
//     navigate("/jobs");

//     // Option B: Sign out then navigate to login (uncomment if you prefer)
//     // await supabase.auth.signOut();
//     // navigate("/login");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-6">
//       <div className="w-full max-w-md space-y-6">
//         <div className="space-y-2 text-center">
//           <h1 className="text-3xl font-bold">Set your password</h1>
//           <p className="text-muted-foreground text-sm">
//             {userEmail ? `for ${userEmail}` : "Securing your account"}
//           </p>
//         </div>

//         <form onSubmit={handleSetPassword} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="password">New Password</Label>
//             <Input
//               id="password"
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               minLength={8}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="confirm">Confirm Password</Label>
//             <Input
//               id="confirm"
//               type="password"
//               placeholder="••••••••"
//               value={confirm}
//               onChange={(e) => setConfirm(e.target.value)}
//               minLength={8}
//               required
//             />
//           </div>

//           <Button type="submit" className="w-full" size="lg" disabled={saving}>
//             {saving ? "Saving..." : "Save password"}
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

/**
 * This page is the target of the magic-link redirect (email OTP).
 * After the user clicks the link, Supabase creates a session.
 * We then let the user set a password using supabase.auth.updateUser({ password }).
 */
export default function SetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // 1) Ensure we actually have a session created by the magic link.
  useEffect(() => {
    let mounted = true;

    (async () => {
      // Supabase v2 will parse the URL fragment and set the session automatically
      // on first call in the app lifecycle. We just check if a user exists.
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data?.user) {
        setChecking(false);
        toast({
          title: "Verification required",
          description:
            "We couldn't verify your session from the email link. Please request a new verification email.",
          variant: "destructive",
        });
        return;
      }

      setUserEmail(data.user.email ?? null);
      setChecking(false);
    })();

    // Also listen for late auth state changes (rare but safe).
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email ?? null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [toast]);

  // 2) Set password using the existing (magic-link) session, then upsert into your public.users table.
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      toast({
        title: "Weak password",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: "Passwords don’t match",
        description: "Please re-enter the same password.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    // Ensure we still have a user/session
    const { data: getUserRes } = await supabase.auth.getUser();
    const authedUser = getUserRes?.user;

    if (!authedUser) {
      setSaving(false);
      toast({
        title: "Session expired",
        description: "Please request a new verification link.",
        variant: "destructive",
      });
      return;
    }

    // A) Set the password
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    if (updateErr) {
      setSaving(false);
      toast({
        title: "Couldn’t set password",
        description: updateErr.message,
        variant: "destructive",
      });
      return;
    }

    // B) (Optional but recommended) Ensure a row exists in public.users for role-based routing
    // Defaults: role 'client', is_active = true
    try {
      const displayName =
        (authedUser.user_metadata as any)?.full_name ||
        (authedUser.email ? authedUser.email.split("@")[0] : "New User");

      // If your table has NOT NULL constraints (role, is_active), set them here.
      await supabase
        .from("users")
        .upsert(
          {
            id: authedUser.id,
            email: authedUser.email,
            name: displayName,
            role: "client", // make sure this value exists in rolepermissions
            is_active: true,
          },
          { onConflict: "id" }
        );
    } catch (e) {
      // ignore upsert errors silently; routing will still work if the row already exists
      console.warn("users upsert warning:", e);
    }

    setSaving(false);
    toast({ title: "Password set", description: "You can now log in to your account." });
    navigate("/login");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Verifying your email link…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Set your password</h1>
          <p className="text-muted-foreground text-sm">
            {userEmail ? `For ${userEmail}` : "Finalize your account to continue."}
          </p>
        </div>

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
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
              placeholder="********"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={saving}>
            {saving ? "Saving…" : "Save password"}
          </Button>

          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Back to login
          </Button>
        </form>
      </div>
    </div>
  );
}
