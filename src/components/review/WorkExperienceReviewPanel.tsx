import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Save, Loader2, RefreshCw, Paperclip } from "lucide-react";
import { supabase } from "@/lib/supabase";

type WorkItem = {
  company: string;
  role: string;
  location: string;
  from: string;            // YYYY-MM
  to: string;              // YYYY-MM
  projects: string;        // optional
  documents: (File | string)[] | null; // URLs (string) saved; File while editing
};

const BUCKET = "client-docs";
const isBucketPublic = true; // set false if private bucket (uses signed URLs)

const WorkExperienceReviewPanel = () => {
  const emptyRow = useMemo<WorkItem>(() => ({
    company: "", role: "", location: "", from: "", to: "", projects: "", documents: []
  }), []);

  const [rows, setRows] = useState<WorkItem[]>([emptyRow]);
  const [hydrating, setHydrating] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---- DB <-> UI mapping ----
  const toDbPayload = (items: WorkItem[], uploadedPerExp: (string | null)[][]) =>
    items.map((it, i) => {
      const existing = (it.documents ?? []).filter((d) => typeof d === "string") as string[];
      const uploaded = (uploadedPerExp[i] ?? []).filter(Boolean) as string[];
      const merged = Array.from(new Set([...existing, ...uploaded]));
      return {
        company: it.company,
        role: it.role,
        location: it.location,
        from: it.from,
        to: it.to,
        projects: it.projects || "",
        documents: merged, // array of URLs
      };
    });

  const fromDbPayload = (arr: any[]): WorkItem[] => {
    if (!Array.isArray(arr)) return [emptyRow];
    const ui = arr.map((it) => ({
      company: it?.company ?? "",
      role: it?.role ?? "",
      location: it?.location ?? "",
      from: it?.from ?? "",
      to: it?.to ?? "",
      projects: it?.projects ?? "",
      documents: Array.isArray(it?.documents) ? (it.documents as string[]) : [],
    }));
    return ui.length ? ui : [emptyRow];
  };

  // ---- Storage helper ----
  const uploadDocsIfNeeded = async (clientId: string, item: WorkItem, idx: number) => {
    if (!item.documents || item.documents.length === 0) return [];
    const urls: (string | null)[] = [];

    for (let f = 0; f < item.documents.length; f++) {
      const doc = item.documents[f];
      if (typeof doc === "string") { urls.push(doc); continue; } // already a URL

      const safe = doc.name.replace(/[^\w.\-]+/g, "_");
      const ext = safe.split(".").pop() || "pdf";
      const path = `work-experience/${clientId}/${Date.now()}_${idx}_${f}.${ext}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, doc, {
        cacheControl: "3600",
        upsert: false,
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

  // ---- Hydrate ----
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
        .select("work_experience")
        .eq("client_id", client_id)
        .maybeSingle();

      if (error) {
        console.error("Fetch work_experience error:", error);
        setRows([emptyRow]);
        setHydrating(false);
        return;
      }

      setRows(fromDbPayload(data?.work_experience ?? []));
      setHydrating(false);
    } catch (e) {
      console.error(e);
      setRows([emptyRow]);
      setHydrating(false);
    }
  };

  useEffect(() => { hydrate(); }, []);

  // ---- Handlers ----
  const handleChange = <K extends keyof WorkItem>(i: number, key: K, value: WorkItem[K]) => {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: value };
      return next;
    });
  };

  const handleFilesChange = (i: number, files: FileList | null) => {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], documents: files ? [...(next[i].documents ?? []), ...Array.from(files)] : next[i].documents };
      return next;
    });
  };

  const removeExistingUrl = (i: number, url: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[i] = {
        ...next[i],
        documents: (next[i].documents ?? []).filter((d) => !(typeof d === "string" && d === url)),
      };
      return next;
    });
  };

  const addRow = () => setRows((prev) => [...prev, { ...emptyRow }]);
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user?.id) { alert("You must be logged in to save."); setSaving(false); return; }
      const client_id = userResp.user.id;

      // upload only new File objects (existing URLs passed through uploadDocsIfNeeded)
      const uploadedPerExp: (string | null)[][] = [];
      for (let i = 0; i < rows.length; i++) {
        uploadedPerExp.push(await uploadDocsIfNeeded(client_id, rows[i], i));
      }

      const payload = toDbPayload(rows, uploadedPerExp);

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          { client_id, work_experience: payload }, // add progress_percent if you track it here
          { onConflict: "client_id" }
        );

      if (upsertErr) { console.error("Upsert error:", upsertErr); alert("Failed to save work experience."); setSaving(false); return; }

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
                <div>
                  <Label>Company Name</Label>
                  <Input
                    placeholder="Tech Solutions Ltd."
                    value={row.company}
                    onChange={(e) => handleChange(index, "company", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Role/Designation</Label>
                  <Input
                    placeholder="Senior Software Engineer"
                    value={row.role}
                    onChange={(e) => handleChange(index, "role", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Location</Label>
                  <Input
                    placeholder="San Francisco, CA"
                    value={row.location}
                    onChange={(e) => handleChange(index, "location", e.target.value)}
                  />
                </div>

                <div>
                  <Label>From</Label>
                  <Input
                    type="month"
                    value={row.from}
                    onChange={(e) => handleChange(index, "from", e.target.value)}
                  />
                </div>

                <div>
                  <Label>To</Label>
                  <Input
                    type="month"
                    value={row.to}
                    onChange={(e) => handleChange(index, "to", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Key Projects (Optional)</Label>
                  <Textarea
                    rows={4}
                    placeholder="Describe major projects and achievements..."
                    value={row.projects}
                    onChange={(e) => handleChange(index, "projects", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Documents (Offer/Relieving Letter, Payslips)</Label>
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={(e) => handleFilesChange(index, e.target.files)}
                    />
                  </div>

                  {/* Existing uploaded URLs */}
                  {Array.isArray(row.documents) &&
                    (row.documents as (File | string)[]).some((d) => typeof d === "string") && (
                      <ul className="mt-2 space-y-1">
                        {(row.documents as (File | string)[])
                          .filter((d) => typeof d === "string")
                          .map((u, i) => (
                            <li key={i} className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                              <a href={u as string} target="_blank" rel="noreferrer" className="underline truncate">
                                View document {i + 1}
                              </a>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExistingUrl(index, u as string)}
                              >
                                Remove
                              </Button>
                            </li>
                          ))}
                      </ul>
                    )}
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addRow} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Experience
          </Button>
        </>
      )}
    </div>
  );
};

export default WorkExperienceReviewPanel;
