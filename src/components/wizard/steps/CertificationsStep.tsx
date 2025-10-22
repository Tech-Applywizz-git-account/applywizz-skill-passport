// src/components/wizard/steps/CertificationsStep.tsx

import { useEffect, useMemo, useState } from "react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadToClientDocs } from "@/lib/upload";

type CertItem = {
  certificate_name: string;
  issuing_organization: string;
  issue_date: string;   // YYYY-MM-DD
  valid_till: string;   // YYYY-MM-DD
  credential_id: string;
  credential_url: string;
  domain: string;
  skills: string;       // comma separated in UI
  file?: File | null;   // local
  file_url?: string | null; // persisted
};

interface Props {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
  initialCerts?: CertItem[] | null;
}

const CertificationsStep = ({ onNext, onBack, updateFormData, initialCerts }: Props) => {
  const emptyRow = useMemo<CertItem>(() => ({
    certificate_name: "",
    issuing_organization: "",
    issue_date: "",
    valid_till: "",
    credential_id: "",
    credential_url: "",
    domain: "",
    skills: "",
    file: null,
    file_url: null,
  }), []);

  const [rows, setRows] = useState<CertItem[]>([emptyRow]);
  const [saving, setSaving] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  // DB payload shape for client_profiles.certifications
  const toDbPayload = (items: CertItem[]) =>
    items.map((c) => {
      const skillsArray = c.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // prefer URL if present; else store ID (mapper will show properly)
      const credential_id_or_url =
        (c.credential_url && c.credential_url.trim()) ||
        (c.credential_id && c.credential_id.trim()) ||
        "";

      return {
        certificate_name: c.certificate_name,
        issuing_organization: c.issuing_organization,
        year_of_issue: c.issue_date || null,
        valid_till: c.valid_till || null,
        credential_id_or_url,
        domain: c.domain || null,
        skills: skillsArray,       // <— persist skills[]
        file: c.file_url || null,  // <— persist certificate file URL (non-null if uploaded)
      };
    });

  // DB -> UI rehydration
  const fromDbPayload = (arr: any[]): CertItem[] => {
    if (!Array.isArray(arr)) return [emptyRow];
    const ui = arr.map((c) => ({
      certificate_name: c?.certificate_name ?? "",
      issuing_organization: c?.issuing_organization ?? "",
      issue_date: c?.year_of_issue ?? "",
      valid_till: c?.valid_till ?? "",
      credential_id: (c?.credential_id_or_url && !String(c.credential_id_or_url).startsWith("http"))
        ? c.credential_id_or_url : "",
      credential_url: (c?.credential_id_or_url && String(c.credential_id_or_url).startsWith("http"))
        ? c.credential_id_or_url : "",
      domain: c?.domain ?? "",
      skills: Array.isArray(c?.skills) ? c.skills.join(", ") : "",
      file: null,
      file_url: c?.file ?? null,
    }));
    return ui.length ? ui : [emptyRow];
  };

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        if (initialCerts?.length) {
          if (!cancelled) {
            setRows(initialCerts);
            setHydrating(false);
          }
          return;
        }
        const { data: userResp, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userResp?.user?.id) {
          if (!cancelled) {
            setRows([emptyRow]);
            setHydrating(false);
          }
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
          if (!cancelled) {
            setRows([emptyRow]);
            setHydrating(false);
          }
          return;
        }
        if (!cancelled) {
          setRows(fromDbPayload(data?.certifications ?? []));
          setHydrating(false);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setRows([emptyRow]);
          setHydrating(false);
        }
      }
    };
    hydrate();
    return () => { cancelled = true; };
  }, [emptyRow, initialCerts]);

  const change = (i: number, k: keyof CertItem, v: string) => {
    setRows(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [k]: v };
      return next;
    });
  };

  const setFile = (i: number, f: File | null) => {
    setRows(prev => {
      const next = [...prev];
      next[i] = { ...next[i], file: f };
      return next;
    });
  };

  const add = () => setRows(prev => [...prev, { ...emptyRow }]);
  const remove = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user?.id) {
        alert("You must be logged in to save.");
        setSaving(false);
        return;
      }
      const client_id = userResp.user.id;

      // upload any new cert file to client-docs/certifications/<clientId>/
      const uploaded = await Promise.all(rows.map(async (r) => {
        let file_url = r.file_url || null;
        if (r.file) {
          file_url = await uploadToClientDocs(r.file, client_id, "certifications");
        }
        return { ...r, file: null, file_url };
      }));

      const payload = toDbPayload(uploaded);

      const { error: upsertErr } = await supabase
        .from("client_profiles")
        .upsert(
          { client_id, certifications: payload },
          { onConflict: "client_id" }
        );
      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save certifications.");
        setSaving(false);
        return;
      }

      setRows(uploaded);
      setSaving(false);
      onNext();
    } catch (e) {
      console.error(e);
      alert("Unexpected error. Check console.");
      setSaving(false);
    }
  };

  return (
    <StepWrapper
      title="Certifications"
      icon={<FileText />}
      onNext={save}
      onBack={() => { updateFormData({ certifications: rows }); onBack(); }}
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
          {rows.map((r, i) => (
            <div key={i} className="border border-border rounded-lg p-6 relative space-y-4">
              {rows.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(i)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Certificate Name</Label>
                  <Input value={r.certificate_name} onChange={(e) => change(i, "certificate_name", e.target.value)} />
                </div>
                <div>
                  <Label>Issuing Organization</Label>
                  <Input value={r.issuing_organization} onChange={(e) => change(i, "issuing_organization", e.target.value)} />
                </div>

                <div>
                  <Label>Issue Date</Label>
                  <Input type="date" value={r.issue_date} onChange={(e) => change(i, "issue_date", e.target.value)} />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input type="date" value={r.valid_till} onChange={(e) => change(i, "valid_till", e.target.value)} />
                </div>

                <div>
                  <Label>Credential ID (optional)</Label>
                  <Input value={r.credential_id} onChange={(e) => change(i, "credential_id", e.target.value)} />
                </div>
                <div>
                  <Label>Credential URL (optional)</Label>
                  <Input value={r.credential_url} onChange={(e) => change(i, "credential_url", e.target.value)} />
                </div>

                <div>
                  <Label>Domain</Label>
                  <Input placeholder="e.g., Cloud, Data, Security" value={r.domain} onChange={(e) => change(i, "domain", e.target.value)} />
                </div>
                <div>
                  <Label>Skills (comma separated)</Label>
                  <Input placeholder="Python, SQL, Docker" value={r.skills} onChange={(e) => change(i, "skills", e.target.value)} />
                </div>

                <div className="md:col-span-2">
                  <Label>Certificate File (PDF/Image)</Label>
                  <Input type="file" accept=".pdf,.png,.jpg,.jpeg"
                         onChange={(e) => setFile(i, e.target.files?.[0] || null)} />
                  {r.file_url && (
                    <a className="text-xs underline mt-1 inline-block" href={r.file_url} target="_blank" rel="noreferrer">
                      View uploaded certificate
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={() => setRows(prev => [...prev, { ...emptyRow }])} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Certification
          </Button>
        </>
      )}
    </StepWrapper>
  );
};

export default CertificationsStep;
