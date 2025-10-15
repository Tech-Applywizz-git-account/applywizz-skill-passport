import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, Save, Loader2, RefreshCw, Link as LinkIcon, Shield, Hash } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Shape used in UI
type CertItem = {
  name: string;            // Certification name
  issuer: string;          // Issuing organization
  issue_date: string;      // YYYY-MM-DD
  expiry_date?: string;    // optional, YYYY-MM-DD
  credential_id?: string;  // optional
  credential_url?: string; // optional
  skills?: string;         // optional, comma-separated
};

const CertificationReviewPanel = () => {
  const emptyRow = useMemo<CertItem>(() => ({
    name: "",
    issuer: "",
    issue_date: "",
    expiry_date: "",
    credential_id: "",
    credential_url: "",
    skills: ""
  }), []);

  const [rows, setRows] = useState<CertItem[]>([emptyRow]);
  const [hydrating, setHydrating] = useState(true);
  const [saving, setSaving] = useState(false);

  // DB <- UI mapping
  const toDbPayload = (items: CertItem[]) =>
    items.map((c) => ({
      certification_name: c.name?.trim() ?? "",
      issuing_organization: c.issuer?.trim() ?? "",
      issue_date: c.issue_date || null,
      expiry_date: c.expiry_date || null,
      credential_id: c.credential_id?.trim() || null,
      credential_url: c.credential_url?.trim() || null,
      skills: c.skills?.trim() || null, // if you prefer string[], split here
    }));

  // UI <- DB mapping (defensive)
  const fromDbPayload = (arr: any[]): CertItem[] => {
    if (!Array.isArray(arr)) return [emptyRow];
    const ui = arr.map((it) => ({
      name: it?.certification_name ?? "",
      issuer: it?.issuing_organization ?? "",
      issue_date: it?.issue_date ?? "",
      expiry_date: it?.expiry_date ?? "",
      credential_id: it?.credential_id ?? "",
      credential_url: it?.credential_url ?? "",
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
        .select("certifications")
        .eq("client_id", client_id)
        .maybeSingle();

      if (error) {
        console.error("Fetch certifications error:", error);
        setRows([emptyRow]);
        setHydrating(false);
        return;
      }

      setRows(fromDbPayload(data?.certifications ?? []));
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

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          { client_id, certifications: payload }, // add progress_percent here if needed
          { onConflict: "client_id" }
        );

      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save certifications. Check console.");
        setSaving(false);
        return;
      }

      setSaving(false);
      // optional: re-hydrate to reflect any DB transforms
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
                {/* Name */}
                <div>
                  <Label>Certification Name</Label>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="AWS Certified Solutions Architect – Associate"
                      value={row.name}
                      onChange={(e) => handleChange(index, "name", e.target.value)}
                    />
                  </div>
                </div>

                {/* Issuer */}
                <div>
                  <Label>Issuing Organization</Label>
                  <Input
                    placeholder="Amazon Web Services"
                    value={row.issuer}
                    onChange={(e) => handleChange(index, "issuer", e.target.value)}
                  />
                </div>

                {/* Issue Date */}
                <div>
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={row.issue_date}
                    onChange={(e) => handleChange(index, "issue_date", e.target.value)}
                  />
                </div>

                {/* Expiry Date (optional) */}
                <div>
                  <Label>Expiry Date (Optional)</Label>
                  <Input
                    type="date"
                    value={row.expiry_date ?? ""}
                    onChange={(e) => handleChange(index, "expiry_date", e.target.value)}
                  />
                </div>

                {/* Credential ID (optional) */}
                <div>
                  <Label>Credential ID (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="AWS-AAA-12345678"
                      value={row.credential_id ?? ""}
                      onChange={(e) => handleChange(index, "credential_id", e.target.value)}
                    />
                  </div>
                </div>

                {/* Credential URL (optional) */}
                <div>
                  <Label>Credential URL (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://example.com/verify/credential"
                      value={row.credential_url ?? ""}
                      onChange={(e) => handleChange(index, "credential_url", e.target.value)}
                    />
                  </div>
                </div>

                {/* Skills (optional) */}
                <div className="md:col-span-2">
                  <Label>Skills (Optional, comma-separated)</Label>
                  <Input
                    placeholder="Cloud Architecture, VPC, IAM"
                    value={row.skills ?? ""}
                    onChange={(e) => handleChange(index, "skills", e.target.value)}
                  />
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
