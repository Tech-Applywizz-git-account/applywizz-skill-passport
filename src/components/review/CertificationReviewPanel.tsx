// src/components/review/CertificationReviewPanel.tsx

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Plus,
  X,
  Save,
  Loader2,
  RefreshCw,
  Link as LinkIcon,
  Shield,
  Hash,
  Tag,
  File as FileIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ----------------------------
// Types (match your DB schema)
// ----------------------------
type CertItem = {
  certificate_name: string;          // e.g., "AWS"
  issuing_organization: string;      // e.g., "nxtwave"
  year_of_issue: string;             // e.g., "2024" (YYYY)
  valid_till?: string;               // e.g., "2026" (YYYY, optional)
  credential_id_or_url?: string;     // ID or URL (single field)
  domain?: string;                   // e.g., "Full Stack"
  file?: string | null;              // optional file/url string for now
};

// ----------------------------
// Helpers
// ----------------------------
function parseMaybeJsonArray(v: unknown): any[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const trimmed = v.trim();
      return trimmed ? JSON.parse(trimmed) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Normalize DB rows to our UI shape.
 * Supports BOTH your current keys and the older alt keys,
 * so hydration works regardless of what exists already.
 */
function fromDbPayload(arr: any[]): CertItem[] {
  if (!Array.isArray(arr)) return [emptyRowFactory()];

  const ui = arr.map((it: any) => {
    // Prefer your schema; fallback to old keys if necessary
    const certificate_name =
      it?.certificate_name ?? it?.certification_name ?? "";
    const issuing_organization = it?.issuing_organization ?? "";
    const year_of_issue =
      it?.year_of_issue ?? (it?.issue_date ? String(it.issue_date).slice(0, 4) : "");
    const valid_till =
      it?.valid_till ?? (it?.expiry_date ? String(it.expiry_date).slice(0, 4) : "");
    const credential_id_or_url =
      it?.credential_id_or_url ??
      (it?.credential_url || it?.credential_id || "");
    const domain = it?.domain ?? (it?.skills || "");
    const file = it?.file ?? null;

    return {
      certificate_name,
      issuing_organization,
      year_of_issue,
      valid_till,
      credential_id_or_url,
      domain,
      file,
    } as CertItem;
  });

  return ui.length ? ui : [emptyRowFactory()];
}

function emptyRowFactory(): CertItem {
  return {
    certificate_name: "",
    issuing_organization: "",
    year_of_issue: "",
    valid_till: "",
    credential_id_or_url: "",
    domain: "",
    file: "",
  };
}

/**
 * Map UI -> DB using YOUR schema.
 */
function toDbPayload(items: CertItem[]) {
  return items.map((c) => ({
    file: (c.file ?? "")?.toString().trim() || null,
    domain: c.domain?.trim() || "",
    valid_till: c.valid_till?.trim() || "",          // keep as YYYY string
    year_of_issue: c.year_of_issue?.trim() || "",    // keep as YYYY string
    certificate_name: c.certificate_name?.trim() || "",
    credential_id_or_url: c.credential_id_or_url?.trim() || "",
    issuing_organization: c.issuing_organization?.trim() || "",
  }));
}

const CertificationReviewPanel = () => {
  const emptyRow = useMemo<CertItem>(() => emptyRowFactory(), []);
  const [rows, setRows] = useState<CertItem[]>([emptyRow]);
  const [hydrating, setHydrating] = useState(true);
  const [saving, setSaving] = useState(false);

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
        .select("certifications")
        .eq("client_id", client_id)
        .maybeSingle();

      if (error) {
        console.error("Fetch certifications error:", error);
        setRows([emptyRow]);
        setHydrating(false);
        return;
      }

      const parsed = parseMaybeJsonArray(data?.certifications);
      setRows(fromDbPayload(parsed));
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

  const handleChange = (index: number, field: keyof CertItem, value: string) => {
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

      // Detect column type (JSONB vs TEXT) and store accordingly
      let storeValue: any = payload;
      try {
        const { data: typeProbe } = await supabase
          .from("client_profiles")
          .select("certifications")
          .eq("client_id", client_id)
          .maybeSingle();

        const current = typeProbe?.certifications;
        if (typeof current === "string") {
          storeValue = JSON.stringify(payload);
        }
      } catch {
        // ignore; default is JSONB payload
      }

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert({ client_id, certifications: storeValue }, { onConflict: "client_id" });

      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save certifications. Check console.");
        setSaving(false);
        return;
      }

      setSaving(false);
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
                {/* Certificate Name */}
                <div>
                  <Label>Certificate Name</Label>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="AWS"
                      value={row.certificate_name}
                      onChange={(e) => handleChange(index, "certificate_name", e.target.value)}
                    />
                  </div>
                </div>

                {/* Issuing Organization */}
                <div>
                  <Label>Issuing Organization</Label>
                  <Input
                    placeholder="nxtwave"
                    value={row.issuing_organization}
                    onChange={(e) => handleChange(index, "issuing_organization", e.target.value)}
                  />
                </div>

                {/* Year of Issue (YYYY) */}
                <div>
                  <Label>Year of Issue (YYYY)</Label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={row.year_of_issue}
                    onChange={(e) => handleChange(index, "year_of_issue", e.target.value)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  />
                </div>

                {/* Valid Till (YYYY) */}
                <div>
                  <Label>Valid Till (YYYY, Optional)</Label>
                  <Input
                    type="number"
                    placeholder="2026"
                    value={row.valid_till ?? ""}
                    onChange={(e) => handleChange(index, "valid_till", e.target.value)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  />
                </div>

                {/* Credential ID or URL */}
                <div>
                  <Label>Credential (ID or URL)</Label>
                  <div className="flex items-center gap-2">
                    {/* Show hash if looks like ID, link if looks like URL — purely visual */}
                    {row.credential_id_or_url?.startsWith("http") ? (
                      <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Hash className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Input
                      placeholder="https://apply-wizz.com/verify/ABC123  or  ABC-123-ID"
                      value={row.credential_id_or_url ?? ""}
                      onChange={(e) => handleChange(index, "credential_id_or_url", e.target.value)}
                    />
                  </div>
                </div>

                {/* Domain */}
                <div>
                  <Label>Domain</Label>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Full Stack"
                      value={row.domain ?? ""}
                      onChange={(e) => handleChange(index, "domain", e.target.value)}
                    />
                  </div>
                </div>

                {/* File (optional URL for now) */}
                <div className="md:col-span-2">
                  <Label>File URL (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <FileIcon className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://example.com/certificates/aws.pdf"
                      value={row.file ?? ""}
                      onChange={(e) => handleChange(index, "file", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addRow} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Certification
          </Button>
        </>
      )}
    </div>
  );
};

export default CertificationReviewPanel;

