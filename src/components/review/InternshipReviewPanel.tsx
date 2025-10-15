import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Plus, X, Save, Loader2, RefreshCw,
  Building2, Calendar, MapPin, FileText, Link as LinkIcon
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Textarea } from "@/components/ui/textarea"; // if you have one; otherwise use <Input>

type InternshipItem = {
  role: string;             // e.g., "Software Engineering Intern"
  company: string;          // e.g., "Google"
  start_date: string;       // "YYYY-MM-DD"
  end_date?: string;        // optional "YYYY-MM-DD"
  is_current?: boolean;     // optional toggle, when true end_date can be empty
  location?: string;        // optional "Hyderabad, IN / Remote"
  description?: string;     // optional summary/bullets
  proof_url?: string;       // optional: offer/LoR/letter URL
  skills?: string;          // optional comma-separated skills
};

const InternshipReviewPanel = () => {
  const emptyRow = useMemo<InternshipItem>(() => ({
    role: "",
    company: "",
    start_date: "",
    end_date: "",
    is_current: false,
    location: "",
    description: "",
    proof_url: "",
    skills: ""
  }), []);

  const [rows, setRows] = useState<InternshipItem[]>([emptyRow]);
  const [hydrating, setHydrating] = useState(true);
  const [saving, setSaving] = useState(false);

  // DB payload ⇄ UI mapping
  const toDbPayload = (items: InternshipItem[]) =>
    items.map((i) => ({
      role: i.role?.trim() ?? "",
      company: i.company?.trim() ?? "",
      start_date: i.start_date || null,
      end_date: i.is_current ? null : (i.end_date || null),
      is_current: !!i.is_current,
      location: i.location?.trim() || null,
      description: i.description?.trim() || null,
      proof_url: i.proof_url?.trim() || null,
      skills: i.skills?.trim() || null
    }));

  const fromDbPayload = (arr: any[]): InternshipItem[] => {
    if (!Array.isArray(arr)) return [emptyRow];
    const ui = arr.map((it) => ({
      role: it?.role ?? "",
      company: it?.company ?? "",
      start_date: it?.start_date ?? "",
      end_date: it?.end_date ?? "",
      is_current: !!it?.is_current,
      location: it?.location ?? "",
      description: it?.description ?? "",
      proof_url: it?.proof_url ?? "",
      skills: it?.skills ?? ""
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
        .select("internships")
        .eq("client_id", client_id)
        .maybeSingle();

      if (error) {
        console.error("Fetch internships error:", error);
        setRows([emptyRow]);
        setHydrating(false);
        return;
      }

      setRows(fromDbPayload(data?.internships ?? []));
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

  const handleChange = (index: number, field: keyof InternshipItem, value: string | boolean) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value as any };
      // if toggling is_current on, clear end_date for UX clarity
      if (field === "is_current" && value === true) {
        next[index].end_date = "";
      }
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
          { client_id, internships: payload }, // add progress_percent here if you track it
          { onConflict: "client_id" }
        );

      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save internships. Check console.");
        setSaving(false);
        return;
      }

      setSaving(false);
      hydrate(); // optional: reflect DB-normalized state
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
                {/* Role */}
                <div>
                  <Label>Role / Title</Label>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Software Engineering Intern"
                      value={row.role}
                      onChange={(e) => handleChange(index, "role", e.target.value)}
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <Label>Company</Label>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Google"
                      value={row.company}
                      onChange={(e) => handleChange(index, "company", e.target.value)}
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <Label>Start Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={row.start_date}
                      onChange={(e) => handleChange(index, "start_date", e.target.value)}
                    />
                  </div>
                </div>

                {/* End Date OR Current */}
                <div>
                  <Label>End Date</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="date"
                      value={row.is_current ? "" : (row.end_date ?? "")}
                      onChange={(e) => handleChange(index, "end_date", e.target.value)}
                      disabled={row.is_current}
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!row.is_current}
                        onChange={(e) => handleChange(index, "is_current", e.target.checked)}
                      />
                      Currently working
                    </label>
                  </div>
                </div>

                {/* Location (optional) */}
                <div>
                  <Label>Location (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Hyderabad, IN / Remote"
                      value={row.location ?? ""}
                      onChange={(e) => handleChange(index, "location", e.target.value)}
                    />
                  </div>
                </div>

                {/* Proof URL (optional) */}
                <div>
                  <Label>Proof URL (Offer/Letter) (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={row.proof_url ?? ""}
                      onChange={(e) => handleChange(index, "proof_url", e.target.value)}
                    />
                  </div>
                </div>

                {/* Description (optional) */}
                <div className="md:col-span-2">
                  <Label>Description (Optional)</Label>
                  {/* Swap Textarea for Input if you don't have a Textarea component */}
                  <Textarea
                    placeholder="What you built/owned, technologies used, impact..."
                    value={row.description ?? ""}
                    onChange={(e) => handleChange(index, "description", e.target.value)}
                  />
                </div>

                {/* Skills (optional) */}
                <div className="md:col-span-2">
                  <Label>Skills (Optional, comma-separated)</Label>
                  <Input
                    placeholder="React, TypeScript, PostgreSQL"
                    value={row.skills ?? ""}
                    onChange={(e) => handleChange(index, "skills", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addRow} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Internship
          </Button>
        </>
      )}
    </div>
  );
};

export default InternshipReviewPanel;
