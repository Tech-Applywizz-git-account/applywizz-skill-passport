import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSending(true);
    const redirectTo = `${window.location.origin}/set-password`;

    // This sends a magic-link verification email.
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirectTo },
    });

    setSending(false);

    if (error) {
      toast({
        title: "Couldn’t send email",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Verification sent",
      description: "Check your inbox and click the link to continue.",
    });

    // (Optional) take them back to login with a tip
    // navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email to receive a verification link.
          </p>
        </div>

        <form onSubmit={handleSendVerification} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={sending}>
            {sending ? "Sending..." : "Send verification"}
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
