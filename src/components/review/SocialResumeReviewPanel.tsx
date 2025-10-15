import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Upload, FileText, Save, Loader2, RefreshCw, Trash2 } from "lucide-react";

type SocialResumePayload = {
  resumeUrl?: string | null;
};

const BUCKET = "client-docs";
const isBucketPublic = true; // set false for private bucket (uses signed URLs)

const SocialResumeReviewPanel = () => {
  const emptyPayload = useMemo<SocialResumePayload>(() => ({ resumeUrl: null }), []);
  const [payload, setPayload] = useState<SocialResumePayload>(emptyPayload);

  // Local UI state: track a new selected file (File) OR keep existing (string) OR null
  const [selected, setSelected] = useState<File | string | null>(null);

  const [hydrating, setHydrating] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---------- Helpers ----------
//   const uploadResumeIfNeeded = async (clientId: string, fileOrUrl: File | string | null) => {
//     if (!fileOrUrl || typeof fileOrUrl === "string") return fileOrUrl ?? null;
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

  // ---------- Hydrate ----------
  const hydrate = async () => {
    setHydrating(true);
    try {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user?.id) {
        setPayload(emptyPayload);
        setSelected(null);
        setHydrating(false);
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
        setPayload(emptyPayload);
        setSelected(null);
        setHydrating(false);
        return;
      }

      const db: SocialResumePayload = (data?.social_resume ?? emptyPayload) as SocialResumePayload;
      setPayload(db);
      setSelected(db.resumeUrl ?? null);
      setHydrating(false);
    } catch (e) {
      console.error(e);
      setPayload(emptyPayload);
      setSelected(null);
      setHydrating(false);
    }
  };

  useEffect(() => { hydrate(); }, []);

  // ---------- Save ----------
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

      // If user hit “Remove”, selected can be null → we persist null
      const resumeUrl = await uploadResumeIfNeeded(client_id, selected);

      const newPayload: SocialResumePayload = { resumeUrl };
      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          {
            client_id,
            social_resume: newPayload,
            // optionally bump progress or status from Review too:
            // progress_percent: 100,
            // profile_status: "submitted",
          },
          { onConflict: "client_id" }
        );

      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save resume.");
        setSaving(false);
        return;
      }

      setPayload(newPayload);
      setSaving(false);
      hydrate(); // reflect any DB transforms
    } catch (e) {
      console.error(e);
      alert("Unexpected error. Check console.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
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
        </div>
      ) : (
        <div className="border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Resume
          </h3>

          {/* Current resume link (if any) */}
          {typeof payload.resumeUrl === "string" && payload.resumeUrl && (
            <div className="text-sm">
              <Label className="mb-1 block">Current resume</Label>
              <a href={payload.resumeUrl} target="_blank" rel="noreferrer" className="underline break-all">
                View current resume
              </a>
            </div>
          )}

          {/* Replace / Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium mb-1">Drag & Drop your resume here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse (PDF only)</p>

            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setSelected(file); // selecting a new file replaces any existing URL in the pending state
              }}
            />

            {/* Pending selection preview */}
            {selected instanceof File && (
              <p className="mt-3 text-sm text-muted-foreground">
                Selected: <span className="font-medium">{selected.name}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Remove current resume (set to null) */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelected(null)}
              disabled={saving}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Resume
            </Button>

            {/* Revert pending change to what’s in DB */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelected(payload.resumeUrl ?? null)}
              disabled={saving}
            >
              Revert Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialResumeReviewPanel;
