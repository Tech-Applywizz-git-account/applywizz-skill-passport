// src/components/wizard/steps/SocialResumeStep.tsx
import { useEffect, useMemo, useState } from "react";
import { FileText, Upload } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

interface SocialResumePayload {
  resumeUrl?: string | null; // stored in DB (string URL or null)
  // extend later: github, linkedin, etc.
}

interface SocialResumeStepProps {
  onNext: () => void;        // navigate to /review
  onBack: () => void;
  updateFormData: (data: any) => void;
  /** ✅ New: hydrate from parent if available */
  initialSocialResume?: SocialResumePayload | null;
}

const BUCKET = "client-docs";
const isBucketPublic = true; // set false if your bucket is private (then we'll save signed URLs or just the storage path)

const SocialResumeStep = ({
  onNext,
  onBack,
  updateFormData,
  initialSocialResume,
}: SocialResumeStepProps) => {
  // UI state keeps a File while editing OR a string (existing URL) OR null
  const [resumeFile, setResumeFile] = useState<File | string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  const emptyPayload: SocialResumePayload = useMemo(() => ({ resumeUrl: null }), []);

  // ---- Storage upload helper ----
  // const uploadResumeIfNeeded = async (clientId: string, fileOrUrl: File | string | null) => {
  //   // If it's a string (existing URL) or null, just pass through.
  //   if (!fileOrUrl || typeof fileOrUrl === "string") return fileOrUrl ?? null;
  const uploadResumeIfNeeded = async (
    clientId: string,
    fileOrUrl: File | string | null
  ): Promise<string | null> => {
    // 1) null/undefined
    if (fileOrUrl == null) return null;

    const file = fileOrUrl as File;
    const safe = file.name.replace(/[^\w.\-]+/g, "_");
    const ext = safe.split(".").pop() || "pdf";
    const path = `resumes/${clientId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) {
      console.error("Resume upload error:", upErr);
      return null;
    }

    if (isBucketPublic) {
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return pub?.publicUrl ?? null;
    } else {
      const { data: signed, error: sErr } =
        await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
      if (sErr) {
        console.error("Signed URL error:", sErr);
        return null;
      }
      return signed?.signedUrl ?? null;
    }
  };

  // ---- Hydrate on mount: prefer parent; else fetch from DB ----
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        if (initialSocialResume) {
          if (!cancelled) {
            setResumeFile(initialSocialResume.resumeUrl ?? null); // keep existing URL in state
            setHydrating(false);
          }
          return;
        }

        const { data: userResp, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userResp?.user?.id) {
          if (!cancelled) {
            setResumeFile(null);
            setHydrating(false);
          }
          return;
        }
        const client_id = userResp.user.id;

        const { data, error } = await supabase
          .from("client_profiles")
          .select("social_resume")
          .eq("client_id", client_id)
          .maybeSingle();

        if (error) {
          console.error("Fetch social_resume error:", error);
          if (!cancelled) {
            setResumeFile(null);
            setHydrating(false);
          }
          return;
        }

        const dbPayload: SocialResumePayload = (data?.social_resume ?? emptyPayload) as SocialResumePayload;
        if (!cancelled) {
          setResumeFile(dbPayload?.resumeUrl ?? null);
          setHydrating(false);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setResumeFile(null);
          setHydrating(false);
        }
      }
    };

    hydrate();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Save & Next ----
  const handleSubmit = async () => {
    setSaving(true);
    try {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user?.id) {
        console.error("Auth error", userErr);
        alert("You must be logged in to save.");
        setSaving(false);
        return;
      }
      const client_id = userResp.user.id;

      // Upload only if a new File was selected; keep existing URL otherwise
      const resumeUrl = await uploadResumeIfNeeded(client_id, resumeFile);

      const payload: SocialResumePayload = { resumeUrl };
      console.log("Social & Resume payload (DB format) →", payload);

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          {
            client_id,
            social_resume: payload,
            progress_percent: 100,
            profile_status: "submitted",
          },
          { onConflict: "client_id" }
        );

      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save resume. Check console.");
        setSaving(false);
        return;
      }

      // keep wizard store for review screen
      updateFormData({ socialResume: payload });

      setSaving(false);
      onNext();
    } catch (e) {
      console.error(e);
      setSaving(false);
      alert("Unexpected error. Check console.");
    }
  };

  return (
    <StepWrapper
      title="Resume"
      icon={<FileText />}
      onNext={handleSubmit}
      onBack={() => {
        // ✅ persist current edits to parent on Back
        updateFormData({ socialResume: { resumeUrl: typeof resumeFile === "string" ? resumeFile : null } });
        onBack();
      }}
      nextLabel={saving ? "Saving..." : "Review"}
      nextDisabled={saving || hydrating}
      backDisabled={hydrating}
    >
      {hydrating ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-muted rounded" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Resume Upload</h3>

            {/* Existing uploaded resume (if any) */}
            {typeof resumeFile === "string" && resumeFile && (
              <div className="mb-4 text-sm">
                <Label className="mb-1 block">Current resume</Label>
                <a href={resumeFile} target="_blank" rel="noreferrer" className="underline break-all">
                  View current resume
                </a>
              </div>
            )}

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-1">Drag & Drop your resume here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>

              <Input
                type="file"
                accept=".pdf"
                id="resume-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setResumeFile(file); // replaces any existing URL only if a new file is chosen
                }}
              />

              {resumeFile instanceof File && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Selected: <span className="font-medium">{resumeFile.name}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </StepWrapper>
  );
};

export default SocialResumeStep;
