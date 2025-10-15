// // src/components/wizard/steps/CertificationsStep.tsx
// import { useState } from "react";
// import { Award, Plus, X } from "lucide-react";
// import StepWrapper from "../StepWrapper";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { supabase } from "@/lib/supabase";

// interface CertificationItem {
//   name: string;
//   organization: string;
//   domain: string;
//   yearIssued: string; // keep as string to avoid number parsing issues
//   validTill: string;  // keep as string
//   credentialId: string;
//   file?: string | null; // (optional) storage URL or null
// }

// interface CertificationsStepProps {
//   onNext: () => void;
//   onBack: () => void;
//   updateFormData: (data: any) => void;
// }

// const CertificationsStep = ({ onNext, onBack, updateFormData }: CertificationsStepProps) => {
//   const [certifications, setCertifications] = useState<CertificationItem[]>([
//     { name: "", organization: "", domain: "", yearIssued: "", validTill: "", credentialId: "", file: null }
//   ]);
//   const [saving, setSaving] = useState(false);

//   const handleChange = <K extends keyof CertificationItem>(idx: number, key: K, value: CertificationItem[K]) => {
//     setCertifications(prev => {
//       const next = [...prev];
//       next[idx] = { ...next[idx], [key]: value };
//       return next;
//     });
//   };

//   const addCertification = () => {
//     setCertifications(prev => [
//       ...prev,
//       { name: "", organization: "", domain: "", yearIssued: "", validTill: "", credentialId: "", file: null }
//     ]);
//   };

//   const removeCertification = (index: number) => {
//     setCertifications(prev => prev.filter((_, i) => i !== index));
//   };

//   // Transform UI -> DB payload
//   const toDbPayload = (items: CertificationItem[]) =>
//     items.map(c => ({
//       certificate_name: c.name,
//       issuing_organization: c.organization,
//       domain: c.domain,
//       year_of_issue: c.yearIssued,
//       valid_till: c.validTill,
//       credential_id_or_url: c.credentialId,
//       file: c.file ?? null
//     }));

//   const handleSubmit = async () => {
//     // 1) sync wizard state
//     updateFormData({ certifications });

//     // 2) DB payload
//     const payload = toDbPayload(certifications);

//     // 3) log for testing
//     console.log("Certifications payload (DB format) →", payload);

//     // 4) persist
//     setSaving(true);
//     try {
//       const { data: userResp, error: userErr } = await supabase.auth.getUser();
//       if (userErr || !userResp?.user?.id) {
//         console.error("Auth error", userErr);
//         alert("You must be logged in to save.");
//         setSaving(false);
//         return;
//       }
//       const client_id = userResp.user.id;

//       // --- OPTION A: simple UPSERT (no RPC)
//       const { error: upsertErr } = await supabase
//         .from("client_profiles")
//         .upsert(
//           { client_id, certifications: payload, progress_percent: 28 }, // sample progress
//           { onConflict: "client_id" }
//         );

//       if (upsertErr) {
//         console.error("Upsert error:", upsertErr);
//         alert("Failed to save certifications. Check console.");
//         setSaving(false);
//         return;
//       }

//       setSaving(false);
//       onNext();
//     } catch (e) {
//       console.error(e);
//       setSaving(false);
//       alert("Unexpected error. Check console.");
//     }
//   };

//   return (
//     <StepWrapper
//       title="Certifications"
//       icon={<Award />}
//       onNext={handleSubmit}
//       onBack={onBack}
//       nextLabel={saving ? "Saving..." : "Next"}
//       nextDisabled={saving}
//     >
//       <div className="space-y-6">
//         {certifications.map((cert, index) => (
//           <div key={index} className="border border-border rounded-lg p-6 relative">
//             {certifications.length > 1 && (
//               <Button
//                 type="button"
//                 variant="ghost"
//                 onClick={() => removeCertification(index)}
//                 className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </Button>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="md:col-span-2">
//                 <Label>Certificate Name</Label>
//                 <Input
//                   placeholder="AWS Certified Solutions Architect"
//                   value={cert.name}
//                   onChange={(e) => handleChange(index, "name", e.target.value)}
//                 />
//               </div>

//               <div>
//                 <Label>Issuing Organization</Label>
//                 <Input
//                   placeholder="Amazon Web Services"
//                   value={cert.organization}
//                   onChange={(e) => handleChange(index, "organization", e.target.value)}
//                 />
//               </div>

//               <div>
//                 <Label>Domain/Category</Label>
//                 <Input
//                   placeholder="Cloud Computing"
//                   value={cert.domain}
//                   onChange={(e) => handleChange(index, "domain", e.target.value)}
//                 />
//               </div>

//               <div>
//                 <Label>Year of Issue</Label>
//                 <Input
//                   type="number"
//                   placeholder="2023"
//                   value={cert.yearIssued}
//                   onChange={(e) => handleChange(index, "yearIssued", e.target.value)}
//                   onWheel={(e) => (e.target as HTMLInputElement).blur()}
//                 />
//               </div>

//               <div>
//                 <Label>Valid Till</Label>
//                 <Input
//                   type="number"
//                   placeholder="2026"
//                   value={cert.validTill}
//                   onChange={(e) => handleChange(index, "validTill", e.target.value)}
//                   onWheel={(e) => (e.target as HTMLInputElement).blur()}
//                 />
//               </div>

//               <div>
//                 <Label>Certificate ID / Credential URL</Label>
//                 <Input
//                   placeholder="Certificate ID or verification URL"
//                   value={cert.credentialId}
//                   onChange={(e) => handleChange(index, "credentialId", e.target.value)}
//                 />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <Button type="button" variant="outline" onClick={addCertification} className="w-full">
//         <Plus className="w-4 h-4 mr-2" />
//         Add Another Certification
//       </Button>
//     </StepWrapper>
//   );
// };

// export default CertificationsStep;

// src/components/wizard/steps/CertificationsStep.tsx
import { useEffect, useMemo, useState } from "react";
import { Award, Plus, X } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface CertificationItem {
  name: string;
  organization: string;
  domain: string;
  yearIssued: string; // strings to avoid number wheel issues
  validTill: string;
  credentialId: string;
  file?: string | null;
}

interface CertificationsStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
  /** ✅ New: hydrate from parent wizard store if available */
  initialCertifications?: CertificationItem[] | null;
}

const CertificationsStep = ({
  onNext,
  onBack,
  updateFormData,
  initialCertifications,
}: CertificationsStepProps) => {
  const emptyRow: CertificationItem = useMemo(
    () => ({
      name: "",
      organization: "",
      domain: "",
      yearIssued: "",
      validTill: "",
      credentialId: "",
      file: null,
    }),
    []
  );

  const [certifications, setCertifications] = useState<CertificationItem[]>([emptyRow]);
  const [saving, setSaving] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  const handleChange = <K extends keyof CertificationItem>(
    idx: number,
    key: K,
    value: CertificationItem[K]
  ) => {
    setCertifications((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const addCertification = () => setCertifications((prev) => [...prev, { ...emptyRow }]);
  const removeCertification = (index: number) =>
    setCertifications((prev) => prev.filter((_, i) => i !== index));

  // UI -> DB
  const toDbPayload = (items: CertificationItem[]) =>
    items.map((c) => ({
      certificate_name: c.name,
      issuing_organization: c.organization,
      domain: c.domain,
      year_of_issue: c.yearIssued,
      valid_till: c.validTill,
      credential_id_or_url: c.credentialId,
      file: c.file ?? null,
    }));

  // DB -> UI
  const fromDbPayload = (arr: any[]): CertificationItem[] => {
    if (!Array.isArray(arr)) return [emptyRow];
    return arr.map((it: any) => ({
      name: it?.certificate_name ?? "",
      organization: it?.issuing_organization ?? "",
      domain: it?.domain ?? "",
      yearIssued: it?.year_of_issue ?? "",
      validTill: it?.valid_till ?? "",
      credentialId: it?.credential_id_or_url ?? "",
      file: it?.file ?? null,
    }));
  };

  // ✅ Hydrate on mount: prefer parent-provided state; else fetch from Supabase
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        if (initialCertifications && initialCertifications.length) {
          if (!cancelled) {
            setCertifications(initialCertifications);
            setHydrating(false);
          }
          return;
        }

        const { data: userResp, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userResp?.user?.id) {
          if (!cancelled) {
            setCertifications([emptyRow]);
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
            setCertifications([emptyRow]);
            setHydrating(false);
          }
          return;
        }

        const ui = fromDbPayload(data?.certifications ?? []);
        if (!cancelled) {
          setCertifications(ui.length ? ui : [emptyRow]);
          setHydrating(false);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setCertifications([emptyRow]);
          setHydrating(false);
        }
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    // keep wizard store in sync so Back is instant later
    updateFormData({ certifications });

    const payload = toDbPayload(certifications);
    console.log("Certifications payload (DB format) →", payload);

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
          { client_id, certifications: payload, progress_percent: 28 }, // adjust progress as needed
          { onConflict: "client_id" }
        );

      if (upsertErr) {
        console.error("Upsert error:", upsertErr);
        alert("Failed to save certifications. Check console.");
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
      title="Certifications"
      icon={<Award />}
      onNext={handleSubmit}
      onBack={() => {
        // ✅ persist current edits in parent when going back
        updateFormData({ certifications });
        onBack();
      }}
      nextLabel={saving ? "Saving..." : "Next"}
      nextDisabled={saving || hydrating}
      backDisabled={hydrating}
    >
      {hydrating ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-24 rounded bg-muted" />
          <div className="h-24 rounded bg-muted" />
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {certifications.map((cert, index) => (
              <div key={index} className="border border-border rounded-lg p-6 relative">
                {certifications.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeCertification(index)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Certificate Name</Label>
                    <Input
                      placeholder="AWS Certified Solutions Architect"
                      value={cert.name}
                      onChange={(e) => handleChange(index, "name", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Issuing Organization</Label>
                    <Input
                      placeholder="Amazon Web Services"
                      value={cert.organization}
                      onChange={(e) => handleChange(index, "organization", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Domain/Category</Label>
                    <Input
                      placeholder="Cloud Computing"
                      value={cert.domain}
                      onChange={(e) => handleChange(index, "domain", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Year of Issue</Label>
                    <Input
                      type="number"
                      placeholder="2023"
                      value={cert.yearIssued}
                      onChange={(e) => handleChange(index, "yearIssued", e.target.value)}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    />
                  </div>

                  <div>
                    <Label>Valid Till</Label>
                    <Input
                      type="number"
                      placeholder="2026"
                      value={cert.validTill}
                      onChange={(e) => handleChange(index, "validTill", e.target.value)}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    />
                  </div>

                  <div>
                    <Label>Certificate ID / Credential URL</Label>
                    <Input
                      placeholder="Certificate ID or verification URL"
                      value={cert.credentialId}
                      onChange={(e) => handleChange(index, "credentialId", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addCertification} className="w-full mt-6">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Certification
          </Button>
        </>
      )}
    </StepWrapper>
  );
};

export default CertificationsStep;
