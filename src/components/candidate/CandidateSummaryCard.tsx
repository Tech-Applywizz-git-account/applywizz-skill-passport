// src/components/candidate/CandidateSummaryCard.tsx

import { useEffect, useState } from "react";
import { Mail, Phone, Award, MapPin, Clock, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MatchRing } from "./MatchRing";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { mapProfileToCandidate, type RawClientProfile, type CandidateLike } from "@/lib/profileMapper";

type QuickTag = { label: string; type: "positive" | "negative" };

interface CandidateSummaryCardProps {
  /** If omitted, will use the currently logged-in user's id */
  clientId?: string;
  /** Optional UI-only props */
  avatar?: string | null;
  matchScore?: number;
  badgeLevel?: string;
  quickTags?: QuickTag[];
}

/* helpers */
const formatDays = (v?: number | null) =>
  typeof v === "number" ? `${v} days` : "—";

const formatUsd = (n?: number | null) =>
  typeof n === "number"
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(n)
    : "—";

const initials = (name?: string) =>
  (name ?? "—")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "—";

export const CandidateSummaryCard = ({
  clientId: clientIdProp,
  avatar,
  matchScore = 0,
  badgeLevel = "No Badge",
  quickTags = [],
}: CandidateSummaryCardProps) => {
  const [candidate, setCandidate] = useState<CandidateLike | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(clientIdProp ?? null);

  // NEW: current user's role -> controls CTA visibility
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const isClient = currentRole === "client";

  useEffect(() => {
    setClientId(clientIdProp ?? null);
  }, [clientIdProp]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Determine client_id: prop or current user
        const { data: userResp, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw new Error(userErr.message);
        const authUserId = userResp?.user?.id ?? null;

        let idToUse = clientId ?? authUserId;
        if (!idToUse) throw new Error("No client_id to query.");
        const [probe, profile, roleRes] = await Promise.all([
          supabase
            .from("client_profiles")
            .select("client_id, personal_info")
            .eq("client_id", idToUse)
            .maybeSingle(),

          supabase
            .from("client_profiles")
            .select(
              `
              client_id,
              personal_info,
              education,
              certifications,
              internships,
              work_experience,
              projects,
              technical_profiles,
              assessment,
              social_resume
            `
            )
            .eq("client_id", idToUse)
            .maybeSingle(),

          authUserId
            ? supabase
                .from("users")
                .select("role")
                .eq("id", authUserId) // role of the LOGGED-IN user, not the viewed candidate
                .maybeSingle()
            : Promise.resolve({ data: null, error: null } as any),
        ]);

        if (probe.error) throw new Error(probe.error.message);
        if (!probe.data) throw new Error("No client profile found for this client_id.");

        if (profile.error) throw new Error(profile.error.message);
        if (!profile.data) throw new Error("No data returned from client_profiles.");

        const mapped = mapProfileToCandidate(profile.data as unknown as RawClientProfile);
        if (!cancelled) setCandidate(mapped);

        if (!cancelled) {
          if (roleRes.error) {
            // Non-fatal; default to showing CTAs unless we know it's a client
            console.warn("Role fetch error:", roleRes.error);
            setCurrentRole(null);
          } else {
            setCurrentRole(roleRes.data?.role ?? null);
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (error || !candidate) {
    return (
      <Card className="p-6 text-sm">
        <p className="text-muted-foreground">Couldn’t load candidate.</p>
        {error ? (
          <pre className="mt-2 text-xs whitespace-pre-wrap text-destructive">{error}</pre>
        ) : null}
      </Card>
    );
  }

  const tags = quickTags ?? [];

  return (
    <div className="bg-card rounded-xl border border-border shadow-elegant p-6 space-y-6 animate-fade-up">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center text-center space-y-3">
        <Avatar className="h-20 w-20 border-2 border-border">
          <AvatarImage src={avatar ?? ""} alt={candidate.name ?? "Candidate"} />
          <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
            {initials(candidate.name)}
          </AvatarFallback>
        </Avatar>

        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tighter">
            {candidate.name ?? "—"}
          </h1>
          <p className="text-sm text-secondary mt-1">
            {(candidate.role ?? "—")} @ {(candidate.company ?? "—")}
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-secondary mt-1">
            <MapPin className="h-3 w-3" />
            {candidate.location ?? "—"}
          </div>
        </div>
      </div>

      {/* Match Ring */}
      <div className="flex justify-center">
        <MatchRing score={matchScore} />
      </div>

      {/* Badge Level */}
      <div className="flex justify-center">
        <Badge className="gap-2 px-3 py-1 bg-warning text-warning-foreground font-semibold">
          <Award className="h-4 w-4" />
          {badgeLevel}
        </Badge>
      </div>

      {/* Key Info Grid */}
      <div className="grid grid-cols-1 gap-3 text-sm">
        <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
          <span className="text-secondary flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Availability
          </span>
          <span className="font-medium text-foreground">
            {formatDays(candidate.availability ?? null)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
          <span className="text-secondary flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Expected Salary
          </span>
          <span className="font-medium text-foreground">
            {formatUsd(candidate.expectedSalary ?? null)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
          <span className="text-secondary flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Notice Period
          </span>
          <span className="font-medium text-foreground">
            {formatDays((candidate.noticePeriod as number | null) ?? null)}
          </span>
        </div>
      </div>

      {/* Trust Band */}
      <div className="p-3 bg-success/20 border border-success rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-success-foreground font-medium">✅ Admin Verified</span>
        </div>
      </div>

      {/* Quick Tags */}
      <div>
        <p className="text-xs text-secondary mb-2 font-medium">Key Signals</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className={`text-xs ${
                tag.type === "positive"
                  ? "border-success text-success-foreground bg-success/10"
                  : "border-error text-error-foreground bg-error/10"
              }`}
            >
              {tag.type === "positive" ? "+" : "–"}
              {tag.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Contact Buttons */}
       <div className="grid grid-cols-2 gap-3">
         <Button
          asChild
          variant="outline"
          className="gap-2 hover:bg-info/10 border-info/30"
          disabled={!candidate.email}
          title={candidate.email ? `Email ${candidate.email}` : "No email"}
        >
          <a href={candidate.email ? `mailto:${candidate.email}` : undefined}>
            <Mail className="h-4 w-4" />
            Email
          </a>
        </Button>

        <Button
          asChild
          variant="outline"
          className="gap-2 hover:bg-info/10 border-info/30"
          disabled={!candidate.phone}
          title={candidate.phone ? `Call ${candidate.phone}` : "No phone"}
        >
          <a href={candidate.phone ? `tel:${candidate.phone}` : undefined}>
            <Phone className="h-4 w-4" />
            Call
          </a>
        </Button>
      </div>


      {/* CTA Stack — hidden for clients */}
      {!isClient && (
        <div className="space-y-2 pt-2">
          <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
            Shortlist Candidate
          </Button>
          <Button variant="outline" className="w-full border-error text-error hover:bg-error/10">
            Reject
          </Button>
          <Button variant="outline" className="w-full gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Interview
          </Button>
        </div>
      )}
    </div>
  );
};
