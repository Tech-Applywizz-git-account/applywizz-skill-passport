import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X, Save, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

type EducationItem = {
  level: string;        // "high-school" | "bachelors" | "masters" | "phd" | ""
  institution: string;
  year: string;
  major: string;
  grade?: string | null;
};

const levelOptions = [
  { value: "high-school", label: "High School" },
  { value: "bachelors",   label: "Bachelor's Degree" },
  { value: "masters",     label: "Master's Degree" },
  { value: "phd",         label: "PhD" },
];

const labelByValue = (v: string) => levelOptions.find(o => o.value === v)?.label ?? "";
const valueByLabel = (lbl: string) =>
  levelOptions.find(o => o.label.toLowerCase() === (lbl ?? "").toLowerCase())?.value ?? "";

const EducationReviewPanel = () => {
  const emptyRow = useMemo<EducationItem>(() => ({
    level: "", institution: "", year: "", major: "", grade: ""
  }), []);

  const [rows, setRows] = useState<EducationItem[]>([emptyRow]);
  const [hydrating, setHydrating] = useState(true);
  const [saving, setSaving] = useState(false);

  const toDbPayload = (items: EducationItem[]) =>
    items.map(ed => ({
      education_level:    labelByValue(ed.level),
      institute_name:     ed.institution?.trim() ?? "",
      year_of_completion: ed.year?.trim() ?? "",
      major_study:        ed.major?.trim() ?? "",
      grade:              ed.grade && ed.grade.trim() !== "" ? ed.grade.trim() : null
    }));

  const fromDbPayload = (arr: any[]): EducationItem[] => {
    if (!Array.isArray(arr)) return [emptyRow];
    const ui = arr.map((it) => ({
      level:       valueByLabel(it?.education_level ?? ""),
      institution: it?.institute_name ?? "",
      year:        it?.year_of_completion ?? "",
      major:       it?.major_study ?? "",
      grade:       it?.grade ?? ""
    }));
    return ui.length ? ui : [emptyRow];
  };

  const hydrate = async () => {
    setHydrating(true);
    try {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user?.id) {
        setRows([emptyRow]);
        setHydrating(false);
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
        setRows([emptyRow]);
        setHydrating(false);
        return;
      }

      setRows(fromDbPayload(data?.education ?? []));
      setHydrating(false);
    } catch (e) {
      console.error(e);
      setRows([emptyRow]);
      setHydrating(false);
    }
  };

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (index: number, field: keyof EducationItem, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addRow = () => setRows((prev) => [...prev, { ...emptyRow }]);
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user?.id) {
        alert("You must be logged in to save.");
        setSaving(false);
        return;
      }
      const client_id = userResp.user.id;

      const payload = toDbPayload(rows);

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          { client_id, education: payload }, // keep existing columns untouched if you have merge logic on DB
          { onConflict: "client_id" }
        );

      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save education. Check console.");
        setSaving(false);
        return;
      }

      setSaving(false);
      // Optional: re-hydrate to reflect DB-normalized state
      hydrate();
    } catch (e) {
      console.error(e);
      alert("Unexpected error. Check console.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={hydrate} disabled={hydrating || saving}>
          {hydrating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          {hydrating ? "Refreshing..." : "Refresh"}
        </Button>

        <Button onClick={handleSave} disabled={saving || hydrating}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {hydrating ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      ) : (
        <>
          {rows.map((row, index) => (
            <div key={index} className="border border-border rounded-lg p-6 relative space-y-4">
              {rows.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeRow(index)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Level */}
                <div>
                  <Label>Education Level</Label>
                  <Select value={row.level} onValueChange={(v) => handleChange(index, "level", v)}>
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

                {/* Institution */}
                <div>
                  <Label>Institution Name</Label>
                  <Input
                    placeholder="University name"
                    value={row.institution}
                    onChange={(e) => handleChange(index, "institution", e.target.value)}
                  />
                </div>

                {/* Year */}
                <div>
                  <Label>Year of Completion</Label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={row.year}
                    onChange={(e) => handleChange(index, "year", e.target.value)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  />
                </div>

                {/* Major */}
                <div>
                  <Label>Major/Field of Study</Label>
                  <Input
                    placeholder="Computer Science"
                    value={row.major}
                    onChange={(e) => handleChange(index, "major", e.target.value)}
                  />
                </div>

                {/* Grade */}
                <div className="md:col-span-2">
                  <Label>Grade/CGPA (Optional)</Label>
                  <Input
                    placeholder="3.8 / 4.0"
                    value={row.grade ?? ""}
                    onChange={(e) => handleChange(index, "grade", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addRow} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Education
          </Button>
        </>
      )}
    </div>
  );
};

export default EducationReviewPanel;
