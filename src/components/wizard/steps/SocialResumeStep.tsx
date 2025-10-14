

// src/components/wizard/steps/SocialResumeStep.tsx
import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

interface SocialResumeStepProps {
  onNext: () => void;        // should navigate to /review in your Wizard flow
  onBack: () => void;
  updateFormData: (data: any) => void;
}

const BUCKET = "client-docs";
const isBucketPublic = true; // set false if your bucket is private (then we return a signed URL)

const SocialResumeStep = ({ onNext, onBack, updateFormData }: SocialResumeStepProps) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const uploadResume = async (clientId: string, file: File | null) => {
    if (!file) return null;
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

      // 1) Upload resume (optional)
      const resumeUrl = await uploadResume(client_id, resumeFile);

      // 2) Build payload object and log it
      const payload = { resumeUrl }; // extend later with social links if needed
      console.log("Social & Resume payload (DB format) →", payload);

      // 3) Save into client_profiles.social_resume
      // --- OPTION A: plain UPSERT
      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          { client_id, social_resume: payload, progress_percent: 100, profile_status: "submitted" },
          { onConflict: "client_id" }
        );
      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save resume. Check console.");
        setSaving(false);
        return;
      }

      // 4) Keep wizard state (optional, useful for review screen)
      updateFormData({ socialResume: payload });

      setSaving(false);
      onNext(); // your Wizard should route to /review
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
      onBack={onBack}
      nextLabel={saving ? "Saving..." : "Review"}  // 👈 label changed
      nextDisabled={saving}
    >
      <div className="space-y-6">
        <div className="border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Resume Upload</h3>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium mb-1">Drag & Drop your resume here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>

            <Input
              type="file"
              accept=".pdf"
              id="resume-upload"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            />

            {resumeFile && (
              <p className="mt-3 text-sm text-muted-foreground">
                Selected: <span className="font-medium">{resumeFile.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </StepWrapper>
  );
};

export default SocialResumeStep;
