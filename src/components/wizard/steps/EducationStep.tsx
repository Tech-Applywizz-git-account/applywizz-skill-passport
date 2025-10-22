// src/components/wizard/steps/EducationStep.tsx
import { useEffect, useMemo, useState } from "react";
import { GraduationCap, Plus, X } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { uploadToClientDocs } from "@/lib/upload";

interface EducationItem {
  level: string; // "high-school" | "bachelors" | "masters" | "phd" | ""
  institution: string;
  year: string;
  major: string;
  grade?: string | null;
  certificate?: string | null;
  transcript?: string | null;
}

interface EducationStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
  // ✅ NEW: parent can pass previously-filled data so going back is instant/no fetch
  initialEducations?: EducationItem[] | null;
}

const levelOptions = [
  { value: "high-school", label: "High School" },
  { value: "inter",   label: "Intermediate" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelors",    label: "Bachelor's Degree" },
  { value: "masters",      label: "Master's Degree" },
  { value: "phd",          label: "PhD" },
];

// helpers to map label<->value
const labelByValue = (v: string) => levelOptions.find(o => o.value === v)?.label ?? "";
const valueByLabel = (lbl: string) =>
  levelOptions.find(o => o.label.toLowerCase() === (lbl ?? "").toLowerCase())?.value ?? "";

const EducationStep = ({ onNext, onBack, updateFormData, initialEducations }: EducationStepProps) => {
  const emptyRow: EducationItem = useMemo(() => ({
    level: "", institution: "", year: "", major: "", grade: "", certificate: null, transcript: null
  }), []);

  const [educations, setEducations] = useState<EducationItem[]>([emptyRow]);
  const [saving, setSaving] = useState(false);
  const [hydrating, setHydrating] = useState(true); // ✅ show skeleton/disable while loading

  // Build DB payload
  const toDbPayload = (items: EducationItem[]) =>
    items.map(ed => ({
      education_level:    labelByValue(ed.level),   // store human label
      institute_name:     ed.institution,
      year_of_completion: ed.year,
      major_study:        ed.major,
      grade:              ed.grade && ed.grade.trim() !== "" ? ed.grade : null,
    }));

  // Convert DB -> UI
  const fromDbPayload = (arr: any[]): EducationItem[] => {
    if (!Array.isArray(arr)) return [emptyRow];
    return arr.map((it: any) => ({
      level:       valueByLabel(it?.education_level ?? ""),
      institution: it?.institute_name ?? "",
      year:        it?.year_of_completion ?? "",
      major:       it?.major_study ?? "",
      grade:       it?.grade ?? "",
      certificate: null,
      transcript:  null,
    }));
  };

  // ✅ Hydrate on mount
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        // 1) If parent provided data (best path), use it.
        if (initialEducations && initialEducations.length) {
          if (!cancelled) {
            setEducations(initialEducations);
            setHydrating(false);
          }
          return;
        }

        // 2) Else try fetching from Supabase
        const { data: userResp, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userResp?.user?.id) {
          if (!cancelled) {
            setEducations([emptyRow]);
            setHydrating(false);
          }
          return;
        }

        const client_id = userResp.user.id;

        const { data, error } = await supabase
          .from("client_profiles")
          .select("education")
          .eq("client_id", client_id)
          .maybeSingle();

        if (error) {
          console.error("Fetch education error:", error);
          if (!cancelled) {
            setEducations([emptyRow]);
            setHydrating(false);
          }
          return;
        }

        const ui = fromDbPayload(data?.education ?? []);
        if (!cancelled) {
          setEducations(ui.length ? ui : [emptyRow]);
          setHydrating(false);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setEducations([emptyRow]);
          setHydrating(false);
        }
      }
    };

    hydrate();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Text input handler
  const handleChange = (index: number, field: keyof EducationItem, value: string) => {
    setEducations(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Select handler
  const handleLevelChange = (index: number, value: string) => {
    setEducations(prev => {
      const next = [...prev];
      next[index] = { ...next[index], level: value };
      return next;
    });
  };

  const addEducation = () => setEducations(prev => [...prev, { ...emptyRow }]);
  const removeEducation = (index: number) => setEducations(prev => prev.filter((_, i) => i !== index));

  // Save & Next
  const handleSubmit = async () => {
    updateFormData({ education: educations }); // lift into wizard store (so back is instant next time)
    const payload = toDbPayload(educations);

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

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          { client_id, education: payload, progress_percent: 14 },
          { onConflict: "client_id" }
        );

      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save education. Check console.");
        setSaving(false);
        return;
      }

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
      title="Education"
      icon={<GraduationCap />}
      onNext={handleSubmit}
      onBack={() => {
        // lift current edits so parent remembers them when we come back
        updateFormData({ education: educations });
        onBack();
      }}
      nextLabel={saving ? "Saving..." : "Next"}
      nextDisabled={saving || hydrating}
      backDisabled={hydrating}
    >
      {hydrating ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      ) : (
        <>
          {educations.map((edu, index) => (
            <div key={index} className="border border-border rounded-lg p-6 relative space-y-4">
              {educations.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeEducation(index)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Education Level</Label>
                  <Select value={edu.level} onValueChange={(v) => handleLevelChange(index, v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Institution Name</Label>
                  <Input
                    placeholder="University name"
                    value={edu.institution}
                    onChange={(e) => handleChange(index, "institution", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Year of Completion</Label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={edu.year}
                    onChange={(e) => handleChange(index, "year", e.target.value)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  />
                </div>

                <div>
                  <Label>Major/Field of Study</Label>
                  <Input
                    placeholder="Computer Science"
                    value={edu.major}
                    onChange={(e) => handleChange(index, "major", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Grade/CGPA (Optional)</Label>
                  <Input
                    placeholder="3.8 / 4.0"
                    value={edu.grade ?? ""}
                    onChange={(e) => handleChange(index, "grade", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addEducation} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Education
          </Button>
        </>
      )}
    </StepWrapper>
  );
};

export default EducationStep;
