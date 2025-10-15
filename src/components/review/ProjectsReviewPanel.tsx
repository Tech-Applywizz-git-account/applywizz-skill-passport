import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Save, Loader2, RefreshCw, Paperclip, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ProjectItem = {
  title: string;
  description: string;
  role: string;
  techStack: string;
  url: string;
  files: (File | string)[] | null; // File while editing; URLs when saved; or null
};

const BUCKET = "client-docs";
const isBucketPublic = true; // set false if your bucket is private (uses signed URLs)

const ProjectsReviewPanel = () => {
  const emptyRow = useMemo<ProjectItem>(() => ({
    title: "", description: "", role: "", techStack: "", url: "", files: []
  }), []);

  const [rows, setRows] = useState<ProjectItem[]>([emptyRow]);
  const [hydrating, setHydrating] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---------- DB <-> UI mapping ----------
  const toDbPayload = (items: ProjectItem[], uploadedPerProject: (string | null)[][]) =>
    items.map((p, i) => {
      const existing = (p.files ?? []).filter((x) => typeof x === "string") as string[];
      const uploaded = (uploadedPerProject[i] ?? []).filter(Boolean) as string[];
      const merged = Array.from(new Set([...existing, ...uploaded]));
      return {
        title: p.title,
        description: p.description,
        role: p.role,
        tech_stack: p.techStack,
        url: p.url,
        files: merged, // array of URLs
      };
    });

  const fromDbPayload = (arr: any[]): ProjectItem[] => {
    if (!Array.isArray(arr)) return [emptyRow];
    const ui = arr.map((it) => ({
      title: it?.title ?? "",
      description: it?.description ?? "",
      role: it?.role ?? "",
      techStack: it?.tech_stack ?? "",
      url: it?.url ?? "",
      files: Array.isArray(it?.files) ? (it.files as string[]) : [],
    }));
    return ui.length ? ui : [emptyRow];
  };

  // ---------- Storage helper ----------
  const uploadFilesIfNeeded = async (clientId: string, item: ProjectItem, idx: number) => {
    if (!item.files || item.files.length === 0) return [];

    const urls: (string | null)[] = [];
    for (let f = 0; f < item.files.length; f++) {
      const fl = item.files[f];
      if (typeof fl === "string") { urls.push(fl); continue; } // already a URL

      const safe = fl.name.replace(/[^\w.\-]+/g, "_");
      const ext = safe.split(".").pop() || "bin";
      const path = `projects/${clientId}/${Date.now()}_${idx}_${f}.${ext}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, fl, {
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

  // ---------- Hydrate ----------
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
        .select("projects")
        .eq("client_id", client_id)
        .maybeSingle();

      if (error) {
        console.error("Fetch projects error:", error);
        setRows([emptyRow]);
        setHydrating(false);
        return;
      }

      setRows(fromDbPayload(data?.projects ?? []));
      setHydrating(false);
    } catch (e) {
      console.error(e);
      setRows([emptyRow]);
      setHydrating(false);
    }
  };

  useEffect(() => { hydrate(); }, []);

  // ---------- Handlers ----------
  const handleChange = <K extends keyof ProjectItem>(i: number, key: K, value: ProjectItem[K]) => {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: value };
      return next;
    });
  };

  const handleFilesChange = (i: number, list: FileList | null) => {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], files: list ? [ ...(next[i].files ?? []), ...Array.from(list) ] : next[i].files };
      return next;
    });
  };

  const removeExistingUrl = (i: number, url: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[i] = {
        ...next[i],
        files: (next[i].files ?? []).filter((f) => !(typeof f === "string" && f === url)),
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

      const uploadedPerProject: (string | null)[][] = [];
      for (let i = 0; i < rows.length; i++) {
        uploadedPerProject.push(await uploadFilesIfNeeded(client_id, rows[i], i));
      }

      const payload = toDbPayload(rows, uploadedPerProject);

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          { client_id, projects: payload }, // add progress_percent if you track it here
          { onConflict: "client_id" }
        );

      if (upsertErr) { console.error("Upsert error:", upsertErr); alert("Failed to save projects."); setSaving(false); return; }

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
                <div className="md:col-span-2">
                  <Label>Project Title</Label>
                  <Input
                    placeholder="E-commerce Platform"
                    value={row.title}
                    onChange={(e) => handleChange(index, "title", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the project, its goals, and outcomes..."
                    rows={4}
                    value={row.description}
                    onChange={(e) => handleChange(index, "description", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Your Role in Project</Label>
                  <Input
                    placeholder="Lead Developer, Designer, etc."
                    value={row.role}
                    onChange={(e) => handleChange(index, "role", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Project/GitHub URL</Label>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="https://github.com/username/project"
                      value={row.url}
                      onChange={(e) => handleChange(index, "url", e.target.value)}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label>Tech Stack Used</Label>
                  <Input
                    placeholder="React, Node.js, MongoDB, AWS..."
                    value={row.techStack}
                    onChange={(e) => handleChange(index, "techStack", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Attach Files (screenshots, docs, etc.)</Label>
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.zip"
                      onChange={(e) => handleFilesChange(index, e.target.files)}
                    />
                  </div>

                  {/* Existing uploaded URLs */}
                  {Array.isArray(row.files) &&
                    (row.files as (File | string)[]).some((f) => typeof f === "string") && (
                      <ul className="mt-2 space-y-1">
                        {(row.files as (File | string)[])
                          .filter((f) => typeof f === "string")
                          .map((u, i) => (
                            <li key={i} className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                              <a href={u as string} target="_blank" rel="noreferrer" className="underline truncate">
                                View file {i + 1}
                              </a>
                              <Button variant="ghost" size="sm" onClick={() => removeExistingUrl(index, u as string)}>
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
            Add Another Project
          </Button>
        </>
      )}
    </div>
  );
};

export default ProjectsReviewPanel;
