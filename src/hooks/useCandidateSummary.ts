import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { mapProfileToCandidate, type RawClientProfile } from "@/lib/profileMapper";

export function useCandidateSummary(clientId: string) {
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("client_profiles")
          .select(`
            client_id,
            personal_info,
            education,
            certifications,
            internships,
            work_experience,
            projects,
            technical_profiles,
            assessments,
            social_resume
          `)
          .eq("client_id", clientId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          setCandidate(null);
        } else {
          const mapped = mapProfileToCandidate(data as unknown as RawClientProfile);
          if (!cancelled) setCandidate(mapped);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load candidate");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [clientId]);

  return { candidate, loading, error };
}
