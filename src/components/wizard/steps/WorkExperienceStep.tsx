// src/components/wizard/steps/WorkExperienceStep.tsx
import { useState } from "react";
import { Building2, Plus, X } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface WorkItem {
  company: string;
  role: string;
  location: string;
  from: string;     // YYYY-MM
  to: string;       // YYYY-MM
  projects: string; // optional text
  documents: (File | string)[] | null; // files while editing; URLs saved; or null
}

interface WorkExperienceStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
}

const BUCKET = "client-docs";
const isBucketPublic = true; // set false if your bucket is private (then we create signed URLs)

const WorkExperienceStep = ({ onNext, onBack, updateFormData }: WorkExperienceStepProps) => {
  const [experiences, setExperiences] = useState<WorkItem[]>([
    { company: "", role: "", location: "", from: "", to: "", projects: "", documents: null }
  ]);
  const [saving, setSaving] = useState(false);

  const handleChange = <K extends keyof WorkItem>(i: number, key: K, value: WorkItem[K]) => {
    setExperiences(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: value };
      return next;
    });
  };

  const handleFilesChange = (i: number, files: FileList | null) => {
    setExperiences(prev => {
      const next = [...prev];
      next[i] = { ...next[i], documents: files ? Array.from(files) : null };
      return next;
    });
  };

  const addExperience = () =>
    setExperiences(prev => [...prev, { company: "", role: "", location: "", from: "", to: "", projects: "", documents: null }]);

  const removeExperience = (index: number) =>
    setExperiences(prev => prev.filter((_, i) => i !== index));

  // Upload all files for one experience and return array of URLs (or nulls)
  const uploadDocsIfNeeded = async (clientId: string, item: WorkItem, idx: number) => {
    if (!item.documents || item.documents.length === 0) return [];
    const urls: (string | null)[] = [];

    for (let f = 0; f < item.documents.length; f++) {
      const doc = item.documents[f];
      if (typeof doc === "string") { urls.push(doc); continue; } // already URL
      const safe = doc.name.replace(/[^\w.\-]+/g, "_");
      const ext = safe.split(".").pop() || "pdf";
      const path = `work-experience/${clientId}/${Date.now()}_${idx}_${f}.${ext}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, doc, {
        cacheControl: "3600",
        upsert: false
      });
      if (upErr) { console.error("Storage upload error:", upErr); urls.push(null); continue; }

      if (isBucketPublic) {
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        urls.push(pub?.publicUrl ?? null);
      } else {
        const { data: signed, error: sErr } =
          await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
        if (sErr) { console.error("Signed URL error:", sErr); urls.push(null); }
        else { urls.push(signed?.signedUrl ?? null); }
      }
    }
    return urls;
  };

  // UI -> DB payload
  const toDbPayload = (items: WorkItem[], uploadedDocs: (string | null)[][]) =>
    items.map((it, i) => ({
      company: it.company,
      role: it.role,
      location: it.location,
      from: it.from,
      to: it.to,
      projects: it.projects || "",
      documents: uploadedDocs[i]?.filter(Boolean) ?? [] // array of URLs
    }));

  const handleSubmit = async () => {
    // 1) sync wizard state
    updateFormData({ workExperience: experiences });

    // 2) log UI state
    console.log("Work Experience (UI state) →", experiences);

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

      // 3) upload files for each experience
      const uploadedPerExp: (string | null)[][] = [];
      for (let i = 0; i < experiences.length; i++) {
        uploadedPerExp.push(await uploadDocsIfNeeded(client_id, experiences[i], i));
      }

      // 4) payload
      const payload = toDbPayload(experiences, uploadedPerExp);

      // 5) log DB payload
      console.log("Work Experience payload (DB format) →", payload);

      // 6) persist
      // --- OPTION A: simple UPSERT (no RPC)
      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          { client_id, work_experience: payload, progress_percent: 56 }, // sample progress
          { onConflict: "client_id" }
        );
      if (upsertErr) { console.error("Upsert error:", upsertErr); alert("Failed to save work experience."); setSaving(false); return; }

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
      title="Work Experience"
      icon={<Building2 />}
      onNext={handleSubmit}
      onBack={onBack}
      nextLabel={saving ? "Saving..." : "Next"}
      nextDisabled={saving}
    >
      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <div key={index} className="border border-border rounded-lg p-6 relative">
            {experiences.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeExperience(index)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input placeholder="Tech Solutions Ltd."
                  value={exp.company} onChange={(e) => handleChange(index, "company", e.target.value)} />
              </div>
              <div>
                <Label>Role/Designation</Label>
                <Input placeholder="Senior Software Engineer"
                  value={exp.role} onChange={(e) => handleChange(index, "role", e.target.value)} />
              </div>
              <div>
                <Label>Location</Label>
                <Input placeholder="San Francisco, CA"
                  value={exp.location} onChange={(e) => handleChange(index, "location", e.target.value)} />
              </div>
              <div>
                <Label>From</Label>
                <Input type="month" value={exp.from}
                  onChange={(e) => handleChange(index, "from", e.target.value)} />
              </div>
              <div>
                <Label>To</Label>
                <Input type="month" value={exp.to}
                  onChange={(e) => handleChange(index, "to", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Key Projects (Optional)</Label>
                <Textarea rows={4} placeholder="Describe major projects and achievements..."
                  value={exp.projects} onChange={(e) => handleChange(index, "projects", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Documents (Offer/Relieving Letter, Payslips)</Label>
                <Input type="file" accept=".pdf" multiple
                  onChange={(e) => handleFilesChange(index, e.target.files)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addExperience} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Another Experience
      </Button>
    </StepWrapper>
  );
};

export default WorkExperienceStep;
